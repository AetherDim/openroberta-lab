import dat = require('dat.gui');

export const DEBUG = true

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
	if(this.__folders[newName]) {
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