import { StringMap } from "../Util";
import { SensorType } from "./Robot";

export interface RobotConfiguration extends StringMap<SensorType> {}