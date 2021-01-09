var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
define(["require", "exports", "matter-js"], function (require, exports, matter_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LineBaseClass = void 0;
    // import { Line } from "./Line"
    var LineBaseClass = /** @class */ (function () {
        function LineBaseClass(startPoint, direction) {
            this.startPoint = startPoint;
            this.directionVector = direction;
        }
        LineBaseClass.prototype.getPoint = function (parameter) {
            return matter_js_1.Vector.add(this.startPoint, matter_js_1.Vector.mult(this.directionVector, parameter));
        };
        /**
         * Returns the intersection parameters of `this` and `line`. It may be null.
         *
         * @param lineBase The line which may intersect `this`
         */
        LineBaseClass.prototype.intersectionParameters = function (lineBase) {
            var p = matter_js_1.Vector.sub(this.startPoint, lineBase.startPoint);
            // sp + t * dV = lB.sp + s * lB.dV
            // sp - lB.sp = lB.dV * s - dV * t
            // column matrix (lB.dV, -dV) is row matrix ((a, b), (c, d))
            // see https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution
            var a = lineBase.directionVector.x;
            var b = -this.directionVector.x;
            var c = lineBase.directionVector.y;
            var d = -this.directionVector.y;
            var determinant = a * d - b * c;
            if (Math.abs(determinant) < 1e-10) {
                // TODO: Maybe check this
                return null;
            }
            var s = (d * p.x - b * p.y) / determinant;
            var t = (-c * p.x + a * p.y) / determinant;
            return { t: t, s: s };
        };
        LineBaseClass.prototype.intersectionPoint = function (lineBase) {
            var intersectionParameters = this.intersectionParameters(lineBase);
            if (!intersectionParameters) {
                return null;
            }
            if (this.checkIntersectionParameter(intersectionParameters.t)
                && lineBase.checkIntersectionParameter(intersectionParameters.s)) {
                return this.getPoint(intersectionParameters.t);
            }
            return null;
        };
        LineBaseClass.prototype.intersects = function (lineBase) {
            var intersectionParameters = this.intersectionParameters(lineBase);
            if (!intersectionParameters) {
                return false;
            }
            return this.checkIntersectionParameter(intersectionParameters.s)
                && lineBase.checkIntersectionParameter(intersectionParameters.t);
        };
        LineBaseClass.prototype.uncheckedNearestParameterTo = function (point) {
            // line: x = s + t * r
            // helper plane: r * (x - p) = 0
            // intersection:
            //     r * (s + t * r - p) = 0
            //  => t = (r * (p - s)) / |r|^2
            return matter_js_1.Vector.dot(this.directionVector, matter_js_1.Vector.sub(point, this.startPoint)) / matter_js_1.Vector.magnitudeSquared(this.directionVector);
        };
        LineBaseClass.prototype.nearestPointToLineBase = function (lineBase) {
            var e_1, _a, e_2, _b;
            var intersectionPoint = this.intersectionPoint(lineBase);
            if (intersectionPoint) {
                return intersectionPoint;
            }
            var endPoints = this.getEndPoints();
            var otherEndPoints = lineBase.getEndPoints();
            var minDistance = Infinity;
            var nearestPoint = null;
            try {
                for (var endPoints_1 = __values(endPoints), endPoints_1_1 = endPoints_1.next(); !endPoints_1_1.done; endPoints_1_1 = endPoints_1.next()) {
                    var p = endPoints_1_1.value;
                    var squaredLength = matter_js_1.Vector.magnitudeSquared(matter_js_1.Vector.sub(lineBase.nearestPointTo(p), p));
                    if (squaredLength < minDistance) {
                        minDistance = squaredLength;
                        nearestPoint = p;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (endPoints_1_1 && !endPoints_1_1.done && (_a = endPoints_1.return)) _a.call(endPoints_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                for (var otherEndPoints_1 = __values(otherEndPoints), otherEndPoints_1_1 = otherEndPoints_1.next(); !otherEndPoints_1_1.done; otherEndPoints_1_1 = otherEndPoints_1.next()) {
                    var p = otherEndPoints_1_1.value;
                    var squaredLength = matter_js_1.Vector.magnitudeSquared(matter_js_1.Vector.sub(this.nearestPointTo(p), p));
                    if (squaredLength < minDistance) {
                        minDistance = squaredLength;
                        nearestPoint = p;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (otherEndPoints_1_1 && !otherEndPoints_1_1.done && (_b = otherEndPoints_1.return)) _b.call(otherEndPoints_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return nearestPoint;
        };
        return LineBaseClass;
    }());
    exports.LineBaseClass = LineBaseClass;
});
