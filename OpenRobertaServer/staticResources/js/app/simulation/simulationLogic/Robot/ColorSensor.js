define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ColorSensor = void 0;
    var ColorSensor = /** @class */ (function () {
        /**
         * Creates a new color sensor.
         *
         * @param position Position relative to the robot position
         */
        function ColorSensor(position) {
            /**
             * The color which is detected below the color sensor
             */
            this.detectedColor = { red: 0, green: 0, blue: 0 };
            this.position = position;
        }
        return ColorSensor;
    }());
    exports.ColorSensor = ColorSensor;
});
