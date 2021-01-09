define(["require", "exports", "matter-js", "../Unit"], function (require, exports, matter_js_1, Unit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UltrasonicSensor = void 0;
    var UltrasonicSensor = /** @class */ (function () {
        function UltrasonicSensor(position, angularRange) {
            /**
             * The measured distance in matter units
             */
            this.measuredDistance = Infinity;
            /**
             * The maximum distance which can be measured by the ultrasonic sensor in meters
             */
            this.maximumMeasurableDistance = 2.5;
            this.graphics = new PIXI.Graphics();
            this.position = Unit_1.Unit.getPosition(position);
            this.angularRange = angularRange;
            this.updateGraphics();
        }
        /**
         * @param distance The measured distance in matter units
         * @param updateGraphics If true, updates the graphics
         */
        UltrasonicSensor.prototype.setMeasuredDistance = function (distance, updateGraphics) {
            if (updateGraphics === void 0) { updateGraphics = true; }
            this.measuredDistance = distance;
            if (updateGraphics) {
                this.updateGraphics();
            }
        };
        UltrasonicSensor.prototype.updateGraphics = function () {
            var graphicsDistance = Math.min(500, this.measuredDistance);
            var vector = matter_js_1.Vector.create(graphicsDistance, 0);
            var halfAngle = this.angularRange / 2;
            var leftVector = matter_js_1.Vector.rotate(vector, halfAngle);
            var rightVector = matter_js_1.Vector.rotate(vector, -halfAngle);
            this.graphics
                .clear()
                .lineStyle(2)
                .moveTo(leftVector.x, leftVector.y)
                .lineTo(0, 0)
                .lineTo(rightVector.x, rightVector.y)
                .arc(0, 0, graphicsDistance, -halfAngle, halfAngle);
            this.graphics.position.set(this.position.x, this.position.y);
        };
        UltrasonicSensor.prototype.removeGraphicsFromParent = function () {
            this.graphics.parent.removeChild(this.graphics);
        };
        /**
         * Removes `graphics` from its parent and destroys it.
         */
        UltrasonicSensor.prototype.destroy = function () {
            this.removeGraphicsFromParent();
            this.graphics.destroy();
        };
        return UltrasonicSensor;
    }());
    exports.UltrasonicSensor = UltrasonicSensor;
});
