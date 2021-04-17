import { RRCScene } from "../RRC/Scene/RRCScene";
import { Asset, SharedAssetLoader } from "../SharedAssetLoader";
import { Unit } from "../Unit";
import { AsyncChain } from "./AsyncChain";
import { Scene } from "./Scene";
import * as RRC from '../RRC/RRAssetLoader'
import { randomIntBetween } from "../Random";
import { Vector } from "matter-js";
import { WaypointList } from "../Waypoints/WaypointList";

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


	onLoadAssets(chain: AsyncChain) {
		RRC.loader.load(()=>chain.next(),
			...this.assets
		)
	}

	onInit(chain: AsyncChain) {

		const textures = this.assets.map(asset => RRC.loader.get(asset).texture)
		
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
			rotation: 60
		})

		chain.next()
	}
}