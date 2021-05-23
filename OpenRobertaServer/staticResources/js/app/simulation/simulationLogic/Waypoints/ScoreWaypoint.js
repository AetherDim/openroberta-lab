var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./Waypoint"], function (require, exports, Waypoint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScoreWaypoint = void 0;
    /**
     * A waypoint with an additional score (number) and a
     */
    var ScoreWaypoint = /** @class */ (function (_super) {
        __extends(ScoreWaypoint, _super);
        /**
         * @param scene The `Scene` in which the waypoint will be placed
         * @param position The position of the waypoint in meters
         * @param maxDistance The maximum distance to reach the waypoint in meters
         * @param score The score for reaching the waypoint
         */
        function ScoreWaypoint(scene, position, maxDistance, score) {
            var _this = _super.call(this, scene, position, maxDistance) || this;
            _this.score = score;
            return _this;
        }
        ScoreWaypoint.prototype.clone = function () {
            var scene = this.getScene();
            return new ScoreWaypoint(scene, scene.unit.fromPosition(this.position), scene.unit.fromLength(this.maxDistance), this.score);
        };
        return ScoreWaypoint;
    }(Waypoint_1.Waypoint));
    exports.ScoreWaypoint = ScoreWaypoint;
});
