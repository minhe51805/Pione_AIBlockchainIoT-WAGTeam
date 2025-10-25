#include <SoftwareSerial.h>
#include <ModbusMaster.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <TimeLib.h>

// ====== WiFi Config ======
const char* ssid = "KANA";
const char* password = "34thongnhat";

// ====== API Config ======
const char* apiEndpoint = "https://admin.tailb4429a.ts.net/api/data";
const char* apiKey = "";

// ====== OLED Config ======
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ====== RS485 Pins ======
#define RX_PIN D6
#define TX_PIN D5
#define DE_RE_PIN D7

// ====== NTP Config ======
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 7 * 3600, 60000);

// ====== Cấu trúc dữ liệu Soil 8in1 ======
struct SoilData {
  float temperature;
  float humidity;
  float conductivity;
  float ph;
  float nitrogen;
  float phosphorus;
  float potassium;
  float salt;
  String timestamp;
  bool valid;
};

SoftwareSerial modbusSerial(RX_PIN, TX_PIN);
ModbusMaster node;

int currentPage = 0;
unsigned long lastPageChange = 0;
const unsigned long PAGE_INTERVAL = 3000;
bool ntpSynced = false;

// ====== RS485 Control ======
void preTransmission() {
  digitalWrite(DE_RE_PIN, HIGH);
  delayMicroseconds(500);
}

void postTransmission() {
  delayMicroseconds(500);
  digitalWrite(DE_RE_PIN, LOW);
}

// ====== Kết nối WiFi ======
void connectWiFi() {
  Serial.print("Connecting to WiFi");
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Connecting WiFi...");
  display.display();
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("WiFi Connected!");
    display.print("IP: ");
    display.println(WiFi.localIP());
    display.display();
    delay(2000);
  } else {
    Serial.println("\n❌ WiFi connection failed!");
  }
}

// ====== Đồng bộ NTP ======
void syncNTP() {
  Serial.println("⏰ Syncing NTP time...");
  
  timeClient.begin();
  
  int attempts = 0;
  while (!timeClient.update() && attempts < 15) {
    timeClient.forceUpdate();
    delay(1000);
    attempts++;
    Serial.print(".");
  }
  
  if (attempts < 15) {
    ntpSynced = true;
    Serial.println("\n✅ NTP synced!");
    Serial.print("Current time: ");
    Serial.println(getDisplayTime());
  } else {
    ntpSynced = false;
    Serial.println("\n⚠️ NTP sync failed");
  }
}

// ====== Lấy thời gian ISO format (UTC) ======
String getISOTime() {
  if (!ntpSynced) {
    return "2025-01-01T00:00:00Z";
  }
  
  unsigned long epochTime = timeClient.getEpochTime();
  epochTime -= 7 * 3600; // Chuyển về UTC
  
  time_t rawTime = (time_t)epochTime;
  struct tm* ptm = gmtime(&rawTime);
  
  char isoBuffer[25];
  sprintf(isoBuffer, "%04d-%02d-%02dT%02d:%02d:%02dZ",
          ptm->tm_year + 1900,
          ptm->tm_mon + 1,
          ptm->tm_mday,
          ptm->tm_hour,
          ptm->tm_min,
          ptm->tm_sec);
  
  return String(isoBuffer);
}

// ====== Lấy thời gian hiển thị (VN UTC+7) ======
String getDisplayTime() {
  if (!ntpSynced) {
    return "NTP not synced";
  }
  
  unsigned long epochTime = timeClient.getEpochTime();
  time_t rawTime = (time_t)epochTime;
  struct tm* ptm = gmtime(&rawTime);
  
  char timeBuffer[20];
  sprintf(timeBuffer, "%02d/%02d %02d:%02d:%02d",
          ptm->tm_mday,
          ptm->tm_mon + 1,
          ptm->tm_hour,
          ptm->tm_min,
          ptm->tm_sec);
  
  return String(timeBuffer);
}

