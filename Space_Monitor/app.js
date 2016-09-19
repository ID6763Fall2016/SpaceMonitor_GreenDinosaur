/****** Express Web Server ******/
var express = require('express');
var server = express();

// serve static pages in public_html folder
server.use(express.static(__dirname + '/public_html'));

// bind server to port 3000
server.listen(3000, function () {
  console.log('Express Server listening on port 3000');
});

server.get('/', function (req, res) {
  res.send('Café Scout Homepage');
});

server.get('/DHTsensor', function (req, res) {
  res.send(DHT_sensor_value);
});

/******* GPIO ******/
// button is attaced to pin 17, LED to 18
var GPIO = require('onoff').Gpio;
var LED_connection_status = new GPIO(18, 'out');  // gpio 18, output
var button_door = new GPIO(17, 'in', 'rising', { persistentWatch: true, debounceTimeout: 1000 }); // gpio 17, input, rising edge interrupts only, enable button to work on consecutive pushes, debounce for 1 second


/******* Check Internet Connection Status *******/
var previous_online_status = false;
var online_check_interval = 0.5;  // minutes

setInterval(function(){
  var isOnline = require('is-online');
  isOnline(function(err, online) {
    // only make changes to LED when something changes in connectivity
    if (online != previous_online_status) {
      console.log(online ? "Connection OK" : "No Connection!");
      LED_connection_status.writeSync(online ? 0 : 1);
    }
    previous_online_status = online;
  });
},online_check_interval*60000);





/******* Measure Door openings/minute *******/
door_counter = 0;
door_interval = 1;    // minutes

function count_door_openings(){
  door_counter++;
  console.log("door: " + door_counter);
}

// reset door counter every door_interval minutes
setInterval(function(){
  door_counter = 0;
},door_interval*60000);

// watch for Door opening actions and call callback function
button_door.watch(count_door_openings);


/******* Humidity/Temperature Sensor *******/
var dht_sensor = require('node-dht-sensor');
var DHT_sensor_value;

var dht_sensor_interval = 1/60;    // minutes

if (dht_sensor.initialize(22, 4)) {
  setInterval(function(){
    var readout = dht_sensor.read();
    DHT_sensor_value = 'Temperature: ' + readout.temperature.toFixed(2) + 'C, ' + 'humidity: ' + readout.humidity.toFixed(2) + '%';
    console.log(DHT_sensor_value);
  }, dht_sensor_interval*60000);
}
else {
  console.warn('Failed to initialize DHT sensor');
}





/******* Database *******/
var DatabaseEngine = require('tingodb')();

// create database in folder /db
var database = new DatabaseEngine.Db(__dirname + '/db',{});

// add data to the table every 1000ms
setInterval(function(){
	var sampleCollection = database.collection('somestuff');
	sampleCollection.insert({
		"sensorvalue" : Math.random() * 100,
		"datetime" : new Date()
	});
	console.log("added a sample");
},1000);

// retrieve last N data
var getLatestSamples = function(theCount,callback){
	var sampleCollection = database.collection('somestuff');
	sampleCollection
		.find()
		.sort({"datetime":-1})
		.limit(theCount)
		.toArray(function(err,docList){
			callback(docList);
		});
};

setTimeout(function() {
  // retrieve 5 records every 3000ms
  setInterval(function(){
  	getLatestSamples(5,function(results){
  		var theValues = []
  		for(var i=0; i<results.length; i++)
  		{
  			theValues.push(results[i].sensorvalue);
  		}
  		console.log(theValues);
  	});
  }, 3000);
}, 5000);




/******* Assess status of Cafe *******/
function cafe_status() {

}
