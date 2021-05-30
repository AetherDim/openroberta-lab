import { Util } from "../Util";
import { RobotProgram } from "./RobotProgram";

export interface OpCode {
	opc: string
	[others: string]: unknown
}

export class RobotProgramGenerator {

	private constructor() {}

	static generateProgram(operations: OpCode[][]): RobotProgram {
		return {
			javaScriptProgram: JSON.stringify({ "ops": Util.flattenArray(operations) }, undefined, "\t")
		}
	}

	/**
	 * @param speed from 0 to 100 (in %)
	 * @param distance in meters
	 */
	static driveForwardOpCodes(speed: number, distance: number): OpCode[] {
		const uuidExpr1 = Util.genUid()
		const uuidExpr2 = Util.genUid()
		const uuidDriveAction= Util.genUid()
		return [
			{
				"opc": "expr",
				"expr": "NUM_CONST",
				"+": [
					uuidExpr1
				],
				// speed
				"value": speed.toString()
			},
			{
				"opc": "expr",
				"expr": "NUM_CONST",
				"+": [
					uuidExpr2
				],
				"-": [
					uuidExpr1
				],
				// distance
				"value": (distance*100).toString()
			},
			{
				"opc": "DriveAction",
				"speedOnly": false,
				"SetTime": false,
				"name": "ev3",
				"+": [
					uuidDriveAction
				],
				// forward/backward
				"driveDirection": "FOREWARD",
				"-": [
					uuidExpr2
				]
			},
			{
				"opc": "stopDrive",
				"name": "ev3"
			},
			{
				"opc": "stop",
				"-": [
					uuidDriveAction
				]
			}
		]
	}

	/**
	 * @param speed from 0 to 100 (in %)
	 * @param angle in degree
	 */
	static rotateOpCodes(speed: number, angle: number, right: boolean): OpCode[] {
		const uuidExpr1 = Util.genUid()
		const uuidExpr2 = Util.genUid()
		const uuidRotateAction= Util.genUid()
		const dir = right ? 'right' : 'left'
		return [
			{
				"opc": "expr",
				"expr": "NUM_CONST",
				"+": [
					uuidExpr1
				],
				"value": speed.toString()
			},
			{
				"opc": "expr",
				"expr": "NUM_CONST",
				"+": [
					uuidExpr2
				],
				"-": [
					uuidExpr1
				],
				"value": angle.toString()
			},
			{
				"opc": "TurnAction",
				"speedOnly": false,
				"turnDirection": dir,
				"SetTime": false,
				"name": "ev3",
				"+": [
					uuidRotateAction
				],
				"-": [
					uuidExpr2
				]
			},
			{
				"opc": "stopDrive",
				"name": "ev3"
			},
			{
				"opc": "stop",
				"-": [
					uuidRotateAction
				]
			}
		]
	}

}