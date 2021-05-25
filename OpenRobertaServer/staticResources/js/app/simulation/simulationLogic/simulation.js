define(["require", "exports", "./RRC/AgeGroup", "./RRC/Scene/RRCLineFollowingScene", "./Scene/Scene", "./Scene/TestScene", "./Scene/TestScene2", "./RRC/Scene/RRCRainbowScene", "./RRC/Scene/RRCScene", "./RRC/Scene/RRCLabyrinthScene", "./Scene/TestScene3", "./GlobalDebug", "./Cyberspace/Cyberspace", "./Cyberspace/SceneManager", "./BlocklyDebug", "./pixijs", "./ExtendedMatter"], function (require, exports, AgeGroup_1, RRCLineFollowingScene_1, Scene_1, TestScene_1, TestScene2_1, RRCRainbowScene_1, RRCScene_1, RRCLabyrinthScene_1, TestScene3_1, GlobalDebug_1, Cyberspace_1, SceneManager_1, BlocklyDebug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setSimSpeed = exports.zoomReset = exports.zoomOut = exports.zoomIn = exports.score = exports.sim = exports.nextScene = exports.selectScene = exports.getScenes = exports.cancel = exports.interpreterAddEvent = exports.endDebugging = exports.updateDebugMode = exports.resetPose = exports.setInfo = exports.importImage = exports.stopProgram = exports.run = exports.setPause = exports.getNumRobots = exports.init = void 0;
    //
    // init all components for a simulation
    //
    var cyberspace = new Cyberspace_1.Cyberspace('sceneCanvas', 'simDiv');
    var sceneManager = cyberspace.getSceneManager();
    var blocklyDebugManager = new BlocklyDebug_1.BlocklyDebug(cyberspace);
    //
    // register scenes
    //
    if (GlobalDebug_1.DEBUG)
        sceneManager.registerScene(
        //
        // Test
        //
        new SceneManager_1.SceneDescriptor('Test Scene', 'Test scene with all sim features', function (descriptor) {
            return new TestScene_1.TestScene(descriptor.name);
        }), new SceneManager_1.SceneDescriptor("Test Scene 2", "Test scene for testing different sensor configurations", function (descriptor) { return new TestScene2_1.TestScene2(descriptor.name, AgeGroup_1.AgeGroup.ES); }), new SceneManager_1.SceneDescriptor("Test Scene 3", "Test scene for generating calibration data for the robot", function (descriptor) { return new TestScene3_1.TestScene3(); }), new SceneManager_1.SceneDescriptor('Empty Scene', 'Empty Scene', function (descriptor) {
            return new Scene_1.Scene(descriptor.name);
        }), new SceneManager_1.SceneDescriptor('RRC - Test Scene', 'Roborave Cyberspace Test', function (descriptor) {
            return new RRCScene_1.RRCScene(descriptor.name, AgeGroup_1.AgeGroup.ES);
        }));
    sceneManager.registerScene(
    //
    //  Line Following
    //
    new SceneManager_1.SceneDescriptor('RRC - Line Following - ES', 'Roborave Cyberspace line following ES', function (descriptor) {
        return new RRCLineFollowingScene_1.RRCLineFollowingScene(descriptor.name, AgeGroup_1.AgeGroup.ES);
    }), new SceneManager_1.SceneDescriptor('RRC - Line Following - MS', 'Roborave Cyberspace line following MS', function (descriptor) {
        return new RRCLineFollowingScene_1.RRCLineFollowingScene(descriptor.name, AgeGroup_1.AgeGroup.MS);
    }), new SceneManager_1.SceneDescriptor('RRC - Line Following - HS', 'Roborave Cyberspace line following HS', function (descriptor) {
        return new RRCLineFollowingScene_1.RRCLineFollowingScene(descriptor.name, AgeGroup_1.AgeGroup.HS);
    }), 
    //
    // Labyrinth
    //
    new SceneManager_1.SceneDescriptor('RRC - Labyrinth - ES', 'Roborave Cyberspace Labyrinth ES', function (descriptor) {
        return new RRCLabyrinthScene_1.RRCLabyrinthScene(descriptor.name, AgeGroup_1.AgeGroup.ES);
    }), new SceneManager_1.SceneDescriptor('RRC - Labyrinth - MS', 'Roborave Cyberspace Labyrinth MS', function (descriptor) {
        return new RRCLabyrinthScene_1.RRCLabyrinthScene(descriptor.name, AgeGroup_1.AgeGroup.MS);
    }), new SceneManager_1.SceneDescriptor('RRC - Labyrinth - HS', 'Roborave Cyberspace Labyrinth HS', function (descriptor) {
        return new RRCLabyrinthScene_1.RRCLabyrinthScene(descriptor.name, AgeGroup_1.AgeGroup.HS);
    }), 
    //
    // Rainbow
    //
    new SceneManager_1.SceneDescriptor('RRC - Rainbow - ES', 'Roborave Cyberspace Rainbow ES', function (descriptor) {
        return new RRCRainbowScene_1.RRCRainbowScene(descriptor.name, AgeGroup_1.AgeGroup.ES);
    }), new SceneManager_1.SceneDescriptor('RRC - Rainbow - MS', 'Roborave Cyberspace Rainbow MS', function (descriptor) {
        return new RRCRainbowScene_1.RRCRainbowScene(descriptor.name, AgeGroup_1.AgeGroup.MS);
    }), new SceneManager_1.SceneDescriptor('RRC - Rainbow - HS', 'Roborave Cyberspace Rainbow HS', function (descriptor) {
        return new RRCRainbowScene_1.RRCRainbowScene(descriptor.name, AgeGroup_1.AgeGroup.HS);
    }));
    // switch to first scene
    cyberspace.switchToNextScene();
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
    function score(score) {
        if (score) {
            //engine.getScene().showScoreScreen(0);
        }
        else {
            //engine.getScene().hideScore();
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
