'use strict'


/**********************************************/
// Setting up Express Server 
/**********************************************/

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8000);
app.use(express.static('.'))

/**********************************************/
// Setting up Database
/**********************************************/

var db = require('lowdb')('db.json');
db.defaults({ events: [] }).write();

/**********************************************/
// Setting up HTTP Request stuff
/**********************************************/

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var http = require('http');

/**********************************************/
// Setting up Tierion
/**********************************************/

var user = "cjmg2006@gmail.com"
var key = "DiMw7Lp4WmuAK0cxMKxRLwQUlnaZEhmNBJ6LancuWuo="
var dataStoreID = "2892" // Test airbag chain. Actual: 2945
var tierionWriteURL = "https://api.tierion.com/v1/records"
var tierionReadURL = "https://api.tierion.com/v1/records?datastoreId=" + dataStoreID 


/**********************************************/
// Setting up stuff required to read from Arduino
/**********************************************/

var readline = require('readline');
var SerialPort = require('serialport');
var port = new SerialPort('/dev/cu.usbmodem1421', {
  baudRate: 115200, 
  parser: SerialPort.parsers.readline("\n")
}); // One for MANUFACTURE: CHANGE port name as necessary

var port2 = new SerialPort('/dev/cu.usbmodem1411', {
  baudRate: 115200, 
  parser: SerialPort.parsers.readline("\n")
}); // One for INSTALL: CHANGE port name as necessary

/**********************************************/
// Setting up Merkle Tree generation stuff
/**********************************************/

var crypto = require('crypto');
var MerkleTools = require('./merkle-tools/merkletools.js');


/**********************************************/
// Refresh page with latest database at connection
/**********************************************/

io.on('connection', function(socket){
	socket.emit('allEvents', db.read().get('events').value());
});

/*******************************************************/
// Code for sending datapoints to Tierion and front-end
/*******************************************************/

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseDataPoint(d1, d2, d3) {
	var num = getRandomInt(1, 100);
	if(num % 3 == 0) return d1;
	if(num % 3 == 1) return d2;
	if(num % 3 == 2) return d3;
}

function writeToTierion(payload)  {
	var request = new XMLHttpRequest(); 
 	request.open("POST", tierionWriteURL, false); 
	var response; 
	request.onload = function () {
		var status = request.status; 
		console.log("Status of request: " + status); 
		response = request.responseText; 
	}
	request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
	request.setRequestHeader('X-Username', user);
	request.setRequestHeader('X-Api-Key',key);
	request.send(payload); 
	console.log("Received response: " + response.id);

}

// Currently, the code reads and scans the local records (db.json) for airbag existence 
function getLocalRecords() { 
	var records = JSON.parse(JSON.stringify(db)).events;
	console.log (records.length); 
	return records; 
}

function writeToDisplay(chosen, status) {   
	db.read().get('events').unshift(chosen).write(); 
	io.emit('newEvent', chosen, status); 
	// console.log("UPDATING DISPLAY YAYYYY");
}

// Generates payload to send to Tierion 
function generatePayload(record, status) { 
	record.datastoreId = dataStoreID; 
	nonce++;
	return JSON.stringify(record); 
}

/*******************************************************/
// Code for reading from Arduino Serial 
/*******************************************************/

var EPCTags = []; 
var nonce = 0; 

function hexToAscii(tagCharArray) { // tagCharArray is a character array e.g. [ '32', '44', '43', '30', '33', '33', '44', '31', '34', '32', '33', '33' ]
	var result = ""; 
 	for (var i = 0; i < tagCharArray.length ; i++) { 
		var ch = String.fromCharCode(parseInt(tagCharArray[i], 16));
		result += ch;
	}
	return result;
}

function parseAndAddTags(tagString) { // returns the status as 'r' or 'w' sot that server knows what to do with it
	 
	var tagLength = 12;  // Tag length is 12 bytes
	var tagChars = tagString.split(" ");

	for (var i = 0; i < 3 ; i++) {
		var startIndex = (tagLength + 2) * i;
		var tagChar = tagChars.slice(startIndex , startIndex + tagLength); 
		var tag = hexToAscii(tagChar);
		EPCTags.push(tag);
	}

	console.log('before sort', EPCTags);
	EPCTags.sort();
	console.log('after sort', EPCTags);
	var status = tagChars[(tagLength + 2) * 3];
	console.log(status);
	
	return status;
}

function resetTags() {
	EPCTags = [];
}


/**********************************************/
// Merkle Tree formation and checking
/**********************************************/

function createMerkleTree(components) { 
	var tree = new MerkleTools(); 
	tree.addLeaves(components, true); 
	tree.makeTree();
	return tree; 
} 

function calculateMerkleRoot(components) { 
	var tree = createMerkleTree(components); 
	var root = tree.getMerkleRoot(); 
	return root; 
}


function generateCombinations(a, b, c) {
	var result = []; 
	result.push([a, b, c]); 
	result.push([a, c, b]); 
	result.push([b, a, c]); 
	result.push([b, c, a]); 
	result.push([c, a, b]); 
	result.push([c, b, a]); 
	return result;
}


