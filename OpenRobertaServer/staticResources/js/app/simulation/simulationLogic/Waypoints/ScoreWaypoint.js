var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
         * @param position The position of the waypoint in meters
         * @param score The score for reaching the waypoint
         */
        function ScoreWaypoint(unit, position, score) {
            var _this = _super.call(this, unit, position, ScoreWaypoint.defaultMaxDistance) || this;
            _this.score = score;
            return _this;
        }
        /**
         * Default maximum distance to reach the waypoint in meters
         */
        ScoreWaypoint.defaultMaxDistance = 0.05;
        return ScoreWaypoint;
    }(Waypoint_1.Waypoint));
    exports.ScoreWaypoint = ScoreWaypoint;
});