// ====== Đọc Soil 8in1 ======
SoilData readSoil8in1() {
  SoilData d;
  d.valid = false;

  uint8_t result = node.readHoldingRegisters(0x0000, 8);

  if (result == node.ku8MBSuccess) {
    d.humidity = node.getResponseBuffer(0) / 10.0;
    d.temperature = node.getResponseBuffer(1) / 10.0;
    d.conductivity = node.getResponseBuffer(2);
    d.ph = node.getResponseBuffer(3) / 10.0;
    d.nitrogen = node.getResponseBuffer(4);
    d.phosphorus = node.getResponseBuffer(5);
    d.potassium = node.getResponseBuffer(6);
    d.salt = node.getResponseBuffer(7);
    d.timestamp = getDisplayTime();
    d.valid = true;
    
    Serial.println("✅ Modbus read SUCCESS!");
  } else {
    Serial.printf("❌ Modbus error: 0x%02X\n", result);
  }

  return d;
}

// ====== Hiển thị OLED Page 1 ======
void displayPage1(SoilData data) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  display.setCursor(0, 0);
  display.println("=== SOIL SENSOR ===");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
  
  display.setCursor(0, 15);
  display.printf("Hum: %.1f%%\n", data.humidity);
  display.printf("Temp:%.1fC\n", data.temperature);
  display.printf("EC:  %.0fuS\n", data.conductivity);
  display.printf("pH:  %.1f\n", data.ph);
  
  display.setCursor(0, 57);
  display.print("1/3 ");
  display.print(data.timestamp);
  
  display.display();
}

// ====== Hiển thị OLED Page 2 ======
void displayPage2(SoilData data) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  display.setCursor(0, 0);
  display.println("=== NUTRIENTS ===");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
  
  display.setCursor(0, 15);
  display.printf("N:   %.0f mg/kg\n", data.nitrogen);
  display.printf("P:   %.0f mg/kg\n", data.phosphorus);
  display.printf("K:   %.0f mg/kg\n", data.potassium);
  display.printf("Salt:%.0f mg/kg\n", data.salt);
  
  display.setCursor(0, 57);
  display.print("2/3 ");
  display.print(data.timestamp);
  
  display.display();
}

// ====== Hiển thị OLED Page 3 ======
void displayPage3(SoilData data) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  display.setCursor(0, 0);
  display.println("=== STATUS ===");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
  
  display.setCursor(0, 15);
  display.println("Time (VN):");
  display.println(data.timestamp);
  
  display.println();
  display.print("WiFi: ");
  display.println(WiFi.status() == WL_CONNECTED ? "OK" : "ERR");
  display.print("NTP:  ");
  display.println(ntpSynced ? "OK" : "ERR");
  
  display.setCursor(0, 57);
  display.print("3/3");
  
  display.display();
}

// ====== POST dữ liệu lên API (HTTPS) ======
void postDataToAPI(SoilData data) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected");
    return;
  }
  
  if (!ntpSynced) {
    Serial.println("⚠️ NTP not synced. Retrying...");
    syncNTP();
    if (!ntpSynced) {
      Serial.println("❌ Cannot post without timestamp");
      return;
    }
  }

  // Dùng WiFiClientSecure cho HTTPS
  WiFiClientSecure client;
  
  // Bỏ qua kiểm tra SSL certificate (cho mạng nội bộ/self-signed cert)
  client.setInsecure();
  
  HTTPClient http;
  
  Serial.println("\n📤 Posting to API...");
  Serial.println("Endpoint: " + String(apiEndpoint));
  
  // Timeout dài hơn cho HTTPS
  http.setTimeout(15000);
  
  if (!http.begin(client, apiEndpoint)) {
    Serial.println("❌ HTTP begin failed");
    return;
  }
  
  http.addHeader("Content-Type", "application/json");
  
  if (strlen(apiKey) > 0) {
    http.addHeader("Authorization", String("Bearer ") + apiKey);
  }
  
  String isoTime = getISOTime();
  
  // Tạo payload
  String payload = "{";
  payload += "\"temperature\":" + String(data.temperature, 1) + ",";
  payload += "\"humidity\":" + String(data.humidity, 1) + ",";
  payload += "\"conductivity\":" + String(data.conductivity, 0) + ",";
  payload += "\"ph\":" + String(data.ph, 1) + ",";
  payload += "\"nitrogen\":" + String(data.nitrogen, 0) + ",";
  payload += "\"phosphorus\":" + String(data.phosphorus, 0) + ",";
  payload += "\"potassium\":" + String(data.potassium, 0) + ",";
  payload += "\"salt\":" + String(data.salt, 0) + ",";
  payload += "\"timestamp\":\"" + isoTime + "\"";
  payload += "}";
  
  Serial.println("Payload: " + payload);
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    Serial.printf("✅ HTTP Response: %d\n", httpResponseCode);
    String response = http.getString();
    Serial.println("Response: " + response);
  } else {
    Serial.printf("❌ HTTP Error: %d\n", httpResponseCode);
    Serial.println("Error: " + http.errorToString(httpResponseCode));
  }
  
  http.end();
  client.stop();
}

