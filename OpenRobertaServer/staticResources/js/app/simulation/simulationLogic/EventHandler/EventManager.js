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
define(["require", "exports", "./EventHandlerList"], function (require, exports, EventHandlerList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventManager = exports.ParameterTypes = void 0;
    var ParameterTypes = /** @class */ (function () {
        function ParameterTypes() {
        }
        ParameterTypes.none = new ParameterTypes();
        return ParameterTypes;
    }());
    exports.ParameterTypes = ParameterTypes;
    var EventManager = /** @class */ (function () {
        function EventManager() {
            this.eventHandlerLists = {};
        }
        EventManager.prototype.removeAllEventHandlers = function () {
            var _this = this;
            Object.keys(this.eventHandlerLists).forEach(function (key) {
                _this.eventHandlerLists[key].removeAllEventHandlers();
            });
        };
        EventManager.init = function (value) {
            var eventManager = new EventManager();
            // for each key of 'value' which has a 'EventHandlerList'
            Object.keys(value).forEach(function (key) {
                var valueKey = key;
                var handlerList = value[valueKey];
                if (handlerList instanceof ParameterTypes) {
                    // add method which
                    //  - takes an event handler
                    //  - adds it to the appropriate list
                    //  - returns the EventManager as EventManagerI
                    eventManager.eventHandlerLists[valueKey] = new EventHandlerList_1.EventHandlerList();
                    eventManager[key + "CallHandlers"] = function () {
                        var _a;
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        (_a = eventManager.eventHandlerLists[valueKey]).callHandlers.apply(_a, __spreadArray([], __read(args)));
                    };
                    eventManager[valueKey] = function (eventHandler) {
                        eventManager.eventHandlerLists[valueKey].pushEventHandler(eventHandler);
                        return eventManager;
                    };
                }
            });
            return eventManager;
        };
        return EventManager;
    }());
    exports.EventManager = EventManager;
});
