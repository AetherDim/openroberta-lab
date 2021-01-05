import './pixijs'
import { Robot } from './Robot/Robot';
import { createDisplayableFromBody, createRect, Displayable } from './Displayable';
import { Engine, Mouse, World, Render, MouseConstraint, Bodies, Composite, Vector, Events, Body, Constraint, IEventComposite, Resolver, Sleeping, Bounds, Vertices, Composites } from 'matter-js';
import { ElectricMotor } from './Robot/ElectricMotor';
import { SceneRender } from './SceneRenderer';
import { Timer } from './Timer';
import { Unit } from './Unit'
import { Polygon } from './Geometry/Polygon';
import { EventType, ScrollViewEvent } from './ScrollView';
import { ProgramFlowManager } from './ProgramFlowManager';

export class Scene {

    /**
     * All programmable robots within the scene.
     * The program flow manager will use the robots internally.
     */
    readonly robots: Array<Robot> = new Array<Robot>();

    readonly programFlowManager = new ProgramFlowManager(this);


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

    updateDebugMode(debugMode: boolean) {
        this.programFlowManager.updateDebugMode(debugMode);
    }

    endDebugging() {
        this.programFlowManager.endDebugging();
    }

    interpreterAddEvent(mode: any) {
        this.programFlowManager.interpreterAddEvent(mode);
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

    setPrograms(programs: any[], refresh: boolean, robotType: string) {
        this.programFlowManager.setPrograms(programs);

        // the original simulation.js would replace all robots if refresh is true
        // we will only change the type (The robot should manage anything type related internally)
        if(refresh) {
            this.robots.forEach(robot => {
                robot.setRobotType(robotType);
            });
        }
    }


    interactionEvent(ev: ScrollViewEvent) {
        // TODO
        switch (ev.type) {
            case EventType.PRESS:
                // get bodies
                this.getBodiesAt(ev.data.getCurrentLocalPosition());

                // TODO: disable sleeping
                // attach constrain
            
                break;

            case EventType.RELEASE:
                // remove constrain
                break;

            case EventType.DRAG:
                // move constrain
                break;
        
            default:
                break;
        }
        

        this.onInteractionEvent(ev);
    }

    /**
     * Returns all bodies containing the given point
     * @param position position to check for bodies
     * @param singleBody whether to return only one body
     */
    getBodiesAt(position: PIXI.IPointData, singleBody:boolean = false): Body[] {
        let intersected:Body[] = []
        let bodies: Body[] = Composite.allBodies(this.engine.world);

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

        this.programFlowManager.update(); // update breakpoints, ...

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

        // use 0.001 for EV3
        const scale = 0.001;
        
        Unit.setUnitScaling({m: 1000})

        // (<any>Resolver)._restingThresh = 4 * scale;
        // (<any>Resolver)._restingThreshTangent = 6 * scale;
        // (<any>Sleeping)._motionWakeThreshold = 0.18 * scale;
        // (<any>Sleeping)._motionSleepThreshold = 0.08 * scale;
        // (<any>Constraint)._minLength = 0.000001 * scale;

        //this.sceneRenderer.setRenderingScaleAndOffset(1 / scale, Vector.create())
        
        const useEV3 = true
        const robot = useEV3 ? Robot.EV3() : Robot.default(scale)
        this.robots.push(robot);
        
        const robotComposite = robot.physicsComposite

        World.add(this.engine.world, robotComposite);

        Composite.translate(robotComposite, Unit.getPositionVec(100 * scale, 100 * scale))

        const polygon = new Polygon([
            Vector.create(0, 0),
            Vector.create(100, 0),
            Vector.create(100, 50),
            Vector.create(0, 100),
            Vector.create(50, 50)
        ].map(v => Unit.getPosition(Vector.mult(Vector.add(v, Vector.create(200, 200)), scale))))
    
        const polygonGraphics = new PIXI.Graphics()
        polygonGraphics.beginFill(0xFF0000)
        polygonGraphics.moveTo(polygon.vertices[0].x, polygon.vertices[0].y)
        polygon.vertices.forEach(v => polygonGraphics.lineTo(v.x, v.y))
        polygonGraphics.closePath()
        polygonGraphics.endFill()

        const mousePointGraphics = new PIXI.Graphics()
            .beginFill(0x00FF00)
            .drawRect(-5, -5, 10, 10)
            .endFill()

        const nearestPointGraphics = new PIXI.Graphics()
            .beginFill(0x0000FF)
            .drawRect(-5, -5, 10, 10)
            .endFill()


        const container = new PIXI.Container()
        container.addChild(polygonGraphics, mousePointGraphics, nearestPointGraphics)
        this.topContainer.addChild(container)

        this.sceneRenderer.scrollView.registerListener(event => {
            const mousePos = event.data.getCurrentLocalPosition()
            mousePointGraphics.position.set(mousePos.x, mousePos.y)
            const pos = polygon.nearestPointTo(Vector.create(mousePos.x, mousePos.y))
            nearestPointGraphics.position.set(pos.x, pos.y)
        })

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
    
            
            const maxTorque = Unit.getTorque(100*1000*1000 * Math.pow(scale, 3.5))
            const motor = useEV3 ? ElectricMotor.EV3() : new ElectricMotor(120, maxTorque)
            robot.leftDrivingWheel.applyTorqueFromMotor(motor, leftForce)
            robot.rightDrivingWheel.applyTorqueFromMotor(motor, rightForce)

        }
    
    
        Events.on(this.engine, 'beforeUpdate', function () {
            updateKeysActions()
        });


        // TODO: remove
        var world = this.engine.world;
        var bodies = [
            // blocks
            Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 }),
            Bodies.rectangle(400, 100, 60, 60, { frictionAir: 0.05 }),
            Bodies.rectangle(600, 100, 60, 60, { frictionAir: 0.1 }),
    
            // walls
            Bodies.rectangle(400, -25, 800, 50, { isStatic: true }),
            Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
            Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
            Bodies.rectangle(-25, 300, 50, 600, { isStatic: true })
        ]
        bodies.forEach(body => Body.scale(body, scale, scale, Vector.create()))

        bodies = [
            createRect(400*scale, -25*scale, 800*scale, 50*scale),
            createRect(400*scale, 600*scale, 800*scale, 50*scale),
            createRect(800*scale, 300*scale, 50*scale, 600*scale),
            createRect(-25*scale, 300*scale, 50*scale, 600*scale),
        ]
        bodies.forEach(body => Body.setStatic(body, true))
        World.add(world, bodies);

        const allBodies = Composite.allBodies(world)
        allBodies.forEach(body => body.slop *= scale)
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

    /**
     * called after a mouse/touch or scroll event
     * @param ev event data
     */
    onInteractionEvent(ev: ScrollViewEvent) {

    }




}