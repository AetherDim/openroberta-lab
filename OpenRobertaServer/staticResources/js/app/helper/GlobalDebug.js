define(["require", "exports", "dat.gui"], function (require, exports, dat) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugGui = void 0;
    var HIDE_DATGUI = false;
    // Creating a GUI and a subfolder.
    exports.DebugGui = new dat.GUI({ name: 'My GUI', autoPlace: !HIDE_DATGUI });
    exports.DebugGui.close();
    var parent = exports.DebugGui.domElement.parentElement;
    if (parent) {
        parent.style.zIndex = '1000000';
    }
});
