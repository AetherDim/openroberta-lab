import { Body } from "matter-js";


export class TouchSensor {

    private isTouched = false

    physicsBody: Body

    constructor(physicsBody: Body) {
        this.physicsBody = physicsBody
    }

    onTouchChanged: (isTouched: boolean) => void = function() {}

    getIsTouched(): boolean {
        return this.isTouched
    }

    setIsTouched(isTouched: boolean) {
        if (this.isTouched != isTouched) {
            this.onTouchChanged(isTouched)
        }
        this.isTouched = isTouched
    }

}