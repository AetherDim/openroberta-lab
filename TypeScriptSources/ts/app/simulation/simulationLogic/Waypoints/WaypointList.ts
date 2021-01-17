import { Waypoint } from './Waypoint'

/**
 * A list of waypoints with several helper functions to waypoint paths
 */
export class WaypointList<W extends Waypoint> {

	waypoints: W[]

	constructor(waypoints: W[] = []) {
		this.waypoints = waypoints
	}

	/**
	 * Get the waypoint at `index`
	 */
	get(index: number): W {
		return this.waypoints[index]
	}

	/**
	 * Get the number of waypoints in the list
	 */
	getLength(): number {
		return this.waypoints.length
	}

	/**
	 * Append (almost) all current waypoints in reverse order to `this`. See `includingTheLast`.
	 * 
	 * @param includingTheLast If `true`: Append all waypoints including the last waypoint.
	 * If `false` do not append the last waypoint. (default: `false`)
	 */
	appendReversedWaypoints(includingTheLast: boolean = false) {
		for(var i = this.waypoints.length - 1 + (includingTheLast ? 0 : -1); i >= 0; i--) {
			this.waypoints.push(this.waypoints[i])
		}
	}

	/**
	 * Append all waypoints in `list`
	 */
	append(list: WaypointList<W>) {
		list.waypoints.forEach(waypoint => {
			this.waypoints.push(waypoint)
		})
	}

	appendWaypoints(...waypoints: W[]) {
		waypoints.forEach(waypoint => {
			this.waypoints.push(waypoint)
		})
	}

}