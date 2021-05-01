import { Body, Vector, Composite } from 'matter-js'
import { ElectricMotor } from './ElectricMotor'

import "../ExtendedMatter"
import { MAXPOWER } from '../interpreter.constants'
import { Interpreter } from '../interpreter.interpreter'
import { RobotSimBehaviour } from './RobotSimBehaviour'
import { Unit } from '../Unit'
import { Wheel } from './Wheel'
import { ColorSensor } from './ColorSensor'
import { UltrasonicSensor } from './UltrasonicSensor'
import { Ray } from '../Geometry/Ray'
import { TouchSensor } from './TouchSensor'
import { IContainerEntity, IEntity, IPhysicsCompositeEntity, IUpdatableEntity, PhysicsRectEntity } from '../Entity'
import { Scene } from '../Scene/Scene'
import { StringMap, Util } from '../Util'
// Dat Gui
import {downloadFile, downloadJSONFile} from "./../GlobalDebug";
import dat = require('dat.gui')
import {BodyHelper} from "./BodyHelper";
import { RobotProgram } from './RobotProgram'

const sensorTypeStrings =  ["TOUCH", "GYRO", "COLOR", "ULTRASONIC", "INFRARED", "SOUND", "COMPASS",
	// german description: "HT Infrarotsensor"
	"IRSEEKER",
	// does not work in RobertaLab?!
	"HT_COLOR",
] as const
export type SensorType = typeof sensorTypeStrings[number]

export class Robot implements IContainerEntity, IUpdatableEntity, IPhysicsCompositeEntity {

	/**
	 * The full robot physics object
	 */
	physicsComposite: Composite

	/**
	 * The body of the robot as `Body`s
	 */
	body: Body
	private bodyContainer: PIXI.Container
	private bodyEntity: PhysicsRectEntity<PIXI.Container>

	/**
	 * The wheels of the robot as `Body`s
	 */
	leftDrivingWheel: Wheel
	rightDrivingWheel: Wheel

	/**
	 * The list of all wheels
	 */
	wheelsList: Wheel[]

	/**
	 * The list of all wheels
	 */
	physicsWheelsList: Body[]

	updateSensorGraphics = true

	/**
	 * The color sensors of the robot
	 */
	private colorSensors: StringMap<ColorSensor> = {}

	/**
	 * The ultrasonic sensors of the robot
	 */
	private ultrasonicSensors: StringMap<UltrasonicSensor> = {}

	/**
	 * The touch sensors of the robot
	 */
	private touchSensors: StringMap<TouchSensor> = {}

	private robotBehaviour?: RobotSimBehaviour

	configuration?: StringMap<SensorType> = undefined;
	programCode: any = null;

	interpreter?: Interpreter

	/**
	 * Time to wait until the next command should be executed (in internal units)
	 */
	private delay = 0
	
	/**
	 * robot type
	 */
	private type: string = 'default';


	setRobotType(type:string) {
		this.type = type;
		// TODO: change things
	}


	constructor(robot: {scene: Scene, body: PhysicsRectEntity<PIXI.Container>, leftDrivingWheel: Wheel, rightDrivingWheel: Wheel, otherWheels: Wheel[]}) {
		this.scene = robot.scene
		this.bodyEntity = robot.body
		this.body = robot.body.getPhysicsBody()
		this.leftDrivingWheel = robot.leftDrivingWheel
		this.rightDrivingWheel = robot.rightDrivingWheel
		this.wheelsList = [this.leftDrivingWheel, this.rightDrivingWheel].concat(robot.otherWheels)

		this.bodyContainer = this.bodyEntity.getDrawable()

		this.physicsWheelsList = []
		this.physicsComposite = Composite.create()
		this.updatePhysicsObject()

		this.addChild(this.bodyEntity)
		const t = this
		this.wheelsList.forEach(wheel => t.addChild(wheel))

		this.addDebugSettings()
	}

	private addDebugSettings() {

		const DebugGui = this.scene.getDebugGuiDynamic()

		if(DebugGui) {
			const robotFolder = DebugGui.addFolder('Robot')

			const pos = robotFolder.addFolder('Position')
			pos.addUpdatable('x', () => this.body.position.x)
			pos.addUpdatable('y', () => this.body.position.x)

			const wheelFolder = robotFolder.addFolder('Wheels')

			const control = {
				rollingFriction: this.wheelsList[0].rollingFriction,
				slideFriction: this.wheelsList[0].slideFriction
			}

			wheelFolder.add(control, 'rollingFriction').onChange(value => {
				this.wheelsList.forEach(wheel => wheel.rollingFriction = value)
				wheelFolder.updateDisplay()
			})

			wheelFolder.add(control, 'slideFriction').onChange(value => {
				this.wheelsList.forEach(wheel => wheel.slideFriction = value)
				wheelFolder.updateDisplay()
			})

			this.wheelsList[0]._addDebugGui(wheelFolder.addFolder('Wheel Left'))
			this.wheelsList[1]._addDebugGui(wheelFolder.addFolder('Wheel Right'))
			this.wheelsList[2]._addDebugGui(wheelFolder.addFolder('Wheel Back'))

			DebugGui.addButton("Download Program (JSON)", () => 
				downloadFile("program.json", [JSON.stringify(this.programCode, undefined, "\t")])
			)

		}

	}

