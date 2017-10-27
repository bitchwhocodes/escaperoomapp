

//6 - Cap Rx
//7 - Cap Tx
//
//9 - Neo Pixel
//10 - RF Send




#include <Adafruit_NeoPixel.h>
#include <CapacitiveSensor.h>

#include <RCSwitch.h>
RCSwitch mySwitch = RCSwitch();




/**************************************************************************/
/*!
    @file     readntag203.pde
    @author   KTOWN (Adafruit Industries)
    @license  BSD (see license.txt)

    This example will wait for any NTAG203 or NTAG213 card or tag,
    and will attempt to read from it.

    This is an example sketch for the Adafruit PN532 NFC/RFID breakout boards
    This library works with the Adafruit NFC breakout
      ----> https://www.adafruit.com/products/364

    Check out the links above for our tutorials and wiring diagrams
    These chips use SPI or I2C to communicate.

    Adafruit invests time and resources providing this open source code,
    please support Adafruit and open-source hardware by purchasing
    products from Adafruit!
*/
/**************************************************************************/
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_PN532.h>

// If using the breakout with SPI, define the pins for SPI communication.
#define PN532_SCK  (2)
#define PN532_MOSI (3)
#define PN532_SS   (4)
#define PN532_MISO (5)

// If using the breakout or shield with I2C, define just the pins connected
// to the IRQ and reset lines.  Use the values below (2, 3) for the shield!
#define PN532_IRQ   (2)
#define PN532_RESET (3)  // Not connected by default on the NFC Shield
Adafruit_PN532 nfc(PN532_IRQ, PN532_RESET);

#if defined(ARDUINO_ARCH_SAMD)
// for Zero, output on USB Serial console, remove line below if using programming port to program the Zero!
// also change #define in Adafruit_PN532.cpp library file
#define Serial SerialUSB
#endif

Adafruit_NeoPixel strip1 = Adafruit_NeoPixel(5, 9, NEO_GRB + NEO_KHZ800);
#define WHITE 0xFFFFFF
#define RED 0xFF0000
#define GREEN 0x00FF00

#define HANDTOLERANCE 8000
#define PIXEL_NUMBER 5

#define HAND_CAP "hand_cap"
#define MODE_SCAN "mode_scan"
#define MODE_NONE "mode_none"
#define MODE_DONE "mode_done"




//CAP SENSE
CapacitiveSensor   cs_7_6 = CapacitiveSensor(7, 6);

//RF TRANSMITTER
int sleep = 100;
int transmit_pin = 10; //10 for Arduino / 1 for Wemos D1
int pulseLength = 185;
int repeatTransmit = 5;

String serialVal;
//Set the Current Mode to be None- start there
String currentMode = MODE_NONE;
uint8_t nfcId[] = {4, 72, 82, 218, 75, 40, 128}; //Stacey Compared UID- this is gross and hardcoded


void setup()
{
  strip1.begin();
  strip1.show(); // Initialize all pixels to 'off'

  cs_7_6.set_CS_AutocaL_Millis(0xFFFFFFFF);     // turn off autocalibrate on channel 1 - just as an example

  //NFC
#ifndef ESP8266
  while (!Serial); // for Leonardo/Micro/Zero
#endif
  Serial.begin(115200);
  Serial.println("Hello!");

  nfc.begin();

  uint32_t versiondata = nfc.getFirmwareVersion();
  if (! versiondata) {
    Serial.print("Didn't find PN53x board");
    while (1); // halt
  }
  // Got ok data, print it out!
  Serial.print("Found chip PN5"); Serial.println((versiondata >> 24) & 0xFF, HEX);
  Serial.print("Firmware ver. "); Serial.print((versiondata >> 16) & 0xFF, DEC);
  Serial.print('.'); Serial.println((versiondata >> 8) & 0xFF, DEC);

  // configure board to read RFID tags
  nfc.SAMConfig();

  Serial.println("Waiting for an ISO14443A Card ...");


  mySwitch.enableTransmit(transmit_pin);
  mySwitch.setPulseLength(pulseLength);
  mySwitch.setRepeatTransmit(repeatTransmit);

  setLightColor(WHITE);
}

