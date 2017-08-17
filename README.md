# BlokMotiv
A physical/digital tagging system that enables transparency and traceability through aggregated identity and shared truth using a blockchain.

## Packages used 

Download these packages before you run the code. 

- Node JS (https://nodejs.org/en/)
- Express JS (https://expressjs.com/)
	- npm install express --save
- Serialport JS (https://www.npmjs.com/package/serialport, v4.0.7) <-- Make sure to install v4.0.7, and NOT the latest version, v5.0
	- npm install serialport@v4.0.7
- Socket I/O (https://socket.io/)
	- npm install socket.io

Other code references used: 
- Sparkfun Simultaneous RFID Tag Reader Library (for Arduino: https://github.com/sparkfun/SparkFun_Simultaneous_RFID_Tag_Reader_Library)
- Tierion Data API (https://tierion.com/docs/dataapi)
- Merkle Tools JS (https://github.com/Tierion/merkle-tools)

## How to Run 

1. Upload 'Manufacture' code into 1 Arduino  
	- File name: arduino.ino
	- Set line 87 to "Serial.println('w')"
	- Upload file to Arduino 

2. Upload 'Install' code into another Arduino
	- File name: arduino.ino
	- Set line 87 to "Serial.println('r')"
	- Upload file to Arduino 

3. Connect Arduino (w/ RFID readers attached) to computer 

4. Go to ./finalAssets/

5. Run server
	- In terminal, run "node server.js" 
	- Currently, server is running on localhost:8000

6. Open index.html in browser
 
## Bill of Materials

1. Arduino Uno - R3 (https://www.sparkfun.com/products/11021)
	- Part: DEV-11021
	- Quantity: 2

2. SparkFun Simultaneous RFID Reader - M6E Nano (https://www.sparkfun.com/products/14066)
	- Part: SEN-14066
	- Quantity: 2

3. Arduino Stackable Header Kit (https://www.sparkfun.com/products/10007)
	- Part: PRT-10007
	- Quantity: 2	

4. UHF RFID Tag - Adhesive (Set of 5) (https://www.sparkfun.com/products/14151)
	- Part: WRL-14151
	- Quantity: 2

5. Cable A to B - 6 Foot (https://www.sparkfun.com/products/512)
	- Part: CAB-00512
	- Quantity: 2

6. Wall Adapter Power Supply - 5V DC 2A (Barrel Jack) (https://www.sparkfun.com/products/12889) 
	- Part: TOL-12889
	- Quantity: 2

## Hardware Assembly Instructions

1. Carefully solder pins from Arduino Stackable Header Kit onto the SparkFun Simultaneous RFID Reader - M6E Nano board
	- For detailed information on the SparkFun Simultaneous RFID Reader - M6E Nano including how to interface with it, check out this guide
	- Please note that the most important pins on the SparkFun Simultaneous RFID Reader - M6E Nano board are as follows:
		- RX (Digital 0), TX (Digital 1), Digital 2, Digital 3 - communication
		- Digital 9, Digital 10 - buzzer
		- 5V + GND - power

2. Gently mount the SparkFun Simultaneous RFID Reader - M6E Nano shield to the Arduino
	- Pins tend to bend easily, so ensure careful alignment

3. Plug the cables
	- Connect the Cable A to B - 6 Foot USB cable to the computer and then the Arduino
	- Next plug the Wall Adapter Power Supply - 5V DC 2A (Barrel Jack) into the Arduino

4. In the Arduino IDE, open the “Read_EPC” example sketch (File → Examples → Sparkfun Simultaneous RFID Tag Reader Library → Example2_Read_EPC)
	- Upload “Read_EPC”
	- Test with the Arduino Serial Monitor

5. Open our custom software (“arduino.ino”)
	- Upload
 	- Test with the Arduino Serial Monitor
 	- Follow the "How To Run" section







