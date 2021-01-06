
export interface RobotHardwareStateSensors {

    color?: { 3: {
        ambientlight: number,
        colorValue: string,
        colour: string,
        /** brightness */
        light: number,
        rgb: number[]
    }}

    encoder?: {left: number, right: number}

    gyro?: { 2: {
        angle: number,
        /** angular velocity? in degrees? */
        rate: number
    }}

    ultrasonic?: { 4: {
        distance: number,
        presence: boolean
    }}

    infrared?: { 4: {
        distance: number,
        presence: boolean
    }}

}