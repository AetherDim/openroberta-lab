define(["require", "exports", "jquery", "matter-js", "./scene", "./timer", "./pixijs"], function (require, exports, $, matter_js_1, scene_1, timer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimulationEngine = void 0;
    // https://stackoverflow.com/questions/13070054/convert-rgb-strings-to-hex-in-javascript
    function rgbToNumber(rgb) {
        var raw = rgb.split("(")[1].split(")")[0];
        var numbers = raw.split(',');
        var hexnumber = '0x' + parseInt(numbers[0]).toString(16) + parseInt(numbers[1]).toString(16) + parseInt(numbers[2]).toString(16);
        return parseInt(hexnumber, 16);
    }
    // physics and graphics
    var SimulationEngine = /** @class */ (function () {
        function SimulationEngine(canvas, scene, startSim, disablePixiRenderer) {
            if (scene === void 0) { scene = null; }
            if (startSim === void 0) { startSim = false; }
            if (disablePixiRenderer === void 0) { disablePixiRenderer = false; }
            this.debugRenderer = null;
            this.simSleepTime = 1 / 60;
            this.debugRendererUsed = false;
            var htmlCanvas = null;
            var backgroundColor = $('#simDiv').css('background-color');
            if (canvas instanceof HTMLCanvasElement) {
                htmlCanvas = canvas;
            }
            else {
                htmlCanvas = document.getElementById(canvas);
            }
            // The application will create a renderer using WebGL, if possible,
            // with a fallback to a canvas render. It will also setup the ticker
            // and the root stage PIXI.Container
            if (!disablePixiRenderer) {
                this.app = new PIXI.Application({ view: htmlCanvas, backgroundColor: rgbToNumber(backgroundColor) });
            }
            // add mouse control
            this.mouse = matter_js_1.Mouse.create(htmlCanvas); // call before scene switch
            // switch to scene
            if (scene) {
                this.switchScene(scene);
            }
            else {
                this.switchScene(new scene_1.Scene()); // empty scene as default (call after Engine.create() and renderer init !!!)
            }
            var _this = this;
            this.simTicker = new timer_1.Timer(this.simSleepTime, function (delta) {
                // delta is the time from last call
                _this.simulate();
            });
            if (startSim) {
                this.startSim();
            }
        }
        SimulationEngine.prototype.setPrograms = function (programs) {
            this.scene.setPrograms(programs);
        };
        SimulationEngine.prototype.startSim = function () {
            this.simTicker.start();
        };
        SimulationEngine.prototype.stopSim = function () {
            this.simTicker.stop();
        };
        SimulationEngine.prototype.setSimSleepTime = function (simSleepTime) {
            this.simSleepTime = simSleepTime;
            this.simTicker.sleepTime = simSleepTime;
        };
        SimulationEngine.prototype.switchScene = function (scene) {
            this.scene = scene;
            scene.initMouse(this.mouse);
            // TODO
        };
        SimulationEngine.prototype.simulate = function () {
            if (this.scene) {
                this.scene.update();
            }
        };
        return SimulationEngine;
    }());
    exports.SimulationEngine = SimulationEngine;
});
