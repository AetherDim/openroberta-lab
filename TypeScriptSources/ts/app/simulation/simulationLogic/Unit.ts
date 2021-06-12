import { Vector } from "matter-js"

/**
 * Converts SI units to the internal matter.js units and the other way.
 */
export class Unit {

	/**
	 * meters factor from SI units to internal
	 */
	private readonly m: number
	/**
	 * kilograms factor from SI units to internal
	 */
	private readonly kg: number
	/**
	 * seconds factor from SI units to internal
	 */
	private readonly s: number

	/**
	 * Construct a 'Unit' with unit scaling from SI units to internal matter.js units
	 * 
	 * @param options meter, kilogram and seconds. The default is 1.
	 */
	constructor(options: {m?: number, kg?: number, s?: number}) {
		this.m = options.m ?? 1
		this.kg = options.kg ?? 1
		this.s = options.kg ?? 1
	}

	getLength(meter: number): number {
		return meter * this.m
	}

	getLengths(meters: number[]): number[] {
		const t = this
		return meters.map(meter => t.getLength(meter))
	}

	getMass(kg: number): number {
		return kg * this.kg
	}

	getTime(seconds: number): number {
		return seconds * this.s
	}

	getArea(area: number): number {
		return area * this.m * this.m
	}

	getVolume(volume: number): number {
		return volume * this.m * this.m * this.m
	}

	getVelocity(velocity: number): number {
		return velocity * this.m / this.s
	}

	getAcceleration(acceleration: number): number {
		return acceleration * this.m / (this.s * this.s)
	}

	getForce(newton: number): number {
		return newton * this.m / (this.s * this.s) * this.kg
	}

	getTorque(torque: number): number {
		return this.getForce(torque) * this.m
	}

	getRPM(rpm: number): number {
		return rpm / this.s
	}

	getDensity(density: number): number {
		return density * this.kg / (this.m * this.m * this.m)
	}

	getPosition(position: Vector): Vector {
		return Vector.mult(position, this.m)
	}

	getPositionVec(x: number, y: number): Vector {
		return Vector.create(x * this.m, y * this.m)
	}


	fromTime(time: number): number {
		return time / this.s
	}

	fromLength(meter: number): number {
		return meter / this.m
	}

	fromVelocity(velocity: number): number {
		return velocity / (this.m / this.s)
	}

	fromRPM(rpm: number): number {
		return rpm * this.s
	}

	fromPosition(position: Vector): Vector {
		return Vector.mult(position, 1 / this.m)
	}

}