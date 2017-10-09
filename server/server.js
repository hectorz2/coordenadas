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

var usersLogged = { //TODO que tengan una clave aleatoria asociada
	
};

var worlds = {
	
};




io.on('connection', (socket) => {
	var userLogged = null;
	console.log('Client connected');
	socket.on('disconnect', () => console.log('Client disconnected'));
	socket.on('getLoginState', (user, answer) => {
		answer((usersLogged.hasOwnProperty(user.nick) && usersLogged[user.nick].key == user.key));
	});
	socket.on('register', (user, answer) => {
		console.log('registering user: ' + user.nick);
		var passHash = crypto.createHash('sha256').update(user.pwd).digest('hex');
		dao.user.register({nick: user.nick, pwd: passHash}, answer);
	});
	socket.on('login', (user, answer) => {
		console.log('logging user: ' + user.nick);
		var passHash = crypto.createHash('sha256').update(user.pwd).digest('hex');
		user.pwd = passHash;
		dao.user.login(user, function(state){
			if(state == 0){
				console.log('users already loggeds: ' + usersLogged);
				//if(!usersLogged.hasOwnProperty(user.nick)){
					
					var key = Math.random()             // Generate random number, eg: 0.123456
								.toString(36)           // Convert  to base-36 : "0.4fzyo82mvyr"
								.slice(-12);			// Cut off last 12 characters : "fzyo82mvyr"
					usersLogged[user.nick] = {
						remember: user.remember,
						key: key
					};
					console.log('saving login: ' + usersLogged[user.nick].toString());
					answer(state, key);
				/*} else {
					console.log('user already logged');
				}*/
			} else {
				answer(state, null);
			}
		});
	});
	
	socket.on('logout', (user, answer) => {
		console.log('loging out user: ' + user.nick);
		if(usersLogged.hasOwnProperty(user.nick) && usersLogged[user.nick].key == user.key){
			delete usersLogged[user.nick];
			console.log('done');
			answer(0);
		} else {
			console.log('there was an error');
			answer(-1);
		}
	});
	
	socket.on('worldList', (user, answer) => {
		console.log('retrieving world list of user: ' + user.nick);
		if(usersLogged.hasOwnProperty(user.nick) && usersLogged[user.nick].key == user.key){
			dao.world.list(user.nick, function(state, worlds){
				answer(state, worlds);
			});
		} else {
			console.log('there was an error');
			answer(-1, null)
		}
	});
	
	socket.on('quit', (user) => {
		if(usersLogged.hasOwnProperty(user.nick) && usersLogged[user.nick].key == user.key)
			if(!usersLogged[user.nick].remember)
				delete usersLogged[user.nick];
	});
	
	
	socket.join('prueba');
	io.in('prueba').emit('kk', 'kk');
});


//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
