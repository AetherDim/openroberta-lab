define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ElectricMotor = void 0;
    var ElectricMotor = /** @class */ (function () {
        function ElectricMotor(unit, maxRPM, maxTorque) {
            this.maxTorque = unit.getTorque(maxTorque);
            this.maxAngularVelocity = unit.getRPM(maxRPM) * Math.PI * 2 / 60;
        }
        ElectricMotor.prototype.getMaxRPM = function () {
            return this.maxAngularVelocity / (Math.PI * 2);
        };
        ElectricMotor.prototype.getAbsTorqueForAngularVelocity = function (angularVelocity) {
            var absAngularVelocity = Math.abs(angularVelocity);
            if (absAngularVelocity >= this.maxAngularVelocity) {
                return 0;
            }
            return this.maxTorque * (1 - absAngularVelocity / this.maxAngularVelocity);
        };
        /**
         * A Lego EV3 motor.
         *
         * The data was taken from a plot on https://www.philohome.com/motors/motorcomp.htm (EV3 Large).
         */
        ElectricMotor.EV3 = function (unit) {
            return new ElectricMotor(unit, 170, 0.43 * 0.01);
        };
        return ElectricMotor;
    }());
    exports.ElectricMotor = ElectricMotor;
});
