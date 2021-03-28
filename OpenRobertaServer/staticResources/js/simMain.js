require(['require', 'jquery', 'codeflask', 'wrap', 'comm', 'user.model', 'program.model', 'robot.model', 'guiState.model', 'simulation.simulation', 'interpreter.jsHelper', 'util'], function(
    require) {

    //
    // Global definitions
    //

    $ = require('jquery');
    WRAP = require('wrap');
    COMM = require('comm');

    USER_MODEL = require('user.model');
    PROGRAM_MODEL = require('program.model');
    ROBOT_MODEL = require('robot.model');
    GUISTATE_MODEL = require('guiState.model');

    SIM = require("simulation.simulation"); // init sim visuals

    stackmachineJsHelper = require("interpreter.jsHelper"); // provide for interpreter

    $(document).ready(WRAP.fn3(init, 'page init'));
});



//
// The following code is mostly copied from the original open roberta code to preserve as much as possible.
// We do not want to alter the program code in any way.
//

function loadProgramFromXML(name, xml) {
    if (xml.search("<export") === -1) {
        xml = '<export xmlns="http://de.fhg.iais.roberta.blockly"><program>' + xml + '</program><config>' + GUISTATE_MODEL.getConfigurationXML()
            + '</config></export>';
    }
    PROGRAM_MODEL.loadProgramFromXML(name, xml, function(result) {

        if(result.rc !== "ok") {
            alert('Server did not successfully convert program!');
            return;
        }

        var isNamedConfig = false;
        var configName = undefined;
        var language = GUISTATE_MODEL.gui.language;


        PROGRAM_MODEL.runInSim(result.programName, configName, result.progXML, result.confXML, language, function(result) {
            if (result.rc == "ok") {
                try {
                    SIM.init([result], true, GUISTATE_MODEL.gui.robotGroup);
                } catch (e) {
                    console.error(e)
                }
            } else {
                alert('Unable to process program for simulation!');
            }
        });



    });
}

function openProgramFromXML(target) {
    var robotType = target[1];
    var programName = target[2];
    var programXml = target[3];

    loadProgramFromXML(programName, programXml);

}

const QUERY_START = '?';
const QUERY_DELIMITER = '&';
const QUERY_ASSIGNMENT = '=';
const LOAD_SYSTEM_CALL = 'loadSystem';

function cleanUri() {
    var uri = window.location.toString();
    var clean_uri = uri.substring(0, uri.lastIndexOf("/"));
    window.history.replaceState({}, document.title, clean_uri);
}

// from https://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js/21903119#21903119
function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1), sURLVariables = sPageURL.split(QUERY_DELIMITER), sParameterName, i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split(QUERY_ASSIGNMENT);

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
}

function handleQuery() {
    // old style queries
    var target = decodeURI(document.location.hash).split("&&");
    if (target[0] === "#loadProgram" && target.length >= 4) {

        openProgramFromXML(target);
    }

    // new style queries
    var loadSystem = getUrlParameter(LOAD_SYSTEM_CALL);
    if (loadSystem) {
        console.log("New style query ... I do not understand :(")
    }
}

function initEvents() {
    $('#simControl').onWrap('click', function(event) {

        if ($('#simControl').hasClass('typcn-media-play')) {
            $('#simControl').removeClass('typcn-media-play').addClass('typcn-media-stop');
            SIM.run(true, GUISTATE_MODEL.gui.robotGroup);
            SIM.setPause(false);
        } else {
            $('#simControl').addClass('typcn-media-play').removeClass('typcn-media-stop');
            SIM.setPause(true);
            SIM.stopProgram();
        }

    });

    $('#simScore').onWrap('click', function(event) {
        if ($('#simScore').hasClass('typcn-star')) {
            $('#simScore').addClass('typcn-star-outline').removeClass('typcn-star');
            SIM.score(true);
        } else {
            $('#simScore').addClass('typcn-star').removeClass('typcn-star-outline');
            SIM.score(false);
        }
    }, 'simImport clicked');

    $('#simFLowControl').onWrap('click', function(event) {
        if ($('#simFLowControl').hasClass('typcn-flash')) {
            $('#simFLowControl').addClass('typcn-flash-outline').removeClass('typcn-flash');
            SIM.sim(false);
        } else {
            $('#simFLowControl').addClass('typcn-flash').removeClass('typcn-flash-outline');
            SIM.sim(true);
        }
    }, 'simImport clicked');

    $('#simRobot').on('click', function(event) {
        $("#simRobotModal").modal("toggle");
        var robot = GUISTATE_C.getRobot();
        var position = $("#simDiv").position();
        position.top += 12;
        if (robot == 'calliope' || robot == 'microbit') {
            position.left = $("#blocklyDiv").width() + 12;
            $("#simRobotModal").css({
                top: position.top,
                left: position.left
            });
        } else {
            position.left += 48;
            $("#simRobotModal").css({
                top: position.top,
                left: position.left
            });
        }
        $('#simRobotModal').draggable();
        $("#simButtonsCollapse").collapse('hide');
    });

    $('#simValues').onWrap('click', function(event) {
        $("#simValuesModal").modal("toggle");
        var position = $("#simDiv").position();
        position.top += 12;
        $("#simValuesModal").css({
            top: position.top,
            right: 12,
            left: 'initial',
            bottom: 'inherit'
        });
        $('#simValuesModal').draggable();

        $("#simButtonsCollapse").collapse('hide');
    }, 'simValues clicked');

    $('#simResetPose').onWrap('click', function(event) {
        SIM.resetPose();
    }, 'simResetPose clicked');

    $('#simVariables').onWrap('click', function(event) {
        $("#simVariablesModal").modal("toggle");
        var position = $("#simDiv").position();
        position.top += 12;
        $("#simVariablesModal").css({
            top: position.top,
            right: 12,
            left: 'initial',
            bottom: 'inherit'
        });
        $('#simVariablesModal').draggable();

        $("#simButtonsCollapse").collapse('hide');
    }, 'simVariables clicked');
}

/**
 * Initializations
 */
function init() {
    GUISTATE_MODEL.init().then(function (res) { // init open roberta gui state
        initEvents(); // init ui events
        handleQuery(); // handle open program request
    });
}