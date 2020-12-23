import { World, Engine, Mouse, MouseConstraint, Render, Bodies, Body, Vector, Constraint, Events, Composite } from 'matter-js'
import { createRect } from './displayable'

import "./extendedMatter"
import { MAXPOWER } from './interpreter.constants'
import { Interpreter } from './interpreter.interpreter'
import { RobotSimBehaviour } from './robotSimBehaviour'

export class Robot {

    /**
     * The full robot physics object
     */
    physicsComposite: Composite

    /**
     * The body of the robot as `Body`s
     */
    body = createRect(0, 0, 40, 30)

    /**
     * The wheels of the robot as `Body`s
     */
    wheels = {
        rearLeft: createRect(-50, -20, 20, 10),
        rearRight: createRect(-50,  20, 20, 10),
        frontLeft: createRect( 50, -15, 20, 10),
        frontRight: createRect( 50,  15, 20, 10)
    }

    robotBehaviour: RobotSimBehaviour = null;

    configuration: any = null;
    programCode: any = null;

    interpreter: Interpreter = null;

    constructor() {
        this.makePhysicsObject()
    }

    private makePhysicsObject() {
        
        const wheels = [
            this.wheels.rearLeft,
            this.wheels.rearRight,
            this.wheels.frontLeft,
            this.wheels.frontRight
        ]

        this.physicsComposite = Composite.create({bodies: [this.body].concat(wheels)})

        // set friction
        wheels.forEach(wheel => {
            wheel.frictionAir = 0.3
            this.physicsComposite.addRigidBodyConstraints(this.body, wheel, 0.1, 0.001)
        });

        this.body.frictionAir = 0.0;
    }

    private vectorAlongBody(body: Body, length: number = 1): Vector {
        return Vector.create(length * Math.cos(body.angle), length * Math.sin(body.angle))
    }

    driveWithWheel(wheel: Body, forwardForce: number) {
        const force = this.vectorAlongBody(wheel, forwardForce)
        Body.applyForce(wheel, wheel.position, force);
    }

    private velocityAlongBody(body: Body): number {
        return Vector.dot(body.velocity, this.vectorAlongBody(body))
    }

    // velocity
    // left = 0
    // right = 0

    leftForce = 0
    rightForce = 0

    encoder = {
        left: 0,
        right: 0
    };



    setProgram(program: any, breakpoints: any[]) {
        const _this = this;
        this.programCode = JSON.parse(program.javaScriptProgram);
        this.configuration = program.javaScriptConfiguration
        this.robotBehaviour = new RobotSimBehaviour();
        this.interpreter = new Interpreter(this.programCode, this.robotBehaviour, () => {
            _this.programTermineted();
        }, breakpoints);
    }

    private programTermineted() {
        console.log("Interpreter terminated");
    }


