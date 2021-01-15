define(["require", "exports", "matter-js"], function (require, exports, matter_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Unit = void 0;
    /**
     * Converts SI units to the internal matter.js units and the other way.
     */
    var Unit = /** @class */ (function () {
        /**
         * Construct a 'Unit' with unit scaling from SI units to internal matter.js units
         *
         * @param options meter, kilogram and seconds. The default is 1.
         */
        function Unit(options) {
            var _a, _b, _c;
            this.m = (_a = options.m) !== null && _a !== void 0 ? _a : 1;
            this.kg = (_b = options.kg) !== null && _b !== void 0 ? _b : 1;
            this.s = (_c = options.kg) !== null && _c !== void 0 ? _c : 1;
        }
        Unit.prototype.getLength = function (meter) {
            return meter * this.m;
        };
        Unit.prototype.getLengths = function (meters) {
            var t = this;
            return meters.map(function (meter) { return t.getLength(meter); });
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
        return Unit;
    }());
    exports.Unit = Unit;
});
