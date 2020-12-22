define(["require", "exports", "jquery", "matter-js", "./scene", "./timer", "./entities", "./pixijs"], function (require, exports, $, matter_js_1, scene_1, timer_1, entities_1) {
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
        function SimulationEngine(canvas, useDebugRenderer, wireframes) {
            if (useDebugRenderer === void 0) { useDebugRenderer = false; }
            if (wireframes === void 0) { wireframes = false; }
            this.debugRenderer = null;
            this.dt = 10;
            this.simSleepTime = 1 / 60;
            this.debugRendererUsed = false;
            var htmlCanvas = null;
            var backgroundColor = $('#simDiv').css('background-color');
            this.engine = matter_js_1.Engine.create(); // seems not to be deprecated ...
            if (useDebugRenderer) {
                if (canvas instanceof HTMLElement) {
                    htmlCanvas = canvas;
                }
                else {
                    htmlCanvas = document.getElementById(canvas);
                }
                this.setupDebugRenderer(htmlCanvas, wireframes, false);
            }
            else {
                if (canvas instanceof HTMLCanvasElement) {
                    htmlCanvas = canvas;
                }
                else {
                    htmlCanvas = document.getElementById(canvas);
                }
                // The application will create a renderer using WebGL, if possible,
                // with a fallback to a canvas render. It will also setup the ticker
                // and the root stage PIXI.Container
                this.app = new PIXI.Application({ view: htmlCanvas, backgroundColor: rgbToNumber(backgroundColor) });
            }
            // add mouse control
            this.mouse = matter_js_1.Mouse.create(htmlCanvas); // call before scene switch
            this.switchScene(new scene_1.Scene()); // empty scene as default (call after Engine.create() and renderer init !!!)
            var _this = this;
            this.simTicker = new timer_1.Timer(this.simSleepTime, function (delta) {
                // delta is the time from last call
                _this.simulate();
            });
        }
        SimulationEngine.prototype.setupDebugRenderer = function (canvas, wireframes, enableMouse) {
            if (wireframes === void 0) { wireframes = false; }
            if (enableMouse === void 0) { enableMouse = true; }
            if (this.debugRenderer) {
                console.log("Debug renderer already used!");
                //return;
            }
            this.debugRendererUsed = true;
            var htmlCanvas = null;
            if (canvas instanceof HTMLElement) {
                htmlCanvas = canvas;
            }
            else {
                htmlCanvas = document.getElementById(canvas);
            }
            this.debugRenderer = matter_js_1.Render.create({
                element: htmlCanvas,
                engine: this.engine,
                options: { wireframes: wireframes }
            });
            matter_js_1.Render.run(this.debugRenderer);
            if (enableMouse) {
                var mouse = matter_js_1.Mouse.create(htmlCanvas); // call before scene switch
                // TODO: different mouse constarains?
                var mouseConstraint = matter_js_1.MouseConstraint.create(this.engine, {
                    mouse: mouse
                });
                matter_js_1.World.add(this.engine.world, mouseConstraint);
            }
        };
        SimulationEngine.prototype.testPhysics = function () {
            // TODO: remove
            var world = this.engine.world;
            matter_js_1.World.add(world, [
                // falling blocks
                matter_js_1.Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 }),
                matter_js_1.Bodies.rectangle(400, 100, 60, 60, { frictionAir: 0.05 }),
                matter_js_1.Bodies.rectangle(600, 100, 60, 60, { frictionAir: 0.1 }),
                // walls
                matter_js_1.Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
                matter_js_1.Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
                matter_js_1.Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
                matter_js_1.Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
            ]);
        };
        SimulationEngine.prototype.startSim = function () {
            this.simTicker.start();
        };
        SimulationEngine.prototype.stopSim = function () {
            this.simTicker.stop();
        };
        SimulationEngine.prototype.setDT = function (dt) {
            this.dt = dt;
        };
        SimulationEngine.prototype.setSimSleepTime = function (simSleepTime) {
            this.simSleepTime = simSleepTime;
            this.simTicker.sleepTime = simSleepTime;
        };
        SimulationEngine.prototype.switchScene = function (scene) {
            var _this_1 = this;
            this.scene = scene;
            // TODO: add physics and normal entities
            if (this.app && this.app.stage.children.length > 0) {
                this.app.stage.removeChildren(0, this.app.stage.children.length - 1);
            }
            // TODO: remove all listeners?
            // if(this.app) {
            //  this.app.stage.removeAllListeners();
            // }
            matter_js_1.World.clear(this.engine.world, false);
            // TODO: different mouse constarains?
            var mouseConstraint = matter_js_1.MouseConstraint.create(this.engine, {
                mouse: this.mouse
            });
            matter_js_1.World.add(this.engine.world, mouseConstraint);
            // TODO: iterate over entities
            var entities = this.scene.getEntities();
            entities.forEach(function (entity) {
                if (entity instanceof entities_1.PhysicsEntity) {
                    matter_js_1.World.add(_this_1.engine.world, entity.physicsBody);
                }
                if (_this_1.app && entity.displayObject) {
                    _this_1.app.stage.addChild(entity.displayObject);
                }
            });
        };
        SimulationEngine.prototype.simulate = function () {
            if (this.scene) {
                this.scene.prePhysicsSim(); // simulate robots and other entities
                matter_js_1.Engine.update(this.engine, this.dt);
                this.scene.postPhysicsSim(); // simulate robots and other entities
            }
        };
        return SimulationEngine;
    }());
    exports.SimulationEngine = SimulationEngine;
});
