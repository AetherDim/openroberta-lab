import { Vector } from "matter-js"
import * as C from "../simulation.constants"
import { Unit } from "../Unit"
import { Util } from "../Util"

export const robotLEDColors = ["LIGHTGRAY", "GREEN", "ORANGE", "RED"] as const
export type RobotLEDColor = typeof robotLEDColors[number]

export class RobotLED {

	private color: RobotLEDColor = "LIGHTGRAY"
	private blinkColor: RobotLEDColor = "LIGHTGRAY"
	private timer = 0
	private blink = 0

	/**
	 * The radius of the LED graphics in internal units
	 */
	private radius: number

	private position: Vector

	readonly graphics = new PIXI.Graphics()

	/**
	 * @param unit the unit to use for the lengths
	 * @param radius the radius of the LED graphics in meters
	 */
	constructor(unit: Unit, position: Vector, radius: number) {
		
		this.radius = unit.getLength(radius)
		this.position = position
		this.updateGraphics()
	}

	resetState() {
		this.setColor("LIGHTGRAY")
		this.blinkColor = "LIGHTGRAY"
		this.timer = 0
		this.blink = 0
	}

	/**
	 * Sets `this.color` and also updates the graphics if the color did change
	 */
	private setColor(color: RobotLEDColor) {
		const oldColor = this.color
		this.color = color
		if (oldColor != color) {
			this.updateGraphics()
		}
	}

	private getColorAsNumber(): number {
		switch (this.color) {
			case "LIGHTGRAY":
				return 0xd3d3d3
			case "ORANGE":
				return 0xffa500
			case "GREEN":
				return 0x008000
			case "RED":
				return 0xff0000
			default:
				Util.exhaustiveSwitch(this.color)
		}
	}

	private updateGraphics() {
		this.graphics
			.clear()
			.beginFill(this.getColorAsNumber())
			.drawCircle(0, 0, this.radius)
			.endFill()
		this.graphics.position.copyFrom(this.position)
	}

	update(dt: number, LEDAction?: { color?: RobotLEDColor, mode: string }) {		

		if (LEDAction != undefined) {
			const color = LEDAction.color;
			const mode = LEDAction.mode;
			if (color) {
				this.setColor(color)
				this.blinkColor = color
			}
			switch (mode) {
				case C.OFF:
					this.timer = 0
					this.blink = 0
					this.setColor('LIGHTGRAY')
					break
				case C.ON:
					this.timer = 0
					this.blink = 0
					break
				case C.FLASH:
					this.blink = 2
					break;
				case C.DOUBLE_FLASH:
					this.blink = 4
					break
			}
		}
		
		if (this.blink > 0) {
			if (this.timer > 0.5 && this.blink == 2) {
				this.setColor(this.blinkColor)
			} else if (this.blink == 4 && (this.timer > 0.5 && this.timer < 0.67 || this.timer > 0.83)) {
				this.setColor(this.blinkColor)
			} else {
				this.setColor("LIGHTGRAY")
			}
			this.timer += dt
			if (this.timer > 1.0) {
				this.timer = 0
			}
		}
	}
	

}