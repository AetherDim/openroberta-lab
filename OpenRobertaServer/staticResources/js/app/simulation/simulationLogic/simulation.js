var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
define(["require", "exports", "./external/SceneDesciptorList", "./Cyberspace/Cyberspace", "./BlocklyDebug", "./UIManager", "interpreter.jsHelper", "./RRC/Scene/RRCScoreScene", "./external/RESTApi", "./pixijs", "./ExtendedMatter"], function (require, exports, SceneDesciptorList_1, Cyberspace_1, BlocklyDebug_1, UIManager_1, interpreter_jsHelper_1, RRCScoreScene_1, RESTApi_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setSimSpeed = exports.zoomReset = exports.zoomOut = exports.zoomIn = exports.score = exports.sim = exports.nextScene = exports.selectScene = exports.getScenes = exports.cancel = exports.interpreterAddEvent = exports.endDebugging = exports.updateDebugMode = exports.resetPose = exports.setInfo = exports.importImage = exports.stopProgram = exports.run = exports.setPause = exports.getNumRobots = exports.init = void 0;
    //
    // init all components for a simulation
    //
    var cyberspace = new Cyberspace_1.Cyberspace('sceneCanvas', 'simDiv');
    var sceneManager = cyberspace.getSceneManager();
    var blocklyDebugManager = new BlocklyDebug_1.BlocklyDebug(cyberspace);
    UIManager_1.UIManager.simSpeedUpButton.setState("fastForward");
    UIManager_1.UIManager.showScoreButton.setState("showScore");
    RESTApi_1.sendStateRequest(function (res) {
        if (res && res.error == RESTApi_1.ResultErrorType.NONE) {
            var result = (res.result);
            if (result.uploadEnabled) {
                $('#head-navigation-upload').css('display', 'inline');
            }
        }
    });
    cyberspace.eventManager
        .onStartPrograms(function () { return UIManager_1.UIManager.programControlButton.setState("stop"); })
        .onStopPrograms(function () { return UIManager_1.UIManager.programControlButton.setState("start"); })
        .onStartSimulation(function () { return UIManager_1.UIManager.physicsSimControlButton.setState("stop"); })
        .onPauseSimulation(function () { return UIManager_1.UIManager.physicsSimControlButton.setState("start"); });
    cyberspace.specializedEventManager
        .addEventHandlerSetter(RRCScoreScene_1.RRCScoreScene, function (scoreScene) {
        return scoreScene.scoreEventManager.onShowHideScore(function (state) {
            return UIManager_1.UIManager.showScoreButton.setState(state == "hideScore" ? "showScore" : "hideScore");
        });
    });
    interpreter_jsHelper_1.interpreterSimBreakEventHandlers.push(function () {
        cyberspace.pausePrograms();
    });
    sceneManager.registerScene.apply(sceneManager, __spreadArray([], __read(SceneDesciptorList_1.cyberspaceScenes)));
    // switch to first scene
    cyberspace.switchToNextScene(true);
    /**
     * @param programs
     * @param refresh `true` if "SIM" is pressed, `false` if play is pressed
     * @param robotType
     */
    function init(programs, refresh, robotType) {
        //$('simScene').hide();
        // TODO: prevent clicking run twice
        cyberspace.setRobertaRobotSetupData(programs, robotType);
    }
    exports.init = init;
    function getNumRobots() {
        return 1;
    }
    exports.getNumRobots = getNumRobots;
    function setPause(pause) {
        if (pause) {
            cyberspace.pausePrograms();
        }
        else {
            cyberspace.startPrograms();
        }
    }
    exports.setPause = setPause;
    function run(refresh, robotType) {
        //init(Util.simulation.storedRobertaRobotSetupData, refresh, robotType);
        console.log("run!");
    }
    exports.run = run;
    /**
     * on stop program
     */
    function stopProgram() {
        cyberspace.stopPrograms();
    }
    exports.stopProgram = stopProgram;
    function importImage() {
        alert('This function is not supported, sorry :(');
    }
    exports.importImage = importImage;
    function setInfo() {
        alert('info');
    }
    exports.setInfo = setInfo;
    /**
     * Reset robot position and zoom of ScrollView
     */
    function resetPose() {
        cyberspace.resetScene();
    }
    exports.resetPose = resetPose;
    function updateDebugMode(debugMode) {
        blocklyDebugManager.setDebugMode(debugMode);
    }
    exports.updateDebugMode = updateDebugMode;
    function endDebugging() {
        blocklyDebugManager.setDebugMode(false);
    }
    exports.endDebugging = endDebugging;
    function interpreterAddEvent(event) {
        blocklyDebugManager.interpreterAddEvent(event);
    }
    exports.interpreterAddEvent = interpreterAddEvent;
    /**
     * on simulation close
     */
    function cancel() {
        cyberspace.pausePrograms();
    }
    exports.cancel = cancel;
    //
    // Scene selection functions
    //
    function getScenes() {
        return cyberspace.getScenes();
    }
    exports.getScenes = getScenes;
    function selectScene(ID) {
        cyberspace.loadScene(ID);
    }
    exports.selectScene = selectScene;
    function nextScene() {
        return cyberspace.switchToNextScene();
    }
    exports.nextScene = nextScene;
    function sim(run) {
        if (run) {
            cyberspace.startSimulation();
        }
        else {
            cyberspace.pauseSimulation();
        }
    }
    exports.sim = sim;
    function score(visible) {
        var scene = cyberspace.getScene();
        if (scene instanceof RRCScoreScene_1.RRCScoreScene) {
            scene.showScoreScreen(visible);
        }
    }
    exports.score = score;
    function zoomIn() {
        cyberspace.zoomViewIn();
    }
    exports.zoomIn = zoomIn;
    function zoomOut() {
        cyberspace.zoomViewOut();
    }
    exports.zoomOut = zoomOut;
    function zoomReset() {
        cyberspace.resetView();
    }
    exports.zoomReset = zoomReset;
    function setSimSpeed(speedup) {
        cyberspace.setSimulationSpeedupFactor(speedup);
    }
    exports.setSimSpeed = setSimSpeed;
});
