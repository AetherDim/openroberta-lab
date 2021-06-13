import { RRCScene } from "../RRC/Scene/RRCScene";
import { Asset } from "../SharedAssetLoader";
import { Unit } from "../Unit";
import { AsyncChain } from "./AsyncChain";
import * as RRC from '../RRC/RRAssetLoader'
import { randomIntBetween } from "../Random";
import { WaypointList } from "../Waypoints/WaypointList";
import { StringMap, Util } from "../Util";
import { SensorType } from "../Robot/Robot";
import { AgeGroup } from "../RRC/AgeGroup";


export class TestScene2 extends RRCScene {

	getUnitConverter(): Unit {
		return new Unit({m : 1000 })
	}

	readonly assets = [
		RRC.RAINBOW_BACKGROUND_HS_SPACE_INVADERS.getAsset(1),
		RRC.RAINBOW_BACKGROUND_HS_SPACE_INVADERS.getAsset(2),
		RRC.RAINBOW_BACKGROUND_HS_SPACE_INVADERS.getAsset(3),
		RRC.RAINBOW_BACKGROUND_HS_SPACE_INVADERS.getAsset(4)
	].filter(asset => asset != undefined) as Asset[]


	readonly testSensorTypes: SensorType[] = ["COLOR", "ULTRASONIC", "TOUCH"]

	readonly _sensorTypes = [...this.testSensorTypes, undefined]
	readonly useMultiSetCombinations = true
	readonly allSensorConfigurations = this.useMultiSetCombinations ?
		Util.generateMultiSetTuples(
			this._sensorTypes, 4
		).map(multiSet => { return {
			1: multiSet[0],
			2: multiSet[1], 
			3: multiSet[2],
			4: multiSet[3]
		}}) :
		Util.allPropertiesTuples({
			1: this._sensorTypes,
			2: this._sensorTypes,
			3: this._sensorTypes,
			4: this._sensorTypes
		})
	

	private configurationIndex = 0

	constructor(name: string, ageGroup: AgeGroup) {
		super(name, ageGroup)

		const debug = this.getDebugGuiStatic()
		if (debug != undefined) {
			debug.add(this, "configurationIndex", 0, this.allSensorConfigurations.length - 1, 1)
				.onChange(() => debug.updateDisplay())
				.onFinishChange(() => this.reset([]))
			debug.addUpdatable("configurationIndex: ", () =>
				this.configurationIndex + "/" + (this.allSensorConfigurations.length - 1)
			)
			debug.addUpdatable("configuration: ", () =>
				JSON.stringify(this.allSensorConfigurations[this.configurationIndex], undefined, "\n")
			)
			debug.addButton("next", () => {
				if (this.configurationIndex < this.allSensorConfigurations.length - 1) {
					this.configurationIndex += 1
					debug.updateDisplay()
					this.reset([])
				}
			})
			debug.addButton("previous", () => {
				if (this.configurationIndex > 0) {
					this.configurationIndex -= 1
					debug.updateDisplay()
					this.reset([])
				}
			})
		}

	}

	onLoadAssets(chain: AsyncChain) {
		this.loader.load(()=>chain.next(),
			...this.assets,
			RRC.GOAL_BACKGROUND
		)
	}

	onInit(chain: AsyncChain) {

		// create dynamic debug gui
		this.initDynamicDebugGui()

		const robotConfiguration = this.allSensorConfigurations[this.configurationIndex]
		this.robotManager.configurationManager.setRobotConfigurations([robotConfiguration])

		const textures = this.assets.map(asset => this.loader.get(asset).texture)
		
		textures.forEach(texture => {
			const sprite = new PIXI.Sprite(texture)
			sprite.position.set(randomIntBetween(0, 300), randomIntBetween(0, 300))
			this.getContainers().groundContainer.addChild(sprite)
		})

		const waypointList = new WaypointList([
			this.makeWaypoint({x: 100, y: 200}, 10),
			this.makeWaypoint({x: 400, y: 200}, 30)
		]);
		
		waypointList.appendReversedWaypoints()

		this.setWaypointList(waypointList)

		this.initRobot({
			position: {x: 100, y: 400},
			rotation: 0
		})

		chain.next()
	}
}