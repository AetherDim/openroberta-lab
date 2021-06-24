require(['require', 'jquery', 'wrap', 'comm', 'user.model', 'program.model', 'robot.model', 'guiState.model', 'interpreter.jsHelper', 'external/MultiCyberspace'], function(
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

    SIM = require("external/MultiCyberspace"); // init sim visuals

    stackmachineJsHelper = require("interpreter.jsHelper"); // provide for interpreter

    $(document).ready(WRAP.fn3(init, 'page init'));
});

// http://localhost:1999/multiCyberspace.html#loadProgram&&[1,2,3,4]

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
                    //SIM.init([result], true, GUISTATE_MODEL.gui.robotGroup);
                } catch (e) {
                    console.error(e)
                }
            } else {
                alert('Unable to process program for simulation!');
            }
        });



    });
}

/**
 * @param json {string}
 */
function openProgramFromJSON(json, secret) {
    var programIDList = JSON.parse(json);
    SIM.init(programIDList, secret)
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
    var target = decodeURI(document.location.search).split("?");
    if (target.length >= 2) {
        const programIDListString = target[1]
        const secret = target.length >= 3 ? target[2] : ""
        openProgramFromJSON(programIDListString, secret);
    }

    // new style queries
    var loadSystem = getUrlParameter(LOAD_SYSTEM_CALL);
    if (loadSystem) {
        console.log("New style query ... I do not understand :(")
    }
}

/**
 * Initializations
 */
function init() {
    GUISTATE_MODEL.init().then(function (res) { // init open roberta gui state
        SIM.initEvents(); // init ui events
        handleQuery(); // handle open program request
    });
}