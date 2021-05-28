import { Vector } from "matter-js"
import { DrawableEntity, IContainerEntity, IEntity } from "../Entity"
import { Scene } from "../Scene/Scene"
import { Unit } from "../Unit"
import { Util } from "../Util"

/**
 * A waypoint with a position and maximum distance to reach it
 */
export class Waypoint extends DrawableEntity<PIXI.Container> {

	/**
	 * Position in matter coordinates
	 */
	position: Vector
	/**
	 * Maximum distance to the object to reach waypoint in matter units
	 */
	maxDistance: number

	readonly graphics: PIXI.Container

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
		const container = new PIXI.Container()
		const graphics = new PIXI.Graphics()
			.lineStyle(2, 0x0000FF)
			.beginFill(undefined, 0)
			.drawCircle(pos.x, pos.y, radius)
			.endFill()
		container.addChild(graphics)
		super(scene, container)
		this.graphics = container
		this.position = pos
		this.maxDistance = radius
	}

	clone(): Waypoint {
		const scene = this.getScene()
		return new Waypoint(
			scene,
			scene.unit.fromPosition(this.position),
			scene.unit.fromLength(this.maxDistance))
	}

}