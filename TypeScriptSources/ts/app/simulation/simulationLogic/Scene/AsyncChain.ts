/**
 * This is essentially an implementation of a simple promise.
 * TODO: switch to actual promises?
 */

type AsyncFunction = (chain: AsyncChain) => void

export class AsyncListener {

	func: AsyncFunction;
	thisContext: any;

	constructor(func: AsyncFunction, thisContext: any) {
		this.func = func
		this.thisContext = thisContext
	}

}

export class AsyncChain {

	private readonly listeners: AsyncListener[];
	private readonly listenerFunctions: AsyncFunction[];
	private index = 0;

	constructor(...listeners: AsyncListener[]) {
		this.listeners = listeners;
		this.listenerFunctions = [];
		this.listeners.forEach(listener => this.listenerFunctions.push(listener.func))
	}

	push(...listeners: AsyncListener[]) {
		listeners.forEach(listener => {
			this.listeners.push(listener);
			this.listenerFunctions.push(listener.func)
		});
	}

	next() {
		if(this.listeners.length <= this.index) {
			return;
		}

		let listener = this.listeners[this.index];

		this.index ++;

		//console.log('Chain Index: ' + this.index);

		//listener.func.call(listener.thisContext, this)
		setTimeout(() => listener.func.call(listener.thisContext, this), 0)
	}

	hasFinished() {
		return this.listeners.length <= this.index;
	}

	reset() {
		this.index = 0;
	}

	length() {
		return this.listeners.length;
	}

	addAtIndex(idx: number, ...listeners: AsyncListener[]) {
		if(idx >= 0) {
			listeners.forEach(listener => {
				this.listeners.splice(idx, 0, listener);
				this.listenerFunctions.splice(idx, 0, listener.func)
				idx ++;
			});
		}
	}

	addBefore(fnc: AsyncFunction, ...listeners: AsyncListener[]) {
		const idx = this.listenerFunctions.indexOf(fnc)
		this.addAtIndex(idx, ...listeners)
	}

	addAfter(fnc: AsyncFunction, ...listeners: AsyncListener[]) {
		const idx = this.listenerFunctions.lastIndexOf(fnc)
		if(idx >= 0) {
			this.addAtIndex(idx+1, ...listeners)
		}
	}

}