import { AsyncChain } from "../../Scene/AsyncChain";
import { AgeGroup } from "../AgeGroup";
import {RRCScene} from "./RRCScene";
import * as RRC from '../RRAssetLoader'
import { PhysicsRectEntity } from "../../Entity";
import { Body } from "matter-js";
import {WaypointList} from "../../Waypoints/WaypointList";
import {ScoreWaypoint} from "../../Waypoints/ScoreWaypoint";

class LabyrinthRect {
	x: number;
	y: number;
	w: number;
	h: number;
	rotation: number;
	color: number;

	constructor(labyrinthRect: LabyrinthRect) {
		this.x = labyrinthRect.x
		this.y = labyrinthRect.y
		this.w = labyrinthRect.w
		this.h = labyrinthRect.h
		this.rotation = labyrinthRect.rotation
		this.color = labyrinthRect.color
	}
}

export class RRCLabyrinthScene extends RRCScene {

	readonly MazeObstacleList_ES: LabyrinthRect[] = [
	{ // add obstacles with lists like this
		x: 500,
		y: 100,
		w: 200,
		h: 5,
		rotation: 0,
		color: 0x000000
	}, {
		x: 700,
		y: 100,
		w: 5,
		h: 450,
		rotation: 0,
		color: 0x000000
	}, {
		x: 400,
		y: 0,
		w: 5,
		h: 200,
		rotation: 0,
		color: 0x000000
	}, {
		x: 400,
		y: 200,
		w: 200,
		h: 5,
		rotation: 0,
		color: 0x000000
	}, {
		x: 600,
		y: 200,
		w: 5,
		h: 250,
		rotation: 0,
		color: 0x000000
	}, {
		x: 400,
		y: 450,
		w: 200,
		h: 5,
		rotation: 0,
		color: 0x000000
	}, {
		x: 300,
		y: 100,
		w: 5,
		h: 450,
		rotation: 0,
		color: 0x000000
	}, {
		x: 300,
		y: 300,
		w: 200,
		h: 50,
		rotation: 0,
		color: 0x111111
	}, {
		x: 200,
		y: 0,
		w: 5,
		h: 350,
		rotation: 0,
		color: 0x000000
	}, {
		x: 100,
		y: 450,
		w: 200,
		h: 5,
		rotation: 0,
		color: 0x000000
	}, {
		x: 100,
		y: 100,
		w: 5,
		h: 350,
		rotation: 0,
		color: 0x000000
	}];

	MazeObstacleList_MS: LabyrinthRect[] = [{ // add obstacles with lists like this
		x: 500,
		y: 100,
		w: 200,
		h: 5,
		rotation: 0,
		color: 0x000000
	}, {
		x: 700,
		y: 100,
		w: 5,
		h: 450,
		rotation: 0,
		color: 0x000000
	}, {
		x: 400,
		y: 0,
		w: 5,
		h: 200,
		rotation: 0,
		color: 0x000000
	}, {
		x: 400,
		y: 200,
		w: 200,
		h: 5,
		rotation: 0,
		color: 0x000000
	}, {
		x: 600,
		y: 200,
		w: 5,
		h: 250,
		rotation: 0,
		color: 0x000000
	}, {
		x: 400,
		y: 450,
		w: 200,
		h: 5,
		rotation: 0,
		color: 0x000000
	}, {
		x: 300,
		y: 100,
		w: 5,
		h: 450,
		rotation: 0,
		color: 0x000000
	}, {
		x: 300,
		y: 300,
		w: 200,
		h: 5,
		rotation: 0,
		color: 0x000000
	}, {
		x: 400,
		y: 300,
		w: 100,
		h: 50,
		rotation: 0,
		color: 0x111111
	}, {
		x: 200,
		y: 0,
		w: 5,
		h: 350,
		rotation: 0,
		color: 0x000000
	}, {
		x: 100,
		y: 450,
		w: 200,
		h: 5,
		rotation: 0,
		color: 0x000000
	}, {
		x: 100,
		y: 100,
		w: 5,
		h: 350,
		rotation: 0,
		color: 0x000000
	}];

	MazeObstacleList_HS: LabyrinthRect[] = [{ // add obstacles with lists like this
		x: 600,
		y: 100,
		w: 100,
		h: 5,
		rotation: 0,
		color: 0x000000
	}, {
		x: 700,
		y: 100,
		w: 5,
		h: 450,
		rotation: 0,
		color: 0x000000
	}, {
		x: 400,
		y: 100,
		w: 100,
		h: 5,
		rotation: 0,
		color: 0x000000
	}, {
		x: 400,
		y: 0,
		w: 5,
		h: 100,
		rotation: 0,
		color: 0x000000
	}, {
		x: 500,
		y: 100,
		w: 5,
		h: 100,
		rotation: 0,
		color: 0x000000
	}, {
		x: 500,
		y: 200,
		w: 100,
		h: 5,
		rotation: 0,
		color: 0x000000
	}, {
		x: 600,
		y: 200,
		w: 5,
		h: 250,
		rotation: 0,
		color: 0x000000
	}, {
		x: 400,
		y: 450,
		w: 200,
		h: 5,
		rotation: 0,
		color: 0x000000
	}, {
		x: 300,
		y: 100,
		w: 5,
		h: 450,
		rotation: 0,
		color: 0x000000
	}, {
		x: 300,
		y: 300,
		w: 200,
		h: 50,
		rotation: 0,
		color: 0x111111
	}, {
		x: 300,
		y: 200,
		w: 100,
		h: 5,
		rotation: 0,
		color: 0x000000
	}, {
		x: 200,
		y: 0,
		w: 5,
		h: 350,
		rotation: 0,
		color: 0x000000
	}, {
		x: 100,
		y: 450,
		w: 200,
		h: 5,
		rotation: 0,
		color: 0x000000
	}, {
		x: 100,
		y: 100,
		w: 5,
		h: 350,
		rotation: 0,
		color: 0x000000
	}];

