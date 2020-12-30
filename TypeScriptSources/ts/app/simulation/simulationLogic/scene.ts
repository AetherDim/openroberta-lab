import './pixijs'
import { Robot } from './robot';
import { createDisplayableFromBody, Displayable } from './displayable';
import { Engine, Mouse, World, Render, MouseConstraint, Bodies, Composite, Vector, Events, Body, Constraint, IEventComposite } from 'matter-js';
import { ElectricMotor } from './electricMotor';
import { SceneRender } from './renderer';
import { Timer } from './timer';

export class Scene {

    /**
     * All robots within the scene
     */
    readonly robots: Array<Robot> = new Array<Robot>();


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

    protected setupContainers() {
        this.groundContainer.zIndex = this.groundContainerZ;
        this.groundAnimationContainer.zIndex = this.groundAnimationContainerZ;
        this.entityBottomContainer.zIndex = this.entityBottomContainerZ;
        this.entityContainer.zIndex = this.entityContainerZ;
        this.entityTopContainer.zIndex = this.entityTopContainerZ;
        this.topContainer.zIndex = this.topContainerZ;
    }

    protected registerContainersToEngine() {
        this.sceneRenderer.addDiplayable(this.groundContainer);
        this.sceneRenderer.addDiplayable(this.groundAnimationContainer);
        this.sceneRenderer.addDiplayable(this.entityBottomContainer);
        this.sceneRenderer.addDiplayable(this.entityContainer);
        this.sceneRenderer.addDiplayable(this.entityTopContainer);
        this.sceneRenderer.addDiplayable(this.topContainer);
    }

    //
    // #############################################################################
    //

    readonly loadingContainer = new PIXI.Container();
    readonly loadingContainerZ = 50;
    protected loadingText: PIXI.DisplayObject = null;
    protected loadingAnimation: PIXI.DisplayObject = null;
    
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

    private updateLoadingAnimation(dt) {
        this.loadingText.x = this.sceneRenderer.getWidth() * 0.1;
        this.loadingText.y = this.sceneRenderer.getHeight() * 0.45;

        this.loadingAnimation.x = this.sceneRenderer.getWidth() * 0.7;
        this.loadingAnimation.y = this.sceneRenderer.getHeight() * 0.5;
        this.loadingAnimation.rotation += 0.05*dt;
    }

    /**
     * contains all currently registered displayebles
     * scene will destroy them all if destroy() is called
     * if a displayable is removed, it shall be destroyed
     */
    private readonly displayables: Array<Displayable> = new Array<Displayable>();

    /**
     * contains all currently registered displayebles for debugging
     * scene will destroy them all if destroy() is called
     * if a displayable is removed, it shall be destroyed
     */
    private readonly debugDisplayables: Array<Displayable> = new Array<Displayable>();

    /**
     * Physics engine used by the scene
     */
    readonly engine: Engine = Engine.create();

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



    /**
     * Debug renderer used by the scene for all registered physics object
     */
    private debugRenderer: Render = null;

    /**
     * current delta time for the physics simulation
     */
    private dt = 0.016;

    /**
     * whether to create debug displayables to show all physics objects
     */
    private debugPixiRendering = false;


    // TODO: remove
    private mouseConstraint: MouseConstraint = null;

    
    /**
     * current rendering instance
     */
    private sceneRenderer: SceneRender = null;

    setSimulationEngine(sceneRenderer: SceneRender = null) {
        if(sceneRenderer) {
            if(sceneRenderer != this.sceneRenderer) {
                
                if(this.hasFinishedLoading) {
                    this.onDeInit();
                }

                this.sceneRenderer = sceneRenderer; // code order!!!
                
                sceneRenderer.switchScene(this); // this will remove all registered rendering containers

                if(!this.startedLoading) {
                    this.startLoading();
                }

                // add rendering containers from this scene
                if(this.hasFinishedLoading) {
                    this.onInit();
                } else {
                    this.needsInit = true;
                }

            }
        } else {
            if(this.hasFinishedLoading) {
                this.onDeInit();
            }
            this.sceneRenderer = null;
        }
    }



    private hasFinishedLoading = false;
    private startedLoading = false;
    private needsInit = false;

    finishedLoading() {
        this.hasFinishedLoading = true;
        this.startedLoading = true; // for savety

        this.sceneRenderer.removeDisplayable(this.loadingContainer);
        this.registerContainersToEngine(); // register rendering containers

        if(this.needsInit) {
            this.onInit();
            this.needsInit = false;
        }
        
    }

