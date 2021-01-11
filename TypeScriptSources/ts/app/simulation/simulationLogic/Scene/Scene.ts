import { Robot } from '../Robot/Robot';
import { createDisplayableFromBody } from '../Displayable';
import { Engine, Mouse, World, Render, MouseConstraint, Composite, Vector, Events, Body, Constraint, IEventComposite, Sleeping, Bounds, Vertices } from 'matter-js';
import { SceneRender } from '../SceneRenderer';
import { Timer } from '../Timer';
import { EventType, ScrollViewEvent } from '../ScrollView';
import { ProgramManager } from '../ProgramManager';
import { Polygon } from '../Geometry/Polygon';
import { LineBaseClass } from '../Geometry/LineBaseClass';
import { RobotUpdateOptions } from '../Robot/RobotUpdateOptions';
import {IEntity} from "../Entity";

export class AsyncListener {

    func: (chain: AsyncChain) => void;
    thisContext: any;

    constructor(func: (chain: AsyncChain) => void, thisContext: any) {
        this.func = func
        this.thisContext = thisContext
    }

}

export class AsyncChain {

    private readonly listeners: AsyncListener[];
    private index = 0; 

    constructor(...listeners: AsyncListener[]) {
        this.listeners = listeners;
    }

    push(...listeners: AsyncListener[]) {
        listeners.forEach(listener => {
            this.listeners.push(listener);
        });
    }

    next() {
        if(this.listeners.length <= this.index) {
            return;
        }

        let listener = this.listeners[this.index];

        this.index ++;

        //console.log('Chain Index: ' + this.index);

        listener.func.call(listener.thisContext, this);
    }

    hasFinished() {
        return this.listeners.length <= this.index;
    }

    reset() {
        this.index = 0;
    }

    length() {
        return this.listeners.length;
    }

}



export class Scene {


    /**
     * Represents the nuber of robots after this scene has been initialized.
     * The GUI needs this information before the scene has finished loading.
     * @protected
     */
    protected numberOfRobots = 1;

    /**
     * All programmable robots within the scene.
     * The program flow manager will use the robots internally.
     */
    readonly robots: Array<Robot> = new Array<Robot>();

    readonly programManager = new ProgramManager(this);

    getProgramManager(): ProgramManager {
        return this.programManager;
    }

    getRobots(): Robot[] {
        return this.robots;
    }

    getNumberOfRobots(): number {
        return this.numberOfRobots;
    }

    //
    // #############################################################################
    //

    readonly entities: Array<IEntity> = new Array<IEntity>();

    addEntities(...entities: IEntity[]) {
        entities.forEach(entity => this.addEntity(entity));
    }

    addEntity(entity: IEntity) {
        if(!this.entities.includes(entity)) {
            this.entities.push(entity);

            // register physics and graphics



        }
    }


    //
    // #############################################################################
    //

    /**
     * layer 0: ground
     */
    readonly groundContainer = new PIXI.Container();
    /**
     * z-index for PIXI, this will define the rendering layer
     */
    readonly groundContainerZ = 0;
    
    /**
     * layer 1: ground animation
     */
    readonly groundAnimationContainer = new PIXI.Container()
    /**
     * z-index for PIXI, this will define the rendering layer
     */
    readonly groundAnimationContainerZ = 10;
    
    /**
     * layer 2: entity bottom layer (shadorws/effects/...)
     */
    readonly entityBottomContainer = new PIXI.Container()
    /**
     * z-index for PIXI, this will define the rendering layer
     */
    readonly entityBottomContainerZ = 20;

    /**
     * layer 3: physics/other things <- robots
     */
    readonly entityContainer = new PIXI.Container()
    /**
     * z-index for PIXI, this will define the rendering layer
     */
    readonly entityContainerZ = 30;

    /**
     * layer 4: for entity descriptions/effects
     */
    readonly entityTopContainer = new PIXI.Container()
    /**
     * z-index for PIXI, this will define the rendering layer
     */
    readonly entityTopContainerZ = 40;
    
    /**
     * layer 5: top/text/menus
     */
    readonly topContainer = new PIXI.Container()
    readonly topContainerZ = 50;


    readonly containerList: PIXI.Container[] = [
      this.groundContainer,
      this.groundAnimationContainer,
      this.entityBottomContainer,
      this.entityContainer,
      this.entityTopContainer,
      this.topContainer
    ];

