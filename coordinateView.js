const {remote} = require('electron');

const main = remote.require('./main.js');

let coordinate = remote.getCurrentWindow().coordinate;

$(document).ready(function(){
    $('#closeBtn').click(closeView);
    $('#name').html(coordinate.name);
    $('#x').html(coordinate.x);
    $('#z').html(coordinate.z);
    $('#y').html(coordinate.y);

});

function closeView(){
    main.closeView(remote.getCurrentWindow().index);
}