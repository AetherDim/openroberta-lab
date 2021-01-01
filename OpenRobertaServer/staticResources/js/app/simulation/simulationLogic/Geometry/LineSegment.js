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
define(["require", "exports", "matter-js", "./LineBaseClass"], function (require, exports, matter_js_1, LineBaseClass_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LineSegment = void 0;
    var LineSegment = /** @class */ (function (_super) {
        __extends(LineSegment, _super);
        function LineSegment(point1, point2) {
            var _this = _super.call(this, point1, matter_js_1.Vector.sub(point2, point1)) || this;
            _this.point1 = point1;
            _this.point2 = point2;
            return _this;
        }
        LineSegment.prototype.checkIntersectionParameter = function (parameter) {
            return 0 <= parameter && parameter <= 1;
        };
        LineSegment.prototype.nearestPointTo = function (point) {
            var parameter = this.uncheckedNearestParameterTo(point);
            if (parameter <= 0) {
                return this.point1;
            }
            if (parameter >= 1) {
                return this.point2;
            }
            return this.getPoint(parameter);
        };
        LineSegment.prototype.getEndPoints = function () {
            return [this.point1, this.point2];
        };
        return LineSegment;
    }(LineBaseClass_1.LineBaseClass));
    exports.LineSegment = LineSegment;
});
