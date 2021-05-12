import { Vector } from "matter-js";
import { Unit } from "../../Unit";

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
	 * The radius of the circle graphic in internal length units
	 */
	graphicsRadius: number

	/**
	 * Creates a new color sensor.
	 * 
	 * @param position Position relative to the robot position in meters
	 * @param graphicsRadius the radius of the circle graphic in meters
	 */
	constructor(unit: Unit, position: Vector, graphicsRadius: number) {
		this.position = unit.getPosition(position)
		this.graphicsRadius = unit.getLength(graphicsRadius)
		this.updateGraphics()
	}

	/**
	 * Returns the color in rgb values from 0 to 255
	 */
	getDetectedColor() {
		return this.detectedColor
	}

	getColorHexValueString() {
		const color = this.detectedColor
		return "#" + ((1 << 24) + (color.red << 16) + (color.green << 8) + color.blue).toString(16).slice(1);
	}

	/**
	 * Returns the brightness as a value from 0 to 1
	 */
	getDetectedBrightness(): number {
		return (this.detectedColor.red + this.detectedColor.green + this.detectedColor.blue) / 3 / 255
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
				.lineStyle(this.graphicsRadius * 0.2, 0) // black border
				// pixi.js needs more performance if 'drawCircle' is used
				//.drawRect(-6, -6, 12, 12)
				.drawCircle(0, 0, this.graphicsRadius)
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