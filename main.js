const electron = require('electron');
// Module to control application life.
const app = electron.app;

const globalShortcut = electron.globalShortcut;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

const settings = require('electron-settings');

const io = require('socket.io-client');
const socket = io.connect('http://localhost:3000', {reconnect: true});
/*const socket = io.connect('https://mc-coordhelper-server.herokuapp.com/',
    {reconnect: true, transports : ['websocket'], path: '/socket.io'});*/

const allowedLangs = [
    'es',
    'en'
];

let texts = null;

let userLogged = {};
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let coordinatesWindow = null;

let userLanguaje = null;

let connected = false;

let sendConnectionState = '';
let forceReloadList = '';
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 430, height: 500/*250*/, frame: false, icon: './img/icon.png'});

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
      if(coordinatesWindow != null)
	    coordinatesWindow.close();
    mainWindow = null;
	
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
	//Create global shortcuts
	// noinspection JSCheckFunctionSignatures
    globalShortcut.register('CommandOrControl+Shift+C', () => {
		console.log('CommandOrControl+Shift+C is pressed');
	});

	// noinspection JSCheckFunctionSignatures
    globalShortcut.register('CommandOrControl+Shift+R', () => {
		console.log('CommandOrControl+Shift+R is pressed');
		
		mainWindow.reload();
	});

    if(settings.has('userLanguaje')){
        console.log('Languaje is defined');
        userLanguaje = settings.get('userLanguaje');
    } else {
        console.log('Languaje is not defined');
        userLanguaje = app.getLocale();
        if(allowedLangs.indexOf(userLanguaje) === -1) {
            userLanguaje = 'en';
            console.log('Languaje isnt allowed, configuring english');
        }

        settings.set('userLanguaje', userLanguaje);
        console.log('Languaje saved');
    }


    loadTexts();

	createWindow();
});

function loadTexts(){
    console.log('loading texts for languaje: ' + userLanguaje);
    const loadJsonFile = require('load-json-file');

    texts = loadJsonFile.sync(`./langs/${userLanguaje}.json`)
    //console.log(texts);
    //=> {foo: true}
}

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
  if (mainWindow == null) {
    createWindow();
  }
});

app.on('before-quit', function(){
    if(!(Object.keys(userLogged).length === 0 && userLogged.constructor === Object))
	    socket.emit('quit', {nick: userLogged.nick});
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.



socket.on('connect', function(){
	console.log('connected to websocket server');
	if(settings.has('userRemembered')){
		userLogged.nick = settings.get('userRemembered');
		if(settings.has('keyRemembered')){
			userLogged.key = settings.get('keyRemembered');
		}
	}
	connected = true;
	//if(userLogged !== {}) {
    if(!(Object.keys(userLogged).length === 0 && userLogged.constructor === Object)){
        console.log('user: ' + userLogged.nick + ' was renember, checking state...');
        socket.emit('getLoginState', userLogged, (state) => {
            console.log('server state of login: ' + state);
            if (!state) userLogged = {};
            if (sendConnectionState !== '')
                sendConnectionState(connected);
        });
    }
	else 
		if(sendConnectionState !== '')
			sendConnectionState(connected);
});
	
socket.on('connect_error', function(error){
	console.log('Server down. ' + error);
	connected = false;
	//mainWindow.webContents.send('error', error); 
	userLogged = {};

	if(sendConnectionState !== '')
		sendConnectionState(connected);
	
	if(coordinatesWindow != null)
		coordinatesWindow.close();

});

exports.getLanguaje = function() {
    return userLanguaje;
};

exports.changeLanguaje = function(newLang) {
    userLanguaje = newLang;
    settings.set('userLanguaje', userLanguaje);
    loadTexts();
    restartApp();
};

function restartApp(){
    if(coordinatesWindow != null){
        coordinatesWindow.close();
    }
    mainWindow.reload();
}

exports.getTexts = function(window = null) {
    return window==null?texts:texts[window];
};

exports.receiveConnectionStateFunction = function(method){
	sendConnectionState = method;
};

exports.connectionState = function(){
	if(sendConnectionState !== '')
		sendConnectionState(connected);
};

exports.isConnected = function() {
	return connected;
};

exports.quit = function(){
	app.quit();
};

exports.register = function(nick, pwd, answer){
	console.log('registering user ' + nick);
	socket.emit('register', {nick: nick, pwd: pwd}, (state) => {
		answer(state);
	});
};


exports.login = function(nick, pwd, remember, answer){
	console.log('loging user ' + nick + ' remember: ' + remember);
	socket.emit('login', {nick: nick, pwd: pwd, remember: remember}, (state, key) => {
		if(state === 0){
			userLogged = {
				nick: nick,
				key: key,
				world: null
			};
			if(remember) {
				settings.set('userRemembered', nick);
				settings.set('keyRemembered', key);
			}
		}
		answer(state);
	});
};

exports.loggedUser = function(){
	return (Object.keys(userLogged).length === 0 && userLogged.constructor === Object)?null:userLogged.nick;
};

exports.logout = function(answer){
	settings.delete('userRemembered');
	settings.delete('keyRemembered');
	socket.emit('logout', userLogged, (state) => {
		userLogged = {};
		answer(state);
	});
};

exports.loadList = function(answer){
	socket.emit('worldList', userLogged, function(state, worlds){
		answer(state, worlds);
	});
};

exports.checkForInvitations = function(answer){
    socket.emit('checkForInvitations', userLogged, function(state, invitations){
        answer(state, invitations);
    });
};

exports.acceptInvitation = function(worldId, answer){
    socket.emit('acceptInvitation', {user: userLogged, worldId: worldId}, function(state, invitations){
        answer(state, invitations);
    });
};

exports.denyInvitation = function(worldId, answer){
    socket.emit('denyInvitation', {user: userLogged, worldId: worldId}, function(state, invitations){
        answer(state, invitations);
    });
};

//TODO borrar
socket.on('kk', function(msg){
	console.log('pruebee msg: ' + msg);
});
let worldName = '';
exports.selectWorld = function(worldId, selectedWorldName, answer){
	console.log('selecting world: ' + worldId);
	userLogged.worldId = worldId;
	socket.emit('selectWorld', userLogged, function(state){
		answer(state);
		if(coordinatesWindow != null){
			coordinatesWindow.close();
		}

		worldName = selectedWorldName;
		coordinatesWindow = new BrowserWindow({width: 600, height: 800, frame: false});

		coordinatesWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'coordinates.html'),
		protocol: 'file:',
		slashes: true
		}));

		// Open the DevTools.
		// coordinatesWindow.webContents.openDevTools()

		// Emitted when the window is closed.
		coordinatesWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
			console.log('closing coordinates window...');
			coordinatesWindow = null;
			
			socket.emit('leaveWorld', userLogged, function(state){
				coordinatesWindow = null;
				userLogged.worldId = null;
				console.log('world leaved with state: ' + state);
			});
		});
	});
};

