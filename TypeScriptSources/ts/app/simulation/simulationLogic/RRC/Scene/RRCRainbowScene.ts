import {RRCScene, wp} from "./RRCScene";
import {AgeGroup} from "../AgeGroup";
import * as RRC from "../RRAssetLoader";
import {AsyncChain} from "../../Scene/AsyncChain";
import {randomBool, randomWeightedBool} from "../../Random";
import {Asset} from "../../SharedAssetLoader";
import {WaypointList} from "../../Waypoints/WaypointList";
import {ScoreWaypoint} from "../../Waypoints/ScoreWaypoint";
import {RectEntityOptions} from "../../Entity";


export class RRCRainbowScene extends RRCScene {
	// colours
	readonly red = {
		r: 228,
		g: 3,
		b: 3
	}

	readonly orange = {
		r: 255,
		g: 140,
		b: 0
	}

	readonly yellow = {
		r: 255,
		g: 237,
		b: 0
	}

	readonly green = {
		r: 0,
		g: 128,
		b: 38
	}

	readonly blue = {
		r: 0,
		g: 77,
		b: 255
	}

	readonly purple = {
		r: 117,
		g: 7,
		b: 135
	}


	// colour order
	readonly colourES_MS = [
		this.red,
		this.yellow,
		this.green,
		this.blue
	]

	readonly colourHS = [
		this.red,
		this.orange,
		this.yellow,
		this.green,
		this.blue,
		this.purple
	]

	readonly bigWaypointSize = 70

	// Waypoints for MS and ES
	readonly topWaypoints = [
		wp(400, 177, 10),
		wp(402, 71, 0),
		wp(480, 72, 0),
		wp(479, 119, 0),
		wp(520, 117, 0),
		wp(520, 181, 0),
		wp(611, 178, 0),
		wp(762, 178, 10, this.bigWaypointSize),
	]

	readonly rightWaypoints = [
		wp(505, 270, 10),
		wp(620, 270, 0),
		wp(730, 272, 0),
		wp(730, 345, 0),
		wp(730, 410, 0),
		wp(610, 411, 0),
		wp(492, 408, 0),
		wp(490, 503, 10, this.bigWaypointSize),
	]

	readonly downWaypoints = [
		wp(400, 362, 10),
		wp(400, 415, 0),
		wp(400, 470, 0),
		wp(286, 470, 0),
		wp(210, 470, 0),
		wp(120, 470, 0),
		wp(120, 423, 0),
		wp(68, 423, 0),
		wp(68, 360, 0),
		wp(180, 360, 0),
		wp(297, 360, 10, this.bigWaypointSize),
	]

	readonly leftWaypoints = [
		wp(280, 268, 10),
		wp(280, 182, 0),
		wp(280, 112, 0),
		wp(174, 112, 0),
		wp(72, 112, 0),
		wp(72, 185, 0),
		wp(72, 270, 0),
		wp(130, 270, 0),
		wp(188, 270, 0),
		wp(188, 183, 10, this.bigWaypointSize),
	]

	waypointListES_MS = [
		this.topWaypoints,
		this.rightWaypoints,
		this.downWaypoints,
		this.leftWaypoints
	]


	// Waypoints for HS
	readonly topLeftWaypoints = [
		wp(357, 196, 10),
		wp(207, 196, 0),
		wp(62, 196, 0),
		wp(62, 100, 0),
		wp(207, 100, 0),
		wp(279, 100, 0),
		wp(360, 60, 0),
		wp(387, 90, 0),
		wp(389, 128, 10, this.bigWaypointSize),	
	]
	readonly topRightWaypoints = [
		wp(445, 190, 10),
		wp(460, 165, 0),
		wp(463, 138, 0),
		wp(501, 100, 0),
		wp(560, 100, 0),
		wp(543, 61, 0),
		wp(592, 61, 10, this.bigWaypointSize),
	]

	readonly middleRightWaypoint = [
		wp(500, 268, 10),
		wp(591, 180, 0),
		wp(740, 180, 0),
		wp(740, 270, 0),
		wp(740, 400, 0),
		wp(712, 392, 0),
		wp(604, 270, 0),
		wp(682, 270, 10, this.bigWaypointSize),	
	]

	readonly downRightWaypoints = [
		wp(441, 344, 10),
		wp(456, 369, 0),
		wp(589, 351, 0),
		wp(611, 389, 0),
		wp(559, 420, 0),
		wp(469, 449, 0),
		wp(469, 490, 10, this.bigWaypointSize),
	]

	readonly downLeftWaypoints = [
		wp(357, 341, 10),
		wp(341, 369, 0),
		wp(389, 450, 0),
		wp(301, 469, 0),
		wp(142, 469, 0),
		wp(84, 410, 0),
		wp(297, 410, 10, this.bigWaypointSize),
	]

	readonly middleLeftWaypoints = [
		wp(317, 270, 10),
		wp(281, 270, 0),
		wp(281, 339, 0),
		wp(187, 339, 0),
		wp(83, 339, 0),
		wp(159, 251, 0),
		wp(47, 251, 10, this.bigWaypointSize),
	]

	waypointListHS = [
		this.topLeftWaypoints,
		this.topRightWaypoints,
		this.downLeftWaypoints,
		this.downRightWaypoints,
		this.middleLeftWaypoints,
		this.middleRightWaypoint
	]

	readonly obstacleColor: number = 0xff00ff

