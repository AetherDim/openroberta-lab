import { Vector } from "matter-js"

/**
 * Converts SI units to the internal matter.js units and the other way.
 */
export class Unit {
    
    /**
     * meters factor from SI units to internal
     */
    private static m = 1
    /**
     * kilograms factor from SI units to internal
     */
    private static kg = 1
    /**
     * seconds factor from SI units to internal
     */
    private static s = 1

    /**
     * Set the unit scaling from SI units to internal matter.js units
     * 
     * @param options meter, kilogram and seconds. The default is 1.
     */
    static setUnitScaling(options: {m?: number, kg?: number, s?: number}) {
        Unit.m = options.m || 1
        Unit.kg = options.kg || 1
        Unit.s = options.kg || 1
    }


    static getLength(meter: number): number {
        return meter * Unit.m
    }

    static getLengths(meters: number[]): number[] {
        return meters.map(Unit.getLength)
    }

    static getMass(kg: number): number {
        return kg * Unit.kg
    }

    static getTime(seconds: number): number {
        return seconds * Unit.s
    }

    static getArea(area: number): number {
        return area * Unit.m * Unit.m
    }

    static getVolume(volume: number): number {
        return volume * Unit.m * Unit.m * Unit.m
    }

    static getVelocity(velocity: number): number {
        return velocity * Unit.m / Unit.s
    }

    static getAcceleration(acceleration: number): number {
        return acceleration * Unit.m / (Unit.s * Unit.s)
    }

    static getForce(newton: number): number {
        return newton * Unit.m / (Unit.s * Unit.s) * Unit.kg
    }

    static getTorque(torque: number): number {
        return Unit.getForce(torque) * Unit.m
    }

    static getRPM(rpm: number): number {
        return rpm / Unit.s
    }

    static getDensity(density: number): number {
        return density * Unit.kg / (Unit.m * Unit.m * Unit.m)
    }

    static getPosition(position: Vector): Vector {
        return Vector.mult(position, Unit.m)
    }

    static getPositionVec(x: number, y: number): Vector {
        return Vector.create(x * Unit.m, y * Unit.m)
    }


    static fromLength(meter: number): number {
        return meter / Unit.m
    }

    static fromVelocity(velocity: number): number {
        return velocity / (Unit.m / Unit.s)
    }

    static fromRPM(rpm: number): number {
        return rpm * Unit.s
    }

    static fromPosition(position: Vector): Vector {
        return Vector.mult(position, 1 / Unit.m)
    }

}