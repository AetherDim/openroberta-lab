import { StringMap } from "../Util";
import { SensorType } from "./Robot";

export interface RobotProgram {
	javaScriptConfiguration: StringMap<SensorType>
	javaScriptProgram: string
}