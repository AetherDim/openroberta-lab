define(["require", "exports", "matter-js", "../Displayable", "./ElectricMotor", "../interpreter.constants", "../interpreter.interpreter", "./RobotSimBehaviour", "../Unit", "./Wheel", "./ColorSensor", "./UltrasonicSensor", "../Geometry/Ray", "../ExtendedMatter"], function (require, exports, matter_js_1, Displayable_1, ElectricMotor_1, interpreter_constants_1, interpreter_interpreter_1, RobotSimBehaviour_1, Unit_1, Wheel_1, ColorSensor_1, UltrasonicSensor_1, Ray_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Robot = void 0;
    var Robot = /** @class */ (function () {
        function Robot(robot) {
            this.updateSensorGraphics = true;
            /**
             * The color sensor of the robot
             */
            this.colorSensors = {};
            /**
             * The ultrasonic sensor of the robot
             */
            this.ultrasonicSensors = {};
            this.configuration = null;
            this.programCode = null;
            /**
             * robot type
             */
            this.type = 'default';
            this.leftForce = 0;
            this.rightForce = 0;
            this.encoder = {
                left: 0,
                right: 0
            };
            this.wheelDriveFriction = 0.03;
            this.wheelSlideFriction = 0.07;
            this.needsNewCommands = true;
            this.endEncoder = null;
            this.body = robot.body;
            this.leftDrivingWheel = robot.leftDrivingWheel;
            this.rightDrivingWheel = robot.rightDrivingWheel;
            this.wheelsList = [this.leftDrivingWheel, this.rightDrivingWheel].concat(robot.otherWheels);
            // FIXME: Workaround. Change body display object to a container
            var displayable = this.body.displayable;
            this.bodyContainer = new PIXI.Container();
            if (displayable) {
                var bodyDisplayObject = displayable.displayObject;
                this.bodyContainer.position = bodyDisplayObject.position.clone();
                bodyDisplayObject.position.set(0, 0);
                this.bodyContainer.addChild(bodyDisplayObject);
                displayable.displayObject = this.bodyContainer;
            }
            this.physicsWheelsList = [];
            this.physicsComposite = matter_js_1.Composite.create();
            this.updatePhysicsObject();
        }
        Robot.prototype.setRobotType = function (type) {
            this.type = type;
            // TODO: change things
        };
        Robot.prototype.updatePhysicsObject = function () {
            var _this_1 = this;
            this.physicsWheelsList = this.wheelsList.map(function (wheel) { return wheel.physicsBody; });
            var wheels = this.physicsWheelsList;
            this.physicsComposite = matter_js_1.Composite.create({ bodies: [this.body].concat(wheels) });
            // set friction
            wheels.forEach(function (wheel) {
                wheel.frictionAir = 0.0;
                // const constraint1 = new CustomConstraint(
                //     this.body, wheel,
                //     Vector.sub(wheel.position, this.body.position), Vector.create(), {
                //         angularFrequency: 2 * Math.PI * 0.6,
                //         damping: 1.0,
                //         length: 0//Vector.magnitude(Vector.sub(this.body.position, wheel.position))
                //     })
                // const constraint2 = new CustomConstraint(
                //     this.body, wheel,
                //     Vector.create(), Vector.sub(this.body.position, wheel.position), {
                //         angularFrequency: 2 * Math.PI * 0.6,
                //         damping: 1.0,
                //         length: 0//Vector.magnitude(Vector.sub(this.body.position, wheel.position))
                //     })
                // this.customConstraints.push(constraint1)
                // this.customConstraints.push(constraint2)
                _this_1.physicsComposite.addRigidBodyConstraints(_this_1.body, wheel, 0.1, 0.1);
            });
            this.body.frictionAir = 0.0;
        };
        /**
         * Returns the color sensor which can be `undefined`
         */
        Robot.prototype.getColorSensors = function () {
            return Object.values(this.colorSensors);
        };
        /**
         * Sets the color sensor at the position (x,y) in meter
         *
         * @param port the port of the sensor
         * @param x x position of the sensor in meters
         * @param y y position of the sensor in meters
         * @returns false if a color sensor at `port` already exists and a new color sesor was not added
         */
        Robot.prototype.addColorSensor = function (port, x, y) {
            if (this.colorSensors[port]) {
                return false;
            }
            var colorSensor = new ColorSensor_1.ColorSensor(matter_js_1.Vector.create(x, y));
            this.colorSensors[port] = colorSensor;
            this.bodyContainer.addChild(colorSensor.graphics);
            return true;
        };
        Robot.prototype.getUltrasonicSensors = function () {
            return Object.values(this.ultrasonicSensors);
        };
        Robot.prototype.addUltrasonicSensor = function (port, ultrasonicSensor) {
            if (this.ultrasonicSensors[port]) {
                return false;
            }
            this.ultrasonicSensors[port] = ultrasonicSensor;
            this.bodyContainer.addChild(ultrasonicSensor.graphics);
            return true;
        };
        Robot.prototype.setWheels = function (wheels) {
            this.leftDrivingWheel = wheels.leftDrivingWheel;
            this.rightDrivingWheel = wheels.rightDrivingWheel;
            this.wheelsList = [this.leftDrivingWheel, this.rightDrivingWheel].concat(wheels.otherWheels);
            this.updatePhysicsObject();
        };
        Robot.prototype.vectorAlongBody = function (body, length) {
            if (length === void 0) { length = 1; }
            return matter_js_1.Vector.create(length * Math.cos(body.angle), length * Math.sin(body.angle));
        };
        Robot.prototype.driveWithWheel = function (wheel, forwardForce) {
            var force = this.vectorAlongBody(wheel, forwardForce);
            matter_js_1.Body.applyForce(wheel, wheel.position, force);
        };
        Robot.prototype.velocityAlongBody = function (body) {
            return matter_js_1.Vector.dot(body.velocity, this.vectorAlongBody(body));
        };
        Robot.prototype.setProgram = function (program, breakpoints) {
            var _this = this;
            this.programCode = JSON.parse(program.javaScriptProgram);
            this.configuration = program.javaScriptConfiguration;
            this.robotBehaviour = new RobotSimBehaviour_1.RobotSimBehaviour();
            this.interpreter = new interpreter_interpreter_1.Interpreter(this.programCode, this.robotBehaviour, function () {
                _this.programTerminated();
            }, breakpoints);
            this.resetVariables();
            return this.interpreter;
        };
        Robot.prototype.programTerminated = function () {
            console.log("Interpreter terminated");
        };
        // TODO: (Remove) it is an old but simpler implementation than `Wheel`
        Robot.prototype.updateWheelVelocity = function (wheel, dt) {
            var vec = this.vectorAlongBody(wheel);
            var velocityAlongBody = matter_js_1.Vector.mult(vec, matter_js_1.Vector.dot(vec, wheel.velocity));
            var velocityOrthBody = matter_js_1.Vector.sub(wheel.velocity, velocityAlongBody);
            var velocityChange = matter_js_1.Vector.add(matter_js_1.Vector.mult(velocityAlongBody, -this.wheelDriveFriction), matter_js_1.Vector.mult(velocityOrthBody, -this.wheelSlideFriction));
            // divide two times by `dt` since the simulation calculates velocity changes by adding
            // force/mass * dt
            matter_js_1.Body.applyForce(wheel, wheel.position, matter_js_1.Vector.mult(velocityChange, wheel.mass / dt));
        };
        Robot.prototype.resetVariables = function () {
            this.needsNewCommands = true;
            this.endEncoder = null;
        };
        Robot.prototype.reset = function () {
        };
        /**
         *
         * @param dt time step of the matter.js simulation
         * @param programPaused is program paused
         * @param getImageData get the image data of the ground layer
         */
        Robot.prototype.update = function (updateOptions) {
            var dt = updateOptions.dt;
            // update wheels velocities
            var gravitationalAcceleration = Unit_1.Unit.getAcceleration(9.81);
            var robotBodyGravitationalForce = gravitationalAcceleration * this.body.mass / this.wheelsList.length;
            this.wheelsList.forEach(function (wheel) {
                wheel.applyNormalForce(robotBodyGravitationalForce + wheel.physicsBody.mass * gravitationalAcceleration);
                wheel.update(dt);
            });
            if (!this.robotBehaviour || !this.interpreter) {
                return;
            }
            // update sensors
            this.updateRobotBehaviourHardwareStateSensors(dt, updateOptions.getImageData, updateOptions.getNearestPointTo, updateOptions.intersectionPointsWithLine);
            if (!updateOptions.programPaused && !this.interpreter.isTerminated() && this.needsNewCommands) {
                var delay = this.interpreter.runNOperations(1000) / 1000;
            }
            var speed = { left: 0, right: 0 };
            var t = this;
            /**
             * Uses `encoder` to reach the values of `endEncoder` by setting the appropriate values
             *
             * @param speedLeft Use magnitude as maximum left speed (can be negative)
             * @param speedRight Use magnitude as maximum right speed (can be negative)
             */
            function useEndEncoder(speedLeft, speedRight) {
                var _a;
                if (!t.endEncoder) {
                    return;
                }
                var encoderDifference = {
                    left: t.endEncoder.left - t.encoder.left,
                    right: t.endEncoder.right - t.encoder.right
                };
                if (Math.abs(encoderDifference.left) < 0.1 && Math.abs(encoderDifference.right) < 0.1) {
                    // on end
                    t.endEncoder = null;
                    (_a = t.robotBehaviour) === null || _a === void 0 ? void 0 : _a.resetCommands();
                    t.needsNewCommands = true;
                }
                else {
                    speed.left = (encoderDifference.left > 0 ? 1 : -1) * Math.abs(speedLeft);
                    speed.right = (encoderDifference.right > 0 ? 1 : -1) * Math.abs(speedRight);
                }
            }
            var driveData = this.robotBehaviour.drive;
            if (driveData) {
                // handle `driveAction` and `curveAction`
                if (driveData.distance && driveData.speed) {
                    // on start
                    if (!this.endEncoder) {
                        this.needsNewCommands = false;
                        var averageSpeed = 0.5 * (Math.abs(driveData.speed.left) + Math.abs(driveData.speed.right));
                        this.endEncoder = {
                            left: this.encoder.left + driveData.distance / this.leftDrivingWheel.wheelRadius * driveData.speed.left / averageSpeed,
                            right: this.encoder.right + driveData.distance / this.rightDrivingWheel.wheelRadius * driveData.speed.right / averageSpeed
                        };
                    }
                    useEndEncoder(driveData.speed.left, driveData.speed.right);
                }
                if (driveData.speed && !driveData.distance && !driveData.distance) {
                    speed.left = driveData.speed.left;
                    speed.right = driveData.speed.right;
                    this.robotBehaviour.drive = undefined;
                }
            }
            var rotateData = this.robotBehaviour.rotate;
            if (rotateData) {
                if (rotateData.angle) {
                    if (!this.endEncoder) {
                        this.needsNewCommands = false;
                        /** also wheel distance */
                        var axleLength = matter_js_1.Vector.magnitude(matter_js_1.Vector.sub(this.leftDrivingWheel.physicsBody.position, this.rightDrivingWheel.physicsBody.position));
                        var wheelDrivingDistance = rotateData.angle * 0.5 * axleLength;
                        // left rotation for `angle * speed > 0`
                        var rotationFactor = Math.sign(rotateData.speed);
                        this.endEncoder = {
                            left: this.encoder.left - wheelDrivingDistance / this.leftDrivingWheel.wheelRadius * rotationFactor,
                            right: this.encoder.right + wheelDrivingDistance / this.rightDrivingWheel.wheelRadius * rotationFactor
                        };
                    }
                    useEndEncoder(rotateData.speed, rotateData.speed);
                }
                else {
                    var rotationSpeed = Math.abs(rotateData.speed);
                    if (rotateData.rotateLeft) {
                        speed.left = -rotationSpeed;
                        speed.right = rotationSpeed;
                    }
                    else {
                        speed.left = rotationSpeed;
                        speed.right = -rotationSpeed;
                    }
                    this.robotBehaviour.rotate = undefined;
                }
            }
            this.leftDrivingWheel.applyTorqueFromMotor(ElectricMotor_1.ElectricMotor.EV3(), speed.left);
            this.rightDrivingWheel.applyTorqueFromMotor(ElectricMotor_1.ElectricMotor.EV3(), speed.right);
            // update pose
            var motors = this.robotBehaviour.getActionState("motors", true);
            if (motors) {
                var maxForce = true ? 0.01 : interpreter_constants_1.MAXPOWER;
                var left = motors.c;
                if (left !== undefined) {
                    if (left > 100) {
                        left = 100;
                    }
                    else if (left < -100) {
                        left = -100;
                    }
                    this.leftForce = left * maxForce;
                }
                var right = motors.b;
                if (right !== undefined) {
                    if (right > 100) {
                        right = 100;
                    }
                    else if (right < -100) {
                        right = -100;
                    }
                    this.rightForce = right * maxForce;
                }
            }
            // this.driveWithWheel(this.physicsWheels.rearLeft, this.leftForce)
            // this.driveWithWheel(this.physicsWheels.rearRight, this.rightForce)
            // this.leftDrivingWheel.applyTorqueFromMotor(ElectricMotor.EV3(), this.leftForce)
            // this.rightDrivingWheel.applyTorqueFromMotor(ElectricMotor.EV3(), this.rightForce)
            var leftWheelVelocity = this.velocityAlongBody(this.leftDrivingWheel.physicsBody);
            var rightWheelVelocity = this.velocityAlongBody(this.rightDrivingWheel.physicsBody);
            this.encoder.left = this.leftDrivingWheel.wheelAngle; //leftWheelVelocity * dt;
            this.encoder.right = this.rightDrivingWheel.wheelAngle; //rightWheelVelocity * dt;
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
        ;
        /**
         * Returns the absolute position relative to `this.body`
         */
        Robot.prototype.getAbsolutePosition = function (relativePosition) {
            return matter_js_1.Vector.add(this.body.position, matter_js_1.Vector.rotate(relativePosition, this.body.angle));
        };
        Robot.prototype.updateRobotBehaviourHardwareStateSensors = function (dt, getImageData, getNearestPointTo, intersectionPointsWithLine) {
            var _a;
            if (!this.robotBehaviour) {
                return;
            }
            var sensors = this.robotBehaviour.getHardwareStateSensors();
            // encoder
            sensors.encoder = {
                left: this.encoder.left,
                right: this.encoder.right
            };
            // gyo sensor
            // Note: OpenRoberta has a bug for the gyro.rate where they calculate it by
            // angleDifference * timeDifference but it should be angleDifference / timeDifference
            var gyroRate = this.body.angularVelocity * 180 / Math.PI;
            var oldAngle = (_a = sensors.gyro) === null || _a === void 0 ? void 0 : _a[2].angle;
            sensors.gyro = { 2: {
                    angle: oldAngle ? oldAngle + gyroRate * dt : this.body.angle * 180 / Math.PI,
                    rate: gyroRate
                } };
            // color
            for (var port in this.colorSensors) {
                var colorSensor = this.colorSensors[port];
                var colorSensorPosition = this.getAbsolutePosition(colorSensor.position);
                // the color array might be of length 4 or 16 (rgba with image size 1x1 or 2x2)
                var color = getImageData(colorSensorPosition.x, colorSensorPosition.y, 1, 1).data;
                colorSensor.setDetectedColor(color[0], color[1], color[2], this.updateSensorGraphics);
                if (!sensors.color) {
                    sensors.color = {};
                }
                sensors.color[port] = {
                    ambientlight: 0,
                    colorValue: "none",
                    colour: "none",
                    light: ((color[0] + color[1] + color[2]) / 3 / 2.55),
                    rgb: [color[0], color[1], color[2]]
                };
            }
            var _loop_1 = function (port) {
                var ultrasonicSensor = this_1.ultrasonicSensors[port];
                var sensorPosition = this_1.getAbsolutePosition(ultrasonicSensor.position);
                var halfAngle = ultrasonicSensor.angularRange / 2;
                var rays = [
                    matter_js_1.Vector.rotate(matter_js_1.Vector.create(1, 0), halfAngle + this_1.body.angle),
                    matter_js_1.Vector.rotate(matter_js_1.Vector.create(1, 0), -halfAngle + this_1.body.angle)
                ]
                    .map(function (v) { return new Ray_1.Ray(sensorPosition, v); });
                // (point - sensorPos) * vec > 0
                var vectors = rays.map(function (r) { return matter_js_1.Vector.perp(r.directionVector); });
                var dotProducts = vectors.map(function (v) { return matter_js_1.Vector.dot(v, sensorPosition); });
                var nearestPoint = getNearestPointTo(sensorPosition, function (point) {
                    return matter_js_1.Vector.dot(point, vectors[0]) < dotProducts[0]
                        && matter_js_1.Vector.dot(point, vectors[1]) > dotProducts[1];
                });
                var minDistanceSquared = nearestPoint ? matter_js_1.Vector.magnitudeSquared(matter_js_1.Vector.sub(nearestPoint, sensorPosition)) : Infinity;
                var intersectionPoints = intersectionPointsWithLine(rays[0]).concat(intersectionPointsWithLine(rays[1]));
                intersectionPoints.forEach(function (intersectionPoint) {
                    var distanceSquared = matter_js_1.Vector.magnitudeSquared(matter_js_1.Vector.sub(intersectionPoint, sensorPosition));
                    if (distanceSquared < minDistanceSquared) {
                        minDistanceSquared = distanceSquared;
                        nearestPoint = intersectionPoint;
                    }
                });
                var ultrasonicDistance = nearestPoint ? matter_js_1.Vector.magnitude(matter_js_1.Vector.sub(nearestPoint, sensorPosition)) : Infinity;
                ultrasonicSensor.setMeasuredDistance(ultrasonicDistance, this_1.updateSensorGraphics);
                if (this_1.updateSensorGraphics) {
                    // update nearestPoint
                    if (nearestPoint) {
                        if (!this_1.debugGraphics) {
                            this_1.debugGraphics = new PIXI.Graphics()
                                .beginFill(0xFF0000)
                                .drawRect(-5, -5, 10, 10)
                                .endFill();
                            this_1.bodyContainer.parent.addChild(this_1.debugGraphics);
                        }
                        this_1.debugGraphics.position.set(nearestPoint.x, nearestPoint.y);
                    }
                }
                ultrasonicDistance = Unit_1.Unit.fromLength(ultrasonicDistance);
                if (!sensors.ultrasonic) {
                    sensors.ultrasonic = {};
                }
                sensors.ultrasonic[port] = {
                    // `distance` is in cm
                    distance: Math.min(ultrasonicDistance, ultrasonicSensor.maximumMeasurableDistance) * 100,
                    presence: false
                };
                // infrared sensor (use ultrasonic distance)
                if (!sensors.infrared) {
                    sensors.infrared = {};
                }
                sensors.infrared[port] = {
                    // `distance` is in cm and at maximum 70cm
                    distance: Math.min(ultrasonicDistance, 0.7) * 100,
                    presence: false
                };
            };
            var this_1 = this;
            // ultrasonic sensor
            for (var port in this.ultrasonicSensors) {
                _loop_1(port);
            }
        };
        /**
         * LEGO EV3 like robot with 2 main wheels and one with less friction (e.g. swivel wheel)
         *
         * @param scale scale of the robot
         */
        Robot.default = function (scale) {
            if (scale === void 0) { scale = 1; }
            var frontWheel = new Wheel_1.Wheel(27 * scale, 0, 10 * scale, 10 * scale);
            frontWheel.slideFriction = 0.1;
            frontWheel.rollingFriction = 0.0;
            return new Robot({
                body: Displayable_1.createRect(0, 0, 40 * scale, 30 * scale),
                leftDrivingWheel: new Wheel_1.Wheel(-0, -22 * scale, 20 * scale, 10 * scale),
                rightDrivingWheel: new Wheel_1.Wheel(-0, 22 * scale, 20 * scale, 10 * scale),
                otherWheels: [
                    frontWheel
                ]
            });
        };
        /**
         * Long robot with 4 wheels
         */
        Robot.default2 = function () {
            return new Robot({
                body: Displayable_1.createRect(0, 0, 40, 30),
                leftDrivingWheel: new Wheel_1.Wheel(-50, -20, 20, 10),
                rightDrivingWheel: new Wheel_1.Wheel(-50, 20, 20, 10),
                otherWheels: [
                    new Wheel_1.Wheel(50, -15, 20, 10),
                    new Wheel_1.Wheel(50, 15, 20, 10)
                ]
            });
        };
        /**
         * Similar to the EV3 LEGO robot
         */
        Robot.EV3 = function () {
            var wheel = { diameter: 0.05, width: 0.02 };
            // TODO: Constraints are broken, if the front wheel has less mass (front wheel mass may be 0.030)
            var backWheel = new Wheel_1.Wheel(-0.09, 0, wheel.width, wheel.width, 0.30);
            backWheel.slideFriction = 0.05;
            backWheel.rollingFriction = 0.03;
            var robotBody = Displayable_1.createRect(0, 0, 0.15, 0.10);
            matter_js_1.Body.setMass(robotBody, Unit_1.Unit.getMass(0.300));
            var robot = new Robot({
                body: robotBody,
                leftDrivingWheel: new Wheel_1.Wheel(0, -0.07, wheel.diameter, wheel.width, 0.050),
                rightDrivingWheel: new Wheel_1.Wheel(0, 0.07, wheel.diameter, wheel.width, 0.050),
                otherWheels: [
                    backWheel
                ]
            });
            robot.addColorSensor("3", 0.08, 0);
            robot.addUltrasonicSensor("4", new UltrasonicSensor_1.UltrasonicSensor(matter_js_1.Vector.create(0.12, 0), 90 * 2 * Math.PI / 360));
            return robot;
        };
        return Robot;
    }());
    exports.Robot = Robot;
    /**
     * Damped spring constraint.
     */
    var CustomConstraint = /** @class */ (function () {
        function CustomConstraint(bodyA, bodyB, positionA, positionB, options) {
            this.bodyA = bodyA;
            this.bodyB = bodyB;
            this.positionA = positionA;
            this.positionB = positionB;
            this.angleA = bodyA.angle;
            this.angleB = bodyB.angle;
            this.length = options.length || 0;
            this.angularFrequency = options.angularFrequency || 1;
            this.damping = options.damping || 1;
        }
        CustomConstraint.prototype.update = function () {
            var rotatedPositionA = matter_js_1.Vector.rotate(this.positionA, this.bodyA.angle - this.angleA);
            var rotatedPositionB = matter_js_1.Vector.rotate(this.positionB, this.bodyB.angle - this.angleB);
            /** positionA in world space */
            var pointA = matter_js_1.Vector.add(this.bodyA.position, rotatedPositionA);
            /** positionB in world space */
            var pointB = matter_js_1.Vector.add(this.bodyB.position, rotatedPositionB);
            var relativePosition = matter_js_1.Vector.sub(pointB, pointA);
            var length = matter_js_1.Vector.magnitude(relativePosition);
            var unitRelativePosition = matter_js_1.Vector.mult(relativePosition, 1 / (length > 0 ? length : 1e-10));
            var lengthDelta = length - this.length;
            /** velocity of positionA in world space */
            var velocityA = matter_js_1.Vector.add(this.bodyA.velocity, matter_js_1.Vector.mult(matter_js_1.Vector.perp(rotatedPositionA), this.bodyA.angularVelocity));
            /** velocity of positionB in world space */
            var velocityB = matter_js_1.Vector.add(this.bodyB.velocity, matter_js_1.Vector.mult(matter_js_1.Vector.perp(rotatedPositionB), this.bodyB.angularVelocity));
            var relativeVelocity = matter_js_1.Vector.sub(velocityB, velocityA);
            var velocity = matter_js_1.Vector.dot(unitRelativePosition, relativeVelocity);
            // see Wikipedia https://en.wikipedia.org/wiki/Harmonic_oscillator#Damped_harmonic_oscillator
            var acceleration = -this.angularFrequency * (this.angularFrequency * lengthDelta + 2 * this.damping * velocity);
            var accelerationVec = matter_js_1.Vector.mult(unitRelativePosition, acceleration);
            var mass = 1 / (this.bodyA.inverseMass + this.bodyB.inverseMass);
            var forceVec = matter_js_1.Vector.mult(accelerationVec, mass);
            matter_js_1.Body.applyForce(this.bodyA, pointA, matter_js_1.Vector.neg(forceVec));
            matter_js_1.Body.applyForce(this.bodyB, pointB, forceVec);
        };
        return CustomConstraint;
    }());
});
