define(["require", "exports", "dat.gui", "./Timer"], function (require, exports, dat, Timer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.downloadJSONFile = exports.downloadFile = exports.createReflectionGetter = exports.SceneDebug = exports.createDebugGuiRoot = exports.clearDebugGuiRoot = exports.DebugGuiRoot = exports.registerDebugUpdatable = exports.DEBUG_UPDATE_TIMER = exports.PRINT_NON_WRAPPED_ERROR = exports.SEND_LOG = exports.DEBUG = void 0;
    exports.DEBUG = true;
    /**
     * Used in log.js
     */
    exports.SEND_LOG = false;
    /**
     * Used in 'wrap.js' to print the error before it is wrapped
     */
    exports.PRINT_NON_WRAPPED_ERROR = true;
    var updatableList = [];
    exports.DEBUG_UPDATE_TIMER = new Timer_1.Timer(0.5, function () { return updateDebugDisplay(); });
    exports.DEBUG_UPDATE_TIMER.start();
    function updateDebugDisplay() {
        updatableList.forEach(function (element) {
            element.updateDisplay();
        });
    }
    function registerDebugUpdatable(controller) {
        var index = updatableList.indexOf(controller, 0);
        if (index < 0) {
            updatableList.push(controller);
        }
        return controller;
    }
    exports.registerDebugUpdatable = registerDebugUpdatable;
    function clearDebugGuiRoot() {
        if (exports.DebugGuiRoot) {
            exports.DebugGuiRoot.destroy();
            exports.DebugGuiRoot = undefined;
            createDebugGuiRoot();
        }
    }
    exports.clearDebugGuiRoot = clearDebugGuiRoot;
    function createDebugGuiRoot() {
        if (exports.DEBUG && !exports.DebugGuiRoot) {
            exports.DebugGuiRoot = new dat.GUI({ name: 'Debug', autoPlace: true, width: 400 });
            var parent_1 = exports.DebugGuiRoot.domElement.parentElement;
            if (parent_1) {
                // move debug gui up to be visible
                parent_1.style.zIndex = '1000000';
            }
            var style = exports.DebugGuiRoot.domElement.style;
            style.position = 'absolute';
            style.left = '0%';
            style.top = '450';
        }
    }
    exports.createDebugGuiRoot = createDebugGuiRoot;
    createDebugGuiRoot();
    var SceneDebug = /** @class */ (function () {
        function SceneDebug(scene, disabled) {
            this.disabled = disabled;
            this.scene = scene;
            this.createDebugGuiStatic();
        }
        SceneDebug.prototype.clearDebugGuiDynamic = function () {
            if (this.debugGuiDynamic) {
                this.deleteDebugGuiDynamic();
                this.createDebugGuiDynamic();
            }
        };
        SceneDebug.prototype.createDebugGuiDynamic = function () {
            if (exports.DEBUG && !this.disabled && this.debugGuiStatic && !this.debugGuiDynamic) {
                this.debugGuiDynamic = this.debugGuiStatic.addFolder('"Runtime" Debugging');
            }
        };
        SceneDebug.prototype.deleteDebugGuiDynamic = function () {
            var _a;
            if (this.debugGuiDynamic) {
                (_a = this.debugGuiStatic) === null || _a === void 0 ? void 0 : _a.removeFolder(this.debugGuiDynamic);
                this.debugGuiDynamic = undefined;
            }
        };
        SceneDebug.prototype.clearDebugGuiStatic = function () {
            if (this.debugGuiStatic) {
                var dynamic = this.debugGuiDynamic !== undefined;
                this.deleteDebugGuiStatic();
                this.createDebugGuiStatic();
                if (dynamic) {
                    this.createDebugGuiDynamic();
                }
            }
        };
        SceneDebug.prototype.createDebugGuiStatic = function () {
            if (exports.DEBUG && !this.disabled && exports.DebugGuiRoot && !this.debugGuiStatic) {
                this.debugGuiStatic = exports.DebugGuiRoot.addFolder(this.scene.getName());
                this.initSceneDebug();
            }
        };
        SceneDebug.prototype.deleteDebugGuiStatic = function () {
            if (this.debugGuiStatic) {
                exports.DebugGuiRoot === null || exports.DebugGuiRoot === void 0 ? void 0 : exports.DebugGuiRoot.removeFolder(this.debugGuiStatic);
                this.debugGuiStatic = undefined;
                this.debugGuiDynamic = undefined;
            }
        };
        SceneDebug.prototype.destroy = function () {
            // this will also destroy the runtime gui
            this.deleteDebugGuiStatic();
        };
        SceneDebug.prototype.initSceneDebug = function () {
            var scene = this.scene;
            var gui = this.debugGuiStatic;
            gui.add(scene, 'autostartSim');
            gui.add(scene, 'dt').min(0.001).max(0.1).step(0.001).onChange(function (dt) { return scene.setDT(dt); });
            gui.add(scene, 'simSleepTime').min(0.001).max(0.1).step(0.001).onChange(function (s) { return scene.setSimSleepTime(s); });
            gui.add(scene, 'simSpeedupFactor').min(1).max(10000).step(1).onChange(function (dt) { return scene.setDT(dt); });
            gui.add(scene, 'blocklyUpdateSleepTime').min(0.001).max(0.1).step(0.001).onChange(function (s) { return scene.setBlocklyUpdateSleepTime(s); });
            var unit = gui.addFolder('unit converter');
            unit.addUpdatable('m', function () { return scene.unit.getLength(1); });
            unit.addUpdatable('kg', function () { return scene.unit.getMass(1); });
            unit.addUpdatable('s', function () { return scene.unit.getTime(1); });
            var loading = gui.addFolder('loading states');
            loading.addUpdatable('currentlyLoading', createReflectionGetter(this.scene, 'currentlyLoading'));
            loading.addUpdatable('resourcesLoaded', createReflectionGetter(this.scene, 'resourcesLoaded'));
            loading.addUpdatable('hasBeenInitialized', createReflectionGetter(this.scene, 'hasBeenInitialized'));
            loading.addUpdatable('hasFinishedLoading', createReflectionGetter(this.scene, 'hasFinishedLoading'));
            loading.addUpdatable('loadingStartTime', createReflectionGetter(this.scene, 'loadingStartTime'));
            loading.addUpdatable('minLoadTime', createReflectionGetter(this.scene, 'minLoadTime'));
            var robot = gui.addFolder('Robot Manager');
            var rm = scene.getRobotManager();
            robot.add(rm, 'numberOfRobots').min(1).step(1).max(1000);
            robot.add(rm, 'showRobotSensorValues');
            robot.addUpdatable('Actual number of robots', function () { return rm.getRobots().length; });
            var program = robot.addFolder('Program Manager');
            var pm = rm.getProgramManager();
            program.add(pm, 'programPaused');
            program.addUpdatable('debugMode', createReflectionGetter(pm, 'debugMode'));
            program.addUpdatable('initialized', createReflectionGetter(pm, 'initialized'));
            program.addUpdatable('allowBlocklyUpdate', createReflectionGetter(pm, 'allowBlocklyUpdate'));
            var entity = gui.addFolder('Entity Manager');
            var em = scene.getEntityManager();
            entity.addUpdatable('Number of entities', function () { return em.getNumberOfEntities(); });
            entity.addUpdatable('Number of updatable entities', function () { return em.getNumberOfUpdatableEntities(); });
            entity.addUpdatable('Number of drawable physics entities', function () { return em.getNumberOfDrawablePhysicsEntities(); });
        };
        return SceneDebug;
    }());
    exports.SceneDebug = SceneDebug;
    function createReflectionGetter(param, name) {
        return function () { return param[name]; };
    }
    exports.createReflectionGetter = createReflectionGetter;
    dat.GUI.prototype.addButton = function (name, callback) {
        var func = {};
        func[name] = callback;
        return this.add(func, name);
    };
    dat.GUI.prototype.addUpdatable = function (name, callback) {
        var func = {};
        func[name] = callback();
        var gui = this.add(func, name);
        gui.getValue = function () {
            return callback();
        };
        registerDebugUpdatable(gui);
        return gui;
    };
    function downloadFile(filename, data, options) {
        var blob = new Blob(data, options);
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
    exports.downloadFile = downloadFile;
    function downloadJSONFile(filename, data, prettify) {
        if (prettify === void 0) { prettify = true; }
        downloadFile(filename, [JSON.stringify(data, undefined, prettify ? "\t" : undefined)]);
    }
    exports.downloadJSONFile = downloadJSONFile;
    var addFolderFunc = dat.GUI.prototype.addFolder;
    function addFolderToGUI(gui, name, i) {
        var newName = name + ' ' + i;
        if (gui.__folders[newName]) {
            return addFolderToGUI(gui, name, i + 1);
        }
        else {
            return addFolderFunc.apply(gui, [newName]);
        }
    }
    dat.GUI.prototype.addFolder = function (name) {
        if (this.__folders[name]) {
            return addFolderToGUI(this, name, 1);
        }
        return addFolderFunc.apply(this, [name]);
    };
    function removeControllerFromUpdateTimer(controller) {
        var index = updatableList.indexOf(controller, 0);
        if (index > -1) {
            updatableList.splice(index, 1);
            //console.error('Removing dat.GUIController')
        }
    }
    function removeFolderFromUpdateTimer(folder) {
        for (var name_1 in folder.__folders) {
            removeFolderFromUpdateTimer(folder.__folders[name_1]);
        }
        folder.__controllers.forEach(function (controller) { return removeControllerFromUpdateTimer(controller); });
    }
    var removeFolderFromGui = dat.GUI.prototype.removeFolder;
    dat.GUI.prototype.removeFolder = function (sub) {
        removeFolderFromUpdateTimer(sub);
        removeFolderFromGui.call(this, sub);
        //console.log('Removing dat.GUI (Folder)')
    };
    var removeGUIController = dat.GUI.prototype.remove;
    dat.GUI.prototype.remove = function (controller) {
        removeControllerFromUpdateTimer(controller);
        removeGUIController.call(this, controller);
        //console.log('Removing dat.GUIController')
    };
});
