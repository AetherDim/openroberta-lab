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
define(["require", "exports", "./SimulationCache", "../Scene/Scene", "../Scene/ScoreScene", "../SceneRenderer", "./SceneManager", "../EventManager/EventManager"], function (require, exports, SimulationCache_1, Scene_1, ScoreScene_1, SceneRenderer_1, SceneManager_1, EventManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Cyberspace = void 0;
    var Cyberspace = /** @class */ (function () {
        function Cyberspace(canvas, autoResizeTo, scenes) {
            var _a;
            if (scenes === void 0) { scenes = []; }
            this.sceneManager = new SceneManager_1.SceneManager();
            this.simulationCache = new SimulationCache_1.SimulationCache([], "");
            this.eventManager = EventManager_1.EventManager.init({
                /** will be called after the simulation has been started */
                onStartSimulation: EventManager_1.ParameterTypes.none,
                /** will be called after the simulation has been paused */
                onPauseSimulation: EventManager_1.ParameterTypes.none,
                /** will be called after the program has been started */
                onStartPrograms: EventManager_1.ParameterTypes.none,
                /** will be called after the program has been paused or stopped */
                onPausePrograms: EventManager_1.ParameterTypes.none,
                /** will be called after the program has been stopped */
                onStopPrograms: EventManager_1.ParameterTypes.none
            });
            (_a = this.sceneManager).registerScene.apply(_a, __spreadArray([], __read(scenes)));
            // empty scene as default
            var emptyScene = new Scene_1.Scene("");
            this.renderer = new SceneRenderer_1.SceneRender(emptyScene, canvas, this.simulationCache.toRobotSetupData(), autoResizeTo);
            var t = this;
            this.renderer.onSwitchScene(function (scene) { return t.resetEventHandlersOfScene(scene); });
        }
        /* ############################################################################################ */
        /* ####################################### Scene control ###################################### */
        /* ############################################################################################ */
        Cyberspace.prototype.resetEventHandlersOfScene = function (scene) {
            scene.removeAllEventHandlers();
            var eventHandlerLists = this.eventManager.eventHandlerLists;
            var programManagerEventHandlerLists = scene.getProgramManager().eventManager.eventHandlerLists;
            programManagerEventHandlerLists.onStartProgram.pushEventHandleList(eventHandlerLists.onStartPrograms);
            programManagerEventHandlerLists.onPauseProgram.pushEventHandleList(eventHandlerLists.onPausePrograms);
            programManagerEventHandlerLists.onStopProgram.pushEventHandleList(eventHandlerLists.onStopPrograms);
            var sceneEventHandlerLists = scene.eventManager.eventHandlerLists;
            sceneEventHandlerLists.onStartSimulation.pushEventHandleList(eventHandlerLists.onStartSimulation);
            sceneEventHandlerLists.onPauseSimulation.pushEventHandleList(eventHandlerLists.onPauseSimulation);
        };
        Cyberspace.prototype.resetScene = function () {
            this.renderer.getScene().reset(this.simulationCache.toRobotSetupData());
        };
        Cyberspace.prototype.fullResetScene = function () {
            this.renderer.getScene().fullReset(this.simulationCache.toRobotSetupData());
        };
        Cyberspace.prototype.getScene = function () {
            return this.renderer.getScene();
        };
        Cyberspace.prototype.getScoreScene = function () {
            var scene = this.renderer.getScene();
            if (scene instanceof ScoreScene_1.ScoreScene) {
                return scene;
            }
            return undefined;
        };
        Cyberspace.prototype.getScenes = function () {
            return this.sceneManager.getSceneDescriptorList();
        };
        Cyberspace.prototype.switchToScene = function (scene) {
            this.renderer.switchScene(this.simulationCache.toRobotSetupData(), scene);
            if (scene.isLoadingComplete()) {
                this.fullResetScene();
            }
        };
        Cyberspace.prototype.loadScene = function (ID) {
            if (this.getScene().isLoadingComplete()) {
                var scene = this.sceneManager.getScene(ID);
                if (scene) {
                    this.sceneManager.setCurrentScene(ID);
                    this.switchToScene(scene);
                }
            }
        };
        Cyberspace.prototype.switchToNextScene = function (forced) {
            if (forced === void 0) { forced = false; }
            if (forced || this.getScene().isLoadingComplete()) {
                var scene = this.sceneManager.getNextScene();
                if (scene != undefined) {
                    this.switchToScene(scene);
                }
            }
            return this.sceneManager.getCurrentSceneDescriptor();
        };
        Cyberspace.prototype.getSceneManager = function () {
            return this.sceneManager;
        };
        /* ############################################################################################ */
        /* #################################### Simulation control #################################### */
        /* ############################################################################################ */
        Cyberspace.prototype.startSimulation = function () {
            this.getScene().startSim();
        };
        Cyberspace.prototype.pauseSimulation = function () {
            this.getScene().pauseSim();
        };
        Cyberspace.prototype.resetSimulation = function () {
            this.resetScene();
        };
        Cyberspace.prototype.setSimulationSpeedupFactor = function (speedup) {
            this.getScene().setSpeedUpFactor(speedup);
        };
        /* ############################################################################################ */
        /* ##################################### Program control ###################################### */
        /* ############################################################################################ */
        Cyberspace.prototype.getProgramManager = function () {
            return this.getScene().getProgramManager();
        };
        Cyberspace.prototype.startPrograms = function () {
            this.getProgramManager().startProgram();
        };
        Cyberspace.prototype.stopPrograms = function () {
            this.getProgramManager().stopProgram();
        };
        Cyberspace.prototype.resumePrograms = function () {
            this.getProgramManager().startProgram();
        };
        Cyberspace.prototype.pausePrograms = function () {
            this.getProgramManager().pauseProgram();
        };
        Cyberspace.prototype.setPrograms = function (programs) {
            this.getProgramManager().setPrograms(programs);
        };
        Cyberspace.prototype.enableDebugMode = function () {
            this.getProgramManager().startDebugging();
        };
        Cyberspace.prototype.disableDebugMode = function () {
            this.getProgramManager().endDebugging();
        };
        Cyberspace.prototype.registerDebugEventsForAllPrograms = function () {
        };
        Cyberspace.prototype.registerDebugEventsForMainPrograms = function () {
        };
        Cyberspace.prototype.setRobertaRobotSetupData = function (robertaRobotSetupDataList, robotType) {
            var newSimulationCache = new SimulationCache_1.SimulationCache(robertaRobotSetupDataList, robotType);
            var oldCache = this.simulationCache;
            this.simulationCache = newSimulationCache;
            if (!newSimulationCache.hasEqualConfiguration(oldCache)) {
                // sets the robot programs and sensor configurations based on 'simulationCache'
                this.resetScene();
            }
            else {
                // always set the programs
                this.getProgramManager().setPrograms(newSimulationCache.toRobotSetupData().map(function (setup) { return setup.program; }));
            }
        };
        /* ############################################################################################ */
        /* #################################### ScrollView control #################################### */
        /* ############################################################################################ */
        /**
         * Reset zoom of ScrollView
         */
        Cyberspace.prototype.resetView = function () {
            this.renderer.zoomReset();
        };
        /**
         * Zoom into ScrollView
         */
        Cyberspace.prototype.zoomViewIn = function () {
            this.renderer.zoomIn();
        };
        /**
         * zoom out of ScrollView
         */
        Cyberspace.prototype.zoomViewOut = function () {
            this.renderer.zoomOut();
        };
        return Cyberspace;
    }());
    exports.Cyberspace = Cyberspace;
});
