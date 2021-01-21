define(["require", "exports", "matter-js", "../Geometry/Polygon", "../Util"], function (require, exports, matter_js_1, Polygon_1, Util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RobotUpdateOptions = void 0;
    var RobotUpdateOptions = /** @class */ (function () {
        function RobotUpdateOptions(o) {
            this.dt = o.dt;
            this.programPaused = o.programPaused;
            this.allBodies = o.allBodies;
            this.getImageData = o.getImageData;
        }
        RobotUpdateOptions.prototype.forEachBodyPartVertices = function (code) {
            var bodies = this.allBodies;
            for (var i = 0; i < bodies.length; i++) {
                var body = bodies[i];
                // TODO: Use body.bounds for faster execution
                for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                    var part = body.parts[j];
                    code(part.vertices);
                }
            }
        };
        RobotUpdateOptions.prototype.getNearestPointTo = function (point, includePoint) {
            var nearestPoint;
            var minDistanceSquared = Infinity;
            this.forEachBodyPartVertices(function (vertices) {
                var nearestBodyPoint = new Polygon_1.Polygon(vertices).nearestPointToPoint(point, includePoint);
                if (nearestBodyPoint) {
                    var distanceSquared = Util_1.Util.vectorDistanceSquared(point, nearestBodyPoint);
                    if (distanceSquared < minDistanceSquared) {
                        minDistanceSquared = distanceSquared;
                        nearestPoint = nearestBodyPoint;
                    }
                }
            });
            return nearestPoint;
        };
        RobotUpdateOptions.prototype.intersectionPointsWithLine = function (line) {
            var result = [];
            this.forEachBodyPartVertices(function (vertices) {
                var newIntersectionPoints = new Polygon_1.Polygon(vertices).intersectionPointsWithLine(line);
                for (var i = 0; i < newIntersectionPoints.length; i++) {
                    result.push(newIntersectionPoints[i]);
                }
            });
            return result;
        };
        RobotUpdateOptions.prototype.bodyIntersectsOther = function (body) {
            // `body` collides with itself
            return matter_js_1.Query.collides(body, this.allBodies).length > 1;
        };
        return RobotUpdateOptions;
    }());
    exports.RobotUpdateOptions = RobotUpdateOptions;
});
