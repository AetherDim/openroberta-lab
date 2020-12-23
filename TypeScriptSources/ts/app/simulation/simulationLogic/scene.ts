import './pixijs'
import * as $ from "jquery";
import { Robot } from './robot';
import { Displayable } from './displayable';
import { Engine, Mouse, World, Render, MouseConstraint, Bodies, Composite, Vector, Events, Body, Constraint, IEventComposite } from 'matter-js';
import { contains } from 'jquery';

export class Scene {

    readonly robots: Array<Robot> = new Array<Robot>();
    readonly displayables: Array<Displayable> = new Array<Displayable>();

    readonly engine: Engine = Engine.create();

    debugRenderer: Render = null;

    private dt = 10;



    constructor() {
        const _this = this;
        Events.on(this.engine.world, "afterAdd", (e: IEventComposite<Composite>) => {
            _this.addPhysics(e.object);
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
        // TODO: different mouse constarains?
        var mouseConstraint = MouseConstraint.create(this.engine, {
            mouse: mouse
        });
        World.add(this.engine.world, mouseConstraint);
    }

    addPhysics(element: Body | Composite | Constraint) {

        if(!element) {
            return;
        }


        switch (element.type) {
            case 'body':
                var body = <Body>element;
                if(body.displayable && !this.displayables.includes(body.displayable)) {
                    this.displayables.push(body.displayable);
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

        /*Üvar bodies = Composite.allBodies(this.engine.world);
        bodies.forEach(body => {
            if(body.displayable) {
                body.displayable.updateFromBody(body);
            }
        });

        
        var constraints = Composite.allConstraints(this.engine.world);
        constraints.forEach(constrait => {
            // TODO
        });*/
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
        const robotWheels = robot.wheels
    
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
            const force = Vector.mult(vec, 0.003)
            let normalVec = Vector.mult(Vector.create(-vec.y, vec.x), 10)
    
            const forcePos = Vector.add(body.position, Vector.mult(vec, -40))
    
            //force = Vector.mult(vec, Vector.dot(force, vec))
            // Body.applyForce(body, carWheels.rearLeft.position, Vector.mult(force, leftForce));
            // Body.applyForce(body, carWheels.rearRight.position, Vector.mult(force, rightForce));
            
            Body.applyForce(robotWheels.rearLeft, robotWheels.rearLeft.position, Vector.mult(force, leftForce));
            Body.applyForce(robotWheels.rearRight, robotWheels.rearRight.position, Vector.mult(force, rightForce));
    
            // Body.applyForce(body, Vector.sub(forcePos, normalVec), Vector.mult(force, leftForce));
            // Body.applyForce(body, Vector.add(forcePos, normalVec), Vector.mult(force, rightForce));
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