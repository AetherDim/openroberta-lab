import { Body, Vector } from "matter-js"
import { createRect } from "./displayable"
import { ElectricMotor } from "./electricMotor"

export class Wheel {
	
	/**
	 * The physics `Body` of the wheel
	 */
	physicsWheel: Body

	rollingFriction = 0.03
	slideFriction = 2.0
	// staticFriction = 0.09

	wheelRadius: number

	momentOfInertia: number

	/**
	 * Positive torque indirectly exerts a forward force along the body
	 */
	torque = 0
	/**
	 * The force in the `z` direction
	 */
	normalForce = 0

	wheelAngle = 0
	angularVelocity = 0


	/**
	 * Creates a top down wheel at position `(x, y)` and `(width, height)`.
	 * The wheel radius is half of the `width`.
	 * 
	 * @param x
	 * @param y 
	 * @param width 
	 * @param height 
	 */
	constructor(x: number, y: number, width: number, height: number) {
		this.physicsWheel = createRect(x, y, width, height)
		this.wheelRadius = width / 2
		this.momentOfInertia = 0.5 * this.physicsWheel.mass * Math.pow(this.wheelRadius, 2)
	}

	
	applyTorque(torque: number) {
		this.torque += torque
	}

	/**
	 * @param motor the `ElectricMotor` which applies the torque
	 * @param strength from -1 to 1 where 1 is forward in the direction of the wheel
	 */
	applyTorqueFromMotor(motor: ElectricMotor, strength: number) {
		this.applyTorque(strength * motor.getAbsTorqueForAngularVelocity(this.angularVelocity))
	}

	applyNormalForce(force: number) {
		this.normalForce += force
	}

	private continuousStepFunction(x: number, width: number) {
		if (Math.abs(x) > width) {
			return Math.sign(x)
		}
		return x / width
	}

	update(dt: number) {
		const wheel = this.physicsWheel

		const vec = wheel.vectorAlongBody()
		const orthVec = Vector.perp(vec)

		// torque from the rolling friction
		// rollingFriction = d/R and d * F_N = torque
		this.applyTorque(
			this.continuousStepFunction(wheel.velocityAlongBody(), 0.1) 
				* this.rollingFriction * this.wheelRadius * this.normalForce
		)

		// TODO: already simulated by `wheelSlideFrictionForce`?
		// const rollingFrictionForce = this.normalForce * this.rollingFriction

		// torque for 
		const wheelVelocityDifference = this.angularVelocity * this.wheelRadius - wheel.velocityAlongBody()
		const alongSlideFrictionForce = this.normalForce * this.slideFriction
		 * this.continuousStepFunction(wheelVelocityDifference, 0.1)

		// torque of sliding friction
		this.applyTorque(-alongSlideFrictionForce * this.wheelRadius)


		// friction force

		// friction along wheel rolling direction
		const alongSlideFrictionForceVec = Vector.mult(vec, alongSlideFrictionForce)

		// friction orthogonal to the wheel rolling direction
		const orthVelocity = Vector.dot(wheel.velocity, orthVec)
		const orthSlideFrictionForce = this.normalForce * this.slideFriction
		 * this.continuousStepFunction(-orthVelocity, 0.1)
		const orthSlideFrictionForceVec = Vector.mult(orthVec, orthSlideFrictionForce)

		// apply the friction force
		Body.applyForce(wheel, wheel.position,
			Vector.add(alongSlideFrictionForceVec, orthSlideFrictionForceVec)
		)


		// update `wheelAngle` and `angularVelocity` using torque
		this.angularVelocity += this.torque * dt / this.momentOfInertia
		this.wheelAngle += this.angularVelocity * dt

		// reset torque and normalForce
		this.torque = 0.0
		this.normalForce = 0.0
	}

}