define(["require", "exports", "dat.gui"], function (require, exports, dat) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.downloadJSONFile = exports.downloadFile = exports.clearDebugGui = exports.DebugGui = exports.PRINT_NON_WRAPPED_ERROR = exports.SEND_LOG = exports.DEBUG = void 0;
    exports.DEBUG = true;
    exports.SEND_LOG = false;
    /**
     * Used in 'wrap.js' to print the error before it is wrapped
     */
    exports.PRINT_NON_WRAPPED_ERROR = true;
    clearDebugGui();
    function clearDebugGui() {
        if (exports.DEBUG) {
            if (exports.DebugGui) {
                exports.DebugGui.destroy();
            }
            exports.DebugGui = new dat.GUI({ name: 'Debug', autoPlace: exports.DEBUG });
            var parent_1 = exports.DebugGui.domElement.parentElement;
            if (parent_1 && exports.DEBUG) {
                parent_1.style.zIndex = '1000000';
            }
        }
    }
    exports.clearDebugGui = clearDebugGui;
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
    dat.GUI.prototype.addButton = function (name, callback) {
        var func = {};
        func[name] = callback;
        this.add(func, name);
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
});
