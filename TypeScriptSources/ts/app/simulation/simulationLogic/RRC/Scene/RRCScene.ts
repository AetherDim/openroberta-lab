import {AsyncChain, AsyncListener} from "../../Scene/AsyncChain";
import {AgeGroup} from "../AgeGroup";
import {Robot} from "../../Robot/Robot";
import {Body, Vector} from "matter-js";
import {Unit} from "../../Unit";
import {RRCScoreScene} from "./RRCScoreScene";
import {PhysicsRectEntity, DrawableEntity, RectEntityOptions} from "../../Entity";
import {ScoreWaypoint} from "../../Waypoints/ScoreWaypoint"
import {WaypointList} from "../../Waypoints/WaypointList";
import {Util} from "../../Util";
import { WaypointVisibilityBehavior } from "../../Waypoints/WaypointsManager";

export class RRCScene extends RRCScoreScene {

	readonly ageGroup: AgeGroup;

	constructor(name: string, ageGroup: AgeGroup) {
		super(name + " " + ageGroup);
		this.ageGroup = ageGroup;

		this.addOnAsyncChainBuildCompleteLister(chain => {
			// after score init but before onInit
			chain.addAfter(this.onInitScore, new AsyncListener(this.onRRCInit, this))
		})
	}

	/**
	 * @param position The position of the waypoint in matter Units
	 * @param score The score for reaching the waypoint
	 * @param maxDistance The maximum distance in matter units which still reaches the waypoint (default: 50 matter units)
	 */
	makeWaypoint(position: Vector, score: number, maxDistance: number = 50): ScoreWaypoint {
		return new ScoreWaypoint(this, this.unit.fromPosition(position), this.unit.fromLength(maxDistance), score)
	}

	setWaypointList(list: WaypointList<ScoreWaypoint>, waypointVisibilityBehavior: WaypointVisibilityBehavior = "showNext") {
		this.waypointsManager.waypointVisibilityBehavior = waypointVisibilityBehavior
		
		this.waypointsManager.resetListAndEvent(list, (idx, waypoint) => {
			this.addToScore(waypoint.score)
			if (idx == list.getLastWaypointIndex()) {
				this.addToScore(this.getTimeBonusScore())
				this.showScoreScreen(true)
			}
		})

		// add index text graphic to waypoints
		this.waypointsManager.getWaypoints().forEach((waypoint, index) => {

			let waypointText = String(index)
			let fontSize = 80
			if(waypoint.score > 0) {
				waypointText += "\n" + waypoint.score + " Pts."
				fontSize = 50
			}

			function makeText(color: number, xOffset: number, yOffset: number): PIXI.Text {
				const text = new PIXI.Text(waypointText, new PIXI.TextStyle({
					fontFamily: 'ProggyTiny',
					fontSize: fontSize,
					fill: color,
					align: 'center',
				}))
				text.resolution = 4
				text.position.set(
					waypoint.position.x - text.width/2 + xOffset,
					waypoint.position.y - text.height/2 + yOffset)
				return text
			}

			waypoint.graphics.addChild(
				makeText(0x000000, +1, +1),
				makeText(0x000000, -1, -1),
				makeText(0xf48613,  0,  0)
			)
		})
	}

	private getTimeBonusScore(): number {
		return Math.max(0, this.getMaximumTimeBonusScore() - (this.getProgramRuntime() ?? Infinity)) 
	}

	getMaximumTimeBonusScore(): number {
		return 0
	}


	getUnitConverter(): Unit {
		// approx 60px = 20cm
		return new Unit({m: 350})
	}

	onRRCInit(chain: AsyncChain) {
		// create dynamic debug gui
		this.initDynamicDebugGui()

		//this.initRobot();
		//this.setScore(266);
		//this.showScoreScreen(100);
		chain.next();
	}

	/**
	 * Sets the position (matter units) and rotation (degrees; clockwise) of the robot
	 * @param opt Options of type '{ position?: Vector, rotation?: number }'
	 */
	initRobot(opt?: { position?: Vector, rotation?: number }) {
		let robot = Robot.EV3(this);
		const position = opt?.position ?? Vector.create()

		const unit = this.getUnitConverter();

		position.x = unit.fromLength(position.x);
		position.y = unit.fromLength(position.y);

		robot.setPose(this.unit.getPosition(position), opt?.rotation || 0, false)
		robot.body.enableMouseInteraction = true;
		this.addRobot(robot)
	}

	/**
	 * Adds a static physics body rectangle where the coordinates are given in pixels
	 *
	 * @param x x coordinate of upper left corner
	 * @param y y coordinate of upper left corner
	 * @param w width of rectangle
	 * @param h height of rectangle
	 * @param options options for 'RectEntityOptions'
	 */
	addStaticWallInPixels(wall: {x: number, y: number, w: number, h: number,}, options?: Partial<RectEntityOptions>) {
		const unit = this.getUnitConverter()
		const x = unit.fromLength(wall.x)
		const y = unit.fromLength(wall.y)
		const w = unit.fromLength(wall.w)
		const h = unit.fromLength(wall.h)

		const opts = Util.getOptions(RectEntityOptions, options)
		if (options?.relativeToCenter == undefined) {
			opts.relativeToCenter = false
		}
		const entity = PhysicsRectEntity.create(this, x, y, w, h, opts)
		Body.setStatic(entity.getPhysicsBody(), true)
		this.addEntity(entity)
	}

	/**
	 * Padding for the scroll view zoom reset in pixels
	 */
	private sceneFramePadding = 10

	getSize(): { width: number, height: number } {
		return {
			width: 800 + 2 * this.sceneFramePadding,
			height: 540 + 2 * this.sceneFramePadding
		}
	}

	getOrigin(): Vector {
		return { x: -this.sceneFramePadding, y: -this.sceneFramePadding }
	}

	addWalls(visible: boolean = false) {
		const unit = this.getUnitConverter();

		const t = unit.fromLength(100);
		const x = unit.fromLength(0);
		const y = unit.fromLength(0);
		const w = unit.fromLength(800);
		const h = unit.fromLength(540);

		const options = {
			color: 0x000000,
			strokeColor: 0x000000,
			alpha: 0.2,
			relativeToCenter: false
		}

		const top = PhysicsRectEntity.create(this, x - t, y - t, w + 2 * t, t, options);
		const bottom = PhysicsRectEntity.create(this, x - t, y + h, w + 2 * t, t, options);
		const left = PhysicsRectEntity.create(this, x - t, y, t, h, options);
		const right = PhysicsRectEntity.create(this, x + w, y, t, h, options);

		this.addEntity(top);
		this.addEntity(bottom);
		this.addEntity(left);
		this.addEntity(right);
		Body.setStatic(top.getPhysicsBody(), true);
		Body.setStatic(bottom.getPhysicsBody(), true);
		Body.setStatic(left.getPhysicsBody(), true);
		Body.setStatic(right.getPhysicsBody(), true);

		top.getDrawable().visible = visible;
		bottom.getDrawable().visible = visible;
		left.getDrawable().visible = visible;
		right.getDrawable().visible = visible;
	}


}

export function wp(x: number, y: number, score: number, r: number = 30) {
	return {
		x: x,
		y: y,
		r: r,
		score: score
	}
}