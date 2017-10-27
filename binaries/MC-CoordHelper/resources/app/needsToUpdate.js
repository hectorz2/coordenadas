const {remote} = require('electron');

const main = remote.require('./main.js');

let lastVersion = remote.getCurrentWindow().lastVersion;

$(document).ready(function(){
   $('#version').html(lastVersion.version);
   $('#releaseNotes').html(lastVersion.releaseNotes);
   $('#closeBtn').click(function(){
      main.quitForUpdate();
   });
});