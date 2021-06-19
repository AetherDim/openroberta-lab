import { range } from "d3"
import { Body, Vector } from "matter-js"
import { ElectricMotor } from "./ElectricMotor"
import { DrawablePhysicsEntity, PhysicsRectEntity } from "../Entity"
import { Scene } from "../Scene/Scene"
import { Util } from "../Util"
import { GUI } from "dat.gui";

export class Wheel extends DrawablePhysicsEntity<PIXI.Container> {
	
	/**
	 * The physics `Body` of the wheel
	 */
	physicsBody: Body

	physicsEntity: PhysicsRectEntity<PIXI.Container>

	rollingFriction = 0.03
	slideFriction = 0.3
	// staticFriction = 0.09

	wheelRadius: number
	wheelProfileWidth: number

	momentOfInertia: number

	/**
	 * Positive torque indirectly exerts a forward force along the body
	 */
	torque = 0
	/**
	 * The force in the `z` direction
	 */
	normalForce = 0

	/**
	 * previous wheel angle in radians
	 */
	prevWheelAngle = 0
	/**
	 * wheel angle in radians
	 */
	wheelAngle = 0
	/**
	 * wheel angular velocity in radians/'internal seconds'
	 */
	angularVelocity = 0

	private readonly wheelProfile: PIXI.Graphics[] = []

	private readonly debugContainer = new PIXI.Container()

	/**
	 * Creates a top down wheel at position `(x, y)` and `(width, height)`.
	 * The wheel radius is half of the `width`.
	 * 
	 * @param scene
	 * @param x in m (SI units)
	 * @param y in m (SI units)
	 * @param width in m (SI units)
	 * @param height in m (SI units)
	 * @param physicsEntity 
	 * @param mass The mass of the wheel. If it is `null`, the default physics body mass is used.
	 */
	private constructor(scene: Scene, x: number, y: number, width: number, height: number, physicsEntity: PhysicsRectEntity<PIXI.Container>, mass?: number) {
		super(scene, physicsEntity.getDrawable())
		this.physicsEntity = physicsEntity
		
		this.physicsBody = this.physicsEntity.getPhysicsBody();
		[x, y, width, height] = scene.unit.getLengths([x, y, width, height])

		const container = this.physicsEntity.getDrawable()

		const wheelProfileWidth = width * 0.3
		this.wheelProfileWidth = wheelProfileWidth
		this.wheelProfile = range(4).map(() => {
			const graphics = new PIXI.Graphics()
			graphics.beginFill(0xFF0000)
			graphics.drawRect(0, -height/2, wheelProfileWidth, height)
			graphics.endFill()
			container.addChild(graphics)
			return graphics
		})

		this.debugText = new PIXI.Text("")
		this.debugText.style = new PIXI.TextStyle({fill: 0x0000})
		this.debugText.angle = 45
		// this.debugContainer.addChild(this.debugText)
		// container.addChild(this.debugText)
		container.addChild(this.debugContainer)


		if (mass != undefined) {
			Body.setMass(this.physicsBody, scene.unit.getMass(mass))
		}
		this.wheelRadius = width / 2
		this.momentOfInertia = 0.5 * this.physicsBody.mass * Math.pow(this.wheelRadius, 2)
	}

	// TODO: Workaround: static function instead of constructor since `super` has to be the first statement in constructor
	/**
	 * Creates a top down wheel at position `(x, y)` and `(width, height)`.
	 * The wheel radius is half of the `width`.
	 * 
	 * @param scene
	 * @param x
	 * @param y 
	 * @param width 
	 * @param height 
	 * @param mass The mass of the wheel. If it is `null`, the default physics body mass is used.
	 */
	static create(scene: Scene, x: number, y: number, width: number, height: number, mass?: number) {
		return new Wheel(scene, x, y, width, height, PhysicsRectEntity.createWithContainer(scene, x, y, width, height, {color: 0, strokeColor: 0xffffff, strokeWidth: 1, strokeAlpha: 0.5, strokeAlignment: 1 }), mass)
	}


