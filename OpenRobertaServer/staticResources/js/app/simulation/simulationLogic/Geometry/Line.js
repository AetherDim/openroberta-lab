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
define(["require", "exports", "./LineBaseClass"], function (require, exports, LineBaseClass_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Line = void 0;
    var Line = /** @class */ (function (_super) {
        __extends(Line, _super);
        function Line() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Line.prototype.checkIntersectionParameter = function (parameter) {
            return true;
        };
        Line.prototype.nearestPointTo = function (point) {
            return this.getPoint(this.uncheckedNearestParameterTo(point));
        };
        Line.prototype.getEndPoints = function () {
            return [];
        };
        return Line;
    }(LineBaseClass_1.LineBaseClass));
    exports.Line = Line;
});
