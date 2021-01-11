define(["require", "exports", "matter-js"], function (require, exports, matter_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Unit = void 0;
    /**
     * Converts SI units to the internal matter.js units and the other way.
     */
    var Unit = /** @class */ (function () {
        function Unit() {
            /**
             * meters factor from SI units to internal
             */
            this.m = 1;
            /**
             * kilograms factor from SI units to internal
             */
            this.kg = 1;
            /**
             * seconds factor from SI units to internal
             */
            this.s = 1;
        }
        /**
         * Set the unit scaling from SI units to internal matter.js units
         *
         * @param options meter, kilogram and seconds. The default is 1.
         */
        Unit.prototype.setUnitScaling = function (options) {
            this.m = options.m || 1;
            this.kg = options.kg || 1;
            this.s = options.kg || 1;
        };
        /**
         * Set the unit scaling from SI units to internal matter.js units
         *
         * @param options meter, kilogram and seconds. The default is 1.
         */
        Unit.setUnitScaling = function (options) {
            Unit.m = options.m || 1;
            Unit.kg = options.kg || 1;
            Unit.s = options.kg || 1;
        };
        Unit.prototype.getLength = function (meter) {
            return meter * this.m;
        };
        Unit.prototype.getLengths = function (meters) {
            return meters.map(this.getLength);
        };
        Unit.prototype.getMass = function (kg) {
            return kg * this.kg;
        };
        Unit.prototype.getTime = function (seconds) {
            return seconds * this.s;
        };
        Unit.prototype.getArea = function (area) {
            return area * this.m * this.m;
        };
        Unit.prototype.getVolume = function (volume) {
            return volume * this.m * this.m * this.m;
        };
        Unit.prototype.getVelocity = function (velocity) {
            return velocity * this.m / this.s;
        };
        Unit.prototype.getAcceleration = function (acceleration) {
            return acceleration * this.m / (this.s * this.s);
        };
        Unit.prototype.getForce = function (newton) {
            return newton * this.m / (this.s * this.s) * this.kg;
        };
        Unit.prototype.getTorque = function (torque) {
            return this.getForce(torque) * this.m;
        };
        Unit.prototype.getRPM = function (rpm) {
            return rpm / this.s;
        };
        Unit.prototype.getDensity = function (density) {
            return density * this.kg / (this.m * this.m * this.m);
        };
        Unit.prototype.getPosition = function (position) {
            return matter_js_1.Vector.mult(position, this.m);
        };
        Unit.prototype.getPositionVec = function (x, y) {
            return matter_js_1.Vector.create(x * this.m, y * this.m);
        };
        Unit.prototype.fromLength = function (meter) {
            return meter / this.m;
        };
        Unit.prototype.fromVelocity = function (velocity) {
            return velocity / (this.m / this.s);
        };
        Unit.prototype.fromRPM = function (rpm) {
            return rpm * this.s;
        };
        Unit.prototype.fromPosition = function (position) {
            return matter_js_1.Vector.mult(position, 1 / this.m);
        };
        Unit.getLength = function (meter) {
            return meter * Unit.m;
        };
        Unit.getLengths = function (meters) {
            return meters.map(Unit.getLength);
        };
        Unit.getMass = function (kg) {
            return kg * Unit.kg;
        };
        Unit.getTime = function (seconds) {
            return seconds * Unit.s;
        };
        Unit.getArea = function (area) {
            return area * Unit.m * Unit.m;
        };
        Unit.getVolume = function (volume) {
            return volume * Unit.m * Unit.m * Unit.m;
        };
        Unit.getVelocity = function (velocity) {
            return velocity * Unit.m / Unit.s;
        };
        Unit.getAcceleration = function (acceleration) {
            return acceleration * Unit.m / (Unit.s * Unit.s);
        };
        Unit.getForce = function (newton) {
            return newton * Unit.m / (Unit.s * Unit.s) * Unit.kg;
        };
        Unit.getTorque = function (torque) {
            return Unit.getForce(torque) * Unit.m;
        };
        Unit.getRPM = function (rpm) {
            return rpm / Unit.s;
        };
        Unit.getDensity = function (density) {
            return density * Unit.kg / (Unit.m * Unit.m * Unit.m);
        };
        Unit.getPosition = function (position) {
            return matter_js_1.Vector.mult(position, Unit.m);
        };
        Unit.getPositionVec = function (x, y) {
            return matter_js_1.Vector.create(x * Unit.m, y * Unit.m);
        };
        Unit.fromLength = function (meter) {
            return meter / Unit.m;
        };
        Unit.fromVelocity = function (velocity) {
            return velocity / (Unit.m / Unit.s);
        };
        Unit.fromRPM = function (rpm) {
            return rpm * Unit.s;
        };
        Unit.fromPosition = function (position) {
            return matter_js_1.Vector.mult(position, 1 / Unit.m);
        };
        /**
         * meters factor from SI units to internal
         */
        Unit.m = 1;
        /**
         * kilograms factor from SI units to internal
         */
        Unit.kg = 1;
        /**
         * seconds factor from SI units to internal
         */
        Unit.s = 1;
        return Unit;
    }());
    exports.Unit = Unit;
});