    protected setupContainers() {
        this.groundContainer.zIndex = this.groundContainerZ;
        this.groundAnimationContainer.zIndex = this.groundAnimationContainerZ;
        this.entityBottomContainer.zIndex = this.entityBottomContainerZ;
        this.entityContainer.zIndex = this.entityContainerZ;
        this.entityTopContainer.zIndex = this.entityTopContainerZ;
        this.topContainer.zIndex = this.topContainerZ;
    }

    protected registerContainersToEngine() {
        if (!this.sceneRenderer) {
            console.warn('No renderer to register containers to!');
            return
        }
        this.containerList.forEach(container => {
            this.sceneRenderer.add(container);
        });
    }

    protected setContainerVisibility(visible: boolean) {
        this.containerList.forEach(container => {
            container.visible = visible;
        });
        this.scoreContainer.visible = visible;
    }


    protected removeTexturesOnUnload = true;
    protected removeBaseTexturesOnUnload = true;

    private clearContainer(container: PIXI.Container) {
        container.children.forEach(child => {
            child.destroy();
        });

        container.removeChildren(0, container.children.length);

        /*container.destroy({
            children: true,
            texture: this.removeTexturesOnUnload,
            baseTexture: this.removeBaseTexturesOnUnload
        });*/
    }

    private clearAllContainers() {
        this.containerList.forEach(container => {
            this.clearContainer(container);
        });
    }

    //
    // #############################################################################
    //

    private score: number = 0;

    setScore(score: number) {
        if(score) {
            this.score = score;
            this.updateScoreText();
        }
    }

    getScore(): number {
        return this.score;
    }

    //
    // #############################################################################
    //

    readonly scoreContainer = new PIXI.Container();
    readonly scoreContainerZ = 60;

    protected endScoreTime: number = Date.now();
    protected showScore: boolean = false;

    protected scoreText = new PIXI.Text("");

    /**
     * Async loading function for fonts and images
     * TODO: only start onLoad if this has succeeded
     */
    protected loadScoreAssets(chain: AsyncChain) {
        chain.next();
    }

    protected unloadScoreAssets(chain: AsyncChain) {
        chain.next();
    }

    protected initScoreContainer(chain: AsyncChain) {
        this.scoreContainer.zIndex = this.scoreContainerZ;

        this.scoreText.style = new PIXI.TextStyle({
            fontFamily : 'Arial',
            fontSize: 60,
            fill : 0x6e750e // olive
        });

        this.scoreContainer.addChild(this.scoreText);

        this.scoreContainer.x = 200;
        this.scoreContainer.y = 200;

        this.updateScoreText();

        chain.next();
    }

    updateScoreText() {
        this.scoreText.text = "Score: " + this.getScore();
    }

    updateScoreAnimation(dt: number) {
        
    }

    showScoreScreen(seconds: number) {
        this.endScoreTime = Date.now() + seconds*1000;
        this.showScore = true;
        this.sceneRenderer?.add(this.scoreContainer);
    }


    //
    // #############################################################################
    //

    readonly loadingContainer = new PIXI.Container();
    readonly loadingContainerZ = 60;
    protected loadingText?: PIXI.DisplayObject;
    protected loadingAnimation?: PIXI.DisplayObject;
    
    protected initLoadingContainer() {
        this.loadingContainer.zIndex = this.loadingContainerZ;

        this.loadingText = new PIXI.Text("Loading ...",
        {
            fontFamily : 'Arial',
            fontSize: 60,
            fill : 0x000000
        });

        const container = new PIXI.Container();
        this.loadingAnimation = container;
        const ae = new PIXI.Text("æ",
        {
            fontFamily : 'Arial',
            fontSize: 100,
            fill : 0xfd7e14
        });

        // fix text center
        ae.x = -ae.width/2;
        ae.y = -ae.height/2;

        container.addChild(ae);

        this.loadingContainer.addChild(this.loadingText);
        this.loadingContainer.addChild(this.loadingAnimation);
    }

    private updateLoadingAnimation(dt: number) {
        if (!this.loadingText || !this.sceneRenderer || !this.loadingAnimation) {
            return
        }
        // This calculations are relative to the viewport width and height and give an interesting bounce effect
        this.loadingText.x = this.sceneRenderer.getViewWidth() * 0.1 + this.sceneRenderer.getWidth() * 0.2;
        this.loadingText.y = this.sceneRenderer.getViewHeight() * 0.45 + this.sceneRenderer.getHeight() * 0.3;

        this.loadingAnimation.x = this.sceneRenderer.getViewWidth() * 0.7 + this.sceneRenderer.getWidth() * 0.3;
        this.loadingAnimation.y = this.sceneRenderer.getViewHeight() * 0.5 + this.sceneRenderer.getHeight() * 0.3;
        this.loadingAnimation.rotation += 0.05*dt;
    }

