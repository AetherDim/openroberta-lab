import dat = require('dat.gui');

export const DEBUG = true
export const SEND_LOG = false
/**
 * Used in 'wrap.js' to print the error before it is wrapped
 */
export const PRINT_NON_WRAPPED_ERROR = true

// Creating a GUI and a subfolder.
export let DebugGui: dat.GUI|undefined;

clearDebugGui()

export function clearDebugGui() {
	if(DEBUG) {
		if(DebugGui) {
			DebugGui.destroy()
		}
		DebugGui = new dat.GUI({name: 'Debug', autoPlace: DEBUG})
		const parent = DebugGui.domElement.parentElement
		if (parent && DEBUG) {
			parent.style.zIndex = '1000000'
		}
	}
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





declare module 'dat.gui' {

	export interface GUI {

		addButton(name: string, callback: () => void)

	}

}

dat.GUI.prototype.addButton = function (name: string, callback: () => void) {
	const func = {}
	func[name] = callback
	this.add(func, name)
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