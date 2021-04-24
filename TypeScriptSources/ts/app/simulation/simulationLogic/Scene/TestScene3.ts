
import { downloadJSONFile } from "../GlobalDebug";
import { Robot } from "../Robot/Robot";
import { RobotProgram } from "../Robot/RobotProgram";
import { RobotTester } from "../Robot/RobotTester";
import { Unit } from "../Unit";
import { asUniqueArray, TupleContains, UniqueTupleElements, UnpackArrayProperties, TupleUnpackArray, Util, Expand } from "../Util";
import { AsyncChain } from "./AsyncChain";
import { Scene } from "./Scene";

function constructProgram(operations: OpCode[][]): RobotProgram {
	return {
		javaScriptConfiguration: {1: "TOUCH", 2: "GYRO", 3: "COLOR", 4: "ULTRASONIC"},
		javaScriptProgram: JSON.stringify({ "ops": Util.flattenArray(operations) }, undefined, "\t")
	}
}

interface OpCode {
	opc: string
	[others: string]: unknown
}

/**
 * @param speed from 0 to 100 (in %)
 * @param distance in meters
 */
function driveForwardProgram(speed: number, distance: number): OpCode[] {
	const uuidExpr1 = Util.genUid()
	const uuidExpr2 = Util.genUid()
	const uuidDriveAction= Util.genUid()
	return [
		{
			"opc": "expr",
			"expr": "NUM_CONST",
			"+": [
				uuidExpr1
			],
			// speed
			"value": speed.toString()
		},
		{
			"opc": "expr",
			"expr": "NUM_CONST",
			"+": [
				uuidExpr2
			],
			"-": [
				uuidExpr1
			],
			// distance
			"value": (distance*100).toString()
		},
		{
			"opc": "DriveAction",
			"speedOnly": false,
			"SetTime": false,
			"name": "ev3",
			"+": [
				uuidDriveAction
			],
			// forward/backward
			"driveDirection": "FOREWARD",
			"-": [
				uuidExpr2
			]
		},
		{
			"opc": "stopDrive",
			"name": "ev3"
		},
		{
			"opc": "stop",
			"-": [
				uuidDriveAction
			]
		}
	]
}

class KeyData {
	// (0.05, 0.5, 0.05)
	rollingFriction = Util.range(0.1, 0.1, 0.01)
	// (0.05, 1.0, 0.05)
	slideFriction = Util.range(0.3, 0.3, 0.01)

	otherRollingFriction = Util.range(0.03, 0.03, 0.01)
	otherSlideFriction = Util.range(0.05, 0.05, 0.01)

	driveForwardSpeed = Util.range(10, 100, 10)
	driveForwardDistance = Util.range(0.1, 1.0, 0.1)
}

type SubKeyData = Expand<UnpackArrayProperties<KeyData>>

export class TestScene3 extends Scene {

	robot: Robot
	robotTester: RobotTester

	time = 0.0

	/**
	 * A timeout for this simulation test in internal simulation time
	 */
	simulationTestTimeout = 20.0

	/**
	 * Time since start of test in sections
	 */
	startWallTime = 0.0

	endPositionAccuracy = Infinity
	initialPosition = { x: 0.0, y: 0.0 }
	prevRobotPosition = { x: 0.0, y: 0.0 }

	data: any[] = []

	keyIndex = 0


	keyData = new KeyData()
	keyValues: SubKeyData[] = []


	testTime: number = 0


	constructor() {
		super("Test Scene 3")

		this.autostartSim = false

		this.robot = Robot.EV3(this)
		this.robotTester = new RobotTester(this.robot)
		
		// set poll sim ticker time to 0
		// TODO: Maybe set it always to 0 and remove timeout argument for `Timer.asyncStop`
		this.setSimTickerStopPollTime(0)

		this.keyValues = Util.allPropertiesTuples(this.keyData)


		const DebugGui = this.getDebugGuiStatic()

		DebugGui?.addButton("Download data", () => downloadJSONFile("data.json", this.data))

		DebugGui?.addButton("Speeeeeed!!!!!", () => this.setSpeedUpFactor(1000))
		DebugGui?.addUpdatable("progress", () => this.keyIndex + "/" + this.keyValues.length)
		DebugGui?.addUpdatable("ETA", () => Util.toTimeString(this.testTime/this.keyIndex*(this.keyValues.length - this.keyIndex)))
		DebugGui?.addUpdatable("test timing", () => String(this.testTime))

		DebugGui?.addButton("Reset", () =>  {
			this.resetData()
			this.autostartSim = false
			this.reset()
		})
		DebugGui?.addButton("Restart", () =>  {
			this.resetData()
			this.autostartSim = true
			this.reset()
		})

	}

	getUnitConverter(): Unit {
		return new Unit({ m: 1000 })
	}

	resetData() {
		this.shouldWait = true
		this.keyIndex = 0
		this.data = []
	}

	shouldWait = false

	onInit(asyncChain: AsyncChain) {

		this.shouldWait = false

		this.testTime = Date.now()/1000 - this.startWallTime

		if (this.keyIndex == 0) {
			this.startWallTime = Date.now()/1000
		}
		
		
		this.time = 0.0

		this.robot = Robot.EV3(this)
		this.robotTester = new RobotTester(this.robot)
		this.robot.setPose(this.initialPosition, 0)
		this.addRobot(this.robot)

		// start program
		if (this.keyIndex < this.keyValues.length) {

			const tuple = this.keyValues[this.keyIndex]
			this.robotTester.setWheelsFriction({
				driveWheels: {
					rollingFriction: tuple.rollingFriction,
					slideFriction: tuple.slideFriction
				},
				otherWheels: {
					rollingFriction: tuple.otherRollingFriction,
					slideFriction: tuple.otherSlideFriction
				}
			})

			// run(false, undefined)
			const program = true ? 
				[
					constructProgram([
						driveForwardProgram(tuple.driveForwardSpeed, tuple.driveForwardDistance)
					])
				] : Util.simulation.storedPrograms
			this.getProgramManager().setPrograms(program, true, undefined)
			this.getProgramManager().startProgram()
		}

		asyncChain.next()
	}

	pushDataAndResetWithTimeout(didTimeOut: boolean) {
		this.data.push({
			key: this.keyValues[this.keyIndex],
			value: this.unit.fromLength(Util.vectorDistance(this.initialPosition, this.prevRobotPosition)),
			didTimeOut: didTimeOut,
			simulationTime: this.time
		})
		
		// reset scene and automatically call 'onInit'
		this.keyIndex += 1
		this.autostartSim = this.keyIndex < this.keyValues.length
		this.reset()
		this.shouldWait = true
	}

	onUpdatePostPhysics() {

		if (this.shouldWait) {
			return
		}

		this.time += this.getDT()
		if (this.keyIndex < this.keyValues.length) {
			// there is still some 'keyValue' left

			if (this.time > this.simulationTestTimeout) {
				// timeout
				this.pushDataAndResetWithTimeout(true)
			}
			if (this.getProgramManager().allInterpretersTerminated()) {
				// program terminated
				if (Util.vectorDistance(this.robot.body.position, this.prevRobotPosition) < this.endPositionAccuracy) {
					// program terminated and robot does not move
					this.pushDataAndResetWithTimeout(false)
				}
			}
		}
		this.prevRobotPosition.x = this.robot.body.position.x
		this.prevRobotPosition.y = this.robot.body.position.y

	}

}