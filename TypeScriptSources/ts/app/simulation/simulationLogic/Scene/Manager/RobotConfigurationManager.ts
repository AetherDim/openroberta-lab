import { Body, Vector } from "matter-js";
import { PhysicsRectEntity } from "../../Entity";
import { Scene } from "../Scene";
import { NumberIndexed, StringMap, Util } from "../../Util";
import { Robot, SensorType } from "../../Robot/Robot";
import { TouchSensor } from "../../Robot/Sensors/TouchSensor";
import { UltrasonicSensor } from "../../Robot/Sensors/UltrasonicSensor";
import { GyroSensor } from "../../Robot/Sensors/GyroSensor";
import { RobotConfiguration } from "../../Robot/RobotConfiguration";
import "../../pixijs"
import { ColorSensor } from "../../Robot/Sensors/ColorSensor";

class MaxSensorCount {
	readonly maxCount: number
	readonly length: number

	constructor(maxCount: number) {
		this.maxCount = maxCount
		this.length = maxCount
	}
}

/**
 * The configuration mapping of the robot.
 * 
 * All angles are in degrees.
 * 
 * The 2D arrays return `array[sensorCount][sensorIndex]` which is a sensor configuration
 */
type RobotSensorConfiguration = {
	TOUCH: {x: number, y: number, width: number, height: number, angle: number, mass: number}[][]
	GYRO: undefined[],
	COLOR: {x: number, y: number, graphicsRadius: number}[][]
	ULTRASONIC: {x: number, y: number, angle: number, angularRange: number, portTextDirection?: "againstDriveDirection" }[][]
	INFRARED: {x: number, y: number, angle: number}[][]
	SOUND: undefined[]
	COMPASS: undefined[]
	// the following hw specific sensors are never used in this simulation
	IRSEEKER?: undefined
	HT_COLOR?: undefined
}

/**
 * Mapping from `SensorType` to a port array `string[]`
 */
type SensorPortMap = Map<SensorType, string[]>

type SensorConfiguration<K extends SensorType> = NumberIndexed<NumberIndexed<RobotSensorConfiguration[K]>>

export class RobotConfigurationManager {
	
	private static readonly colorSensorRadius = 0.01
	private static readonly colorSensorOffset = 0.012 * 2
	private static readonly ultrasonicSensorOffset = 0.02

	private robots: Robot[]
	private robotConfigurations: RobotConfiguration[] = [] 

	constructor(robots: Robot[]) {
		this.robots = robots
	}


	
	private static robotConfiguration: RobotSensorConfiguration = {
		TOUCH: [
			[{x: 0.085, y: 0, width: 0.01, height: 0.12, angle: 0, mass: 0.05}]
		],
		COLOR:
			// vertically centered colorsensors at the front of the robot
			Util.closedRange(0, 3).map(count => 
				Util.closedRange(0, count).map(index => {
					return {
						x: 0.06, y: (index - count / 2) * RobotConfigurationManager.colorSensorOffset, 
						graphicsRadius: RobotConfigurationManager.colorSensorRadius
					}
				})
			),
		ULTRASONIC:
		(() => {
			const o = RobotConfigurationManager.ultrasonicSensorOffset
			/** helper function to help the type inference */
			const h = (c: SensorConfiguration<"ULTRASONIC">) => c
			return [
				[{x: 0.095, y: 0, angle: 0, angularRange: 90 }],
				[
					{x: 0.095, y: o / 2, angle: 20, angularRange: 60},
					{x: 0.095, y: -o / 2, angle: -20, angularRange: 60}
				],
				[
					{x: 0.095, y: o, angle: 40, angularRange: 60},
					{x: 0.095, y: 0, angle: 0, angularRange: 60},
					{x: 0.095, y: -o, angle: -40, angularRange: 60}
				],
				[
					{x: 0.095, y: 0.04, angle: 45, angularRange: 60},
					{x: 0.095, y: -0.04, angle: -45, angularRange: 60},
					h({x: -0.095, y: 0.04, angle: 45 + 90, angularRange: 60, portTextDirection: "againstDriveDirection"}),
					h({x: -0.095, y: -0.04, angle: -45 - 90, angularRange: 60, portTextDirection: "againstDriveDirection"})
				]
			]
		})(),
		INFRARED: [],
		GYRO: new Array(4),
		SOUND: new Array(4),
		COMPASS: new Array(4),
		
	}



	private static getMaxNumberOfSensors(portMap: SensorPortMap, sensor: SensorType) {
		const length = portMap.get(sensor)?.length ?? 0
		const sensorConfiguration = this.robotConfiguration[sensor]
		return Math.min(length, sensorConfiguration?.length ?? 0)
	}

	private static addColorSensor(robot: Robot, port: string, scene: Scene, configuration: SensorConfiguration<"COLOR">) {
		const colorSensor = new ColorSensor(scene.unit, { x: configuration.x, y: configuration.y }, configuration.graphicsRadius)
		const portText = new PIXI.Text(port, new PIXI.TextStyle({
			fill: "0x555555"
		}))
		portText.position.set(scene.unit.getLength(-0.015), 0)
		portText.anchor.set(1, 0.5)
		portText.scale.set(scene.unit.getLength(1 / portText.style.fontSize / 50))
		colorSensor.graphics.addChild(portText)
		robot.addColorSensor(port, colorSensor)
	}

