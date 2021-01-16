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
            var listeners = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                listeners[_i] = arguments[_i];
            }
            this.index = 0;
            this.listeners = listeners;
        }
        AsyncChain.prototype.push = function () {
            var _this = this;
            var listeners = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                listeners[_i] = arguments[_i];
            }
            listeners.forEach(function (listener) {
                _this.listeners.push(listener);
            });
        };
        AsyncChain.prototype.next = function () {
            if (this.listeners.length <= this.index) {
                return;
            }
            var listener = this.listeners[this.index];
            this.index++;
            //console.log('Chain Index: ' + this.index);
            listener.func.call(listener.thisContext, this);
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
        return AsyncChain;
    }());
    exports.AsyncChain = AsyncChain;
});
