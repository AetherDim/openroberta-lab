import { range, time } from "d3"
import { Body, Vector } from "matter-js"
import { createRect } from "./displayable"
import { ElectricMotor } from "./electricMotor"
import { Unit } from "./Unit"

export class Wheel {
	
	/**
	 * The physics `Body` of the wheel
	 */
	physicsBody: Body

	rollingFriction = 0.03
	slideFriction = 0.3
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

	prevWheelAngle = 0
	wheelAngle = 0
	angularVelocity = 0

	private wheelProfile: PIXI.Graphics[]

	private debugContainer: PIXI.Container

	/**
	 * Creates a top down wheel at position `(x, y)` and `(width, height)`.
	 * The wheel radius is half of the `width`.
	 * 
	 * @param x
	 * @param y 
	 * @param width 
	 * @param height 
	 * @param mass The mass of the wheel. If it is `null`, the default physics body mass is used.
	 */
	constructor(x: number, y: number, width: number, height: number, mass: number = null) {
		this.physicsBody = createRect(x, y, width, height);
		[x, y, width, height] = Unit.getLengths([x, y, width, height])

		const displayable = this.physicsBody.displayable
		const container = new PIXI.Container()
		container.addChild(displayable.displayObject)

		this.wheelProfile = range(4).map(() => {
			const graphics = new PIXI.Graphics()
			graphics.beginFill(0xFF0000)
			graphics.drawRect(0, -height/2, width * 0.1, height)
			graphics.endFill()
			container.addChild(graphics)
			return graphics
		})

		this.debugContainer = new PIXI.Container()
		this.debugText = new PIXI.Text("")
		this.debugText.style = new PIXI.TextStyle({fill: 0x0000})
		this.debugText.angle = 45
		this.debugText.scale.x = 0.001
		this.debugText.scale.y = 0.001
		//this.debugContainer.addChild(this.debugText)
		// container.addChild(this.debugText)
		container.addChild(this.debugContainer)

		this.physicsBody.displayable.displayObject = container

		if (mass) {
			Body.setMass(this.physicsBody, Unit.getMass(mass))
		}
		this.wheelRadius = width / 2
		this.momentOfInertia = 0.5 * this.physicsBody.mass * Math.pow(this.wheelRadius, 2)
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

	private debugText: PIXI.Text = null

	updateWheelProfile() {
		for(var i = 0; i < this.wheelProfile.length; i++) {
			const profileGraphics = this.wheelProfile[i]
			const position = profileGraphics.position
			const angle = this.wheelAngle + 2 * Math.PI * i / this.wheelProfile.length
			profileGraphics.visible = Math.sin(angle) < 0
			position.x = this.wheelRadius * Math.cos(angle) - profileGraphics.width / 2
			profileGraphics.scale.x = Math.sin(angle)
		}

		//this.debugText.text = "" + (this.angularVelocity * this.wheelRadius - this.physicsBody.velocityAlongBody())//(this.angularVelocity / (2 * Math.PI))
		
		// this.pixiContainer.removeChild(this.wheelDebugObject)
		// this.wheelDebugObject.destroy()
		// const text = new PIXI.Text("" + (this.angularVelocity / (2 * Math.PI)))
		// text.angle = 45
		// //this.wheelDebugGraphics = this.pixiRect(0, 0, 2, this.angularVelocity * 10 / (2 * Math.PI), 0x00FF00)
		// this.wheelDebugObject = text
		// this.pixiContainer.addChild(this.wheelDebugObject)
	}

	
	private customFunction(velocity: number, stepFunctionWidth: number = 1): number {
		if (false) { 
			return velocity/stepFunctionWidth 
		} else {
			return this.continuousStepFunction(velocity, stepFunctionWidth)
		}
	}

	update(dt: number) {
		const wheel = this.physicsBody

		const vec = wheel.vectorAlongBody()
		const orthVec = Vector.perp(vec)

		// torque from the rolling friction
		// rollingFriction = d/R and d * F_N = torque
		this.applyTorque(
			this.customFunction(-wheel.velocityAlongBody())
				* this.rollingFriction * this.wheelRadius * this.normalForce
		)

		// TODO: already simulated by `wheelSlideFrictionForce`?
		// const rollingFrictionForce = this.normalForce * this.rollingFriction

		// torque for 
		const wheelVelocityDifference = this.angularVelocity * this.wheelRadius - wheel.velocityAlongBody()
		var alongSlideFrictionForce = this.normalForce * this.slideFriction
		 * this.customFunction(wheelVelocityDifference)

		// v0 + f/m * t = v1
		// o0 + T/I * t = o1
		//
		// v1 / r = o1 (condition)
		//
		// v0 + f/m * t = v1 = o0 * r + T/I * t * r
		// (f/m - T/I*r) * t = o0 * r - v0
		// t = (o0 * r - v0) / (f/m - T/I*r)
		//
		// define: dv = o0 * r - v0
		// t = dv / (f/m - T/I*r)
		//
		// if T = -f * r, then
		// sign(f) = sign(v)  and sign(f) = -sign(T) => sign(t) = 1
		//
		// for m -> infinity:
		// t = (o0 * r - v0) / (-T/I*r)
		//   = (o0 * r - v0)/r / (-T/I)
		var slidingFrictionTorque = -alongSlideFrictionForce * this.wheelRadius

		const mass = this.normalForce / Unit.getAcceleration(9.81)
		var timeToAdjustSpeed = wheelVelocityDifference / (alongSlideFrictionForce/mass - (slidingFrictionTorque + this.torque) / this.momentOfInertia * this.wheelRadius)
		timeToAdjustSpeed = Math.abs(timeToAdjustSpeed)
		if (0 < timeToAdjustSpeed && timeToAdjustSpeed < dt) {
			slidingFrictionTorque *= timeToAdjustSpeed / dt
			alongSlideFrictionForce *= timeToAdjustSpeed / dt
		}

		// torque of sliding friction
		this.applyTorque(slidingFrictionTorque)


		// friction force

		// friction along wheel rolling direction
		const alongSlideFrictionForceVec = Vector.mult(vec, alongSlideFrictionForce)

		// friction orthogonal to the wheel rolling direction
		const orthVelocity = Vector.dot(wheel.velocity, orthVec)
		const orthSlideFrictionForce = this.normalForce * this.slideFriction
		 * this.customFunction(-orthVelocity)
		const orthSlideFrictionForceVec = Vector.mult(orthVec, orthSlideFrictionForce)

		// apply the friction force
		Body.applyForce(wheel, wheel.position,
			Vector.add(alongSlideFrictionForceVec, orthSlideFrictionForceVec)
		)


		// update `wheelAngle` and `angularVelocity` using torque
		// this.angularVelocity = (this.wheelAngle - this.prevWheelAngle) / dt
		// this.prevWheelAngle = this.wheelAngle
		this.angularVelocity += this.torque * dt / this.momentOfInertia
		this.wheelAngle += this.angularVelocity * dt

		// reset torque and normalForce
		this.torque = 0.0
		this.normalForce = 0.0

		this.updateWheelProfile()
	}

}