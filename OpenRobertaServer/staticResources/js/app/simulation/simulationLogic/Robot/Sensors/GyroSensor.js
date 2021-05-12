define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GyroSensor = void 0;
    var GyroSensor = /** @class */ (function () {
        function GyroSensor() {
            /**
             * 'True' angle in degrees
             *
             * @see this.referenceAngle
             */
            this.angle = 0;
            /**
             * Previous angle in degrees
             */
            this.previousAngle = 0;
            /**
             * Angular rate in degrees/(internal seconds)
             */
            this.angularRate = 0;
            /**
             * The reference angle where the '0°' angle is located
             */
            this.referenceAngle = 0;
        }
        /**
         * Returns the angle in degrees
         */
        GyroSensor.prototype.getAngle = function () {
            return this.angle - this.referenceAngle;
        };
        // TODO: Remove
        GyroSensor.prototype.getAngularDifference = function () {
            return this.angle - this.previousAngle;
        };
        /**
         * Returns the angular rate in degrees/(internal seconds)
         */
        GyroSensor.prototype.getAngularRate = function () {
            return this.angularRate;
        };
        /**
         * @param newAngle new angle in degrees
         * @param referenceAngle the reference angle where the '0°' angle is
         * @param dt time step in internal seconds
         */
        GyroSensor.prototype.update = function (newAngle, referenceAngle, dt) {
            this.referenceAngle = referenceAngle;
            this.previousAngle = this.angle;
            this.angle = newAngle;
            this.angularRate = (this.angle - this.previousAngle) / dt;
        };
        return GyroSensor;
    }());
    exports.GyroSensor = GyroSensor;
});
