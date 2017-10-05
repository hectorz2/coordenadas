'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');



const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

const crypto = require('crypto');

const dao = require('./dao');



io.on('connection', (socket) => {
	var id = socket.id;
	console.log('Client connected');
	socket.on('disconnect', () => console.log('Client disconnected'));
	socket.on('register', (user, answer) => {
		console.log('registering user: ' + user.nick);
		var passHash = crypto.createHash('sha256').update(user.pwd).digest('hex');
		var state = dao.user.register({nick: user.nick, pwd: passHash}, answer);
		//socket.emit('registerBack', {state: true});
		
	});
});


//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
