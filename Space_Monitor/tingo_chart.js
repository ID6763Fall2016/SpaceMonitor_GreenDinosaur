var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

var Engine = require('tingodb')(),
assert = require('assert');

var db = new Engine.Db(__dirname + '/db',{});

function handler (req, res) {
 fs.readFile(__dirname + '/public_html/index-tingosocketchart.html',
 function (err, data) {
 res.writeHead(200);
 res.end(data);
 });
 console.log("user connected");
}

app.listen(8000);

io.on('connection', function (socket) {
 console.log("user connected to socket");

 socket.on('messageFromClientToServer', function(data){
 console.log(data);
 });

 var sendLatestSamples = setInterval(function(){
 getLatestSamples(100,function(results){
 var values = []
 for(var i=0; i<results.length; i++)
 {
 values.push(results[i].value);
 }
 socket.emit('latestSamples', values);
 console.log(values);
 });
 },1000);

 socket.on('disconnect', function(){
 console.log("user disconnected from socket");
 clearInterval(sendLatestSamples);
 });
});


var insertSample = function(theValue, theDate)
{
 var sampleCollection = db.collection('chartStuff');
 sampleCollection.insert({
 "value" : theValue,
 "datetime" : theDate
 },
 function(err, docResult) {
 assert.equal(err, null);
 console.log("Inserted a sample into the chartStuff collection.");
 //db.close();
 });
};

setInterval(function(){
 var makeValue = Math.random() * 100;
 var getDate = new Date();
 insertSample(makeValue,getDate);
},1000);

var getLatestSamples = function(theCount,callback){

 var sampleCollection = db.collection('chartStuff');
 sampleCollection
 .find()
 .sort({"datetime":-1})
 .limit(theCount)
 .toArray(function(err,docList){
 callback(docList);
 });
};