	private updatePhysicsObject() {

		this.physicsWheelsList = this.wheelsList.map(wheel => wheel.physicsBody)
		const wheels = this.physicsWheelsList

		this.physicsComposite = Composite.create({bodies: [this.body].concat(wheels)})

		// set friction
		wheels.forEach(wheel => {
			wheel.frictionAir = 0.0
			// const constraint1 = new CustomConstraint(
			//     this.body, wheel,
			//     Util.vectorSub(wheel.position, this.body.position), Vector.create(), {
			//         angularFrequency: 2 * Math.PI * 0.6,
			//         damping: 1.0,
			//         length: 0//Vector.magnitude(Util.vectorSub(this.body.position, wheel.position))
			//     })
			// const constraint2 = new CustomConstraint(
			//     this.body, wheel,
			//     Vector.create(), Util.vectorSub(this.body.position, wheel.position), {
			//         angularFrequency: 2 * Math.PI * 0.6,
			//         damping: 1.0,
			//         length: 0//Vector.magnitude(Util.vectorSub(this.body.position, wheel.position))
			//     })
			
			// this.customConstraints.push(constraint1)
			// this.customConstraints.push(constraint2)
			this.physicsComposite.addRigidBodyConstraints(this.body, wheel, 0.1, 0.1)
		});

		this.body.frictionAir = 0.0;
	}

	// IEntity and IContainerEntity

	private parent?: IContainerEntity
	private children: IEntity[] = []
	private scene: Scene

	IEntity(){}

	getScene() {
		return this.scene
	}

	getParent(): IContainerEntity | undefined {
		return this.parent
	}

	_setParent(parent: IContainerEntity | undefined) {
		this.parent = parent
	}

	IPhysicsEntity(){}

	getPhysicsObject() {
		return this.physicsComposite
	}

	IPhysicsCompositeEntity(){}

	getPhysicsComposite() {
		return this.physicsComposite
	}

	IContainerEntity(){}

	getChildren() {
		return this.children
	}

	addChild(child: IEntity) {
		child.getParent()?.removeChild(child)
		child._setParent(this)
		this.children.push(child)
		if (this.scene.getEntityManager().containsEntity(this)) {
			this.scene.addEntity(child)
		}
	}

	removeChild(child: IEntity) {
		child._setParent(undefined)
		Util.removeFromArray(this.children, child)
		this.scene.removeEntity(child)
	}

	/**
	 * Sets the position and rotation of the robot. (Body, wheels and sensors)
	 * 
	 * @param position Position of the robot body in meters
	 * @param rotation Rotation of the robot body in radians
	 */
	setPose(position: Vector, rotation: number, inRadians: boolean = true) {
		Composite.translate(this.physicsComposite, Util.vectorSub(position, this.body.position))
		if (!inRadians) {
			rotation *= 2 * Math.PI / 360
		}
		Composite.rotate(this.physicsComposite, rotation - this.body.angle, this.body.position)
	}

	/**
	 * Returns the color sensor which can be `undefined`
	 */
	getColorSensors(): ColorSensor[] {
		return Object.values(this.colorSensors)
	}

	/**
	 * Sets the color sensor at the position (x,y) in meters
	 * 
	 * @param port the port of the sensor
	 * @param x x position of the sensor in meters
	 * @param y y position of the sensor in meters
	 * @returns false if a color sensor at `port` already exists and a new color sensor was not added
	 */
	addColorSensor(port: string, x: number, y: number): boolean {
		if (this.colorSensors[port]) {
			return false
		}
		const colorSensor = new ColorSensor(this.scene.unit, Vector.create(x, y))
		this.colorSensors[port] = colorSensor
		this.bodyContainer.addChild(colorSensor.graphics)
		return true
	}
	
	getUltrasonicSensors(): UltrasonicSensor[] {
		return Object.values(this.ultrasonicSensors)
	}

	addUltrasonicSensor(port: string, ultrasonicSensor: UltrasonicSensor): boolean {
		if (this.ultrasonicSensors[port]) {
			return false
		}
		this.ultrasonicSensors[port] = ultrasonicSensor
		this.bodyContainer.addChild(ultrasonicSensor.graphics)
		return true
	}

	getTouchSensors(): TouchSensor[] {
		return Object.values(this.touchSensors)
	}

	/**
	 * Adds `touchSensor` to `this.touchSensors` if the port is not occupied
	 * 
	 * @param port The port of the touch sensor
	 * @param touchSensor The touch sensor which will be added
	 * @returns false if a touch sensor at `port` already exists and the new touch sensor was not added
	 */
	addTouchSensor(port: string, touchSensor: TouchSensor): boolean {
		if (this.touchSensors[port]) {
			return false
		}
		this.addChild(touchSensor)
		Composite.add(this.physicsComposite, touchSensor.physicsBody)
		this.physicsComposite.addRigidBodyConstraints(this.body, touchSensor.physicsBody, 0.3, 0.3)
		this.touchSensors[port] = touchSensor
		return true
	}

	// TODO: Remove this line
	private debugGraphics?: PIXI.Graphics

