import { Vector } from "matter-js"
import { Unit } from "../Unit"

export class UltrasonicSensor {

	/**
	 * The position of the sensor relative to the robot position in matter coordinates
	 */
	position: Vector

	/**
	 * The measured distance
	 */
	measuredDistance = Infinity

	/**
	 * Angular range in radians
	 */
	angularRange: number

	constructor(position: Vector, angularRange: number) {
		this.position = Unit.getPosition(position)
		this.angularRange = angularRange
	}

}