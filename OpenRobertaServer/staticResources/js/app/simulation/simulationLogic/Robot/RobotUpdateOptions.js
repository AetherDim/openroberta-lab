define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RobotUpdateOptions = void 0;
    var RobotUpdateOptions = /** @class */ (function () {
        function RobotUpdateOptions(o) {
            this.dt = o.dt;
            this.programPaused = o.programPaused;
            this.getImageData = o.getImageData;
            this.getNearestPointTo = o.getNearestPointTo;
            this.intersectionPointsWithLine = o.intersectionPointsWithLine;
            this.bodyIntersectsOther = o.bodyIntersectsOther;
        }
        return RobotUpdateOptions;
    }());
    exports.RobotUpdateOptions = RobotUpdateOptions;
});