	setWheels(wheels: {leftDrivingWheel: Wheel, rightDrivingWheel: Wheel, otherWheels: Wheel[]}) {
		this.leftDrivingWheel = wheels.leftDrivingWheel
		this.rightDrivingWheel = wheels.rightDrivingWheel
		this.wheelsList = [this.leftDrivingWheel, this.rightDrivingWheel].concat(wheels.otherWheels)
		this.updatePhysicsObject()
	}

	private vectorAlongBody(body: Body, length: number = 1): Vector {
		return Vector.create(length * Math.cos(body.angle), length * Math.sin(body.angle))
	}

	driveWithWheel(wheel: Body, forwardForce: number) {
		const force = this.vectorAlongBody(wheel, forwardForce)
		Body.applyForce(wheel, wheel.position, force);
	}

	private velocityAlongBody(body: Body): number {
		return Vector.dot(body.velocity, this.vectorAlongBody(body))
	}

	/**
	 * The torque multiplier for the left wheel
	 */
	leftForce = 0
	/**
	 * The torque multiplier for the right wheel
	 */
	rightForce = 0

	encoder = {
		left: 0,
		right: 0
	};

	setProgram(program: RobotProgram, breakpoints: any[]): Interpreter {
		const _this = this;
		this.programCode = JSON.parse(program.javaScriptProgram);
		this.configuration = program.javaScriptConfiguration
		const allKeys = Object.keys(this.configuration)
		const allValues = Object.values(this.configuration)
		const wrongValueCount = allValues.find((e)=>!sensorTypeStrings.includes(e))?.length ?? 0
		if (wrongValueCount > 0 || allKeys.filter((e) => typeof e === "number").length > 0) {
			console.error(`The 'configuration' has not the expected type: ${this.configuration}`)
		}
		this.robotBehaviour = new RobotSimBehaviour(this.scene.unit);
		this.interpreter = new Interpreter(this.programCode, this.robotBehaviour, () => {
			_this.programTerminated();
		}, breakpoints);
		this.resetInternalState()
		
		return this.interpreter;
	}

	private programTerminated() {
		console.log("Interpreter terminated");
	}

	wheelDriveFriction = 0.03
	wheelSlideFriction = 0.07

	// TODO: (Remove) it is an old but simpler implementation than `Wheel`
	updateWheelVelocity(wheel: Body, dt: number) {
		const vec = this.vectorAlongBody(wheel)
		const velocityAlongBody = Vector.mult(vec, Vector.dot(vec, wheel.velocity))
		const velocityOrthBody = Util.vectorSub(wheel.velocity, velocityAlongBody)
		const velocityChange = Util.vectorAdd(
			Vector.mult(velocityAlongBody, -this.wheelDriveFriction),
			Vector.mult(velocityOrthBody, -this.wheelSlideFriction))


		// divide two times by `dt` since the simulation calculates velocity changes by adding
		// force/mass * dt
		Body.applyForce(wheel, wheel.position, Vector.mult(velocityChange, wheel.mass / dt))
	}

	private needsNewCommands = true
	private endEncoder: { left: number, right: number } | null = null

	/**
	 * Reset the internal state of the robot. E.g. `endEncoder`, `leftForce`
	 */
	private resetInternalState() {
		this.needsNewCommands = true
		this.endEncoder = null
		this.leftForce = 0
		this.rightForce = 0
	}

	// IUpdatableEntity

	IUpdatableEntity(){}

