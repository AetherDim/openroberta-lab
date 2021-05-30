define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getJqueryObject = exports.setSimBreak = exports.getBlockById = exports.interpreterSimBreakEventHandlers = void 0;
    exports.interpreterSimBreakEventHandlers = [];
    //This file contains function which allow the interpreter to communicate with the simulation.
    function getBlockById(id) {
        var ws = Blockly.getMainWorkspace();
        if (ws) {
            return ws.getBlockById(id);
        }
        else {
            return null;
        }
    }
    exports.getBlockById = getBlockById;
    function setSimBreak() {
        exports.interpreterSimBreakEventHandlers.forEach(function (handler) { return handler(); });
    }
    exports.setSimBreak = setSimBreak;
    function getJqueryObject(object) {
        return $(object);
    }
    exports.getJqueryObject = getJqueryObject;
});