exports.getWorldName = function() {
    return worldName;
};

exports.getUsersInWorld = function(answer){
    socket.emit('usersInWorld', userLogged, function(state, users){
        answer(state, users);
    });
};

exports.getPendingUsersInWorld = function(answer){
    socket.emit('pendingUsersInWorld', userLogged, function(state, users){
        answer(state, users);
    });
};

exports.inviteUserToWorld = function(nick, answer) {
    socket.emit('inviteUserToWorld', {user: userLogged, nick: nick}, function(state){
        answer(state);
    });
};

exports.deleteInvitationToWorld = function(nick, answer) {
    socket.emit('deleteInvitationToWorld', {user: userLogged, nick: nick}, function(state){
        answer(state);
    });
};

exports.removeWorld = function(worldId, answer){
	console.log('removing world: ' + worldId);
	
	socket.emit('removeWorld', {user: userLogged, id: worldId}, function(state){
		answer(state);
		console.log('world removed');
	});
	
};

exports.saveWorld = function(name, answer){
	console.log('adding world with name: ' + name);
	
	socket.emit('createWorld', {user: userLogged, name: name}, function(state){
		answer(state);
		console.log('world created');
	});
};

exports.receiveForceReloadListFunction = function(method){
    forceReloadList = method;
};

exports.editWorld = function(name, answer){
    console.log('editing world with name: ' + name);

    socket.emit('editWorld', {user: userLogged, name: name, id: userLogged.worldId}, function(state){
        if(state === 0){
            if(forceReloadList !== '')
                forceReloadList();
        }
        answer(state);
        console.log('world updated');
    });
};

exports.closeCoordinates = function(){
	coordinatesWindow.close();
};

exports.leaveWorld = function(id, answer){
	console.log('leaving world for ever...');
	socket.emit('leaveWorldForEver', {user: userLogged, id: id}, function(state){
		coordinatesWindow = null;
		answer(state);
		console.log('world leaved with state: ' + state);
	});
};

exports.loadCoordinates = function(answer){
    console.log('loading coordinates for world: ' + userLogged.worldId);
    socket.emit('loadCoordinates', {user: userLogged}, function(state, result){
        console.log('coordinates retrieved: ' + JSON.stringify(result));
        answer(state, result);
    });
};

exports.createGroup = function(groupName, answer){
    console.log('creating group: ' + groupName);
    socket.emit('createGroup', {user: userLogged, name: groupName}, function(state, id){
        answer(state, id);
    });
};

exports.editGroup = function(groupName, groupId, answer){
    console.log('editting group: ' + groupName);
    socket.emit('editGroup', {user: userLogged, name: groupName, id: groupId}, function(state){
        answer(state);
    });
};

exports.deleteGroup = function(groupId, answer){
    console.log('deleting group: ' + groupId);
    socket.emit('deleteGroup', {user: userLogged, id: groupId}, function(state){
        answer(state);
    });
};

exports.createCoordinate = function(coordinateName, x, z, y, groupId, answer){
    console.log('creating coordinate: ' + coordinateName + ' to group: ' + groupId);
    socket.emit('createCoordinate', {user: userLogged, name: coordinateName, x: x, z: z, y: y, groupId: groupId}, function(state, id){ //TODO evento en server
        answer(state, id);
    });
};

exports.editCoordinate = function(coordinateName, x, z, y, coordinateId, answer){
    console.log('editing coordinate: ' + coordinateName);
    socket.emit('editCoordinate', {user: userLogged, name: coordinateName, x: x, z: z, y: y, id: coordinateId}, function(state){ //TODO evento en server
        answer(state);
    });
};

exports.deleteCoordinate = function(coordinateId, answer){
    console.log('deleting coordinate: ' + coordinateId);
    socket.emit('deleteCoordinate', {user: userLogged, id: coordinateId}, function(state){
        answer(state);
    });
};