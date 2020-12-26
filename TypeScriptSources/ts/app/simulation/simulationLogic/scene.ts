import './pixijs'
import * as $ from "jquery";
import { Robot } from './robot';
import { createDisplayableFromBody, Displayable } from './displayable';
import { Engine, Mouse, World, Render, MouseConstraint, Bodies, Composite, Vector, Events, Body, Constraint, IEventComposite } from 'matter-js';
import { contains } from 'jquery';
import { ElectricMotor } from './electricMotor';
import { SimulationEngine } from './simulationEngine';

export class Scene {

    readonly robots: Array<Robot> = new Array<Robot>();
    readonly displayables: Array<Displayable> = new Array<Displayable>();
    readonly debugDisplayables: Array<Displayable> = new Array<Displayable>();

    readonly engine: Engine = Engine.create();

    private debugRenderer: Render = null;

    private dt = 0.016;

    private debugPixiRendering = true;

    private mouseConstraint: MouseConstraint = null;

    private onDisplayableAdd: (drawable: Displayable) => void = d => {};
    private onDisplayableRemove: (drawable: Displayable) => void = d => {};

    private simEngine: SimulationEngine = null;

    setSimulationEngine(simEngine: SimulationEngine = null) {
        if(simEngine) {
            if(simEngine != this.simEngine) {
                this.simEngine = simEngine;
                this.onDeInit();
                const _this = this;
                this.onDisplayableAdd = d => {
                    _this.simEngine.addDiplayable(d.displayObject);
                };
                this.onDisplayableRemove = d => {
                    _this.simEngine.removeDisplayable(d.displayObject);
                }
                simEngine.switchScene(this);
                this.onInit();
            }
        } else {
            this.simEngine = null;
            this.onDeInit();
            this.onDisplayableAdd = d => {};
            this.onDisplayableRemove = d => {}
        }
    }


    constructor() {
        const _this = this;
        Events.on(this.engine.world, "beforeAdd", (e: IEventComposite<Composite>) => {
            _this.addPhysics(e.object);
        });

        Events.on(this.engine.world, "afterRemove", (e: IEventComposite<Composite>) => {
            _this.removePhysics(e.object);
        });
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
                        this.onDisplayableAdd(body.displayable);
                    }
                    
                    if(this.debugPixiRendering) {
    
                        if(!body.debugDisplayable) {
                            body.debugDisplayable = createDisplayableFromBody(body);
                        }
    
                        if(!this.debugDisplayables.includes(body.debugDisplayable)) {
                            this.debugDisplayables.push(body.debugDisplayable);
                            this.onDisplayableAdd(body.debugDisplayable);
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
                        this.onDisplayableRemove(body.displayable);
                    }
                    if(body.debugDisplayable && this.displayables.includes(body.debugDisplayable)) {
                        var idx = this.debugDisplayables.indexOf(body.debugDisplayable);
                        this.debugDisplayables.splice(idx);
                        this.onDisplayableRemove(body.debugDisplayable);
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

    /**
     * called on scene switch
     */
    onInit() {

    }

    /**
     * called on scene switch
     */
    onDeInit() {

    }

    /**
     * destroy this scene
     */
    destroy() {

    }

    setDT(dt: number) {
        this.dt = dt;
    }


    // for physics tics
    update() {
        this.robots.forEach((robot) => robot.update(this.dt));

        Engine.update(this.engine, this.dt);


        // update rendering positions
        // TODO: switch to scene internal drawable list?
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

        const robot = new Robot()
        this.robots.push(robot);
        
        const robotComposite = robot.physicsComposite

        World.add(this.engine.world, robotComposite);

        Composite.translate(robotComposite, Vector.create(300, 400))

    
        this.engine.world.gravity.y = 0.0;
    
    
        var body = robot.body;
        const robotWheels = robot.physicsWheels
    
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
    
            
            const maxForce = 1000*1000*1000
            robot.wheels.rearLeft.applyTorqueFromMotor(new ElectricMotor(2, maxForce), leftForce)
            robot.wheels.rearRight.applyTorqueFromMotor(new ElectricMotor(2, maxForce), rightForce)

            //force = Vector.mult(vec, Vector.dot(force, vec))
            // Body.applyForce(robotWheels.rearLeft, robotWheels.rearLeft.position, Vector.mult(force, leftForce));
            // Body.applyForce(robotWheels.rearRight, robotWheels.rearRight.position, Vector.mult(force, rightForce));
        }
    
    
        Events.on(this.engine, 'beforeUpdate', function () {
            updateKeysActions()
            // let force = Vector.mult(Vector.sub(mouse.position, body.position), forceScale);
            // let vec = Vector.create(Math.cos(body.angle), Math.sin(body.angle))
            // force = Vector.mult(vec ,Vector.dot(force, vec))
            // Body.applyForce(body, body.position, force);
        });


        // TODO: remove
        var world = this.engine.world;
        World.add(world, [
            // blocks
            Bodies.rectangle(200, 100, 60, 60, { frictionAir: 0.001 }),
            Bodies.rectangle(400, 100, 60, 60, { frictionAir: 0.05 }),
            Bodies.rectangle(600, 100, 60, 60, { frictionAir: 0.1 }),
    
            // walls
            Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
            Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
            Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
            Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
        ]);
    }

}