	// implement abstract DrawablePhysicsEntity method 
	getPhysicsBody(): Body {
		return this.physicsBody
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

	private debugText?: PIXI.Text

	updateWheelProfile() {
		for(var i = 0; i < this.wheelProfile.length; i++) {
			const profileGraphics = this.wheelProfile[i]
			const position = profileGraphics.position
			const angle = this.wheelAngle + 2 * Math.PI * i / this.wheelProfile.length
			profileGraphics.visible = Math.sin(angle) < 0
			position.x = this.wheelRadius * Math.cos(angle) - this.wheelProfileWidth/2 * Math.sin(angle)
			profileGraphics.scale.x = Math.sin(angle)
		}

		//this.debugText.text = "" + Unit.fromVelocity(this.angularVelocity * this.wheelRadius - this.physicsBody.velocityAlongBody())//(this.angularVelocity / (2 * Math.PI))
		
		// this.pixiContainer.removeChild(this.wheelDebugObject)
		// this.wheelDebugObject.destroy()
		// const text = new PIXI.Text("" + (this.angularVelocity / (2 * Math.PI)))
		// text.angle = 45
		// //this.wheelDebugGraphics = this.pixiRect(0, 0, 2, this.angularVelocity * 10 / (2 * Math.PI), 0x00FF00)
		// this.wheelDebugObject = text
		// this.pixiContainer.addChild(this.wheelDebugObject)
	}

	alongStepFunctionWidth = 0.1
	orthStepFunctionWidth = 0.1


	/**
	 * Returns a new velocity from `velocity`
	 * 
	 * @param velocity in internal units
	 * @param stepFunctionWidth in m/s (SI units)
	 */
	private customFunction(velocity: number, stepFunctionWidth: number): number { 
		if (false) { 
			return velocity/stepFunctionWidth 
		} else {
			return Util.continuousSign(velocity, this.scene.unit.getVelocity(stepFunctionWidth))
		}
	}

	_wheelForceVector = { x: 0, y: 0}

	update(dt: number) {
		const wheel = this.physicsBody

		const vec = wheel.vectorAlongBody()
		const orthVec: Vector = {x: -vec.y, y: vec.x}

		// torque from the rolling friction
		// rollingFriction = d/R and d * F_N = torque
		const rollingFrictionTorque = this.customFunction(-wheel.velocityAlongBody(), this.alongStepFunctionWidth)
				* this.rollingFriction * this.wheelRadius * this.normalForce

		// TODO: already simulated by `wheelSlideFrictionForce`?
		// const rollingFrictionForce = this.normalForce * this.rollingFriction * this.customFunction(-wheel.velocityAlongBody())

		// torque for 
		const wheelVelocityDifference = this.angularVelocity * this.wheelRadius - wheel.velocityAlongBody()
		var alongSlideFrictionForce = this.normalForce * this.slideFriction
		 * this.customFunction(wheelVelocityDifference, this.alongStepFunctionWidth)

		// t = time
		// v0 = initial velocity, f = force, m = mass, v1 = end velocity
		// o0 = initial angular velocity, T = torque, I = moment of inertia, o1 = end angular velocity
		//
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
		let slidingFrictionTorque = -alongSlideFrictionForce * this.wheelRadius

		let alongForce = 0

		// TODO: A bit hacky to use a constant acceleration
		const mass = this.normalForce / this.scene.unit.getAcceleration(9.81)//wheel.mass
		const totalTorque = slidingFrictionTorque + this.torque + rollingFrictionTorque
		/** time to adjust speed such that the wheel rotation speed matches the center of mass wheel speed */
		const timeToAdjustSpeed = wheelVelocityDifference / (alongSlideFrictionForce / mass - totalTorque / this.momentOfInertia * this.wheelRadius)
		// TODO: Change sign of rolling friction, if wheel.velocityAlongBody() changes sign
		let remainingTime = dt
		if (0 < timeToAdjustSpeed && timeToAdjustSpeed < dt) {
			this.updateWithTorque(slidingFrictionTorque + this.torque + rollingFrictionTorque, timeToAdjustSpeed)
			remainingTime = dt - timeToAdjustSpeed

			// kinetic/sliding friction
			alongForce += alongSlideFrictionForce * timeToAdjustSpeed / dt
			// static friction
			alongForce += (this.torque + rollingFrictionTorque) / this.wheelRadius * remainingTime / dt

			// calculate torque such that the wheel does not slip
			const wheelVelocityChange = alongForce / mass * dt
			const newTorque = (wheelVelocityChange / this.wheelRadius) / remainingTime * this.momentOfInertia
			this.torque = newTorque
		} else {
			// torque of sliding friction
			this.applyTorque(slidingFrictionTorque + rollingFrictionTorque)
			alongForce += alongSlideFrictionForce
		}

		

		// friction force

		// friction along wheel rolling direction
		const alongForceVec = Vector.mult(vec, alongForce)

		// friction orthogonal to the wheel rolling direction
		const orthVelocity = Vector.dot(wheel.velocity, orthVec)
		const orthSlideFrictionForce = this.normalForce * this.slideFriction
		 * this.customFunction(-orthVelocity, this.orthStepFunctionWidth)
		const orthSlideFrictionForceVec = Vector.mult(orthVec, orthSlideFrictionForce)

		// apply the friction force
		this._wheelForceVector = Util.vectorAdd(alongForceVec, orthSlideFrictionForceVec)
		Body.applyForce(wheel, wheel.position, this._wheelForceVector)


		// update `wheelAngle` and `angularVelocity` using torque
		// this.angularVelocity = (this.wheelAngle - this.prevWheelAngle) / dt
		// this.prevWheelAngle = this.wheelAngle
		this.updateWithTorque(this.torque, remainingTime)

		// reset torque and normalForce
		this.torque = 0.0
		this.normalForce = 0.0

		this.updateWheelProfile()
	}

	private updateWithTorque(torque: number, dt: number) {
		this.angularVelocity += torque * dt / this.momentOfInertia
		this.wheelAngle += this.angularVelocity * dt
	}

	slippingFactor = 0.1
	pseudoSlideFriction = 2.0
	pseudoRollingFriction = 2.0

	frictionFunction(friction: number): number {
		return friction//this.customFunction(friction, 0.01)
	}

	pseudoPhysicsUpdate(dt: number) {

		const wheel = this.physicsBody

		const vec = wheel.vectorAlongBody()
		const orthVec: Vector = {x: -vec.y, y: vec.x}
		const velocityAlong = Vector.dot(wheel.velocity, vec)
		const velocityOrthogonal = Vector.dot(wheel.velocity, orthVec)
		const velocityWheelEdge = this.angularVelocity * this.wheelRadius

		const torque = this.torque
		const forwardForce = torque / this.wheelRadius

		const alongForceVec = Vector.mult(orthVec, -this.pseudoSlideFriction*velocityOrthogonal)
		const orthSlideFrictionForceVec = Vector.mult(vec, this.frictionFunction(
			-this.pseudoRollingFriction*velocityAlong
			+ (-this.pseudoSlideFriction)*(velocityAlong - velocityWheelEdge)
			+ forwardForce
				//* Math.abs(forwardForce)
				//* this.customFunction(this.pseudoSpeedControllerVelocity - velocityWheelEdge, 0.1)
		))

		// apply forces
		this._wheelForceVector = Util.vectorAdd(alongForceVec, orthSlideFrictionForceVec)
		Body.applyForce(wheel, wheel.position, this._wheelForceVector)

		// angularVelocity * this.wheelRadius = velocity
		this.angularVelocity = velocityAlong / this.wheelRadius
		this.wheelAngle += this.angularVelocity * dt

		// reset torque and normalForce
		this.torque = 0.0
		this.normalForce = 0.0

		this.updateWheelProfile()
	}

	_addDebugGui(gui: GUI) {
		gui.add(this, 'rollingFriction', 0)
		gui.add(this, 'slideFriction', 0)
	}

}