import { Vector } from "matter-js";
import { Util } from "../Util";
import { Waypoint } from "./Waypoint";
import { WaypointList } from "./WaypointList";


/**
 * Manages a `WaypointList<W>` where each waypoint is checked one by one.
 * 
 * Call `update(objectPosition: Vector)` continuously and `reset()` to reset the `waypointIndex`.
 */
export class WaypointsManager<W extends Waypoint> {

	private waypointList: WaypointList<W>

	/**
	 * The index of the last reached waypoint
	 */
	private waypointIndex?: number

	private waypointEvent: (waypoint: W) => void

	constructor(waypointList: WaypointList<W> = new WaypointList([]), waypointEvent: (waypoint: W) => void = _ => {}) {
		this.waypointList = waypointList
		this.waypointEvent = waypointEvent
	}

	/**
	 * Sets `waypointList` and `waypointEvent` and resets `waypointIndex` to `undefined`
	 * @param waypointList 
	 * @param waypointEvent 
	 */
	resetListAndEvent(waypointList: WaypointList<W>, waypointEvent: (waypoint: W) => void) {
		this.waypointList = waypointList
		this.waypointEvent = waypointEvent
		this.reset()
	}

	/**
	 * Reset the `waypointIndex`
	 */
	reset() {
		this.waypointIndex = undefined
	}

	update(objectPosition: Vector) {

		const nextWaypointIndex = (this.waypointIndex ?? -1) + 1

		if (nextWaypointIndex >= this.waypointList.getLength()) {
			return
		}

		const waypoint = this.waypointList.get(nextWaypointIndex)

		if (Util.vectorDistanceSquared(waypoint.position, objectPosition) <= waypoint.maxDistance * waypoint.maxDistance) {
			this.waypointIndex = nextWaypointIndex
			this.waypointEvent(waypoint)
		}

	}

}