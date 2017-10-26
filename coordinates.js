// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const {remote} = require('electron');
 
const main = remote.require('./main.js');

const renderHelper =  require('./js/renderHelper');

let worldName = '';

let texts = main.getTexts('coordinates');

$(document).ready(function(){
	let name = main.getWorldName();
	worldName = name;

	$('#worldName').html(name);
	$('#close').click(function(){main.closeCoordinates();});
	$('#worldActions').click(openWorldActions);
    $('#inviteUserBtn').click(inviteUser);
    $('#openCreateGroupBtn').click(function(){openCreateOrEditGroup()});

    $('#createCoordinateBtn').click(createCoordinate);
    $('#openEditWorld').click(function(){
        $('#worldNameInput').val($('#worldName').html());
        $('#editWorldModal').modal('show')
    });
    $('#editWorldBtn').click(editWorld);
	loadCoordinates();
    $('#reloadCoordinates').click(function(){loadCoordinates()});

	renderHelper.renderTexts('coordinates');
});

function editWorld(){
    let $name = $('#worldNameInput');
    let name = $name.val();
    if(name === '')
        swal({title: texts['worldActions'].editWorldFillFieldsError, type: 'error'});
    else {
        $name.val('');
        main.editWorld(name, function(state){
            let msg = state===0 ? texts['worldActions'].editWorldDone : state1Msg;
            let type = state===0 ? 'success' : 'error';
            if(state === 0) {
                $('#worldName').html(name);
                $('#editWorldModal').modal('hide');
            }
            swal({title: msg, type: type});

        });
    }
}

function openCreateOrEditGroup(groupData = null){
    let $groupName = $('#groupName');
    let $createGroupBtn = $('#createGroupBtn');
    $groupName.val(groupData==null?'':groupData.name);
    $createGroupBtn.off('click');
    if(groupData == null){
        $createGroupBtn.click(createGroup);
        $('#createGroupTitle').html(texts['coordinates'].createGroupTitle);
        $createGroupBtn.html(texts['coordinates'].createGroupBtn);
    } else {
        $createGroupBtn.click(function(){
            editGroup(groupData);
        });
        $('#createGroupTitle').html(texts['coordinates'].editGroupTitle);
        $createGroupBtn.html(texts['coordinates'].editGroupBtn);
    }
    $('#createGroupModal').modal('show');
}

function openCreateOrEditCoordinate(group, coordinate = null){
    tmpGroupCoordinateAdding = group;
    console.log('tmpGroupCoordinateAdding: ' + tmpGroupCoordinateAdding.id);
    let $createCoordinateBtn = $('#createCoordinateBtn');
    $createCoordinateBtn.off('click');
    if(coordinate == null) {
        $createCoordinateBtn.click(function(){
            createCoordinate();
        });
        $createCoordinateBtn.html(texts['coordinates'].createCoordinateBtn);
        $('#createCoordinateTitle').html(texts['coordinates'].createCoordinateTitle);
        $('#coordinateX').val('0');
        $('#coordinateY').val('0');
        $('#coordinateZ').val('0');
        $('#coordinateName').val('');

    } else {
        $createCoordinateBtn.click(function(){
            editCoordinate(coordinate);
        });
        $createCoordinateBtn.html(texts['coordinates'].editCoordinateBtn);
        $('#createCoordinateTitle').html(texts['coordinates'].editCoordinateTitle);
        $('#coordinateX').val(coordinate.x);
        $('#coordinateY').val(coordinate.y);
        $('#coordinateZ').val(coordinate.z);
        $('#coordinateName').val(coordinate.name);
    }
    $('#createCoordinateModal').modal('show');
}

