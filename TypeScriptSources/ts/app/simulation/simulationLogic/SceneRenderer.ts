import './pixijs'
import * as $ from "jquery";
import { Mouse, Vector } from 'matter-js'
import { Scene } from './Scene';
import { rgbToNumber } from './Color'
import { ScrollView } from './ScrollView';



// physics and graphics
export class SceneRender {
    
    readonly app: PIXI.Application; // "window"

    private scene: Scene;   // scene with physics and components
    scrollView: ScrollView;
    

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
        this.scrollView = new ScrollView(this.app.stage, this.app.renderer);

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


    switchScene(scene: Scene) {
        if(!scene) {
            scene = new Scene();
        }

        if(this.scene == scene) {
            return;
        }

        // remove all children from PIXI renderer
        if(this.scrollView.children.length > 0) {
            this.scrollView.removeChildren(0, this.scrollView.children.length-1);
        }
        // reset rendering scale and offset
        //this.setRenderingScaleAndOffset(1, Vector.create(0, 0))

        this.scene = scene

        //scene.initMouse(this.mouse);
        scene.setSimulationEngine(this);
        
        // TODO

    }

    addDiplayable(displayable: PIXI.DisplayObject) {
        this.scrollView.addChild(displayable);
    }

    removeDisplayable(displayable: PIXI.DisplayObject) {
        this.scrollView.removeChild(displayable);
    }

}