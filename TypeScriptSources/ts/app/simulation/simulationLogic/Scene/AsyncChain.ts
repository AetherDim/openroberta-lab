

export class AsyncListener {

    func: (chain: AsyncChain) => void;
    thisContext: any;

    constructor(func: (chain: AsyncChain) => void, thisContext: any) {
        this.func = func
        this.thisContext = thisContext
    }

}

export class AsyncChain {

    private readonly listeners: AsyncListener[];
    private index = 0;

    constructor(...listeners: AsyncListener[]) {
        this.listeners = listeners;
    }

    push(...listeners: AsyncListener[]) {
        listeners.forEach(listener => {
            this.listeners.push(listener);
        });
    }

    next() {
        if(this.listeners.length <= this.index) {
            return;
        }

        let listener = this.listeners[this.index];

        this.index ++;

        //console.log('Chain Index: ' + this.index);

        listener.func.call(listener.thisContext, this);
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

}