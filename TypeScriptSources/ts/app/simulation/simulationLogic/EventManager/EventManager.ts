import { EventHandlerList } from "./EventHandlerList"


export type EventManagerI<T extends { [key in keyof T]: ParameterTypes<any> }> =
{
	readonly eventHandlerLists: EventHandlerLists<T>
	removeAllEventHandlers(): void
} & {
	// convert every property of EventHandlerList<U> to (...arg: U) => EventManagerI<T>
	readonly [key in keyof T]:
		T[key] extends ParameterTypes<infer U>
			? (eventHandler: (...arg: U) => void) => EventManagerI<T>
			: never
} & {
	// convert every property of EventHandlerList<U> to (...arg: U) => EventManagerI<T>
	readonly [Key in keyof T as `${Key & string}CallHandlers`]:
		T[Key] extends ParameterTypes<infer U>
			? (...arg: U) => void
			: never
}

export class ParameterTypes<T extends readonly unknown[]> {
	constructor(){}
	static readonly none = new ParameterTypes<[]>()
}

export type EventHandlerLists<T extends { [key in keyof T & string]: ParameterTypes<any> }> =
	{
		readonly [Key in keyof T]: T[Key] extends ParameterTypes<infer U> ? EventHandlerList<U> : never
	}

export class EventManager<T extends { [key in keyof T]: ParameterTypes<any> }> {

	readonly eventHandlerLists: EventHandlerLists<T> = {} as any

	private constructor() {}

	removeAllEventHandlers() {
		Object.keys(this.eventHandlerLists).forEach(key => {
			this.eventHandlerLists[key as keyof T].removeAllEventHandlers()
		})
	}

	static init<T extends { [key in keyof T]: ParameterTypes<any> }>(value: T): EventManagerI<T> {
		const eventManager = new EventManager<T>()
		
		// for each key of 'value' which has a 'EventHandlerList'
		Object.keys(value).forEach(key => {
			const valueKey = key as keyof T
			const handlerList = value[valueKey]
			if (handlerList instanceof ParameterTypes) {
				// add method which
				//  - takes an event handler
				//  - adds it to the appropriate list
				//  - returns the EventManager as EventManagerI
				(eventManager.eventHandlerLists as any)[valueKey] = new EventHandlerList() as any;
				(eventManager as any)[key + "CallHandlers"] = (...args: any) => {
					eventManager.eventHandlerLists[valueKey].callHandlers(...args)
				}
				(eventManager as any)[valueKey] = (eventHandler: any) => {
					eventManager.eventHandlerLists[valueKey].pushEventHandler(eventHandler);
					return eventManager
				}
			}
		})
		return eventManager as unknown as EventManagerI<T>
	}
}