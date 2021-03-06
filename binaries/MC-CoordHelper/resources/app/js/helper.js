const remote = require('electron').remote;

const main = remote.require('./main.js');

const texts = main.getTexts('general');


//const state1Msg = 'Hubo uno o varios problemas, inténtalo de nuevo más tarde o contacta con el administrador a través del correo hector.zaragoza.arranz@gmail.com, ¡no muerdo!';
const state1Msg = texts['messages'].state1Msg;

function confirmDialog(confirmFunction, text) {
    swal({
        //title: '¿Está seguro de realizar esta operación?',
		title: texts['confirmation'].title,
        text: text,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        //confirmButtonText: 'Sí, estoy seguro',
		confirmButtonText: texts['confirmation'].okBtn,
        //cancelButtonText: 'No, sácame de aquí'
		cancelButtonText: texts['confirmation'].cancelBtn,
    }).then(confirmFunction);
}

