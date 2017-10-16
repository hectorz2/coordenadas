const mysql = require('mysql');

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
			var sql = 'SELECT * FROM worlds WHERE id IN (SELECT world FROM user_world WHERE nick = ?) ORDER BY name';
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
			})
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
					world: result.insertId
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
		}
	}
};
