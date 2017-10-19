// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const remote = require('electron');
 
const main = remote.require('./main.js');


$(document).ready(function(){
	$('#close').click(function(){main.closeCoordinates();});
	loadUsers();
	loadCoordinates();
});

function loadUsers(){
	let users = main.getConnectedUsersFirstTime();
	let $list = $('#usersList');
	for(let i = 0; i < users.length; i += 1){
		let $item = `<div class="list-group-item" id="user${users[i]}"><h6>${users[i]}<h6></div>`;
		$list.append($item);
	}
}

function loadCoordinates(){
    $('#coordinates').tabs();
	$('#tmp').css('display', 'none');
	$('#worldPanel').css('display', 'block');
}

