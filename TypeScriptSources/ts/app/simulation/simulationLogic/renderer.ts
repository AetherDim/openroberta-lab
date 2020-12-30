import './pixijs'
import * as $ from "jquery";
import { Mouse, Vector } from 'matter-js'
import { Scene } from './scene';
import { rgbToNumber } from './color'



// physics and graphics
export class SceneRender {
    
    readonly app: PIXI.Application; // "window"

    private scene: Scene;   // scene with physics and components
    private mouse: Mouse;
    

    constructor(canvas: HTMLCanvasElement | string, autoResizeTo: HTMLElement | string = null, scene: Scene=null) {

        var htmlCanvas = null;
        var resizeTo = null;

        const backgroundColor = $('#simDiv').css('background-color');

        if(canvas instanceof HTMLCanvasElement) {
            htmlCanvas = canvas;
        } else {
            htmlCanvas = <HTMLCanvasElement> document.getElementById(canvas);
        }

        if(autoResizeTo) {
            if(autoResizeTo instanceof HTMLElement) {
                resizeTo = autoResizeTo;
            } else {
                resizeTo = <HTMLElement> document.getElementById(autoResizeTo);
            }
        }

        // The application will create a renderer using WebGL, if possible,
        // with a fallback to a canvas render. It will also setup the ticker
        // and the root stage PIXI.Container
        this.app = new PIXI.Application(
            {
                view: htmlCanvas,
                backgroundColor: rgbToNumber(backgroundColor),
                antialias: true,
                resizeTo: resizeTo,
            }
        );

        // add mouse control
        this.mouse = Mouse.create(htmlCanvas); // call before scene switch

        // switch to scene
        if(scene) {
            this.switchScene(scene);
        } else {
            this.switchScene(new Scene()); // empty scene as default (call after Engine.create() and renderer init !!!)
        }

        const _this = this;
        this.app.ticker.add(dt => {
            if(_this.scene) {
                _this.scene.renderTick(dt);
                _this.app.queueResize(); // allow autoresize
            }
        });

    }

    setPrograms(programs: any[]) {
        this.scene.setPrograms(programs);
    }

    startSim() {
        this.scene.startSim();
    }

    stopSim() {
        this.scene.stopSim();
    }

    getScene() {
        return this.scene;
    }

    getWidth() {
        return this.app.view.width;
    }

    getHeight() {
        return this.app.view.height;
    }
    setRenderingScaleAndOffset(scale: number, offset: Vector) {
        this.app.stage.scale.x = scale
        this.app.stage.scale.y = scale
        this.app.stage.position.x = offset.x
        this.app.stage.position.y = offset.y

        this.mouse.scale.x = 1 / scale
        this.mouse.scale.y = 1 / scale
        this.mouse.offset.x = offset.x
        this.mouse.offset.y = offset.y
    }

    switchScene(scene: Scene) {
        if(!scene) {
            scene = new Scene();
        }

        if(this.scene == scene) {
            return;
        }

        // remove all children from PIXI renderer
        if(this.app.stage.children.length > 0) {
            this.app.stage.removeChildren(0, this.app.stage.children.length-1);
        }
        // reset rendering scale and offset
        this.setRenderingScaleAndOffset(1, Vector.create(0, 0))

        this.scene = scene

        scene.initMouse(this.mouse);
        scene.setSimulationEngine(this);
        
        // TODO

    }

    addDiplayable(displayable: PIXI.DisplayObject) {
        this.app.stage.addChild(displayable);
    }

    removeDisplayable(displayable: PIXI.DisplayObject) {
        this.app.stage.removeChild(displayable);
    }

}