// ====== Thư viện ======
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <DHT.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <EEPROM.h>
#include <time.h>

// ====== OLED ======
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ====== DHT11 ======
#define DHTPIN D4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// ====== Soil Moisture ======
#define SOIL_PIN A0

// ====== WiFi mặc định ======
const char* defaultSsid = "B_COOFFEE_lau_1";
const char* defaultPass = "";

// ====== Server API URL ======
const char* serverUrl = "https://laptop-jfecre1c.tail0882b7.ts.net/api/data";

// ====== HTTPS Client ======
WiFiClientSecure client;

// ====== Web config portal ======
ESP8266WebServer server(80);
const char* apSsid = "VDHH-AP";
const char* apPass = "12345678"; // optional

// ====== EEPROM ======
const int EEPROM_SIZE = 512;
const int ADDR_FLAG = 0;        // 1 byte: 0 = no saved, 1 = saved
const int ADDR_SSID = 1;        // 32 bytes
const int SSID_MAX_LEN = 32;
const int ADDR_PASS = ADDR_SSID + SSID_MAX_LEN; // 64 bytes
const int PASS_MAX_LEN = 64;

// ====== Timezone (Asia/Ho_Chi_Minh = UTC+7) ======
const long TZ_OFFSET_SECONDS = 7 * 3600L;
const char* NTP_POOL1 = "pool.ntp.org";
const char* NTP_POOL2 = "time.google.com";

// ====== Globals ======
unsigned long lastPost = 0;
String lastPostStatus = "Never";
bool configPortalActive = false;
unsigned long wifiTryStart = 0;
const unsigned long WIFI_DEFAULT_TIMEOUT = 10000; // 10s thử default trước khi chuyển

// ====== Hàm tiện ích EEPROM ======
void saveCredentialsToEEPROM(const String &ssid, const String &pass) {
  EEPROM.begin(EEPROM_SIZE);
  EEPROM.write(ADDR_FLAG, 1);
  for (int i=0;i<SSID_MAX_LEN;i++){
    char c = (i < ssid.length()) ? ssid[i] : 0;
    EEPROM.write(ADDR_SSID + i, c);
  }
  for (int i=0;i<PASS_MAX_LEN;i++){
    char c = (i < pass.length()) ? pass[i] : 0;
    EEPROM.write(ADDR_PASS + i, c);
  }
  EEPROM.commit();
}

bool readCredentialsFromEEPROM(String &ssid, String &pass) {
  EEPROM.begin(EEPROM_SIZE);
  byte flag = EEPROM.read(ADDR_FLAG);
  if (flag != 1) return false;
  char buf[SSID_MAX_LEN+1];
  for (int i=0;i<SSID_MAX_LEN;i++) buf[i] = EEPROM.read(ADDR_SSID + i);
  buf[SSID_MAX_LEN] = 0;
  ssid = String(buf);
  char buf2[PASS_MAX_LEN+1];
  for (int i=0;i<PASS_MAX_LEN;i++) buf2[i] = EEPROM.read(ADDR_PASS + i);
  buf2[PASS_MAX_LEN] = 0;
  pass = String(buf2);
  // Trim trailing zeros
  ssid.trim();
  pass.trim();
  return (ssid.length() > 0);
}

// ====== NTP / Time helpers ======
void setupTime() {
  // cấu hình NTP server
  configTime(0, 0, NTP_POOL1, NTP_POOL2);
  // Không rely vào TZ env; ta sẽ cộng offset thủ công khi format
}

time_t getEpochUTC() {
  time_t now = time(nullptr);
  // nếu chưa khởi được time, time() trả về 0
  // chờ tối đa 5s tổng cộng trong vòng gọi này
  unsigned long start = millis();
  while (now < 1000000000UL && millis() - start < 5000) {
    delay(200);
    now = time(nullptr);
  }
  return now;
}

String formatDateTime(time_t epochSeconds) {
  // epochSeconds là UTC; ta cộng offset cho timezone
  epochSeconds += TZ_OFFSET_SECONDS;
  struct tm *ptm = gmtime(&epochSeconds);
  char buf[32];
  // YYYY-MM-DD HH:MM:SS
  snprintf(buf, sizeof(buf), "%04d-%02d-%02d %02d:%02d:%02d",
           ptm->tm_year + 1900, ptm->tm_mon + 1, ptm->tm_mday,
           ptm->tm_hour, ptm->tm_min, ptm->tm_sec);
  return String(buf);
}

// ====== Web handlers ======
String pageHeader(const char* title) {
  String s = "<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'/>";
  s += "<title>";
  s += title;
  s += "</title></head><body style='font-family:Arial,Helvetica,sans-serif; padding:10px;'>";
  return s;
}
String pageFooter() {
  return "</body></html>";
}

