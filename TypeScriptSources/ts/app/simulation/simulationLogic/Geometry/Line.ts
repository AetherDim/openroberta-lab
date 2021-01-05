import { Vector } from "matter-js"
import { LineBaseClass } from "./LineBaseClass";

export class Line extends LineBaseClass {

	checkIntersectionParameter(parameter: number): boolean {
		return true
	}

	nearestPointTo(point: Vector): Vector {
		return this.getPoint(this.uncheckedNearestParameterTo(point))
	}

	getEndPoints(): Vector[] {
		return []
	}

}