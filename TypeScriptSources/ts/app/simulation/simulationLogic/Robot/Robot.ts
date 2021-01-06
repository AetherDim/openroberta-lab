import { Body, Vector, Composite } from 'matter-js'
import { createRect } from '../Displayable'
import { ElectricMotor } from './ElectricMotor'

import "../ExtendedMatter"
import { MAXPOWER } from '../interpreter.constants'
import { Interpreter } from '../interpreter.interpreter'
import { RobotSimBehaviour } from './RobotSimBehaviour'
import { Unit } from '../Unit'
import { Wheel } from './Wheel'
import { ColorSensor } from './ColorSensor'

export class Robot {

	/**
	 * The full robot physics object
	 */
	physicsComposite: Composite

	/**
	 * The body of the robot as `Body`s
	 */
	body: Body
	private bodyContainer: PIXI.Container

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

	/**
	 * Key is the port and the value is the detected color
	 */
	private colorSensor?: ColorSensor = null
	private colorSensorGraphics?: PIXI.Graphics = null

	robotBehaviour?: RobotSimBehaviour = null;

	configuration: any = null;
	programCode: any = null;

    interpreter: Interpreter = null;
    
    /**
     * robot type
     */
    private type: string = 'default';


    setRobotType(type:string) {
        this.type = type;
        // TODO: change things
    }


