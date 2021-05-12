import { StringMap } from "../Util";
import { SensorType } from "./Robot";

export interface RobotProgram {
	/**
	 * key: `string` which is the port.
	 * value: `SensorType`
	 */
	javaScriptConfiguration: StringMap<SensorType>
	javaScriptProgram: string
}