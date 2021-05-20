import './pixijs'
import * as $ from "jquery";
import { Scene } from './Scene/Scene';
import { rgbToNumber } from './Color'
import { ScrollView, ScrollViewEvent } from './ScrollView';
import { Util } from './Util';
import { DebugGuiRoot, initGlobalSceneDebug } from './GlobalDebug';
import { RobotSetupData } from './Robot/RobotSetupData';



// physics and graphics
export class SceneRender {
	
	readonly app: PIXI.Application; // "window"

	private scene?: Scene;   // scene with physics and components
	readonly scrollView: ScrollView;

	readonly allowBlocklyAccess: boolean = false;

	private readonly resizeTo: HTMLElement|null;
	

	constructor(canvas: HTMLCanvasElement | string, allowBlocklyAccess: boolean, robotSetupData?: RobotSetupData[], autoResizeTo?: HTMLElement | string, scene?: Scene) {

		var htmlCanvas = null;
		var resizeTo = null;

		this.allowBlocklyAccess = allowBlocklyAccess;

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

		this.resizeTo = resizeTo;

		// The application will create a renderer using WebGL, if possible,
		// with a fallback to a canvas render. It will also setup the ticker
		// and the root stage PIXI.Container
		this.app = new PIXI.Application(
			{
				view: htmlCanvas,
				backgroundColor: rgbToNumber(backgroundColor),
				antialias: true,
				resizeTo: resizeTo || undefined,
				resolution: window.devicePixelRatio || 0.75, // same as ScrollView.getPixelRatio()
			}
		);

		// add mouse/touch control
		this.scrollView = new ScrollView(this.app.stage, this.app.renderer);
		this.scrollView.registerListener((ev: ScrollViewEvent) => {
			if(this.scene) {
				this.scene.interactionEvent(ev);
			} 
		});

		if(!robotSetupData) {
			robotSetupData = []
		}

		// switch to scene
		if(scene) {
			this.switchScene(robotSetupData, scene);
		} else {
			this.switchScene(robotSetupData, new Scene("")); // empty scene as default (call after Engine.create() and renderer init !!!)
		}

		this.app.ticker.add(dt => {
			if(this.scene) {

				this.scene.renderTick(dt);

				if(this.resizeTo && (
					this.app.view.clientWidth != Util.getPixelRatio()*this.resizeTo.clientWidth ||
					this.app.view.clientHeight != Util.getPixelRatio()*this.resizeTo.clientHeight
					)) {

					//resize = true
					const oldWidth = this.app.renderer.screen.width
					const oldHeight = this.app.renderer.screen.height
					//this.app.queueResize()
					this.app.resize()
					this.onResize(oldWidth, oldHeight)
				}

			}
		}, this);
		//this.app.ticker.maxFPS = 30

		initGlobalSceneDebug(this)
	}

	private onResize(oldWidth: number, oldHeight: number) {
		const pixelRatio = Util.getPixelRatio()
		this.scrollView.x += (this.app.renderer.screen.width-oldWidth) / 2 / pixelRatio
		this.scrollView.y += (this.app.renderer.screen.height-oldHeight) / 2 / pixelRatio


		const zoomX = Math.max(this.app.renderer.screen.width, this.scrollView.minScreenSize)/Math.max(oldWidth, this.scrollView.minScreenSize)
		//const zoomY = Math.max(this.app.renderer.screen.height, this.scrollView.minScreenSize)/Math.max(oldHeight, this.scrollView.minScreenSize)

		this.scrollView.zoomCenter(zoomX)

		
	}

	getScene(): Scene {
		return this.scene!!;
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

	zoomIn() {
		this.scrollView.zoomCenter(Math.sqrt(2))
	}

	zoomOut() {
		this.scrollView.zoomCenter(1/Math.sqrt(2))
	}

	zoomReset() {
		// the scene should never be undefined!
		const size = this.scene!.getSize()
		const origin = this.scene!.getOrigin()
		this.scrollView.resetCentered(origin.x, origin.y, size.width, size.height)
	}

	switchScene(robotSetupData: RobotSetupData[], scene?: Scene, noLoad: boolean = false) {
		if(!scene) {
			console.log('undefined scene!')
			scene = new Scene("");
		}

		if(this.scene == scene) {
			return;
		}

		if(this.scene) {
			this.scene.pauseSim();
			this.scene.setSceneRenderer(robotSetupData, undefined); // unregister this renderer
		}

		// remove all children from PIXI renderer
		if(this.scrollView.children.length > 0) {
			//console.log('Number of children: ' + this.scrollView.children.length);
			this.scrollView.removeChildren(0, this.scrollView.children.length);
		}

		this.scene = scene;

		scene.setSceneRenderer(robotSetupData, this, this.allowBlocklyAccess, noLoad);

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

	setSpeedUpFactor(speedup: number) {
		this.scene?.setSpeedUpFactor(speedup)
	}

}