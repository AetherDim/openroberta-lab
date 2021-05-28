
export class EventHandlerList<ParameterTypes extends readonly unknown[] = []> {

	readonly eventHandlers: ((...arg: ParameterTypes) => void)[] = []

	constructor() {}

	pushEventHandler(eventHandler: (...arg: ParameterTypes) => void) {
		this.eventHandlers.push(eventHandler)
	}

	pushEventHandleList(eventHandlerList: EventHandlerList<ParameterTypes>) {
		eventHandlerList.eventHandlers.forEach(handler => {
			this.eventHandlers.push(handler)
		})
	}

	callHandlers(...arg: ParameterTypes) {
		this.eventHandlers.forEach((func) => func(...arg))
	}

	removeAllEventHandlers() {
		this.eventHandlers.length = 0
	}

}