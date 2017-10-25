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

let usersLogged = {
	
};

let worlds = {
	
};

function userValidation(user){
	return (usersLogged.hasOwnProperty(user.nick) && usersLogged[user.nick].key === user.key);
}


io.on('connection', (socket) => {
	let socketUser = null;
	console.log('Client connected');
	socket.on('disconnect', () => {
		console.log('Client disconnected');
    });
	socket.on('getLoginState', (user, answer) => {
		answer(userValidation(user));
	});
	socket.on('register', (user, answer) => {
		console.log('registering user: ' + user.nick);
		let passHash = crypto.createHash('sha256').update(user.pwd).digest('hex');
		dao.user.register({nick: user.nick, pwd: passHash}, answer);
	});
	socket.on('login', (user, answer) => {
		console.log('logging user: ' + user.nick);
        user.pwd = crypto.createHash('sha256').update(user.pwd).digest('hex');
		dao.user.login(user, function(state){
			if(state === 0){
				console.log('users already loggeds: ' + usersLogged);
				let key = Math.random()             // Generate random number, eg: 0.123456
					.toString(36)           // Convert  to base-36 : "0.4fzyo82mvyr"
					.slice(-12);			// Cut off last 12 characters : "fzyo82mvyr"
				usersLogged[user.nick] = {
					remember: user.remember,
					key: key
				};
				console.log('saving login: ' + usersLogged[user.nick].toString());
				socketUser = user.nick;
				answer(state, key);
			} else {
				answer(state, null);
			}
		});
	});
	
	socket.on('logout', (user, answer) => {
		console.log('loging out user: ' + user.nick);
		if(userValidation(user)){
			delete usersLogged[user.nick];
			console.log('done');
			socketUser = null;
			answer(0);
		} else {
			console.log('there was an error');
			answer(-1);
		}
	});
	
	socket.on('worldList', (user, answer) => {
		console.log('retrieving world list of user: ' + user.nick);
		if(userValidation(user)){
			dao.world.list(user.nick, function(state, worlds){
				answer(state, worlds);
			});
		} else {
			console.log('there was an error');
			answer(-1, null)
		}
	});
	
	socket.on('quit', (user) => {
		if(userValidation(user))
			if(!usersLogged[user.nick].remember)
				delete usersLogged[user.nick];
	});
	
	socket.on('selectWorld', (user, answer) => {
		console.log('selecting world ' + user.worldId + ' for user: ' + user.nick);
		if(userValidation(user)){
			if(usersLogged[user.nick].worldId !== null){
				socket.leave(user.worldId);
			}
			usersLogged[user.nick].worldId = user.worldId;
			socket.join(user.worldId);
            // noinspection JSUnresolvedVariable
            console.log('users in this room: ' + io.sockets.adapter.rooms[user.worldId].length);
			if(!worlds.hasOwnProperty(user.worldId))
				worlds[user.worldId] = [];
			if(worlds[user.worldId].indexOf(user.nick) === -1)
				worlds[user.worldId].push(user.nick);
			io.in(user.worldId).emit('worldConnection', user.nick); //TODO no se si esto lo usaré
			answer(0);
		} else {
			answer(1);
		}
	});

	socket.on('usersInWorld', (user, answer) => {
	    console.log('looking for users in world: ' + user.worldId);
	    if(userValidation(user)) {
            dao.world.usersInWorld(user.worldId, function (state, users) {
                if (state === 0) {
                    console.log('users retrieved: ' + JSON.stringify(users));
                    for (let thisUser in users) {
                        if (users.hasOwnProperty(thisUser)) {
                            users[thisUser].connected = worlds[user.worldId].indexOf(users[thisUser].nick) !== -1;
                        }
                    }
                    answer(state, users);
                } else {
                    answer(state, null)
                }
            });
        } else {
	        answer(1, null);
        }
	});

    socket.on('pendingUsersInWorld', (user, answer) => {
        console.log('looking for pending users in world: ' + user.worldId);
        if(userValidation(user)) {
            dao.world.pendingUsersInWorld(user.worldId, function (state, users) {
                if (state === 0) {
                    console.log('users retrieved: ' + JSON.stringify(users));
                    answer(state, users);
                } else {
                    answer(state, null)
                }
            });
        } else {
            answer(1, null);
        }
    });

    socket.on('inviteUserToWorld', (data, answer) => {
        console.log('inviting user: ' + data.nick + ' to world: ' + data.user.worldId);
        if(userValidation(data.user)) {
            dao.world.inviteUserToWorld({worldId: data.user.worldId, nick: data.nick}, function (state) {
                answer(state);
            });
        } else {
            answer(1);
        }
    });

    socket.on('deleteInvitationToWorld', (data, answer) => {
        console.log('deleting invitation of user: ' + data.nick + ' to world: ' + data.user.worldId);
        if(userValidation(data.user)) {
            dao.world.deleteInvitationToWorld({worldId: data.user.worldId, nick: data.nick}, function (state) {
                answer(state);
            });
        } else {
            answer(1);
        }
    });

    socket.on('checkForInvitations', (user, answer) => {
        console.log('checking for invitations of user: ' + user.nick);
        if(userValidation(user)){
            dao.user.checkForInvitations(user, function(state, invitations){
               if(state === 0){
                   answer(state, invitations);
               }  else {
                   answer(state, null);
               }
            });
        } else {
            answer(1, null);
        }
    });

    socket.on('acceptInvitation', (data, answer) => {
        console.log('accepting invitation of user: ' + data.user.nick + ' in world: ' + data.worldId);
        if(userValidation(data.user)){
            dao.user.acceptInvitation({nick: data.user.nick, worldId: data.worldId}, function(state){
                answer(state);
            });
        } else {
            answer(1);
        }
    });

    socket.on('denyInvitation', (data, answer) => {
        console.log('denying invitation of user: ' + data.user.nick + ' in world: ' + data.worldId);
        if(userValidation(data.user)){
            dao.user.denyInvitation({nick: data.user.nick, worldId: data.worldId}, function(state){
                answer(state);
            });
        } else {
            answer(1);
        }
    });

	socket.on('removeWorld', (data, answer) => {
		console.log('removing world ' + data.id);
		if(userValidation(data.user))
			dao.world.delete(data.id, answer);
	});
	
	socket.on('createWorld', (data, answer) => {
		console.log('creating world with name: ' + data.name + ' from user: ' + data.user.nick);
		if(userValidation(data.user))
			dao.world.create(data, answer);
	});

    socket.on('editWorld', (data, answer) => {
        console.log('editing world with name: ' + data.name);
        if(userValidation(data.user))
            dao.world.update({newName: data.name, id: data.id}, answer);
    });
	
	socket.on('leaveWorld', (user, answer) => {
		console.log('user: ' + user.nick + ' is leaving  his world');
		if(userValidation(user)){
			io.in(user.worldId).emit('worldDisconnection', user.nick); //TODO no se si esto lo usaré
			if(usersLogged[user.nick].worldId !== null){
				socket.leave(user.worldId);
			}
			worlds[user.worldId].splice(worlds[user.worldId].indexOf(user.nick),1);
			if(worlds[user.worldId].length === 0)
				delete worlds[user.worldId];
			
			usersLogged[user.nick].worldId = null;
			
			answer(0);
		} else {
			answer(1);
		}
	});
	
	socket.on('leaveWorldForEver', (data, answer) => {
		console.log('user: ' + data.user.nick + ' is leaving the world: ' + data.id + ' for ever');
		if(userValidation(data.user)){
			if(usersLogged[data.user.nick].worldId !== null && usersLogged[data.user.nick].worldId === data.id){
				socket.leave(data.user.worldId);
				usersLogged[data.user.nick].worldId = null;
			}
			dao.world.leave(data, answer);
		} else {
			answer(1);
		}
	});

	socket.on('loadCoordinates', (data, answer) => {
	   console.log('loading groups and coordinates of world: ' + data.user.worldId);
	   if(userValidation(data.user)){
	       let resultData = [];
	       dao.group.getAllByWorld({worldId: data.user.worldId}, function(state, groups){
	           if(state === 0) {
	               let error = false;
	               //console.log(JSON.stringify(groups));
                   for (let i = 0; i < groups.length; i += 1) {
                       //console.log('doing work on group with id: ' + groups[i].id);
                       if(error)
                           break;
                       dao.coordinate.getAllByGroup({groupId: groups[i].id}, function (state, coordinates) {
                           let actualIndex = i;
                           //console.log(JSON.stringify(coordinates));
                           console.log('state: ' + state);
                            if(state === 0){
                                console.log('creating new entry');

                                resultData.push({
                                    id: groups[i].id,
                                    name: groups[i].name,
                                    coordinates: coordinates
                                });
                                if(actualIndex === groups.length-1){
                                    answer(state, resultData);
                                }
                            } else {
                                answer(state, null);
                                error = true;
                            }
                       });
                   }


               } else {
	               answer(state, null);
               }
           });
       } else {
	       answer(1);
       }
    });

    socket.on('createGroup', (data, answer) => {
        console.log('creating group with name: ' + data.name);
        if(userValidation(data.user)){
            dao.group.create({name: data.name, worldId: data.user.worldId}, function(state, id){
                answer(state, id);
            });
        }

    });

    socket.on('editGroup', (data, answer) => {
        console.log('editing group with name: ' + data.name);
        if(userValidation(data.user)){
            dao.group.update({groupId: data.id, newName: data.name}, function(state){
                answer(state);
            });
        }

    });

    socket.on('deleteGroup', (data, answer) => {
        console.log('deleting group with id: ' + data.id);
        if(userValidation(data.user)){
            dao.group.delete({id: data.id}, function(state){
                answer(state);
            });
        }

    });

    socket.on('createCoordinate', (data, answer) => {
        console.log('creating coordinate with name: ' + data.name + ' to group: ' + data.groupId);
        if(userValidation(data.user)){
            dao.coordinate.create({name: data.name, x: data.x, z: data.z, y: data.y, groupId: data.groupId}, function(state, id){
                answer(state, id);
            });
        }

    });

    socket.on('editCoordinate', (data, answer) => {
        console.log('editing coordinate with name: ' + data.name);
        if(userValidation(data.user)){
            dao.coordinate.update({id: data.id, newName: data.name, newX: data.x, newY: data.y, newZ: data.z}, function(state){
                answer(state);
            });
        }

    });

    socket.on('deleteCoordinate', (data, answer) => {
        console.log('deleting coordinate with id: ' + data.id);
        if(userValidation(data.user)){
            dao.coordinate.delete({id: data.id}, function(state){
                answer(state);
            });
        }

    });
	socket.join('prueba');
	io.in('prueba').emit('kk', 'kk');
});

