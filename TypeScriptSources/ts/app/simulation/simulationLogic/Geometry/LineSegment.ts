import { Vector } from "matter-js";
import { Util } from "../Util";
import { LineBaseClass } from "./LineBaseClass";

export class LineSegment extends LineBaseClass {

	readonly point1: Vector
	readonly point2: Vector

	constructor(point1: Vector, point2: Vector) {
		super(point1, Util.vectorSub(point2, point1))
		this.point1 = point1
		this.point2 = point2
	}

	checkIntersectionParameter(parameter: number): boolean {
		return 0 <= parameter && parameter <= 1
	}

	nearestPointTo(point: Vector): Vector {
		const parameter = this.uncheckedNearestParameterTo(point)
		if (parameter <= 0) {
			return this.point1
		}
		if (parameter >= 1) {
			return this.point2
		}
		return this.getPoint(parameter)
	}

	getEndPoints(): Vector[] {
		return [this.point1, this.point2]
	}

}