function createGroup(){
    let $groupName = $('#groupName');
    let groupName = $groupName.val();

    if(groupName === ''){
        swal({title: texts['coordinates'].createGroupFillFieldsError, type: 'error'});
    } else {
        if(testIfGroupExists(groupName)){
            swal({title: texts['coordinates'].createGroupGroupExistsError, type: 'error'});
        } else {
            main.createGroup(groupName, function (state, id) {
                //alert(id);
                let msg = state === 0 ? texts['coordinates'].createGroupDone : state1Msg;
                let type = state === 0 ? 'success' : 'error';
                if (state == 0) {
                    //console.log(JSON.stringify(coordinatesObject));
                    coordinatesObject.push({
                        id: id,
                        name: groupName,
                        coordinates: []
                    });
                    //console.log(JSON.stringify(coordinatesObject));
                    renderCoordinates(groupName);
                    $('#createGroupModal').modal('hide');
                    $groupName.val('');
                }
                swal({title: msg, type: type});
            });
        }
    }
}

function editGroup(group){
    let $groupName = $('#groupName');
    let groupName = $groupName.val();

    if(groupName === ''){
        swal({title: texts['coordinates'].createGroupFillFieldsError, type: 'error'});
    } else {
        if(testIfGroupExists(groupName)){
            swal({title: texts['coordinates'].createGroupGroupExistsError, type: 'error'});
        } else {
            main.editGroup(groupName, group.id, function (state) {
                //alert(id);
                let msg = state === 0 ? texts['coordinates'].editGroupDone : state1Msg;
                let type = state === 0 ? 'success' : 'error';
                if (state == 0) {
                    //console.log(JSON.stringify(coordinatesObject));
                    coordinatesObject[group.index].name = groupName;
                    //console.log(JSON.stringify(coordinatesObject));
                    renderCoordinates(groupName);
                    $('#createGroupModal').modal('hide');
                    $groupName.val('');
                }
                swal({title: msg, type: type});
            });
        }
    }
}

function testIfGroupExists(groupName){
    let res = false;
    let toBreak = true;
    $.each(coordinatesObject, function (key, group) {
        if(group.name.toString().localeCompare(groupName.toString()) == 0) {
            res = true;
            return toBreak = false;
        }
    });
    return res;
}

function deleteGroup(groupId, index) {
    if(coordinatesObject.length == 1){
        swal({title: texts['coordinates'].deleteGroupThereIsOnlyOneError, type: 'error'});
    } else {
        confirmDialog(function () {
            main.deleteGroup(groupId, function (state) {
                let msg = state === 0 ? texts['coordinates'].deleteGroupDone : state1Msg;
                let type = state === 0 ? 'success' : 'error';
                if (state == 0) {
                    coordinatesObject.splice(index, 1);
                    renderCoordinates(0);
                }
                swal({title: msg, type: type});
            });
        }, texts['coordinates'].deleteGroupAdvice);
    }
}

function createCoordinate(){
    let $coordinateName = $('#coordinateName');
    let coordinateName = $coordinateName.val();
    let $x = $('#coordinateX');
    let x = parseInt($x.val());
    let $z = $('#coordinateZ');
    let z = parseInt($z.val());
    let $y = $('#coordinateY');
    let y = parseInt($y.val());



    if(coordinateName === '' || x === '' || y === '' || z === ''){
        swal({title: texts['coordinates'].createCoordinateFillFieldsError, type: 'error'});
    } else {
        if(testIfCoordinateExists(coordinateName, x, z, y)){
            swal({title: texts['coordinates'].createCoordinateCoordinateExistsError, type: 'error'});
        } else {

            main.createCoordinate(coordinateName, x, z, y, tmpGroupCoordinateAdding.id, function (state, id) {
                let msg = state === 0 ? texts['coordinates'].createCoordinateDone : state1Msg;
                let type = state === 0 ? 'success' : 'error';
                if (state == 0) {
                    let indexOfGroup = coordinatesObject.indexOf(tmpGroupCoordinateAdding);

                    let newCoord = {
                        id: id,
                        name: coordinateName,
                        x: x,
                        z: z,
                        y: y,
                        group_id: tmpGroupCoordinateAdding.id
                    };

                    let newObj = jQuery.extend(true, {}, coordinatesObject[indexOfGroup]);

                    newObj.coordinates.push(newCoord);

                    coordinatesObject[indexOfGroup] = newObj;

                    renderCoordinates(indexOfGroup);
                    $('#createCoordinateModal').modal('hide');
                    let $coordinate = $(`#coordinate${newCoord.id}`);
                    $coordinate.addClass('blink');

                    $('#coordinates').animate({
                        scrollTop: $coordinate.offset().top
                    }, 1000);

                    setTimeout(function(){
                        $(`#coordinate${newCoord.id}`).removeClass('blink');
                        swal({title: msg, type: type});
                    }, 2000);
                }

            });
        }
    }
}

