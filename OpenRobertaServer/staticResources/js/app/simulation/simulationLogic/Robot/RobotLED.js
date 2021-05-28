define(["require", "exports", "../simulation.constants", "../Util"], function (require, exports, C, Util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RobotLED = exports.robotLEDColors = void 0;
    exports.robotLEDColors = ["LIGHTGRAY", "GREEN", "ORANGE", "RED"];
    var RobotLED = /** @class */ (function () {
        /**
         * @param unit the unit to use for the lengths
         * @param radius the radius of the LED graphics in meters
         */
        function RobotLED(unit, position, radius) {
            this.color = "LIGHTGRAY";
            this.blinkColor = "LIGHTGRAY";
            this.timer = 0;
            this.blink = 0;
            this.graphics = new PIXI.Graphics();
            this.radius = unit.getLength(radius);
            this.position = position;
            this.updateGraphics();
        }
        RobotLED.prototype.resetState = function () {
            this.setColor("LIGHTGRAY");
            this.blinkColor = "LIGHTGRAY";
            this.timer = 0;
            this.blink = 0;
        };
        /**
         * Sets `this.color` and also updates the graphics if the color did change
         */
        RobotLED.prototype.setColor = function (color) {
            var oldColor = this.color;
            this.color = color;
            if (oldColor != color) {
                this.updateGraphics();
            }
        };
        RobotLED.prototype.getColorAsNumber = function () {
            switch (this.color) {
                case "LIGHTGRAY":
                    return 0xd3d3d3;
                case "ORANGE":
                    return 0xffa500;
                case "GREEN":
                    return 0x008000;
                case "RED":
                    return 0xff0000;
                default:
                    Util_1.Util.exhaustiveSwitch(this.color);
            }
        };
        RobotLED.prototype.updateGraphics = function () {
            this.graphics
                .clear()
                .beginFill(this.getColorAsNumber())
                .drawCircle(0, 0, this.radius)
                .endFill();
            this.graphics.position.copyFrom(this.position);
        };
        RobotLED.prototype.update = function (dt, LEDAction) {
            if (LEDAction != undefined) {
                var color = LEDAction.color;
                var mode = LEDAction.mode;
                if (color) {
                    this.setColor(color);
                    this.blinkColor = color;
                }
                switch (mode) {
                    case C.OFF:
                        this.timer = 0;
                        this.blink = 0;
                        this.setColor('LIGHTGRAY');
                        break;
                    case C.ON:
                        this.timer = 0;
                        this.blink = 0;
                        break;
                    case C.FLASH:
                        this.blink = 2;
                        break;
                    case C.DOUBLE_FLASH:
                        this.blink = 4;
                        break;
                }
            }
            if (this.blink > 0) {
                if (this.timer > 0.5 && this.blink == 2) {
                    this.setColor(this.blinkColor);
                }
                else if (this.blink == 4 && (this.timer > 0.5 && this.timer < 0.67 || this.timer > 0.83)) {
                    this.setColor(this.blinkColor);
                }
                else {
                    this.setColor("LIGHTGRAY");
                }
                this.timer += dt;
                if (this.timer > 1.0) {
                    this.timer = 0;
                }
            }
        };
        return RobotLED;
    }());
    exports.RobotLED = RobotLED;
});
