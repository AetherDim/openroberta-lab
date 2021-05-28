import { Vector } from "matter-js";
import { Scene } from "../Scene/Scene";
import { Util } from "../Util";
import { Waypoint } from "./Waypoint";

/**
 * A waypoint with an additional score (number) and a
 */
export class ScoreWaypoint extends Waypoint {

	score: number

	/**
	 * @param scene The `Scene` in which the waypoint will be placed
	 * @param position The position of the waypoint in meters
	 * @param maxDistance The maximum distance to reach the waypoint in meters
	 * @param score The score for reaching the waypoint
	 */
	constructor(scene: Scene, position: Vector, maxDistance: number, score: number) {
		super(scene, position, maxDistance)
		this.score = score
	}

	clone() {
		const scene = this.getScene()
		return new ScoreWaypoint(
			scene,
			scene.unit.fromPosition(this.position), 
			scene.unit.fromLength(this.maxDistance), 
			this.score)
	}

}