function editCoordinate(coordinate){
    let $coordinateName = $('#coordinateName');
    let coordinateName = $coordinateName.val();
    let $x = $('#coordinateX');
    let x = parseInt($x.val());
    let $z = $('#coordinateZ');
    let z = parseInt($z.val());
    let $y = $('#coordinateY');
    let y = parseInt($y.val());



    if(coordinateName === '' || x === '' || y === '' || z === ''){
        swal({title: texts['coordinates'].createCoordinateFillFieldsError, type: 'error'});
    } else {
        if(testIfCoordinateExists(coordinateName, x, z, y)){
            swal({title: texts['coordinates'].createCoordinateCoordinateExistsError, type: 'error'});
        } else {

            main.editCoordinate(coordinateName, x, z, y, coordinate.id, function (state) {
                let msg = state === 0 ? texts['coordinates'].editCoordinateDone : state1Msg;
                let type = state === 0 ? 'success' : 'error';
                if (state == 0) {
                    let indexOfGroup = coordinatesObject.indexOf(tmpGroupCoordinateAdding);
                    let indexOfCoordinate = coordinatesObject[indexOfGroup].coordinates.indexOf(coordinate);

                    coordinatesObject[indexOfGroup].coordinates[indexOfCoordinate].x = x;
                    coordinatesObject[indexOfGroup].coordinates[indexOfCoordinate].z = z;
                    coordinatesObject[indexOfGroup].coordinates[indexOfCoordinate].y = y;
                    coordinatesObject[indexOfGroup].coordinates[indexOfCoordinate].name = coordinateName;

                    renderCoordinates(indexOfGroup);
                    $('#createCoordinateModal').modal('hide');
                    let $coordinate = $(`#coordinate${coordinate.id}`);
                    $coordinate.addClass('blink');

                   $('#coordinates').animate({
                        scrollTop: $coordinate.offset().top
                    }, 1000);

                    setTimeout(function(){
                        $(`#coordinate${coordinate.id}`).removeClass('blink');
                        swal({title: msg, type: type});
                    }, 2000);
                }

            });
        }
    }
}

function testIfCoordinateExists(coordinateName, x, z, y){
    let res = false;
    let toBreak = true;
    $.each(tmpGroupCoordinateAdding.coordinates, function (index, coordinate) {
        if(coordinate.name.toString().localeCompare(coordinateName.toString()) == 0 && coordinate.x == x && coordinate.y == y && coordinate.z == z) {
            res = true;
            return toBreak = false;
        }
    });
    return res;
}


function deleteCoordinate(coordinateId, index, indexOfGroup) {
    confirmDialog(function () {
        main.deleteCoordinate(coordinateId, function (state) {
            let msg = state === 0 ? texts['coordinates'].deleteCoordinateDone : state1Msg;
            let type = state === 0 ? 'success' : 'error';
            if (state == 0) {

                let newObj = jQuery.extend(true, {}, coordinatesObject[indexOfGroup]);

                newObj.coordinates.splice(index, 1);

                coordinatesObject[indexOfGroup] = newObj;
                renderCoordinates(indexOfGroup);
            }
            swal({title: msg, type: type});
        });
    }, texts['coordinates'].deleteCoordinateAdvice);

}

function openWorldActions(){
    loadUsers();
    let $nickOfUser = $('#nickOfUser');
    $nickOfUser.val('');


    $('#worldActionsModal').modal('show');
}

