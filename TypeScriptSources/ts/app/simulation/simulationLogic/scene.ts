import './pixijs'
import * as $ from "jquery";
import "./util"
import * as matter from 'matter-js'

const Engine = matter.Engine;
const Render = matter.Render;
const World = matter.World;
const Bodies = matter.Bodies;


// https://stackoverflow.com/questions/13070054/convert-rgb-strings-to-hex-in-javascript
function rgbToNumber(rgb:string): number {
    var raw = rgb.split("(")[1].split(")")[0];
    var numbers = raw.split(',');
    var hexnumber = '0x' + parseInt(numbers[0]).toString(16) + parseInt(numbers[1]).toString(16) + parseInt(numbers[2]).toString(16);
    return parseInt(hexnumber, 16);
}



export class Scene {

    app: PIXI.Application;
    engine: matter.Engine;
    g: PIXI.Graphics;

    constructor(engine: matter.Engine)
    {
        this.engine = engine;
        $('#blockly').openRightView("sim", 0.5);
        // The application will create a canvas element for you that you
        // can then insert into the DOM
        const canvas = <HTMLCanvasElement> document.getElementById('sceneCanvas');


        const backgroundColor = $('#simDiv').css('background-color');

        // The application will create a renderer using WebGL, if possible,
        // with a fallback to a canvas render. It will also setup the ticker
        // and the root stage PIXI.Container
        this.app = new PIXI.Application({view: canvas, backgroundColor: rgbToNumber(backgroundColor)});
        this.app.ticker.add((delta) => {
            this.render(delta);
        });

        this.g = new PIXI.Graphics();
        this.app.stage.addChild(this.g);

        // add mouse control
        var mouse = matter.Mouse.create(canvas),
        mouseConstraint = matter.MouseConstraint.create(engine, {
            mouse: mouse
        });

        World.add(engine.world, mouseConstraint);

    }


    render(delta: number) {
        var bodies = matter.Composite.allBodies(this.engine.world);

        const g = this.g;

        g.clear();

        // set a fill and line style
        g.beginFill(0xFF3300);
        g.lineStyle(4, 0xffd900, 1);

        for (var i = 0; i < bodies.length; i += 1) {
            var vertices = bodies[i].vertices;
    
            g.moveTo(vertices[0].x, vertices[0].y);
    
            for (var j = 1; j < vertices.length; j += 1) {
                g.lineTo(vertices[j].x, vertices[j].y);
            }
    
            g.lineTo(vertices[0].x, vertices[0].y);
        }
        g.endFill();


    }

    

}