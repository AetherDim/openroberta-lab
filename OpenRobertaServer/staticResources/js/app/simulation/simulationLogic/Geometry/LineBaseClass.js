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
            var intersectionPoint = this.intersectionPoint(lineBase);
            if (intersectionPoint) {
                return intersectionPoint;
            }
            var endPoints = this.getEndPoints();
            var otherEndPoints = lineBase.getEndPoints();
            var minDistance = Infinity;
            var nearestPoint = null;
            for (var _i = 0, endPoints_1 = endPoints; _i < endPoints_1.length; _i++) {
                var p = endPoints_1[_i];
                var squaredLength = matter_js_1.Vector.magnitudeSquared(matter_js_1.Vector.sub(lineBase.nearestPointTo(p), p));
                if (squaredLength < minDistance) {
                    minDistance = squaredLength;
                    nearestPoint = p;
                }
            }
            for (var _a = 0, otherEndPoints_1 = otherEndPoints; _a < otherEndPoints_1.length; _a++) {
                var p = otherEndPoints_1[_a];
                var squaredLength = matter_js_1.Vector.magnitudeSquared(matter_js_1.Vector.sub(this.nearestPointTo(p), p));
                if (squaredLength < minDistance) {
                    minDistance = squaredLength;
                    nearestPoint = p;
                }
            }
            return nearestPoint;
        };
        return LineBaseClass;
    }());
    exports.LineBaseClass = LineBaseClass;
});
