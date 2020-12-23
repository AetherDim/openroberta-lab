define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Displayable = void 0;
    var Displayable = /** @class */ (function () {
        function Displayable() {
            this.displayObject = null;
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
        }
        Displayable.prototype.setPosition = function (x, y) {
            this.displayObject.x = x - this.x;
            this.displayObject.y = y - this.x;
        };
        Displayable.prototype.setRotation = function (rotation) {
            this.displayObject.rotation = rotation - this.rotation;
        };
        Displayable.prototype.setVisible = function (visible) {
            this.displayObject.visible = visible;
        };
        Displayable.prototype.setOrigin = function (x, y) {
            this.x = x;
            this.y = y;
        };
        Displayable.prototype.setOriginRotation = function (rotation) {
            this.rotation = rotation;
        };
        // TODO: optimize?
        Displayable.prototype.update = function (x, y, rotation) {
            this.setPosition(x, y);
            this.setRotation(rotation);
        };
        Displayable.prototype.updateFromBody = function (body) {
            this.setPosition(body.position.x, body.position.y);
            this.setRotation(body.angle);
        };
        return Displayable;
    }());
    exports.Displayable = Displayable;
});