	readonly obstacleListES_MS = [{
		x: 285,
		y: 340,
		w: 25,
		h: 40,
	}, {
		x: 171,
		y: 170,
		w: 40,
		h: 25,

	}, {
		x: 750,
		y: 158,
		w: 25,
		h: 40,
	}, {
		x: 470,
		y: 490,
		w: 40,
		h: 25,
	}]

	readonly obstacleListHS = [
		{
			x: 288,
			y: 401,
			w: 15,
			h: 20,
		}, {
			x: 40,
			y: 241,
			w: 15,
			h: 20,
		}, {
			x: 675,
			y: 263,
			w: 15,
			h: 20,
		}, {
			x: 462,
			y: 480,
			w: 20,
			h: 15,
		}, {
			x: 585,
			y: 51,
			w: 15,
			h: 20,
		}, {
			x: 380,
			y: 120,
			w: 20,
			h: 15,
		}
	]

	readonly centerWaypoint = wp(402, 270, 0)


	getWalls() {
		switch (this.ageGroup) {
			case AgeGroup.ES:
				return this.obstacleListES_MS;
			case AgeGroup.MS:
				return this.obstacleListES_MS;
			case AgeGroup.HS:
				return this.obstacleListHS;
		}

	}

	/**
	 * creates a the Waypoint list in the correct order
	 */
	sortColour() {
		const finalWaypointList = new WaypointList<ScoreWaypoint>()
		this.getColourOrder().forEach(colour => {
			const waypointList = new WaypointList<ScoreWaypoint>()
			this.getWaypoints().forEach(waypoint => {
				let waypointColour = this.getColourFromPosition({x: waypoint[0].x, y: waypoint[0].y})
				let waypoints = this.topWaypoints
				if (waypointColour != undefined) {
					if (colour.r == waypointColour[0] && colour.g == waypointColour[1] && colour.b == waypointColour[2]) {
						waypoints = waypoint
						waypoints.forEach(waypoint => {
							const x = waypoint.x
							const y = waypoint.y
							const wp = this.makeWaypoint({x: x, y: y}, waypoint.score, waypoint.r)
							waypointList.appendWaypoints(wp)
						})
						waypointList.appendReversedWaypoints()
					}
				}
			})
			finalWaypointList.append(waypointList)
		})
		finalWaypointList.appendWaypoints(this.makeWaypoint({x: this.centerWaypoint.x, y: this.centerWaypoint.y}, this.centerWaypoint.score, this.centerWaypoint.r))
		this.setWaypointList(finalWaypointList)
	}

	/**
	 * @returns a one-dimensional array of the colour order for each division
	 */
	getColourOrder() {
		switch (this.ageGroup) {
			case AgeGroup.ES:
				return this.colourES_MS;
			case AgeGroup.MS:
				return this.colourES_MS;
			case AgeGroup.HS:
				return this.colourHS;
		}
	}


	/**
	 * @returns a one-dimensional array of the waypoints
	 */
	getWaypoints() {
		switch (this.ageGroup) {
			case AgeGroup.ES:
				return this.waypointListES_MS;
			case AgeGroup.MS:
				return this.waypointListES_MS;
			case AgeGroup.HS:
				return this.waypointListHS;
		}
	}

	/**
	 * @param pos of the pixel that should be read
	 * @returns returns one-dimensional array of the colour (red, green, blue) at pos
	 */
	getColourFromPosition(pos: { x: number, y: number }) {
		return this.getContainers().getGroundImageData(pos.x, pos.y, 1, 1)
	}

	getAsset() {
		switch (this.ageGroup) {
			case AgeGroup.ES:
				if (randomBool()) {
					return RRC.RAINBOW_BACKGROUND_ES;
				} else {
					return RRC.RAINBOW_BACKGROUND_ES_DINO;
				}

			case AgeGroup.MS:
				if (randomWeightedBool(RRC.RAINBOW_BACKGROUND_MS_DINO.getNumberOfIDs(), RRC.RAINBOW_BACKGROUND_MS_SPACE_INVADERS.getNumberOfIDs())) {
					return RRC.RAINBOW_BACKGROUND_MS_DINO.getRandomAsset();
				} else {
					return RRC.RAINBOW_BACKGROUND_MS_SPACE_INVADERS.getRandomAsset();
				}

			case AgeGroup.HS:
				return RRC.RAINBOW_BACKGROUND_HS_SPACE_INVADERS.getRandomAsset();
		}
	}

	backgroundAsset?: Asset;

	onLoadAssets(chain: AsyncChain) {
		this.backgroundAsset = this.getAsset();
		this.loader.load(() => {
				chain.next();
			},
			this.backgroundAsset,
			RRC.GOAL_BACKGROUND
		);
	}

	getMaximumTimeBonusScore() {
		return 60 * 5
	}

	onInit(chain: AsyncChain) {
		this.initRobot({position: {x: 402, y: 270}, rotation: -90});

		const containers = this.getContainers()

		if (this.backgroundAsset) {
			let backgroundAsset = this.loader.get(this.backgroundAsset).texture;
			containers.groundContainer.addChild(new PIXI.Sprite(backgroundAsset));
		}

		this.sortColour();

		this.getWalls().forEach((wall) => {
				this.addStaticWallInPixels(wall, {color: this.obstacleColor, strokeColor: this.obstacleColor})
			}
		)

		this.addWalls(true);

		chain.next();
	}
}