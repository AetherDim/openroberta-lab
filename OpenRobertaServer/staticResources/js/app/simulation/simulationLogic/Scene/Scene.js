var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
define(["require", "exports", "../Displayable", "matter-js", "../Timer", "../ScrollView", "../ProgramManager", "../Geometry/Polygon", "../Robot/RobotUpdateOptions"], function (require, exports, Displayable_1, matter_js_1, Timer_1, ScrollView_1, ProgramManager_1, Polygon_1, RobotUpdateOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Scene = exports.AsyncChain = exports.AsyncListener = void 0;
    var AsyncListener = /** @class */ (function () {
        function AsyncListener(func, thisContext) {
            this.func = func;
            this.thisContext = thisContext;
        }
        return AsyncListener;
    }());
    exports.AsyncListener = AsyncListener;
    var AsyncChain = /** @class */ (function () {
        function AsyncChain() {
            var listeners = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                listeners[_i] = arguments[_i];
            }
            this.index = 0;
            this.listeners = listeners;
        }
        AsyncChain.prototype.push = function () {
            var _this_1 = this;
            var listeners = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                listeners[_i] = arguments[_i];
            }
            listeners.forEach(function (listener) {
                _this_1.listeners.push(listener);
            });
        };
        AsyncChain.prototype.next = function () {
            if (this.listeners.length <= this.index) {
                return;
            }
            var listener = this.listeners[this.index];
            this.index++;
            //console.log('Chain Index: ' + this.index);
            listener.func.call(listener.thisContext, this);
        };
        AsyncChain.prototype.hasFinished = function () {
            return this.listeners.length <= this.index;
        };
        AsyncChain.prototype.reset = function () {
            this.index = 0;
        };
        AsyncChain.prototype.length = function () {
            return this.listeners.length;
        };
        return AsyncChain;
    }());
    exports.AsyncChain = AsyncChain;
    var Scene = /** @class */ (function () {
        //
        // #############################################################################
        //
        function Scene() {
            /**
             * Represents the nuber of robots after this scene has been initialized.
             * The GUI needs this information before the scene has finished loading.
             * @protected
             */
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
            this.containerList = [
                this.groundContainer,
                this.groundAnimationContainer,
                this.entityBottomContainer,
                this.entityContainer,
                this.entityTopContainer,
                this.topContainer
            ];
            this.removeTexturesOnUnload = true;
            this.removeBaseTexturesOnUnload = true;
            //
            // #############################################################################
            //
            this.score = 0;
            //
            // #############################################################################
            //
            this.scoreContainer = new PIXI.Container();
            this.scoreContainerZ = 60;
            this.endScoreTime = Date.now();
            this.showScore = false;
            this.scoreText = new PIXI.Text("");
            //
            // #############################################################################
            //
            this.loadingContainer = new PIXI.Container();
            this.loadingContainerZ = 60;
            //
            // #############################################################################
            //
            this.currentlyLoading = false;
            this.resourcesLoaded = false;
            this.hasBeenInitialized = false;
            this.hasFinishedLoading = false;
            this.loadingStartTime = 0;
            this.minLoadTime = 500;
            //
            // #############################################################################
            //
            /**
             * Physics engine used by the scene
             */
            this.engine = matter_js_1.Engine.create();
            this.world = this.engine.world;
            /**
             * current delta time for the physics simulation
             */
            this.dt = 0.016;
            this.autostartSim = true;
            //
            // #############################################################################
            //
            /**
             * sleep time before calling update
             */
            this.simSleepTime = 1 / 60;
            /**
             * whether to create debug displayables to show all physics objects
             */
            this.debugPixiRendering = false;
            // setup graphic containers
            this.setupContainers();
            // setup container for loading animation
            this.initLoadingContainer();
            // register events
            var _this = this;
            matter_js_1.Events.on(this.world, "beforeAdd", function (e) {
                _this.addPhysics(e.object);
            });
            matter_js_1.Events.on(this.world, "afterRemove", function (e) {
                _this.removePhysics(e.object);
            });
            this.simTicker = new Timer_1.Timer(this.simSleepTime, function (delta) {
                // delta is the time from last render call
                _this.update();
            });
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
            if (!this.sceneRenderer) {
                console.warn('No renderer to register containers to!');
                return;
            }
            var renderer = this.sceneRenderer;
            this.containerList.forEach(function (container) {
                renderer.add(container);
            });
        };
        Scene.prototype.setContainerVisibility = function (visible) {
            this.containerList.forEach(function (container) {
                container.visible = visible;
            });
            this.scoreContainer.visible = visible;
        };
        Scene.prototype.clearContainer = function (container) {
            container.children.forEach(function (child) {
                child.destroy();
            });
            container.removeChildren(0, container.children.length);
            /*container.destroy({
                children: true,
                texture: this.removeTexturesOnUnload,
                baseTexture: this.removeBaseTexturesOnUnload
            });*/
        };
        Scene.prototype.clearAllContainers = function () {
            var _this_1 = this;
            this.containerList.forEach(function (container) {
                _this_1.clearContainer(container);
            });
        };
        Scene.prototype.setScore = function (score) {
            if (score) {
                this.score = score;
                this.updateScoreText();
            }
        };
        Scene.prototype.getScore = function () {
            return this.score;
        };
        /**
         * Async loading function for fonts and images
         * TODO: only start onLoad if this has succeeded
         */
        Scene.prototype.loadScoreAssets = function (chain) {
            chain.next();
        };
        Scene.prototype.unloadScoreAssets = function (chain) {
            chain.next();
        };
        Scene.prototype.initScoreContainer = function (chain) {
            this.scoreContainer.zIndex = this.scoreContainerZ;
            this.scoreText.style = new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 60,
                fill: 0x6e750e // olive
            });
            this.scoreContainer.addChild(this.scoreText);
            this.scoreContainer.x = 200;
            this.scoreContainer.y = 200;
            this.updateScoreText();
            chain.next();
        };
        Scene.prototype.updateScoreText = function () {
            this.scoreText.text = "Score: " + this.getScore();
        };
        Scene.prototype.updateScoreAnimation = function (dt) {
        };
        Scene.prototype.showScoreScreen = function (seconds) {
            var _a;
            this.endScoreTime = Date.now() + seconds * 1000;
            this.showScore = true;
            (_a = this.sceneRenderer) === null || _a === void 0 ? void 0 : _a.add(this.scoreContainer);
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
            if (!this.loadingText || !this.sceneRenderer || !this.loadingAnimation) {
                return;
            }
            // This calculations are relative to the viewport width and height and give an interesting bounce effect
            this.loadingText.x = this.sceneRenderer.getViewWidth() * 0.1 + this.sceneRenderer.getWidth() * 0.2;
            this.loadingText.y = this.sceneRenderer.getViewHeight() * 0.45 + this.sceneRenderer.getHeight() * 0.3;
            this.loadingAnimation.x = this.sceneRenderer.getViewWidth() * 0.7 + this.sceneRenderer.getWidth() * 0.3;
            this.loadingAnimation.y = this.sceneRenderer.getViewHeight() * 0.5 + this.sceneRenderer.getHeight() * 0.3;
            this.loadingAnimation.rotation += 0.05 * dt;
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
            this.currentlyLoading = false;
            this.hasFinishedLoading = true;
            this.hasBeenInitialized = true;
            // remove loading animation
            (_a = this.sceneRenderer) === null || _a === void 0 ? void 0 : _a.remove(this.loadingContainer);
            // make container visibility
            this.setContainerVisibility(true);
            // update image for rgb sensor
            this.updateImageDataFunction();
            if (this.autostartSim) {
                // auto start simulation
                this.startSim();
            }
            console.log('Finished loading!');
            chain.next(); // technically we don't need this
        };
        Scene.prototype.fullReset = function () {
            this.load(true);
        };
        Scene.prototype.reset = function () {
            this.load();
        };
        Scene.prototype.unload = function (chain) {
            // we could do this again if we need to
            if (this.simTicker.running) {
                console.warn('sim timer is still running!!!');
                this.simTicker.waitForStop();
            }
            // remove robots
            this.robots.splice(0, this.robots.length);
            // remove all physic bodies
            matter_js_1.Composite.clear(this.world, false, true);
            // remove all drawables from the containers
            this.clearAllContainers();
            chain.next();
        };
        /**
         * load or reload this scene
         * @param forceLoadAssets
         */
        Scene.prototype.load = function (forceLoadAssets) {
            var _this_1 = this;
            var _a;
            if (forceLoadAssets === void 0) { forceLoadAssets = false; }
            if (this.currentlyLoading) {
                console.warn('Already loading scene... !');
                return;
            }
            this.currentlyLoading = true; // this flag will start loading animation update
            this.hasFinishedLoading = false;
            // should not run while loading running
            this.stopSim();
            // hide rendering containers
            this.setContainerVisibility(false);
            // start loading animation
            (_a = this.sceneRenderer) === null || _a === void 0 ? void 0 : _a.addDisplayable(this.loadingContainer);
            // build new async chain
            this.loadingChain = new AsyncChain();
            if (this.hasBeenInitialized) {
                // unload old things
                this.loadingChain.push({ func: this.unload, thisContext: this }, // unload scene (pixi/robots/matterjs)
                { func: this.onDeInit, thisContext: this }, // deinit scene
                { func: function (chain) { _this_1.hasBeenInitialized = false; chain.next(); }, thisContext: this });
            }
            if (!this.resourcesLoaded || forceLoadAssets) {
                if (this.resourcesLoaded) {
                    // unload resources
                    this.loadingChain.push({ func: this.unloadScoreAssets, thisContext: this }, // unload score assets
                    { func: this.onUnloadAssets, thisContext: this }, // unload user assets
                    { func: function (chain) { _this_1.resourcesLoaded = false; chain.next(); }, thisContext: this });
                }
                // load resources
                this.loadingChain.push({ func: this.loadScoreAssets, thisContext: this }, // load score assets for this scene
                { func: this.onLoadAssets, thisContext: this }, // load user assets
                // set resource loaded flag
                { func: function (chain) { _this_1.resourcesLoaded = true; chain.next(); }, thisContext: this });
            }
            // finish loading
            this.loadingChain.push({ func: this.initScoreContainer, thisContext: this }, // init score container
            { func: this.onInit, thisContext: this }, // init scene
            // swap from loading to scene, remove loading animation, cleanup, ...
            { func: this.finishedLoading, thisContext: this });
            console.log('starting to load scene!');
            console.log('Loading stages: ' + this.loadingChain.length());
            // start time
            this.loadingStartTime = Date.now();
            this.loadingChain.next();
        };
        Scene.prototype.updateImageDataFunction = function () {
            var _a;
            var canvas = (_a = this.getRenderer()) === null || _a === void 0 ? void 0 : _a.getCanvasFromDisplayObject(this.groundContainer);
            var renderingContext = canvas === null || canvas === void 0 ? void 0 : canvas.getContext("2d");
            var bounds = this.groundContainer.getBounds();
            if (renderingContext) {
                var scaleX = 1 / this.groundContainer.parent.scale.x;
                var scaleY = 1 / this.groundContainer.parent.scale.y;
                bounds.x *= scaleX;
                bounds.y *= scaleY;
                bounds.width *= scaleX;
                bounds.height *= scaleY;
                this.getImageData = function (x, y, w, h) { return renderingContext.getImageData(x - bounds.x, y - bounds.y, w, h); };
            }
        };
        Scene.prototype.getEngine = function () {
            return this.engine;
        };
        Scene.prototype.getWorld = function () {
            return this.world;
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
        Scene.prototype.setSceneRenderer = function (sceneRenderer, noLoad) {
            if (noLoad === void 0) { noLoad = false; }
            if (sceneRenderer != this.sceneRenderer) {
                this.sceneRenderer = sceneRenderer;
                if (sceneRenderer) {
                    sceneRenderer.switchScene(this); // this will remove all registered rendering containers
                    this.registerContainersToEngine(); // register rendering containers
                }
            }
            if (sceneRenderer && !this.hasFinishedLoading && !noLoad) {
                this.load();
            }
        };
        Scene.prototype.renderTick = function (dt) {
            var _a;
            if (this.currentlyLoading) {
                this.updateLoadingAnimation(dt);
            }
            if (this.showScore) {
                this.updateScoreAnimation(dt);
                if (Date.now() > this.endScoreTime) {
                    this.showScore = false;
                    (_a = this.sceneRenderer) === null || _a === void 0 ? void 0 : _a.remove(this.scoreContainer);
                }
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
                            matter_js_1.World.remove(this.world, this.mouseConstraint);
                        }
                        this.mouseConstraint = matter_js_1.Constraint.create({
                            bodyA: body,
                            pointA: matter_js_1.Vector.sub(mousePosition, body.position),
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
        //
        // #############################################################################
        //
        Scene.prototype.forEachBodyPartVertices = function (code) {
            var bodies = matter_js_1.Composite.allBodies(this.world);
            for (var i = 0; i < bodies.length; i++) {
                var body = bodies[i];
                // TODO: Use body.bounds for faster execution
                for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                    var part = body.parts[j];
                    code(part.vertices);
                }
            }
        };
        Scene.prototype.getNearestPoint = function (point, includePoint) {
            var nearestPoint;
            var minDistanceSquared = Infinity;
            this.forEachBodyPartVertices(function (vertices) {
                var nearestBodyPoint = new Polygon_1.Polygon(vertices).nearestPointToPoint(point, includePoint);
                if (nearestBodyPoint) {
                    var distanceSquared = matter_js_1.Vector.magnitudeSquared(matter_js_1.Vector.sub(point, nearestBodyPoint));
                    if (distanceSquared < minDistanceSquared) {
                        minDistanceSquared = distanceSquared;
                        nearestPoint = nearestBodyPoint;
                    }
                }
            });
            return nearestPoint;
        };
        Scene.prototype.intersectionPointsWithLine = function (line) {
            var result = [];
            this.forEachBodyPartVertices(function (vertices) {
                var e_1, _a;
                var newIntersectionPoints = new Polygon_1.Polygon(vertices).intersectionPointsWithLine(line);
                try {
                    for (var newIntersectionPoints_1 = __values(newIntersectionPoints), newIntersectionPoints_1_1 = newIntersectionPoints_1.next(); !newIntersectionPoints_1_1.done; newIntersectionPoints_1_1 = newIntersectionPoints_1.next()) {
                        var point = newIntersectionPoints_1_1.value;
                        result.push(point);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (newIntersectionPoints_1_1 && !newIntersectionPoints_1_1.done && (_a = newIntersectionPoints_1.return)) _a.call(newIntersectionPoints_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            });
            return result;
        };
        //
        // #############################################################################
        //
        /**
         * update physics and robots
         */
        Scene.prototype.update = function () {
            var _this_1 = this;
            this.onUpdate();
            // update robots
            // update ground every tick: this.updateColorDataFunction()
            var _this = this;
            // FIXME: What to do with undefined 'getImageData'?
            var getImageData = this.getImageData;
            var allBodies = matter_js_1.Composite.allBodies(this.engine.world);
            if (getImageData) {
                this.robots.forEach(function (robot) {
                    robot.update(new RobotUpdateOptions_1.RobotUpdateOptions({
                        dt: _this_1.dt,
                        programPaused: _this_1.programManager.isProgramPaused(),
                        getImageData: getImageData,
                        getNearestPointTo: function (point, includePoint) { return _this.getNearestPoint(point, includePoint); },
                        intersectionPointsWithLine: function (line) { return _this.intersectionPointsWithLine(line); },
                        bodyIntersectsOther: function (body) { return matter_js_1.Query.collides(body, allBodies).length > 1; } // "collides with itself"
                    }));
                });
            }
            this.programManager.update(); // update breakpoints, ...
            matter_js_1.Engine.update(this.engine, this.dt); // update physics
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
            // update rendering positions
            // TODO: switch to scene internal drawable list? better performance???
            var bodies = matter_js_1.Composite.allBodies(this.world);
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
         * called on scene switch
         *
         * create Robot, physics and other scene elements
         *
         * intit is included in the loading process
         */
        Scene.prototype.onInit = function (chain) {
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
         * destroy this scene
         * destroy all loaded textures
         */
        Scene.prototype.onDestroy = function () {
            console.log('on destroy');
        };
        /**
         * called before updating physics and robots
         */
        Scene.prototype.onUpdate = function () {
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
