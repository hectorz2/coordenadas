const mysql = require('mysql');

/*
var con = mysql.createConnection({
  /*host: 'localhost',
  user: 'root',
  password: '',
  database: 'coordenadas'*//*
  host: 'eu-cdbr-west-01.cleardb.com',
  user: 'b495f45466ac64',
  password: 'fce36c94',
  database: 'heroku_c08b20a02df2679'
});


con.connect(function(err) {
  if (err) console.error(err);
  console.log("Connected to mysql!");
});
con.on('error', function() {
	console.log("Error on mysql!");
	con.connect(function(err) {
		if(err) console.error(err);
		console.log("Connected to mysql!");
	});

});
*/
const db_config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'coordenadas'
  /*host: 'eu-cdbr-west-01.cleardb.com',
  user: 'b495f45466ac64',
  password: 'fce36c94',
  database: 'heroku_c08b20a02df2679'*/
};

let con;

function handleDisconnect() {
	con = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

	con.connect(function(err) {              // The server is either down
		if(err) {                                     // or restarting (takes a while sometimes).
			console.log('error when connecting to db:', err);
			setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
		}                                     // to avoid a hot loop, and to allow our node script to
	});                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
	con.on('error', function(err) {
		console.log('db error');
		if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
			handleDisconnect();                         // lost due to either server restart, or a
		} else {                                      // connnection idle timeout (the wait_timeout
			throw err;                                  // server variable configures this)
		}
	});
}

handleDisconnect();

