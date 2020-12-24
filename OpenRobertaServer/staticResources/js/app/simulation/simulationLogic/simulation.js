define(["require", "exports", "./simulationEngine", "./extendedMatter"], function (require, exports, simulationEngine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cancel = exports.interpreterAddEvent = exports.endDebugging = exports.updateDebugMode = exports.resetPose = exports.setInfo = exports.importImage = exports.stopProgram = exports.run = exports.setPause = exports.getNumRobots = exports.init = void 0;
    var engine = new simulationEngine_1.SimulationEngine('sceneCanvas', null, true, true);
    //engine.scene.setupDebugRenderer('notConstantValue');
    engine.scene.setupDebugRenderer('simDiv');
    engine.scene.testPhysics();
    /**
     * @param programs
     * @param refresh `true` if "SIM" is pressed, `false` if play is pressed
     * @param robotType
     */
    function init(programs, refresh, robotType) {
        $('#blockly').openRightView("sim", 0.5);
        console.log("init");
        engine.setPrograms(programs);
        engine.startSim();
    }
    exports.init = init;
    function getNumRobots() {
        return 1;
    }
    exports.getNumRobots = getNumRobots;
    function setPause(pause) {
    }
    exports.setPause = setPause;
    function run(p1, p2) {
        engine.startSim();
    }
    exports.run = run;
    function stopProgram() {
        engine.stopSim();
    }
    exports.stopProgram = stopProgram;
    function importImage() {
    }
    exports.importImage = importImage;
    function setInfo() {
    }
    exports.setInfo = setInfo;
    function resetPose() {
    }
    exports.resetPose = resetPose;
    function updateDebugMode(p1) {
    }
    exports.updateDebugMode = updateDebugMode;
    function endDebugging() {
    }
    exports.endDebugging = endDebugging;
    function interpreterAddEvent(event) {
    }
    exports.interpreterAddEvent = interpreterAddEvent;
    function cancel() {
    }
    exports.cancel = cancel;
});
