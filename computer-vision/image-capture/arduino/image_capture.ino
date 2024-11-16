
// Enables Serial.println diagnostics when running with Serial Monitor.
//#define DEBUG

#include "camera.h" // Arduino Mbed Core Camera APIs

//#include "himax.h"  // API to read from the Himax camera found on the Portenta Vision Shield
//HM01B0 himax;       // instance of himax camera interface

#include "hm0360.h" // API to read from the Himax camera found on the Portenta Vision Shield Rev.2
HM0360 himax; // for Vision Shield Rev.2

Camera cam(himax);  // generic instance of camera API

FrameBuffer frameBuffer; // Buffer to save the camera stream

// Settings for our camera
#define IMAGE_HEIGHT 240 // number of rows in the camera image
#define IMAGE_WIDTH  320 // number of columns in the camera image
#define IMAGE_MODE CAMERA_GRAYSCALE // camera is grayscale, not RGB

byte incomingByte = 0; // holds one byte of incoming serial data

void setup()
{
  Serial.begin(9600); // configure serial connection
  
  while (!Serial);   // wait for connection to be established
  
  while (Serial.available() > 0) {
    Serial.read(); // flush all incoming data
  }

  #ifdef DEBUG
    Serial.println("setup() completed.\n"); Serial.flush(); // flush all outgoing data
  #endif
}

void loop()
{
  // Wait for microcontroller to catch up with itself.
  delay(5000);

  // Check for serial connection.
  // (Portenta does not automatically restart upon serial connection.)
  while(!Serial)
  {
    Serial.begin(9600);
    delay(5000); // wait for microcontroller to catch up with itself
    
    while (Serial.available() > 0) 
    {
      Serial.read(); // flush all incoming data
    }

    #ifdef DEBUG
      Serial.println("Serial port reestablished."); 
      Serial.flush(); // flush all outgoing data
    #endif
  }

  // Wait for serial input before taking picture

  #ifdef DEBUG
    Serial.println("Awaiting user go-ahead. Input one character, one byte:");
  #endif

  while (Serial.available() <= 0); // await input, request for camera image

  incomingByte = Serial.read(); // read one byte:
  while (Serial.available() > 0) Serial.read(); // flushes all other incoming data

  // Initialize the camera QVGA, 30FPS, Grayscale.
  if (cam.begin(CAMERA_R320x240, IMAGE_MODE, 30))
  {
    #ifdef DEBUG
      Serial.println("Camera found."); Serial.flush();
    #endif

    // Start an LED on the board blinking.
    countDownBlink();

    #ifdef DEBUG
      Serial.println("Fetching and sending camera image..."); Serial.flush();
    #endif

    // Take one picture, a frame of data from the camera.
    unsigned char *imageData = captureImage();

    // Send the picture row by row.
    // Done this way to avoid overloading the serial port buffer.
    size_t i = 0; // imageData index where the next row starts
    for(size_t r = 0; r < IMAGE_HEIGHT; r++)
    {
      Serial.write(imageData + i, IMAGE_WIDTH); Serial.flush();
      i += IMAGE_WIDTH;

      #ifdef DEBUG
        Serial.println(); Serial.print("Row: "); Serial.println(r);
      #endif
    }

    // Finished.

    digitalWrite(LEDB, HIGH);
    
    #ifdef DEBUG
      Serial.write("Done.\n"); Serial.flush();
    #endif
  }
  else
  {
    #ifdef DEBUG
      Serial.write("Unable to find the camera.\n"); Serial.flush();
    #endif
  }
}

// These subroutines originate from
// https://docs.arduino.cc/tutorials/portenta-vision-shield/getting-started-camera

// Get the raw image data (8bpp grayscale)
unsigned char * captureImage()
{
    if (cam.grabFrame(frameBuffer, 3000) == 0)
    {
        return frameBuffer.getBuffer();
    }
    else
    {
        #ifdef DEBUG
          Serial.println("Could not grab the frame."); Serial.flush();
        #endif
    }
}

void countDownBlink()
{
    for (int i = 0; i < 6; i++)
    {
        digitalWrite(LEDG, i % 2);
        delay(500);
    }
    digitalWrite(LEDG, HIGH);
    digitalWrite(LEDB, LOW);
}