void handleRoot() {
  String html = pageHeader("ESP Config");
  html += "<h3>ESP WiFi Config Portal</h3>";
  html += "<p><a href='/scan'>Scan WiFi Networks</a></p>";
  html += "<p>Current mode: " + String(configPortalActive ? "Config AP" : (WiFi.isConnected() ? "STA connected" : "STA disconnected")) + "</p>";
  html += pageFooter();
  server.send(200, "text/html", html);
}

void handleScan() {
  int n = WiFi.scanNetworks();
  String html = pageHeader("WiFi Scan");
  html += "<h3>Available WiFi Networks</h3>";
  if (n == 0) {
    html += "<p>No networks found.</p>";
  } else {
    html += "<form action='/connect' method='POST'>";
    html += "<table border='0'>";
    for (int i=0;i<n;i++){
      String ss = WiFi.SSID(i);
      int rssi = WiFi.RSSI(i);
      String enc = (WiFi.encryptionType(i) == ENC_TYPE_NONE) ? "Open" : "Encrypted";
      html += "<tr><td><input type='radio' name='ssid' value='" + ss + "' " + (i==0 ? "checked":"") + "></td>";
      html += "<td>" + ss + " (" + String(rssi) + " dBm) " + enc + "</td></tr>";
    }
    html += "</table>";
    html += "<p>Password: <input type='password' name='pass' /></p>";
    html += "<p><input type='submit' value='Connect' /></p>";
    html += "</form>";
  }
  html += "<p><a href='/'>Back</a></p>";
  html += pageFooter();
  server.send(200, "text/html", html);
}

void handleConnect() {
  if (server.method() != HTTP_POST) {
    server.send(405, "text/plain", "Method Not Allowed");
    return;
  }
  String ssid = server.arg("ssid");
  String pass = server.arg("pass");
  String html = pageHeader("Connect");
  html += "<h3>Trying to connect to: " + ssid + "</h3>";
  server.send(200, "text/html", html + "<p>Attempting to connect... check serial monitor.</p>");
  // Lưu và thử kết nối (non-blocking here we do blocking short)
  saveCredentialsToEEPROM(ssid, pass);

  // Try connect
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  WiFi.begin(ssid.c_str(), pass.c_str());

  unsigned long start = millis();
  bool ok = false;
  while (millis() - start < 10000) { // 10s
    if (WiFi.status() == WL_CONNECTED) { ok = true; break; }
    delay(500);
  }
  if (ok) {
    Serial.println("Connected via portal credentials. IP: " + WiFi.localIP().toString());
    // stop AP/server
    if (configPortalActive) {
      server.stop();
      WiFi.softAPdisconnect(true);
      configPortalActive = false;
    }
  } else {
    Serial.println("Connect from portal failed.");
  }
}

// ====== Start simple config portal (AP + web server) ======
void startConfigPortal() {
  Serial.println("Starting Config Portal AP...");
  configPortalActive = true;
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP(apSsid, apPass);
  IPAddress myIP = WiFi.softAPIP();
  Serial.print("AP IP: ");
  Serial.println(myIP);

  // Setup web handlers
  server.on("/", HTTP_GET, handleRoot);
  server.on("/scan", HTTP_GET, handleScan);
  server.on("/connect", HTTP_ANY, handleConnect);
  server.begin();
  Serial.println("HTTP server started on port 80");
}

// ====== POST data to server (thêm timestamp) ======
void postData(float t, float h, int soil, const String &isoTime) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    client.setInsecure(); // bỏ qua kiểm tra chứng chỉ SSL (chỉ dùng khi test HTTPS tự ký)

    if (http.begin(client, serverUrl)) {
      http.addHeader("Content-Type", "application/json");

      // ==== Tạo JSON hợp lệ ====
      // ISOTime có thể là "2025-10-05T15:32:00"
      String payload = "{";
      payload += "\"temperature\":" + String(t, 1) + ",";
      payload += "\"humidity\":" + String(h, 0) + ",";
      payload += "\"soil\":" + String(soil) + ",";
      payload += "\"timestamp\":\"" + isoTime + "\"";
      payload += "}";

      Serial.println("=== Sending POST to Server ===");
      Serial.println("URL: " + String(serverUrl));
      Serial.println("Data: " + payload);

      int httpCode = http.POST(payload);
      String response = http.getString();

      if (httpCode > 0) {
        Serial.printf("POST... code: %d\n", httpCode);
        Serial.println("Response: " + response);
        lastPostStatus = "OK code:" + String(httpCode);
      } else {
        Serial.printf("POST failed, error: %s\n", http.errorToString(httpCode).c_str());
        lastPostStatus = "Fail:" + http.errorToString(httpCode);
      }
      http.end();
    } else {
      Serial.println("HTTP begin failed!");
      lastPostStatus = "HTTP begin failed";
    }
  } else {
    Serial.println("WiFi not connected! can't POST");
    lastPostStatus = "NoWiFi";
  }
}


