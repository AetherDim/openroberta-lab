define(["require", "exports", "./SceneRenderer", "./RRC/AgeGroup", "./RRC/Scene/RRCLineFollowingScene", "./Scene/Scene", "./Scene/TestScene", "./Scene/TestScene2", "./RRC/Scene/RRCRainbowScene", "./RRC/Scene/RRCScene", "./RRC/Scene/RRCLabyrinthScene", "./Scene/TestScene3", "./Util", "./GlobalDebug", "./pixijs", "./ExtendedMatter"], function (require, exports, SceneRenderer_1, AgeGroup_1, RRCLineFollowingScene_1, Scene_1, TestScene_1, TestScene2_1, RRCRainbowScene_1, RRCScene_1, RRCLabyrinthScene_1, TestScene3_1, Util_1, GlobalDebug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setSimSpeed = exports.zoomReset = exports.zoomOut = exports.zoomIn = exports.score = exports.sim = exports.nextScene = exports.selectScene = exports.getScenes = exports.cancel = exports.interpreterAddEvent = exports.endDebugging = exports.updateDebugMode = exports.resetPose = exports.setInfo = exports.importImage = exports.stopProgram = exports.run = exports.setPause = exports.getNumRobots = exports.init = exports.SceneManager = exports.SceneDescriptor = void 0;
    // TODO: check whether this has to be defined in here
    // probably not
    var SceneDescriptor = /** @class */ (function () {
        function SceneDescriptor(name, ID, description, creteScene) {
            this.name = name;
            this.description = description;
            this.ID = ID;
            this._createScene = creteScene;
        }
        SceneDescriptor.prototype.createScene = function () {
            return this._createScene(this);
        };
        return SceneDescriptor;
    }());
    exports.SceneDescriptor = SceneDescriptor;
    var SceneManager = /** @class */ (function () {
        function SceneManager() {
            this.sceneHandleMap = new Map();
            this.sceneMap = new Map();
        }
        SceneManager.prototype.getScene = function (ID) {
            var scene = this.sceneMap.get(ID);
            if (!scene) {
                var sceneHandle = this.sceneHandleMap.get(ID);
                if (sceneHandle) {
                    scene = sceneHandle.createScene();
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
                return undefined;
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
            if (this.currentID) {
                return this.sceneHandleMap.get(this.currentID);
            }
            return undefined;
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
    if (GlobalDebug_1.DEBUG)
        sceneManager.registerScene(
        //
        // Test
        //
        new SceneDescriptor('Test Scene', 'TestScene', 'Test scene with all sim features', function (descriptor) {
            return new TestScene_1.TestScene(descriptor.name);
        }), new SceneDescriptor("Test Scene 2", "TestScene2", "T", function (descriptor) { return new TestScene2_1.TestScene2(descriptor.name, AgeGroup_1.AgeGroup.ES); }), new SceneDescriptor("Test Scene 3", "TestScene3", "Test scene for testing the robot", function (descriptor) { return new TestScene3_1.TestScene3(); }), new SceneDescriptor('Empty Scene', 'EmptyScene', 'Empty Scene', function (descriptor) {
            return new Scene_1.Scene(descriptor.name);
        }), new SceneDescriptor('RRC - Test Scene', 'RRCTest', 'Roborave Cyberspace Test', function (descriptor) {
            return new RRCScene_1.RRCScene(descriptor.name, AgeGroup_1.AgeGroup.ES);
        }));
    sceneManager.registerScene(
    //
    //  Line Following
    //
    new SceneDescriptor('RRC - Line Following - ES', 'RRCLineFollowingES', 'Roborave Cyberspace line following ES', function (descriptor) {
        return new RRCLineFollowingScene_1.RRCLineFollowingScene(descriptor.name, AgeGroup_1.AgeGroup.ES);
    }), new SceneDescriptor('RRC - Line Following - MS', 'RRCLineFollowingMS', 'Roborave Cyberspace line following MS', function (descriptor) {
        return new RRCLineFollowingScene_1.RRCLineFollowingScene(descriptor.name, AgeGroup_1.AgeGroup.MS);
    }), new SceneDescriptor('RRC - Line Following - HS', 'RRCLineFollowingHS', 'Roborave Cyberspace line following HS', function (descriptor) {
        return new RRCLineFollowingScene_1.RRCLineFollowingScene(descriptor.name, AgeGroup_1.AgeGroup.HS);
    }), 
    //
    // Rainbow
    //
    new SceneDescriptor('RRC - Rainbow - ES', 'RRCRainbowES', 'Roborave Cyberspace Rainbow ES', function (descriptor) {
        return new RRCRainbowScene_1.RRCRainbowScene(descriptor.name, AgeGroup_1.AgeGroup.ES);
    }), new SceneDescriptor('RRC - Rainbow - MS', 'RRCRainbowMS', 'Roborave Cyberspace Rainbow MS', function (descriptor) {
        return new RRCRainbowScene_1.RRCRainbowScene(descriptor.name, AgeGroup_1.AgeGroup.MS);
    }), new SceneDescriptor('RRC - Rainbow - HS', 'RRCRainbowHS', 'Roborave Cyberspace Rainbow HS', function (descriptor) {
        return new RRCRainbowScene_1.RRCRainbowScene(descriptor.name, AgeGroup_1.AgeGroup.HS);
    }), 
    //
    // Labyrinth
    //
    new SceneDescriptor('RRC - Labyrinth - ES', 'RRCLabyrinthES', 'Roborave Cyberspace Labyrinth ES', function (descriptor) {
        return new RRCLabyrinthScene_1.RRCLabyrinthScene(descriptor.name, AgeGroup_1.AgeGroup.ES);
    }), new SceneDescriptor('RRC - Labyrinth - MS', 'RRCLabyrinthMS', 'Roborave Cyberspace Labyrinth MS', function (descriptor) {
        return new RRCLabyrinthScene_1.RRCLabyrinthScene(descriptor.name, AgeGroup_1.AgeGroup.MS);
    }), new SceneDescriptor('RRC - Labyrinth - HS', 'RRCLabyrinthHS', 'Roborave Cyberspace Labyrinth HS', function (descriptor) {
        return new RRCLabyrinthScene_1.RRCLabyrinthScene(descriptor.name, AgeGroup_1.AgeGroup.HS);
    }));
    //
    // create engine
    //
    var engine = new SceneRenderer_1.SceneRender('sceneCanvas', true, 'simDiv', sceneManager.getNextScene());
    //engine.getScene().setupDebugRenderer('notConstantValue');
    //engine.getScene().setupDebugRenderer('simDiv');
    /**
     * @param programs
     * @param refresh `true` if "SIM" is pressed, `false` if play is pressed
     * @param robotType
     */
    function init(programs, refresh, robotType) {
        function toProgramEqualityObject(p) {
            return {
                javaScriptConfiguration: p.javaScriptConfiguration
            };
        }
        var hasNewConfiguration = !Util_1.Util.deepEqual(programs.map(toProgramEqualityObject), Util_1.Util.simulation.storedPrograms.map(toProgramEqualityObject));
        Util_1.Util.simulation.storedPrograms = programs;
        Util_1.Util.simulation.storedRobotType = robotType;
        //$('simScene').hide();
        // TODO: prevent clicking run twice
        var configurationManager = engine.getScene().getRobotManager().configurationManager;
        configurationManager.setRobotConfigurations(programs.map(function (p) { return p.javaScriptConfiguration; }));
        engine.getScene().getProgramManager().setPrograms(programs, refresh, robotType);
        if (hasNewConfiguration) {
            engine.getScene().reset();
        }
    }
    exports.init = init;
    function getNumRobots() {
        return engine.getScene().getRobotManager().getNumberOfRobots();
    }
    exports.getNumRobots = getNumRobots;
    function setPause(pause) {
        engine.getScene().getProgramManager().setProgramPause(pause);
    }
    exports.setPause = setPause;
    function run(refresh, robotType) {
        init(Util_1.Util.simulation.storedPrograms, refresh, robotType);
    }
    exports.run = run;
    /**
     * on stop program
     */
    function stopProgram() {
        // TODO: reset robot?
        engine.getScene().getProgramManager().stopProgram();
        init(Util_1.Util.simulation.storedPrograms, false, Util_1.Util.simulation.storedRobotType);
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
        var _a;
        (_a = engine.getScene()) === null || _a === void 0 ? void 0 : _a.reset();
        //engine.getScene()?.fullReset();
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
    function sim(run) {
        if (run) {
            engine.getScene().startSim();
        }
        else {
            engine.getScene().pauseSim();
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
        engine.zoomIn();
    }
    exports.zoomIn = zoomIn;
    function zoomOut() {
        engine.zoomOut();
    }
    exports.zoomOut = zoomOut;
    function zoomReset() {
        engine.zoomReset();
    }
    exports.zoomReset = zoomReset;
    function setSimSpeed(speedup) {
        engine.setSpeedUpFactor(speedup);
    }
    exports.setSimSpeed = setSimSpeed;
});
