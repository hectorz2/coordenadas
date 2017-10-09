// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const {ipcRenderer, remote} = require('electron');
 
const main = remote.require('./main.js');

var userLogged = null;

$(document).ready(function(){
	//NAV BUTTONS
	$('#close').click(function(){main.quit();});
	$('#logout').click(logout);
	
	//MAIN BUTTONS
	userLogged = main.loggedUser();
	if(userLogged == null){
		$('#worlds').click(function(){loadDiv('login')});
		$('#logout').css('display', 'none');
	}
	else {
		$('.userName').html(userLogged);
		$('#worlds').click(loadList);
	}
	$('#configBtn').click(function(){loadDiv('config')});
	$('#helpBtn').click(function(){loadDiv('help')});
	
	$('#goToRegister').click(function(){loadDiv('register')});
	$('.back').click(function(){loadDiv('main')});
	$('#registerBtn').click(register);
	$('#loginBtn').click(login);
});

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
	$('#nick').val('');
	$('#pwd').val('');
	main.register(nick, pwd, function(msg){
		alert(msg);
		loadDiv('login');
	});
}

function login(){
	var nick = $('#nickL').val();
	var pwd = $('#pwdL').val();
	var remember = $('input[name=remember]:checked', '#loginForm').val();
	$('#nickL').val('');
	$('#pwdL').val('');
	$('#remember').prop('checked', true);
	$('#notRemember').prop('checked', false);
	remember = remember==1?true:false;	
	main.login(nick, pwd, remember, function(state){
		var msg = state==0?'User Logged':state==1?'There was a problem with the database':'Nickname Doesnt Registered or Incorrect Password';
		alert(msg);
		if(state == 0){
			userLogged = nick;
			$('.userName').html(userLogged);
			$('#logout').css('display', 'block');
			loadList();
		}
	});
}

function logout(){
	main.logout(function(state){
		var msg = state==0?'Logout Done':'There was an error';	
		if(state == 0){
			$('#logout').css('display', 'none');
			userLogged = null;
			$('#worlds').click(function(){loadDiv('login')});
			loadDiv('main');
		}
		alert(msg);
	});
	
}

function loadList(){
	main.loadList(function(state, worlds){
		var msg = state==0?'Load Done':'There was an error';	
		if(state == 0){
			console.log(worlds);
			$('#worldList').html('');
			for(var i = 0; i < worlds.length; i += 1){
				var $item = $('<div class="list-group-item"></div>');
				
				var $row = $('<div class="row"></div>');
				
				var $col1 = $('<div class="col-xs-8"></div>');
				var $nombre = $('<h3>' + worlds[i].name + '</h3>');
				$col1.append($nombre);
				
				var $col2 = $('<div class="col-xs-4"></div>');
				var $btn = $('<button class="btn"><span class="glyphicon glyphicon-arrow-right"></span></button>');
				$btn.click(function(){
					alert('click!');
				});
				$col2.append($btn);
				
				$row.append($col1);
				$row.append($col2);
				
				$item.append($row);
				$('#worldList').append($item);
			}
			loadDiv('list');
		}
		alert(msg);
		
	});
	
}