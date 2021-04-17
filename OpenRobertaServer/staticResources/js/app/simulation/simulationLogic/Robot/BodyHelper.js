define(["require", "exports", "matter-js", "../Geometry/Polygon", "../Util"], function (require, exports, matter_js_1, Polygon_1, Util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BodyHelper = void 0;
    var BodyHelper = /** @class */ (function () {
        function BodyHelper() {
        }
        BodyHelper.forEachBodyPartVertices = function (bodies, exceptBodies, code) {
            for (var i = 0; i < bodies.length; i++) {
                var body = bodies[i];
                if (exceptBodies.includes(body)) {
                    continue;
                }
                // TODO: Use body.bounds for faster execution
                for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                    var part = body.parts[j];
                    code(part.vertices);
                }
            }
        };
        BodyHelper.getNearestPointTo = function (point, bodies, exceptBodies, includePoint) {
            var nearestPoint;
            var minDistanceSquared = Infinity;
            BodyHelper.forEachBodyPartVertices(bodies, exceptBodies, function (vertices) {
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
        BodyHelper.intersectionPointsWithLine = function (line, bodies, exceptBodies) {
            var result = [];
            this.forEachBodyPartVertices(bodies, exceptBodies, function (vertices) {
                var newIntersectionPoints = new Polygon_1.Polygon(vertices).intersectionPointsWithLine(line);
                for (var i = 0; i < newIntersectionPoints.length; i++) {
                    result.push(newIntersectionPoints[i]);
                }
            });
            return result;
        };
        BodyHelper.bodyIntersectsOther = function (body, bodies) {
            // `body` collides with itself
            return matter_js_1.Query.collides(body, bodies).length > 1;
        };
        BodyHelper.someBodyContains = function (point, bodies, exceptBodies) {
            bodies = matter_js_1.Query.point(bodies, point);
            for (var i = 0; i < bodies.length; i++) {
                var body = bodies[i];
                if (exceptBodies.includes(body)) {
                    continue;
                }
                return true;
            }
            return false;
        };
        return BodyHelper;
    }());
    exports.BodyHelper = BodyHelper;
});
