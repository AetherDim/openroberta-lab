import { Vector } from "matter-js"
import { LineBaseClass } from "../Geometry/LineBaseClass"

export class RobotUpdateOptions {
	
	dt: number
	programPaused: boolean
	getImageData: (x: number, y: number, w: number, h: number) => ImageData
	getNearestPointTo: (point: Vector, includePoint: (point: Vector) => boolean) => Vector
	intersectionPointsWithLine: (line: LineBaseClass) => Vector[]
	
	constructor(o: {
		dt: number,
		programPaused: boolean,
		getImageData: (x: number, y: number, w: number, h: number) => ImageData,
		getNearestPointTo: (point: Vector, includePoint: (point: Vector) => boolean) => Vector,
		intersectionPointsWithLine: (line: LineBaseClass) => Vector[]
	}) {
		this.dt = o.dt
		this.programPaused = o.programPaused
		this.getImageData = o.getImageData
		this.getNearestPointTo = o.getNearestPointTo
		this.intersectionPointsWithLine = o.intersectionPointsWithLine
	}
}