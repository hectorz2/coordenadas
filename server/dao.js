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
			
		}
	}
};
