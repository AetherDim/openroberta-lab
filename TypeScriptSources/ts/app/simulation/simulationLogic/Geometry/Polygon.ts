import { Vector } from "matter-js";
import { Util } from "../Util";
import { Line } from "./Line";
import { LineBaseClass } from "./LineBaseClass";
import { LineSegment } from "./LineSegment";


export class Polygon {

	readonly vertices: Vector[]

	constructor(vertices: Vector[]) {
		this.vertices = vertices
	}

	distanceTo(point: Vector): number {

		var minDistanceSquared = Infinity

		const newVertices = this.vertices.map(p => Util.vectorSub(p, point))

		const zeroVector = Vector.create()

		var vertex0 = newVertices[0]
		var vertex1 = newVertices[1]

		var lastVertexIsNear = false
		var lastVertexDistanceSquared = Vector.magnitudeSquared(vertex1)

		const lineSegment = new LineSegment(vertex0, vertex1)
		const parameter = lineSegment.uncheckedNearestParameterTo(zeroVector)
		if (parameter <= 0) {
			minDistanceSquared = Vector.magnitudeSquared(vertex0)
		} else if (parameter >= 1) {
			minDistanceSquared = lastVertexDistanceSquared
			lastVertexIsNear = true
		} else {
			minDistanceSquared = Vector.magnitudeSquared(lineSegment.getPoint(parameter))
		}

		// distance of line to origin:
		// d/dt (s + t * r)^2 = 2 * (s + t * r) * r = 0
		// t = -(s*r)/(r^2)
		//   (s - s*r/(r^2) * r)^2
		// = s^2 + (s*r)^2*r^2/r^4 - 2*s*r*(s*r)/r^2
		// = s^2 - (s*r)^2/r^2
		// = s^2 + (s*r)*t

		for (let i = 2; i < newVertices.length; i++) {
			const vertex0 = newVertices[i-1]
			const vertex1 = newVertices[i]

			const vertex1DistanceSquared = Vector.magnitudeSquared(vertex1)
			
			var direction: Vector 
			var dotProduct: number
			var endVertexDistanceSquared: number
			if (lastVertexIsNear) {
				direction = Util.vectorSub(vertex1, vertex0)
				dotProduct = Vector.dot(vertex0, direction)
				endVertexDistanceSquared = vertex1DistanceSquared
			} else {
				direction = Util.vectorSub(vertex0, vertex1)
				dotProduct = Vector.dot(vertex1, direction)
				endVertexDistanceSquared = lastVertexDistanceSquared
			}

			var newLastVertexIsNear = false

			if (dotProduct < 0) {

				// total: 3 mult, 0 div, 2 add, 0 sub, 1 negate
				// 2 mult, 0 div, 1 add, 0 sub, 1 negate
				const parameter = -dotProduct / Vector.magnitudeSquared(direction)
				var newDistanceSquared: number
				if (parameter < 1) {
					// 1 mult, 0 div, 1 add, 0 sub, 0 negate
					// Pythagoras
					newDistanceSquared = endVertexDistanceSquared + dotProduct * parameter
				} else {
					if (lastVertexIsNear) {
						newDistanceSquared = vertex1DistanceSquared
						newLastVertexIsNear = true
					} else {
						newDistanceSquared = lastVertexDistanceSquared
					}
				}

				if (newDistanceSquared < minDistanceSquared) {
					minDistanceSquared = newDistanceSquared
				}

				// // total: 5 mult, 1 div, 0 add, 2 sub, 0 negate
				// // 2 mult, 0 div, 0 add, 1 sub, 0 negate
				// const area = Vector.cross(direction, vertex0)
				// // 3 mult, 1 div, 0 add, 1 sub, 0 negate
				// const distanceSquared = area * area / Vector.magnitudeSquared(direction)
			} else {
				if (!lastVertexIsNear) {
					newLastVertexIsNear = true
					if (vertex1DistanceSquared < minDistanceSquared) {
						minDistanceSquared = vertex1DistanceSquared
					}
				}
			}
			
			lastVertexIsNear = newLastVertexIsNear
			lastVertexDistanceSquared = vertex1DistanceSquared

		}

		return Math.sqrt(minDistanceSquared)
	}

	distanceTo2(point: Vector): number {

		var minDistanceSquared = Infinity

		const newVertices = this.vertices.map(p => Util.vectorSub(p, point))

		const zeroVector = Vector.create()

		for (let i = 2; i < newVertices.length; i++) {
			const vertex0 = newVertices[i-1]
			const vertex1 = newVertices[i]

			const lineSegment = new LineSegment(vertex0, vertex1)
			const parameter = lineSegment.uncheckedNearestParameterTo(zeroVector)
			if (parameter <= 0) {
				minDistanceSquared = Math.min(Vector.magnitudeSquared(vertex0), minDistanceSquared)
			} else if (parameter >= 1) {
				minDistanceSquared = Math.min(Vector.magnitudeSquared(vertex1), minDistanceSquared)
			} else {
				minDistanceSquared = Vector.magnitudeSquared(lineSegment.getPoint(parameter))
			}
		}

		return Math.sqrt(minDistanceSquared)
	}

