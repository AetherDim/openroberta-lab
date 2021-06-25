
import { Vector } from "matter-js";
import { downloadJSONFile } from "../GlobalDebug";
import { Robot } from "../Robot/Robot";
import { RobotProgram } from "../Robot/RobotProgram";
import { RobotProgramGenerator } from "../Robot/RobotProgramGenerator";
import { RobotSetupData } from "../Robot/RobotSetupData";
import { RobotTester } from "../Robot/RobotTester";
import { Unit } from "../Unit";
import { UnpackArrayProperties, Util, Expand } from "../Util";
import { AsyncChain } from "./AsyncChain";
import { Scene } from "./Scene";






class KeyData {

	usePseudoPhysics = [true]

	// (0.05, 0.5, 0.05)
	rollingFriction = Util.closedRange(0.03, 0.03, 0.1)
	// (0.05, 1.0, 0.05)
	slideFriction = Util.closedRange(0.3, 0.3, 0.1)

	otherRollingFriction = Util.closedRange(0.03, 0.03, 0.01)
	otherSlideFriction = Util.closedRange(0.05, 0.05, 0.01)

	programType: ("driveForward" | "rotate")[] = ["driveForward"]

	driveForwardSpeed = true ? [100] : Util.range(60, 100, 1)
	driveForwardDistance = true ? [1] : Util.range(0, 2.0, 0.04)
	rotateSpeed = true ? [100] : Util.closedRange(1, 100, 1)
	rotateAngle = true ? [360] : Util.closedRange(0, 360, 10)
	directionRight = [true]

	maxForceControlEncoderDifference = Util.closedRange(0, 5, 0.2)
	encoderAngleDampingFactor = Util.closedRange(0, 40, 2)
	pseudoMotorTorqueMultiplier = Util.closedRange(1, 20, 2)

	pseudoRollingFriction = [2.0]
	pseudoSlideFriction = [2.0]

	otherPseudoRollingFriction = [2.0]
	otherPseudoSlideFriction = [2.0]
}

class ValueHelper<T, C> {

	readonly name: string
	readonly initialValue: T
	private previousValue: T
	readonly endMaxDelta: number
	private readonly context: C
	private readonly _getNewValue: (context: C) => T
	private readonly getSignedDistance: (start: T, end: T) => number

	/**
	 * @param getSignedDistance a function which returns the signed distance from `start` to `end`. E.g. for numbers `end - start` and for points the norm distance.
	 */
	private constructor(name: string, initialValue: T, endMaxDelta: number, context: C, getNewValue: (context: C) => T, getSignedDistance: (start: T, end: T) => number) {
		this.name = name
		this.initialValue = initialValue
		this.previousValue = initialValue
		this.endMaxDelta = endMaxDelta
		this.context = context
		this.getSignedDistance = getSignedDistance
		this._getNewValue = getNewValue
	}

	getPreviousValue(): T {
		return this.previousValue
	}

	update() {
		this.previousValue = this._getNewValue(this.context)
	}

	getNewValue(): T {
		return this._getNewValue(this.context)
	}

	/**
	 * @returns the absolute distance between the current value (`getNewValue`) and the `previousValue`
	 */
	getDistanceToPreviousValue(): number {
		return Math.abs(this.getSignedDistance(this.previousValue, this._getNewValue(this.context)))
	}

	getSignedDistanceToInitialValue(): number {
		return this.getSignedDistance(this.initialValue, this._getNewValue(this.context))
	}

	withMappedSignedDistance(toNewSignedDistance: (distance: number) => number) {
		const getSignedDistance = this.getSignedDistance
		return new ValueHelper(
			this.name,
			this.initialValue,
			toNewSignedDistance(this.endMaxDelta),
			this.context,
			this._getNewValue,
			(v1, v2) => toNewSignedDistance(getSignedDistance(v1, v2))
		)
	}

	static fromNumber<C>(opt: { name: string, initialValue: number, endMaxDelta: number, context: C, getNewValue: (context: C) => number }): ValueHelper<number, C> {
		return new ValueHelper(opt.name, opt.initialValue, opt.endMaxDelta, opt.context, opt.getNewValue, (start, end) => end - start)
	}

	static fromVector<C>(opt: { name: string, initialValue: Vector, endMaxDelta: number, context: C, getNewValue: (context: C) => Vector }): ValueHelper<Vector, C> {
		return new ValueHelper(opt.name, opt.initialValue, opt.endMaxDelta, opt.context, opt.getNewValue, (v1, v2) => Util.vectorDistance(v1, v2))
	}

}

type SubKeyData = Expand<UnpackArrayProperties<KeyData>>

export class TestScene3 extends Scene {

	robot: Robot
	robotTester: RobotTester

	time = 0.0

	/**
	 * A timeout for this simulation test in internal simulation time
	 */
	simulationTestTimeout = 50.0

	/**
	 * Time since start of test in sections
	 */
	startWallTime = 0.0

	readonly constUnit = this.getUnitConverter()

