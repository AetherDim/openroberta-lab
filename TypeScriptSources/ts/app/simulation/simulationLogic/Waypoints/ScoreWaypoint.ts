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
	 * @param score The score for reaching the waypoint
	 */
	constructor(unit: Unit, position: Vector, score: number) {
		super(unit, position, ScoreWaypoint.defaultMaxDistance)
		this.score = score
	}

	/**
	 * Default maximum distance to reach the waypoint in meters
	 */
	static defaultMaxDistance = 0.05

}