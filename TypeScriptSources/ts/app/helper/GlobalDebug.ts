import dat = require('dat.gui');

const HIDE_DATGUI = true

// Creating a GUI and a subfolder.
export const DebugGui = new dat.GUI({name: 'My GUI', autoPlace: !HIDE_DATGUI});
DebugGui.close()
DebugGui.domElement.parentElement!.style.zIndex = '1000000'