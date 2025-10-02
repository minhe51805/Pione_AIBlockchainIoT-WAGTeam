#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <DHT.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

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

// ====== WiFi ======
const char* ssid = "NamTrung";    // WiFi mặc định
const char* password = "nt@14092011";

// ====== HTTPS Client ======
WiFiClientSecure client;

// ====== Server API URL ======
const char* serverUrl = "https://laptop-jfecre1c.tail0882b7.ts.net/api/data";

//===========================POST Data lên Server========================//
void postData(float t, float h, int soil) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    client.setInsecure(); // bỏ qua SSL check (chỉ test)

    if (http.begin(client, serverUrl)) {
      http.addHeader("Content-Type", "application/json");

      String payload = "{";
      payload += "\"temperature\":" + String(t, 1) + ",";
      payload += "\"humidity\":" + String(h, 0) + ",";
      payload += "\"soil\":" + String(soil) + ",";
      payload += "\"status\":\"OK\"";
      payload += "}";

      Serial.println("=== Sending POST to Server ===");
      Serial.println("URL: " + String(serverUrl));
      Serial.println("Data: " + payload);

      int httpCode = http.POST(payload);
      String response = http.getString();

      if (httpCode > 0) {
        Serial.printf("POST... code: %d\n", httpCode);
        Serial.println("Response: " + response);
      } else {
        Serial.printf("POST failed, error: %s\n", http.errorToString(httpCode).c_str());
      }
      http.end();
    } else {
      Serial.println("HTTP begin failed!");
    }
  } else {
    Serial.println("WiFi not connected!");
  }
}

//===========================Setup========================//
void setup() {
  Serial.begin(9600);
  dht.begin();

  // Khởi động OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 không khởi động được"));
    for (;;);
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  // Kết nối WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi connected!");
  Serial.println("IP: " + WiFi.localIP().toString());
}

//===========================Loop========================//
unsigned long lastPost = 0;

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  int soilValue = analogRead(SOIL_PIN);
  int soilPercent = map(soilValue, 1023, 0, 0, 100);

  if (!isnan(t) && !isnan(h)) {
    // In ra console
    Serial.printf("🌡 Temp: %.1f °C | 💧 Humi: %d %% | 🌱 Soil: %d %%\n", t, (int)h, soilPercent);

    // Hiển thị OLED
    display.clearDisplay();
    display.setTextSize(1);
    int16_t x1, y1;
    uint16_t w, h_txt;
    String title = "ESP8266 SENSOR";
    display.getTextBounds(title, 0, 0, &x1, &y1, &w, &h_txt);
    display.setCursor((SCREEN_WIDTH - w) / 2, 0); 
    display.println(title);

    display.setCursor(0, 15);
    display.println("Temp: " + String(t, 1) + " C");

    display.setCursor(0, 30);
    display.println("Humi: " + String(h, 0) + " %");

    display.setCursor(0, 45);
    display.println("Soil: " + String(soilPercent) + " %");

    display.display();

    // ===== Mỗi 10 giây gửi POST 1 lần =====
    if (millis() - lastPost > 10000) {
      postData(t, h, soilPercent);
      lastPost = millis();
    }
  }
  delay(1000);
}
