var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
define(["require", "exports", "matter-js", "../Timer", "../ScrollView", "../Unit", "../Util", "./AsyncChain", "../Waypoints/WaypointsManager", "./../GlobalDebug", "./Manager/EntityManager", "./Manager/ContainerManager", "./Manager/RobotManager", "../EventManager/EventManager"], function (require, exports, matter_js_1, Timer_1, ScrollView_1, Unit_1, Util_1, AsyncChain_1, WaypointsManager_1, GlobalDebug_1, EntityManager_1, ContainerManager_1, RobotManager_1, EventManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Scene = void 0;
    var Scene = /** @class */ (function () {
        //
        // #############################################################################
        //
        /**
         *
         * @param name if name is an empty string -> disable debug gui
         */
        function Scene(name) {
            this.robotManager = new RobotManager_1.RobotManager(this);
            this.entityManager = new EntityManager_1.EntityManager(this);
            this.containerManager = new ContainerManager_1.ContainerManager(this);
            //
            // #############################################################################
            //
            this.eventManager = EventManager_1.EventManager.init({
                onStartSimulation: EventManager_1.ParameterTypes.none,
                onPauseSimulation: EventManager_1.ParameterTypes.none
            });
            //
            // #############################################################################
            //
            this.onChainCompleteListeners = [];
            //
            // #############################################################################
            //
            this._unit = new Unit_1.Unit({});
            //
            // #############################################################################
            //
            this.origin = { x: 0, y: 0 };
            this.size = { width: 0, height: 0 };
            //
            // #############################################################################
            //
            this.currentlyLoading = false;
            this.resourcesLoaded = false;
            this.hasBeenInitialized = false;
            this.hasFinishedLoading = false;
            this.loadingStartTime = 0;
            this.minLoadTime = 0;
            //
            // #############################################################################
            //
            /**
             * Physics engine used by the scene
             */
            this.engine = matter_js_1.Engine.create();
            this.world = this.engine.world;
            this.autostartSim = true;
            /**
             * current delta time for the physics simulation (internal units)
             */
            this.dt = 0.016;
            //
            // #############################################################################
            //
            /**
             * sleep time before calling update (SI-Unit)
             */
            this.simSleepTime = this.dt;
            this.simSpeedupFactor = 1;
            /**
             * whether to create debug displayables to show all physics objects
             */
            this.debugPixiRendering = false;
            //
            // #############################################################################
            //
            this.waypointsManager = new WaypointsManager_1.WaypointsManager();
            // set scene name
            this.name = name;
            // register events
            var _this = this;
            this.simTicker = new Timer_1.Timer(this.simSleepTime, function (delta) {
                // delta is the time from last render call
                for (var i = 0; i < _this.simSpeedupFactor; i++) {
                    if (_this.simTicker.shallStop) {
                        break;
                    }
                    _this.update();
                }
            });
            // simulation defaults
            // TODO: Gravity scale may depend on the chosen units
            this.engine.world.gravity = { scale: 1, x: 0, y: 0 };
            // has to be called after the name has been defined
            // defined 
            this.debug = new GlobalDebug_1.SceneDebug(this, this.name == "");
        }
        Scene.prototype.getContainers = function () {
            return this.containerManager;
        };
        Scene.prototype.getEntityManager = function () {
            return this.entityManager;
        };
        Scene.prototype.getRobotManager = function () {
            return this.robotManager;
        };
        Scene.prototype.getProgramManager = function () {
            return this.getRobotManager().getProgramManager();
        };
        Scene.prototype.removeAllEventHandlers = function () {
            this.eventManager.removeAllEventHandlers();
            this.getProgramManager().removeAllEventHandlers();
        };
        //
        // #############################################################################
        //
        Scene.prototype.addEntities = function () {
            var _a;
            var entities = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                entities[_i] = arguments[_i];
            }
            (_a = this.getEntityManager()).addEntities.apply(_a, __spreadArray([], __read(entities)));
        };
        Scene.prototype.addEntity = function (entity) {
            this.getEntityManager().addEntity(entity);
        };
        Scene.prototype.removeEntity = function (entity) {
            this.getEntityManager().removeEntity(entity);
        };
        Scene.prototype.addRobot = function (robot) {
            this.getRobotManager().addRobot(robot);
        };
        Scene.prototype.addOnAsyncChainBuildCompleteLister = function (fnc) {
            this.onChainCompleteListeners.push(fnc);
        };
        Object.defineProperty(Scene.prototype, "unit", {
            get: function () {
                return this._unit;
            },
            enumerable: false,
            configurable: true
        });
        // TODO: copy coords
        Scene.prototype.getSize = function () {
            return this.size;
        };
        Scene.prototype.getOrigin = function () {
            return this.origin;
        };
        Scene.prototype.updateBounds = function () {
            var _this_1 = this;
            this.origin = { x: 0, y: 0 };
            this.size = { width: 0, height: 0 };
            matter_js_1.Composite.allBodies(this.world).forEach(function (body) {
                var min = body.bounds.min;
                var max = body.bounds.max;
                if (_this_1.origin.x > min.x) {
                    _this_1.origin.x = min.x;
                }
                if (_this_1.origin.y > min.y) {
                    _this_1.origin.y = min.y;
                }
                if (_this_1.size.width < max.x) {
                    _this_1.size.width = max.x;
                }
                if (_this_1.size.height < max.y) {
                    _this_1.size.height = max.y;
                }
            });
            this.size.width -= this.origin.x;
            this.size.height -= this.origin.y;
        };
        Scene.prototype.getDebugGuiStatic = function () {
            return this.debug.debugGuiStatic;
        };
        Scene.prototype.getDebugGuiDynamic = function () {
            return this.debug.debugGuiDynamic;
        };
        Scene.prototype.initDynamicDebugGui = function () {
            this.debug.createDebugGuiDynamic();
        };
        Scene.prototype.getName = function () {
            return this.name;
        };
        Scene.prototype.finishedLoading = function (chain) {
            var _this_1 = this;
            var _a;
            // fake longer loading time for smooth animation
            var loadingTime = Date.now() - this.loadingStartTime;
            if (loadingTime < this.minLoadTime) {
                var _this = this;
                setTimeout(function () {
                    _this_1.finishedLoading(chain);
                }, this.minLoadTime - loadingTime);
                return;
            }
            // update the scene size
            this.updateBounds();
            // reset view position
            (_a = this.getRenderer()) === null || _a === void 0 ? void 0 : _a.zoomReset();
            // make container visibility
            this.getContainers().setVisibility(true);
            // update image for rgb sensor
            this.getContainers().updateGroundImageDataFunction();
            this.currentlyLoading = false;
            this.hasFinishedLoading = true; // needs to be set before startSim() is called
            this.hasBeenInitialized = true;
            if (this.autostartSim) {
                // auto start simulation
                this.startSim();
            }
            console.log('Finished loading!');
            chain.next(); // technically we don't need this
        };
        Scene.prototype.isLoadingComplete = function () {
            return this.hasFinishedLoading;
        };
        /**
         * Reloads the whole scene and force reloads the assets
         */
        Scene.prototype.fullReset = function (robotSetupData) {
            this.load(robotSetupData, true);
        };
        /**
         * Reloads the whole scene without reloading the assets
         */
        Scene.prototype.reset = function (robotSetupData) {
            this.load(robotSetupData);
        };
        Scene.prototype.unload = function (chain) {
            // we could do this again if we need to
            if (this.simTicker.running) {
                console.warn('sim timer is still running!!!');
            }
            // remove robots
            this.getRobotManager().clear();
            // remove all physic bodies
            matter_js_1.Composite.clear(this.getWorld(), false, true);
            // remove all drawables from the containers
            this.getContainers().clear();
            // reset function for rgb sensor
            this.getContainers().resetGroundDataFunction();
            // remove entities
            this.getEntityManager().clear();
            chain.next();
        };
        /**
         * load or reload this scene
         * @param forceLoadAssets
         */
        Scene.prototype.load = function (robotSetupData, forceLoadAssets) {
            var _this_1 = this;
            if (forceLoadAssets === void 0) { forceLoadAssets = false; }
            if (this.currentlyLoading) {
                console.warn('Already loading scene... !');
                return;
            }
            this.getRobotManager().configurationManager.setRobotConfigurations(robotSetupData.map(function (setup) { return setup.sensorConfiguration; }));
            this.getProgramManager().setPrograms(robotSetupData.map(function (setup) { return setup.program; }));
            // stop the simulation
            this.pauseSim();
            this.debug.clearDebugGuiDynamic(); // if dynamic debug gui exist, clear it
            this.currentlyLoading = true; // this flag will start loading animation update
            this.hasFinishedLoading = false;
            // hide rendering containers
            this.getContainers().setVisibility(false);
            // build new async chain
            this.loadingChain = new AsyncChain_1.AsyncChain();
            // 1. stop simulation
            this.loadingChain.push(this.simTicker.generateAsyncStopListener());
            // 2. if initialized, unload + deinit
            if (this.hasBeenInitialized) {
                // unload old things
                this.loadingChain.push({ func: this.unload, thisContext: this }, // unload scene (pixi/robots/matterjs)
                { func: this.onDeInit, thisContext: this }, // deinit scene
                { func: function (chain) { _this_1.hasBeenInitialized = false; chain.next(); }, thisContext: this });
            }
            // 3. unload and/or reload assets
            if (!this.resourcesLoaded || forceLoadAssets) {
                if (this.resourcesLoaded) {
                    // unload resources
                    this.loadingChain.push({ func: this.onUnloadAssets, thisContext: this }, // unload user assets
                    { func: function (chain) { _this_1.resourcesLoaded = false; chain.next(); }, thisContext: this });
                }
                // load resources
                this.loadingChain.push({ func: this.onLoadAssets, thisContext: this }, // load user assets
                // set resource loaded flag
                { func: function (chain) { _this_1.resourcesLoaded = true; chain.next(); }, thisContext: this });
            }
            // 4. init scene and finish loading
            this.loadingChain.push({ func: function (chain) { _this_1._unit = _this_1.getUnitConverter(); chain.next(); }, thisContext: this }, { func: this.onInit, thisContext: this }, // init scene
            // swap from loading to scene, remove loading animation, cleanup, ...
            { func: this.finishedLoading, thisContext: this });
            this.onChainCompleteListeners.forEach(function (listener) { return listener.call(_this_1, _this_1.loadingChain); });
            console.log('starting to load scene!');
            console.log('Loading stages: ' + this.loadingChain.length());
            // start time
            this.loadingStartTime = Date.now();
            this.loadingChain.next();
        };
        Scene.prototype.getEngine = function () {
            return this.engine;
        };
        Scene.prototype.getWorld = function () {
            return this.world;
        };
        /**
         * Sets the simulation DT in seconds (SI-Unit)
         * @param dt
         */
        Scene.prototype.setDT = function (dt) {
            this.dt = this.getUnitConverter().getTime(dt);
        };
        Scene.prototype.getDT = function () {
            return this.dt;
        };
        Scene.prototype.getAllPhysicsBodies = function () {
            return matter_js_1.Composite.allBodies(this.world);
        };
        /**
         * Returns all bodies containing the given point
         * @param position position to check for bodies
         * @param singleBody whether to return only one body
         */
        Scene.prototype.getBodiesAt = function (position, singleBody) {
            if (singleBody === void 0) { singleBody = false; }
            var intersected = [];
            var bodies = matter_js_1.Composite.allBodies(this.world);
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
        Scene.prototype.setSimTickerStopPollTime = function (pollTime) {
            this.simTicker.setTickerStopPollTime(pollTime);
        };
        Scene.prototype.startSim = function () {
            if (this.hasFinishedLoading) {
                this.simTicker.start();
                this.eventManager.onStartSimulationCallHandlers();
            }
            else {
                console.warn("'startSim()' is called during the loading process.");
            }
        };
        Scene.prototype.pauseSim = function () {
            this.simTicker.stop();
            this.eventManager.onPauseSimulationCallHandlers();
        };
        /**
         * Sets the sim sleep time in seconds.
         * @param simSleepTime
         */
        Scene.prototype.setSimSleepTime = function (simSleepTime) {
            this.simSleepTime = simSleepTime;
            this.simTicker.sleepTime = this.simSleepTime;
        };
        Scene.prototype.setSpeedUpFactor = function (speedup) {
            speedup = Math.round(speedup);
            if (speedup < 1) {
                console.error("Sim speed needs to be greater than 0!");
                return;
            }
            this.simSpeedupFactor = speedup;
        };
        Scene.prototype.getCurrentSimTickRate = function () {
            return Math.round(1000 / this.simTicker.lastDT) * this.simSpeedupFactor;
        };
        Scene.prototype.getRenderer = function () {
            return this.sceneRenderer;
        };
        Scene.prototype.setSceneRenderer = function (robotSetupData, sceneRenderer, noLoad) {
            if (noLoad === void 0) { noLoad = false; }
            if (sceneRenderer != this.sceneRenderer) {
                this.sceneRenderer = sceneRenderer;
                if (sceneRenderer) {
                    // this will remove all registered rendering containers
                    sceneRenderer.switchScene(robotSetupData, this);
                    // register rendering containers
                    this.getContainers().registerToEngine();
                }
            }
            if (sceneRenderer && !this.hasFinishedLoading && !noLoad) {
                this.load(robotSetupData, true); // force reload assets
            }
        };
        Scene.prototype.renderTick = function (dt) {
            // update rendering positions
            this.getEntityManager().updateDrawablePosition();
            // update sensor data overlay
            this.getRobotManager().updateSensorValueView();
            this.onRenderTick(dt);
        };
        //
        // #############################################################################
        //
        Scene.prototype.destroy = function () {
            this.simTicker.stop();
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
                            matter_js_1.World.remove(this.world, this.mouseConstraint);
                        }
                        this.mouseConstraint = matter_js_1.Constraint.create({
                            bodyA: body,
                            pointA: Util_1.Util.vectorSub(mousePosition, body.position),
                            pointB: mousePosition
                        });
                        // attach constraint
                        matter_js_1.World.add(this.world, this.mouseConstraint);
                    }
                    break;
                case ScrollView_1.EventType.RELEASE:
                    // remove constrain
                    if (this.mouseConstraint) {
                        matter_js_1.World.remove(this.world, this.mouseConstraint);
                        this.mouseConstraint = undefined;
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
        /**
         * update physics and robots
         */
        Scene.prototype.update = function () {
            this.onUpdatePrePhysics();
            // update physics
            matter_js_1.Engine.update(this.engine, this.dt);
            // update entities e.g. robots
            this.getEntityManager().update();
            // TODO: Handle multiple robots and waypoints
            if (this.robotManager.getNumberOfRobots() >= 1) {
                this.waypointsManager.update(this.robotManager.getRobots()[0].body.position);
            }
            this.getProgramManager().update(); // update breakpoints, ...
            // FIX Grid bucket memory consumption
            // Remove empty buckets
            var grid = this.engine.broadphase;
            grid.bucketHeight = 10000;
            grid.bucketWidth = 10000;
            var anyGrid = grid;
            for (var key in anyGrid.buckets) {
                if (anyGrid.buckets[key].length == 0) {
                    delete anyGrid.buckets[key];
                }
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
                element: htmlCanvas ? htmlCanvas : undefined,
                engine: this.engine,
                options: { wireframes: wireframes }
            });
            // scaling the context for close up rendering
            //this.debugRenderer.context.scale(10, 10)
            matter_js_1.Render.run(this.debugRenderer);
            // TODO: Remove this if since there is an implementation in 'interactionEvent'?
            if (enableMouse && htmlCanvas) {
                var mouse = matter_js_1.Mouse.create(htmlCanvas); // call before scene switch
                // TODO: different mouse constarains?
                var mouseConstraint = matter_js_1.MouseConstraint.create(this.engine, {
                    mouse: mouse
                });
                matter_js_1.World.add(this.world, mouseConstraint);
            }
        };
        //
        // User defined functions
        //
        /**
         * Loading of a scene:
         *
         * if this is a reset: call deInit
         * (scene has to be initialized)
         *
         * Do after full reset or first time load:
         * ---> loading animation
         *  1. Load resources for internal things
         *  2. call onLoad
         *
         * Do after position/scene reset:
         * ---> loading animation
         *
         *  3. Init internal things
         *      - score screen
         *      - ???
         *  4. call onInit
         *
         * ---> remove/disable loading animation
         */
        /**
         * unload all assets
         */
        Scene.prototype.onUnloadAssets = function (chain) {
            console.log('on asset unload');
            chain.next();
        };
        /**
         * load all textures/resources and call chain.next() when done
         * please do not block within this method and use the PIXI.Loader callbacks
         */
        Scene.prototype.onLoadAssets = function (chain) {
            console.log('on asset load');
            chain.next();
        };
        /**
         * Returns the unit converter which is used for this scene
         */
        Scene.prototype.getUnitConverter = function () {
            return new Unit_1.Unit({});
        };
        /**
         * called on scene switch
         *
         * create Robot, physics and other scene elements
         *
         * intit is included in the loading process
         */
        Scene.prototype.onInit = function (chain) {
            // create dynamic debug gui
            this.initDynamicDebugGui();
            console.log('on init');
            chain.next();
        };
        /**
         * called on scene reset/unload
         */
        Scene.prototype.onDeInit = function (chain) {
            console.log('on deinit/unload');
            chain.next();
        };
        /**
         * called before updating physics and robots
         */
        Scene.prototype.onUpdatePrePhysics = function () {
        };
        /**
         * called after all physics updates
         * probably use onUpdate instead
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