	readonly robotPositionValue =
		ValueHelper.fromVector({
			name: "initPositionDistance",
			initialValue: {x: 0.0, y: 0.0},
			endMaxDelta: Infinity,
			context: this,
			getNewValue: (c) => c.robot.body.position
		}).withMappedSignedDistance(distance => this.constUnit.fromLength(distance))

	readonly robotRotationValue = 
		ValueHelper.fromNumber({
			name: "initAngleDelta",
			initialValue: 0,
			endMaxDelta: Infinity,
			context: this,
			getNewValue: (c) => c.robot.body.angle
		}).withMappedSignedDistance(angle => Util.toDegrees(angle))


	/**
	 * The array of `ValueHelper`s. Note that `initialValue` has to be set in `onInit` 
	 */
	valueHelpers = [this.robotPositionValue, this.robotRotationValue]

	data: unknown[] = []

	keyIndex = 0


	/**
	 * Shuffling the keyValues can improve the ETA
	 */
	randomizeKeyValues = true
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

		// make tuples from 'keyData' and maybe shuffle them in order to get a better ETA
		this.keyValues = Util.allPropertiesTuples(this.keyData)
		if (this.randomizeKeyValues) {
			Util.shuffle(this.keyValues)
		}

		const DebugGui = this.getDebugGuiStatic()

		DebugGui?.addButton("Download data", () => downloadJSONFile("data.json", this.data))

		DebugGui?.addUpdatable("progress", () => this.keyIndex + "/" + this.keyValues.length)
		DebugGui?.addUpdatable("ETA", () => Util.toTimeString(this.testTime/this.keyIndex*(this.keyValues.length - this.keyIndex)))
		DebugGui?.addUpdatable("test timing", () => String(this.testTime))

		DebugGui?.addButton("Reset", () =>  {
			this.resetData()
			this.autostartSim = false
			this.reset([])
		})
		DebugGui?.addButton("Restart", () =>  {
			this.resetData()
			this.autostartSim = true
			this.reset([])
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

		this.getRobotManager().configurationManager.setRobotConfigurations([
			{ 1: "TOUCH" }
		])

		this.shouldWait = false

		this.testTime = Date.now()/1000 - this.startWallTime

		if (this.keyIndex == 0) {
			this.startWallTime = Date.now()/1000
		}
		
		
		this.time = 0.0

		this.robot = Robot.EV3(this)
		this.robotTester = new RobotTester(this.robot)
		this.robot.setPose(
			this.robotPositionValue.initialValue,
			this.robotRotationValue.initialValue)
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
			this.robotTester.setWheelsPseudoPhysicsParameters({
				driveWheels: {
					rollingFriction: tuple.pseudoRollingFriction,
					slideFriction: tuple.pseudoSlideFriction
				},
				otherWheels: {
					rollingFriction: tuple.otherPseudoRollingFriction,
					slideFriction: tuple.otherPseudoSlideFriction
				}
			})
			if (tuple.usePseudoPhysics) {
				this.robot.calibrationParameters = {
					rotationAngleFactor: 1,
					driveForwardDistanceFactor: 1
				}
			} else {
				this.robot.calibrationParameters = Robot.realPhysicsCalibrationParameters
			}
			this.robot.pseudoMotorTorqueMultiplier = tuple.pseudoMotorTorqueMultiplier
			this.robot.endEncoderSettings.maxForceControlEncoderDifference = tuple.maxForceControlEncoderDifference
			this.robot.endEncoderSettings.encoderAngleDampingFactor = tuple.encoderAngleDampingFactor

			const programs: RobotProgram[] =
				[
					RobotProgramGenerator.generateProgram([
						tuple.programType == "driveForward"
							? RobotProgramGenerator.driveForwardOpCodes(tuple.driveForwardSpeed, tuple.driveForwardDistance)
							: RobotProgramGenerator.rotateOpCodes(tuple.rotateSpeed, tuple.rotateAngle, tuple.directionRight)
					])
				]
			this.getProgramManager().setPrograms(programs)
			this.getProgramManager().startProgram()
		}

		asyncChain.next()
	}

	pushDataAndResetWithTimeout(didTimeOut: boolean) {
		const value: any = {
			key: this.keyValues[this.keyIndex]
		}
		this.valueHelpers.forEach(keyValue => {
			value[keyValue.name] = keyValue.getSignedDistanceToInitialValue()
		})
		value.didTimeOut = didTimeOut,
		value.simulationTime = this.time
		this.data.push(value)
		
		// reset scene and automatically call 'onInit'
		this.keyIndex += 1
		this.autostartSim = this.keyIndex < this.keyValues.length
		this.reset([])
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
				let finished = true
				this.valueHelpers.forEach(keyValue => {
					if (finished && keyValue.getDistanceToPreviousValue() > keyValue.endMaxDelta) {
						finished = false
					}
				})
				if (finished) {
					// program terminated and robot does not move
					this.pushDataAndResetWithTimeout(false)
				}
			}
		}
		this.valueHelpers.forEach(e => e.update())

	}

}