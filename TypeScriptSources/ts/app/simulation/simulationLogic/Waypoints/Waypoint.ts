import { Vector } from "matter-js"
import { Unit } from "../Unit"

/**
 * A waypoint with a position and maximum distance to reach it
 */
export class Waypoint {

	/**
	 * Position in matter coordinates
	 */
	position: Vector
	/**
	 * Maximum distance to the object to reach waypoint in matter units
	 */
	maxDistance: number

	/**
	 * @param unit The `Unit` of `position` and `minDistance`
	 * @param position The position of the waypoint in meters
	 * @param maxDistance The maximum distance to reach the waypoint in meters
	 */
	constructor(unit: Unit, position: Vector, maxDistance: number) {
		this.position = unit.getPosition(position)
		this.maxDistance = unit.getLength(maxDistance)
	}

	/**
	 * @param position The position of the waypoint in matter Units
	 * @param maxDistance The maximum distance to reach the waypoint in matter Units
	 */
	static withInternalUnits(position: Vector, maxDistance: number): Waypoint {
		return new Waypoint(new Unit({}), position, maxDistance)
	}

}