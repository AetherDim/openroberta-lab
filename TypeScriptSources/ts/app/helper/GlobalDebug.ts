import dat = require('dat.gui');

const HIDE_DATGUI = false

// Creating a GUI and a subfolder.
export const DebugGui = new dat.GUI({name: 'My GUI', autoPlace: !HIDE_DATGUI});
DebugGui.close()
const parent = DebugGui.domElement.parentElement
if (parent) {
	parent.style.zIndex = '1000000'
}