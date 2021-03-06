# BlokMotiv
A physical/digital tagging system that enables transparency and traceability through aggregated identity and shared truth using a blockchain.

## Packages used 

- Serialport JS (https://www.npmjs.com/package/serialport, v4.0.7) <-- Make sure to install v4.0.7, and NOT the latest version, v5.0
	- npm install serialport@v4.0.7
- Socket I/O (https://socket.io/)
	- npm install socket.io

Other code references used: 
- Sparkfun Simultaneous RFID Tag Reader Library (for Arduino: https://github.com/sparkfun/SparkFun_Simultaneous_RFID_Tag_Reader_Library)
- Tierion Data API (https://tierion.com/docs/dataapi)
- Merkle Tools JS (https://github.com/Tierion/merkle-tools)

## How to Run

1. Clone this repo and download [Arduino IDE](https://www.arduino.cc/en/Main/Software)

2. Install Sparkfun Simultaneous RFID Tag Reader Library for Arduino.
In Arduino IDE open the Manage Libraries panel (`Sketch` > `Include Library` > `Manage Libraries`). Search for "sparkfun rfid" and install "Sparkfun Simultaneous RFID Tag Reader"

3. Upload firmware to two Arduinos: point of Manufacture and point of Install.
In Arduino IDE, set board to `Arduino/Genuino Uno`. 

For Manufacture
- File name: `./finalAssets/arduino/arduino.ino`
- Set line 87 to "Serial.println('w')"
- Upload file to Arduino

For Install
- File name: `./finalAssets/arduino/arduino.ino` (same file as Manufacture)
- Set line 87 to "Serial.println('r')"
- Upload file to Arduino 

4. Connect Arduino (w/ RFID readers attached) to computer 

5. Install packages with `npm install`

6. Go to ./finalAssets/

7. Run server
- In terminal, run "node server.js" 
- Currently, server is running on localhost:8000
You'll know the server is connected to each Arduino when it prints 
`Communication is on! Successfully connected to Arduino` in the terminal. The RFID readers can be flakey. If Arduino is connecting but not reading RFID tags, try power cycling and restarting server.

8. Open index.html in browser

9. To clear list of parts in interface, delete `db.json`. When you have an empty `db.json`, scan all 6 permutations of any particular airbag assembly into the Manufacture Arduino (labelled A). Since each bag has 3 tag, you do so by scanning each tag sequentially, for all possible sequences. This is because in the merkle tree of the three individual RFID tag ids, order matters, so when scanning on the Install reader, you may get a different scan order and hence different merkle root each time, so even a valid airbag might appear invalid if it's constituent tags were scanned in a different order during Manufacture.

10. Do not scan the airbag labelled B on the Manufacture Arduino - or it will record it as a legitimately manufactured airbag.
 
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







