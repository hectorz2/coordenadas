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
		'z-index': 100});
}

function register(){
	var nick = $('#nick').val();
	var pwd = $('#pwd').val();
	if(nick == '' || pwd == ''){
		swal({title: 'Debe rellenar todos los campos', type: 'error'});
	} else {
	$('#nick').val('');
	$('#pwd').val('');
		main.register(nick, pwd, function(state){
			var msg = state==0?'User Registered':state==1?'There was a problem with the database':'Nickname Already Registered';
			var type = state==0?'success':'error';
			swal({title: msg, type: type});
			loadDiv('login');
		});
	}
}

function login(){
	var nick = $('#nickL').val();
	var pwd = $('#pwdL').val();
	var remember = $('input[name=remember]:checked', '#loginForm').val();
	if(nick == '' || pwd == ''){
		swal({title: 'Debe rellenar todos los campos', type: 'error'});
	} else {
		$('#nickL').val('');
		$('#pwdL').val('');
		$('#remember').prop('checked', true);
		$('#notRemember').prop('checked', false);
		remember = remember==1?true:false;	
		main.login(nick, pwd, remember, function(state){
			var msg = state==0?'User Logged':state==1?'There was a problem with the database':'Nickname Doesnt Registered or Incorrect Password';
			var type = state==0?'success':'error';
			swal({title: msg, type: type});
			if(state == 0){
				userLogged = nick;
				$('.userName').html(userLogged);
				$('#logout').css('display', 'block');
				$('#worlds').off('click');
				$('#worlds').click(loadList);
				loadList();
			}
		});
	}
}

function logout(){
	main.logout(function(state){
		var msg = state==0?'Logout Done':'There was an error';	
		var type = 'success';
		if(state == 0){
			$('#logout').css('display', 'none');
			userLogged = null;
			$('#worlds').off('click');
			$('#worlds').click(function(){loadDiv('login')});
			loadDiv('main');
		} else {
			type = 'error';
		}
		//alert(msg);
		swal({title: msg, type: type});
	});
	
}

function loadList(){
	main.loadList(function(state, worlds){
		var msg = state==0?'Load Done':'There was an error';	
		var type = state==0?'success':'error';
		if(state == 0){
			//console.log(worlds);
			$('#worldList').html('');
			if(worlds.length > 0){
				
				//for(var i = 0; i < worlds.length; i += 1){
				$.each(worlds, function(index, world){
					console.log(JSON.stringify(world));
					var id = world.id;
					var $item = $('<div class="list-group-item"></div>');
					
					var $row = $('<div class="row"></div>');
					
					var $col1 = $('<div class="col-xs-6" style="margin: 3%;"></div>');
					var $nombre = $('<span>' + world.name + '</span>');
					$col1.append($nombre);
					
					var $col2 = $('<div class="col-xs-4" style="margin: 1%;"></div>');
					var $btn = $('<button class="btn"><span class="glyphicon glyphicon-arrow-right"></span></button>');
					$btn.click(function(){
						//swal('click!');
						main.selectWorld(id, function(state){
							swal(state);
						});
					});
					$col2.append($btn);
					
					$row.append($col1);
					$row.append($col2);
					
					$item.append($row);
					$('#worldList').append($item);
				});
					
				//}
			} else {
				$('#worldList').html('<h1>Ups... No hay ningún mundo todavía...</h1>');
			}
			loadDiv('list');
		} else
			swal({title: msg, type: type});
		
	});
	
}