	/**
	 * Updates the robot with time step 'dt'.
	 * @param dt The time step in internal units
	 */
	update(dt: number) {

		// update wheels velocities
		const gravitationalAcceleration = this.scene.unit.getAcceleration(9.81)
		const robotBodyGravitationalForce = gravitationalAcceleration * this.body.mass / this.wheelsList.length
		this.wheelsList.forEach(wheel => {
			wheel.applyNormalForce(robotBodyGravitationalForce + wheel.physicsBody.mass * gravitationalAcceleration)
			wheel.update(dt)
		})

		if(!this.robotBehaviour || !this.interpreter) {
			return;
		}

		// update sensors
		this.updateRobotBehaviourHardwareStateSensors()

		if(this.delay > 0) {
			this.delay -= dt; // reduce delay by dt each tick
		} else {
			if (this.interpreter.isTerminated()) {
				this.resetInternalState()
			} else if(!this.scene.getProgramManager().isProgramPaused() && this.needsNewCommands) {
				// get delay from operation and convert seconds to internal time unit
				this.delay = this.scene.getUnitConverter().getTime(this.interpreter.runNOperations(1000) / 1000);
			}
		}


		const t = this
		/**
		 * Uses `encoder` to reach the values of `endEncoder` by setting the appropriate values
		 * 
		 * @param speedLeft Use magnitude as maximum left speed (can be negative)
		 * @param speedRight Use magnitude as maximum right speed (can be negative)
		 */
		function useEndEncoder(speedLeft: number, speedRight: number) {
			if (!t.endEncoder) {
				return
			}
			const encoderDifference = {
				left: t.endEncoder.left - t.encoder.left,
				right: t.endEncoder.right - t.encoder.right
			}
			if (Math.abs(encoderDifference.left) < 0.1 && Math.abs(encoderDifference.right) < 0.1) {
				// on end
				t.endEncoder = null
				t.robotBehaviour?.resetCommands()
				t.needsNewCommands = true
			} else {
				t.leftForce = (encoderDifference.left > 0 ? 1 : -1) * Math.abs(speedLeft)
				t.rightForce = (encoderDifference.right > 0 ? 1 : -1) * Math.abs(speedRight)
			}
		}

		const driveData = this.robotBehaviour.drive
		if (driveData) {
			// handle `driveAction` and `curveAction`
			if (driveData.distance && driveData.speed) {
				// on start
				if (!this.endEncoder) {
					this.needsNewCommands = false
					const averageSpeed = 0.5 * (Math.abs(driveData.speed.left) + Math.abs(driveData.speed.right))
					this.endEncoder = {
						left: this.encoder.left + driveData.distance / this.leftDrivingWheel.wheelRadius * driveData.speed.left / averageSpeed,
						right: this.encoder.right + driveData.distance / this.rightDrivingWheel.wheelRadius * driveData.speed.right / averageSpeed
					}
				}
				useEndEncoder(driveData.speed.left, driveData.speed.right)
			}
			if (driveData.speed && driveData.distance == undefined) {
				this.leftForce = driveData.speed.left
				this.rightForce = driveData.speed.right
				this.robotBehaviour.drive = undefined
			}
		}

		const rotateData = this.robotBehaviour.rotate
		if (rotateData) {
			if (rotateData.angle) {
				if (!this.endEncoder) {
					this.needsNewCommands = false
					/** also wheel distance */
					const axleLength = Util.vectorDistance(this.leftDrivingWheel.physicsBody.position, this.rightDrivingWheel.physicsBody.position)
					const wheelDrivingDistance = rotateData.angle * 0.5 * axleLength
					// left rotation for `angle * speed > 0`
					const rotationFactor = Math.sign(rotateData.speed)
					this.endEncoder = {
						left: this.encoder.left - wheelDrivingDistance / this.leftDrivingWheel.wheelRadius * rotationFactor,
						right: this.encoder.right + wheelDrivingDistance / this.rightDrivingWheel.wheelRadius * rotationFactor
					}
				}
				useEndEncoder(rotateData.speed, rotateData.speed)
			} else {
				const rotationSpeed = Math.abs(rotateData.speed)
				if (rotateData.rotateLeft) {
					this.leftForce = -rotationSpeed
					this.rightForce = rotationSpeed
				} else {
					this.leftForce = rotationSpeed
					this.rightForce = -rotationSpeed
				}
				this.robotBehaviour.rotate = undefined
			}
		}

		// update pose
		let motors = this.robotBehaviour.getActionState("motors", true);
		if (motors) {
			const maxForce = true ? 0.01 : MAXPOWER
			let left = motors.c;
			if (left !== undefined) {
				if (left > 100) {
					left = 100;
				} else if (left < -100) {
					left = -100;
				}
				this.leftForce = left * maxForce;
			}
			let right = motors.b;
			if (right !== undefined) {
				if (right > 100) {
					right = 100;
				} else if (right < -100) {
					right = -100;
				}
				this.rightForce = right * maxForce;
			}
		}

		this.leftDrivingWheel.applyTorqueFromMotor(ElectricMotor.EV3(this.scene.unit), this.leftForce)
		this.rightDrivingWheel.applyTorqueFromMotor(ElectricMotor.EV3(this.scene.unit), this.rightForce)

		// this.driveWithWheel(this.physicsWheels.rearLeft, this.leftForce)
		// this.driveWithWheel(this.physicsWheels.rearRight, this.rightForce)

		// this.leftDrivingWheel.applyTorqueFromMotor(ElectricMotor.EV3(), this.leftForce)
		// this.rightDrivingWheel.applyTorqueFromMotor(ElectricMotor.EV3(), this.rightForce)


		const leftWheelVelocity = this.velocityAlongBody(this.leftDrivingWheel.physicsBody)
		const rightWheelVelocity = this.velocityAlongBody(this.rightDrivingWheel.physicsBody)
		this.encoder.left = this.leftDrivingWheel.wheelAngle//leftWheelVelocity * dt;
		this.encoder.right = this.rightDrivingWheel.wheelAngle//rightWheelVelocity * dt;
		let encoder = this.robotBehaviour.getActionState("encoder", true);
		if (encoder) {
			if (encoder.leftReset) {
				this.encoder.left = 0;
			}
			if (encoder.rightReset) {
				this.encoder.right = 0;
			}
		}
		// if (this.frontLeft.bumped && this.left > 0) {
		//     tempLeft *= -1;
		// }
		// if (this.backLeft.bumped && this.left < 0) {
		//     tempLeft *= -1;
		// }
		// if (this.frontRight.bumped && this.right > 0) {
		//     tempRight *= -1;
		// }
		// if (this.backRight.bumped && this.right < 0) {
		//     tempRight *= -1;
		// }
		// if (tempRight == tempLeft) {
		//     var moveXY = tempRight * SIM.getDt();
		//     var mX = Math.cos(this.pose.theta) * moveXY;
		//     var mY = Math.sqrt(Math.pow(moveXY, 2) - Math.pow(mX, 2));
		//     this.pose.x += mX;
		//     if (moveXY >= 0) {
		//         if (this.pose.theta < Math.PI) {
		//             this.pose.y += mY;
		//         } else {
		//             this.pose.y -= mY;
		//         }
		//     } else {
		//         if (this.pose.theta > Math.PI) {
		//             this.pose.y += mY;
		//         } else {
		//             this.pose.y -= mY;
		//         }
		//     }
		//     this.pose.thetaDiff = 0;
		// } else {
		//     var R = C.TRACKWIDTH / 2 * ((tempLeft + tempRight) / (tempLeft - tempRight));
		//     var rot = (tempLeft - tempRight) / C.TRACKWIDTH;
		//     var iccX = this.pose.x - (R * Math.sin(this.pose.theta));
		//     var iccY = this.pose.y + (R * Math.cos(this.pose.theta));
		//     this.pose.x = (Math.cos(rot * SIM.getDt()) * (this.pose.x - iccX) - Math.sin(rot * SIM.getDt()) * (this.pose.y - iccY)) + iccX;
		//     this.pose.y = (Math.sin(rot * SIM.getDt()) * (this.pose.x - iccX) + Math.cos(rot * SIM.getDt()) * (this.pose.y - iccY)) + iccY;
		//     this.pose.thetaDiff = rot * SIM.getDt();
		//     this.pose.theta = this.pose.theta + this.pose.thetaDiff;
		// }
		// var sin = Math.sin(this.pose.theta);
		// var cos = Math.cos(this.pose.theta);
		// this.frontRight = this.translate(sin, cos, this.frontRight);
		// this.frontLeft = this.translate(sin, cos, this.frontLeft);
		// this.backRight = this.translate(sin, cos, this.backRight);
		// this.backLeft = this.translate(sin, cos, this.backLeft);
		// this.backMiddle = this.translate(sin, cos, this.backMiddle);

		// for (var s in this.touchSensor) {
		//     this.touchSensor[s] = this.translate(sin, cos, this.touchSensor[s]);
		// }
		// for (var s in this.colorSensor) {
		//     this.colorSensor[s] = this.translate(sin, cos, this.colorSensor[s]);
		// }
		// for (var s in this.ultraSensor) {
		//     this.ultraSensor[s] = this.translate(sin, cos, this.ultraSensor[s]);
		// }
		// this.mouse = this.translate(sin, cos, this.mouse);

		// for (var s in this.touchSensor) {
		//     this.touchSensor[s].x1 = this.frontRight.rx;
		//     this.touchSensor[s].y1 = this.frontRight.ry;
		//     this.touchSensor[s].x2 = this.frontLeft.rx;
		//     this.touchSensor[s].y2 = this.frontLeft.ry;
		// }

		//update led(s)
		// var led = this.robotBehaviour.getActionState("led", true);
		// if (led) {
		//     var color = led.color;
		//     var mode = led.mode;
		//     if (color) {
		//         this.led.color = color.toUpperCase();
		//         this.led.blinkColor = color.toUpperCase();
		//     }
		//     switch (mode) {
		//         case C.OFF:
		//             this.led.timer = 0;
		//             this.led.blink = 0;
		//             this.led.color = 'LIGHTGRAY';
		//             break;
		//         case C.ON:
		//             this.led.timer = 0;
		//             this.led.blink = 0;
		//             break;
		//         case C.FLASH:
		//             this.led.blink = 2;
		//             break;
		//         case C.DOUBLE_FLASH:
		//             this.led.blink = 4;
		//             break;
		//     }
		// }
		// if (this.led.blink > 0) {
		//     if (this.led.timer > 0.5 && this.led.blink == 2) {
		//         this.led.color = this.led.blinkColor;
		//     } else if (this.led.blink == 4 && (this.led.timer > 0.5 && this.led.timer < 0.67 || this.led.timer > 0.83)) {
		//         this.led.color = this.led.blinkColor;
		//     } else {
		//         this.led.color = 'LIGHTGRAY';
		//     }
		//     this.led.timer += SIM.getDt();
		//     if (this.led.timer > 1.0) {
		//         this.led.timer = 0;
		//     }
		// }
		// $("#led" + this.id).attr("fill", "url('#" + this.led.color + this.id + "')");

		// update display
		// var display = this.robotBehaviour.getActionState("display", true);
		// if (display) {
		//     var text = display.text;
		//     var x = display.x;
		//     var y = display.y;
		//     if (text) {
		//         $("#display" + this.id).html($("#display" + this.id).html() + '<text x=' + x * 10 + ' y=' + (y + 1) * 16 + '>' + text + '</text>');
		//     }
		//     if (display.picture) {
		//         $("#display" + this.id).html(this.display[display.picture]);
		//     }
		//     if (display.clear) {
		//         $("#display" + this.id).html('');
		//     }
		// }

		// update tone
		// var volume = this.robotBehaviour.getActionState("volume", true);
		// if ((volume || volume === 0) && this.webAudio.context) {
		//     this.webAudio.volume = volume / 100.0;
		// }
		// var tone = this.robotBehaviour.getActionState("tone", true);
		// if (tone && this.webAudio.context) {
		//     var cT = this.webAudio.context.currentTime;
		//     if (tone.frequency && tone.duration > 0) {
		//         var oscillator = this.webAudio.context.createOscillator();
		//         oscillator.type = 'square';
		//         oscillator.connect(this.webAudio.context.destination);
		//         var that = this;

		//         function oscillatorFinish() {
		//             that.tone.finished = true;
		//             oscillator.disconnect(that.webAudio.context.destination);
		//             delete oscillator;
		//         }
		//         oscillator.onended = function(e) {
		//             oscillatorFinish();
		//         };
		//         oscillator.frequency.value = tone.frequency;
		//         oscillator.start(cT);
		//         oscillator.stop(cT + tone.duration / 1000.0);
		//     }
		//     if (tone.file !== undefined) {
		//         this.tone.file[tone.file](this.webAudio);
		//     }
		// }

		// update sayText
		// this.sayText.language = GUISTATE_C.getLanguage(); // reset language
		// var language = this.robotBehaviour.getActionState("language", true);
		// if (language !== null && language !== undefined && window.speechSynthesis) {
		//     this.sayText.language = language;
		// }
		// var sayText = this.robotBehaviour.getActionState("sayText", true);
		// if (sayText && window.speechSynthesis) {
		//     if (sayText.text !== undefined) {
		//         this.sayText.say(sayText.text, this.sayText.language, sayText.speed, sayText.pitch);
		//     }
		// }

		// update timer
		// var timer = this.robotBehaviour.getActionState("timer", false);
		// if (timer) {
		//     for (var key in timer) {
		//         if (timer[key] == 'reset') {
		//             this.timer[key] = 0;
		//         }
		//     }
		// }
	};

