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


/******* GPIO ******/
// button is attaced to pin 17, LED to 18
var GPIO = require('onoff').Gpio;
var LED_connection_status = new GPIO(18, 'out');  // gpio 18, output
var button = new GPIO(17, 'in', 'rising', { persistentWatch: true, debounceTimeout: 1000 }); // gpio 17, input, rising edge interrupts only, enable button to work on consecutive pushes, debounce for 1 second

/******* Check Internet Connection Status *******/
var previous_online_status = false;
var online_check_interval = 1;  // minutes

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
button.watch(count_door_openings);





/******* Assess status of Cafe *******/
function cafe_status() {

}
