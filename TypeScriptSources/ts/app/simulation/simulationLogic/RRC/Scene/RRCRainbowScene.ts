import {RRCScene} from "./RRCScene";
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


	// Waypoints for MS and ES
	readonly topWaypoints = [
		{
			x: 390,
			y: 160,
			w: 40,
			h: 40,
			score: 10
		}, {
			x: 680,
			y: 165,
			w: 40,
			h: 40,
			score: 10
		}
	]

	readonly rightWaypoints = [
		{
			x: 485,
			y: 250,
			w: 40,
			h: 40,
			score: 10
		},
		{
			x: 470,
			y: 440,
			w: 40,
			h: 40,
			score: 10
		}
	]

	readonly downWaypoints = [
		{
			x: 400,
			y: 350,
			w: 40,
			h: 40,
			score: 10
		}, {
			x: 230,
			y: 340,
			w: 40,
			h: 40,
			score: 10
		}
	]

	readonly leftWaypoints = [
		{
			x: 270,
			y: 250,
			w: 40,
			h: 40,
			score: 10
		}, {
			x: 170,
			y: 195,
			w: 40,
			h: 40,
			score: 10
		}
	]

	waypointListES_MS = [
		this.topWaypoints,
		this.rightWaypoints,
		this.downWaypoints,
		this.leftWaypoints
	]


	// Waypoints for HS
	readonly topLeftWaypoints = [
		{
			x: 310,
			y: 175,
			w: 20,
			h: 20,
			score: 10
		},
		{
			x: 382,
			y: 95,
			w: 20,
			h: 20,
			score: 10
		}
	]
	readonly topRightWaypoints = [
		{
			x: 445,
			y: 175,
			w: 20,
			h: 20,
			score: 10
		},
		{
			x: 565,
			y: 57,
			w: 20,
			h: 20,
			score: 10
		}
	]

	readonly downLeftWaypoints = [
		{
			x: 345,
			y: 385,
			w: 20,
			h: 20,
			score: 10
		},
		{
			x: 245,
			y: 403,
			w: 20,
			h: 20,
			score: 10
		}
	]
	readonly downRightWaypoints = [
		{
			x: 470,
			y: 363,
			w: 20,
			h: 20,
			score: 10
		},
		{
			x: 470,
			y: 450,
			w: 20,
			h: 20,
			score: 10
		}
	]

	readonly middleLeftWaypoints = [
		{
			x: 278,
			y: 263,
			w: 20,
			h: 20,
			score: 10
		},
		{
			x: 64,
			y: 245,
			w: 20,
			h: 20,
			score: 10
		}
	]
	readonly middleRightWaypoint = [
		{
			x: 490,
			y: 265,
			w: 20,
			h: 20,
			score: 10
		},
		{
			x: 660,
			y: 265,
			w: 20,
			h: 20,
			score: 10
		}
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
							const x = waypoint.x + waypoint.w / 2
							const y = waypoint.y + waypoint.h / 2
							const wp = this.makeWaypoint({x: x, y: y}, waypoint.score)
							waypointList.appendWaypoints(wp)
						})
						waypointList.appendReversedWaypoints()
					}
				}
			})
			finalWaypointList.append(waypointList)
		})
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

		return this.getContainers().getGroundImageData(pos.x, pos.y, 1, 1).data
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
			this.backgroundAsset
		);
	}

	onInit(chain: AsyncChain) {
		this.initRobot({position: {x: 402, y: 270}, rotation: -90});

		const containers = this.getContainers()

		if (this.backgroundAsset) {
			let goal = this.loader.get(this.backgroundAsset).texture;
			this.goalSprite = new PIXI.Sprite(goal);
			containers.groundContainer.addChild(this.goalSprite);
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