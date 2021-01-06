import { Vector } from "matter-js";
import { Color } from "../Color";
import { COLOR_ENUM } from "../simulation.constants";

export class ColorSensor {

    /**
     * Position relative to the robot position
     */
    position: Vector

    /**
     * The color which is detected below the color sensor
     */
    detectedColor = { red: 0, green: 0, blue: 0 }

    /**
     * Creates a new color sensor.
     * 
     * @param position Position relative to the robot position
     */
    constructor(position: Vector) {
        this.position = position
    }
}