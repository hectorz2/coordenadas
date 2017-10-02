// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const {ipcRenderer, remote} = require('electron');
 
const main = remote.require('./main.js');

$(document).ready(function(){
	var el = $('#server-time');
    
	$('#worlds').click(loadWorlds);
	
	ipcRenderer.on('time', (event, timeString) => {  
		el.html('Server time: ' + timeString);
	});
	
	ipcRenderer.on('error', (event, error) => {  
		console.log(error);
		el.html('Server Down: ' + error.type);
	});	  
});

function loadWorlds(){
	main.loadWorlds();
}