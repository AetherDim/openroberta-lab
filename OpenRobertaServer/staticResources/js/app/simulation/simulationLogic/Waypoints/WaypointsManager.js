define(["require", "exports", "../Util", "./WaypointList"], function (require, exports, Util_1, WaypointList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WaypointsManager = void 0;
    /**
     * Manages a `WaypointList<W>` where each waypoint is checked one by one.
     *
     * Call `update(objectPosition: Vector)` continuously and `reset()` to reset the `waypointIndex`.
     */
    var WaypointsManager = /** @class */ (function () {
        function WaypointsManager(waypointList, waypointEvent) {
            if (waypointList === void 0) { waypointList = new WaypointList_1.WaypointList([]); }
            if (waypointEvent === void 0) { waypointEvent = function (_) { }; }
            this.waypointList = waypointList;
            this.waypointEvent = waypointEvent;
        }
        /**
         * Sets `waypointList` and `waypointEvent` and resets `waypointIndex` to `undefined`
         * @param waypointList
         * @param waypointEvent
         */
        WaypointsManager.prototype.resetListAndEvent = function (waypointList, waypointEvent) {
            this.waypointList = waypointList;
            this.waypointEvent = waypointEvent;
            this.reset();
        };
        /**
         * Reset the `waypointIndex`
         */
        WaypointsManager.prototype.reset = function () {
            this.waypointIndex = undefined;
        };
        WaypointsManager.prototype.update = function (objectPosition) {
            var _a;
            var nextWaypointIndex = ((_a = this.waypointIndex) !== null && _a !== void 0 ? _a : -1) + 1;
            if (nextWaypointIndex >= this.waypointList.getLength()) {
                return;
            }
            var waypoint = this.waypointList.get(nextWaypointIndex);
            if (Util_1.Util.vectorDistanceSquared(waypoint.position, objectPosition) <= waypoint.maxDistance * waypoint.maxDistance) {
                this.waypointIndex = nextWaypointIndex;
                this.waypointEvent(waypoint);
            }
        };
        return WaypointsManager;
    }());
    exports.WaypointsManager = WaypointsManager;
});
