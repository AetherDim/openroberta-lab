define(["require", "exports", "../Unit"], function (require, exports, Unit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ElectricMotor = void 0;
    var ElectricMotor = /** @class */ (function () {
        function ElectricMotor(maxRPM, maxTorque) {
            this.maxTorque = Unit_1.Unit.getTorque(maxTorque);
            this.maxAngularVelocity = Unit_1.Unit.getRPM(maxRPM) * Math.PI * 2 / 60;
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
        ElectricMotor.EV3 = function () {
            return new ElectricMotor(170, 0.43 * 0.01);
        };
        return ElectricMotor;
    }());
    exports.ElectricMotor = ElectricMotor;
});
