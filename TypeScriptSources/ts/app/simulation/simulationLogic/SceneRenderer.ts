import './pixijs'
import * as $ from "jquery";
import { Scene } from './Scene/Scene';
import { rgbToNumber } from './Color'
import { ScrollView, ScrollViewEvent } from './ScrollView';



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
                resolution: window.devicePixelRatio || 1,
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

    // TODO: check this size
    getViewWidth() {
        return this.scrollView.getBounds().width;
    }

    getViewHeight() {
        return this.scrollView.getBounds().height;
    }

    getCanvasFromDisplayObject(object: PIXI.DisplayObject | PIXI.RenderTexture): HTMLCanvasElement {
        return this.app.renderer.extract.canvas(object)
    }


    switchScene(scene?: Scene) {
        if(!scene) {
            console.log('undefined scene!')
            scene = new Scene();
        }

        if(this.scene == scene) {
            return;
        }

        this.scene?.setSceneRenderer(null); // unregister this renderer

        // remove all children from PIXI renderer
        if(this.scrollView.children.length > 0) {
            //console.log('Number of children: ' + this.scrollView.children.length);
            this.scrollView.removeChildren(0, this.scrollView.children.length);
        }

        // reset rendering scale and offset
        this.scrollView.reset();

        this.scene = scene

        scene.setSceneRenderer(this);

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