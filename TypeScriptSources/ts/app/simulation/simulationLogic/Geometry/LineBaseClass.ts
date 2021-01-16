import { Vector } from "matter-js"
import { Util } from "../Util"
// import { Line } from "./Line"


export abstract class LineBaseClass {

	readonly startPoint: Vector
	readonly directionVector: Vector

	constructor(startPoint: Vector, direction: Vector) {
		this.startPoint = startPoint
		this.directionVector = direction
	}

	getPoint(parameter: number): Vector {
		return Util.vectorAdd(this.startPoint, Vector.mult(this.directionVector, parameter))
	}

	// toLine(): Line {
	//     return new Line(this.startPoint, this.directionVector)
	// }

	abstract checkIntersectionParameter(parameter: number): boolean

	/**
	 * Returns the intersection parameters of `this` and `line`. It may be null.
	 * 
	 * @param lineBase The line which may intersect `this`
	 */
	intersectionParameters(lineBase: LineBaseClass): ({t: number, s: number} | null) {

		const p = Util.vectorSub(this.startPoint, lineBase.startPoint)
		// sp + t * dV = lB.sp + s * lB.dV
		// sp - lB.sp = lB.dV * s - dV * t
		// column matrix (lB.dV, -dV) is row matrix ((a, b), (c, d))
		// see https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution
		const a = lineBase.directionVector.x
		const b = -this.directionVector.x
		const c = lineBase.directionVector.y
		const d = -this.directionVector.y
		const determinant = a * d - b * c

		if (Math.abs(determinant) < 1e-10) {
			// TODO: Maybe check this
			return null
		}

		const s = (d * p.x - b * p.y) / determinant
		const t = (-c * p.x + a * p.y) / determinant

		return {t: t, s: s}
	}

	intersectionPoint(lineBase: LineBaseClass): Vector | null {
		const intersectionParameters = this.intersectionParameters(lineBase)

		if (!intersectionParameters) {
			return null
		}

		if (this.checkIntersectionParameter(intersectionParameters.t)
			&& lineBase.checkIntersectionParameter(intersectionParameters.s)) {
			return this.getPoint(intersectionParameters.t)
		}

		return null
	}

	intersects(lineBase: LineBaseClass): boolean {
		const intersectionParameters = this.intersectionParameters(lineBase)

		if (!intersectionParameters) {
			return false
		}

		return this.checkIntersectionParameter(intersectionParameters.s)
			&& lineBase.checkIntersectionParameter(intersectionParameters.t)
	}

	uncheckedNearestParameterTo(point: Vector): number {
		// line: x = s + t * r
		// helper plane: r * (x - p) = 0
		// intersection:
		//     r * (s + t * r - p) = 0
		//  => t = (r * (p - s)) / |r|^2

		return Vector.dot(this.directionVector, Util.vectorSub(point, this.startPoint)) / Vector.magnitudeSquared(this.directionVector)
	}

	abstract nearestPointTo(point: Vector): Vector

	abstract getEndPoints(): Vector[]

	nearestPointToLineBase(lineBase: LineBaseClass): Vector | null {
		const intersectionPoint = this.intersectionPoint(lineBase)
		if (intersectionPoint) {
			return intersectionPoint
		}
		const endPoints = this.getEndPoints()
		const otherEndPoints = lineBase.getEndPoints()

		var minDistance = Infinity
		var nearestPoint: Vector | null = null
		for (const p of endPoints) {
			const squaredLength = Util.vectorDistanceSquared(lineBase.nearestPointTo(p), p)
			if (squaredLength < minDistance) {
				minDistance = squaredLength
				nearestPoint = p
			}
		}
		for (const p of otherEndPoints) {
			const squaredLength = Util.vectorDistanceSquared(this.nearestPointTo(p), p)
			if (squaredLength < minDistance) {
				minDistance = squaredLength
				nearestPoint = p
			}
		}

		return nearestPoint
	}

}