function loadUsers(){
	main.getUsersInWorld(function(state, users){
        let msg = state===0 ? 'List of users searched well' : state1Msg;
        let type = state===0 ? 'success' : 'error';
        if(state == 0) {
            let $list = $('#usersList');
            $list.empty();
            for (let thisUser in users) {
                if (users.hasOwnProperty(thisUser)) {
                    let $item = `<div class="list-group-item">
                                <div class="row">
                                    <div class="col-xs-8">
                                        <h6>${users[thisUser].nick}</h6>
                                    </div>
                                    <div class="col-xs-1 ball" ${users[thisUser].connected ? 'style="background-color: green"' : ''}></div>
                                </div>`;
                    $list.append($item);
                }
            }
        } else {
            swal({title: msg, type: type});
        }
    });

	getPendingUsersInWorld();

}

function getPendingUsersInWorld(){
    main.getPendingUsersInWorld(function(state, users){
        let msg = state===0 ? 'List of pedusers searched well' : state1Msg;
        let type = state===0 ? 'success' : 'error';
        if(state == 0) {
            let $list = $('#pendingUsersList');
            $list.empty();
            $.each(users, function(thisUser, user){
                if (users.hasOwnProperty(thisUser)) {
                    let $item = $('<div class="list-group-item"></div>');

                    let $name = $(`<h6>${user.nick}</h6>`);

                    let $removeBtn = $('<button class="btn btn-danger"><span class="glyphicon glyphicon-trash"></span></button>');

                    $removeBtn.click(function(){
                        confirmDialog(function(){
                            main.deleteInvitationToWorld(user.nick, function(state){
                                let msg = state===0 ? texts['worldActions'].deleteInvitationDone : state1Msg;
                                let type = state===0 ? 'success' : 'error';
                                $item.remove();
                                swal({title: msg, type: type});
                            });
                        }, texts['worldActions'].deleteInvitationAdvice);
                    });

                    $name.css({
                        transition: 'opacity 1s'
                    });

                    $item.append($name);
                    $item.append($removeBtn);
                    $list.append($item);
                    $removeBtn.hide();

                    $name.css('text-align', 'center');
                    $removeBtn.css('margin-left', '25px');

                    $item.hover(function(){
                       $name.hide();
                       $removeBtn.show();
                    }, function(){
                        $removeBtn.hide();
                        $name.show();
                    });
                }
            });
        } else {
            swal({title: msg, type: type});
        }
    });
}

function inviteUser(){
    let $nick = $('#nickOfUser');
    let nick = $nick.val();
    if(nick == '') {
        swal({title: texts['worldActions'].fillFieldsError, type: 'error'});
    } else if (nick.split(' ').length > 1) {
        swal({title: texts['worldActions'].nickHasSpacesError, type: 'error'});
    } else {
        main.inviteUserToWorld(nick, function(state) {
            let msg = state===0 ? texts['worldActions'].inviteUserDone
                :state===1 ? state1Msg
                    :state===2 ? texts['worldActions'].userNotExists
                        : texts['worldActions'].userWasAlreadyInvited;
            let type = state===0 ? 'success' : 'error';
            $nick.val('');
            if(state === 0){
                getPendingUsersInWorld();
                swal({title: msg, type: type});
            } else {
                swal({title: msg, type: type});
            }

        });
    }
}
let coordinatesObject = {};
let tmpGroupCoordinateAdding = -1;
let firstTime = true;
function loadCoordinates(){
    main.loadCoordinates(function(state, groups){

        //alert(JSON.stringify(groups));
        let msg = state===0 ? 'Coordinates loaded well' : state1Msg;
        let type = state===0 ? 'success' : 'error';
        if(state === 0) {
            coordinatesObject = groups;

            renderCoordinates(firstTime?0:$('#coordinates').tabs('option', 'active'));
        } else {
            swal({title: msg, type: type});
        }
    });
}

