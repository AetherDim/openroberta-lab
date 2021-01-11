import { Vector, Body } from "matter-js"
import { LineBaseClass } from "../Geometry/LineBaseClass"

export class RobotUpdateOptions {
	
	dt: number
	programPaused: boolean
	getImageData: (x: number, y: number, w: number, h: number) => ImageData
	getNearestPointTo: (point: Vector, includePoint: (point: Vector) => boolean) => Vector | undefined
	intersectionPointsWithLine: (line: LineBaseClass) => Vector[]
	bodyIntersectsOther: (body: Body) => boolean
	
	constructor(o: {
		dt: number,
		programPaused: boolean,
		getImageData: (x: number, y: number, w: number, h: number) => ImageData,
		getNearestPointTo: (point: Vector, includePoint: (point: Vector) => boolean) => Vector | undefined,
		intersectionPointsWithLine: (line: LineBaseClass) => Vector[],
		bodyIntersectsOther: (body: Body) => boolean
	}) {
		this.dt = o.dt
		this.programPaused = o.programPaused
		this.getImageData = o.getImageData
		this.getNearestPointTo = o.getNearestPointTo
		this.intersectionPointsWithLine = o.intersectionPointsWithLine
		this.bodyIntersectsOther = o.bodyIntersectsOther
	}
}