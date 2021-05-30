declare const Blockly

export const interpreterSimBreakEventHandlers: (() => void)[] = []

//This file contains function which allow the interpreter to communicate with the simulation.
export function getBlockById(id) {
	const ws = Blockly.getMainWorkspace();
	if(ws) {
		return ws.getBlockById(id);
	} else {
		return null;
	}
}
export function setSimBreak() {
	interpreterSimBreakEventHandlers.forEach(handler => handler())
}
export function getJqueryObject(object) {
	return $(object);
}