	addHTMLSensorValuesTo(list: {label: string, value: any}[]) {
		const s = this.scene
		const appendAny = (label: string, value: any) => { list.push({ label: label, value: value }) }
		const append = (label: string, value: number, end?: string) => {
			list.push({ label: label, value: Math.round(value * 1000000)/1000000 + (end ?? "")})
		}

		const sensors = this.robotBehaviour?.getHardwareStateSensors()
		if (sensors == undefined) {
			return
		}
		append("Robot X", this.body.position.x)
		append("Robot Y", this.body.position.y)
		append("Robot θ", this.body.angle * 180 / Math.PI, "°")
		append("Motor left", sensors.encoder?.left ?? 0, "°")
		append("Motor right", sensors.encoder?.right ?? 0, "°")
		for (const port in this.touchSensors) {
			appendAny("Touch Sensor "+port, this.touchSensors[port].getIsTouched())
		}
		for (const port in this.colorSensors) {
			append("Light Sensor "+port, this.colorSensors[port].getDetectedBrightness() * 100, "%")
		}
		for (const port in this.colorSensors) {
			appendAny("Color Sensor "+port, "<span style=\"width: 20px; background-color:" + this.colorSensors[port].getColorHexValueString() + "\">&nbsp;</span>")
		}
		for (const port in this.ultrasonicSensors) {
			append("Ultra Sensor "+port, 100 * s.unit.fromLength(this.ultrasonicSensors[port].getMeasuredDistance()), "cm")
		}
        
	}

