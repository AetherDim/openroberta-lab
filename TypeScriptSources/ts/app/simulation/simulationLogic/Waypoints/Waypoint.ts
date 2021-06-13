import { Vector } from "matter-js"
import { DrawableEntity } from "../Entity"
import { Scene } from "../Scene/Scene"

/**
 * A waypoint with a position and maximum distance to reach it.
 * By default it is added to the `topContainer`.
 */
export class Waypoint extends DrawableEntity<PIXI.Graphics> {

	/**
	 * Position in matter coordinates
	 */
	position: Vector
	/**
	 * Maximum distance to the object to reach waypoint in matter units
	 */
	maxDistance: number

	readonly graphics: PIXI.Graphics

	/**
	 * Creates a Waypoint at the specified `position` which is by default visible.
	 * 
	 * @param scene The `Scene` in which the waypoint will be placed
	 * @param position The position of the waypoint in meters
	 * @param maxDistance The maximum distance to reach the waypoint in meters
	 * 
	 * @see this.graphics where you can change the graphics
	 */
	constructor(scene: Scene, position: Vector, maxDistance: number) {
		const pos = scene.unit.getPosition(position)
		const radius = scene.unit.getLength(maxDistance)
		const graphics = new PIXI.Graphics()
		super(scene, graphics)
		this.graphics = graphics
		this.position = pos
		this.maxDistance = radius

		this.updateGraphics()
	}

	/**
	 * Set `maxDistance` and updates the graphics
	 */
	setMaxDistanceInMatterUnits(distance: number) {
		this.maxDistance = distance
		this.updateGraphics()
	}

	updateGraphics() {
		this.graphics
			.clear()
			.lineStyle(4, 0x0000FF)
			.beginFill(undefined, 0)
			.drawCircle(this.position.x, this.position.y, this.maxDistance)
			.endFill()
	}

	getContainer(): PIXI.Container {
		return this.getScene().containerManager.topContainer
	}

	clone(): Waypoint {
		const scene = this.getScene()
		return new Waypoint(
			scene,
			scene.unit.fromPosition(this.position),
			scene.unit.fromLength(this.maxDistance))
	}

}