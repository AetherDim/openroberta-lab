define(["require", "exports", "../Unit"], function (require, exports, Unit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Waypoint = void 0;
    /**
     * A waypoint with a position and maximum distance to reach it
     */
    var Waypoint = /** @class */ (function () {
        /**
         * @param unit The `Unit` of `position` and `minDistance`
         * @param position The position of the waypoint in meters
         * @param maxDistance The maximum distance to reach the waypoint in meters
         */
        function Waypoint(unit, position, maxDistance) {
            this.position = unit.getPosition(position);
            this.maxDistance = unit.getLength(maxDistance);
        }
        /**
         * @param position The position of the waypoint in matter Units
         * @param maxDistance The maximum distance to reach the waypoint in matter Units
         */
        Waypoint.withInternalUnits = function (position, maxDistance) {
            return new Waypoint(new Unit_1.Unit({}), position, maxDistance);
        };
        return Waypoint;
    }());
    exports.Waypoint = Waypoint;
});
