define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Timer = void 0;
    var Timer = /** @class */ (function () {
        function Timer(sleepTime, userFunction) {
            this.running = false;
            this.sleepTime = 100;
            this.shallStop = false;
            this.lastCall = 0;
            this.callTime = 0;
            this.selfCallingFunc = function () { };
            this.sleepTime = sleepTime;
            this.userFunction = userFunction;
        }
        Timer.prototype.start = function () {
            this.shallStop = false;
            if (this.running) {
                return;
            }
            this.running = true;
            var _this = this;
            this.selfCallingFunc = function () {
                if (_this.callUserFunction()) {
                    setTimeout(_this.selfCallingFunc, _this.sleepTime);
                }
                else {
                    _this.running = false;
                    console.log('Timer stopped!');
                }
            };
            this.lastCall = Date.now();
            this.selfCallingFunc();
        };
        Timer.prototype.stop = function () {
            this.shallStop = true;
        };
        Timer.prototype.waitForStop = function () {
            if (this.running) {
                stop();
                var _this = this;
                setTimeout(_this.waitForStop, 200);
            }
        };
        Timer.prototype.callUserFunction = function () {
            var now = Date.now();
            try {
                this.userFunction(now - this.lastCall);
            }
            catch (error) {
                console.trace(error);
            }
            // error check for too long function call
            var now2 = Date.now();
            this.callTime = now2 - now;
            this.lastCall = now2;
            return !this.shallStop;
        };
        return Timer;
    }());
    exports.Timer = Timer;
});
