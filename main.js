const electron = require('electron');
// Module to control application life.
const app = electron.app;

const globalShortcut = electron.globalShortcut;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 430, height: 250});

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
	//Create global shortcuts
	globalShortcut.register('CommandOrControl+Shift+C', () => {
		console.log('CommandOrControl+Shift+C is pressed');
		loadWorlds();
	});
	createWindow();
});

// Quit when all windows are closed.
/*app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})*/

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const io = require('socket.io-client');
const socket = io.connect('http://localhost:3000', {reconnect: true});

socket.on('connect', function(){
	console.log('connected to websocket server');
});
	
socket.on('connect_error', function(error){
	console.log('Server down. ' + error);
	mainWindow.webContents.send('error', error); 
});
	
/*socket.on('time', function(timeString) {
	console.log('Server time: ' + timeString);
	mainWindow.webContents.send('time', timeString); 
});*/

exports.loadWorlds = function(){
	loadWorlds();
}

function loadWorlds(){
	console.log('loading worlds list');
	mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'boot.html'),
    protocol: 'file:',
    slashes: true
  })); 
  mainWindow.show();
}

exports.register = function(nick, pwd, answer){
	console.log('registering user ' + nick);
	socket.emit('register', {nick: nick, pwd: pwd}, (state) => {
		var msg = state==0?'User Registered':state==1?'There was a problem with the database':'Nickname Already Registered';
		answer(msg);
	});
	//socket.removeListener('registerBack');
	//socket.on('registerBack', function(data){console.log(data.state)});
}