define(["require", "exports", "matter-js", "./pixijs"], function (require, exports, matter_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Scene = void 0;
    var Scene = /** @class */ (function () {
        function Scene() {
            this.robots = [];
            this.engine = matter_js_1.Engine.create();
            this.debugRenderer = null;
            this.dt = 10;
        }
        Scene.prototype.initMouse = function (mouse) {
            // TODO
        };
        /**
         * called on scene switch
         */
        Scene.prototype.onInit = function () {
        };
        /**
         * called on scene switch
         */
        Scene.prototype.onDeInit = function () {
        };
        /**
         * destroy this scene
         */
        Scene.prototype.destroy = function () {
        };
        Scene.prototype.setDT = function (dt) {
            this.dt = dt;
        };
        // for physics tics
        Scene.prototype.update = function () {
            matter_js_1.Engine.update(this.engine, this.dt);
            var bodies = matter_js_1.Composite.allBodies(this.engine.world);
            bodies.forEach(function (body) {
                if (body.displayable) {
                    body.displayable.updateFromBody(body);
                }
            });
            /*
            var constraints = Composite.allConstraints(this.engine.world);
            constraints.forEach(constrait => {
                // TODO
            });*/
        };
        // for debugging
        Scene.prototype.setupDebugRenderer = function (canvas, wireframes, enableMouse) {
            if (wireframes === void 0) { wireframes = false; }
            if (enableMouse === void 0) { enableMouse = true; }
            if (this.debugRenderer) {
                console.error("Debug renderer already used!");
                return;
            }
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
        Scene.prototype.testPhysics = function () {
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
        return Scene;
    }());
    exports.Scene = Scene;
});