function renderCoordinates(selectedIndex = null){
    if(!firstTime) {
        sortAlphabeticalByName();
    }

    let $tabs = $('#tabs');
    $tabs.empty();
    let $coordinates = $('#coordinates');
    if(!firstTime)
        $coordinates.tabs('destroy');
    $coordinates.find('div').remove();
    firstTime = false;
    if(/*Object.keys(coordinatesObject)*/coordinatesObject.length === 0){
        swal('There arent groups created yet');
    } else {
        $.each(coordinatesObject, function (index, group) {
            if(index === 0){
                tmpGroupCoordinateAdding = group;
                console.log('tmpGroupCoordinateAdding: ' + tmpGroupCoordinateAdding.id);
            }
            if(selectedIndex != null && isNaN(selectedIndex) && selectedIndex == group.name) {
                selectedIndex = index;
                tmpGroupCoordinateAdding = group;
            }
            //console.log('group id: ' + group.id);

            let $coordinatesList = addTab(group.id, group.name);

            let $groupSettingsRow = $('<div class="row" style="display: flex; align-items: center; justify-content: center"></div>');

            let $editBtn = $('<button id="editGroupBtn" class="btn btn-warning" style="margin: 10px;"><span class="glyphicon glyphicon-pencil"></span></button>');
            $editBtn.click(function(){
                openCreateOrEditGroup({name: group.name, id: group.id, index: index});
            });

            let $removeBtn = $('<button id="removeGroupBtn" class="btn btn-danger" style="margin: 10px;"><span class="glyphicon glyphicon-trash"></span></button>');
            $removeBtn.click(function(){
                deleteGroup(group.id, index);
            });

            $groupSettingsRow.append($editBtn);
            $groupSettingsRow.append($removeBtn);
            $coordinatesList.append($groupSettingsRow);

            let $title = $(`<div class="list-group-item coordTitle"></div>`);
            let $titleRow = $('<div class="row childrenRightBorder "></div>');
            let $titleName = $(`<div class="col-xs-3"><h6>${texts['coordinates'].coordinateName}</h6></div>`);
            let $titleX = $(`<div class="col-xs-3"><h5>X</h5></div>`);
            let $titleZ = $(`<div class="col-xs-3"><h5>Z</h5></div>`);
            let $titleY = $(`<div class="col-xs-3"><h5>Y</h5></div>`);

            $titleRow.append($titleName);
            $titleRow.append($titleX);
            $titleRow.append($titleZ);
            $titleRow.append($titleY);

            $title.append($titleRow);
            $coordinatesList.append($title);
            $.each(group.coordinates, function (coordinateIndex, coordinate) {
                //console.log('coordinate id: ' + coordinate.id);
                addCordinate($coordinatesList, group,  coordinate, coordinateIndex, index);
            });

            let $groupActions = $(`<div class="list-group-item"></div>`);
            let $groupActionsRow = $('<div class="row" style="display: flex; align-items: center; justify-content: center"></div>');

            let $addBtn = $('<button id="addCoordinateBtn" class="btn btn-success"><span class="glyphicon glyphicon-plus"></span></button>');
            $addBtn.click(function(){
                openCreateOrEditCoordinate(group);

            });

            $groupActionsRow.append($addBtn);
            $groupActions.append($groupActionsRow);
            $coordinatesList.append($groupActions);

            let $footer = $(`<div class="list-group-item coordTitle"></div>`);
            let $footerRow = $('<div class="row childrenRightBorder"></div>');
            let $footerName = $(`<div class="col-xs-3"><h6>${texts['coordinates'].coordinateName}</h6></div>`);
            let $footerX = $(`<div class="col-xs-3"><h5>X</h5></div>`);
            let $footerZ = $(`<div class="col-xs-3"><h5>Z</h5></div>`);
            let $footerY = $(`<div class="col-xs-3"><h5>Y</h5></div>`);

            $footerRow.append($footerName);
            $footerRow.append($footerX);
            $footerRow.append($footerZ);
            $footerRow.append($footerY);

            $footer.append($footerRow);
            $coordinatesList.append($footer);

            $coordinates.append($coordinatesList);
        });

        $coordinates.tabs();
        if(selectedIndex != null)
            $coordinates.tabs('option', 'active', selectedIndex);
    }
    $('#tmp').css('display', 'none');
    $('#worldPanel').css('display', 'block');
}

