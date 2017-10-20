// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const {remote} = require('electron');
 
const main = remote.require('./main.js');

let worldName = '';

$(document).ready(function(){
	let name = main.getWorldName();
	worldName = name;

	$('#worldName').html(name);
	$('#close').click(function(){main.closeCoordinates();});
	$('#worldActions').click(openWorldActions);
    $('#inviteUserBtn').click(inviteUser);

	loadCoordinates();
});

function openWorldActions(){
    loadUsers();
    let $nickOfUser = $('#nickOfUser');
    $nickOfUser.val('');


    $('#worldActionsModal').modal('show');
}

function loadUsers(){
	main.getUsersInWorld(function(state, users){
        let msg = state===0?'Lista de usuarios buscada correctamente':state1Msg;
        let type = state===0?'success':'error';
        if(state == 0) {
            let $list = $('#usersList');
            $list.empty();
            for (let thisUser in users) {
                if (users.hasOwnProperty(thisUser)) {
                    let $item = `<div class="list-group-item">
                                <div class="row">
                                    <div class="col-xs-8">
                                        <h6>${users[thisUser].nick}</h6>
                                    </div>
                                    <div class="col-xs-1 ball" ${users[thisUser].connected ? 'style="background-color: green"' : ''}></div>
                                </div>`;
                    $list.append($item);
                }
            }
        } else {
            swal({title: msg, type: type});
        }
    });

	getPendingUsersInWorld();

}

function getPendingUsersInWorld(){
    main.getPendingUsersInWorld(function(state, users){
        let msg = state===0?'Lista de usuarios pendientes buscada correctamente':state1Msg;
        let type = state===0?'success':'error';
        if(state == 0) {
            let $list = $('#pendingUsersList');
            $list.empty();
            $.each(users, function(thisUser, user){
                if (users.hasOwnProperty(thisUser)) {
                    let $item = $('<div class="list-group-item"></div>');

                    let $name = $(`<h6>${user.nick}</h6>`);

                    let $removeBtn = $('<button class="btn btn-danger"><span class="glyphicon glyphicon-trash"></span></button>');

                    $removeBtn.click(function(){
                        confirmDialog(function(){
                            main.deleteInvitationToWorld(user.nick, function(state){
                                let msg = state===0?'Invitación cancelada correctamente':state1Msg;
                                let type = state===0?'success':'error';
                                $item.remove();
                                swal({title: msg, type: type});
                            });
                        }, 'El usuario perderá la invitación.');
                    });

                    $name.css({
                        transition: 'opacity 1s'
                    });

                    $item.append($name);
                    $item.append($removeBtn);
                    $list.append($item);
                    $removeBtn.hide();

                    $name.css('text-align', 'center');
                    $removeBtn.css('margin-left', '25px');

                    $item.hover(function(){
                       $name.hide();
                       $removeBtn.show();
                    }, function(){
                        $removeBtn.hide();
                        $name.show();
                    });
                }
            });
        } else {
            swal({title: msg, type: type});
        }
    });
}

function inviteUser(){
    let $nick = $('#nickOfUser');
    let nick = $nick.val();
    if(nick == '') {
        swal({title: 'El nick no puede estar vacío', type: 'error'});
    } else if (nick.split(' ').length > 1) {
        swal({title: 'El nick no puede contener espacios', type: 'error'});
    } else {
        main.inviteUserToWorld(nick, function(state) {
            let msg = state===0?'Usuario invitado correctamente'
                :state===1?state1Msg
                    :state===2?'El usuario no existe'
                        :'El usuario ya está en el mundo o ya está invitado';
            let type = state===0?'success':'error';
            $nick.val('');
            if(state === 0){
                getPendingUsersInWorld();
                swal({title: msg, type: type});
            } else {
                swal({title: msg, type: type});
            }

        });
    }
}

function loadCoordinates(){
    $('#coordinates').tabs();
	$('#tmp').css('display', 'none');
	$('#worldPanel').css('display', 'block');
}

