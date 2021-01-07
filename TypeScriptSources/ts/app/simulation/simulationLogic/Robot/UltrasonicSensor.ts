import { Vector } from "matter-js"
import { Unit } from "../Unit"

export class UltrasonicSensor {

	/**
	 * The position of the sensor relative to the robot position in matter coordinates
	 */
	position: Vector

	/**
	 * The measured distance in matter units
	 */
	measuredDistance = Infinity

	/**
	 * The maximum distance which can be measured by the ultrasonic sensor in meters
	 */
	maximumMeasurableDistance = 2.5

	/**
	 * Angular range in radians
	 */
	angularRange: number

	constructor(position: Vector, angularRange: number) {
		this.position = Unit.getPosition(position)
		this.angularRange = angularRange
	}

}