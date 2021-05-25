/**
 * This is essentially an implementation of a simple promise.
 * TODO: switch to actual promises?
 */
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
    exports.AsyncChain = exports.AsyncListener = void 0;
    var AsyncListener = /** @class */ (function () {
        function AsyncListener(func, thisContext) {
            this.func = func;
            this.thisContext = thisContext;
        }
        return AsyncListener;
    }());
    exports.AsyncListener = AsyncListener;
    var AsyncChain = /** @class */ (function () {
        function AsyncChain() {
            var _this = this;
            var listeners = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                listeners[_i] = arguments[_i];
            }
            this.index = 0;
            this.listeners = listeners;
            this.listenerFunctions = [];
            this.listeners.forEach(function (listener) { return _this.listenerFunctions.push(listener.func); });
        }
        AsyncChain.prototype.push = function () {
            var _this = this;
            var listeners = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                listeners[_i] = arguments[_i];
            }
            listeners.forEach(function (listener) {
                _this.listeners.push(listener);
                _this.listenerFunctions.push(listener.func);
            });
        };
        AsyncChain.prototype.next = function () {
            var _this = this;
            if (this.listeners.length <= this.index) {
                return;
            }
            var listener = this.listeners[this.index];
            this.index++;
            //console.log('Chain Index: ' + this.index);
            //listener.func.call(listener.thisContext, this)
            setTimeout(function () { return listener.func.call(listener.thisContext, _this); }, 0);
        };
        AsyncChain.prototype.hasFinished = function () {
            return this.listeners.length <= this.index;
        };
        AsyncChain.prototype.reset = function () {
            this.index = 0;
        };
        AsyncChain.prototype.length = function () {
            return this.listeners.length;
        };
        AsyncChain.prototype.addAtIndex = function (idx) {
            var _this = this;
            var listeners = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                listeners[_i - 1] = arguments[_i];
            }
            if (idx >= 0) {
                listeners.forEach(function (listener) {
                    _this.listeners.splice(idx, 0, listener);
                    _this.listenerFunctions.splice(idx, 0, listener.func);
                    idx++;
                });
            }
        };
        AsyncChain.prototype.addBefore = function (fnc) {
            var listeners = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                listeners[_i - 1] = arguments[_i];
            }
            var idx = this.listenerFunctions.indexOf(fnc);
            this.addAtIndex.apply(this, __spreadArray([idx], __read(listeners)));
        };
        AsyncChain.prototype.addAfter = function (fnc) {
            var listeners = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                listeners[_i - 1] = arguments[_i];
            }
            var idx = this.listenerFunctions.lastIndexOf(fnc);
            if (idx >= 0) {
                this.addAtIndex.apply(this, __spreadArray([idx + 1], __read(listeners)));
            }
        };
        return AsyncChain;
    }());
    exports.AsyncChain = AsyncChain;
});
