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


/******* Button, LED ******/
// button is attaced to pin 17, led to 18
var GPIO = require('onoff').Gpio;
var led = new GPIO(18, 'out');
// var button = new GPIO(17, 'in', 'both');


var previous_online = false;

setInterval(function(){
  var isOnline = require('is-online');
  isOnline(function(err, online) {
    if (online != previous_online) {
      console.log(online);
      led.writeSync(online);
    }
    previous_online = online;
  });
},1000);
