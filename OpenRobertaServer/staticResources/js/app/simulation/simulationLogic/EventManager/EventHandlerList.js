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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventHandlerList = void 0;
    var EventHandlerList = /** @class */ (function () {
        function EventHandlerList() {
            this.eventHandlers = [];
        }
        EventHandlerList.prototype.pushEventHandler = function (eventHandler) {
            this.eventHandlers.push(eventHandler);
        };
        EventHandlerList.prototype.pushEventHandleList = function (eventHandlerList) {
            var _this = this;
            eventHandlerList.eventHandlers.forEach(function (handler) {
                _this.eventHandlers.push(handler);
            });
        };
        EventHandlerList.prototype.callHandlers = function () {
            var arg = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                arg[_i] = arguments[_i];
            }
            this.eventHandlers.forEach(function (func) { return func.apply(void 0, __spreadArray([], __read(arg))); });
        };
        EventHandlerList.prototype.removeAllEventHandlers = function () {
            this.eventHandlers.length = 0;
        };
        return EventHandlerList;
    }());
    exports.EventHandlerList = EventHandlerList;
});