	constructor(robot: {body: Body, leftDrivingWheel: Wheel, rightDrivingWheel: Wheel, otherWheels: Wheel[]}) {
		this.body = robot.body
		this.leftDrivingWheel = robot.leftDrivingWheel
		this.rightDrivingWheel = robot.rightDrivingWheel
		this.wheelsList = [this.leftDrivingWheel, this.rightDrivingWheel].concat(robot.otherWheels)

		// FIXME: Workaround. Change body display object to a container
		const bodyDisplayObject = this.body.displayable.displayObject
		this.bodyContainer = new PIXI.Container()
		this.bodyContainer.position = bodyDisplayObject.position.clone()
		bodyDisplayObject.position.set(0, 0)
		this.bodyContainer.addChild(bodyDisplayObject)
		this.body.displayable.displayObject = this.bodyContainer

		this.updatePhysicsObject()
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
			//     Vector.sub(wheel.position, this.body.position), Vector.create(), {
			//         angularFrequency: 2 * Math.PI * 0.6,
			//         damping: 1.0,
			//         length: 0//Vector.magnitude(Vector.sub(this.body.position, wheel.position))
			//     })
			// const constraint2 = new CustomConstraint(
			//     this.body, wheel,
			//     Vector.create(), Vector.sub(this.body.position, wheel.position), {
			//         angularFrequency: 2 * Math.PI * 0.6,
			//         damping: 1.0,
			//         length: 0//Vector.magnitude(Vector.sub(this.body.position, wheel.position))
			//     })
			
			// this.customConstraints.push(constraint1)
			// this.customConstraints.push(constraint2)
			this.physicsComposite.addRigidBodyConstraints(this.body, wheel, 0.1, 0.1)
		});

		this.body.frictionAir = 0.0;
	}

	/**
	 * Returns the color sensor which can be `null`
	 */
	getColorSensor?(): ColorSensor {
		return this.colorSensor
	}

	/**
	 * Sets the color sensor at the position (x,y) in meter
	 * @param x x position in meter
	 * @param y y position in meter
	 */
	setColorSensor(x: number, y: number) {
		if (this.colorSensorGraphics) {
			this.colorSensorGraphics.parent.removeChild(this.colorSensorGraphics)
			this.colorSensorGraphics.destroy()
		}
		this.colorSensorGraphics = new PIXI.Graphics()
			.lineStyle(2)
			.drawRect(-10, -10, 20, 20)
		const [xPos, yPos] = Unit.getLengths([x, y])
		this.colorSensorGraphics.position.set(xPos, yPos)
		this.bodyContainer.addChild(this.colorSensorGraphics)
		this.colorSensor = new ColorSensor(Vector.create(xPos, yPos))
	}
	
	/**
	 * Sets the color of the color sensor and `colorSensorGraphics` if they are not null.
	 * 
	 * @param r red color [0, 255]
	 * @param g green color [0, 255]
	 * @param b blue color [0, 255]
	 */
	private setColorOfSensorColor(r: number, g: number, b: number) {
		if (this.colorSensorGraphics && this.colorSensor) {
			this.colorSensorGraphics
				.clear()
				.beginFill((r * 256 + g) * 256 + b)
				.lineStyle(3, 0) // black border
				.drawCircle(0, 0, 6)
				.endFill
			this.colorSensor.detectedColor = { red: r, green: g, blue: b }
		}
	}

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

	leftForce = 0
	rightForce = 0

	encoder = {
		left: 0,
		right: 0
	};

	setProgram(program: any, breakpoints: any[]): Interpreter {
		const _this = this;
		this.programCode = JSON.parse(program.javaScriptProgram);
		this.configuration = program.javaScriptConfiguration
		this.robotBehaviour = new RobotSimBehaviour();
		this.interpreter = new Interpreter(this.programCode, this.robotBehaviour, () => {
			_this.programTerminated();
		}, breakpoints);
        this.resetVariables()
        
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
		const velocityOrthBody = Vector.sub(wheel.velocity, velocityAlongBody)
		const velocityChange = Vector.add(
			Vector.mult(velocityAlongBody, -this.wheelDriveFriction),
			Vector.mult(velocityOrthBody, -this.wheelSlideFriction))


		// divide two times by `dt` since the simulation calculates velocity changes by adding
		// force/mass * dt
		Body.applyForce(wheel, wheel.position, Vector.mult(velocityChange, wheel.mass / dt))
	}

	private needsNewCommands = true
	private endEncoder?: { left: number, right: number } = null

	private resetVariables() {
		this.needsNewCommands = true
		this.endEncoder = null
	}

	reset() {
		
	}

	/**
	 * 
	 * @param dt time step of the matter.js simulation
	 * @param programPaused is program paused
	 * @param getImageData get the image data of the ground layer
	 */
	update(dt: number, programPaused: boolean, getImageData: (x: number, y: number, w: number, h: number) => ImageData) {

		// update wheels velocities
		const gravitationalAcceleration = Unit.getAcceleration(9.81)
		const robotBodyGravitationalForce = gravitationalAcceleration * this.body.mass / this.wheelsList.length
		this.wheelsList.forEach(wheel => {
			wheel.applyNormalForce(robotBodyGravitationalForce + wheel.physicsBody.mass * gravitationalAcceleration)
			wheel.update(dt)
		})

		if(!this.robotBehaviour || !this.interpreter) {
			return;
		}

		// update sensors
		this.updateRobotBehaviourHardwareStateSensors(getImageData)

		if(!programPaused && !this.interpreter.isTerminated() && this.needsNewCommands) {
			const delay = this.interpreter.runNOperations(1000) / 1000;
		}

		let speed = { left: 0, right: 0 }

		const t = this
		/**
		 * Uses `encoder` to reach the values of `endEncoder` by setting the appropriate values
		 * 
		 * @param speedLeft Use magnitude as maximum left speed (can be negative)
		 * @param speedRight Use magnitude as maximum right speed (can be negative)
		 */
		function useEndEncoder(speedLeft: number, speedRight: number) {
			const encoderDifference = {
				left: t.endEncoder.left - t.encoder.left,
				right: t.endEncoder.right - t.encoder.right
			}
			if (Math.abs(encoderDifference.left) < 0.1 && Math.abs(encoderDifference.right) < 0.1) {
				// on end
				t.endEncoder = null
				t.robotBehaviour.resetCommands()
				t.needsNewCommands = true
			} else {
				speed.left = (encoderDifference.left > 0 ? 1 : -1) * Math.abs(speedLeft)
				speed.right = (encoderDifference.right > 0 ? 1 : -1) * Math.abs(speedRight)
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
			if (driveData.speed && !driveData.distance && !driveData.distance) {
				speed.left = driveData.speed.left
				speed.right = driveData.speed.right
				this.robotBehaviour.drive = null
			}
		}

		const rotateData = this.robotBehaviour.rotate
		if (rotateData) {
			if (rotateData.angle) {
				if (!this.endEncoder) {
					this.needsNewCommands = false
					/** also wheel distance */
					const axleLength = Vector.magnitude(Vector.sub(this.leftDrivingWheel.physicsBody.position, this.rightDrivingWheel.physicsBody.position))
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
					speed.left = -rotationSpeed
					speed.right = rotationSpeed
				} else {
					speed.left = rotationSpeed
					speed.right = -rotationSpeed
				}
				this.robotBehaviour.rotate = null
			}
		}

		this.leftDrivingWheel.applyTorqueFromMotor(ElectricMotor.EV3(), speed.left)
		this.rightDrivingWheel.applyTorqueFromMotor(ElectricMotor.EV3(), speed.right)

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

	private getColorSensorPosition(colorSensor: ColorSensor): Vector {
		return Vector.add(this.body.position, Vector.rotate(colorSensor.position, this.body.angle))
	}

	private updateRobotBehaviourHardwareStateSensors(getImageData: (x: number, y: number, w: number, h: number) => ImageData) {
		const sensors = this.robotBehaviour.getHardwareStateSensors()
		
		// encoder
		sensors.encoder = {
			left: this.encoder.left,
			right: this.encoder.right
		}
		
		// gyo sensor
		sensors.gyro = { 2: {
			angle: this.body.angle * 180 / Math.PI,
			rate: this.body.angularVelocity
		}}

		// color
		if (this.colorSensor) {
			const colorSensorPosition = this.getColorSensorPosition(this.colorSensor)
			// the color array might be of length 4 or 16 (rgba with image size 1x1 or 2x2)
			const color = getImageData(colorSensorPosition.x, colorSensorPosition.y, 1, 1).data
			this.setColorOfSensorColor(color[0], color[1], color[2])
			sensors.color = { 3: {
				ambientlight: 0,
				colorValue: "none",
				colour: "none",
				light: ((color[0] + color[1] + color[2]) / 3 / 2.55),
				rgb: [color[0], color[1], color[2]]
			}}
		}

		// TODO: Implement ultrasonic sensor
		// ultrasonic sensor
		let ultrasonicDistance = Infinity
		ultrasonicDistance = Math.min(ultrasonicDistance / 3.0, 255)
		sensors.ultrasonic = { 4: {
			distance: ultrasonicDistance,
			presence: false
		}}

		// infrared sensor (use ultrasonic distance)
		sensors.infrared = { 4: {
			distance: Math.min(ultrasonicDistance / 70 * 100, 100),
			presence: false
		}}
	}


	/**
	 * LEGO EV3 like robot with 2 main wheels and one with less friction (e.g. swivel wheel)
	 * 
	 * @param scale scale of the robot
	 */
	static default(scale: number = 1): Robot {
		const frontWheel = new Wheel(27*scale, 0, 10*scale, 10*scale)
		frontWheel.slideFriction = 0.1
		frontWheel.rollingFriction = 0.0
		return new Robot({
			body: createRect(0, 0, 40*scale, 30*scale),
			leftDrivingWheel: new Wheel(-0, -22*scale, 20*scale, 10*scale),
			rightDrivingWheel: new Wheel(-0, 22*scale, 20*scale, 10*scale),
			otherWheels: [
				frontWheel
			]
		})
	}

	/**
	 * Long robot with 4 wheels
	 */
	static default2(): Robot {
		return new Robot({
			body: createRect(0, 0, 40, 30),
			leftDrivingWheel: new Wheel(-50, -20, 20, 10),
			rightDrivingWheel: new Wheel(-50, 20, 20, 10),
			otherWheels: [
				new Wheel(50, -15, 20, 10),
				new Wheel(50,  15, 20, 10)
			]
		})
	}

	/**
	 * Similar to the EV3 LEGO robot
	 */
	static EV3(): Robot {
		const wheel = { diameter: 0.05, width: 0.02 }
		// TODO: Constraints are broken, if the front wheel has less mass (front wheel mass may be 0.030)
		const backWheel = new Wheel(-0.09, 0, wheel.width, wheel.width, 0.30)
		backWheel.slideFriction = 0.05
		backWheel.rollingFriction = 0.03
		const robotBody = createRect(0, 0, 0.15, 0.10)
		Body.setMass(robotBody, Unit.getMass(0.300))
		const robot = new Robot({
			body: robotBody,
			leftDrivingWheel: new Wheel(0, -0.07, wheel.diameter, wheel.width, 0.050),
			rightDrivingWheel: new Wheel(0,  0.07, wheel.diameter, wheel.width, 0.050),
			otherWheels: [
				backWheel
			]
		})
		robot.setColorSensor(0.08, 0)
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
		const pointA = Vector.add(this.bodyA.position, rotatedPositionA)
		/** positionB in world space */
		const pointB = Vector.add(this.bodyB.position, rotatedPositionB)

		const relativePosition = Vector.sub(pointB, pointA)
		const length = Vector.magnitude(relativePosition)
		const unitRelativePosition = Vector.mult(relativePosition, 1 / (length > 0 ? length : 1e-10))
		const lengthDelta = length - this.length
		
		/** velocity of positionA in world space */
		const velocityA = Vector.add(this.bodyA.velocity, Vector.mult(Vector.perp(rotatedPositionA), this.bodyA.angularVelocity))
		/** velocity of positionB in world space */
		const velocityB = Vector.add(this.bodyB.velocity, Vector.mult(Vector.perp(rotatedPositionB), this.bodyB.angularVelocity))

		const relativeVelocity = Vector.sub(velocityB, velocityA)
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