    update(dt: number) {

        if(!this.robotBehaviour || !this.interpreter) {
            return;
        }

        if(!this.interpreter.isTerminated()) {
            this.interpreter.runNOperations(3);
        }

        //this.robotBehaviour.setBlocking(false);
        

        // update pose
        var motors = this.robotBehaviour.getActionState("motors", true);
        if (motors) {
            const maxForce = true ? 0.0003 : MAXPOWER
            var left = motors.c;
            if (left !== undefined) {
                if (left > 100) {
                    left = 100;
                } else if (left < -100) {
                    left = -100;
                }
                this.leftForce = left * maxForce;
            }
            var right = motors.b;
            if (right !== undefined) {
                if (right > 100) {
                    right = 100;
                } else if (right < -100) {
                    right = -100;
                }
                this.rightForce = right * maxForce;
            }
        }

        this.driveWithWheel(this.wheels.rearLeft, this.leftForce)
        this.driveWithWheel(this.wheels.rearRight, this.rightForce)

        // var tempRight = this.right;
        // var tempLeft = this.left;
        //this.pose.theta = (this.pose.theta + 2 * Math.PI) % (2 * Math.PI);
        const leftWheelVelocity = this.velocityAlongBody(this.wheels.rearLeft)
        const rightWheelVelocity = this.velocityAlongBody(this.wheels.rearRight)
        this.encoder.left += leftWheelVelocity * dt;
        this.encoder.right += rightWheelVelocity * dt;
        var encoder = this.robotBehaviour.getActionState("encoder", true);
        if (encoder) {
            if (encoder.leftReset) {
                this.encoder.left = 0;
            }
            if (encoder.rightReset) {
                this.encoder.right = 0;
            }
        }
        // if (this.frontLeft.bumped && this.left > 0) {
        //     tempLeft *= -1;
        // }
        // if (this.backLeft.bumped && this.left < 0) {
        //     tempLeft *= -1;
        // }
        // if (this.frontRight.bumped && this.right > 0) {
        //     tempRight *= -1;
        // }
        // if (this.backRight.bumped && this.right < 0) {
        //     tempRight *= -1;
        // }
        // if (tempRight == tempLeft) {
        //     var moveXY = tempRight * SIM.getDt();
        //     var mX = Math.cos(this.pose.theta) * moveXY;
        //     var mY = Math.sqrt(Math.pow(moveXY, 2) - Math.pow(mX, 2));
        //     this.pose.x += mX;
        //     if (moveXY >= 0) {
        //         if (this.pose.theta < Math.PI) {
        //             this.pose.y += mY;
        //         } else {
        //             this.pose.y -= mY;
        //         }
        //     } else {
        //         if (this.pose.theta > Math.PI) {
        //             this.pose.y += mY;
        //         } else {
        //             this.pose.y -= mY;
        //         }
        //     }
        //     this.pose.thetaDiff = 0;
        // } else {
        //     var R = C.TRACKWIDTH / 2 * ((tempLeft + tempRight) / (tempLeft - tempRight));
        //     var rot = (tempLeft - tempRight) / C.TRACKWIDTH;
        //     var iccX = this.pose.x - (R * Math.sin(this.pose.theta));
        //     var iccY = this.pose.y + (R * Math.cos(this.pose.theta));
        //     this.pose.x = (Math.cos(rot * SIM.getDt()) * (this.pose.x - iccX) - Math.sin(rot * SIM.getDt()) * (this.pose.y - iccY)) + iccX;
        //     this.pose.y = (Math.sin(rot * SIM.getDt()) * (this.pose.x - iccX) + Math.cos(rot * SIM.getDt()) * (this.pose.y - iccY)) + iccY;
        //     this.pose.thetaDiff = rot * SIM.getDt();
        //     this.pose.theta = this.pose.theta + this.pose.thetaDiff;
        // }
        // var sin = Math.sin(this.pose.theta);
        // var cos = Math.cos(this.pose.theta);
        // this.frontRight = this.translate(sin, cos, this.frontRight);
        // this.frontLeft = this.translate(sin, cos, this.frontLeft);
        // this.backRight = this.translate(sin, cos, this.backRight);
        // this.backLeft = this.translate(sin, cos, this.backLeft);
        // this.backMiddle = this.translate(sin, cos, this.backMiddle);

        // for (var s in this.touchSensor) {
        //     this.touchSensor[s] = this.translate(sin, cos, this.touchSensor[s]);
        // }
        // for (var s in this.colorSensor) {
        //     this.colorSensor[s] = this.translate(sin, cos, this.colorSensor[s]);
        // }
        // for (var s in this.ultraSensor) {
        //     this.ultraSensor[s] = this.translate(sin, cos, this.ultraSensor[s]);
        // }
        // this.mouse = this.translate(sin, cos, this.mouse);

        // for (var s in this.touchSensor) {
        //     this.touchSensor[s].x1 = this.frontRight.rx;
        //     this.touchSensor[s].y1 = this.frontRight.ry;
        //     this.touchSensor[s].x2 = this.frontLeft.rx;
        //     this.touchSensor[s].y2 = this.frontLeft.ry;
        // }

        //update led(s)
        // var led = this.robotBehaviour.getActionState("led", true);
        // if (led) {
        //     var color = led.color;
        //     var mode = led.mode;
        //     if (color) {
        //         this.led.color = color.toUpperCase();
        //         this.led.blinkColor = color.toUpperCase();
        //     }
        //     switch (mode) {
        //         case C.OFF:
        //             this.led.timer = 0;
        //             this.led.blink = 0;
        //             this.led.color = 'LIGHTGRAY';
        //             break;
        //         case C.ON:
        //             this.led.timer = 0;
        //             this.led.blink = 0;
        //             break;
        //         case C.FLASH:
        //             this.led.blink = 2;
        //             break;
        //         case C.DOUBLE_FLASH:
        //             this.led.blink = 4;
        //             break;
        //     }
        // }
        // if (this.led.blink > 0) {
        //     if (this.led.timer > 0.5 && this.led.blink == 2) {
        //         this.led.color = this.led.blinkColor;
        //     } else if (this.led.blink == 4 && (this.led.timer > 0.5 && this.led.timer < 0.67 || this.led.timer > 0.83)) {
        //         this.led.color = this.led.blinkColor;
        //     } else {
        //         this.led.color = 'LIGHTGRAY';
        //     }
        //     this.led.timer += SIM.getDt();
        //     if (this.led.timer > 1.0) {
        //         this.led.timer = 0;
        //     }
        // }
        // $("#led" + this.id).attr("fill", "url('#" + this.led.color + this.id + "')");

        // update display
        // var display = this.robotBehaviour.getActionState("display", true);
        // if (display) {
        //     var text = display.text;
        //     var x = display.x;
        //     var y = display.y;
        //     if (text) {
        //         $("#display" + this.id).html($("#display" + this.id).html() + '<text x=' + x * 10 + ' y=' + (y + 1) * 16 + '>' + text + '</text>');
        //     }
        //     if (display.picture) {
        //         $("#display" + this.id).html(this.display[display.picture]);
        //     }
        //     if (display.clear) {
        //         $("#display" + this.id).html('');
        //     }
        // }

        // update tone
        // var volume = this.robotBehaviour.getActionState("volume", true);
        // if ((volume || volume === 0) && this.webAudio.context) {
        //     this.webAudio.volume = volume / 100.0;
        // }
        // var tone = this.robotBehaviour.getActionState("tone", true);
        // if (tone && this.webAudio.context) {
        //     var cT = this.webAudio.context.currentTime;
        //     if (tone.frequency && tone.duration > 0) {
        //         var oscillator = this.webAudio.context.createOscillator();
        //         oscillator.type = 'square';
        //         oscillator.connect(this.webAudio.context.destination);
        //         var that = this;

        //         function oscillatorFinish() {
        //             that.tone.finished = true;
        //             oscillator.disconnect(that.webAudio.context.destination);
        //             delete oscillator;
        //         }
        //         oscillator.onended = function(e) {
        //             oscillatorFinish();
        //         };
        //         oscillator.frequency.value = tone.frequency;
        //         oscillator.start(cT);
        //         oscillator.stop(cT + tone.duration / 1000.0);
        //     }
        //     if (tone.file !== undefined) {
        //         this.tone.file[tone.file](this.webAudio);
        //     }
        // }

        // update sayText
        // this.sayText.language = GUISTATE_C.getLanguage(); // reset language
        // var language = this.robotBehaviour.getActionState("language", true);
        // if (language !== null && language !== undefined && window.speechSynthesis) {
        //     this.sayText.language = language;
        // }
        // var sayText = this.robotBehaviour.getActionState("sayText", true);
        // if (sayText && window.speechSynthesis) {
        //     if (sayText.text !== undefined) {
        //         this.sayText.say(sayText.text, this.sayText.language, sayText.speed, sayText.pitch);
        //     }
        // }

        // update timer
        // var timer = this.robotBehaviour.getActionState("timer", false);
        // if (timer) {
        //     for (var key in timer) {
        //         if (timer[key] == 'reset') {
        //             this.timer[key] = 0;
        //         }
        //     }
        // }
    };

}