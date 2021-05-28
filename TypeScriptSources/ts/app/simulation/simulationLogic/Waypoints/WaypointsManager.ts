import { Vector } from "matter-js";
import { Util } from "../Util";
import { Waypoint } from "./Waypoint";
import { WaypointList } from "./WaypointList";

export type WaypointVisibilityBehavior =
	"hideAll" | "showAll" | "showNext" | "hideAllPrevious"

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

	waypointVisibilityBehavior: WaypointVisibilityBehavior = "showNext"

	private waypointEvent: (waypointIndex: number, waypoint: W) => void

	constructor(waypointList: WaypointList<W> = new WaypointList([]), waypointEvent: (waypointIndex: number, waypoint: W) => void = _ => {}) {
		this.waypointList = waypointList
		this.waypointEvent = waypointEvent
	}

	getWaypoints(): W[] {
		return this.waypointList.getWaypoints()
	}

	/**
	 * Sets `waypointList` and `waypointEvent` and resets `waypointIndex` to `undefined`. It also removes the current waypoints from the scene and add the new ones to their scenes.
	 * 
	 * @param waypointList 
	 * @param waypointEvent 
	 */
	resetListAndEvent(waypointList: WaypointList<W>, waypointEvent: (waypointIndex: number, waypoint: W) => void) {
		this.waypointList.getWaypoints().forEach(waypoint => {
			waypoint.getScene().removeEntity(waypoint)
		})
		waypointList.getWaypoints().forEach(waypoint => {
			waypoint.getScene().addEntity(waypoint)
		})
		this.waypointList = waypointList
		this.waypointEvent = waypointEvent
		this.reset()
	}

	/**
	 * Reset the `waypointIndex` and the waypoint graphics
	 */
	reset() {
		this.waypointIndex = undefined
		this.updateWaypointVisibility()
	}

	update(objectPosition: Vector) {

		const nextWaypointIndex = (this.waypointIndex ?? -1) + 1

		if (nextWaypointIndex >= this.waypointList.getLength()) {
			return
		}

		const waypoint = this.waypointList.get(nextWaypointIndex)

		if (Util.vectorDistanceSquared(waypoint.position, objectPosition) <= waypoint.maxDistance * waypoint.maxDistance) {
			this.waypointIndex = nextWaypointIndex
			const waypointIndex = nextWaypointIndex
			this.waypointEvent(this.waypointIndex, waypoint)

			this.updateWaypointVisibility()
		}

	}

	updateWaypointVisibility() {
		const waypointIndex = this.waypointIndex ?? -1
		const waypoints = this.waypointList.getWaypoints()
		let isVisible: (index: number) => boolean
		switch (this.waypointVisibilityBehavior) {
			case "hideAll":
				isVisible = () => false
				break
			case "hideAllPrevious":
				isVisible = (index) => index > waypointIndex
				break
			case "showAll":
				isVisible = () => true
				break
			case "showNext": 
				isVisible = (index) => index == waypointIndex + 1
				break
			default:
				Util.exhaustiveSwitch(this.waypointVisibilityBehavior)
		}
		waypoints.forEach((w, index) => w.graphics.visible = isVisible(index))
	}

}

function test(a: never): never {
	throw new Error()
}

					