define(["require", "exports", "./SceneRenderer", "./RRC/AgeGroup", "./RRC/Scene/RRCRainbowScene", "./pixijs", "./ExtendedMatter"], function (require, exports, SceneRenderer_1, AgeGroup_1, RRCRainbowScene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.selectScene = exports.getScenes = exports.SceneDescription = exports.cancel = exports.interpreterAddEvent = exports.endDebugging = exports.updateDebugMode = exports.resetPose = exports.setInfo = exports.importImage = exports.stopProgram = exports.run = exports.setPause = exports.getNumRobots = exports.init = void 0;
    var engine = new SceneRenderer_1.SceneRender('sceneCanvas', 'simDiv', new RRCRainbowScene_1.RRCRainbowScene(AgeGroup_1.AgeGroup.MS));
    engine.getScene().setupDebugRenderer('notConstantValue');
    //engine.getScene().setupDebugRenderer('simDiv');
    // store old programs
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
        //$('simScene').hide();
        engine.getScene().getProgramManager().setPrograms(programs, refresh, robotType);
    }
    exports.init = init;
    function getNumRobots() {
        return engine.getScene().getNumberOfRobots();
    }
    exports.getNumRobots = getNumRobots;
    function setPause(pause) {
        engine.getScene().getProgramManager().setProgramPause(pause);
    }
    exports.setPause = setPause;
    function run(refresh, robotType) {
        init(storedPrograms, refresh, robotType);
    }
    exports.run = run;
    /**
     * on stop program
     */
    function stopProgram() {
        // TODO: reset robot?
        engine.getScene().getProgramManager().stopProgram();
        init(storedPrograms, false, storedRobotType);
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
    function resetPose() {
        alert('reset pose');
    }
    exports.resetPose = resetPose;
    function updateDebugMode(debugMode) {
        engine.getScene().getProgramManager().updateDebugMode(debugMode);
    }
    exports.updateDebugMode = updateDebugMode;
    function endDebugging() {
        engine.getScene().getProgramManager().endDebugging();
    }
    exports.endDebugging = endDebugging;
    function interpreterAddEvent(event) {
        engine.getScene().getProgramManager().interpreterAddEvent(event);
    }
    exports.interpreterAddEvent = interpreterAddEvent;
    /**
     * on simulation close
     */
    function cancel() {
        engine.getScene().getProgramManager().stopProgram();
    }
    exports.cancel = cancel;
    var SceneDescription = /** @class */ (function () {
        function SceneDescription(name, description, ID) {
            if (ID === void 0) { ID = null; }
            this.name = name;
            this.description = description;
            if (ID) {
                this.ID = ID;
            }
            else {
                this.ID = name;
            }
        }
        return SceneDescription;
    }());
    exports.SceneDescription = SceneDescription;
    function getScenes() {
        return [
            new SceneDescription('Test Scene', 'Test scene with multiple test implementations')
        ];
    }
    exports.getScenes = getScenes;
    function selectScene(ID) {
        console.log("selected new scene: " + ID);
    }
    exports.selectScene = selectScene;
});
