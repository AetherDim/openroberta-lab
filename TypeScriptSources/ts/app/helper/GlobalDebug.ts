import dat = require('dat.gui');
import { Scene } from './Scene/Scene';
import { Timer } from './Timer';

export const DEBUG = true
/**
 * Used in log.js
 */
export const SEND_LOG = false
/**
 * Used in 'wrap.js' to print the error before it is wrapped
 */
export const PRINT_NON_WRAPPED_ERROR = true



// Debug GUI Root

/**
 * Root debug view.
 */
export let DebugGuiRoot: dat.GUI|undefined;

export function clearDebugGuiRoot() {
	if(DebugGuiRoot) {
		DebugGuiRoot.destroy()
		DebugGuiRoot = undefined

		createDebugGuiRoot()
	}
}

export function createDebugGuiRoot() {
	if(DEBUG && !DebugGuiRoot) {
		DebugGuiRoot = new dat.GUI({name: 'Debug', autoPlace: DEBUG})
		const parent = DebugGuiRoot.domElement.parentElement
		if (parent) {
			// move debug gui up to be visible
			parent.style.zIndex = '1000000'
		}
	}
}

createDebugGuiRoot()





export class SceneDebug {

	readonly scene: Scene
	readonly disabled: boolean

	/**
	 * Static debug gui. Only valid while scene is active/selected.
	 * This debug gui is managed by the renderer.
	 */
	debugGuiStatic?: dat.GUI;

	/**
	 * Dynamic debug gui. Only valid while scene is running.
	 * Will be cleared with scene reset.
	 */
	debugGuiDynamic?: dat.GUI;


	updateTimer?: Timer

	constructor(scene: Scene, disabled: boolean) {
		this.disabled = disabled
		this.scene = scene
		this.createDebugGuiStatic()

		if(DEBUG && !disabled) {
			this.updateTimer = new Timer(0.5, () => this.debugGuiStatic?.updateDisplay())
			this.updateTimer.start()
		}
	}


	clearDebugGuiDynamic() {
		if(this.debugGuiDynamic) {
			this.deleteDebugGuiDynamic()
			this.createDebugGuiDynamic()
		}
	}
	
	createDebugGuiDynamic() {
		if(DEBUG && !this.disabled && this.debugGuiStatic && !this.debugGuiDynamic) {
			this.debugGuiDynamic = this.debugGuiStatic.addFolder('"Runtime" Debugging')
		}
	}
	
	deleteDebugGuiDynamic() {
		if(this.debugGuiDynamic) {
			this.debugGuiStatic?.removeFolder(this.debugGuiDynamic)
			this.debugGuiDynamic.destroy()
			this.debugGuiDynamic = undefined
		}
	}
	
	
	
	clearDebugGuiStatic() {
		if(this.debugGuiStatic) {
			const dynamic = this.debugGuiDynamic !== undefined
		
			this.deleteDebugGuiStatic()
			this.createDebugGuiStatic()
	
			if(dynamic) {
				this.createDebugGuiDynamic()
			}
		}
	}
	
	createDebugGuiStatic() {
		if(DEBUG && !this.disabled && DebugGuiRoot && !this.debugGuiStatic) {
			this.debugGuiStatic = DebugGuiRoot.addFolder(this.scene.getName())
		}
	}
	
	deleteDebugGuiStatic() {
		if(this.debugGuiStatic) {
			DebugGuiRoot?.removeFolder(this.debugGuiStatic)
			this.debugGuiStatic.destroy()
			this.debugGuiStatic = undefined
			this.debugGuiDynamic = undefined
		}
	}


	destroy() {
		// this will also destroy the runtime gui
		this.deleteDebugGuiStatic()
	}


}




/**
 * Dat GUI modifications
 */
declare module 'dat.gui' {

	export interface GUI {

		addButton(name: string, callback: () => void) : dat.GUIController
		addUpdatable(name: string, callback: () => Object) : dat.GUIController

	}

}

dat.GUI.prototype.addButton = function (name: string, callback: () => void) : dat.GUIController {
	const func = {}
	func[name] = callback
	return this.add(func, name)
}

dat.GUI.prototype.addUpdatable = function (name: string, callback: () => Object) : dat.GUIController {
	const func = {}
	func[name] = callback()
	const gui = this.add(func, name)
	gui.getValue = function () {
		return callback()
	}

	return gui
}

export function downloadFile(filename: string, data: BlobPart[], options?: BlobPropertyBag) {
	const blob = new Blob(data, options);
	const link = document.createElement('a');
	link.href = window.URL.createObjectURL(blob);
	link.download = filename;
	link.click();
}

export function downloadJSONFile(filename: string, data: any, prettify: boolean = true) {
	downloadFile(filename, [JSON.stringify(data, undefined, prettify ? "\t" : undefined)])
}

const addFolderFunc = dat.GUI.prototype.addFolder

function addFolderToGUI(gui: dat.GUI, name: string, i: number): dat.GUI {
	const newName = name + ' ' + i
	if(gui.__folders[newName]) {
		return addFolderToGUI(gui, name, i+1)
	} else {
		return addFolderFunc.apply(gui, [newName])
	}
}

dat.GUI.prototype.addFolder = function (name: string): dat.GUI {
	if(this.__folders[name]) {
		return addFolderToGUI(this, name, 1)
	}
	return addFolderFunc.apply(this, [name])
}