	/**
	 * Returns the absolute position relative to `this.body`
	 */
	private getAbsolutePosition(relativePosition: Vector): Vector {
		return Util.vectorAdd(this.body.position, Vector.rotate(relativePosition, this.body.angle))
	}

	private updateRobotBehaviourHardwareStateSensors() {
		if (!this.robotBehaviour) {
			return
		}
		const sensors = this.robotBehaviour.getHardwareStateSensors()
		
		// encoder
		sensors.encoder = {
			left: this.encoder.left,
			right: this.encoder.right
		}
		
		// gyo sensor
		// Note: OpenRoberta has a bug for the gyro.rate where they calculate it by
		// angleDifference * timeDifference but it should be angleDifference / timeDifference
		const gyroRate = this.body.angularVelocity * 180 / Math.PI
		const oldAngle = sensors.gyro?.[2].angle;
		sensors.gyro = { 2: {
			angle: oldAngle ? oldAngle + gyroRate * this.scene.getDT() : this.body.angle * 180 / Math.PI,
			rate: gyroRate
		}}

		const robotBodies = Object.values(this.touchSensors).map(touchSensor => touchSensor.getPhysicsBody())
			.concat(this.physicsWheelsList, this.body)

		// color
		if (!sensors.color) {
			sensors.color = {}
		}
		for (const port in this.colorSensors) {
			const colorSensor = this.colorSensors[port]
			const colorSensorPosition = this.getAbsolutePosition(colorSensor.position)
			// the color array might be of length 4 or 16 (rgba with image size 1x1 or 2x2)
			const color = this.scene.getContainers().getGroundImageData(colorSensorPosition.x, colorSensorPosition.y, 1, 1).data
			colorSensor.setDetectedColor(color[0], color[1], color[2], this.updateSensorGraphics)
			sensors.color[port] = {
				ambientlight: 0,
				colorValue: "none",
				colour: "none",
				light: ((color[0] + color[1] + color[2]) / 3 / 2.55),
				rgb: [color[0], color[1], color[2]]
			}
		}

		const allBodies = this.scene.getAllPhysicsBodies()

		// ultrasonic sensor
		if (!sensors.ultrasonic) {
			sensors.ultrasonic = {}
		}
		if (!sensors.infrared) {
			sensors.infrared = {}
		}
		for (const port in this.ultrasonicSensors) {
			const ultrasonicSensor = this.ultrasonicSensors[port]
			const sensorPosition = this.getAbsolutePosition(ultrasonicSensor.position)
			let ultrasonicDistance: number
			let nearestPoint: Vector | undefined
			if (BodyHelper.someBodyContains(sensorPosition, allBodies, robotBodies)) {
				ultrasonicDistance = 0
			} else {
				const halfAngle = ultrasonicSensor.angularRange / 2
				const rays = [
					Vector.rotate(Vector.create(1, 0), halfAngle + this.body.angle),
					Vector.rotate(Vector.create(1, 0), -halfAngle + this.body.angle)]
					.map(v => new Ray(sensorPosition, v))
				// (point - sensorPos) * vec > 0
				const vectors = rays.map(r => Vector.perp(r.directionVector))
				const dotProducts = vectors.map(v => Vector.dot(v, sensorPosition))
				nearestPoint = BodyHelper.getNearestPointTo(sensorPosition, allBodies, robotBodies, point => {
					return Vector.dot(point, vectors[0]) < dotProducts[0]
						&& Vector.dot(point, vectors[1]) > dotProducts[1]
				})
				let minDistanceSquared = nearestPoint ? Util.vectorDistanceSquared(nearestPoint, sensorPosition) : Infinity
				const intersectionPoints = BodyHelper.intersectionPointsWithLine(rays[0], allBodies, robotBodies).concat(BodyHelper.intersectionPointsWithLine(rays[1], allBodies, robotBodies))
				intersectionPoints.forEach(intersectionPoint => {
					const distanceSquared = Util.vectorDistanceSquared(intersectionPoint, sensorPosition)
					if (distanceSquared < minDistanceSquared) {
						minDistanceSquared = distanceSquared
						nearestPoint = intersectionPoint
					}
				})

				ultrasonicDistance = nearestPoint ? Util.vectorDistance(nearestPoint, sensorPosition) : Infinity
			}
			ultrasonicSensor.setMeasuredDistance(ultrasonicDistance, this.updateSensorGraphics)
			if (this.updateSensorGraphics) {
				// update nearestPoint
				if (nearestPoint != undefined) {
					if (!this.debugGraphics) {
						this.debugGraphics = new PIXI.Graphics()
							.beginFill(0xFF0000)
							.drawRect(-5, -5, 10, 10)
							.endFill()
						this.bodyContainer.parent.addChild(this.debugGraphics)
					}
					this.debugGraphics.position.set(nearestPoint.x, nearestPoint.y)
					this.debugGraphics.visible = ultrasonicDistance <= ultrasonicSensor.maximumMeasurableDistance
				} else if (this.debugGraphics != undefined) {
					this.debugGraphics.visible = false
				}
			}
			ultrasonicDistance = this.scene.unit.fromLength(ultrasonicDistance)
			sensors.ultrasonic[port] = {
				// `distance` is in cm
				distance: Math.min(ultrasonicDistance, ultrasonicSensor.maximumMeasurableDistance) * 100,
				presence: false
			}

			// infrared sensor (use ultrasonic distance)
			sensors.infrared[port] = {
				// `distance` is in cm and at maximum 70cm
				distance: Math.min(ultrasonicDistance, 0.7) * 100,
				presence: false
			}
		}

		// touch sensor
		if (!sensors.touch) {
			sensors.touch = {}
		}
		for (const port in this.touchSensors) {
			const touchSensor = this.touchSensors[port]
			touchSensor.setIsTouched(BodyHelper.bodyIntersectsOther(touchSensor.physicsBody, allBodies))
			sensors.touch[port] = touchSensor.getIsTouched()
		}
	}


