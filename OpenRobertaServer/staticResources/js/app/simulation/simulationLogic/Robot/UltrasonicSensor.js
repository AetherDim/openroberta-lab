define(["require", "exports", "../Unit"], function (require, exports, Unit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UltrasonicSensor = void 0;
    var UltrasonicSensor = /** @class */ (function () {
        function UltrasonicSensor(position, angularRange) {
            /**
             * The measured distance
             */
            this.measuredDistance = Infinity;
            this.position = Unit_1.Unit.getPosition(position);
            this.angularRange = angularRange;
        }
        return UltrasonicSensor;
    }());
    exports.UltrasonicSensor = UltrasonicSensor;
});
