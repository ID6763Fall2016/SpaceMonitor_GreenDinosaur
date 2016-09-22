var assert = require('assert');

/****** Express Web Server ******/
var express = require('express');
var ExpressServer = express();
var HTTPserver = require('http').Server(ExpressServer);

// serve static pages in public_html folder
ExpressServer.use(express.static(__dirname + '/public_html'));

// bind server to port 3000
HTTPserver.listen(3000, function() {
    console.log('Express Server listening on port 3000');
});

ExpressServer.get('/', function(req, res) {
    res.send('Café Scout Homepage');
});

ExpressServer.get('/DHTsensor', function(req, res) {
    res.send(DHT_sensor_string);
});

ExpressServer.get('/chart', function(req, res) {
    res.sendFile(__dirname + '/public_html/index-tingosocketchart.html');
});

/******* WebSocket ******/
var io = require('socket.io')(HTTPserver);

io.on('connection', function(socket) {
    console.log("user connected to socket");

    socket.on('messageFromClientToServer', function(data) {
        console.log(data);
    });

    var sendLatestSamples = setInterval(function() {
        getLatestSamples(10, function(results) {
            var values = []
            for (var i = 0; i < results.length; i++) {
                values.push(results[i].humidity);
            }
            socket.emit('latestSamples', values);
            console.log("sent    : " + values);
        });
    }, 1000);

    socket.on('disconnect', function() {
        console.log("user disconnected from socket");
        clearInterval(sendLatestSamples);
    });
});



/******* Measurements *******/
var update_DHT_sensor = function() {
    var readout = DHT_sensor.read();
    DHT_sensor_temp = readout.temperature.toFixed(1);
    DHT_sensor_hum = readout.humidity.toFixed(1);
    DHT_sensor_string = 'Temperature: ' + DHT_sensor_temp + 'C, ' + 'humidity: ' + DHT_sensor_hum + '%';
}

var update_ADC_sensors = function() {
    // start photoresistor conversion
    while (adc.busy) {
        console.log("wait 1");
    }
    adc.readADCSingleEnded(ADC_CHANNEL_PHOTORESISTOR, progGainAmp, samplesPerSecond, function(err1, data1) {
        if (err1) {
            throw err1;
        }
        ADC_sensor_luminosity = data1;

        // start microphone conversion
        while (adc.busy) {
            console.log("wait 2");
        }
        adc.readADCSingleEnded(ADC_CHANNEL_MIC, progGainAmp, samplesPerSecond, function(err2, data2) {
            if (err2) {
                throw err2;
            }
            ADC_sensor_noise = data2;
        });

        // show results
        console.log("luminosity: " + ADC_sensor_luminosity);
        console.log("noise: " + ADC_sensor_noise);

    });




}

var reset_door_sensor = function() {
    door_counter = 0;
}

/******* GPIO ******/
// button is attaced to pin 17, LED to 18
var GPIO = require('onoff').Gpio;
var LED_connection_status = new GPIO(18, 'out'); // gpio 18, output
var button_door = new GPIO(17, 'in', 'rising', {
    persistentWatch: true,
    debounceTimeout: 1000
}); // gpio 17, input, rising edge interrupts only, enable button to work on consecutive pushes, debounce for 1 second


/******* ADC *******/
var ads1x15 = require('node-ads1x15');
var chip = 1; //0 for ads1015, 1 for ads1115
//Simple usage (default ADS address on pi 2b or 3):
var adc = new ads1x15(chip);

var ADC_CHANNEL_PHOTORESISTOR = 0;
var ADC_CHANNEL_MIC = 3;
var samplesPerSecond = '860'; // highest sampling rate
var progGainAmp = '4096'; // cover +4V to -4V

var ADC_sensor_luminosity = 0;
var ADC_sensor_noise = 0;

/******* Check Internet Connection Status *******/
var previous_online_status = false;
var online_check_interval = 0.5; // minutes

setInterval(function() {
    var isOnline = require('is-online');
    isOnline(function(err, online) {
        // only make changes to LED when something changes in connectivity
        if (online != previous_online_status) {
            console.log(online ? "Connection OK" : "No Connection!");
            LED_connection_status.writeSync(online ? 1 : 0);
        }
        previous_online_status = online;
    });
}, online_check_interval * 60000);





/******* Measure Door openings/minute *******/
var door_counter = 0;

function count_door_openings() {
    door_counter++;
    console.log("door: " + door_counter);
}


// watch for Door opening actions and call callback function
button_door.watch(count_door_openings);


/******* Humidity/Temperature Sensor *******/
var DHT_sensor = require('node-dht-sensor');

var DHT_sensor_temp = -1;
var DHT_sensor_hum = -1;

var DHT_sensor_string = "";

if (DHT_sensor.initialize(22, 4)) {
    update_DHT_sensor();
    console.log(DHT_sensor_string);
} else {
    console.warn('Failed to initialize DHT sensor');
}



/******* Database *******/
var DatabaseEngine = require('tingodb')();

// create database in folder /db
var database = new DatabaseEngine.Db(__dirname + '/db', {});

var insertSample = function(new_sample) {
    var sampleCollection = database.collection('measurements');
    sampleCollection.insert(new_sample,
        function(err, docResult) {
            assert.equal(err, null);
            //console.log("added a sample to DB");
        });
}

// add data to the table every 1000ms
setInterval(function() {
    update_DHT_sensor();
    update_ADC_sensors();
    var new_sample = {
        "temperature": DHT_sensor_temp,
        "humidity": DHT_sensor_hum,
        "door": door_counter,
        "luminosity": ADC_sensor_luminosity,
        "noise": ADC_sensor_noise,
        "datetime": new Date()
    };
    reset_door_sensor();
    insertSample(new_sample);
}, 1000);

// retrieve last N data
var getLatestSamples = function(theCount, callback) {
    var sampleCollection = database.collection('somestuff');
    sampleCollection
        .find()
        .sort({
            "datetime": -1
        })
        .limit(theCount)
        .toArray(function(err, docList) {
            callback(docList);
        });
};


// // retrieve 5 records every 3000ms
// setInterval(function() {
//     getLatestSamples(5, function(results) {
//         var temperature_values = [];
//         var humidity_values = [];
//         var datetime_values = [];
//         for (var i = 0; i < results.length; i++) {
//             temperature_values.push(results[i].temperature);
//             humidity_values.push(results[i].humidity);
//             datetime_values.push(results[i].datetime);
//         }
//         console.log(humidity_values);
//     });
// }, 3000);





/******* Assess status of Cafe *******/
function cafe_status() {

}
