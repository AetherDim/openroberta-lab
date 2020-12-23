import './pixijs'
import * as $ from "jquery";
import { Robot } from './robot';
import { Displayable } from './displayable';
import { Engine, Mouse, World, Render, MouseConstraint, Bodies, Composite } from 'matter-js';
import { contains } from 'jquery';

export class Scene {

    robots: Robot[] = [];

    engine: Engine = Engine.create();

    debugRenderer: Render = null;

    private dt = 10;



    constructor()
    {
    }


    initMouse(mouse: Mouse) {
        // TODO
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
        Engine.update(this.engine, this.dt);

        var bodies = Composite.allBodies(this.engine.world);
        bodies.forEach(body => {
            if(body.displayable) {
                body.displayable.updateFromBody(body);
            }
        });

        
        var constraints = Composite.allConstraints(this.engine.world);
        constraints.forEach(constrait => {
            // TODO
        });
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

}