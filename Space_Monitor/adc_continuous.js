var ads1x15 = require('node-ads1x15');
var chip = 1; //0 for ads1015, 1 for ads1115

//Simple usage (default ADS address on pi 2b or 3):
var adc = new ads1x15(chip);

// Optionally i2c address as (chip, address) or (chip, address, i2c_dev)
// So to use  /dev/i2c-0 use the line below instead...:

//      var adc = new ads1x15(chip, 0x48, 'dev/i2c-0');

var channel = 3; //channel 0, 1, 2, or 3...
var samplesPerSecond = '250'; // see index.js for allowed values for your chip
var progGainAmp = '4096'; // see index.js for allowed values for your chip

adc.stopContinuousConversion(function(err) {
    if (err) {
        throw err;
    }
});

if (!adc.busy) {
    adc.startContinuousConversion(channel, progGainAmp, samplesPerSecond, function(err, data) {
        if (err) {
            throw err;
        }
        console.log("start" + data);

        adc.getLastConversionResults(function(err, data) {
            if (err) {
                throw err;
            }
            console.log("getlast" + data);
        });
    });
}





//
//
// setInterval(function() {
//     var reading = 0;
//     if (!adc.busy) {
//         adc.readADCSingleEnded(channel, progGainAmp, samplesPerSecond, function(err, data) {
//             if (err) {
//                 //logging / troubleshooting code goes here...
//                 throw err;
//             }
//             // if you made it here, then the data object contains your reading!
//             reading = data;
//             console.log(reading);
//             // any other data processing code goes here...
//
//         });
//     }
// }, 1000);
