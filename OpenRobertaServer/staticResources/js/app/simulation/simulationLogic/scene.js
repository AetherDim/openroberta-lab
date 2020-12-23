define(["require", "exports", "./robot", "matter-js", "./pixijs"], function (require, exports, robot_1, matter_js_1) {
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
            var constraints = matter_js_1.Composite.allConstraints(this.engine.world);
            constraints.forEach(function (constrait) {
                // TODO
            });
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
            var robot = new robot_1.Robot();
            var robotComposite = robot.physicsComposite;
            matter_js_1.World.add(this.engine.world, robotComposite);
            matter_js_1.Composite.translate(robotComposite, matter_js_1.Vector.create(300, 400));
            this.engine.world.gravity.y = 0.0;
            var body = robot.body;
            var robotWheels = robot.wheels;
            var keyDownList = [];
            document.onkeydown = function (event) {
                if (!keyDownList.includes(event.key)) {
                    keyDownList.push(event.key);
                }
            };
            document.onkeyup = function (event) {
                keyDownList = keyDownList.filter(function (key) { return key != event.key; });
            };
            function updateKeysActions() {
                // $('#notConstantValue').html('');
                // $("#notConstantValue").append('<div><label>Test</label><span>' + keyDownList + '</span></div>');    
                var leftForce = 0;
                var rightForce = 0;
                var factor = keyDownList.includes("s") ? -1 : 1;
                keyDownList.forEach(function (key) {
                    switch (key) {
                        case 'w':
                            leftForce += 1;
                            rightForce += 1;
                            break;
                        case 's':
                            leftForce += -1;
                            rightForce += -1;
                            break;
                        case 'a':
                            leftForce += -1 * factor;
                            rightForce += 1 * factor;
                            break;
                        case 'd':
                            leftForce += 1 * factor;
                            rightForce += -1 * factor;
                            break;
                    }
                });
                var vec = matter_js_1.Vector.create(Math.cos(body.angle), Math.sin(body.angle));
                var force = matter_js_1.Vector.mult(vec, 0.003);
                var normalVec = matter_js_1.Vector.mult(matter_js_1.Vector.create(-vec.y, vec.x), 10);
                var forcePos = matter_js_1.Vector.add(body.position, matter_js_1.Vector.mult(vec, -40));
                //force = Vector.mult(vec, Vector.dot(force, vec))
                // Body.applyForce(body, carWheels.rearLeft.position, Vector.mult(force, leftForce));
                // Body.applyForce(body, carWheels.rearRight.position, Vector.mult(force, rightForce));
                matter_js_1.Body.applyForce(robotWheels.rearLeft, robotWheels.rearLeft.position, matter_js_1.Vector.mult(force, leftForce));
                matter_js_1.Body.applyForce(robotWheels.rearRight, robotWheels.rearRight.position, matter_js_1.Vector.mult(force, rightForce));
                // Body.applyForce(body, Vector.sub(forcePos, normalVec), Vector.mult(force, leftForce));
                // Body.applyForce(body, Vector.add(forcePos, normalVec), Vector.mult(force, rightForce));
            }
            matter_js_1.Events.on(this.engine, 'beforeUpdate', function () {
                updateKeysActions();
                // let force = Vector.mult(Vector.sub(mouse.position, body.position), forceScale);
                // let vec = Vector.create(Math.cos(body.angle), Math.sin(body.angle))
                // force = Vector.mult(vec ,Vector.dot(force, vec))
                // Body.applyForce(body, body.position, force);
            });
            // TODO: remove
            var world = this.engine.world;
            matter_js_1.World.add(world, [
                // blocks
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
