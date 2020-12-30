define(["require", "exports", "jquery", "matter-js", "./scene", "./timer", "./color", "./pixijs"], function (require, exports, $, matter_js_1, scene_1, timer_1, color_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimulationEngine = void 0;
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
                this.app = new PIXI.Application({
                    view: htmlCanvas,
                    backgroundColor: color_1.rgbToNumber(backgroundColor),
                    antialias: true,
                });
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
                _this.update();
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
        SimulationEngine.prototype.setRenderingScaleAndOffset = function (scale, offset) {
            this.app.stage.scale.x = scale;
            this.app.stage.scale.y = scale;
            this.app.stage.position.x = offset.x;
            this.app.stage.position.y = offset.y;
            this.mouse.scale.x = 1 / scale;
            this.mouse.scale.y = 1 / scale;
            this.mouse.offset.x = offset.x;
            this.mouse.offset.y = offset.y;
        };
        SimulationEngine.prototype.switchScene = function (scene) {
            if (!scene) {
                scene = new scene_1.Scene();
            }
            if (this.scene == scene) {
                return;
            }
            if (this.app.stage.children.length > 0) {
                this.app.stage.removeChildren(0, this.app.stage.children.length - 1);
            }
            // reset rendering scale and offset
            this.setRenderingScaleAndOffset(1, matter_js_1.Vector.create(0, 0));
            this.scene = scene;
            scene.initMouse(this.mouse);
            scene.setSimulationEngine(this);
            // TODO
            this.app.stage.on;
        };
        SimulationEngine.prototype.addDiplayable = function (displayable) {
            if (this.app) {
                this.app.stage.addChild(displayable);
            }
        };
        SimulationEngine.prototype.removeDisplayable = function (displayable) {
            if (this.app) {
                this.app.stage.removeChild(displayable);
            }
        };
        SimulationEngine.prototype.simulate = function () {
            if (this.scene) {
                this.scene.update();
            }
        };
        SimulationEngine.prototype.update = function () {
        };
        return SimulationEngine;
    }());
    exports.SimulationEngine = SimulationEngine;
});
