// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.



const remote = require('electron').remote;
 
const main = remote.require('./main.js');

const renderHelper =  require('./js/renderHelper');

let userLogged = null;


let reloadWorldListOnModalClose = false;
/*function receiveConnectionState(state) {
	if(state)
		connectedToWebsocket;
	else
		disconnectedFromWebsocket
}		*/
let connected = null;

let texts = main.getTexts('main');

function disconnectedFromWebsocket() {
	if(connected || connected == null){
		connected = false;
		swal(texts['disconnection'].disconnectionAdvice);
		$('#connectionModal').modal({
			backdrop: 'static',
			keyboard: false
		}).modal('show');
	}
}

function connectedToWebsocket() {
	if(!connected || connected == null){
		connected = true;
		$('#connectionModal').modal('hide');
		swal(texts['disconnection'].connectionAdvice);
		if(userLogged != null && main.loggedUser() == null){
			userLogged = null;
			loadDiv('login');
			let $worlds = $('#worlds');
			$worlds.off('click');
			$worlds.click(function(){loadDiv('login')});
			$('#logout').css('display', 'none');
			swal(texts['disconnection'].loginAgainError);
		}
	}
}

$(document).ready(function(){

    main.receiveConnectionStateFunction(function(state) {
		if(state)
			connectedToWebsocket();
		else
			disconnectedFromWebsocket();
	});
	if(!main.isConnected()){
		disconnectedFromWebsocket();
	}
	
	
	//NAV BUTTONS
	$('#close').click(function(){main.quit();});
	let $logout = $('#logout');
	$logout.click(logout);
	
	//MAIN BUTTONS
    let $worlds = $('#worlds');
	userLogged = main.loggedUser();
	if(userLogged == null){
		$worlds.click(function(){loadDiv('login')});
		$logout.css('display', 'none');
	} else {
		$('.userName').html(userLogged);
		$worlds.click(loadList);
		//checkForInvitations();
	}
	$('#configBtn').click(loadConfig);
	$('#helpBtn').click(function(){loadDiv('help')});
	
	$('#goToRegister').click(function(){loadDiv('register')});
	$('.back').click(function(){loadDiv('main')});
	$('#registerBtn').click(register);
	$('#loginBtn').click(login);
	
	$('#addWorldBtn').click(addWorld);
	$('#saveWorldBtn').click(saveWorld);

    $('#invitationsModal').on('hidden.bs.modal', function () {
        if(reloadWorldListOnModalClose)
            loadList();
    });

    renderHelper.renderTexts('main');
});

function loadConfig(){
    let $languaje = $('#languajeSelect');
    $languaje.val(main.getLanguaje());
    $languaje.change(function(){
        let languaje = $languaje.val();
        confirmDialog(function(){
            main.changeLanguaje(languaje);
        }, texts['settings'].languajeChangeAdvice);
    });
    loadDiv('config');
}

function checkForInvitations(){
	main.checkForInvitations(function(state, invitations){
        let msg = state === 0 ? 'Invitations load well' : state1Msg;
        let type = state === 0 ? 'success' : 'error';

	    if(state === 0) {
            if (invitations != null) {
                reloadWorldListOnModalClose = false;
                let $invitationsModal = $('#invitationsModal');
                let $list = $('#invitationsList');
                $list.empty();
                $.each(invitations, function (index, invitation) {
                    let $item = $(`<div class="list-group-item" id="${invitation.id}invitation"></div>`);

                    let $row = $('<div class="row"></div>');
                    let $worldName = $(`<div class="col-xs-4">${invitation.name}</div>`);

                    let $acceptCol = $(`<div class="col-xs-2"></div>`);
                    let $acceptBtn = $('<button class="btn btn-success"><span class="glyphicon glyphicon-ok-circle"></span></button>');
                    $acceptBtn.click(function () {
                        main.acceptInvitation(invitation.id, function (state) {
                            let msg = state === 0 ? texts['worldList'].invitationsAcceptDone : state1Msg;
                            let type = state === 0 ? 'success' : 'error';
                            swal({title: msg, type: type});
                            if (state === 0) {
                                reloadWorldListOnModalClose = true;
                                $(`#${invitation.id}invitation`).remove();
                                if($list.children().length === 0){
                                    $invitationsModal.modal('hide');
                                }
                            }
                        });
                    });
                    $acceptCol.append($acceptBtn);

                    let $denyCol = $(`<div class="col-xs-2"></div>`);
                    let $denyBtn = $('<button class="btn btn-danger"><span class="glyphicon glyphicon-remove-circle"></span></button>');
                    $denyBtn.click(function () {
                        main.denyInvitation(invitation.id, function (state) {
                            let msg = state === 0 ? texts['worldList'].invitationsDenyDone : state1Msg;
                            let type = state === 0 ? 'success' : 'error';
                            swal({title: msg, type: type});
                            if (state === 0) {
                                $(`#${invitation.id}invitation`).remove();
                                if($list.children().length === 0){
                                    $invitationsModal.modal('hide');
                                }
                            }
                        });
                    });
                    $denyCol.append($denyBtn);

                    $row.append($worldName);
                    $row.append($acceptCol);
                    $row.append($denyCol);
                    $item.append($row);
                    $list.append($item);
                });
                $invitationsModal.modal('show');
            }
        } else {
            swal({title: msg, type: type});
        }
	});
}

function loadDiv(divId){
	$('.page').css({
		opacity: 0,
		'z-index': 0});
	$('#' + divId).css({
		opacity: 1,
		'z-index': 100});
}

