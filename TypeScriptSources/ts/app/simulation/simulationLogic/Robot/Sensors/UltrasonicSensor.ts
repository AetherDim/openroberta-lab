import { Vector } from "matter-js"
import { Unit } from "../../Unit"

export class UltrasonicSensor {

	/**
	 * The position of the sensor relative to the robot position in matter coordinates
	 */
	position: Vector
	/**
	 * Angle with respect to the x axis where the sensor points to in radians.
	 */
	angle: number

	/**
	 * The measured distance in matter units
	 */
	private measuredDistance = Infinity

	/**
	 * The maximum distance which can be measured by the ultrasonic sensor in matter units
	 */
	maximumMeasurableDistance: number

	private unit: Unit

	/**
	 * Angular range in radians
	 */
	angularRange: number

	graphics = new PIXI.Graphics()

	/**
	 * @param angle angle towards the x axis in radians
	 * @param angularRange angular range in radians
	 */
	constructor(unit: Unit, position: Vector, angle: number, angularRange: number) {
		this.unit = unit
		this.position = unit.getPosition(position)
		this.angle = angle
		this.angularRange = angularRange
		this.maximumMeasurableDistance = 0
		this.setMaximumMeasurableDistanceInMeters(2.5)
		this.updateGraphics()
	}

	getMeasuredDistance(): number {
		return this.measuredDistance
	}

	/**
	 * @param distance distance in meters
	 */
	setMaximumMeasurableDistanceInMeters(distance: number) {
		this.maximumMeasurableDistance = this.unit.getLength(distance)
	}

	/**
	 * @param distance The measured distance in matter units
	 * @param updateGraphics If true, updates the graphics
	 */
	setMeasuredDistance(distance: number, updateGraphics: boolean = true) {
		const isDifferentDistance = this.measuredDistance != distance
		this.measuredDistance = distance
		if (updateGraphics && isDifferentDistance) {
			this.updateGraphics()
		}
	}

	updateGraphics() {
		const graphicsDistance = Math.min(this.maximumMeasurableDistance, this.measuredDistance)
		const vector = Vector.create(graphicsDistance, 0)
		const halfAngle = this.angularRange/2
		const leftVector = Vector.rotate(vector, this.angle + halfAngle)
		const rightVector = Vector.rotate(vector, this.angle - halfAngle)
		this.graphics
			.clear()
			.lineStyle(2)
			.moveTo(leftVector.x, leftVector.y)
			.lineTo(0, 0)
			.lineTo(rightVector.x, rightVector.y)
			.arc(0, 0, graphicsDistance, this.angle - halfAngle, this.angle + halfAngle)
		this.graphics.position.set(this.position.x, this.position.y)
	}

	removeGraphicsFromParent() {
		this.graphics.parent.removeChild(this.graphics)
	}

	/**
	 * Removes `graphics` from its parent and destroys it.
	 */
	destroy() {
		this.removeGraphicsFromParent()
		this.graphics.destroy()
	}

}