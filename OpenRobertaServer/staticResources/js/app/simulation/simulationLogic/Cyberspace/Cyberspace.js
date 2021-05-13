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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
define(["require", "exports", "../Scene/ScoreScene", "../SceneRenderer", "./SceneManager"], function (require, exports, ScoreScene_1, SceneRenderer_1, SceneManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Cyberspace = void 0;
    var Cyberspace = /** @class */ (function () {
        function Cyberspace(canvas, autoResizeTo, scenes) {
            var _a;
            if (scenes === void 0) { scenes = []; }
            this.sceneManager = new SceneManager_1.SceneManager();
            (_a = this.sceneManager).registerScene.apply(_a, __spread(scenes));
            this.renderer = new SceneRenderer_1.SceneRender(canvas, true, autoResizeTo, this.sceneManager.getNextScene());
        }
        /* ############################################################################################ */
        /* ####################################### Scene control ###################################### */
        /* ############################################################################################ */
        Cyberspace.prototype.resetScene = function () {
            this.renderer.getScene().reset();
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
        Cyberspace.prototype.loadScene = function (ID) {
            if (this.getScene().isLoadingComplete()) {
                var scene = this.sceneManager.getScene(ID);
                if (scene) {
                    this.sceneManager.setCurrentScene(ID);
                    this.renderer.switchScene(scene);
                }
            }
        };
        Cyberspace.prototype.nextScene = function () {
            if (this.getScene().isLoadingComplete()) {
                var scene = this.sceneManager.getNextScene();
                if (scene) {
                    this.renderer.switchScene(scene);
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
            this.getProgramManager().setProgramPause(false);
        };
        Cyberspace.prototype.pausePrograms = function () {
            this.getProgramManager().setProgramPause(true);
        };
        Cyberspace.prototype.resetPrograms = function () {
            this.getProgramManager().resetProgram();
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
        Cyberspace.prototype.setRobotConfig = function () {
            // TODO
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