	readonly waypointES_MS = [
		{
			x: 700,
			y: 436,
			w: 100,
			h: 100,
			score: 0
		},
		{
			x: 700,
			y: 0,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 400,
			y: 0,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 400,
			y: 100,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 600,
			y: 100,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 600,
			y: 440,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 300,
			y: 440,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 300,
			y: 340,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 500,
			y: 340,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 500,
			y: 200,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 300,
			y: 200,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 300,
			y: 0,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 200,
			y: 0,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 200,
			y: 340,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 100,
			y: 340,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 100,
			y: 0,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 0,
			y: 0,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 0,
			y: 440,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 200,
			y: 450,
			w: 100,
			h: 100,
			score: 10
		}
	]

	readonly waypointsHS = [
		{
			x: 700,
			y: 436,
			w: 100,
			h: 100,
			score: 0
		},
		{
			x: 700,
			y: 0,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 500,
			y: 0,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 500,
			y: 100,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 600,
			y: 100,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 600,
			y: 440,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 300,
			y: 440,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 300,
			y: 340,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 500,
			y: 340,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 500,
			y: 200,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 400,
			y: 200,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 400,
			y: 100,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 300,
			y: 100,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 300,
			y: 0,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 200,
			y: 0,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 200,
			y: 340,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 100,
			y: 340,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 100,
			y: 0,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 0,
			y: 0,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 0,
			y: 440,
			w: 100,
			h: 100,
			score: 10
		},{
			x: 200,
			y: 450,
			w: 100,
			h: 100,
			score: 10
		}
	]

	getWaypoints() {
		switch (this.ageGroup) {
			case AgeGroup.ES:
				return this.waypointES_MS;

			case AgeGroup.MS:
				return this.waypointES_MS;

			case AgeGroup.HS:
				return this.waypointsHS;
		}
	}


	addLabyrinth(labyrinth: LabyrinthRect[]) {
		const unit = this.unit
		labyrinth.forEach(rect => {
			const x = unit.fromLength(rect.x);
			const y = unit.fromLength(rect.y);
			const w = unit.fromLength(rect.w);
			const h = unit.fromLength(rect.h);
			const bodyEntity = PhysicsRectEntity.create(this, x, y, w, h, {color: rect.color, strokeColor: rect.color, relativeToCenter: false});
			this.addEntity(bodyEntity);
			Body.setStatic(bodyEntity.getPhysicsBody(), true);
		});
	}

	onLoadAssets(chain: AsyncChain) {
		this.loader.load(() => {
			chain.next();
		},
			this.getAsset(),
			RRC.GOAL_BACKGROUND
		);
	}

	getAsset() {
		switch (this.ageGroup) {
			case AgeGroup.ES:
				return RRC.LABYRINTH_BLANK_BACKGROUND_ES;

			case AgeGroup.MS:
				return RRC.LABYRINTH_BLANK_BACKGROUND_MS;

			case AgeGroup.HS:
				return RRC.LABYRINTH_BLANK_BACKGROUND_HS;
		}
	}

	getMaximumTimeBonusScore() {
		return 60 * 3
	}

	onInit(chain: AsyncChain) {

		this.initRobot({position: {x: 752, y: 490}, rotation: -90});

		let backgroundAsset = this.loader.get(this.getAsset()).texture;
		this.getContainers().groundContainer.addChild(new PIXI.Sprite(backgroundAsset));

		switch (this.ageGroup) {
			case AgeGroup.ES:
				this.addLabyrinth(this.MazeObstacleList_ES);
				break;
		
			case AgeGroup.MS:
				this.addLabyrinth(this.MazeObstacleList_MS);
				break;

			case AgeGroup.HS:
				this.addLabyrinth(this.MazeObstacleList_HS);
				break;
		}

		// TODO: Change the waypoints
		const waypointList = new WaypointList<ScoreWaypoint>()
		const waypoints = this.getWaypoints()

		waypoints.forEach(waypoint => {
			const x = waypoint.x + waypoint.w/2
			const y = waypoint.y + waypoint.h/2
			const r = Math.sqrt(Math.pow(waypoint.w, 2) + Math.pow(waypoint.h, 2))*0.5
			const wp = this.makeWaypoint({x: x, y: y}, waypoint.score, r)
			waypointList.appendWaypoints(wp)
		})


		this.setWaypointList(waypointList)



		this.addWalls(true);

		chain.next();
	}



}