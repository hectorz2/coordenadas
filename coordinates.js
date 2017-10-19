// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const {remote} = require('electron');
 
const main = remote.require('./main.js');


$(document).ready(function(){
	let name = main.getWorldName();
	$('#worldName').html(name);
	$('#close').click(function(){main.closeCoordinates();});
	$('#worldActions').click(openWorldActions);
	loadCoordinates();
});

function openWorldActions(){
    loadUsers();
    $('#worldActionsModal').modal('show');
}

function loadUsers(){
	main.getUsersInWorld(function(state, users){
        let msg = state===0?'Lista de usuarios buscada correctamente':state1Msg;
        let type = state===0?'success':'error';
        if(state == 0) {
            alert(JSON.stringify(users));
            let $list = $('#usersList');
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

}

function loadCoordinates(){
    $('#coordinates').tabs();
	$('#tmp').css('display', 'none');
	$('#worldPanel').css('display', 'block');
}

