#include <SoftwareSerial.h> //Used for transmitting to the device

SoftwareSerial softSerial(2, 3); //RX, TX

#include "SparkFun_UHF_RFID_Reader.h" //Library for controlling the M6E Nano module
RFID nano; //Create instance

#define BUZZER1 9
//#define BUZZER1 0 //For testing quietly
#define BUZZER2 10


void setup() {
  Serial.begin(115200);

  pinMode(BUZZER1, OUTPUT);
  pinMode(BUZZER2, OUTPUT);

  digitalWrite(BUZZER2, LOW); //Pull half the buzzer to ground and drive the other half.
  
  while (!Serial); //Wait for the serial port to come online

  if (setupNano(38400) == false) //Configure nano to run at 38400bps
  {
    Serial.println(F("Module failed to respond. Please check wiring."));
    while (1); //Freeze!
  }

  nano.setRegion(REGION_NORTHAMERICA); //Set to North America

  nano.setReadPower(2000); //5.00 dBm. Higher values may caues USB port to brown out
  //Max Read TX Power is 27.00 dBm and may cause temperature-limit throttling

  nano.startReading(); //Begin scanning for tags

  Serial.println("Go!");
  Serial.println("Enter 'k' to begin read");

}

struct EPCs { 
  byte tags[3][12] = {{0}};
  int num = 0;  
 
  
  bool matches (byte t1[], byte t2[]) { 
    for (byte i = 0; i < 12 ; i++) { 
      if( t1[i] != t2[i] ) return false;
    } 
    return true; 
  }
  
  bool contains(byte t[]) {
    for (int numTags = 0; numTags < num ; numTags ++ ) { 
      if ( matches(t, tags[numTags]) ) {
//        Serial.println( "Contains tag!");
        return true; 
      }
    }

//    Serial.println("Does not contain tag!");
    return false;
  }

  void save (byte * tag, byte tagEPCBytes) { 
    Serial.println("Saving tag..."); 
    for(byte i = 0; i < tagEPCBytes; i++) { 
      tags[num][i] = tag[i];
    }
//    printTag(tags[num], tagEPCBytes);
    num++; 
//    Serial.println(num);
    Serial.print("Num tags saved: ");
    Serial.println(num); 
  }

  void printTagsToSerial() { 
    Serial.println("Printing tags to serial...");
    for(int j = 0; j < 3; j++) { 
        for (int i = 0; i < 12; i++) {
          Serial.print(tags[j][i], HEX); 
          Serial.print(F(" ")); 
        }
        Serial.print(F("  "));
      
      }
    Serial.println("r");
  }

  void reset() {
    Serial.println("Resetting array"); 
    for(int j = 0; j < 3; j++) { 
        for (int i = 0; i < 12; i++) {
          tags[j][i] = 0; 
             
        }
    }
  
    num = 0;
  }
    


  
};



void getEPC(byte * currTag, byte tagEPCBytes) { 
  for (byte x = 0; x < tagEPCBytes; x++ ) { 
    currTag[x] = nano.msg[31 + x]; 
  }
}

void printTag(byte * tag, byte tagEPCBytes) { 
  for (byte x = 0; x < tagEPCBytes; x++ ) { 
    Serial.print( tag[x], HEX);  
    Serial.print(F(" ")); 
  }
  Serial.println(); 
}

EPCs epcs = EPCs();
byte lastTag[12]; 