    //
    // #############################################################################
    //

    private currentlyLoading = false;
    private resourcesLoaded = false;
    private hasBeenInitialized = false;
    private hasFinishedLoading = false;

    private loadingStartTime: number = 0;
    private minLoadTime = 500;

    private loadingChain?: AsyncChain;

    private finishedLoading(chain: AsyncChain) {

        // fake longer loading time for smooth animation
        var loadingTime = Date.now() - this.loadingStartTime;
        if(loadingTime < this.minLoadTime) {
            const _this = this;
            setTimeout(() => {
                this.finishedLoading(chain);
            }, this.minLoadTime-loadingTime);
            return;
        }

        this.currentlyLoading = false;
        this.hasFinishedLoading = true;
        this.hasBeenInitialized = true;

        // remove loading animation
        this.sceneRenderer?.remove(this.loadingContainer);

        // make container visibility
        this.setContainerVisibility(true);

        // update image for rgb sensor
        this.updateImageDataFunction();

        if(this.autostartSim) {
            // auto start simulation
            this.startSim();
        }

        console.log('Finished loading!');

        chain.next(); // technically we don't need this
    }

    fullReset() {
        this.load(true);
    }

    reset() {
        this.load();
    }

    private unload(chain: AsyncChain) {

        // we could do this again if we need to
        if(this.simTicker.running) {
            console.warn('sim timer is still running!!!');
            this.simTicker.waitForStop();
        }

        // remove robots
        this.robots.splice(0, this.robots.length);

        // remove all physic bodies
        Composite.clear(this.world, false, true);

        // remove all drawables from the containers
        this.clearAllContainers();

        chain.next();
    }

