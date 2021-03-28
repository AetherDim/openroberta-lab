require(['require', 'wrap', 'log', 'jquery', 'blockly', 'guiState.controller', 'progList.controller', 'logList.controller', 'confList.controller',
    'progDelete.controller', 'confDelete.controller', 'progShare.controller', 'menu.controller', 'multSim.controller', 'user.controller', 'nn.controller',
    'robot.controller', 'program.controller', 'progSim.controller', 'notification.controller', 'progCode.controller', 'progDelete.controller', 'progHelp.controller',
    'legal.controller', 'progInfo.controller', 'progRun.controller', 'configuration.controller', 'language.controller', 'socket.controller',
    'progTutorial.controller', 'tutorialList.controller', 'userGroup.controller', 'volume-meter', 'user.model', 'webview.controller',
    'sourceCodeEditor.controller', 'codeflask', 'interpreter.jsHelper', 'confVisualization', 'robotBlock'], function(
        require) {
    $ = require('jquery');
    WRAP = require('wrap');
    LOG = require('log');
    COMM = require('comm');
    Blockly = require('blockly');
    confDeleteController = require('confDelete.controller');
    configurationController = require('configuration.controller');
    confListController = require('confList.controller');
    guiStateController = require('guiState.controller');
    languageController = require('language.controller');
    logListController = require('logList.controller');
    menuController = require('menu.controller');
    multSimController = require('multSim.controller');
    progDeleteController = require('progDelete.controller');
    progListController = require('progList.controller');
    galleryListController = require('galleryList.controller');
    tutorialListController = require('tutorialList.controller');
    legalController = require('legal.controller');
    programController = require('program.controller');
    progHelpController = require('progHelp.controller');
    progInfoController = require('progInfo.controller');
    notificationController = require('notification.controller');
    progCodeController = require('progCode.controller');
    progSimController = require('progSim.controller');
    progRunController = require('progRun.controller');
    progShareController = require('progShare.controller');
    robotController = require('robot.controller');
    userController = require('user.controller');
    nnController = require('nn.controller');
    userModel = require('user.model');
    socketController = require('socket.controller');
    tutorialController = require('progTutorial.controller');
    tutorialListController = require('tutorialList.controller');
    userGroupController = require('userGroup.controller');
    webviewController = require('webview.controller');
    sourceCodeEditorController = require('sourceCodeEditor.controller');
    codeflask = require('codeflask');
    stackmachineJsHelper = require('interpreter.jsHelper');
    confVisualization = require('confVisualization');
    robotBlock = require('robotBlock');

    $(document).ready(WRAP.fn3(init, 'page init'));
});

/**
 * Initializations
 */
function init() {
    COMM.setErrorFn(handleServerErrors);
    $.when(languageController.init()).then(function(language) {
        return webviewController.init(language);
    }).then(function(language, opt_data) {
        return guiStateController.init(language, opt_data);
    }).then(function() {
        return robotController.init();
    }).then(function() {
        return userController.init();
    }).then(function() {
        galleryListController.init();
        tutorialListController.init();
        progListController.init();
        progDeleteController.init();
        confListController.init();
        confDeleteController.init();
        progShareController.init();
        logListController.init();
        legalController.init();
        sourceCodeEditorController.init();
        programController.init();
        configurationController.init();
        progHelpController.init();
        progInfoController.init();
        progCodeController.init();
        progSimController.init();
        progRunController.init();
        menuController.init();
        tutorialController.init();
        userGroupController.init();
        notificationController.init();
        nnController.init();

        $(".cover").fadeOut(100, function() {
            if (guiStateController.getStartWithoutPopup()) {
                userModel.getStatusText(function(result) {
                    if (result.statustext[0] !== "" && result.statustext[1] !== "") {
                        $('#modal-statustext').modal("show");
                    }
                });
            } else {
                $("#show-startup-message").modal("show");
            }
        });

        $(".pace").fadeOut(500);
    });
}

/**
 * Handle server errors
 */
ALLOWED_PING_NUM = 5;

function handleServerErrors(jqXHR) {
    // TODO more?
    LOG.error("Client connection issue: " + jqXHR.status);
    if (this.url === "/rest/ping") {
        COMM.errorNum += 1;
    }
    if (this.url !== "/rest/ping" || COMM.errorNum > ALLOWED_PING_NUM) {
        guiStateController.setPing(false);
        if (jqXHR.status && jqXHR.status < 500) {
            COMM.showServerError("FRONTEND");
        } else {
            COMM.showServerError("CONNECTION");
        }
        guiStateController.setPing(true);

    }
}