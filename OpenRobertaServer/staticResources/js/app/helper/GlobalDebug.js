define(["require", "exports", "dat.gui", "./Timer"], function (require, exports, dat, Timer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.downloadJSONFile = exports.downloadFile = exports.createReflectionGetter = exports.SceneDebug = exports.initGlobalSceneDebug = exports.createDebugGuiRoot = exports.clearDebugGuiRoot = exports.DebugGuiRoot = exports.registerDebugUpdatable = exports.DEBUG_UPDATE_TIMER = exports.PRINT_NON_WRAPPED_ERROR = exports.SEND_LOG = exports.DEBUG = void 0;
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
            try {
                element.updateDisplay();
            }
            catch (e) {
                console.warn("An updatable debug element threw an error:");
                console.warn(e);
                element.remove();
            }
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
            //const style = DebugGuiRoot.domElement.style
            //style.position = 'absolute'
            //style.left = '70%'
            //style.top = '500'
            registerSearchBar();
        }
    }
    exports.createDebugGuiRoot = createDebugGuiRoot;
    createDebugGuiRoot();
    function registerSearchBar() {
        var fieldName = "Search:";
        var search = {};
        search[fieldName] = "";
        var searchField = exports.DebugGuiRoot.add(search, fieldName);
        searchField.onChange(function (search) {
            console.log(search);
            searchGUI(search, searchField);
        });
    }
    function nameContains(searchParams, name) {
        name = name.toLowerCase();
        return searchParams.map(function (param) { return name.includes(param); }).every(function (v) { return v === true; });
    }
    function searchGUI(search, ignoreController) {
        search = search.trim().toLowerCase();
        if (search.length == 0) {
            resetAllFolders(exports.DebugGuiRoot);
        }
        else {
            var searchParams = search.split(' ').filter(function (el) { return el.trim().length > 0; });
            for (var key in exports.DebugGuiRoot.__folders) {
                _searchGUI(exports.DebugGuiRoot.__folders[key], searchParams);
            }
            _searchGUIElements(exports.DebugGuiRoot, searchParams, ignoreController);
        }
    }
    function resetAllFolders(gui, ignoreFirst) {
        if (ignoreFirst === void 0) { ignoreFirst = true; }
        if (!ignoreFirst) {
            gui.show();
            gui.close();
            setFolderColor(gui, null);
        }
        gui.__controllers.forEach(function (controller) {
            setControllerColor(controller, null);
        });
        for (var key in gui.__folders) {
            resetAllFolders(gui.__folders[key], false);
        }
    }
    function setFolderColor(gui, color) {
        var element = gui.domElement.getElementsByClassName("title").item(0);
        element.style.backgroundColor = color;
    }
    function setControllerColor(controller, color) {
        controller.domElement.parentElement.parentElement.style.backgroundColor = color;
    }
    function _searchGUI(gui, searchParams) {
        var hasElementName = _searchGUIElements(gui, searchParams);
        for (var key in gui.__folders) {
            var subGui = gui.__folders[key];
            if (_searchGUI(subGui, searchParams)) {
                hasElementName = true;
            }
        }
        var foundThisFolder = nameContains(searchParams, gui.name);
        hasElementName = hasElementName || foundThisFolder;
        if (hasElementName) {
            gui.show(); // TODO: need both?
            gui.open();
            if (foundThisFolder) {
                setFolderColor(gui, 'green');
            }
            else {
                setFolderColor(gui, '#084E08');
            }
        }
        else {
            gui.hide();
            //gui.close()
            setFolderColor(gui, null);
        }
        return hasElementName;
    }
    function _searchGUIElements(gui, searchParams, ignoreController) {
        var hasElementName = false;
        gui.__controllers.forEach(function (controller) {
            if (nameContains(searchParams, controller.property) && controller !== ignoreController) {
                setControllerColor(controller, 'green');
                hasElementName = true;
            }
            else {
                setControllerColor(controller, null);
            }
        });
        return hasElementName;
    }
    function initGlobalSceneDebug(sceneRenderer) {
        if (!exports.DEBUG) {
            return;
        }
        var rendererFolder = exports.DebugGuiRoot.addFolder('Renderer');
        rendererFolder.addUpdatable('FPS', function () { return sceneRenderer.app.ticker.FPS; });
        rendererFolder.addUpdatable('Screen width', function () { return sceneRenderer.app.screen.width; });
        rendererFolder.addUpdatable('Screen height', function () { return sceneRenderer.app.screen.height; });
        rendererFolder.addUpdatable('devicePixelRatio', function () { return window.devicePixelRatio || 0.75; });
        var debug = exports.DebugGuiRoot.addFolder('Special Debug Functions');
        debug.addButton('Add color sensors to robot', function () {
            var robot = sceneRenderer.getScene().getRobotManager().getRobots()[0];
            var count = 0;
            var range = 0.2;
            for (var x = -range; x < range; x += 0.02) {
                for (var y = -range; y < range; y += 0.02) {
                    robot.addColorSensor('SP' + count++, x, y, 0.01);
                }
            }
        });
    }
    exports.initGlobalSceneDebug = initGlobalSceneDebug;
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
            gui.add(scene, 'simSpeedupFactor').min(1).max(1000).step(1).onChange(function (dt) { return scene.setDT(dt); });
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
