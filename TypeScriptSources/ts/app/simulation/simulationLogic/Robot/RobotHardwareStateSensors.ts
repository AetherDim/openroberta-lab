
export interface RobotHardwareStateSensors {

	color?: { [port: string]: {
		ambientlight: number,
		colorValue: string,
		colour: string,
		/** brightness in precent from 0 to 100 */
		light: number,
		/** array of [red, green, blue] values in the range 0 to 255 */
		rgb: number[]
	} | undefined }

	encoder?: {left: number, right: number}

	gyro?: { [port: string]: {
		/** angle in degrees */
		angle: number,
		/** angular velocity? in degrees/second */
		rate: number
	} | undefined }

	ultrasonic?: { [port: string]: {
		/** distance in cm */
		distance: number,
		presence: boolean
	} | undefined }

	infrared?: { [port: string]: {
		/** distance in cm */
		distance: number,
		presence: boolean
	} | undefined }

	touch?: { [port: string]: boolean | undefined }

}