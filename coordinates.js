// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const {ipcRenderer, remote} = require('electron');
 
const main = remote.require('./main.js');


$(document).ready(function(){
	$('#close').click(function(){main.closeCoordinates();});
	swal('ey');
});

