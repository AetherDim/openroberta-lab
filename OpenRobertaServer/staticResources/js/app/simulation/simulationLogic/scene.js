define(["require", "exports", "./robot", "./displayable", "matter-js", "./electricMotor", "./pixijs"], function (require, exports, robot_1, displayable_1, matter_js_1, electricMotor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Scene = void 0;
    var Scene = /** @class */ (function () {
        function Scene() {
            this.robots = new Array();
            this.displayables = new Array();
            this.debugDisplayables = new Array();
            this.engine = matter_js_1.Engine.create();
            this.debugRenderer = null;
            this.dt = 0.016;
            this.debugPixiRendering = false;
            this.mouseConstraint = null;
            this.onDisplayableAdd = function (d) { };
            this.onDisplayableRemove = function (d) { };
            this.simEngine = null;
            var _this = this;
            matter_js_1.Events.on(this.engine.world, "beforeAdd", function (e) {
                _this.addPhysics(e.object);
            });
            matter_js_1.Events.on(this.engine.world, "afterRemove", function (e) {
                _this.removePhysics(e.object);
            });
        }
        Scene.prototype.setSimulationEngine = function (simEngine) {
            if (simEngine === void 0) { simEngine = null; }
            if (simEngine) {
                if (simEngine != this.simEngine) {
                    this.simEngine = simEngine;
                    this.onDeInit();
                    var _this_1 = this;
                    this.onDisplayableAdd = function (d) {
                        _this_1.simEngine.addDiplayable(d.displayObject);
                    };
                    this.onDisplayableRemove = function (d) {
                        _this_1.simEngine.removeDisplayable(d.displayObject);
                    };
                    simEngine.switchScene(this);
                    this.onInit();
                }
            }
            else {
                this.simEngine = null;
                this.onDeInit();
                this.onDisplayableAdd = function (d) { };
                this.onDisplayableRemove = function (d) { };
            }
        };
        Scene.prototype.setPrograms = function (programs) {
            if (programs.length < this.robots.length) {
                console.error("not enough programs!");
                return;
            }
            for (var i = 0; i < this.robots.length; i++) {
                this.robots[i].setProgram(programs[i], []); // TODO: breakpoints
            }
        };
        Scene.prototype.initMouse = function (mouse) {
            if (this.mouseConstraint) {
                // ugly workaround for missing MouseConstraint in remove ...
                matter_js_1.World.remove(this.engine.world, this.mouseConstraint);
            }
            // TODO: different mouse constarains?
            this.mouseConstraint = matter_js_1.MouseConstraint.create(this.engine, {
                mouse: mouse
            });
            matter_js_1.World.add(this.engine.world, this.mouseConstraint);
        };
        Scene.prototype.addPhysics = function (obj) {
            var _this_1 = this;
            if (!obj) {
                return;
            }
            var element = obj;
            if (element.type) {
                switch (element.type) {
                    case 'body':
                        var body = element;
                        if (body.displayable && !this.displayables.includes(body.displayable)) {
                            this.displayables.push(body.displayable);
                            this.onDisplayableAdd(body.displayable);
                        }
                        if (this.debugPixiRendering) {
                            if (!body.debugDisplayable) {
                                body.debugDisplayable = displayable_1.createDisplayableFromBody(body);
                            }
                            if (!this.debugDisplayables.includes(body.debugDisplayable)) {
                                this.debugDisplayables.push(body.debugDisplayable);
                                this.onDisplayableAdd(body.debugDisplayable);
                            }
                        }
                        break;
                    case 'composite':
                        matter_js_1.Composite.allBodies(element).forEach(function (e) {
                            _this_1.addPhysics(e);
                        });
                        break;
                    case "mouseConstraint":
                    case 'constraint':
                        var constraint = element;
                        this.addPhysics(constraint.bodyA);
                        this.addPhysics(constraint.bodyB);
                        break;
                    default:
                        console.error("unknown type: " + element.type);
                        break;
                }
            }
            else if (Array.isArray(obj)) {
                var array = obj;
                var _this_2 = this;
                array.forEach(function (e) { return _this_2.addPhysics(e); });
            }
            else {
                console.error('unknown type: ' + obj);
            }
        };
        Scene.prototype.removePhysics = function (obj) {
            var _this_1 = this;
            if (!obj) {
                return;
            }
            var element = obj;
            if (element.type) {
                switch (element.type) {
                    case 'body':
                        var body = element;
                        if (body.displayable && this.displayables.includes(body.displayable)) {
                            var idx = this.displayables.indexOf(body.displayable);
                            this.displayables.splice(idx);
                            this.onDisplayableRemove(body.displayable);
                        }
                        if (body.debugDisplayable && this.displayables.includes(body.debugDisplayable)) {
                            var idx = this.debugDisplayables.indexOf(body.debugDisplayable);
                            this.debugDisplayables.splice(idx);
                            this.onDisplayableRemove(body.debugDisplayable);
                        }
                        break;
                    case 'composite':
                        matter_js_1.Composite.allBodies(element).forEach(function (e) {
                            _this_1.removePhysics(e);
                        });
                        break;
                    case "mouseConstraint":
                    case 'constraint':
                        var constraint = element;
                        this.removePhysics(constraint.bodyA);
                        this.removePhysics(constraint.bodyB);
                        break;
                    default:
                        console.error("unknown type: " + element.type);
                        break;
                }
            }
            else if (Array.isArray(obj)) {
                var array = obj;
                var _this_3 = this;
                array.forEach(function (e) { return _this_3.removePhysics(e); });
            }
            else {
                console.error('unknown type: ' + obj);
            }
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
            var _this_1 = this;
            this.robots.forEach(function (robot) { return robot.update(_this_1.dt); });
            matter_js_1.Engine.update(this.engine, this.dt);
            // update rendering positions
            // TODO: switch to scene internal drawable list?
            var bodies = matter_js_1.Composite.allBodies(this.engine.world);
            bodies.forEach(function (body) {
                if (body.displayable) {
                    body.displayable.updateFromBody(body);
                }
            });
            if (this.debugDisplayables) {
                bodies.forEach(function (body) {
                    if (body.debugDisplayable) {
                        body.debugDisplayable.updateFromBody(body);
                    }
                });
            }
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
            // scaling the context for closeup rendering
            //this.debugRenderer.context.scale(10, 10)
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
            var scale = 1.0;
            var robot = robot_1.Robot.default(scale);
            this.robots.push(robot);
            var robotComposite = robot.physicsComposite;
            matter_js_1.World.add(this.engine.world, robotComposite);
            matter_js_1.Composite.translate(robotComposite, matter_js_1.Vector.create(70 * scale, 90 * scale));
            this.engine.world.gravity.y = 0.0;
            var body = robot.body;
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
                var force = matter_js_1.Vector.mult(vec, 0.0001 * 1000 * 1000 * 1000 * 1000);
                var normalVec = matter_js_1.Vector.mult(matter_js_1.Vector.create(-vec.y, vec.x), 10);
                var forcePos = matter_js_1.Vector.add(body.position, matter_js_1.Vector.mult(vec, -40));
                var maxForce = 100 * 1000 * 1000;
                robot.leftDrivingWheel.applyTorqueFromMotor(new electricMotor_1.ElectricMotor(2, maxForce), leftForce);
                robot.rightDrivingWheel.applyTorqueFromMotor(new electricMotor_1.ElectricMotor(2, maxForce), rightForce);
            }
            matter_js_1.Events.on(this.engine, 'beforeUpdate', function () {
                updateKeysActions();
            });
            // TODO: remove
            var world = this.engine.world;
            matter_js_1.World.add(world, [
                // blocks
                matter_js_1.Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 }),
                matter_js_1.Bodies.rectangle(400, 100, 60, 60, { frictionAir: 0.05 }),
                matter_js_1.Bodies.rectangle(600, 100, 60, 60, { frictionAir: 0.1 }),
                // walls
                matter_js_1.Bodies.rectangle(400, -25, 800, 50, { isStatic: true }),
                matter_js_1.Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
                matter_js_1.Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
                matter_js_1.Bodies.rectangle(-25, 300, 50, 600, { isStatic: true })
            ]);
        };
        return Scene;
    }());
    exports.Scene = Scene;
});
