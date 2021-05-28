
export class GyroSensor {

	/**
	 * 'True' angle in degrees
	 * 
	 * @see this.referenceAngle
	 */
	private angle = 0

	/**
	 * Previous angle in degrees
	 */
	private previousAngle = 0

	/**
	 * Angular rate in degrees/(internal seconds)
	 */
	private angularRate = 0

	/**
	 * The reference angle where the '0°' angle is located
	 */
	private referenceAngle = 0

	constructor() {}

	/**
	 * Returns the angle in degrees
	 */
	getAngle(): number {
		return this.angle - this.referenceAngle
	}

	// TODO: Remove
	getAngularDifference(): number {
		return this.angle - this.previousAngle
	}

	/**
	 * Returns the angular rate in degrees/(internal seconds)
	 */
	getAngularRate(): number {
		return this.angularRate
	}

	/**
	 * @param newAngle new angle in degrees
	 * @param referenceAngle the reference angle where the '0°' angle is
	 * @param dt time step in internal seconds
	 */
	update(newAngle: number, referenceAngle: number, dt: number) {
		this.referenceAngle = referenceAngle
		this.previousAngle = this.angle
		this.angle = newAngle
		this.angularRate = (this.angle - this.previousAngle) / dt
	}

}