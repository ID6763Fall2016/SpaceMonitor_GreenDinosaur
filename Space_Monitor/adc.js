var ads1x15 = require('node-ads1x15');
var chip = 1; //0 for ads1015, 1 for ads1115

//Simple usage (default ADS address on pi 2b or 3):
var adc = new ads1x15(chip);

// Optionally i2c address as (chip, address) or (chip, address, i2c_dev)
// So to use  /dev/i2c-0 use the line below instead...:

//      var adc = new ads1x15(chip, 0x48, 'dev/i2c-0');

var channel = 3; //channel 0, 1, 2, or 3...
var samplesPerSecond = '860'; // see index.js for allowed values for your chip
var progGainAmp = '4096'; // see index.js for allowed values for your chip

//somewhere to store our reading
var counter = 0;
var counter_max = 10;
var ADC_data = [];
var ADC_timestamps = [];

var intervalID = setInterval(function() {
    if (!adc.busy) {
        adc.readADCSingleEnded(channel, progGainAmp, samplesPerSecond, function(err, data) {
            if (err) {
                //logging / troubleshooting code goes here...
                throw err;
            }
            // if you made it here, then the data object contains your reading!
            ADC_data[counter] = data;
            ADC_timestamps[counter] = Date.now();
            ++counter;
            if (counter == counter_max) {
                console.log(ADC_data);
                console.log(ADC_timestamps);
                counter = 0;
                clearInterval(intervalID);
            }

        });
    }
}, 1);