	/**
	 * LEGO EV3 like robot with 2 main wheels and one with less friction (e.g. swivel wheel)
	 * 
	 * @param scale scale of the robot
	 */
	static default(scene: Scene, scale: number = 1): Robot {
		const frontWheel = Wheel.create(scene, 27*scale, 0, 10*scale, 10*scale)
		frontWheel.slideFriction = 0.1
		frontWheel.rollingFriction = 0.0
		return new Robot({
			scene: scene,
			body: PhysicsRectEntity.createWithContainer(scene, 0, 0, 40*scale, 30*scale),
			leftDrivingWheel: Wheel.create(scene, -0, -22*scale, 20*scale, 10*scale),
			rightDrivingWheel: Wheel.create(scene, -0, 22*scale, 20*scale, 10*scale),
			otherWheels: [
				frontWheel
			]
		})
	}

	/**
	 * Long robot with 4 wheels
	 */
	static default2(scene: Scene): Robot {
		return new Robot({
			scene: scene,
			body: PhysicsRectEntity.createWithContainer(scene, 0, 0, 40, 30),
			leftDrivingWheel: Wheel.create(scene, -50, -20, 20, 10),
			rightDrivingWheel: Wheel.create(scene, -50, 20, 20, 10),
			otherWheels: [
				Wheel.create(scene, 50, -15, 20, 10),
				Wheel.create(scene, 50,  15, 20, 10)
			]
		})
	}

