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
	private detectedColor = { red: 0, green: 0, blue: 0 }

	readonly graphics = new PIXI.Graphics()

	/**
	 * Creates a new color sensor.
	 * 
	 * @param position Position relative to the robot position in meter
	 */
	constructor(unit: Unit, position: Vector) {
		this.position = unit.getPosition(position)
		this.updateGraphics()
	}

	getDetectedColor() {
		return this.detectedColor
	}

	/**
	 * Sets the `detectedColor` and updates its graphics
	 * 
	 * @param r red color value
	 * @param g green color value
	 * @param b blue color value
	 */
	setDetectedColor(r: number, g: number, b: number, updateGraphics: boolean = true) {
		const isDifferentColor = this.detectedColor.red != r || this.detectedColor.green != g || this.detectedColor.blue != b
		this.detectedColor = { red: r, green: g, blue: b }
		if (updateGraphics && isDifferentColor) {
			this.updateGraphics()
		}
	}

	updateGraphics() {
		const color = this.detectedColor
		this.graphics
				.clear()
				.beginFill((color.red * 256 + color.green) * 256 + color.blue)
				.lineStyle(1, 0) // black border
				// pixi.js needs more performance if 'drawCircle' is used
				//.drawRect(-6, -6, 12, 12)
				.drawCircle(0, 0, 6)
				.endFill()
		this.graphics.position.set(this.position.x, this.position.y)
	}

	removeGraphicsFromParent() {
		this.graphics.parent.removeChild(this.graphics)
	}

	/**
	 * Removes the graphics from parent and destroys it
	 */
	destroy() {
		this.removeGraphicsFromParent()
		this.graphics.destroy()
	}
}