function writeTagsToBlockchain() {  // writes all variants to blockchain at point of manufacture. 
	// Note: This function exists because we cannot predict / control the order that the RFID scanner 
	// is able to scan the tags. Therefore, to ensure that all possible combinations will be recognized
	// as valid, we place all 6 combinations on the blockchain.  

	var combinations = generateCombinations(EPCTags[0], EPCTags[1], EPCTags[2]); 
	for(var i = 0 ; i < combinations.length; i++) {
		var combo = combinations[i]; 
		var tree = createMerkleTree(combo); 
		var root = tree.getMerkleRoot(); 
		writeTagToBlockchain(0, root); 
	}
	 
}

function writeTagToBlockchain(status, root) { 
	var data; 
	var aID = root.toString('hex');

	if(status == 0 ) { 
		data = {airbagID: aID, status: 'Manufactured',  vin: 'N/A', location: 'Ogden, UT' , statusCode: 0}
	} else if (status == 1) {
		data = {airbagID: aID, status: 'Installed (Verified)',  vin: '1HGCM2633A' + nonce, location: 'San Francisco, CA' , statusCode: 1}
	} else { 
		data = {airbagID: aID, status: 'Installed (Unverified)',  vin: '1HGCM2633A' + nonce, location: 'San Francisco, CA' , statusCode: 2}
	}

	console.log(data);
	
	writeToDisplay(data, status); // Display on front-end
	var payload = generatePayload(data, status); 
	writeToTierion(payload); 
}

function scanBlockchainForTag() {
	// console.log("scanning blockchain for tag");
	var tree = createMerkleTree([EPCTags[0], EPCTags[1], EPCTags[2]]); 
	var root = tree.getMerkleRoot(); 

	var aID = root.toString('hex');
	console.log(aID);

	// Get local records, search for aID in local records
	// Note: This should be changed to search for aID in Tierion records. For demo purposes, searching the db is enough
	var records = getLocalRecords();
	for ( var i = 0; i < records.length ; i++) {
		var record = records[i]; 
		var recordID = record.airbagID;
		// var recordID = record.airbagID.substring(1);
		var recordStatus = record.statusCode;

		if(aID === recordID && recordStatus == 0) {
			console.log("TRUE MATCH FOUND!!!! <3");
			return record.airbagID; 
		}
	}

	return "N/A";

}


/**********************************************/
// Read from serial port 
// Note: Same serial port code is used for both arduinos. 
// Difference in behavior comes only from the different messages sent to the server. 
/**********************************************/
function openFn() { 
	console.log('Communication is on! Successfully connected to Arduino');
}

function dataFn(data) {
	console.log("Serial: " + data);

	if (data.match(/(([a-zA-Z0-9]{1,2}\s){12}\s\s){3}[wr]/)) { 

		var status = parseAndAddTags(data);   // parse from string to array 
		console.log("Status: " + status);
		if(status === 'w\r') { // write tags to blockchain (generate for all 6 combinations, but only display 1)
			console.log("Calling write"); 
			var airbagID = calculateMerkleRoot(EPCTags).toString('hex');
			writeTagToBlockchain(0, airbagID);
		} else if (status === 'r\r') {
			console.log("Calling read"); 
			var scanResult = scanBlockchainForTag();
			if( scanResult != "N/A") {  // if it is a successful match
				console.log("TRUE MATCH FOUND: " + scanResult);
				writeTagToBlockchain(1, nonce % 10 + scanResult); 
			} else { 
				writeTagToBlockchain(2, scanResult);
			}
		}
		resetTags();  
	}
}

function errorFn() {}
function closeFn() {}

port.on("open", openFn); 
port.on("data", dataFn); 
port.on("error", errorFn); 
port.on("close", closeFn); 

port2.on("open", openFn); 
port2.on("data", dataFn); 
port2.on("error", errorFn); 
port2.on("close", closeFn); 

function sendToSerial(data, num) { // data = 'k'
	if (num == 1) { 
		port.write(data);
		console.log('Sent to serial: w');
	} else {
		port2.write(data);
		console.log('Sent to serial: r');
	}
}



/*******************************************************/
// Test code to send random fake airbags every 1 second
/*******************************************************/

// setInterval(function(){
// 	var datapoint1 = {airbagID: 'A00812345' + i, status: 'Manufactured',  vin: '1HGCM2633A' + i, location: 'San Francisco, CA' , statusCode: 0}
// 	var datapoint2 = {airbagID: 'A00898765' + i, status: 'Installed (Verified)',  vin: '1HGJXN585B' + i, location: 'San Francisco, CA', statusCode: 1 }
// 	var datapoint3 = {airbagID: 'A00898765' + i, status: 'Installed (Unverified)',  vin: '1HGJXN585B' + i, location: 'San Francisco, CA', statusCode: 2} 
// 	var chosen = chooseDataPoint(datapoint1, datapoint2, datapoint3); 
// 	writeAndDisplay(chosen); 
// 	i++; 
// }, 1000)

var counter = 0; 

// setInterval(function(){
// 	// getLocalRecords();
// 	writeTagToBlockchain(counter % 3, "N/A");
// 	counter++; 
// }, 3000);


// setInterval(function(){
// 	// getLocalRecords();
// 	sendToSerial('k', counter % 2 + 1);
// 	counter ++ ; 
// }, 10000);

if (EPCTags.length == 3) {
	console.log(EPCTags);
} 
