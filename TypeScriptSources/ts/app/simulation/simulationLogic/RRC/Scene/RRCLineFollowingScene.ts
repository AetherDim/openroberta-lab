import {RRCScene, wp} from "./RRCScene";
import { AsyncChain } from "../../Scene/AsyncChain";
import * as RRC from '../RRAssetLoader'
import {AgeGroup} from "../AgeGroup";
import { WaypointList } from "../../Waypoints/WaypointList";
import {ScoreWaypoint} from "../../Waypoints/ScoreWaypoint";
import { Util } from "../../Util";

export class RRCLineFollowingScene extends RRCScene {

	readonly bigWaypointSize = 70

	// Waypoints
	readonly waypointsES = [
		wp( 62, 470, 0),
		wp( 62, 360, 0),
		wp( 62, 280, 0),
		wp( 62, 200, 0),
		wp(105, 128, 0),
		wp(156, 115, 0),
		wp(259, 154, 0),
		wp(266, 191, 0),
		wp(258, 237, 0),
		wp(207, 339, 0),
		wp(228, 399, 0),
		wp(282, 434, 0),
		wp(338, 435, 0),
		wp(397, 395, 0),
		wp(421, 346, 0),
		wp(472, 309, 0),
		wp(559, 307, 0),
		wp(671, 309, 0),
		wp(735, 280, 0),
		wp(753, 184, 0),
		wp(756, 121, 0),
		wp(755,  60, 0),
	]

	readonly waypointsMS = [
		wp( 62, 470, 0),
		wp( 62, 360, 0),
		wp( 62, 280, 0),
		wp( 86, 226, 0),
		wp(146, 226, 0),
		wp(191, 253, 0),
		wp(245, 310, 0),
		wp(258, 326, 0),
		wp(300, 373, 0),
		wp(367, 419, 0),
		wp(432, 384, 0),
		wp(435, 333, 0),
		wp(434, 268, 0),
		wp(465, 221, 0),
		wp(519, 219, 0),
		wp(592, 291, 0),
		wp(608, 312, 0),
		wp(643, 350, 0),
		wp(706, 348, 0),
		wp(740, 325, 0),
		wp(751, 300, 0),
		wp(757, 252, 0),
		wp(753, 184, 0),
		wp(756, 121, 0),
		wp(755,  60, 0),
	]

	readonly waypointsHS = [
		wp( 62, 470, 0),
		wp( 62, 360, 0),
		wp( 62, 280, 0),
		wp( 86, 226, 0),
		wp(146, 226, 0),
		wp(191, 253, 0),
		wp(245, 310, 0),
		wp(258, 326, 0),
		wp(253, 253, 0),
		wp(271, 220, 0),
		wp(319, 223, 0),
		wp(346, 259, 0),
		wp(378, 310, 0),
		wp(412, 366, 0),
		wp(469, 419, 0),
		wp(510, 372, 0),
		wp(509, 329, 0),
		wp(510, 289, 0),
		wp(512, 255, 0),
		wp(537, 217, 0),
		wp(586, 237, 0),
		wp(612, 281, 0),
		wp(652, 350, 0),
		wp(706, 348, 0),
		wp(740, 325, 0),
		wp(751, 300, 0),
		wp(757, 252, 0),
		wp(753, 184, 0),
		wp(756, 121, 0),
		wp(755,  60, 0),
	]

	readonly obstacleColor: number = 0xf68712

	// Walls
	readonly wallES = {
		x: 720,
		y: 50,
		w: 70,
		h: 25
	}

	readonly wallMS = {
		x: 720,
		y: 50,
		w: 70,
		h: 25
	}

	readonly wallHS = {
		x: 720,
		y: 50,
		w: 70,
		h: 25
	}

	getWaypoints() {
		switch (this.ageGroup) {
			case AgeGroup.ES:
				return this.waypointsES;

			case AgeGroup.MS:
				return this.waypointsMS;

			case AgeGroup.HS:
				return this.waypointsHS;
		}
	}

	getWall() {
		switch (this.ageGroup) {
			case AgeGroup.ES:
				return this.wallES
			case AgeGroup.MS:
				return this.wallMS
			case AgeGroup.HS:
				return this.wallHS
		}
	}

	getAsset() {
		switch (this.ageGroup) {
			case AgeGroup.ES:
				return RRC.LINE_FOLLOWING_BACKGROUND_ES;

			case AgeGroup.MS:
				return RRC.LINE_FOLLOWING_BACKGROUND_MS;

			case AgeGroup.HS:
				return RRC.LINE_FOLLOWING_BACKGROUND_HS;
		}
	}


	onLoadAssets(chain: AsyncChain) {
		this.loader.load(() => {
			chain.next();
		},
			this.getAsset(),
			RRC.GOAL_BACKGROUND
		);
	}

	getMaximumTimeBonusScore() {
		return 60 * 2
	}

	/**
	 * Returns the indices of the waypoints where a junction is
	 */
	junctionIndices(): number[] {
		switch (this.ageGroup) {
		case AgeGroup.ES: return []
		case AgeGroup.MS: return [17]
		case AgeGroup.HS: return [7, 22]
		default: Util.exhaustiveSwitch(this.ageGroup)
		}
	}

	onInit(chain: AsyncChain) {
		this.initRobot({ position: {x: 62, y: 450 }, rotation: -90 });

		// TODO: Change the waypoints
		const waypointList = new WaypointList<ScoreWaypoint>()
		const waypoints = this.getWaypoints()

		waypoints.forEach(waypoint => {
			const x = waypoint.x
			const y = waypoint.y
			const r = waypoint.r
			const wp = this.makeWaypoint({x: x, y: y}, waypoint.score, r)
			waypointList.appendWaypoints(wp)
		})

		const reversedWaypoints = waypointList.reversed(false)

		// === set graphics ===
		waypointList.getLastWaypoint().setMaxDistanceInMatterUnits(this.bigWaypointSize)
		reversedWaypoints.getLastWaypoint().setMaxDistanceInMatterUnits(this.bigWaypointSize)

		// === set score ===

		// leaves the starting position 
		waypointList.get(1).score = this.ageGroup == AgeGroup.ES ? 50 : 25
		// arrives at the "tower"
		waypointList.getLastWaypoint().score = this.ageGroup == AgeGroup.HS ? 50 : 100

		// on the way back to the starting point
		reversedWaypoints.get(2).score = this.ageGroup == AgeGroup.ES ? 50 : 25
		// arrives at the starting position
		reversedWaypoints.getLastWaypoint().score = 100

		// set junction waypoint scores
		const waypointsAfterTheJunction = 2
		const junctionScore = 25
		this.junctionIndices().forEach(index => {
			waypointList.get(index + waypointsAfterTheJunction).score = junctionScore
			reversedWaypoints.get((reversedWaypoints.getLength() - 1) - (index - waypointsAfterTheJunction)).score = junctionScore
		})

		waypointList.append(reversedWaypoints)


		this.setWaypointList(waypointList)

		let backgroundAsset = this.loader.get(this.getAsset()).texture;
		this.getContainers().groundContainer.addChild(new PIXI.Sprite(backgroundAsset));

		this.addStaticWallInPixels(this.getWall(), {color: this.obstacleColor, strokeColor: this.obstacleColor})

		this.addWalls(true);

		chain.next();
	}
}