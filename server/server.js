'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const mysql = require('mysql');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

const crypto = require('crypto');

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'coordenadas'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to mysql!");
});

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
  socket.on('register', (user) => {
	console.log('registering user: ' + user.nick);
	var passHash = crypto.createHash('sha256').update(user.pwd).digest('hex');
	var sql = `INSERT INTO users values('${user.nick}', '${passHash}')`;
	var values = [
		[user.nick, passHash]
	];
	con.query(sql, values, function(err, result){
		if (err) throw err;
		console.log('user registered');
	});
	});
});


//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