	distanceTo3(point: Vector): number {
		return Vector.magnitude(<Vector>this.nearestPointTo(point))
	}

	/**
	 * Returns the nearest point on the polygon boundary to `point`.
	 * 
	 * @param point The point to which the nearest one is searched
	 */
	nearestPointTo(point: Vector): Vector {
		return <Vector>this._nearestPointTo(point, _ => true)
	}

	/**
	 * Returns the nearest point on the polygon boundary to `point` for which `includePoint(point)` is `true`.
	 * If no point is found since `includePoint` excludes all points, `undefined` is returned.
	 * 
	 * @param point The point to which the nearest one is searched
	 * @param includePoint Function which returns `true` iff the point can be included in the result (default: _ => true)
	 */
	nearestPointToPoint(point: Vector, includePoint: (point: Vector) => boolean): Vector | undefined {
		return this._nearestPointTo(point, includePoint)
	}

	/**
	 * Returns the nearest point on the polygon boundary to `point` for which `includePoint(point)` is `true`.
	 * If no point is found since `includePoint` excludes all points, `undefined` is returned.
	 * 
	 * @param point The point to which the nearest one is searched
	 * @param includePoint Function which returns `true` iff the point can be included in the result (default: _ => true)
	 */
	private _nearestPointTo(point: Vector, includePoint: (point: Vector) => boolean): Vector | undefined {

		let minDistanceSquared = Infinity
		let minDistancePoint: Vector | undefined

		function updateWithVertices(vertex0: Vector, vertex1: Vector) {
			const line = new Line(vertex0, Util.vectorSub(vertex1, vertex0))
			const parameter = line.uncheckedNearestParameterTo(point)
			
			let newMinPoint: Vector
			if (parameter <= 0) {
				newMinPoint = vertex0
			} else if (parameter >= 1) {
				newMinPoint = vertex1
			} else {
				newMinPoint = line.getPoint(parameter)
			}

			const newMinDistanceSquared = Util.vectorDistanceSquared(newMinPoint, point)
			if (newMinDistanceSquared < minDistanceSquared && includePoint(newMinPoint)) {
				minDistancePoint = newMinPoint
				minDistanceSquared = newMinDistanceSquared
			}
		}

		for (let i = 1; i < this.vertices.length; i++) {
			updateWithVertices(this.vertices[i-1], this.vertices[i])
		}

		updateWithVertices(this.vertices[this.vertices.length - 1], this.vertices[0])

		return minDistancePoint
	}

	/**
	 * Returns an array of points which are on the polygon border and `line`.
	 * 
	 * @param line A `LineBaseClass` which may intersect the polygon border
	 */
	intersectionPointsWithLine(line: LineBaseClass): Vector[] {
		const result: Vector[] = []
		
		function updateWithVertices(vertex0: Vector, vertex1: Vector) {
			const lineSegment = new LineSegment(vertex0, vertex1)
			
			const point = lineSegment.intersectionPoint(line)
			if (point) {
				result.push(point)
			}
		}

		for (let i = 1; i < this.vertices.length; i++) {
			updateWithVertices(this.vertices[i-1], this.vertices[i])
		}

		updateWithVertices(this.vertices[this.vertices.length - 1], this.vertices[0])

		return result
	}

	/**
	 * Returns `true` iff the polygon contains the `point`.
	 * 
	 * @param point point which is checked
	 * @param includeBoundary if `true`, checks if `point` is also on the boundary of the polygon
	 */
	containsPoint(point: Vector, includeBoundary: boolean = true): boolean {

		let containsPoint = false
		let lastVertex = this.vertices[this.vertices.length - 1]
		let lastPointIsAbove = point.y > lastVertex.y
		for (let i = 0; i < this.vertices.length; i++) {
			const vertex = this.vertices[i];
			const currentPointIsAbove = vertex.y < point.y
			if (currentPointIsAbove != lastPointIsAbove) {
				// point above has changed

				// intersection at y = point.y
				// lastVertex + t * (vertex - lastVertex) = (x, point.y)
				const t = (point.y - lastVertex.y) / (vertex.y - lastVertex.y)
				const x = lastVertex.x + t * (vertex.x - lastVertex.x)
				if (x >= point.x) {
					containsPoint = !containsPoint
					if (includeBoundary && x == point.x) {
						// point is on boundary
						return true
					}
				}
			}
			lastVertex = vertex
			lastPointIsAbove = currentPointIsAbove
		}

		return containsPoint
	}

}