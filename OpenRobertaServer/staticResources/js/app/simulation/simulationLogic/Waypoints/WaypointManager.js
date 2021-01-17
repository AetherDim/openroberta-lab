define(["require", "exports", "../Util", "./WaypointList"], function (require, exports, Util_1, WaypointList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WaypointManager = void 0;
    var WaypointManager = /** @class */ (function () {
        function WaypointManager(waypointList, waypointEvent) {
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
        WaypointManager.prototype.resetListAndEvent = function (waypointList, waypointEvent) {
            this.waypointList = waypointList;
            this.waypointEvent = waypointEvent;
            this.reset();
        };
        /**
         * Reset the `waypointIndex`
         */
        WaypointManager.prototype.reset = function () {
            this.waypointIndex = undefined;
        };
        WaypointManager.prototype.update = function (newPosition) {
            var _a;
            var nextWaypointIndex = (_a = this.waypointIndex) !== null && _a !== void 0 ? _a : 0;
            if (nextWaypointIndex >= this.waypointList.getLength()) {
                return;
            }
            var waypoint = this.waypointList.get(nextWaypointIndex);
            if (Util_1.Util.vectorDistanceSquared(waypoint.position, newPosition) <= waypoint.maxDistance * waypoint.maxDistance) {
                this.waypointIndex = nextWaypointIndex;
                this.waypointEvent(waypoint);
            }
        };
        return WaypointManager;
    }());
    exports.WaypointManager = WaypointManager;
});