    startLoading() {
        if(!this.startedLoading && !this.hasFinishedLoading) {
            this.startedLoading = true;
            this.sceneRenderer.addDiplayable(this.loadingContainer);
            this.onFirstLoad();
        }
    }


    constructor() {
        // register events
        const _this = this;
        Events.on(this.engine.world, "beforeAdd", (e: IEventComposite<Composite>) => {
            _this.addPhysics(e.object);
        });

        Events.on(this.engine.world, "afterRemove", (e: IEventComposite<Composite>) => {
            _this.removePhysics(e.object);
        });
        this.setupContainers();

        this.simTicker = new Timer(this.simSleepTime, (delta) => {
            // delta is the time from last call
            _this.update();
        });

        this.initLoadingContainer();
    }

    setPrograms(programs: any[]) {
        if(programs.length < this.robots.length) {
            console.error("not enough programs!");
            return;
        }
        for (let i = 0; i < this.robots.length; i++) {
            this.robots[i].setProgram(programs[i], []); // TODO: breakpoints
        }
    }


    // TODO:
    initMouse(mouse: Mouse) {
        if(this.mouseConstraint) {
            // ugly workaround for missing MouseConstraint in remove ...
            World.remove(this.engine.world, <Constraint><any>this.mouseConstraint);
        }
        // TODO: different mouse constarains?
        this.mouseConstraint = MouseConstraint.create(this.engine, {
            mouse: mouse
        });
        World.add(this.engine.world, this.mouseConstraint);
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
    
                    if(body.displayable && !this.displayables.includes(body.displayable)) {
                        this.displayables.push(body.displayable);
                        this.entityContainer.addChild(body.displayable.displayObject);
                    }
                    
                    if(this.debugPixiRendering) {
    
                        if(!body.debugDisplayable) {
                            body.debugDisplayable = createDisplayableFromBody(body);
                        }
    
                        if(!this.debugDisplayables.includes(body.debugDisplayable)) {
                            this.debugDisplayables.push(body.debugDisplayable);
                            this.entityContainer.addChild(body.debugDisplayable.displayObject);
                        }
                        
                    }
                    break;
    
                case 'composite':
                    Composite.allBodies(<Composite>element).forEach((e) => {
                        this.addPhysics(e);
                    });
                    break;
    
                case "mouseConstraint":
                case 'constraint':
                    var constraint = <Constraint>element;
                    this.addPhysics(constraint.bodyA);
                    this.addPhysics(constraint.bodyB);
                    break;
            
                default:
                    console.error("unknown type: " + element.type);
                    break;
            }
    
        } else if(Array.isArray(obj)) {
            const array =  <Array<Body> | Array<Composite> | Array<Constraint>>obj;
            const _this = this;
            array.forEach(e => _this.addPhysics(e));
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
                    if(body.displayable && this.displayables.includes(body.displayable)) {
                        var idx = this.displayables.indexOf(body.displayable);
                        this.displayables.splice(idx);
                        this.entityContainer.removeChild(body.displayable.displayObject);
                    }
                    if(body.debugDisplayable && this.displayables.includes(body.debugDisplayable)) {
                        var idx = this.debugDisplayables.indexOf(body.debugDisplayable);
                        this.debugDisplayables.splice(idx);
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
                    var constraint = <Constraint>element;
                    this.removePhysics(constraint.bodyA);
                    this.removePhysics(constraint.bodyB);
                    break;
            
                default:
                    console.error("unknown type: " + element.type);
                    break;
            }
        } else if(Array.isArray(obj)) {
            const array =  <Array<Body> | Array<Composite> | Array<Constraint>>obj;
            const _this = this;
            array.forEach(e => _this.removePhysics(e));
        } else {
            console.error('unknown type: ' + obj);
        }

    }

    destroy() {
        this.onDestroy();
        // TODO
    }

    setDT(dt: number) {
        this.dt = dt;
    }

    renderTick(dt) {
        if(this.startedLoading && !this.hasFinishedLoading) {
            this.updateLoadingAnimation(dt);
        }
        this.onRenderTick(dt);
    }


    /**
     * update physics and robots
     */
    private update() {

        this.onUpdate();

        this.robots.forEach((robot) => robot.update(this.dt)); // update robots

        Engine.update(this.engine, this.dt); // update physics


        // update rendering positions
        // TODO: switch to scene internal drawable list? better performance???
        var bodies = Composite.allBodies(this.engine.world);
        bodies.forEach(body => {
            if(body.displayable) {
                body.displayable.updateFromBody(body);
            }
        });

        if(this.debugDisplayables) {
            bodies.forEach(body => {
                if(body.debugDisplayable) {
                    body.debugDisplayable.updateFromBody(body);
                }
            });
        }

        this.onUpdatePostPhysics();

    }
    

    // for debugging
    setupDebugRenderer(canvas: string | HTMLElement, wireframes: boolean=false, enableMouse: boolean=true) {

        if(this.debugRenderer) {
            console.error("Debug renderer already used!");
            return;
        }

        var htmlCanvas = null;

        if(canvas instanceof HTMLElement) {
            htmlCanvas = canvas;
        } else {
            htmlCanvas = document.getElementById(canvas);
        }

        this.debugRenderer = Render.create({
            element: htmlCanvas,
            engine: this.engine,
            options: {wireframes:wireframes}
        });
        // scaling the context for closeup rendering
        //this.debugRenderer.context.scale(10, 10)
        Render.run(this.debugRenderer);

        if(enableMouse) {
            var mouse = Mouse.create(htmlCanvas); // call before scene switch
            // TODO: different mouse constarains?
            var mouseConstraint = MouseConstraint.create(this.engine, {
                mouse: mouse
            });
            World.add(this.engine.world, mouseConstraint);
        }

    }

    testPhysics() {

        const scale = 1.0
        const robot = Robot.default(scale)
        this.robots.push(robot);
        
        const robotComposite = robot.physicsComposite

        World.add(this.engine.world, robotComposite);

        Composite.translate(robotComposite, Vector.create(70 * scale, 90 * scale))

    
        this.engine.world.gravity.y = 0.0;
    
    
        var body = robot.body;
    
        var keyDownList: Array<string> = []
    
        document.onkeydown = function (event) {
            if (!keyDownList.includes(event.key)) {
                keyDownList.push(event.key)
            }
        }
        document.onkeyup = function (event) {
            keyDownList = keyDownList.filter(key => key != event.key)
        }
    
        function updateKeysActions() {
    
            // $('#notConstantValue').html('');
            // $("#notConstantValue").append('<div><label>Test</label><span>' + keyDownList + '</span></div>');    
    
            var leftForce = 0
            var rightForce = 0
            const factor = keyDownList.includes("s") ? -1 : 1
            keyDownList.forEach(key => {
                switch (key) {
                    case 'w':
                        leftForce += 1
                        rightForce += 1
                        break
                    case 's':
                        leftForce += -1
                        rightForce += -1
                        break
                    case 'a':
                        leftForce += -1 * factor
                        rightForce += 1 * factor
                        break
                    case 'd':
                        leftForce += 1 * factor
                        rightForce += -1 * factor
                        break
                }
            })
    
            let vec = Vector.create(Math.cos(body.angle), Math.sin(body.angle))
            const force = Vector.mult(vec, 0.0001 * 1000 * 1000 * 1000 * 1000)
            let normalVec = Vector.mult(Vector.create(-vec.y, vec.x), 10)
    
            const forcePos = Vector.add(body.position, Vector.mult(vec, -40))
    
            
            const maxForce = 100*1000*1000
            robot.leftDrivingWheel.applyTorqueFromMotor(new ElectricMotor(2, maxForce), leftForce)
            robot.rightDrivingWheel.applyTorqueFromMotor(new ElectricMotor(2, maxForce), rightForce)

        }
    
    
        Events.on(this.engine, 'beforeUpdate', function () {
            updateKeysActions()
        });


        // TODO: remove
        var world = this.engine.world;
        World.add(world, [
            // blocks
            Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 }),
            Bodies.rectangle(400, 100, 60, 60, { frictionAir: 0.05 }),
            Bodies.rectangle(600, 100, 60, 60, { frictionAir: 0.1 }),
    
            // walls
            Bodies.rectangle(400, -25, 800, 50, { isStatic: true }),
            Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
            Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
            Bodies.rectangle(-25, 300, 50, 600, { isStatic: true })
        ]);
    }


    //
    // User defined functions
    //

    /**
     * load all textures and call finishedLoading() when done
     * please do not block within this method and use PIXI.Loader callbacks
     */
    onFirstLoad() {
        setTimeout(() => {
            this.finishedLoading(); // swap from loading to scene
        }, 2000);
    }

    /**
     * called on scene switch
     */
    onInit() {

    }

    /**
     * called on scene switch to null scene
     */
    onDeInit() {

    }

    /**
     * destroy this scene
     */
    onDestroy() {

    }

    /**
     * called before updating physics and robots
     */
    onUpdate() {

    }

    /**
     * called after all updates
     */
    onUpdatePostPhysics() {

    }

    /**
     * called once per frame
     */
    onRenderTick(dt) {

    }




}