    /**
     * load or reload this scene
     * @param forceLoadAssets
     */
    load(forceLoadAssets: boolean = false) {
        if(this.currentlyLoading) {
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
        this.sceneRenderer?.addDisplayable(this.loadingContainer);


        // build new async chain
        this.loadingChain = new AsyncChain();


        if(this.hasBeenInitialized) {
            // unload old things
            this.loadingChain.push(
                {func: this.unload, thisContext: this}, // unload scene (pixi/robots/matterjs)
                {func: this.onDeInit, thisContext: this}, // deinit scene
                {func: chain => {this.hasBeenInitialized = false; chain.next()}, thisContext: this}, // reset flag
            );
        }

        if(!this.resourcesLoaded || forceLoadAssets) {

            if(this.resourcesLoaded) {
                // unload resources
                this.loadingChain.push(
                    {func: this.unloadScoreAssets, thisContext: this}, // unload score assets
                    {func: this.onUnloadAssets, thisContext: this}, // unload user assets
                    {func: chain => {this.resourcesLoaded = false; chain.next()}, thisContext: this}, // reset flag
                )
            }

            // load resources
            this.loadingChain.push(
                {func: this.loadScoreAssets, thisContext: this}, // load score assets for this scene
                {func: this.onLoadAssets, thisContext: this}, // load user assets
                // set resource loaded flag
                {func: chain => {this.resourcesLoaded = true; chain.next();}, thisContext: this},
            );
        }

        // finish loading
        this.loadingChain.push(
            {func: this.initScoreContainer, thisContext: this}, // init score container
            {func: this.onInit, thisContext: this}, // init scene
            // swap from loading to scene, remove loading animation, cleanup, ...
            {func: this.finishedLoading, thisContext: this},
        );

        console.log('starting to load scene!');
        console.log('Loading stages: ' + this.loadingChain.length());

        // start time
        this.loadingStartTime = Date.now();

        this.loadingChain.next();
    }

    //
    // #############################################################################
    //

    private getImageData?: (x: number, y: number, w: number, h: number) => ImageData

    private updateImageDataFunction() {
        const canvas = this.getRenderer()?.getCanvasFromDisplayObject(this.groundContainer)
        const renderingContext = canvas?.getContext("2d")
        const bounds = this.groundContainer.getBounds()
        if (renderingContext) {
            const scaleX = 1 / this.groundContainer.parent.scale.x
            const scaleY = 1 / this.groundContainer.parent.scale.y
            bounds.x *= scaleX
            bounds.y *= scaleY
            bounds.width *= scaleX
            bounds.height *= scaleY
            this.getImageData = (x, y, w, h) => renderingContext.getImageData(
                x - bounds.x,
                y - bounds.y, w, h)
        }
    }

    //
    // #############################################################################
    //

    /**
     * Physics engine used by the scene
     */
    readonly engine: Engine = Engine.create();
    readonly world: World = this.engine.world;

    getEngine(): Engine {
        return this.engine;
    }

    getWorld(): World {
        return this.world;
    }

    /**
     * current delta time for the physics simulation
     */
    private dt = 0.016;

    setDT(dt: number) {
        this.dt = dt;
    }

    autostartSim = true;

    //
    // #############################################################################
    //

    /**
     * sleep time before calling update
     */
    private simSleepTime = 1/60;

    /**
     * simulation ticker/timer
     */
    private readonly simTicker: Timer;

    startSim() {
        if(this.hasFinishedLoading) {
            this.simTicker.start();
        }
    }

    stopSim() {
        if(this.hasFinishedLoading) {
            this.simTicker.stop();
        }
    }

    setSimSleepTime(simSleepTime: number) {
        this.simSleepTime = simSleepTime;
        this.simTicker.sleepTime = simSleepTime;
    }

    //
    // #############################################################################
    //


    /**
     * Debug renderer used by the scene for all registered physics object
     */
    private debugRenderer?: Render;

    /**
     * whether to create debug displayables to show all physics objects
     */
    private debugPixiRendering = false;

    
    /**
     * current rendering instance
     */
    private sceneRenderer?: SceneRender;

    getRenderer(): SceneRender | undefined {
        return this.sceneRenderer;
    }

    setSceneRenderer(sceneRenderer?: SceneRender, noLoad: boolean = false) {

        if(sceneRenderer != this.sceneRenderer) {
            this.sceneRenderer = sceneRenderer;

            if(sceneRenderer) {
                sceneRenderer.switchScene(this); // this will remove all registered rendering containers

                this.registerContainersToEngine(); // register rendering containers
            }

        }

        if(sceneRenderer && !this.hasFinishedLoading && !noLoad) {
            this.load();
        }
    }

    renderTick(dt: number) {
        if(this.currentlyLoading) {
            this.updateLoadingAnimation(dt);
        }

        if(this.showScore) {
            this.updateScoreAnimation(dt);
            if(Date.now() > this.endScoreTime) {
                this.showScore = false;
                this.sceneRenderer?.remove(this.scoreContainer);
            }
        }

        this.onRenderTick(dt);
    }

    //
    // #############################################################################
    //


    constructor() {

        // setup graphic containers
        this.setupContainers();

        // setup container for loading animation
        this.initLoadingContainer();

        // register events
        const _this = this;
        Events.on(this.world, "beforeAdd", (e: IEventComposite<Composite>) => {
            _this.addPhysics(e.object);
        });

        Events.on(this.world, "afterRemove", (e: IEventComposite<Composite>) => {
            _this.removePhysics(e.object);
        });


        this.simTicker = new Timer(this.simSleepTime, (delta) => {
            // delta is the time from last render call
            _this.update();
        });
    }



    //
    // #############################################################################
    //

    private mouseConstraint?: Constraint

    interactionEvent(ev: ScrollViewEvent) {
        switch (ev.type) {
            case EventType.PRESS:
                // get bodies
                const mousePosition = ev.data.getCurrentLocalPosition()
                const bodies = this.getBodiesAt(mousePosition);
                if (bodies.length >= 1) {
                    const body = bodies[0]
                    ev.cancel()
                    Sleeping.set(body, false)
                    if (this.mouseConstraint) {
                        World.remove(this.world, this.mouseConstraint)
                    }
                    this.mouseConstraint = Constraint.create({
                        bodyA: body,
                        pointA: Vector.sub(mousePosition, body.position),
                        pointB: mousePosition
                    })
                    // attach constraint
                    World.add(this.world, this.mouseConstraint)
                }
                break;

            case EventType.RELEASE:
                // remove constrain
                if (this.mouseConstraint) {
                    World.remove(this.world, this.mouseConstraint)
                    this.mouseConstraint = undefined
                }
                break;

            case EventType.DRAG:
                // move constrain
                if (this.mouseConstraint) {
                    this.mouseConstraint.pointB = ev.data.getCurrentLocalPosition()
                    ev.cancel()
                }
                break;
        
            default:
                break;
        }
        

        this.onInteractionEvent(ev);
    }

    //
    // #############################################################################
    //

    /**
     * Returns all bodies containing the given point
     * @param position position to check for bodies
     * @param singleBody whether to return only one body
     */
    getBodiesAt(position: PIXI.IPointData, singleBody:boolean = false): Body[] {
        let intersected:Body[] = []
        let bodies: Body[] = Composite.allBodies(this.world);

        // code borrowed from Matterjs MouseConstraint
        for (let i = 0; i < bodies.length; i++) {
            let body = bodies[i];
            if (Bounds.contains(body.bounds, position) && body.enableMouseInteraction) {
                for (let j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                    let part = body.parts[j];
                    if (Vertices.contains(part.vertices, position)) {
                        intersected.push(body);

                        if(singleBody) {
                            return intersected;
                        }

                        break;
                    }
                }
            }
        }

        return intersected;
    }

    private addPhysics(obj: Body | Array<Body> | Composite | Array<Composite> | Constraint | Array<Constraint> | MouseConstraint) {

        if(!obj) {
            return;
        }

        const element  = <Body | Composite | Constraint><any>obj;

        if(element.type) {

            switch (element.type) {
                case 'body':
                    var body = <Body>element;
    
                    if(body.displayable) {
                        this.entityContainer.addChild(body.displayable.displayObject);
                    }
                    
                    if(this.debugPixiRendering) {
    
                        if(!body.debugDisplayable) {
                            body.debugDisplayable = createDisplayableFromBody(body);
                        }
                        
                        this.entityContainer.addChild(body.debugDisplayable.displayObject);
                        
                    }
                    break;
    
                case 'composite':
                    Composite.allBodies(<Composite>element).forEach((e) => {
                        this.addPhysics(e);
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
    
        } else if(Array.isArray(obj)) {
            const array =  <Array<Body> | Array<Composite> | Array<Constraint>>obj;
            const _this = this;
            array.forEach((e: Body | Composite | Constraint) => _this.addPhysics(e));
        } else {
            console.error('unknown type: ' + obj);
        }

        
    }

    private removePhysics(obj: Body | Array<Body> | Composite | Array<Composite> | Constraint | Array<Constraint> | MouseConstraint) {

        if(!obj) {
            return;
        }

        const element  = <Body | Composite | Constraint><any>obj;

        if(element.type) {
            switch (element.type) {
                case 'body':
                    var body = <Body>element;
                    if(body.displayable) {
                        this.entityContainer.removeChild(body.displayable.displayObject);
                    }
                    if(body.debugDisplayable) {
                        this.entityContainer.removeChild(body.debugDisplayable.displayObject);
                    }
                    break;

                case 'composite':
                    Composite.allBodies(<Composite>element).forEach((e) => {
                        this.removePhysics(e);
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
        } else if(Array.isArray(obj)) {
            const array =  <Array<Body> | Array<Composite> | Array<Constraint>>obj;
            const _this = this;
            array.forEach((e: Body | Composite | Constraint) => _this.removePhysics(e));
        } else {
            console.error('unknown type: ' + obj);
        }

    }

    //
    // #############################################################################
    //

    destroy() {
        this.onDestroy();
        // TODO
    }

    //
    // #############################################################################
    //


    private forEachBodyPartVertices(code: (vertices: Vector[]) => void) {
        const bodies: Body[] = Composite.allBodies(this.world)

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            // TODO: Use body.bounds for faster execution
            for (let j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                const part = body.parts[j];
                code(part.vertices)
            }
        }
    }

    private getNearestPoint(point: Vector, includePoint: (point: Vector) => boolean): Vector | undefined {
        let nearestPoint: Vector | undefined
        let minDistanceSquared = Infinity

        this.forEachBodyPartVertices(vertices => {
            const nearestBodyPoint = new Polygon(vertices).nearestPointToPoint(point, includePoint)
            if (nearestBodyPoint) {
                const distanceSquared = Vector.magnitudeSquared(Vector.sub(point, nearestBodyPoint))
                if (distanceSquared < minDistanceSquared) {
                    minDistanceSquared = distanceSquared
                    nearestPoint = nearestBodyPoint
                }
            }
        })

        return nearestPoint;
    }

    private intersectionPointsWithLine(line: LineBaseClass): Vector[] {
        const result: Vector[] = []
        this.forEachBodyPartVertices(vertices => {
            const newIntersectionPoints = new Polygon(vertices).intersectionPointsWithLine(line)
            for (const point of newIntersectionPoints) {
                result.push(point)
            }
        })
        return result
	}


    //
    // #############################################################################
    //


    /**
     * update physics and robots
     */
    private update() {

        this.onUpdate();

        // update robots
        // update ground every tick: this.updateColorDataFunction()
        const _this = this
        // FIXME: What to do with undefined 'getImageData'?
        const getImageData = this.getImageData
        if (getImageData) {
            this.robots.forEach(robot => {
                robot.update(new RobotUpdateOptions({
                    dt: this.dt,
                    programPaused: this.programManager.isProgramPaused(),
                    getImageData: getImageData,
                    getNearestPointTo: (point, includePoint) => _this.getNearestPoint(point, includePoint),
                    intersectionPointsWithLine: line => _this.intersectionPointsWithLine(line)
                }))
            })
        }

        this.programManager.update(); // update breakpoints, ...

        Engine.update(this.engine, this.dt); // update physics


        // FIX Grid bucket memory consumption
        // Remove empty buckets
        const grid = this.engine.broadphase
        grid.bucketHeight = 10000
        grid.bucketWidth = 10000
        const anyGrid = <any>grid
        for (const key in anyGrid.buckets) {
            if (anyGrid.buckets[key].length == 0) {
                delete anyGrid.buckets[key]
            }
        }

        // update rendering positions
        // TODO: switch to scene internal drawable list? better performance???
        var bodies = Composite.allBodies(this.world);
        bodies.forEach(body => {
            if(body.displayable) {
                body.displayable.updateFromBody(body);
            }
        });

        this.onUpdatePostPhysics();
    }
    

    // for debugging
    setupDebugRenderer(canvas: string | HTMLElement, wireframes: boolean=false, enableMouse: boolean=true) {

        if(this.debugRenderer) {
            console.error("Debug renderer already used!");
            return;
        }

        let htmlCanvas = null;

        if(canvas instanceof HTMLElement) {
            htmlCanvas = canvas;
        } else {
            htmlCanvas = document.getElementById(canvas);
        }

        this.debugRenderer = Render.create({
            element: htmlCanvas ? htmlCanvas : undefined,
            engine: this.engine,
            options: {wireframes:wireframes}
        });
        // scaling the context for close up rendering
        //this.debugRenderer.context.scale(10, 10)
        Render.run(this.debugRenderer);

        // TODO: Remove this if since there is an implementation in 'interactionEvent'?
        if(enableMouse && htmlCanvas) {
            var mouse = Mouse.create(htmlCanvas); // call before scene switch
            // TODO: different mouse constarains?
            var mouseConstraint = MouseConstraint.create(this.engine, {
                mouse: mouse
            });
            World.add(this.world, mouseConstraint);
        }

    }


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
    onUnloadAssets(chain: AsyncChain) {
        console.log('on asset unload');
        chain.next();
    }

    /**
     * load all textures/resources and call chain.next() when done
     * please do not block within this method and use the PIXI.Loader callbacks
     */
    onLoadAssets(chain: AsyncChain) {
        console.log('on asset load');
        chain.next();
    }

    /**
     * called on scene switch
     *
     * create Robot, physics and other scene elements
     *
     * intit is included in the loading process
     */
    onInit(chain: AsyncChain) {
        console.log('on init');
        chain.next();
    }

    /**
     * called on scene reset/unload
     */
    onDeInit(chain: AsyncChain) {
        console.log('on deinit/unload');
        chain.next();
    }

    /**
     * destroy this scene
     * destroy all loaded textures
     */
    onDestroy() {
        console.log('on destroy');
    }

    /**
     * called before updating physics and robots
     */
    onUpdate() {

    }

    /**
     * called after all physics updates
     * probably use onUpdate instead
     */
    onUpdatePostPhysics() {

    }

    /**
     * called once per frame
     */
    onRenderTick(dt: number) {

    }

    /**
     * called after a mouse/touch or scroll event
     * @param ev event data
     */
    onInteractionEvent(ev: ScrollViewEvent) {

    }




}