var Engine = require('tingodb')();

// create database in folder /db
var database = new Engine.Db(__dirname + '/db',{});

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
},3000);
