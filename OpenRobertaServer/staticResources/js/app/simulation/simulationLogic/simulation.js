define(["require", "exports", "./SceneRenderer", "./RRC/AgeGroup", "./RRC/Scene/RRCLineFollowingScene", "./Scene/Scene", "./Scene/TestScene", "./RRC/Scene/RRCRainbowScene", "./RRC/Scene/RRCScene", "./RRC/Scene/RRCLabyrinthScene", "./pixijs", "./ExtendedMatter"], function (require, exports, SceneRenderer_1, AgeGroup_1, RRCLineFollowingScene_1, Scene_1, TestScene_1, RRCRainbowScene_1, RRCScene_1, RRCLabyrinthScene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nextScene = exports.selectScene = exports.getScenes = exports.cancel = exports.interpreterAddEvent = exports.endDebugging = exports.updateDebugMode = exports.resetPose = exports.setInfo = exports.importImage = exports.stopProgram = exports.run = exports.setPause = exports.getNumRobots = exports.init = exports.SceneManager = exports.SceneHandle = void 0;
    // TODO: check whether this has to be defined in here
    // probably not
    var SceneHandle = /** @class */ (function () {
        function SceneHandle(name, ID, description, creteScene) {
            this.name = name;
            this.description = description;
            this.ID = ID;
            this.creteScene = creteScene;
        }
        return SceneHandle;
    }());
    exports.SceneHandle = SceneHandle;
    var SceneManager = /** @class */ (function () {
        function SceneManager() {
            this.sceneHandleMap = new Map();
            this.sceneMap = new Map();
            this.currentID = null;
        }
        SceneManager.prototype.getScene = function (ID) {
            var scene = this.sceneMap.get(ID);
            if (!scene) {
                var sceneHandle = this.sceneHandleMap.get(ID);
                if (sceneHandle) {
                    scene = sceneHandle.creteScene();
                    this.sceneMap.set(ID, scene);
                }
            }
            return scene;
        };
        SceneManager.prototype.registerScene = function () {
            var _this = this;
            var sceneHandles = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                sceneHandles[_i] = arguments[_i];
            }
            sceneHandles.forEach(function (handle) {
                if (_this.sceneHandleMap.get(handle.ID)) {
                    console.error('Scene with ID: ' + handle.ID + ' already registered!!!');
                    return;
                }
                _this.sceneHandleMap.set(handle.ID, handle);
            });
        };
        SceneManager.prototype.getSceneHandleList = function () {
            return Array.from(this.sceneHandleMap.values());
        };
        SceneManager.prototype.getNextScene = function () {
            if (this.sceneHandleMap.size < 1) {
                console.error('No scenes registered!!!');
                return null;
            }
            if (!this.currentID) {
                this.currentID = Array.from(this.sceneHandleMap.keys())[0];
                return this.getScene(this.currentID);
            }
            var keys = Array.from(this.sceneHandleMap.keys());
            var idx = keys.indexOf(this.currentID);
            if (idx >= 0) {
                idx++;
                if (idx >= keys.length) {
                    idx = 0;
                }
                this.currentID = keys[idx];
            }
            else {
                // one loop around
                this.currentID = Array.from(this.sceneHandleMap.keys())[0];
            }
            return this.getScene(this.currentID);
        };
        SceneManager.prototype.getCurrentHandle = function () {
            return this.sceneHandleMap.get(this.currentID);
        };
        SceneManager.prototype.setCurrentScene = function (ID) {
            this.currentID = ID;
        };
        return SceneManager;
    }());
    exports.SceneManager = SceneManager;
    var sceneManager = new SceneManager();
    //
    // register scenes
    //
    sceneManager.registerScene(
    //
    // Test
    //
    new SceneHandle('Test Scene', 'TestScene', 'Test scene with all sim features', function () {
        return new TestScene_1.TestScene();
    }), new SceneHandle('Empty Scene', 'EmptyScene', 'Empty Scene', function () {
        return new Scene_1.Scene();
    }), new SceneHandle('RRC - Test Scene', 'RRCTest', 'Roborave Cyberspace Test', function () {
        return new RRCScene_1.RRCScene(AgeGroup_1.AgeGroup.ES);
    }), 
    //
    //  Line Following
    //
    new SceneHandle('RRC - Line Following - ES', 'RRCLineFollowingES', 'Roborave Cyberspace line following ES', function () {
        return new RRCLineFollowingScene_1.RRCLineFollowingScene(AgeGroup_1.AgeGroup.ES);
    }), new SceneHandle('RRC - Line Following - MS', 'RRCLineFollowingMS', 'Roborave Cyberspace line following MS', function () {
        return new RRCLineFollowingScene_1.RRCLineFollowingScene(AgeGroup_1.AgeGroup.MS);
    }), new SceneHandle('RRC - Line Following - HS', 'RRCLineFollowingHS', 'Roborave Cyberspace line following HS', function () {
        return new RRCLineFollowingScene_1.RRCLineFollowingScene(AgeGroup_1.AgeGroup.HS);
    }), 
    //
    // Rainbow
    //
    new SceneHandle('RRC - Rainbow - ES', 'RRCRainbowES', 'Roborave Cyberspace Rainbow ES', function () {
        return new RRCRainbowScene_1.RRCRainbowScene(AgeGroup_1.AgeGroup.ES);
    }), new SceneHandle('RRC - Rainbow - MS', 'RRCRainbowMS', 'Roborave Cyberspace Rainbow MS', function () {
        return new RRCRainbowScene_1.RRCRainbowScene(AgeGroup_1.AgeGroup.MS);
    }), new SceneHandle('RRC - Rainbow - HS', 'RRCRainbowHS', 'Roborave Cyberspace Rainbow HS', function () {
        return new RRCRainbowScene_1.RRCRainbowScene(AgeGroup_1.AgeGroup.HS);
    }), 
    //
    // Labyrinth
    //
    new SceneHandle('RRC - Labyrinth - ES', 'RRCLabyrinthES', 'Roborave Cyberspace Labyrinth ES', function () {
        return new RRCLabyrinthScene_1.RRCLabyrinthScene(AgeGroup_1.AgeGroup.ES);
    }), new SceneHandle('RRC - Labyrinth - MS', 'RRCLabyrinthMS', 'Roborave Cyberspace Labyrinth MS', function () {
        return new RRCLabyrinthScene_1.RRCLabyrinthScene(AgeGroup_1.AgeGroup.MS);
    }), new SceneHandle('RRC - Labyrinth - HS', 'RRCLabyrinthHS', 'Roborave Cyberspace Labyrinth HS', function () {
        return new RRCLabyrinthScene_1.RRCLabyrinthScene(AgeGroup_1.AgeGroup.HS);
    }));
    //
    // create engine
    //
    var engine = new SceneRenderer_1.SceneRender('sceneCanvas', 'simDiv', sceneManager.getNextScene());
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
        var _a;
        (_a = engine.getScene()) === null || _a === void 0 ? void 0 : _a.reset();
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
    //
    // Scene selection functions
    //
    function getScenes() {
        return sceneManager.getSceneHandleList();
    }
    exports.getScenes = getScenes;
    function selectScene(ID) {
        var scene = sceneManager.getScene(ID);
        sceneManager.setCurrentScene(ID);
        engine.switchScene(scene, true);
        scene === null || scene === void 0 ? void 0 : scene.fullReset();
    }
    exports.selectScene = selectScene;
    function nextScene() {
        var scene = sceneManager.getNextScene();
        engine.switchScene(scene, true);
        scene === null || scene === void 0 ? void 0 : scene.fullReset();
        return sceneManager.getCurrentHandle();
    }
    exports.nextScene = nextScene;
});
