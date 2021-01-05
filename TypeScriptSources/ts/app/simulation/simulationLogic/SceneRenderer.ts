import './pixijs'
import * as $ from "jquery";
import { Mouse, Vector } from 'matter-js'
import { Scene } from './Scene/Scene';
import { rgbToNumber } from './Color'
import { ScrollView, ScrollViewEvent } from './ScrollView';
import { debug } from 'console';



// physics and graphics
export class SceneRender {
    
    readonly app: PIXI.Application; // "window"

    private scene: Scene;   // scene with physics and components
    readonly scrollView: ScrollView;
    

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

        // add mouse/touch control
        this.scrollView = new ScrollView(this.app.stage, this.app.renderer);
        this.scrollView.registerListener((ev: ScrollViewEvent) => {
            if(this.scene) {
                this.scene.interactionEvent(ev);
            } 
        });

        // switch to scene
        if(scene) {
            this.switchScene(scene);
        } else {
            this.switchScene(new Scene()); // empty scene as default (call after Engine.create() and renderer init !!!)
        }

        this.app.ticker.add(dt => {
            if(this.scene) {
                this.scene.renderTick(dt);
                this.app.queueResize(); // allow auto resize
            }
        }, this);

    }

    getScene() {
        return this.scene;
    }

    // TODO: check this size
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
        this.scrollView.reset();

        this.scene = scene

        scene.setSimulationEngine(this);

    }


    // TODO: remove before add? only add once?

    addDisplayable(displayable: PIXI.DisplayObject) {
        this.scrollView.addChild(displayable);
    }

    removeDisplayable(displayable: PIXI.DisplayObject) {
        this.scrollView.removeChild(displayable);
    }

    add(displayable: PIXI.DisplayObject) {
        this.scrollView.addChild(displayable);
    }

    remove(displayable: PIXI.DisplayObject) {
        this.scrollView.removeChild(displayable);
    }

}