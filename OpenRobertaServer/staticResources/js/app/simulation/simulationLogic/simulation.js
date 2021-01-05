define(["require", "exports", "./SceneRenderer", "./ExtendedMatter"], function (require, exports, SceneRenderer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cancel = exports.interpreterAddEvent = exports.endDebugging = exports.updateDebugMode = exports.resetPose = exports.setInfo = exports.importImage = exports.stopProgram = exports.run = exports.setPause = exports.getNumRobots = exports.init = void 0;
    var engine = new SceneRenderer_1.SceneRender('sceneCanvas', 'simDiv');
    engine.getScene().setupDebugRenderer('notConstantValue');
    //engine.getScene().setupDebugRenderer('simDiv');
    engine.getScene().testPhysics();
    var storedPrograms;
    var storedRobotType;
    /**
     * @param programs
     * @param refresh `true` if "SIM" is pressed, `false` if play is pressed
     * @param robotType
     */
    function init(programs, refresh, robotType) {
        storedPrograms = programs;
        storedRobotType = robotType;
        //$('#blockly').openRightView("sim", 0.5);
        console.log("init simulation");
        engine.setPrograms(programs, refresh, robotType);
        // TODO: reset scene on refresh
    }
    exports.init = init;
    function getNumRobots() {
        var scene = engine.getScene();
        return scene ? scene.robots.length : 0;
    }
    exports.getNumRobots = getNumRobots;
    function setPause(pause) {
        // TODO: pause/start program
        if (pause) {
            engine.stopSim();
        }
        else {
            engine.startSim();
        }
    }
    exports.setPause = setPause;
    function run(refresh, robotType) {
        init(storedPrograms, refresh, robotType);
    }
    exports.run = run;
    function stopProgram() {
        engine.stopSim();
        //TODO: reset
        //  reloadProgram();
        // remove debug highlights
        init(storedPrograms, false, storedRobotType);
        alert('stop');
    }
    exports.stopProgram = stopProgram;
    function importImage() {
        // TODO: remove
        alert('This function is not supported, sorry :(');
    }
    exports.importImage = importImage;
    function setInfo() {
        alert('info');
    }
    exports.setInfo = setInfo;
    function resetPose() {
        alert('reset pose');
    }
    exports.resetPose = resetPose;
    function updateDebugMode(debugMode) {
        engine.updateDebugMode(debugMode);
    }
    exports.updateDebugMode = updateDebugMode;
    function endDebugging() {
        engine.endDebugging();
    }
    exports.endDebugging = endDebugging;
    function interpreterAddEvent(event) {
        engine.interpreterAddEvent(event);
    }
    exports.interpreterAddEvent = interpreterAddEvent;
    function cancel() {
        alert('cancel');
    }
    exports.cancel = cancel;
});
