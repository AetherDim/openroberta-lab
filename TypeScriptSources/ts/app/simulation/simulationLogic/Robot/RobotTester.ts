import { Robot } from "./Robot";
import { Wheel } from "./Wheel";

type WheelFriction = { rollingFriction: number , slideFriction: number }

export class RobotTester {

	robot: Robot

	constructor(robot: Robot) {
		this.robot = robot
	}

	private setWheelFriction(wheel: Wheel, friction: WheelFriction) {
		wheel.rollingFriction = friction.rollingFriction
		wheel.slideFriction = friction.slideFriction
	}

	setWheelsFriction(options: { driveWheels: WheelFriction, otherWheels: WheelFriction}) {
		this.setWheelFriction(this.robot.leftDrivingWheel, options.driveWheels)
		this.setWheelFriction(this.robot.rightDrivingWheel, options.driveWheels)

		const t = this
		this.robot.wheelsList.forEach(wheel => {
			if (wheel !== this.robot.leftDrivingWheel && wheel !== this.robot.rightDrivingWheel) {
				this.setWheelFriction(wheel, options.otherWheels)
			}
		})

	}

}