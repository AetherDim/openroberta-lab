import { RobotConfiguration } from "./RobotConfiguration";
import { RobotProgram } from "./RobotProgram";


export interface RobotSetupData {
	sensorConfiguration: RobotConfiguration
	program: RobotProgram
}