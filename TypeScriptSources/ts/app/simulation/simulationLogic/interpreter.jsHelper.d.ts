// workaround for importing "../../nepostackmachine/interpreter.jsHelper"

declare module "interpreter.jsHelper" {
	export const interpreterSimBreakEventHandlers: (() => void)[]
}