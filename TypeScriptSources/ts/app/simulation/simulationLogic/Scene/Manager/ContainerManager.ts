import { Util } from "../../Util";
import {Scene} from "../Scene";

export class ContainerManager {

	private readonly scene: Scene

	constructor(scene: Scene) {
		this.scene = scene
		// setup graphic containers
		this.setupContainers();
	}

	/**
	 * layer 0: ground
	 */
	readonly groundContainer = new PIXI.Container();
	/**
	 * z-index for PIXI, this will define the rendering layer
	 */
	readonly groundContainerZ = 0;

	/**
	 * layer 1: ground animation
	 */
	readonly groundAnimationContainer = new PIXI.Container()
	/**
	 * z-index for PIXI, this will define the rendering layer
	 */
	readonly groundAnimationContainerZ = 10;

	/**
	 * layer 2: entity bottom layer (shadows/effects/...)
	 */
	readonly entityBottomContainer = new PIXI.Container()
	/**
	 * z-index for PIXI, this will define the rendering layer
	 */
	readonly entityBottomContainerZ = 20;

	/**
	 * layer 3: physics/other things <- robots
	 */
	readonly entityContainer = new PIXI.Container()
	/**
	 * z-index for PIXI, this will define the rendering layer
	 */
	readonly entityContainerZ = 30;

	/**
	 * layer 4: for entity descriptions/effects
	 */
	readonly entityTopContainer = new PIXI.Container()
	/**
	 * z-index for PIXI, this will define the rendering layer
	 */
	readonly entityTopContainerZ = 40;

	/**
	 * layer 5: top/text/menus
	 */
	readonly topContainer = new PIXI.Container()
	readonly topContainerZ = 50;


	readonly containerList: PIXI.Container[] = [
		this.groundContainer,
		this.groundAnimationContainer,
		this.entityBottomContainer,
		this.entityContainer,
		this.entityTopContainer,
		this.topContainer
	];

	protected setupContainers() {
		this.groundContainer.zIndex = this.groundContainerZ;
		this.groundAnimationContainer.zIndex = this.groundAnimationContainerZ;
		this.entityBottomContainer.zIndex = this.entityBottomContainerZ;
		this.entityContainer.zIndex = this.entityContainerZ;
		this.entityTopContainer.zIndex = this.entityTopContainerZ;
		this.topContainer.zIndex = this.topContainerZ;
	}

	registerToEngine() {
		const renderer = this.scene.getRenderer()
		if (!renderer) {
			console.warn('No renderer to register containers to!');
			return
		}
		this.containerList.forEach(container => {
			renderer.add(container);
		});
	}

	setVisibility(visible: boolean) {
		this.containerList.forEach(container => {
			container.visible = visible;
		});
	}

	//protected removeTexturesOnUnload = true;
	//protected removeBaseTexturesOnUnload = true;

	private clearContainer(container: PIXI.Container) {
		// remove children from parent before destroy
		// see: https://github.com/pixijs/pixi.js/issues/2800
		// const children: PIXI.DisplayObject[] = []
		// for (const child of container.children) {
		// 	children.push(child)
		// }
		container.removeChildren();

		// FIXME: Should we destroy the children?
		// Note that e.g. scoreText has to be replaced since it might be destroyed

		// children.forEach(child => {
		// 	child.destroy();
		// });

		/*container.destroy({
			children: true,
			texture: this.removeTexturesOnUnload,
			baseTexture: this.removeBaseTexturesOnUnload
		});*/
	}


	private _initialGroundDataFunction(x: number, y: number, w: number, h: number): number[] {
		this.updateGroundImageDataFunction()
		return this.getGroundImageData(x, y, w, h) // very hacky
	}

	resetGroundDataFunction() {
		this.getGroundImageData = this._initialGroundDataFunction
	}

	private pixelData = new Uint8Array()
	_getPixelData(): Uint8Array {
		return this.pixelData
	}
	getGroundImageData: (x: number, y: number, w: number, h: number) => number[] = this._initialGroundDataFunction

	updateGroundImageDataFunction() {
		console.log('init color sensor texture')
		const groundVisible = this.groundContainer.visible
		this.groundContainer.visible = true // the container needs to be visible for this to work
	
		const bounds = this.groundContainer.getLocalBounds()
		const width = this.groundContainer.width
		const height = this.groundContainer.height
		const pixelData = this.scene.getRenderer()?.convertToPixels(this.groundContainer)
		if (pixelData != undefined) {
			this.pixelData = pixelData
			console.log("Ground container pixels checksum of " + this.scene.getName() + ": "+Util.checksumFNV32(pixelData))
			this.getGroundImageData = (x, y, w, h) => {
				const newX = x - bounds.x
				const newY = y - bounds.y
				const index = (Math.round(newX) + Math.round(newY) * Math.round(width)) * 4
				if (
					0 <= newX && newX <= width &&
					0 <= newY && newY <= height &&
					0 <= index && index + 3 < pixelData.length) {
					return [pixelData[index], pixelData[index+1], pixelData[index+2],pixelData[index+3]]
				} else {
					return [0, 0, 0, 0]
				}
			}
		}

		this.groundContainer.visible = groundVisible
	}

	/**
	 * CLear all containers
	 */
	clear() {
		this.containerList.forEach(container => {
			this.clearContainer(container);
		});
	}

}