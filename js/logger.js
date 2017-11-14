const ACTIVATED = true;
const LEVEL = 0; //0: ALL, 1:TRACE, 2:INFO, 3:ERROR

let today = new Date();
let name = getName();

let fs = require('fs');

module.exports = {
    trace: function(msg){
        if(LEVEL <= 1) {
            write('TRACE', msg);
        }
    },
    info: function(msg){
        if(LEVEL <= 2) {
            write('INFO', msg);
        }
    },
    error: function(msg){
        if(LEVEL <= 3) {
            write('ERROR', msg);
        }
    }
};

function write(level, msg){
    if(ACTIVATED) {
        let today = new Date();

        let hh = today.getHours();
        let mm = today.getMinutes();
        let ss = today.getSeconds();

        if (hh < 10) {
            hh = '0' + hh;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        if (ss < 10) {
            ss = '0' + ss;
        }

        msg = `${level}_${hh}:${mm}:${ss}__MSG: ${msg}\n`;

        fs.writeFile(name, msg, {flag: 'a'});
    }
}

setTimer(function(){
    let now = new Date();
    if(now.getDate() !== today.getDate()) {
        name = getName();
    }
}, 1000);

function getName(){
    let today = new Date();
    let dd = today.getDate();
    let MM = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }
    if (MM < 10) {
        MM = '0' + MM;
    }

    return 'debug\\' + yyyy + '-' + MM + '-' + dd + '.log';
}