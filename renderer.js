// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const {ipcRenderer, remote} = require('electron');
 
const main = remote.require('./main.js');

var userLogged = null;

const state1Msg = 'Hubo uno o varios problemas, inténtalo de nuevo más tarde o contacta con el administrador a través del correo hector.zaragoza.arranz@gmail.com, ¡no muerdo!';

function confirmDialog(confirmFunction, text) {
	swal({
		title: '¿Está seguro de realizar esta operación?',
		text: text,
		type: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Sí, estoy seguro',
		cancelButtonText: 'No, sácame de aquí'
		}).then(confirmFunction);
}

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
	
	$('#addWorldBtn').click(addWorld);
	$('#saveWorldBtn').click(saveWorld);
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
			var msg = state==0?'Usuario Registrado Correctamente, ¡Corre, haz login!':state==1?state1Msg:'El nick ya existe, ¡Prueba otro!';
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
		swal({title: 'Debes rellenar todos los campos', type: 'error'});
	} else {
		$('#nickL').val('');
		$('#pwdL').val('');
		$('#remember').prop('checked', true);
		$('#notRemember').prop('checked', false);
		remember = remember==1?true:false;	
		main.login(nick, pwd, remember, function(state){
			var msg = state==0?'Login correcto, ¡Diviértete!':state==1?state1Msg:'El nick no existe o te has confundido de contraseña...';
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
		var msg = state==0?'Has hecho logout, te echaremos de menos...':state1Msg;	
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
		var msg = state==0?'Carga Completada':state1Msg;	
		var type = state==0?'success':'error';
		if(state == 0){
			//console.log(worlds);
			$('#worldList').html('');
			if(worlds.length > 0){
				
				//for(var i = 0; i < worlds.length; i += 1){
				$.each(worlds, function(index, world){
					console.log(JSON.stringify(world));
					var id = world.id;
					var $item = $('<div class="list-group-item" id="world' + id + '"></div>');
					
					var $row = $('<div class="row"></div>');
					
					var $col1 = $('<div class="col-xs-4" style="margin: 3%;"></div>');
					var $nombre = $('<span>' + world.name + '</span>');
					$col1.append($nombre);
					
					var $col2 = $('<div class="col-xs-2" style="margin: 1%;"></div>');
					var $btn = $('<button class="btn btn-info"><span class="glyphicon glyphicon-arrow-right"></span></button>');
					$btn.click(function(){
						main.selectWorld(id, function(state){
							if(state != 0)
								swal(state1Msg);
						});
					});
					$col2.append($btn);
					
					var $col3 = $('<div class="col-xs-2" style="margin: 1%;"></div>');
					var $btnLeave = $('<button class="btn btn-warning"><span class="glyphicon glyphicon-log-out"></span></button>');
					$btnLeave.click(function(){
						confirmDialog(function(){
							swal('click!');
						}, 'Perderás el acceso al mundo y si no queda nadie... ¡Los datos serán borrados!');
					});
					$col3.append($btnLeave);
					
					var $col4 = $('<div class="col-xs-2" style="margin: 1%;"></div>');
					var $btnRem = $('<button class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span></button>');
					$btnRem.click(function(){
						confirmDialog(function(){
							main.removeWorld(id, function(state){
							var msg = state==0?'El mundo ha sido borrado':state1Msg;
							var type = state==0?'success':'error';
							$('#world' + id).remove();
							
							swal({title: msg, type: type});
							
							});
						}, 'Borrarás todos los datos del mundo a los demás. Si solo deseas salir, ¡Utiliza el otro botón!');
						
					});
					$col4.append($btnRem);
					
					
					
					$row.append($col1);
					$row.append($col2);
					$row.append($col3);
					$row.append($col4);
					
					$item.append($row);
					$('#worldList').append($item);
				});
					
				//}
			} else {
				$('#worldList').html('<h1>Ups... No hay ningún mundo todavía... ¿Por qué no añades alguno?</h1>');
			}
			loadDiv('list');
		} else
			swal({title: msg, type: type});
		
	});
	
}

function addWorld(){
	$('#addWorldModal').modal('show');
}
function saveWorld(){
	if($('#name').val() == '')
		swal({title: 'Debe rellenar todos los campos', type: 'error'});
	else {
		var name = $('#name').val();
		$('#name').val('');
		main.saveWorld(name, function(state){
			var msg = state==0?'Mundo creado. ¡Puedes comenzar a guardar tus coordenadas!':state1Msg;
			var type = state==0?'success':'error';
			if(state == 0) {
				loadList();
				$('#addWorldModal').modal('hide');
			}
			swal({title: msg, type: type});
			
		});
	}
	
}