	private static addTouchSensor(robot: Robot, port: string, scene: Scene, configuration: SensorConfiguration<"TOUCH">) {
		const touchSensorBody = PhysicsRectEntity.create(scene, 
			configuration.x, configuration.y, configuration.width, configuration.height,
			{ color: 0xFF0000, strokeColor: 0xffffff, strokeWidth: 1, strokeAlpha: 0.5, strokeAlignment: 1 })
		Body.setMass(touchSensorBody.getPhysicsBody(), scene.unit.getMass(configuration.mass))
		Body.rotate(touchSensorBody.getPhysicsBody(), Util.toRadians(configuration.angle))
		robot.addTouchSensor(port, new TouchSensor(scene, touchSensorBody))
	}

	private static addUltrasonicSensor(robot: Robot, port: string, scene: Scene, configuration: SensorConfiguration<"ULTRASONIC">) {
		const ultrasonicSensor = new UltrasonicSensor(
			scene.unit,
			Vector.create(configuration.x, configuration.y),
			Util.toRadians(configuration.angle),
			Util.toRadians(configuration.angularRange)
		)
		const portText = new PIXI.Text(port, new PIXI.TextStyle({
			fill: "0x555555"
		}))
		if (configuration.portTextDirection == "againstDriveDirection") {
			portText.position.set(scene.unit.getLength(-0.015), 0)
			portText.anchor.set(1, 0.5)
		} else {
			portText.position.set(scene.unit.getLength(0.015), 0)
			portText.anchor.set(0, 0.5)
		}
		portText.scale.set(scene.unit.getLength(1 / portText.style.fontSize / 50))
		ultrasonicSensor.graphics.addChild(portText)
		robot.addUltrasonicSensor(port, ultrasonicSensor)
	}

	private static addGyroSensor(robot: Robot, port: string, scene: Scene, configuration: SensorConfiguration<"GYRO">) {
		robot.addGyroSensor(port, new GyroSensor())
	}

	
	private static addSensors<T extends SensorType>(robot: Robot, portMap: SensorPortMap, sensorType: T, addSensor: (robot: Robot, port: string, scene: Scene, configuration: SensorConfiguration<T>) => void) {
		
		const sensorCount = this.getMaxNumberOfSensors(portMap, sensorType)
		const scene = robot.getScene()
		const ports = portMap.get(sensorType) ?? []

		/** any[][] | undefined[] | undefined */
		const allSensorsConfigurations = this.robotConfiguration[sensorType]
		/** any[] | undefined  where any[] is the array of values used for each port */
		const sensorsConfiguration = Util.safeIndexing(allSensorsConfigurations, sensorCount - 1)

		for(let i = 0; i < sensorCount; i++) {
			addSensor(robot, ports[i], scene, Util.safeIndexing(sensorsConfiguration, i))
		}
	}


	private static configureRobot(robot: Robot, configuration: RobotConfiguration) {

		const portMap: SensorPortMap = new Map()
		for(const port in configuration) {
			const sensorType = configuration[port]
			if (sensorType != undefined) {
				if(!portMap.has(sensorType)) {
					portMap.set(sensorType, [])
				}
				portMap.get(sensorType)!.push(port)
			}
		}

		RobotConfigurationManager.addSensors(robot, portMap, "TOUCH", this.addTouchSensor)
		RobotConfigurationManager.addSensors(robot, portMap, "COLOR", this.addColorSensor)
		RobotConfigurationManager.addSensors(robot, portMap, "ULTRASONIC", this.addUltrasonicSensor)
		//RobotConfigurationManager.addSensors(robot, portMap, "COMPASS", never)
		RobotConfigurationManager.addSensors(robot, portMap, "GYRO", this.addGyroSensor)
		//RobotConfigurationManager.addSensors(robot, portMap, "INFRARED", null)
		//RobotConfigurationManager.addSensors(robot, portMap, "SOUND", this.add)

		
	}

	setRobotConfigurations(robotConfigurations: RobotConfiguration[]) {
		this.robotConfigurations = robotConfigurations
	}

	/**
	 * Update all robots with the current configurations array where only the robots are
	 * updated which are at an index lower than `this.robotConfigurations.length`.
	 */
	safeUpdateAllRobots() {
		const count = Math.min(this.robots.length, this.robotConfigurations.length)
		for (let i = 0; i < count; i++) {
			this.robots[i].removeAllSensors()
			RobotConfigurationManager.configureRobot(this.robots[i], this.robotConfigurations[i])
		}
	}

	/**
	 * Update the last robot. If there is no configuration at index 'this.robots.length - 1'
	 * the robot will not be updated.
	 */
	safeUpdateLastRobot() {
		const configCount = this.robotConfigurations.length
		const robotIndex = this.robots.length - 1
		if (0 <= robotIndex && robotIndex < configCount) {
			this.robots[robotIndex].removeAllSensors()
			RobotConfigurationManager.configureRobot(this.robots[robotIndex], this.robotConfigurations[robotIndex])
		}
	}

}