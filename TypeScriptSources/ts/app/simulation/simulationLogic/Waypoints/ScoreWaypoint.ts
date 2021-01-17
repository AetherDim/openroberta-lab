import { Vector } from "matter-js";
import { Unit } from "../Unit";
import { Waypoint } from "./Waypoint";

/**
 * A waypoint with an additional score (number) and a
 */
export class ScoreWaypoint extends Waypoint {

	score: number

	/**
	 * @param position The position of the waypoint in meters
	 * @param maxDistance The maximum distance to reach the waypoint in meters
	 * @param score The score for reaching the waypoint
	 */
	constructor(unit: Unit, position: Vector, maxDistance: number, score: number) {
		super(unit, position, maxDistance)
		this.score = score
	}

}