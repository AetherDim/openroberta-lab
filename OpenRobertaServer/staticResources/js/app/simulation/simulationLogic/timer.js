define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Timer = void 0;
    var Timer = /** @class */ (function () {
        function Timer(sleepTime, userFunction) {
            this.running = false;
            this.sleepTime = 100;
            this.shallStop = false;
            this.callTime = 0;
            this.sleepTime = sleepTime;
            this.userFunction = userFunction;
        }
        Timer.prototype.start = function () {
            this.shallStop = false;
            if (this.running) {
                return;
            }
            var _this = this;
            this.selfCallingFunc = function () {
                if (_this.callUserFunction()) {
                    setTimeout(_this.selfCallingFunc, _this.sleepTime);
                }
                else {
                    console.log('Timer stopped!');
                }
            };
            this.lastCall = Date.now();
            this.selfCallingFunc();
        };
        Timer.prototype.stop = function () {
            this.shallStop = true;
        };
        Timer.prototype.callUserFunction = function () {
            var now = Date.now();
            try {
                this.userFunction(now - this.lastCall);
            }
            catch (error) {
                console.log(error);
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
