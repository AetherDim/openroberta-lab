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
define(["require", "exports", "../Entity"], function (require, exports, Entity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TouchSensor = void 0;
    var TouchSensor = /** @class */ (function (_super) {
        __extends(TouchSensor, _super);
        function TouchSensor(scene, drawablePhysicsEntity) {
            var _this = _super.call(this, scene, drawablePhysicsEntity.getDrawable()) || this;
            _this.isTouched = false;
            _this.onTouchChanged = function () { };
            _this.physicsBody = drawablePhysicsEntity.getPhysicsBody();
            return _this;
        }
        TouchSensor.prototype.getPhysicsBody = function () {
            return this.physicsBody;
        };
        TouchSensor.prototype.getIsTouched = function () {
            return this.isTouched;
        };
        TouchSensor.prototype.setIsTouched = function (isTouched) {
            if (this.isTouched != isTouched) {
                this.onTouchChanged(isTouched);
            }
            this.isTouched = isTouched;
        };
        return TouchSensor;
    }(Entity_1.DrawablePhysicsEntity));
    exports.TouchSensor = TouchSensor;
});
