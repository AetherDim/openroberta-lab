define(["require", "exports", "../Displayable", "matter-js", "../Timer", "../ScrollView", "../ProgramManager"], function (require, exports, Displayable_1, matter_js_1, Timer_1, ScrollView_1, ProgramManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Scene = void 0;
    var Scene = /** @class */ (function () {
        //
        // #############################################################################
        //
        function Scene() {
            this.numberOfRobots = 1;
            /**
             * All programmable robots within the scene.
             * The program flow manager will use the robots internally.
             */
            this.robots = new Array();
            this.programManager = new ProgramManager_1.ProgramManager(this);
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
            //
            // #############################################################################
            //
            this.hasFinishedLoading = false;
            this.startedLoading = false;
            this.needsInit = false;
            //
            // #############################################################################
            //
            /**
             * Physics engine used by the scene
             */
            this.engine = matter_js_1.Engine.create();
            /**
             * current delta time for the physics simulation
             */
            this.dt = 0.016;
            //
            // #############################################################################
            //
            /**
             * sleep time before calling update
             */
            this.simSleepTime = 1 / 60;
            //
            // #############################################################################
            //
            /**
             * Debug renderer used by the scene for all registered physics object
             */
            this.debugRenderer = null;
            /**
             * whether to create debug displayables to show all physics objects
             */
            this.debugPixiRendering = false;
            /**
             * current rendering instance
             */
            this.sceneRenderer = null;
            //
            // #############################################################################
            //
            this.mouseConstraint = null;
            // register events
            var _this = this;
            matter_js_1.Events.on(this.engine.world, "beforeAdd", function (e) {
                _this.addPhysics(e.object);
            });
            matter_js_1.Events.on(this.engine.world, "afterRemove", function (e) {
                _this.removePhysics(e.object);
            });
            this.setupContainers();
            this.simTicker = new Timer_1.Timer(this.simSleepTime, function (delta) {
                // delta is the time from last call
                _this.update();
            });
            this.initLoadingContainer();
        }
        Scene.prototype.getProgramManager = function () {
            return this.programManager;
        };
        Scene.prototype.getRobots = function () {
            return this.robots;
        };
        Scene.prototype.getNumberOfRobots = function () {
            return this.numberOfRobots;
        };
        Scene.prototype.setupContainers = function () {
            this.groundContainer.zIndex = this.groundContainerZ;
            this.groundAnimationContainer.zIndex = this.groundAnimationContainerZ;
            this.entityBottomContainer.zIndex = this.entityBottomContainerZ;
            this.entityContainer.zIndex = this.entityContainerZ;
            this.entityTopContainer.zIndex = this.entityTopContainerZ;
            this.topContainer.zIndex = this.topContainerZ;
        };
        Scene.prototype.registerContainersToEngine = function () {
            this.sceneRenderer.addDisplayable(this.groundContainer);
            this.sceneRenderer.addDisplayable(this.groundAnimationContainer);
            this.sceneRenderer.addDisplayable(this.entityBottomContainer);
            this.sceneRenderer.addDisplayable(this.entityContainer);
            this.sceneRenderer.addDisplayable(this.entityTopContainer);
            this.sceneRenderer.addDisplayable(this.topContainer);
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
        Scene.prototype.updateColorDataFunction = function () {
            var canvas = this.getRenderer().getCanvasFromDisplayObject(this.groundContainer);
            var renderingContext = canvas.getContext("2d");
            var bounds = this.groundContainer.getBounds();
            this.getColorData = function (x, y, w, h) { return renderingContext.getImageData(x - bounds.x, y - bounds.y, w, h); };
        };
        Scene.prototype.finishedLoading = function () {
            this.hasFinishedLoading = true;
            this.startedLoading = true; // for safety
            this.sceneRenderer.removeDisplayable(this.loadingContainer);
            this.registerContainersToEngine(); // register rendering containers
            if (this.needsInit) {
                this.onInit();
                this.updateColorDataFunction();
                this.needsInit = false;
            }
            // auto start simulation
            this.startSim();
        };
        Scene.prototype.startLoading = function () {
            if (!this.startedLoading && !this.hasFinishedLoading) {
                this.startedLoading = true;
                this.sceneRenderer.addDisplayable(this.loadingContainer);
                this.onFirstLoad();
            }
        };
        Scene.prototype.setDT = function (dt) {
            this.dt = dt;
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
        Scene.prototype.getRenderer = function () {
            return this.sceneRenderer;
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
                        this.updateColorDataFunction();
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
        Scene.prototype.renderTick = function (dt) {
            if (this.startedLoading && !this.hasFinishedLoading) {
                this.updateLoadingAnimation(dt);
            }
            this.onRenderTick(dt);
        };
        Scene.prototype.interactionEvent = function (ev) {
            switch (ev.type) {
                case ScrollView_1.EventType.PRESS:
                    // get bodies
                    var mousePosition = ev.data.getCurrentLocalPosition();
                    var bodies = this.getBodiesAt(mousePosition);
                    if (bodies.length >= 1) {
                        var body = bodies[0];
                        ev.cancel();
                        matter_js_1.Sleeping.set(body, false);
                        if (this.mouseConstraint) {
                            matter_js_1.World.remove(this.engine.world, this.mouseConstraint);
                        }
                        this.mouseConstraint = matter_js_1.Constraint.create({
                            bodyA: body,
                            pointA: matter_js_1.Vector.sub(mousePosition, body.position),
                            pointB: mousePosition
                        });
                        // attach constraint
                        matter_js_1.World.add(this.engine.world, this.mouseConstraint);
                    }
                    break;
                case ScrollView_1.EventType.RELEASE:
                    // remove constrain
                    if (this.mouseConstraint) {
                        matter_js_1.World.remove(this.engine.world, this.mouseConstraint);
                        this.mouseConstraint = null;
                    }
                    break;
                case ScrollView_1.EventType.DRAG:
                    // move constrain
                    if (this.mouseConstraint) {
                        this.mouseConstraint.pointB = ev.data.getCurrentLocalPosition();
                        ev.cancel();
                    }
                    break;
                default:
                    break;
            }
            this.onInteractionEvent(ev);
        };
        //
        // #############################################################################
        //
        /**
         * Returns all bodies containing the given point
         * @param position position to check for bodies
         * @param singleBody whether to return only one body
         */
        Scene.prototype.getBodiesAt = function (position, singleBody) {
            if (singleBody === void 0) { singleBody = false; }
            var intersected = [];
            var bodies = matter_js_1.Composite.allBodies(this.engine.world);
            // code borrowed from Matterjs MouseConstraint
            for (var i = 0; i < bodies.length; i++) {
                var body = bodies[i];
                if (matter_js_1.Bounds.contains(body.bounds, position) && body.enableMouseInteraction) {
                    for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                        var part = body.parts[j];
                        if (matter_js_1.Vertices.contains(part.vertices, position)) {
                            intersected.push(body);
                            if (singleBody) {
                                return intersected;
                            }
                            break;
                        }
                    }
                }
            }
            return intersected;
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
                        if (body.displayable) {
                            this.entityContainer.addChild(body.displayable.displayObject);
                        }
                        if (this.debugPixiRendering) {
                            if (!body.debugDisplayable) {
                                body.debugDisplayable = Displayable_1.createDisplayableFromBody(body);
                            }
                            this.entityContainer.addChild(body.debugDisplayable.displayObject);
                        }
                        break;
                    case 'composite':
                        matter_js_1.Composite.allBodies(element).forEach(function (e) {
                            _this_1.addPhysics(e);
                        });
                        break;
                    case "mouseConstraint":
                    case 'constraint':
                        // TODO: Maybe add constraint as PIXI graphics
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
                        if (body.displayable) {
                            this.entityContainer.removeChild(body.displayable.displayObject);
                        }
                        if (body.debugDisplayable) {
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
                        // TODO: Maybe remove constraint PIXI graphics
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
        //
        // #############################################################################
        //
        Scene.prototype.destroy = function () {
            this.onDestroy();
            // TODO
        };
        /**
         * update physics and robots
         */
        Scene.prototype.update = function () {
            var _this_1 = this;
            this.onUpdate();
            // update robots
            // update ground every tick: this.updateColorDataFunction()
            this.robots.forEach(function (robot) {
                robot.update(_this_1.dt, _this_1.programManager.isProgramPaused(), _this_1.getColorData);
            });
            this.programManager.update(); // update breakpoints, ...
            matter_js_1.Engine.update(this.engine, this.dt); // update physics
            // update rendering positions
            // TODO: switch to scene internal drawable list? better performance???
            var bodies = matter_js_1.Composite.allBodies(this.engine.world);
            bodies.forEach(function (body) {
                if (body.displayable) {
                    body.displayable.updateFromBody(body);
                }
            });
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
         * destroy all loaded textures
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
        /**
         * called after a mouse/touch or scroll event
         * @param ev event data
         */
        Scene.prototype.onInteractionEvent = function (ev) {
        };
        return Scene;
    }());
    exports.Scene = Scene;
});