function addTab(id, name){
    let $tabs = $('#tabs');
    let $coordinates = $('#coordinates');
    let $tab = $(`<li><a href="#group${id}" id="tab${id}">${name}</a></li>`);
    $tabs.append($tab);
    let $div = $(`<div id="group${id}" class="list-group"></div>`);
    $coordinates.append($div);
    return $div;
}

function addCordinate($div, group, coordinate, index, indexOfGroup){

    let $item = $(`<div class="list-group-item" id="coordinate${coordinate.id}"></div>`);
    let $row = $('<div class="row childrenRightBorder"></div>');
    let $name = $(`<div class="col-xs-3">${coordinate.name}</div>`);


    let $col1 = $(`<div class="col-xs-3"></div>`);
    let $x = $(`<span>${coordinate.x}</span>`);
    let $seeBtn = $(`<button class="btn btn-info"><span class="glyphicon glyphicon-eye-open"></span></button>`);
    $seeBtn.click(function(){
        main.createView(coordinate);
    });
    $col1.append($x);
    $col1.append($seeBtn);
    $seeBtn.hide();


    let $col2 = $(`<div class="col-xs-3"></div>`);
    let $z = $(`<span>${coordinate.z}</span>`);
    let $editBtn = $(`<button class="btn btn-warning"><span class="glyphicon glyphicon-pencil"></span></button>`);
    $editBtn.click(function(){
        openCreateOrEditCoordinate(group, coordinate);
    });
    $col2.append($z);
    $col2.append($editBtn);
    $editBtn.hide();

    let $col3 = $(`<div class="col-xs-3"></div>`);
    let $y = $(`<span>${coordinate.y}</span>`);
    let $removeBtn = $(`<button class="btn btn-danger"><span class="glyphicon glyphicon-trash"></span></button>`);
    $removeBtn.click(function(){
        deleteCoordinate(coordinate.id, index, indexOfGroup);
    });
    $col3.append($y);
    $col3.append($removeBtn);
    $removeBtn.hide();

    $row.append($name);
    $row.append($col1);
    $row.append($col2);
    $row.append($col3);

    $item.append($row);
    $div.append($item);

    $item.hover(function(){
        $x.hide();
        $z.hide();
        $y.hide();
        $seeBtn.show();
        $editBtn.show();
        $removeBtn.show();
        $item.css('background', 'lightgray');
    }, function(){
        $seeBtn.hide();
        $editBtn.hide();
        $removeBtn.hide();
        $x.show();
        $z.show();
        $y.show();
        $item.css('background', 'white');
    });
}

function sortAlphabeticalByName() {
    $.each(coordinatesObject, function (key, group) {
        group.coordinates = alphabetical_sort_object_of_objects(group.coordinates, 'name');
    });
    coordinatesObject = alphabetical_sort_object_of_objects(coordinatesObject, 'name');
}


function alphabetical_sort_object_of_objects(data, attr) {
    let arr = [];
    for (let prop in data) {
        if (data.hasOwnProperty(prop)) {
            let obj = {};
            obj[prop] = data[prop];
            obj.tempSortName = data[prop][attr].toLowerCase();
            arr.push(obj);
        }
    }

    arr.sort(function(a, b) {
        let at = a.tempSortName,
            bt = b.tempSortName;
        return at > bt ? 1 : ( at < bt ? -1 : 0 );
    });

    let result = [];
    for (let i=0, l=arr.length; i<l; i++) {
        let obj = arr[i];
        delete obj.tempSortName;
        let id;
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                id = prop;
            }
        }
        let item = obj[id];
        result.push(item);
    }
    return result;
}
