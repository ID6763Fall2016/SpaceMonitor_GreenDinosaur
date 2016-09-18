var GPIO = require('onoff').Gpio,
    led = new GPIO(18, 'out');


var express = require('express');
var app = express();

// serve static pages in public_html folder
app.use(express.static(__dirname + '/public_html'));

app.get('/', function (req, res) {
  res.send('Hello World!');
//hi
});

app.post('/turnon', function (req, res) {
  console.log("turn on");
  led.writeSync(1);
  res.redirect('back');
});


app.post('/turnoff',function(req,res){
	console.log("turn off");
        led.writeSync(0);
	res.redirect('back');
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
