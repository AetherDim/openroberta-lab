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
    exports.Ray = void 0;
    var Ray = /** @class */ (function (_super) {
        __extends(Ray, _super);
        function Ray() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Ray.prototype.checkIntersectionParameter = function (parameter) {
            return 0 <= parameter;
        };
        Ray.prototype.nearestPointTo = function (point) {
            var parameter = this.uncheckedNearestParameterTo(point);
            if (parameter <= 0) {
                return this.startPoint;
            }
            return this.getPoint(parameter);
        };
        Ray.prototype.getEndPoints = function () {
            return [this.startPoint];
        };
        return Ray;
    }(LineBaseClass_1.LineBaseClass));
    exports.Ray = Ray;
});
