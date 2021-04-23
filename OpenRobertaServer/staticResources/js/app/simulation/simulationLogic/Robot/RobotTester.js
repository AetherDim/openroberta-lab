define(["require", "exports", "../GlobalDebug"], function (require, exports, GlobalDebug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RobotTester = void 0;
    var RobotTester = /** @class */ (function () {
        function RobotTester(robot) {
            this.robot = robot;
        }
        RobotTester.prototype.setWheelFriction = function (wheel, friction) {
            wheel.rollingFriction = friction.rollingFriction;
            wheel.slideFriction = friction.slideFriction;
        };
        RobotTester.prototype.setWheelsFriction = function (options) {
            var _this = this;
            this.setWheelFriction(this.robot.leftDrivingWheel, options.driveWheels);
            this.setWheelFriction(this.robot.rightDrivingWheel, options.driveWheels);
            var t = this;
            this.robot.wheelsList.forEach(function (wheel) {
                if (wheel !== _this.robot.leftDrivingWheel && wheel !== _this.robot.rightDrivingWheel) {
                    _this.setWheelFriction(wheel, options.otherWheels);
                }
            });
            GlobalDebug_1.DebugGui === null || GlobalDebug_1.DebugGui === void 0 ? void 0 : GlobalDebug_1.DebugGui.updateDisplay();
        };
        return RobotTester;
    }());
    exports.RobotTester = RobotTester;
});
