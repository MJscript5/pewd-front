#include <WiFi.h>
#include <DNSServer.h>
#include <WebServer.h>
#include <EEPROM.h>
#include <Wire.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include <MPU6050.h>
#include <NTPClient.h>
#include <cmath>

// Configuration constants
const char* apSSID = "Posture Checker";
const char* apPassword = "password123";
#define API_KEY "AIzaSyDO9p6D7W1XnL4tGNv3cLC-_hE-B02D3-0"
#define DATABASE_URL "https://pewds-prototype-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define PST_OFFSET 28800
#define EEPROM_SIZE 64
#define EEPROM_WIFI_SSID 0
#define EEPROM_WIFI_PASS 16

// Global objects
DNSServer dnsServer;
WebServer server(80);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "asia.pool.ntp.org", PST_OFFSET);
bool signupOK = false;
bool isConfigPortalActive = true;
const int MPU_SDA[5] = {21, 19, 4, 33, 26};
const int MPU_SCL[5] = {22, 18, 16, 32, 25};
MPU6050 mpu[5] = { MPU6050(0x68), MPU6050(0x68), MPU6050(0x68), MPU6050(0x68), MPU6050(0x68) };
const int MOTOR_PINS[5] = {23, 5, 17, 27, 14};
const double PITCH_THRESHOLDS[5] = {45.0, 30.0, 25.0, 20.0, 70.0};
String prevPosture[5] = {"", "", "", "", ""};

// Function declarations
bool connectToSavedWiFi();
void setupAccessPoint();
void setupFirebase();
void setupWebServer();
void handleRoot();
void handleConfigure();
void handleResetWiFi();
void handleStatus();
String readEEPROM(int start);
void writeEEPROM(int start, const String &data);
bool checkInternetConnection();

void setup() {
    Serial.begin(115200);
    EEPROM.begin(512);

    if (!connectToSavedWiFi()) {
        setupAccessPoint();
        isConfigPortalActive = true;
    } else {
        setupFirebase();
        isConfigPortalActive = false;
    }
    
    setupSensors();
    setupWebServer();
    timeClient.begin();
}

void setupSensors() {
    for (int i = 0; i < 5; i++) {
        Wire.begin(MPU_SDA[i], MPU_SCL[i]);
        mpu[i].initialize();
        pinMode(MOTOR_PINS[i], OUTPUT);
    }
}

bool connectToSavedWiFi() {
    String ssid = readEEPROM(EEPROM_WIFI_SSID);
    String password = readEEPROM(EEPROM_WIFI_PASS);

    if (ssid.length() > 0 && password.length() > 0) {
        WiFi.begin(ssid.c_str(), password.c_str());

        int retryCount = 0;
        while (WiFi.status() != WL_CONNECTED && retryCount < 20) {
            delay(500);
            retryCount++;
            Serial.print(".");
        }
        Serial.println();

        if (WiFi.status() == WL_CONNECTED) {
            Serial.println("Connected to Wi-Fi with stored credentials.");
            return true;
        } else {
            Serial.println("Failed to connect with stored credentials.");
        }
    } else {
        Serial.println("No saved Wi-Fi credentials found.");
    }
    return false;
}

void setupAccessPoint() {
    WiFi.softAP(apSSID, apPassword);
    setupWebServer();
}

void setupFirebase() {
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;
    auth.user.email = "esp32@pewds.com";
    auth.user.password = "esp32pass";
    signupOK = Firebase.signUp(&config, &auth, "", "");
    config.token_status_callback = tokenStatusCallback;
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
}

void setupWebServer() {
    server.on("/", handleRoot);
    server.on("/configure", HTTP_POST, handleConfigure);
    server.on("/reset_wifi", handleResetWiFi);
    server.on("/status", handleStatus);
    server.begin();
}

