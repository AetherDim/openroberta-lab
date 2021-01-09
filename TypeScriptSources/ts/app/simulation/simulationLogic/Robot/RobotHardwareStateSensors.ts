
export interface RobotHardwareStateSensors {

    color?: { 3: {
        ambientlight: number,
        colorValue: string,
        colour: string,
        /** brightness in precent from 0 to 100 */
        light: number,
        /** array of [red, green, blue] values in the range 0 to 255 */
        rgb: number[]
    }}

    encoder?: {left: number, right: number}

    gyro?: { 2: {
        /** angle in degrees */
        angle: number,
        /** angular velocity? in degrees/second */
        rate: number
    }}

    ultrasonic?: { 4: {
        /** distance in cm */
        distance: number,
        presence: boolean
    }}

    infrared?: { 4: {
        /** distance in cm */
        distance: number,
        presence: boolean
    }}

}