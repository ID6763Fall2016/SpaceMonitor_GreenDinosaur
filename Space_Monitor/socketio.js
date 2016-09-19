var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

function handler (req, res) {
	fs.readFile(__dirname + '/public_html/index.html',
	function (err, data) {
		res.writeHead(200);
		res.end(data);
	});
	console.log("user connected");
}

app.listen(3000);

io.on('connection', function (socket) {
	console.log("user connected to socket");

	socket.on('messageFromClientToServer', function(data){
		console.log(data);
	});

	var sendRandomNumbers = setInterval( function(){
		var numberData = Math.random() * 100;
		console.log(numberData);
		socket.emit('messageFromServerToClient', numberData);
	},1000);

	socket.on('disconnect', function(){
		console.log("user disconnected from socket");
		clearInterval(sendRandomNumbers);
	});
});