void handleRoot() {
    server.send(200, "text/html", 
                "<html><body><h1>ESP32 Wi-Fi Config</h1><form action='/configure' method='post'>"
                "SSID: <input type='text' name='ssid'><br>Password: <input type='password' name='password'><br>"
                "<input type='submit' value='Connect'></form></body></html>");
}

void handleConfigure() {
    String ssid = server.arg("ssid");
    String password = server.arg("password");

    if (!ssid.isEmpty() && !password.isEmpty()) {
        writeEEPROM(EEPROM_WIFI_SSID, ssid);
        writeEEPROM(EEPROM_WIFI_PASS, password);
        EEPROM.commit();
        server.send(200, "text/plain", "Configuration saved. ESP32 will restart.");
        delay(500);
        ESP.restart();
    } else {
        server.send(400, "text/plain", "Invalid SSID or password");
    }
}

void handleResetWiFi() {
    writeEEPROM(EEPROM_WIFI_SSID, "");
    writeEEPROM(EEPROM_WIFI_PASS, "");
    EEPROM.commit();
    server.send(200, "text/plain", "WiFi settings reset. ESP32 will restart.");
    ESP.restart();
}

void handleStatus() {
    String json = "{\"wifiStatus\":\"" + String(WiFi.status() == WL_CONNECTED ? "Connected" : "Not Connected") + 
                   "\",\"wifiIpAddress\":\"" + WiFi.localIP().toString() + 
                   "\",\"apIpAddress\":\"" + WiFi.softAPIP().toString() + "\"}";
    server.send(200, "application/json", json);
}

String readEEPROM(int start) {
    String value;
    for (int i = start; i < start + 32; i++) {
        char c = EEPROM.read(i);
        if (c == 0) break;
        value += c;
    }
    return value;
}

void writeEEPROM(int start, const String &data) {
    for (int i = 0; i < 32; i++) {
        EEPROM.write(start + i, i < data.length() ? data[i] : 0);
    }
}

bool checkInternetConnection() {
    return (WiFi.status() == WL_CONNECTED);
}

void loop() {
    if (isConfigPortalActive) {
        dnsServer.processNextRequest();
        server.handleClient();
    } else if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Wi-Fi connection lost. Attempting to reconnect...");
        
        if (!connectToSavedWiFi()) {
            Serial.println("Failed to reconnect. Starting AP mode.");
            setupAccessPoint();
            isConfigPortalActive = true;
        }
    }
    
    timeClient.update();
    String currentTimeStr = timeClient.getFormattedTime();
    time_t rawTime = timeClient.getEpochTime();
    struct tm *timeInfo = localtime(&rawTime);
    char currentDateStr[12];
    sprintf(currentDateStr, "%02d/%02d/%04d", timeInfo->tm_mon + 1, timeInfo->tm_mday, timeInfo->tm_year + 1900);

    if (Firebase.ready() && signupOK) {
        Firebase.RTDB.setString(&fbdo, "Sensor/Date", currentDateStr);
        Firebase.RTDB.setString(&fbdo, "Sensor/Philippine Standard Time", currentTimeStr);

        bool badPostureDetected = false;

        for (int i = 0; i < 5; i++) {
            int16_t ax, ay, az, gx, gy, gz;
            mpu[i].getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
            double pitch = atan2(-ay, sqrt(ax * ax + az * az)) * 180.0 / M_PI;
            bool isBadPosture = pitch >= PITCH_THRESHOLDS[i];
            badPostureDetected |= isBadPosture;

            Firebase.RTDB.setDouble(&fbdo, "Sensor/Pitch/Pitch" + String(i + 1), pitch);
            Firebase.RTDB.setString(&fbdo, "Sensor/Pitch/Posture" + String(i + 1), isBadPosture ? "Bad Posture" : "Good Posture");
            digitalWrite(MOTOR_PINS[i], isBadPosture ? HIGH : LOW);
            
        Firebase.RTDB.setString(&fbdo, "Sensor/Posture", badPostureDetected ? "Bad Posture Detected!" : "Good Posture!");
        }
    }
}
