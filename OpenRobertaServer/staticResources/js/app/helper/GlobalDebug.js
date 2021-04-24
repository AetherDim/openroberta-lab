define(["require", "exports", "dat.gui", "./Timer"], function (require, exports, dat, Timer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.downloadJSONFile = exports.downloadFile = exports.SceneDebug = exports.createDebugGuiRoot = exports.clearDebugGuiRoot = exports.DebugGuiRoot = exports.PRINT_NON_WRAPPED_ERROR = exports.SEND_LOG = exports.DEBUG = void 0;
    exports.DEBUG = true;
    /**
     * Used in log.js
     */
    exports.SEND_LOG = false;
    /**
     * Used in 'wrap.js' to print the error before it is wrapped
     */
    exports.PRINT_NON_WRAPPED_ERROR = true;
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
            exports.DebugGuiRoot = new dat.GUI({ name: 'Debug', autoPlace: exports.DEBUG });
            var parent_1 = exports.DebugGuiRoot.domElement.parentElement;
            if (parent_1) {
                // move debug gui up to be visible
                parent_1.style.zIndex = '1000000';
            }
        }
    }
    exports.createDebugGuiRoot = createDebugGuiRoot;
    createDebugGuiRoot();
    var SceneDebug = /** @class */ (function () {
        function SceneDebug(scene, disabled) {
            var _this = this;
            this.disabled = disabled;
            this.scene = scene;
            this.createDebugGuiStatic();
            if (exports.DEBUG && !disabled) {
                this.updateTimer = new Timer_1.Timer(0.5, function () { var _a; return (_a = _this.debugGuiStatic) === null || _a === void 0 ? void 0 : _a.updateDisplay(); });
                this.updateTimer.start();
            }
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
                this.debugGuiDynamic.destroy();
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
            }
        };
        SceneDebug.prototype.deleteDebugGuiStatic = function () {
            if (this.debugGuiStatic) {
                exports.DebugGuiRoot === null || exports.DebugGuiRoot === void 0 ? void 0 : exports.DebugGuiRoot.removeFolder(this.debugGuiStatic);
                this.debugGuiStatic.destroy();
                this.debugGuiStatic = undefined;
                this.debugGuiDynamic = undefined;
            }
        };
        SceneDebug.prototype.destroy = function () {
            // this will also destroy the runtime gui
            this.deleteDebugGuiStatic();
        };
        return SceneDebug;
    }());
    exports.SceneDebug = SceneDebug;
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
});
