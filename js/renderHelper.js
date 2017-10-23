const remote = require('electron').remote;

const main = remote.require('./main.js');

const allTexts = main.getTexts();
exports.renderTexts = function(window){
    /*let $nodesToRender = $('render');
    $nodesToRender.each(function () {
        let $node = $(this);
        let text = $node.text();
        let section = text.split('.')[0];
        let key = text.split('.')[1];
        //console.log(ff);
        $node.text(allTexts[window][section][key]);
    });*/
    let $sectionsToRender = $('renderSection');
    $sectionsToRender.each(function () {
        let $section = $(this);
        let section = $section.attr('data-section');
        console.log('rendering section: ' + section);
        let $nodesToRender = $section.find('render');
        $nodesToRender.each(function () {
            let $node = $(this);
            let key = $node.text();
            console.log('rendering node: ' + key);
            //let section = text.split('.')[0];
            //console.log(ff);
            $node.text(allTexts[window][section][key]);
        });
    });


    //alert(JSON.stringify(allTexts['main']['main.worlds']));
};