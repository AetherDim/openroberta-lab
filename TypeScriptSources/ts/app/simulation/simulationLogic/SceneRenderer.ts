import './pixijs'
import * as $ from "jquery";
import { Scene } from './Scene/Scene';
import { rgbToNumber } from './Color'
import { ScrollView, ScrollViewEvent } from './ScrollView';
import { Util } from './Util';
import { DebugGuiRoot, initGlobalSceneDebug } from './GlobalDebug';
import { RobotSetupData } from './Robot/RobotSetupData';


interface RendererPlugins {
	/** Support tabbing interactive elements. */
	accessibility?: PIXI.AccessibilityManager
	/** Batching of Sprite, Graphics and Mesh objects. */
	//batch?: PIXI.BatchRenderer	
	/** Extract image data from renderer. */
	extract?: PIXI.Extract
	/** Handles mouse, touch and pointer events. */
	interaction: PIXI.InteractionManager
	/** Renderer for ParticleContainer objects. */	
	particle: PIXI.ParticleRenderer
	/** Pre-render display objects. */
	prepare: PIXI.Prepare
	/** Renderer for TilingSprite objects. */
	tilingSprite: PIXI.TilingSpriteRenderer

	[key : string]: any
}

// physics and graphics
export class SceneRender {
	
	readonly app: PIXI.Application; // "window"

	/** scene with physics and components */
	private scene: Scene
	readonly scrollView: ScrollView;

	private readonly resizeTo: HTMLElement|null;

	private onSwitchSceneEventHandler: ((scene: Scene) => void)[] = []


	constructor(scene: Scene, canvas: HTMLCanvasElement | string, robotSetupData?: RobotSetupData[], autoResizeTo?: HTMLElement | string) {

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
				autoDensity: true,
				resolution: Util.getPixelRatio(),
				forceCanvas: true
			}
		);
		this.app.ticker.maxFPS = 30

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
		this.scene = scene
		this.switchScene(robotSetupData, scene);
		

		this.app.ticker.add(dt => {
			if(this.scene) {

				this.scene.renderTick(dt);

				if(this.resizeTo && (
					this.app.view.clientWidth != this.resizeTo.clientWidth ||
					this.app.view.clientHeight != this.resizeTo.clientHeight
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

		initGlobalSceneDebug(this)
	}

	private rendererPlugins(): RendererPlugins {
		return this.app.renderer.plugins
	}

	destroy() {
		this.app.stop()
		this.app.destroy()
		this.scene.destroy()
	}

	onSwitchScene(onSwitchSceneHandler: (scene: Scene) => void) {
		this.onSwitchSceneEventHandler.push(onSwitchSceneHandler)
	}

	private onResize(oldWidth: number, oldHeight: number) {
		this.scrollView.x += (this.app.renderer.screen.width-oldWidth) / 2 
		this.scrollView.y += (this.app.renderer.screen.height-oldHeight) / 2


		const zoomX = Math.max(this.app.renderer.screen.width, this.scrollView.minScreenSize.width)/Math.max(oldWidth, this.scrollView.minScreenSize.width)
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

	convertToPixels(object: PIXI.DisplayObject | PIXI.RenderTexture): Uint8Array {
		return this.rendererPlugins().extract!.pixels(object)
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

	switchScene(robotSetupData: RobotSetupData[], scene: Scene, noLoad: boolean = false) {

		if(this.scene == scene) {
			return;
		}

		this.scene.pauseSim();
		this.scene.setSceneRenderer(robotSetupData, undefined); // unregister this renderer

		// remove all children from PIXI renderer
		if(this.scrollView.children.length > 0) {
			//console.log('Number of children: ' + this.scrollView.children.length);
			this.scrollView.removeChildren(0, this.scrollView.children.length);
		}

		this.scene = scene;

		scene.setSceneRenderer(robotSetupData, this, noLoad);

		this.onSwitchSceneEventHandler.forEach(handler => handler(scene))
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
		this.scene.setSpeedUpFactor(speedup)
	}

}