	// TODO: Use real robot parameters
	/**
	 * Similar to the EV3 LEGO robot
	 * 
	 * Real dimensions:
	 * - brick: (xSize: 0.11m, ySize: 0.072m, mass: 0.268kg)
	 * - wheel: (diameter: 0.043m, width: 0.022m, mass: 0.013kg, rollingFriction: 1.1°, slideFriction: 47.3°)
	 * - motor: (mass: 0.080kg)
	 */
	static EV3(scene: Scene): Robot {
		const wheel = { diameter: 0.05, width: 0.02 }
		// TODO: Constraints are broken, if the front wheel has less mass (front wheel mass may be 0.030)
		const backWheel = Wheel.create(scene, -0.09, 0, wheel.width, wheel.width, 0.30)
		backWheel.slideFriction = 0.05
		backWheel.rollingFriction = 0.03
		const robotBody = PhysicsRectEntity.createWithContainer(scene, 0, 0, 0.15, 0.10,
			{ color: 0xf97306, strokeColor: 0xffffff, strokeWidth: 1, strokeAlpha: 0.5, strokeAlignment: 1 })
		Body.setMass(robotBody.getPhysicsBody(), scene.unit.getMass(0.300))
		const robot = new Robot({
			scene: scene,
			body: robotBody,
			leftDrivingWheel: Wheel.create(scene, 0, -0.07, wheel.diameter, wheel.width, 0.050),
			rightDrivingWheel: Wheel.create(scene, 0,  0.07, wheel.diameter, wheel.width, 0.050),
			otherWheels: [
				backWheel
			]
		})
		robot.addColorSensor("3", 0.06, 0)
		robot.addUltrasonicSensor("4" , new UltrasonicSensor(scene.unit, Vector.create(0.095, 0), 90 * 2 * Math.PI / 360))
		const touchSensorBody = PhysicsRectEntity.create(scene, 0.085, 0, 0.01, 0.12,
			{ color: 0xFF0000, strokeColor: 0xffffff, strokeWidth: 1, strokeAlpha: 0.5, strokeAlignment: 1 })
		Body.setMass(touchSensorBody.getPhysicsBody(), scene.unit.getMass(0.05))
		robot.addTouchSensor("1", new TouchSensor(scene, touchSensorBody))
		return robot
	}
}

/**
 * Damped spring constraint.
 */
class CustomConstraint {

	bodyA: Body
	bodyB: Body

	angleA: number
	angleB: number

	positionA: Vector
	positionB: Vector

	length: number
	angularFrequency: number
	damping: number

	constructor(
		bodyA: Body,
		 bodyB: Body,
		 positionA: Vector,
		 positionB: Vector,
		 options: {
			length?: number,
			angularFrequency?: number,
			damping?: number}) {
		this.bodyA = bodyA
		this.bodyB = bodyB
		this.positionA = positionA
		this.positionB = positionB

		this.angleA = bodyA.angle
		this.angleB = bodyB.angle

		this.length = options.length || 0

		this.angularFrequency = options.angularFrequency || 1
		this.damping = options.damping || 1
	}

	update() {

		const rotatedPositionA = Vector.rotate(this.positionA, this.bodyA.angle - this.angleA)
		const rotatedPositionB = Vector.rotate(this.positionB, this.bodyB.angle - this.angleB)

		/** positionA in world space */
		const pointA = Util.vectorAdd(this.bodyA.position, rotatedPositionA)
		/** positionB in world space */
		const pointB = Util.vectorAdd(this.bodyB.position, rotatedPositionB)

		const relativePosition = Util.vectorSub(pointB, pointA)
		const length = Vector.magnitude(relativePosition)
		const unitRelativePosition = Vector.mult(relativePosition, 1 / (length > 0 ? length : 1e-10))
		const lengthDelta = length - this.length
		
		/** velocity of positionA in world space */
		const velocityA = Util.vectorAdd(this.bodyA.velocity, Vector.mult(Vector.perp(rotatedPositionA), this.bodyA.angularVelocity))
		/** velocity of positionB in world space */
		const velocityB = Util.vectorAdd(this.bodyB.velocity, Vector.mult(Vector.perp(rotatedPositionB), this.bodyB.angularVelocity))

		const relativeVelocity = Util.vectorSub(velocityB, velocityA)
		const velocity = Vector.dot(unitRelativePosition, relativeVelocity)

		// see Wikipedia https://en.wikipedia.org/wiki/Harmonic_oscillator#Damped_harmonic_oscillator
		const acceleration = -this.angularFrequency * (this.angularFrequency * lengthDelta + 2 * this.damping * velocity)

		const accelerationVec = Vector.mult(unitRelativePosition, acceleration)

		const mass = 1 / (this.bodyA.inverseMass + this.bodyB.inverseMass)
		const forceVec = Vector.mult(accelerationVec, mass)
		Body.applyForce(this.bodyA, pointA, Vector.neg(forceVec))
		Body.applyForce(this.bodyB, pointB, forceVec)

	}
}