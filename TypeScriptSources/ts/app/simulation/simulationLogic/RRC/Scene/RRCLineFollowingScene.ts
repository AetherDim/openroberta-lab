import {RRCScene} from "./RRCScene";
import { AsyncChain } from "../../Scene/AsyncChain";
import * as RRC from '../RRAssetLoader'
import {AgeGroup} from "../AgeGroup";
import { WaypointList } from "../../Waypoints/WaypointList";
import {ScoreWaypoint} from "../../Waypoints/ScoreWaypoint";

export class RRCLineFollowingScene extends RRCScene {

	// Waypoints
	readonly waypointsES = [
		{
			x: 35,
			y: 235,
			w: 80,
			h: 20,
			score: 50
		}, {
			x: 165,
			y: 70,
			w: 20,
			h: 80,
			score: 0
		}, {
			x: 700,
			y: 280,
			w: 50,
			h: 50,
			score: 50
		}, {
			x: 710,
			y: 40,
			w: 100,
			h: 80,
			score: 100
		}
	]

	readonly waypointsMS = [
		{
			x: 35,
			y: 350,
			w: 80,
			h: 20,
			score: 25
		}, {
			x: 650,
			y: 340,
			w: 50,
			h: 50,
			score: 50
		}, {
			x: 730,
			y: 230,
			w: 50,
			h: 50,
			score: 25
		}, {
			x: 710,
			y: 40,
			w: 100,
			h: 80,
			score: 100
		}
	]

	readonly waypointsHS = [
		{
			x: 35,
			y: 350,
			w: 80,
			h: 20,
			score: 25
		}, {
			x: 250,
			y: 320,
			w: 50,
			h: 50,
			score: 50
		}, {
			x: 650,
			y: 330,
			w: 50,
			h: 50,
			score: 50
		},{
			x: 730,
			y: 230,
			w: 50,
			h: 50,
			score: 25
		},  {
			x: 710,
			y: 40,
			w: 100,
			h: 80,
			score: 50
		}
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
			this.getAsset()
		);
	}

	onInit(chain: AsyncChain) {
		this.initRobot({ position: {x: 62, y: 450 }, rotation: -90 });

		// TODO: Change the waypoints
		const waypointList = new WaypointList<ScoreWaypoint>()
		const waypoints = this.getWaypoints()

		waypoints.forEach(waypoint => {
			const x = waypoint.x + waypoint.w/2
			const y = waypoint.y + waypoint.h/2
			const r = Math.sqrt(Math.pow(waypoint.w, 2) + Math.pow(waypoint.h, 2))
			const wp = this.makeWaypoint({x: x, y: y}, waypoint.score, r)
			waypointList.appendWaypoints(wp)
		})

		waypointList.appendReversedWaypoints()


		this.setWaypointList(waypointList)

		let goal = this.loader.get(this.getAsset()).texture;
		this.goalSprite = new PIXI.Sprite(goal);

		this.getContainers().groundContainer.addChild(this.goalSprite);

		this.addStaticWallInPixels(this.getWall(), {color: this.obstacleColor, strokeColor: this.obstacleColor})

		this.addWalls(true);

		chain.next();
	}
}