void loop()
{
 
 // Only check if we are in the mode scan 
 if(currentMode == MODE_SCAN){
    checkCapSense();// See notes here
    checkNFCTag();
  }
  // Read from the application 
  if (Serial.available()) {
    serialVal = Serial.readString();
    
    if (serialVal == MODE_SCAN) {
      currentMode = MODE_SCAN;
      setLightColor(GREEN);
      setLights();
    }

    if(serialVal == MODE_DONE){
      setLightColor(GREEN);
      delay(100);// using delay here as all detection and input is no longer needed.
        
    }
  }
}

/*
Stacey - Note this wouldn't work when combined with NFC right out of the box.
Might have to work on init - or flushing the Serial stream... or maybe timing? 
*/
void checkCapSense(){
  long total1 =  cs_7_6.capacitiveSensor(30);
  if (total1 > HANDTOLERANCE)
  {
    setLightColor(WHITE);
   
  }
}

void checkNFCTag() {
  uint8_t success;
  uint8_t uid[] = { 0, 0, 0, 0, 0, 0, 0 };  // Buffer to store the returned UID
  uint8_t uidLength;                        // Length of the UID (4 or 7 bytes depending on ISO14443A card type)

  // Wait for an NTAG203 card.  When one is found 'uid' will be populated with
  // the UID, and uidLength will indicate the size of the UUID (normally 7)
  success = nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength);

  if (success) {
    // Display some basic information about the card
    Serial.println("Found an ISO14443A card");
    Serial.print("  UID Length: "); Serial.print(uidLength, DEC); Serial.println(" bytes");
    Serial.print("  UID Value: ");
    boolean hasMatch = false;
    for (uint8_t i = 0; i < uidLength ; i++) {
      if (uid[i] == nfcId[i])
      {
        hasMatch = true;
      } else {
        hasMatch = false;
      }
    }

    //Stacey - Absolute hack because bytes.
    if (hasMatch) {
      // Send message to item that we found clippy
      setLightColor(RED);
      Serial.println("IDClippy");
      Serial.flush();
    }
  }
}


//
void setLightColor(uint32_t color) {

  for (int i = 0; i < PIXEL_NUMBER; i++) {
    strip1.setPixelColor(i, color);
  }
  strip1.show();
}


void setLights() {

  //-- Zap power outlet SERIAL: 0326 --


  //ON 1
  mySwitch.sendTriState("F0F00FFF0101"); Serial.println("Zap #1: ON"); delay(sleep);
  //ON 2
  mySwitch.sendTriState("F0F00FFF1001"); Serial.println("Zap #2: ON"); delay(sleep);
  //ON 3
  mySwitch.sendTriState("F0F00FF10001"); Serial.println("Zap #3: ON"); delay(sleep);
  //ON 4
  mySwitch.sendTriState("F0F00F1F0001"); Serial.println("Zap #4: ON"); delay(sleep);
  //ON 5
  mySwitch.sendTriState("F0F001FF0001"); Serial.println("Zap #5: ON"); delay(sleep);

  delay(100);

  //OFF 1
  mySwitch.sendTriState("F0F00FFF0110"); Serial.println("Zap #1: OFF"); delay(sleep);
  //OFF 2
  mySwitch.sendTriState("F0F00FFF1010"); Serial.println("Zap #2: OFF"); delay(sleep);
  //OFF 3
  mySwitch.sendTriState("F0F00FF10010"); Serial.println("Zap #3: OFF"); delay(sleep);
  //OFF 4
  mySwitch.sendTriState("F0F00F1F0010"); Serial.println("Zap #4: OFF"); delay(sleep);
  //OFF 5
  mySwitch.sendTriState("F0F001FF0010"); Serial.println("Zap #5: OFF"); delay(sleep);

  delay(100);
}
