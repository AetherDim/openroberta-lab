import {AsyncChain, AsyncListener} from "./Scene/AsyncChain";


export class Timer {


	private tickerStopPollTime = 0.1

	running = false;
	sleepTime = 100;
	shallStop = false;
	lastCall: number = 0;
	callTime: number = 0;
	lastDT: number = 0

	userFunction: (dt: number) => void;

	private selfCallingFunc: () => void = () => {};

	constructor(sleepTime: number, userFunction: (dt: number) => void) {
		this.sleepTime = sleepTime;
		this.userFunction = userFunction;
	}

	setTickerStopPollTime(pollTime: number) {
		this.tickerStopPollTime = pollTime
	}

	start() {

		if(this.running) {
			return;
		}

		this.shallStop = false;
		this.running = true;

		const _this = this;
		this.selfCallingFunc = function() {
			if(_this.callUserFunction()) {
				setTimeout(_this.selfCallingFunc, _this.sleepTime*1000);
			} else {
				_this.running = false;
				console.log('Timer stopped!');
			}
		};

		this.lastCall = Date.now();
		this.selfCallingFunc();
	}

	stop() {
		this.shallStop = true;
	}

	generateAsyncStopListener(timeout: number = 1): AsyncListener {
		return {func: (chain: AsyncChain) => this.asyncStop(chain, timeout, Date.now()), thisContext: this}
	}

	private asyncStop(chain: AsyncChain, timeout: number = 0.2, startTime: number) {
		if(this.running) {
			this.stop()

			if(startTime + timeout*1000  < Date.now()) {
				console.warn("Unable to stop ticker!")
				chain.next()
			} else {
				setTimeout(() => this.asyncStop(chain, timeout, startTime), this.tickerStopPollTime*1000)
			}
		} else {
			chain.next()
		}
	}

	private callUserFunction(): boolean {
		const now = Date.now();
		this.lastDT = now - this.lastCall
		try {
			this.userFunction(this.lastDT);
		} catch (error) {
			console.trace(error);
		}

		// error check for too long function call
		const now2 = Date.now();

		this.callTime = now2 - now;
		this.lastCall = now2;
		return !this.shallStop;
	}


}