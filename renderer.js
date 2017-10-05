// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const {ipcRenderer, remote} = require('electron');
 
const main = remote.require('./main.js');

$(document).ready(function(){
	//$('#worlds').click(loadWorlds);
	$('#worlds').click(function(){loadDiv('register')});
	$('#back').click(function(){loadDiv('main')});
	$('#registerBtn').click(register);
	
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