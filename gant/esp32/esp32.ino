#include "BluetoothSerial.h"
#include "analogWrite.h"
#include "ESP32Servo.h"

#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
#error Bluetooth is not enabled! Please run `make menuconfig` to and enable it
#endif

#define THUMB_PIN 33
#define INDEX_PIN 32

bool debug = true;
unsigned char data = 0;
BluetoothSerial SerialBT;
Servo THUMB_SERVO;
Servo INDEX_SERVO;

void setup()
{
  SerialBT.begin("XRGlove");
  Serial.begin(9600);
  pinMode(THUMB_PIN, OUTPUT);
  pinMode(INDEX_PIN, OUTPUT);
  THUMB_SERVO.attach(THUMB_PIN);
  INDEX_SERVO.attach(INDEX_PIN);
}

void loop()
{
  if (SerialBT.available())
  {
    // basic communication:
    // 0-127 : thumb force
    // 128-255 : index force
    data = SerialBT.read();
    if (data < 128) // thumb
      THUMB_SERVO.write(map(data, 0, 127, 0, 180));
    else
      INDEX_SERVO.write(map(data, 128, 255, 0, 180));
  } else delay(10);
}
