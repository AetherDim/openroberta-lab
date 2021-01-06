import { Vector } from "matter-js";
import { Unit } from "../Unit";

export class ColorSensor {

    /**
     * Position relative to the robot position in matter coordinates
     */
    position: Vector

    /**
     * The color which is detected below the color sensor
     */
    detectedColor = { red: 0, green: 0, blue: 0 }

    /**
     * Creates a new color sensor.
     * 
     * @param position Position relative to the robot position in meter
     */
    constructor(position: Vector) {
        this.position = Unit.getPosition(position)
    }
}