// ====== Setup ======
void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n╔════════════════════════════════════╗");
  Serial.println("║  ESP8266 Soil 8in1 + OLED + API   ║");
  Serial.println("╚════════════════════════════════════╝");

  // Khởi tạo OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println("❌ OLED failed!");
  } else {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("Soil 8in1");
    display.println("Starting...");
    display.display();
    delay(2000);
  }

  // Kết nối WiFi
  connectWiFi();
  
  // Đồng bộ NTP
  if (WiFi.status() == WL_CONNECTED) {
    syncNTP();
  }

  // Khởi tạo RS485
  pinMode(DE_RE_PIN, OUTPUT);
  digitalWrite(DE_RE_PIN, LOW);

  modbusSerial.begin(9600);
  node.begin(1, modbusSerial);
  node.preTransmission(preTransmission);
  node.postTransmission(postTransmission);

  Serial.println("✅ RS485/Modbus initialized\n");
  
  delay(1000);
}

// ====== Loop ======
void loop() {
  // Cập nhật NTP định kỳ
  if (WiFi.status() == WL_CONNECTED && ntpSynced) {
    timeClient.update();
  }
  
  Serial.println("\n🔄 Reading sensor...");
  SoilData data = readSoil8in1();

  if (data.valid) {
    Serial.println("╔═══════════════════════════════════════╗");
    Serial.printf("║ Time: %s              ║\n", data.timestamp.c_str());
    Serial.printf("║ Humidity:    %.1f %%                  ║\n", data.humidity);
    Serial.printf("║ Temp:        %.1f °C                 ║\n", data.temperature);
    Serial.printf("║ EC:          %.0f µS/cm              ║\n", data.conductivity);
    Serial.printf("║ pH:          %.1f                     ║\n", data.ph);
    Serial.printf("║ N:           %.0f mg/kg              ║\n", data.nitrogen);
    Serial.printf("║ P:           %.0f mg/kg              ║\n", data.phosphorus);
    Serial.printf("║ K:           %.0f mg/kg              ║\n", data.potassium);
    Serial.printf("║ Salt:        %.0f mg/kg              ║\n", data.salt);
    Serial.println("╚═══════════════════════════════════════╝");
    
    // POST lên API
    postDataToAPI(data);
    
    // Hiển thị OLED
    unsigned long currentMillis = millis();
    if (currentMillis - lastPageChange >= PAGE_INTERVAL) {
      currentPage = (currentPage + 1) % 3;
      lastPageChange = currentMillis;
    }
    
    switch (currentPage) {
      case 0: displayPage1(data); break;
      case 1: displayPage2(data); break;
      case 2: displayPage3(data); break;
    }
    
  } else {
    Serial.println("⚠️ Sensor read failed!\n");
    
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.println("ERROR!");
    display.println();
    display.println("Check:");
    display.println("- 12V Power");
    display.println("- A/B Wires");
    display.println("- RS485");
    display.display();
  }

  delay(900000); // Đọc mỗi 10 giây
}