define(["require", "exports", "./robot", "./displayable", "matter-js", "./electricMotor", "./timer", "./Unit", "./pixijs"], function (require, exports, robot_1, displayable_1, matter_js_1, electricMotor_1, timer_1, Unit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Scene = void 0;
    var Scene = /** @class */ (function () {
        function Scene() {
            /**
             * All robots within the scene
             */
            this.robots = new Array();
            //
            // #############################################################################
            //
            /**
             * layer 0: ground
             */
            this.groundContainer = new PIXI.Container();
            /**
             * z-index for PIXI, this will define the rendering layer
             */
            this.groundContainerZ = 0;
            /**
             * layer 1: ground animation
             */
            this.groundAnimationContainer = new PIXI.Container();
            /**
             * z-index for PIXI, this will define the rendering layer
             */
            this.groundAnimationContainerZ = 10;
            /**
             * layer 2: entity bottom layer (shadorws/effects/...)
             */
            this.entityBottomContainer = new PIXI.Container();
            /**
             * z-index for PIXI, this will define the rendering layer
             */
            this.entityBottomContainerZ = 20;
            /**
             * layer 3: physics/other things <- robots
             */
            this.entityContainer = new PIXI.Container();
            /**
             * z-index for PIXI, this will define the rendering layer
             */
            this.entityContainerZ = 30;
            /**
             * layer 4: for entity descriptions/effects
             */
            this.entityTopContainer = new PIXI.Container();
            /**
             * z-index for PIXI, this will define the rendering layer
             */
            this.entityTopContainerZ = 40;
            /**
             * layer 5: top/text/menus
             */
            this.topContainer = new PIXI.Container();
            this.topContainerZ = 50;
            //
            // #############################################################################
            //
            this.loadingContainer = new PIXI.Container();
            this.loadingContainerZ = 50;
            this.loadingText = null;
            this.loadingAnimation = null;
            /**
             * contains all currently registered displayebles
             * scene will destroy them all if destroy() is called
             * if a displayable is removed, it shall be destroyed
             */
            this.displayables = new Array();
            /**
             * contains all currently registered displayebles for debugging
             * scene will destroy them all if destroy() is called
             * if a displayable is removed, it shall be destroyed
             */
            this.debugDisplayables = new Array();
            /**
             * Physics engine used by the scene
             */
            this.engine = matter_js_1.Engine.create();
            /**
             * sleep time before calling update
             */
            this.simSleepTime = 1 / 60;
            /**
             * Debug renderer used by the scene for all registered physics object
             */
            this.debugRenderer = null;
            /**
             * current delta time for the physics simulation
             */
            this.dt = 0.016;
            /**
             * whether to create debug displayables to show all physics objects
             */
            this.debugPixiRendering = false;
            // TODO: remove
            this.mouseConstraint = null;
            /**
             * current rendering instance
             */
            this.sceneRenderer = null;
            this.hasFinishedLoading = false;
            this.startedLoading = false;
            this.needsInit = false;
            // register events
            var _this = this;
            matter_js_1.Events.on(this.engine.world, "beforeAdd", function (e) {
                _this.addPhysics(e.object);
            });
            matter_js_1.Events.on(this.engine.world, "afterRemove", function (e) {
                _this.removePhysics(e.object);
            });
            this.setupContainers();
            this.simTicker = new timer_1.Timer(this.simSleepTime, function (delta) {
                // delta is the time from last call
                _this.update();
            });
            this.initLoadingContainer();
        }
        Scene.prototype.setupContainers = function () {
            this.groundContainer.zIndex = this.groundContainerZ;
            this.groundAnimationContainer.zIndex = this.groundAnimationContainerZ;
            this.entityBottomContainer.zIndex = this.entityBottomContainerZ;
            this.entityContainer.zIndex = this.entityContainerZ;
            this.entityTopContainer.zIndex = this.entityTopContainerZ;
            this.topContainer.zIndex = this.topContainerZ;
        };
        Scene.prototype.registerContainersToEngine = function () {
            this.sceneRenderer.addDiplayable(this.groundContainer);
            this.sceneRenderer.addDiplayable(this.groundAnimationContainer);
            this.sceneRenderer.addDiplayable(this.entityBottomContainer);
            this.sceneRenderer.addDiplayable(this.entityContainer);
            this.sceneRenderer.addDiplayable(this.entityTopContainer);
            this.sceneRenderer.addDiplayable(this.topContainer);
        };
        Scene.prototype.initLoadingContainer = function () {
            this.loadingContainer.zIndex = this.loadingContainerZ;
            this.loadingText = new PIXI.Text("Loading ...", {
                fontFamily: 'Arial',
                fontSize: 60,
                fill: 0x000000
            });
            var container = new PIXI.Container();
            this.loadingAnimation = container;
            var ae = new PIXI.Text("æ", {
                fontFamily: 'Arial',
                fontSize: 100,
                fill: 0xfd7e14
            });
            // fix text center
            ae.x = -ae.width / 2;
            ae.y = -ae.height / 2;
            container.addChild(ae);
            this.loadingContainer.addChild(this.loadingText);
            this.loadingContainer.addChild(this.loadingAnimation);
        };
        Scene.prototype.updateLoadingAnimation = function (dt) {
            this.loadingText.x = this.sceneRenderer.getWidth() * 0.1;
            this.loadingText.y = this.sceneRenderer.getHeight() * 0.45;
            this.loadingAnimation.x = this.sceneRenderer.getWidth() * 0.7;
            this.loadingAnimation.y = this.sceneRenderer.getHeight() * 0.5;
            this.loadingAnimation.rotation += 0.05 * dt;
        };
        Scene.prototype.startSim = function () {
            if (this.hasFinishedLoading) {
                this.simTicker.start();
            }
        };
        Scene.prototype.stopSim = function () {
            if (this.hasFinishedLoading) {
                this.simTicker.stop();
            }
        };
        Scene.prototype.setSimSleepTime = function (simSleepTime) {
            this.simSleepTime = simSleepTime;
            this.simTicker.sleepTime = simSleepTime;
        };
        Scene.prototype.setSimulationEngine = function (sceneRenderer) {
            if (sceneRenderer === void 0) { sceneRenderer = null; }
            if (sceneRenderer) {
                if (sceneRenderer != this.sceneRenderer) {
                    if (this.hasFinishedLoading) {
                        this.onDeInit();
                    }
                    this.sceneRenderer = sceneRenderer; // code order!!!
                    sceneRenderer.switchScene(this); // this will remove all registered rendering containers
                    if (!this.startedLoading) {
                        this.startLoading();
                    }
                    // add rendering containers from this scene
                    if (this.hasFinishedLoading) {
                        this.onInit();
                    }
                    else {
                        this.needsInit = true;
                    }
                }
            }
            else {
                if (this.hasFinishedLoading) {
                    this.onDeInit();
                }
                this.sceneRenderer = null;
            }
        };
        Scene.prototype.finishedLoading = function () {
            this.hasFinishedLoading = true;
            this.startedLoading = true; // for savety
            this.sceneRenderer.removeDisplayable(this.loadingContainer);
            this.registerContainersToEngine(); // register rendering containers
            if (this.needsInit) {
                this.onInit();
                this.needsInit = false;
            }
        };
        Scene.prototype.startLoading = function () {
            if (!this.startedLoading && !this.hasFinishedLoading) {
                this.startedLoading = true;
                this.sceneRenderer.addDiplayable(this.loadingContainer);
                this.onFirstLoad();
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
        // TODO:
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
                            this.entityContainer.addChild(body.displayable.displayObject);
                        }
                        if (this.debugPixiRendering) {
                            if (!body.debugDisplayable) {
                                body.debugDisplayable = displayable_1.createDisplayableFromBody(body);
                            }
                            if (!this.debugDisplayables.includes(body.debugDisplayable)) {
                                this.debugDisplayables.push(body.debugDisplayable);
                                this.entityContainer.addChild(body.debugDisplayable.displayObject);
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
                            this.entityContainer.removeChild(body.displayable.displayObject);
                        }
                        if (body.debugDisplayable && this.displayables.includes(body.debugDisplayable)) {
                            var idx = this.debugDisplayables.indexOf(body.debugDisplayable);
                            this.debugDisplayables.splice(idx);
                            this.entityContainer.removeChild(body.debugDisplayable.displayObject);
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
        Scene.prototype.destroy = function () {
            this.onDestroy();
            // TODO
        };
        Scene.prototype.setDT = function (dt) {
            this.dt = dt;
        };
        Scene.prototype.renderTick = function (dt) {
            if (this.startedLoading && !this.hasFinishedLoading) {
                this.updateLoadingAnimation(dt);
            }
            this.onRenderTick(dt);
        };
        /**
         * update physics and robots
         */
        Scene.prototype.update = function () {
            var _this_1 = this;
            this.onUpdate();
            this.robots.forEach(function (robot) { return robot.update(_this_1.dt); }); // update robots
            matter_js_1.Engine.update(this.engine, this.dt); // update physics
            // update rendering positions
            // TODO: switch to scene internal drawable list? better performance???
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
            this.onUpdatePostPhysics();
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
            // use 0.001 for EV3
            var scale = 0.001;
            Unit_1.Unit.setUnitScaling({ m: 1000 });
            // (<any>Resolver)._restingThresh = 4 * scale;
            // (<any>Resolver)._restingThreshTangent = 6 * scale;
            // (<any>Sleeping)._motionWakeThreshold = 0.18 * scale;
            // (<any>Sleeping)._motionSleepThreshold = 0.08 * scale;
            // (<any>Constraint)._minLength = 0.000001 * scale;
            //this.sceneRenderer.setRenderingScaleAndOffset(1 / scale, Vector.create())
            var useEV3 = true;
            var robot = useEV3 ? robot_1.Robot.EV3() : robot_1.Robot.default(scale);
            this.robots.push(robot);
            var robotComposite = robot.physicsComposite;
            matter_js_1.World.add(this.engine.world, robotComposite);
            matter_js_1.Composite.translate(robotComposite, Unit_1.Unit.getPositionVec(100 * scale, 100 * scale));
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
                var maxTorque = Unit_1.Unit.getTorque(100 * 1000 * 1000 * Math.pow(scale, 3.5));
                var motor = useEV3 ? electricMotor_1.ElectricMotor.EV3() : new electricMotor_1.ElectricMotor(120, maxTorque);
                robot.leftDrivingWheel.applyTorqueFromMotor(motor, leftForce);
                robot.rightDrivingWheel.applyTorqueFromMotor(motor, rightForce);
            }
            matter_js_1.Events.on(this.engine, 'beforeUpdate', function () {
                updateKeysActions();
            });
            // TODO: remove
            var world = this.engine.world;
            var bodies = [
                // blocks
                matter_js_1.Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 }),
                matter_js_1.Bodies.rectangle(400, 100, 60, 60, { frictionAir: 0.05 }),
                matter_js_1.Bodies.rectangle(600, 100, 60, 60, { frictionAir: 0.1 }),
                // walls
                matter_js_1.Bodies.rectangle(400, -25, 800, 50, { isStatic: true }),
                matter_js_1.Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
                matter_js_1.Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
                matter_js_1.Bodies.rectangle(-25, 300, 50, 600, { isStatic: true })
            ];
            bodies.forEach(function (body) { return matter_js_1.Body.scale(body, scale, scale, matter_js_1.Vector.create()); });
            bodies = [
                displayable_1.createRect(400 * scale, -25 * scale, 800 * scale, 50 * scale),
                displayable_1.createRect(400 * scale, 600 * scale, 800 * scale, 50 * scale),
                displayable_1.createRect(800 * scale, 300 * scale, 50 * scale, 600 * scale),
                displayable_1.createRect(-25 * scale, 300 * scale, 50 * scale, 600 * scale),
            ];
            bodies.forEach(function (body) { return matter_js_1.Body.setStatic(body, true); });
            matter_js_1.World.add(world, bodies);
            var allBodies = matter_js_1.Composite.allBodies(world);
            allBodies.forEach(function (body) { return body.slop *= scale; });
        };
        //
        // User defined functions
        //
        /**
         * load all textures and call finishedLoading() when done
         * please do not block within this method and use PIXI.Loader callbacks
         */
        Scene.prototype.onFirstLoad = function () {
            var _this_1 = this;
            setTimeout(function () {
                _this_1.finishedLoading(); // swap from loading to scene
            }, 2000);
        };
        /**
         * called on scene switch
         */
        Scene.prototype.onInit = function () {
        };
        /**
         * called on scene switch to null scene
         */
        Scene.prototype.onDeInit = function () {
        };
        /**
         * destroy this scene
         */
        Scene.prototype.onDestroy = function () {
        };
        /**
         * called before updating physics and robots
         */
        Scene.prototype.onUpdate = function () {
        };
        /**
         * called after all updates
         */
        Scene.prototype.onUpdatePostPhysics = function () {
        };
        /**
         * called once per frame
         */
        Scene.prototype.onRenderTick = function (dt) {
        };
        return Scene;
    }());
    exports.Scene = Scene;
});
