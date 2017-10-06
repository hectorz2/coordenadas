// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const {ipcRenderer, remote} = require('electron');
 
const main = remote.require('./main.js');

var userLogged = null;

$(document).ready(function(){
	$('#close').click(function(){main.quit();});
	//$('#worlds').click(loadWorlds);
	userLogged = main.loggedUser();
	if(userLogged == null)
		$('#worlds').click(function(){loadDiv('login')});
	else
		$('#worlds').click(function(){loadDiv('hola')});
	
	$('#goToRegister').click(function(){loadDiv('register')});
	$('.back').click(function(){loadDiv('main')});
	$('#registerBtn').click(register);
	$('#loginBtn').click(login);
	
	/*ipcRenderer.on('time', (event, timeString) => {  
		el.html('Server time: ' + timeString);
	});*/
	
	/*ipcRenderer.on('error', (event, error) => {  
		console.log(error);
		el.html('Server Down: ' + error.type);
	});*/	  
});

/*function loadWorlds(){
	main.loadWorlds();
}*/

function loadDiv(divId){
	$('.page').css({
		opacity: 0,
		'z-index': 0});
	$('#' + divId).css({
		opacity: 1,
		'z-index': 9999});
}

function register(){
	var nick = $('#nick').val();
	var pwd = $('#pwd').val();
	main.register(nick, pwd, function(msg){
		alert(msg);
	});
}

function login(){
	var nick = $('#nickL').val();
	var pwd = $('#pwdL').val();
	var remember = $('input[name=remember]:checked', '#loginForm').val();
	remember = remember==1?true:false;	
	main.login(nick, pwd, remember, function(state){
		var msg = state==0?'User Logged':state==1?'There was a problem with the database':'Nickname Doesnt Registered or Incorrect Password';
		alert(msg);
		if(state == 0)
			loadDiv('hola');
	});
}