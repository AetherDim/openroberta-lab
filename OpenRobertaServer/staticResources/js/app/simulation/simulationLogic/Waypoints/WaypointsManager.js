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
            this.waypointVisibilityBehavior = "showNext";
            this.waypointList = waypointList;
            this.waypointEvent = waypointEvent;
        }
        WaypointsManager.prototype.getWaypoints = function () {
            return this.waypointList.getWaypoints();
        };
        /**
         * Sets `waypointList` and `waypointEvent` and resets `waypointIndex` to `undefined`. It also removes the current waypoints from the scene and add the new ones to their scenes.
         *
         * @param waypointList
         * @param waypointEvent
         */
        WaypointsManager.prototype.resetListAndEvent = function (waypointList, waypointEvent) {
            this.waypointList.getWaypoints().forEach(function (waypoint) {
                waypoint.getScene().removeEntity(waypoint);
            });
            waypointList.getWaypoints().forEach(function (waypoint) {
                waypoint.getScene().addEntity(waypoint);
            });
            this.waypointList = waypointList;
            this.waypointEvent = waypointEvent;
            this.reset();
        };
        /**
         * Reset the `waypointIndex` and the waypoint graphics
         */
        WaypointsManager.prototype.reset = function () {
            this.waypointIndex = undefined;
            this.updateWaypointVisibility();
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
                var waypointIndex = nextWaypointIndex;
                this.waypointEvent(this.waypointIndex, waypoint);
                this.updateWaypointVisibility();
            }
        };
        WaypointsManager.prototype.updateWaypointVisibility = function () {
            var _a;
            var waypointIndex = (_a = this.waypointIndex) !== null && _a !== void 0 ? _a : -1;
            var waypoints = this.waypointList.getWaypoints();
            var isVisible;
            switch (this.waypointVisibilityBehavior) {
                case "hideAll":
                    isVisible = function () { return false; };
                    break;
                case "hideAllPrevious":
                    isVisible = function (index) { return index > waypointIndex; };
                    break;
                case "showAll":
                    isVisible = function () { return true; };
                    break;
                case "showNext":
                    isVisible = function (index) { return index == waypointIndex + 1; };
                    break;
                default:
                    Util_1.Util.exhaustiveSwitch(this.waypointVisibilityBehavior);
            }
            waypoints.forEach(function (w, index) { return w.graphics.visible = isVisible(index); });
        };
        return WaypointsManager;
    }());
    exports.WaypointsManager = WaypointsManager;
    function test(a) {
        throw new Error();
    }
});
