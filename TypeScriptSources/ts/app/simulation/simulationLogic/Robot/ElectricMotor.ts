import { Unit } from "../Unit"

export class ElectricMotor {

    readonly maxTorque: number
    readonly maxAngularVelocity: number

    constructor(maxRPM: number, maxTorque: number) {
        this.maxTorque = Unit.getTorque(maxTorque)
        this.maxAngularVelocity = Unit.getRPM(maxRPM) * Math.PI * 2 / 60
    }

    getMaxRPM(): number {
        return this.maxAngularVelocity / (Math.PI * 2)
    }

    getAbsTorqueForAngularVelocity(angularVelocity: number): number {
        const absAngularVelocity = Math.abs(angularVelocity)
        if (absAngularVelocity >= this.maxAngularVelocity) {
            return 0
        }
        return this.maxTorque * (1 - absAngularVelocity/this.maxAngularVelocity)
    }

    /**
     * A Lego EV3 motor.
     * 
     * The data was taken from a plot on https://www.philohome.com/motors/motorcomp.htm (EV3 Large).
     */
    static EV3() {
        return new ElectricMotor(170, 0.43 * 0.01)
    }
}