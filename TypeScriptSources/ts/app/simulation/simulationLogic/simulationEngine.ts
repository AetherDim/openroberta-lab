import './pixijs'
import * as $ from "jquery";
import { World, Engine, Mouse, MouseConstraint, Render, Bodies } from 'matter-js'
import { Scene } from './scene';
import { Timer } from './timer';
import { Entity, PhysicsEntity } from './entities';
import { html } from 'd3';


// https://stackoverflow.com/questions/13070054/convert-rgb-strings-to-hex-in-javascript
function rgbToNumber(rgb:string): number {
    var raw = rgb.split("(")[1].split(")")[0];
    var numbers = raw.split(',');
    var hexnumber = '0x' + parseInt(numbers[0]).toString(16) + parseInt(numbers[1]).toString(16) + parseInt(numbers[2]).toString(16);
    return parseInt(hexnumber, 16);
}

// physics and graphics
export class SimulationEngine {
    
    app: PIXI.Application; // "window"

    simTicker: Timer; // simulation ticker/timer

    scene: Scene;   // scene with physics and components

    engine: Engine; // physics engine
    mouse: Mouse;
    debugRenderer: Render = null;

    private dt = 10;
    private simSleepTime = 1/60;

    debugRendererUsed = false;
    

    constructor(canvas: HTMLCanvasElement | string, useDebugRenderer: boolean = false, wireframes: boolean = false) {

        var htmlCanvas = null;

        const backgroundColor = $('#simDiv').css('background-color');

        this.engine = Engine.create(); // seems not to be deprecated ...

        if(useDebugRenderer) {

            if(canvas instanceof HTMLElement) {
                htmlCanvas = canvas;
            } else {
                htmlCanvas = document.getElementById(canvas);
            }

           this.setupDebugRenderer(htmlCanvas, wireframes, false);

        } else {

            if(canvas instanceof HTMLCanvasElement) {
                htmlCanvas = canvas;
            } else {
                htmlCanvas = <HTMLCanvasElement> document.getElementById(canvas);
            }

            // The application will create a renderer using WebGL, if possible,
            // with a fallback to a canvas render. It will also setup the ticker
            // and the root stage PIXI.Container
            this.app = new PIXI.Application({view: htmlCanvas, backgroundColor: rgbToNumber(backgroundColor)});
        }

        // add mouse control
        this.mouse = Mouse.create(htmlCanvas); // call before scene switch

        this.switchScene(new Scene()); // empty scene as default (call after Engine.create() and renderer init !!!)

        

        const _this = this;
        this.simTicker = new Timer(this.simSleepTime, (delta) => {
            // delta is the time from last call
            _this.simulate();
        });


    }


    setupDebugRenderer(canvas: string | HTMLElement, wireframes: boolean=false, enableMouse: boolean=true) {

        if(this.debugRenderer) {
            console.log("Debug renderer already used!");
            //return;
        }

        this.debugRendererUsed = true;

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
        // TODO: remove
        var world = this.engine.world;
        World.add(world, [
            // falling blocks
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



    startSim() {
        this.simTicker.start();
    }

    stopSim() {
        this.simTicker.stop();
    }

    setDT(dt: number) {
        this.dt = dt;
    }

    setSimSleepTime(simSleepTime: number) {
        this.simSleepTime = simSleepTime;
        this.simTicker.sleepTime = simSleepTime;
    }


    switchScene(scene: Scene) {
        this.scene = scene
        
        // TODO: add physics and normal entities
        if(this.app && this.app.stage.children.length > 0) {
            this.app.stage.removeChildren(0, this.app.stage.children.length-1);
        }

        // TODO: remove all listeners?
        // if(this.app) {
        //  this.app.stage.removeAllListeners();
        // }
        
        World.clear(this.engine.world, false);

        // TODO: different mouse constarains?
        var mouseConstraint = MouseConstraint.create(this.engine, {
            mouse: this.mouse
        });
        World.add(this.engine.world, mouseConstraint);

        // TODO: iterate over entities
        var entities: Entity[] = this.scene.getEntities();

        entities.forEach(entity => {
            if(entity instanceof PhysicsEntity) {
                World.add(this.engine.world, entity.physicsBody);
            }
            if(this.app && entity.displayObject) {
                this.app.stage.addChild(entity.displayObject);
            }
        });



    }

    private simulate() {
        if(this.scene) {
            this.scene.prePhysicsSim(); // simulate robots and other entities
            Engine.update(this.engine, this.dt);
            this.scene.postPhysicsSim(); // simulate robots and other entities
        }
    }

}