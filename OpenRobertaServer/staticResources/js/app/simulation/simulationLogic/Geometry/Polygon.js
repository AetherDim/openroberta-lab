define(["require", "exports", "matter-js", "./Line", "./LineSegment"], function (require, exports, matter_js_1, Line_1, LineSegment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Polygon = void 0;
    var Polygon = /** @class */ (function () {
        function Polygon(vertices) {
            this.vertices = vertices;
        }
        Polygon.prototype.distanceTo = function (point) {
            var minDistanceSquared = Infinity;
            var newVertices = this.vertices.map(function (p) { return matter_js_1.Vector.sub(p, point); });
            var zeroVector = matter_js_1.Vector.create();
            var vertex0 = newVertices[0];
            var vertex1 = newVertices[1];
            var lastVertexIsNear = false;
            var lastVertexDistanceSquared = matter_js_1.Vector.magnitudeSquared(vertex1);
            var lineSegment = new LineSegment_1.LineSegment(vertex0, vertex1);
            var parameter = lineSegment.uncheckedNearestParameterTo(zeroVector);
            if (parameter <= 0) {
                minDistanceSquared = matter_js_1.Vector.magnitudeSquared(vertex0);
            }
            else if (parameter >= 1) {
                minDistanceSquared = lastVertexDistanceSquared;
                lastVertexIsNear = true;
            }
            else {
                minDistanceSquared = matter_js_1.Vector.magnitudeSquared(lineSegment.getPoint(parameter));
            }
            // distance of line to origin:
            // d/dt (s + t * r)^2 = 2 * (s + t * r) * r = 0
            // t = -(s*r)/(r^2)
            //   (s - s*r/(r^2) * r)^2
            // = s^2 + (s*r)^2*r^2/r^4 - 2*s*r*(s*r)/r^2
            // = s^2 - (s*r)^2/r^2
            // = s^2 + (s*r)*t
            for (var i = 2; i < newVertices.length; i++) {
                var vertex0_1 = newVertices[i - 1];
                var vertex1_1 = newVertices[i];
                var vertex1DistanceSquared = matter_js_1.Vector.magnitudeSquared(vertex1_1);
                var direction;
                var dotProduct;
                var endVertexDistanceSquared;
                if (lastVertexIsNear) {
                    direction = matter_js_1.Vector.sub(vertex1_1, vertex0_1);
                    dotProduct = matter_js_1.Vector.dot(vertex0_1, direction);
                    endVertexDistanceSquared = vertex1DistanceSquared;
                }
                else {
                    direction = matter_js_1.Vector.sub(vertex0_1, vertex1_1);
                    dotProduct = matter_js_1.Vector.dot(vertex1_1, direction);
                    endVertexDistanceSquared = lastVertexDistanceSquared;
                }
                var newLastVertexIsNear = false;
                if (dotProduct < 0) {
                    // total: 3 mult, 0 div, 2 add, 0 sub, 1 negate
                    // 2 mult, 0 div, 1 add, 0 sub, 1 negate
                    var parameter_1 = -dotProduct / matter_js_1.Vector.magnitudeSquared(direction);
                    var newDistanceSquared;
                    if (parameter_1 < 1) {
                        // 1 mult, 0 div, 1 add, 0 sub, 0 negate
                        // Pythagoras
                        newDistanceSquared = endVertexDistanceSquared + dotProduct * parameter_1;
                    }
                    else {
                        if (lastVertexIsNear) {
                            newDistanceSquared = vertex1DistanceSquared;
                            newLastVertexIsNear = true;
                        }
                        else {
                            newDistanceSquared = lastVertexDistanceSquared;
                        }
                    }
                    if (newDistanceSquared < minDistanceSquared) {
                        minDistanceSquared = newDistanceSquared;
                    }
                    // // total: 5 mult, 1 div, 0 add, 2 sub, 0 negate
                    // // 2 mult, 0 div, 0 add, 1 sub, 0 negate
                    // const area = Vector.cross(direction, vertex0)
                    // // 3 mult, 1 div, 0 add, 1 sub, 0 negate
                    // const distanceSquared = area * area / Vector.magnitudeSquared(direction)
                }
                else {
                    if (!lastVertexIsNear) {
                        newLastVertexIsNear = true;
                        if (vertex1DistanceSquared < minDistanceSquared) {
                            minDistanceSquared = vertex1DistanceSquared;
                        }
                    }
                }
                lastVertexIsNear = newLastVertexIsNear;
                lastVertexDistanceSquared = vertex1DistanceSquared;
            }
            return Math.sqrt(minDistanceSquared);
        };
        Polygon.prototype.distanceTo2 = function (point) {
            var minDistanceSquared = Infinity;
            var newVertices = this.vertices.map(function (p) { return matter_js_1.Vector.sub(p, point); });
            var zeroVector = matter_js_1.Vector.create();
            for (var i = 2; i < newVertices.length; i++) {
                var vertex0 = newVertices[i - 1];
                var vertex1 = newVertices[i];
                var lineSegment = new LineSegment_1.LineSegment(vertex0, vertex1);
                var parameter = lineSegment.uncheckedNearestParameterTo(zeroVector);
                if (parameter <= 0) {
                    minDistanceSquared = Math.min(matter_js_1.Vector.magnitudeSquared(vertex0), minDistanceSquared);
                }
                else if (parameter >= 1) {
                    minDistanceSquared = Math.min(matter_js_1.Vector.magnitudeSquared(vertex1), minDistanceSquared);
                }
                else {
                    minDistanceSquared = matter_js_1.Vector.magnitudeSquared(lineSegment.getPoint(parameter));
                }
            }
            return Math.sqrt(minDistanceSquared);
        };
        Polygon.prototype.distanceTo3 = function (point) {
            return matter_js_1.Vector.magnitude(this.nearestPointTo(point));
        };
        /**
         * Returns the nearest point on the polygon boundary to `point`.
         *
         * @param point The point to which the nearest one is searched
         */
        Polygon.prototype.nearestPointTo = function (point) {
            return this._nearestPointTo(point, function (_) { return true; });
        };
        /**
         * Returns the nearest point on the polygon boundary to `point` for which `includePoint(point)` is `true`.
         * If no point is found since `includePoint` excludes all points, `undefined` is returned.
         *
         * @param point The point to which the nearest one is searched
         * @param includePoint Function which returns `true` iff the point can be included in the result (default: _ => true)
         */
        Polygon.prototype.nearestPointToPoint = function (point, includePoint) {
            return this._nearestPointTo(point, includePoint);
        };
        /**
         * Returns the nearest point on the polygon boundary to `point` for which `includePoint(point)` is `true`.
         * If no point is found since `includePoint` excludes all points, `undefined` is returned.
         *
         * @param point The point to which the nearest one is searched
         * @param includePoint Function which returns `true` iff the point can be included in the result (default: _ => true)
         */
        Polygon.prototype._nearestPointTo = function (point, includePoint) {
            var minDistanceSquared = Infinity;
            var minDistancePoint;
            function updateWithVertices(vertex0, vertex1) {
                var line = new Line_1.Line(vertex0, matter_js_1.Vector.sub(vertex1, vertex0));
                var parameter = line.uncheckedNearestParameterTo(point);
                var newMinPoint;
                if (parameter <= 0) {
                    newMinPoint = vertex0;
                }
                else if (parameter >= 1) {
                    newMinPoint = vertex1;
                }
                else {
                    newMinPoint = line.getPoint(parameter);
                }
                var newMinDistanceSquared = matter_js_1.Vector.magnitudeSquared(matter_js_1.Vector.sub(newMinPoint, point));
                if (newMinDistanceSquared < minDistanceSquared && includePoint(newMinPoint)) {
                    minDistancePoint = newMinPoint;
                    minDistanceSquared = newMinDistanceSquared;
                }
            }
            for (var i = 1; i < this.vertices.length; i++) {
                updateWithVertices(this.vertices[i - 1], this.vertices[i]);
            }
            updateWithVertices(this.vertices[this.vertices.length - 1], this.vertices[0]);
            return minDistancePoint;
        };
        /**
         * Returns an array of points which are on the polygon border and `line`.
         *
         * @param line A `LineBaseClass` which may intersect the polygon border
         */
        Polygon.prototype.intersectionPointsWithLine = function (line) {
            var result = [];
            function updateWithVertices(vertex0, vertex1) {
                var lineSegment = new LineSegment_1.LineSegment(vertex0, vertex1);
                var point = lineSegment.intersectionPoint(line);
                if (point) {
                    result.push(point);
                }
            }
            for (var i = 1; i < this.vertices.length; i++) {
                updateWithVertices(this.vertices[i - 1], this.vertices[i]);
            }
            updateWithVertices(this.vertices[this.vertices.length - 1], this.vertices[0]);
            return result;
        };
        /**
         * Returns `true` iff the polygon contains the `point`.
         *
         * @param point point which is checked
         * @param includeBoundary if `true`, checks if `point` is also on the boundary of the polygon
         */
        Polygon.prototype.containsPoint = function (point, includeBoundary) {
            if (includeBoundary === void 0) { includeBoundary = true; }
            var containsPoint = false;
            var lastVertex = this.vertices[this.vertices.length - 1];
            var lastPointIsAbove = point.y > lastVertex.y;
            for (var i = 0; i < this.vertices.length; i++) {
                var vertex = this.vertices[i];
                var currentPointIsAbove = vertex.y < point.y;
                if (currentPointIsAbove != lastPointIsAbove) {
                    // point above has changed
                    // intersection at y = point.y
                    // lastVertex + t * (vertex - lastVertex) = (x, point.y)
                    var t = (point.y - lastVertex.y) / (vertex.y - lastVertex.y);
                    var x = lastVertex.x + t * (vertex.x - lastVertex.x);
                    if (x >= point.x) {
                        containsPoint = !containsPoint;
                        if (includeBoundary && x == point.x) {
                            // point is on boundary
                            return true;
                        }
                    }
                }
                lastVertex = vertex;
                lastPointIsAbove = currentPointIsAbove;
            }
            return containsPoint;
        };
        return Polygon;
    }());
    exports.Polygon = Polygon;
});
