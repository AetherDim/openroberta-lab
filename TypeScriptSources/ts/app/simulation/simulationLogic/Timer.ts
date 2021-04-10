

export class Timer {

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

	start() {
		this.shallStop = false;

		if(this.running) {
			return;
		}

		this.running = true;

		const _this = this;
		this.selfCallingFunc = function(){
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

	waitForStop() {
		if(this.running) {
			stop();
			const _this = this;
			setTimeout(_this.waitForStop, 200)
		}
	}

	private callUserFunction(): boolean {
		var now = Date.now();
		this.lastDT = now - this.lastCall
		try {
			this.userFunction(this.lastDT);
		} catch (error) {
			console.trace(error);
		}

		// error check for too long function call
		var now2 = Date.now();

		this.callTime = now2 - now;
		this.lastCall = now2;
		return !this.shallStop;
	}


}