void loop() {
    
    //int ch = Serial.read(); 
     //if( ch == 'k') { 
//      Serial.println("Ready to read!"); 
//      Serial.println(epcs.num);
      if (epcs.num < 3) {
         
        if ( nano.check() == true) { 
//          Serial.println("Hmm");
            byte responseType = nano.parseResponse(); 
            if ( responseType == RESPONSE_IS_TAGFOUND) { 
//              Serial.println("Found!!!!!!");
                byte tagEPCBytes = nano.getTagEPCBytes(); //Get the number of bytes of EPC from response
                if (epcs.num < 3 && tagEPCBytes == 12) { 
//                  Serial.println("Get!!!!!!");
                  byte currTag[tagEPCBytes];
                  getEPC(currTag, tagEPCBytes);
      //            printTag(currTag, tagEPCBytes); 
                  if(!epcs.matches(currTag, lastTag)) {
                    if(!epcs.contains(currTag)) {
  //                    Serial.println("Save!!!!!!");
                      epcs.save(currTag, tagEPCBytes); 
                      
                      tone(BUZZER1, 2093); //C
                      delay(150);
                      tone(BUZZER1, 2349); //D
                      delay(150);
                      tone(BUZZER1, 2637); //E
                      delay(150);
                      noTone(BUZZER1);
                    }
                    for (int n=0;n<12;n++){lastTag[n]=currTag[n];}
                  }
                } 
                //while(nano.check() && nano.parseResponse() == RESPONSE_IS_TAGFOUND) { nano.getTagEPCBytes(); }

            }  
            
        }
        
        if (epcs.num == 3) { 
           epcs.printTagsToSerial(); 
           
           epcs.reset(); 

           delay(1500);
           while(nano.check() && nano.parseResponse() == RESPONSE_IS_TAGFOUND) { nano.getTagEPCBytes(); }

           Serial.println("Read all 3 tags");
        }
      }

       
      //Serial.println("Enter 'k' to begin read");
      
     //}
if(Serial.available() > 0) { 
  int ch = Serial.read(); 
     if( ch == 't') { 
          //Beep! Piano keys to frequencies: http://www.sengpielaudio.com/KeyboardAndFrequencies.gif
          tone(BUZZER1, 2093, 150); //C
          delay(150);
          tone(BUZZER1, 2349, 150); //D
          delay(150);
          tone(BUZZER1, 2637, 150); //E
          delay(150);                
      }

      if( ch == 'f') {
          //Beep! Piano keys to frequencies: http://www.sengpielaudio.com/KeyboardAndFrequencies.gif
          tone(BUZZER1, 2637, 150); //E
          delay(150);
          tone(BUZZER1, 2349, 150); //D
          delay(150);
          tone(BUZZER1, 2093, 150); //C
          delay(150);
          
      }
    
  }
//  char ch = Serial.read();
//  Serial.println(); 
//  while (epcs.num < 3) {
//      if ( nano.check() == true) { 
//          byte responseType = nano.parseResponse(); 
//      
//          if (responseType == RESPONSE_IS_KEEPALIVE) {
//  //          Serial.println("Scanning"); 
//          } else if ( responseType == RESPONSE_IS_TAGFOUND) { 
//              byte tagEPCBytes = nano.getTagEPCBytes(); //Get the number of bytes of EPC from response
//              if (epcs.num < 3 && tagEPCBytes > 0) { 
//                byte currTag[tagEPCBytes];
//                getEPC(currTag, tagEPCBytes);
//    //            printTag(currTag, tagEPCBytes); 
//                if(!epcs.contains(currTag)) {
//                  epcs.save(currTag, tagEPCBytes); 
//                }
//              } 
//          }  
//      }
//  }

  // Process tags
  //https://arduino.stackexchange.com/questions/11637/how-to-transfer-data-from-arduino-to-some-software-in-computer
}

//Gracefully handles a reader that is already configured and already reading continuously
//Because Stream does not have a .begin() we have to do this outside the library
boolean setupNano(long baudRate)
{
  nano.begin(softSerial); //Tell the library to communicate over software serial port

  //Test to see if we are already connected to a module
  //This would be the case if the Arduino has been reprogrammed and the module has stayed powered
  softSerial.begin(baudRate); //For this test, assume module is already at our desired baud rate
  while(!softSerial); //Wait for port to open

  //About 200ms from power on the module will send its firmware version at 115200. We need to ignore this.
  while(softSerial.available()) softSerial.read();
  
  nano.getVersion();

  if (nano.msg[0] == ERROR_WRONG_OPCODE_RESPONSE)
  {
    //This happens if the baud rate is correct but the module is doing a ccontinuous read
    nano.stopReading();

    Serial.println(F("Module continuously reading. Asking it to stop..."));

    delay(1500);
  }
  else
  {
    //The module did not respond so assume it's just been powered on and communicating at 115200bps
    softSerial.begin(115200); //Start software serial at 115200

    nano.setBaud(baudRate); //Tell the module to go to the chosen baud rate. Ignore the response msg

    softSerial.begin(baudRate); //Start the software serial port, this time at user's chosen baud rate
  }

  //Test the connection
  nano.getVersion();
  if (nano.msg[0] != ALL_GOOD) return (false); //Something is not right

  //The M6E has these settings no matter what
  nano.setTagProtocol(); //Set protocol to GEN2

  nano.setAntennaPort(); //Set TX/RX antenna ports to 1

  return (true); //We are ready to rock
}