// ====== Setup ======
void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("\n=== ESP8266 Sensor with NTP + Config Portal ===");

  // Init EEPROM
  EEPROM.begin(EEPROM_SIZE);

  // Init DHT
  dht.begin();

  // Init OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 không khởi động được"));
    for (;;);
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  // Bắt đầu kết nối WiFi: thử default trước trong WIFI_DEFAULT_TIMEOUT
  WiFi.mode(WIFI_STA);
  WiFi.begin(defaultSsid, defaultPass);
  Serial.print("Connecting to default WiFi");
  wifiTryStart = millis();

  unsigned long start = millis();
  bool connected = false;
  while (millis() - start < WIFI_DEFAULT_TIMEOUT) {
    if (WiFi.status() == WL_CONNECTED) { connected = true; break; }
    delay(500);
    Serial.print(".");
  }
  if (connected) {
    Serial.println("\n✅ Connected to default WiFi");
    Serial.println("IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nDefault WiFi failed. Checking saved credentials...");
    // Try saved credentials
    String savedSsid, savedPass;
    if (readCredentialsFromEEPROM(savedSsid, savedPass)) {
      Serial.println("Found saved creds: " + savedSsid);
      WiFi.begin(savedSsid.c_str(), savedPass.c_str());
      unsigned long st = millis();
      bool ok = false;
      while (millis() - st < WIFI_DEFAULT_TIMEOUT) {
        if (WiFi.status() == WL_CONNECTED) { ok = true; break; }
        delay(500);
        Serial.print(".");
      }
      if (ok) {
        Serial.println("\n✅ Connected with saved creds. IP: " + WiFi.localIP().toString());
      } else {
        Serial.println("\nSaved creds failed. Starting config portal.");
        startConfigPortal();
      }
    } else {
      Serial.println("No saved credentials. Starting config portal.");
      startConfigPortal();
    }
  }

  // Setup NTP
  setupTime();

  // Show initial OLED
  display.clearDisplay();
  display.setCursor(0,0);
  display.println("ESP8266 SENSOR");
  display.println("");
  display.println("Init done.");
  display.display();
}

// ====== Loop ======
void loop() {
  // Nếu config portal đang active thì phải xử lý server.handleClient()
  if (configPortalActive) {
    server.handleClient();
  }

  // Lấy sensor
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  int soilValue = analogRead(SOIL_PIN);
  int soilPercent = map(soilValue, 1023, 0, 0, 100);

  // Lấy thời gian hiện tại (epoch UTC)
  time_t epoch = getEpochUTC();
  String timeStr = (epoch > 0) ? formatDateTime(epoch) : "NoTime";

  // In ra Serial
  if (!isnan(t) && !isnan(h)) {
    Serial.printf("🌡 Temp: %.1f °C | 💧 Humi: %d %% | 🌱 Soil: %d %% | ⏱ %s\n",
                  t, (int)h, soilPercent, timeStr.c_str());
  } else {
    Serial.println("Failed to read DHT sensor!");
  }

  // ===== Hiển thị OLED: datetime + sensor + post status =====
display.clearDisplay();
display.setTextSize(1);

// Dòng 1: Ngày giờ (thay vì "ESP8266 SENSOR")
display.setCursor(0, 0);
display.println(timeStr);   // Ví dụ: "2025-10-02 14:35:21"

// Dòng 2: Nhiệt độ + Độ ẩm trên cùng một hàng
if (!isnan(t) && !isnan(h)) {
  display.setCursor(0, 16);
  display.print("T: " + String(t, 1) + " C");
  display.setCursor(70, 16);
  display.print("H: " + String((int)h) + " %");
} else {
  display.setCursor(0, 16);
  display.println("Sensor ERR");
}

// Dòng 3: Độ ẩm đất
display.setCursor(0, 32);
display.println("S: " + String(soilPercent) + " %");

// Dòng 4: Trạng thái POST
display.setCursor(0, 48);
display.println("POST: " + lastPostStatus);

display.display();


  // Gửi POST mỗi 10s (nếu có thời gian)
  if (!isnan(t) && !isnan(h) && (millis() - lastPost > 30000)) {
    String isoTime = (epoch > 0) ? formatDateTime(epoch) : "unknown";
    postData(t, h, soilPercent, isoTime);
    lastPost = millis();
  }

  delay(1000);
}