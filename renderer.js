// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const remote = require('electron').remote;
 
const main = remote.require('./main.js');

//const os = require('os');

const io = require('socket.io-client');
const socket = io.connect('http://localhost:3000', {reconnect: true});

$(document).ready(function(){
	
	socket.on('connect', function(){
		console.log('connected to websocket server');
	});
	
      var el = $('#server-time');
      socket.on('time', function(timeString) {
        el.html('Server time: ' + timeString);
      });
});