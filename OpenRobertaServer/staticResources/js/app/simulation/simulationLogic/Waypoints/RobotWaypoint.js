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
    exports.RobotWaypoint = void 0;
    var RobotWaypoint = /** @class */ (function (_super) {
        __extends(RobotWaypoint, _super);
        /**
         * @param position The position of the waypoint in meters
         * @param score The score for reaching the waypoint
         */
        function RobotWaypoint(unit, position, score) {
            var _this = _super.call(this, unit, position, 0.05) || this;
            _this.score = score;
            return _this;
        }
        return RobotWaypoint;
    }(Waypoint_1.Waypoint));
    exports.RobotWaypoint = RobotWaypoint;
});
