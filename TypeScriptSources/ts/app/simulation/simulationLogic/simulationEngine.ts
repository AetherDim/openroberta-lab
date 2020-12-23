import './pixijs'
import * as $ from "jquery";
import { World, Engine, Mouse, MouseConstraint, Render, Bodies } from 'matter-js'
import { Scene } from './scene';
import { Timer } from './timer';
import { html } from 'd3';
import { start } from 'repl';


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
    mouse: Mouse;

    debugRenderer: Render = null;

    
    private simSleepTime = 1/60;

    debugRendererUsed = false;
    

    constructor(canvas: HTMLCanvasElement | string, scene: Scene=null, startSim: boolean = false, disablePixiRenderer: boolean = false) {

        var htmlCanvas = null;

        const backgroundColor = $('#simDiv').css('background-color');

        if(canvas instanceof HTMLCanvasElement) {
            htmlCanvas = canvas;
        } else {
            htmlCanvas = <HTMLCanvasElement> document.getElementById(canvas);
        }

        // The application will create a renderer using WebGL, if possible,
        // with a fallback to a canvas render. It will also setup the ticker
        // and the root stage PIXI.Container
        if(!disablePixiRenderer) {
            this.app = new PIXI.Application({view: htmlCanvas, backgroundColor: rgbToNumber(backgroundColor)});
        }

        // add mouse control
        this.mouse = Mouse.create(htmlCanvas); // call before scene switch

        // switch to scene
        if(scene) {
            this.switchScene(scene);
        } else {
            this.switchScene(new Scene()); // empty scene as default (call after Engine.create() and renderer init !!!)
        }

        const _this = this;
        this.simTicker = new Timer(this.simSleepTime, (delta) => {
            // delta is the time from last call
            _this.simulate();
        });

        if(startSim) {
            this.startSim();
        }

    }

    setPrograms(programs: any[]) {
        this.scene.setPrograms(programs);
    }

    startSim() {
        this.simTicker.start();
    }

    stopSim() {
        this.simTicker.stop();
    }

    setSimSleepTime(simSleepTime: number) {
        this.simSleepTime = simSleepTime;
        this.simTicker.sleepTime = simSleepTime;
    }


    switchScene(scene: Scene) {
        this.scene = scene

        scene.initMouse(this.mouse);
        
        // TODO

    }

    private simulate() {
        if(this.scene) {
            this.scene.update();
        }
    }

}