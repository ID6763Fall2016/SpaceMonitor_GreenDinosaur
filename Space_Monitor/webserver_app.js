var express = require('express');
var app = express();

// serve static pages in public_html folder
app.use(express.static('public_html'));

app.get('/', function (req, res) {
  res.send('Hello World!');
//hi
});

app.get('/hareen', function (req, res) {
  res.send('Hello Hareen!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
