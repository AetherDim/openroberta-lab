import { Vector, Body, Query } from "matter-js"
import { LineBaseClass } from "../Geometry/LineBaseClass"
import { Polygon } from "../Geometry/Polygon"
import { Util } from "../Util"

export class RobotUpdateOptions {
	
	readonly dt: number
	readonly programPaused: boolean
	readonly getImageData: (x: number, y: number, w: number, h: number) => ImageData

	private readonly allBodies: Body[]
	
	constructor(o: {
		dt: number,
		programPaused: boolean,
		allBodies: Body[],
		getImageData: (x: number, y: number, w: number, h: number) => ImageData
	}) {
		this.dt = o.dt
		this.programPaused = o.programPaused
		this.allBodies = o.allBodies
		this.getImageData = o.getImageData
	}

	private forEachBodyPartVertices(exceptBodies: Body[],code: (vertices: Vector[]) => void) {
		const bodies: Body[] = this.allBodies

		for (let i = 0; i < bodies.length; i++) {
			const body = bodies[i];
			if (exceptBodies.includes(body)) {
				continue
			}
			// TODO: Use body.bounds for faster execution
			for (let j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
				const part = body.parts[j];
				code(part.vertices)
			}
		}
	}

	getNearestPointTo(point: Vector, exceptBodies: Body[], includePoint: (point: Vector) => boolean): Vector | undefined {
		let nearestPoint: Vector | undefined
		let minDistanceSquared = Infinity

		this.forEachBodyPartVertices(exceptBodies, vertices => {
			const nearestBodyPoint = new Polygon(vertices).nearestPointToPoint(point, includePoint)
			if (nearestBodyPoint) {
				const distanceSquared = Util.vectorDistanceSquared(point, nearestBodyPoint)
				if (distanceSquared < minDistanceSquared) {
					minDistanceSquared = distanceSquared
					nearestPoint = nearestBodyPoint
				}
			}
		})

		return nearestPoint;
	}

	intersectionPointsWithLine(line: LineBaseClass, exceptBodies: Body[]): Vector[] {
		const result: Vector[] = []
		this.forEachBodyPartVertices(exceptBodies, vertices => {
			const newIntersectionPoints = new Polygon(vertices).intersectionPointsWithLine(line)
			for (let i = 0; i < newIntersectionPoints.length; i++) {
				result.push(newIntersectionPoints[i])
			}
		})
		return result
	}

	bodyIntersectsOther(body: Body): boolean {
		// `body` collides with itself
		return Query.collides(body, this.allBodies).length > 1
	}

	someBodyContains(point: Vector, exceptBodies: Body[]): boolean {
		const bodies = Query.point(this.allBodies, point)
		for (let i = 0; i < bodies.length; i++) {
			const body = bodies[i];
			if (exceptBodies.includes(body)) {
				continue
			}
			return true
		}
		return false
	}
}