function register(){
    let $nick = $('#nick');
    let $pwd = $('#pwd');
	let nick = $nick.val();
	let pwd = $pwd.val();
	if(nick === '' || pwd === ''){
		swal({title: texts['register'].fillFieldsError, type: 'error'});
	} else if(nick.split(' ').length > 1) {
        swal({title: texts['register'].nickHasSpacesError, type: 'error'});
    } else {
            $nick.val('');
            $pwd.val('');
            main.register(nick, pwd, function(state){
                let msg = state===0 ? texts['register'].registerDone
                    :state===1 ? state1Msg : texts['register'].nickAlreadyExistsError;
                let type = state===0 ? 'success' : 'error';
                swal({title: msg, type: type});
                if(state == 0)
                	loadDiv('login');
            });
    }
}

function login(){
    //alert(state1Msg);
    let $nick = $('#nickL');
    let $pwd = $('#pwdL');
	let nick = $nick.val();
	let pwd = $pwd.val();
	let remember = parseInt($('input[name=remember]:checked', '#loginForm').val());
	if(nick === '' || pwd === ''){
		swal({title: texts['login'].fillFieldsError, type: 'error'});
	} else {
		$nick.val('');
		$pwd.val('');
		$('#remember').prop('checked', true);
		$('#notRemember').prop('checked', false);
		remember = remember===1;
		main.login(nick, pwd, remember, function(state){

            let msg = state===0 ? texts['login'].loginDone
                : state===1 ? state1Msg : texts['login'].wrongUserOrPasswordError;
			let type = state===0 ? 'success' : 'error';
			swal({title: msg, type: type});
			if(state === 0){
				userLogged = nick;
				$('.userName').html(userLogged);
				$('#logout').css('display', 'block');
				let $worlds = $('#worlds');
				$worlds.off('click');
				$worlds.click(loadList);
				loadList();
			}
		});
	}
}

function logout(){
	main.logout(function(state){
		let msg = state===0 ? texts['logout'].logoutDone : state1Msg;
		let type = state===0 ? 'success' : 'error';
		if(state === 0){
			$('#logout').css('display', 'none');
			userLogged = null;
            let $worlds = $('#worlds');
			$worlds.off('click');
			$worlds.click(function(){loadDiv('login')});
			loadDiv('main');
		} else {
			type = 'error';
		}
		swal({title: msg, type: type});
	});
	
}

function loadList(){
	main.loadList(function(state, worlds){
		let msg = state===0 ? 'Load completed' : state1Msg;
		let type = state===0 ? 'success' : 'error';
        let $worldList = $('#worldList');
        if(state === 0){
			//console.log(worlds);
			$worldList.empty();
			if(worlds.length > 0){
				
				//for(var i = 0; i < worlds.length; i += 1){
				$.each(worlds, function(index, world){
					//console.log(JSON.stringify(world));
					let id = world.id;
					let $item = $('<div class="list-group-item" id="world' + id + '"></div>');
					
					let $row = $('<div class="row"></div>');
					
					let $col1 = $('<div class="col-xs-4" style="margin: 3%;"></div>');
					let $nombre = $('<span>' + world.name + '</span>');
					$col1.append($nombre);
					
					let $col2 = $('<div class="col-xs-2" style="margin: 1%;"></div>');
					let $btn = $('<button class="btn btn-info"><span class="glyphicon glyphicon-arrow-right"></span></button>');
					$btn.click(function(){
						main.selectWorld(id, world.name, function(state){
							if(state !== 0)
								swal(state1Msg);
						});
					});
					$col2.append($btn);
					
					let $col3 = $('<div class="col-xs-2" style="margin: 1%;"></div>');
					let $btnLeave = $('<button class="btn btn-warning"><span class="glyphicon glyphicon-log-out"></span></button>');
					$btnLeave.click(function(){
						confirmDialog(function(){
							main.leaveWorld(id, function(state){
								let msg = state===0 ? texts['worldList'].leaveWorldDone :
                                    state===-1 ? texts['worldList'].leaveWorldAndDeletedDone : state1Msg;
								let type = state!==1 ? 'success' : 'error';
								$('#world' + id).remove();
								swal({title: msg, type: type});
							});
						}, texts['worldList'].leaveWorldAdvice);
					});
					$col3.append($btnLeave);
					
					let $col4 = $('<div class="col-xs-2" style="margin: 1%;"></div>');
					let $btnRem = $('<button class="btn btn-danger"><span class="glyphicon glyphicon-trash"></span></button>');
					$btnRem.click(function(){
						confirmDialog(function(){
							main.removeWorld(id, function(state){
							let msg = state===0 ? texts['worldList'].deleteWorldDone : state1Msg;
							let type = state===0 ? 'success' : 'error';
							$('#world' + id).remove();
							
							swal({title: msg, type: type});
							
							});
						}, texts['worldList'].deleteWorldAdvice);
						
					});
					$col4.append($btnRem);
					
					
					
					$row.append($col1);
					$row.append($col2);
					$row.append($col3);
					$row.append($col4);
					
					$item.append($row);
					$worldList.append($item);
				});
					
				//}
			} else {
				$worldList.html(`<h1>${texts['worldList'].noWorldsYet}</h1>`);
			}
			loadDiv('list');
			checkForInvitations();
		} else
			swal({title: msg, type: type});
		
	});
	
}

function addWorld(){
	$('#addWorldModal').modal('show');
}
function saveWorld(){
    let $name = $('#name');
	if($name.val() === '')
		swal({title: 'Debe rellenar todos los campos', type: 'error'});
	else {
		let name = $name.val();
		$name.val('');
		main.saveWorld(name, function(state){
			let msg = state===0 ? texts['worldList'].createWorldDone : state1Msg;
			let type = state===0 ? 'success' : 'error';
			if(state === 0) {
				loadList();
				$('#addWorldModal').modal('hide');
			}
			swal({title: msg, type: type});
			
		});
	}
	
}
