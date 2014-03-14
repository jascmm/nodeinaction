var http	= require('http');
var fs		= require('fs');
var path	= require('path');
var mime	= require('mime');
var chatServer = require('./lib/chat_server.js');
var cache	= {};

function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found');
	response.end();
}

function sendFile(response, filePath, fileContents) {
	console.log("sendFile");
	response.writeHead(200, {"Content-Type": mime.lookup(path.basename(filePath))});
	response.end(fileContents);
	console.log("endSendFile");
}

function serveStatic(response, cache, absPath) {
	if (cache[absPath]) { // Check in cache
		sendFile(response, absPath, cache[absPath]); // Serve file from memory
	} else {
		fs.exists(absPath, function(exists) { // Check if the file exist.
			if (exists) {
				fs.readFile(absPath, function (err, data) {  //read from the file
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);  //Serve file from disk
					}
				});
			} else {
				send404(response);
			}
		});
	}
}




var server = http.createServer(function(request, response) {
	var filePath = false;

	if (request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}

	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
}).listen(3000, function() {
	console.log("Server listening on port 3000.");
});

chatServer.listen(server);