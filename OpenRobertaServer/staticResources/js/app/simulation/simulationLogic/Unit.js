define(["require", "exports", "matter-js"], function (require, exports, matter_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Unit = void 0;
    /**
     * Converts SI units to the internal matter.js units and the other way.
     */
    var Unit = /** @class */ (function () {
        function Unit() {
        }
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