module.exports = {
    user: {

        register: function(user, answer){
			let sqlCheck = 'SELECT * FROM users WHERE nick = ?';
			con.query(sqlCheck, [user.nick], function(err, result){
				console.log(result);
				if (err) {
					console.error(err);
					answer(1);
				} else if(result.length !== 0){
					console.log('the nickname already exists');
					answer(2);
				} else {
					let sql = 'INSERT INTO users SET ?';
					let values = {
						nick: user.nick,
						password: user.pwd
					};
					con.query(sql, values, function(err){
						if (err) {
							console.error(err);
							answer(1);
						} else {
							console.log('user registered');
							answer(0);
						}
					});
				}
			});
			
		},

         login: function(user, callback){
			let sql = 'SELECT * FROM users WHERE nick = ? and password = ?';
			con.query(sql, [user.nick, user.pwd], function(err, result){
				console.log(result);
				if (err) {
					console.error(err);
					callback(1);
				} else if(result.length === 0){
					console.log('the user doesn`t exists');
					callback(2);
				} else {
					callback(0);
				}
			});
         },

        checkForInvitations: function(user, callback){
          let sql = 'SELECT * FROM worlds WHERE id IN (SELECT world FROM user_world WHERE nick = ? AND accepted = 0) ORDER BY name';
          con.query(sql, [user.nick], function(err, result){
              if (err) {
                  console.error(err);
                  callback(1);
              } else {
                  callback(0, result.length===0?null:result);
              }
          });
        },

        acceptInvitation: function(data, callback){
          let sql = 'UPDATE user_world SET accepted = 1 WHERE world = ? AND nick = ?';
          con.query(sql, [data.worldId, data.nick], function(err){
              if (err) {
                  console.error(err);
                  callback(1);
              } else {
                  callback(0);
              }
          });
        },

        denyInvitation: function(data, callback){
          let sql = 'DELETE FROM user_world WHERE world = ? AND nick = ?';
          con.query(sql, [data.worldId, data.nick], function(err){
              if (err) {
                  console.error(err);
                  callback(1);
              } else {
                  callback(0);
              }
          });
        },
    },
	world: {
		list: function(nick, callback){
			let sql = 'SELECT * FROM worlds WHERE id IN (SELECT world FROM user_world WHERE nick = ? AND accepted = 1) ORDER BY name';
			con.query(sql, [nick], function(err, result){
				if(err){
					console.log(err);
					callback(1, null);
				} else {
					callback(0, result);
				}
			});
		},

		delete: function(id, callback){
			let sql = 'DELETE FROM user_world WHERE world = ?';
			con.query(sql, [id], function(err){
				if(err){
					console.error(err);
					callback(1);
				} else {
					console.log('relations deleted');
                    let sql = 'DELETE FROM coordinates WHERE group_id IN (SELECT id FROM groups WHERE world = ?)';
                    con.query(sql, [id], function(err){
                        if(err){
                            console.error(err);
                            callback(1);
                        } else {
                            console.log('coordinates of world deleted');
                            let sql = 'DELETE FROM groups WHERE world = ?';
                            con.query(sql, [id], function(err){
                                if(err){
                                    console.error(err);
                                    callback(1);
                                } else {
                                    console.log('groups of world deleted');
                                    let sql = 'DELETE FROM worlds WHERE id = ?';
                                    con.query(sql, [id], function(err){
                                        if(err){
                                            console.error(err);
                                            callback(1);
                                        } else {
                                            console.log('world deleted');
                                            callback(0);
                                        }
                                    });
                                }
                            });
                        }
                    });

				}
			});
		},

		create: function(data, callback){
			let sql = 'INSERT INTO worlds SET ?';
			let values = {
				name: data.name
			};
			con.query(sql, values, function(err, result){
			if (err) {
				console.error(err);
				callback(1);
			} else {
				console.log('world created with id: ' + result.insertId);
				let sql = 'INSERT INTO user_world SET ?';
				let values = {
					nick: data.user.nick,
					world: result.insertId,
					accepted: true
				};
				con.query(sql, values, function(err){
					if (err) {
						console.error(err);
						callback(1);
					} else {
						console.log('relation created');
                        module.exports.group.create({name: data.name, worldId: result.insertId}, function(state){
                            callback(state);
                        });
					}
				});

			}
			});
		},

		leave: function(data, callback){
			let sql = 'DELETE FROM user_world WHERE world = ? AND nick = ?';
			con.query(sql, [data.id, data.user.nick], function(err){
				if(err){
					console.error(err);
					callback(1);
				} else {
					console.log('relation deleted');
					let sql = 'SELECT * FROM user_world where world = ?';
					con.query(sql, [data.id], function(err, result){
						if(err){
							console.error(err);
							callback(1);
						} else {
							if(result.length === 0){
								console.log('the world is empty of users, deleting');
								module.exports.world.delete(data.id, function(state){
									console.log('delete state: ' + state);
									let stateChanged = state===0?-1:state;
									console.log('changed state to: ' + stateChanged);
									callback(stateChanged);
								});
							} else {
								callback(0);
							}
						}
					});
				}
			});
		},

		usersInWorld: function(id, callback) {
			let sql = 'SELECT nick FROM user_world WHERE world = ? AND accepted = 1';
			con.query(sql, [id], function(err, result){
				if(err){
					console.error(err);
					callback(1, null);
				} else {
					callback(0, result);
				}
			});
		},

        pendingUsersInWorld: function(id, callback) {
		    let sql = 'SELECT nick FROM user_world WHERE world = ? AND accepted = 0';
            con.query(sql, [id], function(err, result){
                if(err){
                    console.error(err);
                    callback(1, null);
                } else {
                    callback(0, result);
                }
            });
        },

        inviteUserToWorld: function(data, callback) {
		    let sql = 'SELECT * FROM users WHERE nick = ?';
		    con.query(sql, [data.nick], function(err, result) {
		        if(err) {
                    console.error(err);
                    callback(1);
                } else if(result.length === 1){
		        	let sql = 'SELECT * FROM user_world WHERE nick = ? AND world = ?';
                    con.query(sql, [data.nick, data.worldId], function(err, result) {
                        if(err) {
                            callback(1);
                        } else if (result.length === 1) {
                            callback(3);
                        } else {
                            let sql = 'INSERT INTO user_world SET ?';
                            let values = {
                                nick: data.nick,
                                world: data.worldId,
                                accepted: 0
                            };
                            con.query(sql, values, function (err) {
                                if (err) {
                                    console.error(err);
                                    callback(1);
                                } else {
                                    callback(0);
                                }
                            });
                        }
                    });
                } else {
                    callback(2);
                }
            });
        },
        deleteInvitationToWorld: function(data, callback){
            let sql = 'DELETE FROM user_world WHERE world = ? AND nick = ?';
            con.query(sql, [data.worldId, data.nick], function(err){
                if(err){
                    callback(1);
                } else {
                    callback(0);
                }
            });
        },

        update: function(data, callback) {
            let sql = 'UPDATE worlds SET name = ? WHERE id = ?';
            con.query(sql, [data.newName, data.id], function(err){
                if (err) {
                    console.error(err);
                    callback(1);
                } else {
                    callback(0);
                }
            });
        },
	},
    group: {
        create: function(data, callback) {
            let sql = 'INSERT INTO groups SET ?';
            let values = {
                name: data.name,
                world: data.worldId
            };
            con.query(sql, values, function(err, result){
                if (err) {
                    console.error(err);
                    callback(1, null);
                } else {
                    console.log('group created');
                    callback(0, result.insertId);
                }
            });
        },
        getAllByWorld: function(data, callback) {
            let sql = 'SELECT * FROM groups WHERE world = ? ORDER BY name';
            con.query(sql, [data.worldId], function(err, result) {
                if (err) {
                    console.error(err);
                    callback(1, null);
                } else {
                    callback(0, result);
                }
            });
        },
        update: function(data, callback) {
            let sql = 'UPDATE groups SET name = ? WHERE id = ?';
            con.query(sql, [data.newName, data.groupId], function(err){
                if (err) {
                    console.error(err);
                    callback(1);
                } else {
                    callback(0);
                }
            });
        },
        delete: function(data, callback) {
            let sql = 'DELETE FROM coordinates WHERE group_id = ?';
            con.query(sql, [data.id], function(err){
                if(err){
                    console.error(err);
                    callback(1);
                } else {
                    console.log('coordinates deleted');
                    let sql = 'DELETE FROM groups WHERE id = ?';
                    con.query(sql, [data.id], function(err){
                        if(err){
                            console.error(err);
                            callback(1);
                        } else {
                            console.log('group deleted');
                            callback(0);
                        }
                    });
                }
            });
        }
    },
    coordinate: {
        create: function(data, callback) {
            let sql = 'INSERT INTO coordinates SET ?';
            let values = {
                name: data.name,
                x: data.x,
                z: data.z,
                y: data.y,
                group_id: data.groupId
            };
            con.query(sql, values, function(err, result){
                if (err) {
                    console.error(err);
                    callback(1, null);
                } else {
                    console.log('coordinate created');
                    callback(0, result.insertId);
                }
            });
        },
        getAllByGroup: function(data, callback) {
            let sql = 'SELECT * FROM coordinates WHERE group_id = ? ORDER BY name';
            con.query(sql, [data.groupId], function(err, result) {
                if (err) {
                    console.error(err);
                    callback(1, null);
                } else {
                    callback(0, result);
                }
            });
        },
        update: function(data, callback) {
            let sql = 'UPDATE coordinates SET name = ?, x = ?, z = ?, y = ? WHERE id = ?';
            con.query(sql, [data.newName, data.newX, data.newZ, data.newY, data.id], function(err){
                if (err) {
                    console.error(err);
                    callback(1);
                } else {
                    callback(0);
                }
            });
        },
        delete: function(data, callback) {
            let sql = 'DELETE FROM coordinates WHERE id = ?';
            con.query(sql, [data.id], function(err){
                if(err){
                    console.error(err);
                    callback(1);
                } else {
                    console.log('coordinate deleted');
                    callback(0);
                }
            });
        }
    }
};
