define(["require", "exports", "dat.gui"], function (require, exports, dat) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.clearDebugGui = exports.DebugGui = exports.DEBUG = void 0;
    exports.DEBUG = true;
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
    dat.GUI.prototype.addDownloadButton = function (name, filename, dataCallback) {
        var func = {};
        func[name] = function () {
            var blob = new Blob(dataCallback(), { type: "application/pdf" });
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        };
        this.add(func, name);
    };
});
