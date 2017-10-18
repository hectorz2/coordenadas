'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');



const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
	.use((req, res) => res.sendFile(INDEX) )
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
	
	socket.on('selectWorld', (user, answer) => {
		console.log('selecting world ' + user.worldId + ' for user: ' + user.nick);
		if(usersLogged.hasOwnProperty(user.nick) && usersLogged[user.nick].key == user.key){
			if(usersLogged[user.nick].worldId != null){
				socket.leave(user.worldId);
			}
			usersLogged[user.nick].worldId = user.worldId;
			socket.join(user.worldId);
			console.log('users in this room: ' + io.sockets.adapter.rooms[user.worldId].length);
			if(!worlds.hasOwnProperty(user.worldId))
				worlds[user.worldId] = [];
			if(worlds[user.worldId].indexOf(user.nick) == -1)
				worlds[user.worldId].push(user.nick);
			io.in(user.worldId).emit('worldConnection', user.nick);
			answer(0, worlds[user.worldId]);
		} else {
			answer(1, null);
		}
	});
	
	socket.on('removeWorld', (data, answer) => {
		console.log('removing world ' + data.id);
		if(usersLogged.hasOwnProperty(data.user.nick) && usersLogged[data.user.nick].key == data.user.key)
			dao.world.delete(data.id, answer);
	});
	
	socket.on('createWorld', (data, answer) => {
		console.log('creating world with name: ' + data.name + ' from user: ' + data.user.nick);
		if(usersLogged.hasOwnProperty(data.user.nick) && usersLogged[data.user.nick].key == data.user.key)
			dao.world.create(data, answer);
	});
	
	socket.on('leaveWorld', (user, answer) => {
		console.log('user: ' + user.nick + ' is leaving  his world');
		if(usersLogged.hasOwnProperty(user.nick) && usersLogged[user.nick].key == user.key){
			io.in(user.worldId).emit('worldDisconnection', user.nick);
			if(usersLogged[user.nick].worldId != null){
				socket.leave(user.worldId);
			}
			worlds[user.worldId].splice(worlds[user.worldId].indexOf(user.nick),1);
			if(worlds[user.worldId].length == 0)
				delete worlds[user.worldId];
			
			usersLogged[user.nick].worldId = null;
			
			answer(0);
		} else {
			answer(1);
		}
	});
	
	socket.on('leaveWorldForEver', (data, answer) => {
		console.log('user: ' + data.user.nick + ' is leaving the world: ' + data.id + ' for ever');
		if(usersLogged.hasOwnProperty(data.user.nick) && usersLogged[data.user.nick].key == data.user.key){
			if(usersLogged[data.user.nick].worldId != null && usersLogged[data.user.nick].worldId == data.id){
				socket.leave(data.user.worldId);
				usersLogged[data.user.nick].worldId = null;
			}
			dao.world.leave(data, answer);
		} else {
			answer(1);
		}
	});
	socket.join('prueba');
	io.in('prueba').emit('kk', 'kk');
});


//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
