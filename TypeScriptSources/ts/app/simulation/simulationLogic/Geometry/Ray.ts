import { Vector } from "matter-js";
import { LineBaseClass } from "./LineBaseClass";

export class Ray extends LineBaseClass {

	checkIntersectionParameter(parameter: number): boolean {
		return 0 <= parameter
	}
	
	nearestPointTo(point: Vector): Vector {
		const parameter = this.uncheckedNearestParameterTo(point)
		if (parameter <= 0) {
			return this.startPoint
		}
		return this.getPoint(parameter)
	}

	getEndPoints(): Vector[] {
		return [this.startPoint]
	}
}