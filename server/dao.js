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
var db_config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'coordenadas'
  /*host: 'eu-cdbr-west-01.cleardb.com',
  user: 'b495f45466ac64',
  password: 'fce36c94',
  database: 'heroku_c08b20a02df2679'*/
};

var con;

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
			var sqlCheck = 'SELECT * FROM users WHERE nick = ?'
			con.query(sqlCheck, [user.nick], function(err, result){
				console.log(result);
				if (err) {
					console.error(err);
					answer(1);
				} else if(result.length != 0){
					console.log('the nickname already exists');
					answer(2);
				} else {
					var sql = 'INSERT INTO users SET ?';
					var values = {
						nick: user.nick,
						password: user.pwd
					};
					con.query(sql, values, function(err, result){
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
			var sql = 'SELECT * FROM users WHERE nick = ? and password = ?';
			con.query(sql, [user.nick, user.pwd], function(err, result){
				console.log(result);
				if (err) {
					console.error(err);
					callback(1);
				} else if(result.length == 0){
					console.log('the user doesn`t exists');
					callback(2);
				} else {
					callback(0);
				}
			});
		}
	},
	world: {
		list: function(nick, callback){
			var sql = 'SELECT * FROM worlds WHERE id IN (SELECT world FROM user_world WHERE nick = ? AND accepted = 1) ORDER BY name';
			con.query(sql, [nick], function(err, result){
				if(err){
					console.log(err);
					callback(1, null);
				} else {
					callback(0, result);
				}
			});
		},
		
		delete: function(id, callback){ //TODO tendrá que borrar tabs y coordenadas
			var sql = 'DELETE FROM user_world WHERE world = ?';
			con.query(sql, [id], function(err, result){
				if(err){
					console.error(err);
					callback(1);
				} else {
					console.log('relations deleted');
					var sql = 'DELETE FROM worlds WHERE id = ?';
					con.query(sql, [id], function(err, result){
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
		}, 
		
		create: function(data, callback){
			var sql = 'INSERT INTO worlds SET ?';
			var values = {
				name: data.name
			};
			con.query(sql, values, function(err, result){ 
			if (err) {
				console.error(err);
				callback(1);
			} else {
				console.log('world created with id: ' + result.insertId);
				var sql = 'INSERT INTO user_world SET ?';
				var values = {
					nick: data.user.nick,
					world: result.insertId,
					accepted: true
				}
				con.query(sql, values, function(err, result){
					if (err) {
						console.error(err);
						callback(1);
					} else {
						console.log('relation created');
						callback(0);
					}
				});
				
			}
			});
		},
		
		leave: function(data, callback){
			var sql = 'DELETE FROM user_world WHERE world = ? AND nick = ?';
			con.query(sql, [data.id, data.user.nick], function(err, result){
				if(err){
					console.error(err);
					callback(1);
				} else {
					console.log('relation deleted');
					var sql = 'SELECT * FROM user_world where world = ?';
					con.query(sql, [data.id], function(err, result){
						if(err){
							console.error(err);
							callback(1);
						} else {
							if(result.length == 0){
								console.log('the world is empty of users, deleting');
								module.exports.world.delete(data.id, function(state){
									console.log('delete state: ' + state);
									var stateChanged = state==0?-1:state;
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
		}
	}
};
