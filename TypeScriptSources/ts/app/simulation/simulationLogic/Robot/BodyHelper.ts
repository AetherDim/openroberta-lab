import { Vector, Body, Query } from "matter-js"
import { LineBaseClass } from "../Geometry/LineBaseClass"
import { Polygon } from "../Geometry/Polygon"
import { Util } from "../Util"

export class BodyHelper {

	private static forEachBodyPartVertices(bodies: Body[], exceptBodies: Body[],code: (vertices: Vector[]) => void) {
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

	static getNearestPointTo(point: Vector, bodies: Body[], exceptBodies: Body[], includePoint: (point: Vector) => boolean): Vector | undefined {
		let nearestPoint: Vector | undefined
		let minDistanceSquared = Infinity

		BodyHelper.forEachBodyPartVertices(bodies, exceptBodies, vertices => {
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

	static intersectionPointsWithLine(line: LineBaseClass, bodies: Body[], exceptBodies: Body[]): Vector[] {
		const result: Vector[] = []
		this.forEachBodyPartVertices(bodies, exceptBodies, vertices => {
			const newIntersectionPoints = new Polygon(vertices).intersectionPointsWithLine(line)
			for (let i = 0; i < newIntersectionPoints.length; i++) {
				result.push(newIntersectionPoints[i])
			}
		})
		return result
	}

	static bodyIntersectsOther(body: Body, bodies: Body[]): boolean {
		// `body` collides with itself
		return Query.collides(body, bodies).length > 1
	}

	static someBodyContains(point: Vector, bodies: Body[], exceptBodies: Body[]): boolean {
		bodies = Query.point(bodies, point)
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