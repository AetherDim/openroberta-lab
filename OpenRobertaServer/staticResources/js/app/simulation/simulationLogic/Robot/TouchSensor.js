define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TouchSensor = void 0;
    var TouchSensor = /** @class */ (function () {
        function TouchSensor(physicsBody) {
            this.isTouched = false;
            this.onTouchChanged = function () { };
            this.physicsBody = physicsBody;
        }
        TouchSensor.prototype.getIsTouched = function () {
            return this.isTouched;
        };
        TouchSensor.prototype.setIsTouched = function (isTouched) {
            if (this.isTouched != isTouched) {
                this.onTouchChanged(isTouched);
            }
            this.isTouched = isTouched;
        };
        return TouchSensor;
    }());
    exports.TouchSensor = TouchSensor;
});
