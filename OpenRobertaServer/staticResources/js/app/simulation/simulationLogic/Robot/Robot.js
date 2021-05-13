var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
define(["require", "exports", "matter-js", "./ElectricMotor", "../interpreter.constants", "../interpreter.interpreter", "./RobotSimBehaviour", "./Wheel", "./Sensors/ColorSensor", "../Geometry/Ray", "../Entity", "../Util", "./../GlobalDebug", "./BodyHelper", "../Color", "../ExtendedMatter"], function (require, exports, matter_js_1, ElectricMotor_1, interpreter_constants_1, interpreter_interpreter_1, RobotSimBehaviour_1, Wheel_1, ColorSensor_1, Ray_1, Entity_1, Util_1, GlobalDebug_1, BodyHelper_1, Color_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Robot = exports.sensorTypeStrings = void 0;
    exports.sensorTypeStrings = ["TOUCH", "GYRO", "COLOR", "ULTRASONIC", "INFRARED", "SOUND", "COMPASS",
        // german description: "HT Infrarotsensor"
        "IRSEEKER",
        // does not work in RobertaLab?!
        "HT_COLOR",
    ];
    var Robot = /** @class */ (function () {
        function Robot(robot) {
            this.updateSensorGraphics = true;
            /**
             * The color sensors of the robot
             */
            this.colorSensors = {};
            /**
             * The ultrasonic sensors of the robot
             */
            this.ultrasonicSensors = {};
            /**
             * The touch sensors of the robot
             */
            this.touchSensors = {};
            /**
             * The gyro sensors of the robot
             */
            this.gyroSensors = new Map();
            this.programCode = null;
            /**
             * Time to wait until the next command should be executed (in internal units)
             */
            this.delay = 0;
            /**
             * Settings for the usage of `endEncoder`
             */
            this.endEncoderSettings = {
                /**
                 * Maximum encoder angle difference in radians.
                 * End condition: `abs(encoder - endEncoder) < angleAccuracy`
                 */
                maxAngleDifference: 0.02,
                /**
                 * Maximum encoder angular velocity accuracy in radians/'internal seconds' of the driving wheels.
                 * End condition: `abs(wheel.angularVelocity) < maxAngularVelocity`
                 */
                maxAngularVelocity: 0.02,
                /**
                 * Given the encoder difference `encoderDiff = endEncoder - encoder`, use
                 * `Util.continuousSign(encoderDiff, maxForceControlEncoderDifference)`
                 * as multiplier to the maximum force.
                 */
                maxForceControlEncoderDifference: 0.2
            };
            /**
             * For given value `vGiven` calculate the actual one `v = vGiven * factor`
             */
            this.calibrationParameters = {
                /**
                 * Works for all speeds with an error of ±1.2%
                 */
                rotationAngleFactor: 0.6333,
                /**
                 * Valid for motor force below 84%. At 100% the error is about 10%.
                 */
                driveForwardDistanceFactor: 0.76
            };
            /**
             * robot type
             */
            this.type = 'default';
            this.transferWheelForcesToRobotBody = false;
            this.children = [];
            /**
             * The torque multiplier for the left wheel
             */
            this.leftForce = 0;
            /**
             * The torque multiplier for the right wheel
             */
            this.rightForce = 0;
            this.encoder = {
                left: 0,
                right: 0
            };
            this.wheelDriveFriction = 0.03;
            this.wheelSlideFriction = 0.07;
            this.needsNewCommands = true;
            this.endEncoder = null;
            this.scene = robot.scene;
            this.bodyEntity = robot.body;
            this.body = robot.body.getPhysicsBody();
            this.leftDrivingWheel = robot.leftDrivingWheel;
            this.rightDrivingWheel = robot.rightDrivingWheel;
            this.wheelsList = [this.leftDrivingWheel, this.rightDrivingWheel].concat(robot.otherWheels);
            this.bodyContainer = this.bodyEntity.getDrawable();
            this.physicsWheelsList = [];
            this.physicsComposite = matter_js_1.Composite.create();
            this.robotBehaviour = new RobotSimBehaviour_1.RobotSimBehaviour(this.scene.unit);
            this.updatePhysicsObject();
            this.addChild(this.bodyEntity);
            var t = this;
            this.wheelsList.forEach(function (wheel) { return t.addChild(wheel); });
            this.addDebugSettings();
        }
        Robot.prototype.setRobotType = function (type) {
            this.type = type;
            // TODO: change things
        };
        Robot.prototype.addDebugSettings = function () {
            var _this_1 = this;
            var DebugGui = this.scene.getDebugGuiDynamic();
            if (DebugGui) {
                var robotFolder = DebugGui.addFolder('Robot');
                var pos = robotFolder.addFolder('Position');
                pos.addUpdatable('x', function () { return _this_1.body.position.x; });
                pos.addUpdatable('y', function () { return _this_1.body.position.x; });
                robotFolder.add(this, "transferWheelForcesToRobotBody");
                var wheelFolder_1 = robotFolder.addFolder('Wheels');
                wheelFolder_1.add(this.endEncoderSettings, "maxAngleDifference", 0, 0.3);
                wheelFolder_1.add(this.endEncoderSettings, "maxAngularVelocity", 0, 0.3);
                wheelFolder_1.add(this.endEncoderSettings, "maxForceControlEncoderDifference", 0, 0.3);
                var control = {
                    alongStepFunctionWidth: 0.1,
                    orthStepFunctionWidth: 0.1,
                    rollingFriction: this.wheelsList[0].rollingFriction,
                    slideFriction: this.wheelsList[0].slideFriction
                };
                wheelFolder_1.add(control, 'alongStepFunctionWidth', 0, 0.1).onChange(function (value) {
                    _this_1.wheelsList.forEach(function (wheel) { return wheel.alongStepFunctionWidth = value; });
                    wheelFolder_1.updateDisplay();
                });
                wheelFolder_1.add(control, 'orthStepFunctionWidth', 0, 0.1).onChange(function (value) {
                    _this_1.wheelsList.forEach(function (wheel) { return wheel.orthStepFunctionWidth = value; });
                    wheelFolder_1.updateDisplay();
                });
                wheelFolder_1.add(control, 'rollingFriction').onChange(function (value) {
                    _this_1.wheelsList.forEach(function (wheel) { return wheel.rollingFriction = value; });
                    wheelFolder_1.updateDisplay();
                });
                wheelFolder_1.add(control, 'slideFriction').onChange(function (value) {
                    _this_1.wheelsList.forEach(function (wheel) { return wheel.slideFriction = value; });
                    wheelFolder_1.updateDisplay();
                });
                this.wheelsList[0]._addDebugGui(wheelFolder_1.addFolder('Wheel Left'));
                this.wheelsList[1]._addDebugGui(wheelFolder_1.addFolder('Wheel Right'));
                this.wheelsList[2]._addDebugGui(wheelFolder_1.addFolder('Wheel Back'));
                DebugGui.addButton("Download Program (JSON)", function () {
                    return GlobalDebug_1.downloadFile("program.json", [JSON.stringify(_this_1.programCode, undefined, "\t")]);
                });
            }
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
                //     Util.vectorSub(wheel.position, this.body.position), Vector.create(), {
                //         angularFrequency: 2 * Math.PI * 0.6,
                //         damping: 1.0,
                //         length: 0//Vector.magnitude(Util.vectorSub(this.body.position, wheel.position))
                //     })
                // const constraint2 = new CustomConstraint(
                //     this.body, wheel,
                //     Vector.create(), Util.vectorSub(this.body.position, wheel.position), {
                //         angularFrequency: 2 * Math.PI * 0.6,
                //         damping: 1.0,
                //         length: 0//Vector.magnitude(Util.vectorSub(this.body.position, wheel.position))
                //     })
                // this.customConstraints.push(constraint1)
                // this.customConstraints.push(constraint2)
                _this_1.physicsComposite.addRigidBodyConstraints(_this_1.body, wheel, 0.1, 0.1);
            });
            this.body.frictionAir = 0.0;
        };
        Robot.prototype.IEntity = function () { };
        Robot.prototype.getScene = function () {
            return this.scene;
        };
        Robot.prototype.getParent = function () {
            return this.parent;
        };
        Robot.prototype._setParent = function (parent) {
            this.parent = parent;
        };
        Robot.prototype.IPhysicsEntity = function () { };
        Robot.prototype.getPhysicsObject = function () {
            return this.physicsComposite;
        };
        Robot.prototype.IPhysicsCompositeEntity = function () { };
        Robot.prototype.getPhysicsComposite = function () {
            return this.physicsComposite;
        };
        Robot.prototype.IContainerEntity = function () { };
        Robot.prototype.getChildren = function () {
            return this.children;
        };
        Robot.prototype.addChild = function (child) {
            var _a;
            (_a = child.getParent()) === null || _a === void 0 ? void 0 : _a.removeChild(child);
            child._setParent(this);
            this.children.push(child);
            if (this.scene.getEntityManager().containsEntity(this)) {
                this.scene.addEntity(child);
            }
        };
        Robot.prototype.removeChild = function (child) {
            child._setParent(undefined);
            Util_1.Util.removeFromArray(this.children, child);
            this.scene.removeEntity(child);
        };
        /**
         * Sets the position and rotation of the robot. (Body, wheels and sensors)
         *
         * @param position Position of the robot body in meters
         * @param rotation Rotation of the robot body in radians
         */
        Robot.prototype.setPose = function (position, rotation, inRadians) {
            if (inRadians === void 0) { inRadians = true; }
            matter_js_1.Composite.translate(this.physicsComposite, Util_1.Util.vectorSub(position, this.body.position));
            if (!inRadians) {
                rotation *= 2 * Math.PI / 360;
            }
            matter_js_1.Composite.rotate(this.physicsComposite, rotation - this.body.angle, this.body.position);
        };
        Robot.prototype.removeAllSensors = function () {
            Util_1.Util.nonNullObjectValues(this.colorSensors).forEach(function (c) { return c.removeGraphicsFromParent(); });
            Util_1.Util.nonNullObjectValues(this.ultrasonicSensors).forEach(function (u) { return u.removeGraphicsFromParent(); });
            Util_1.Util.nonNullObjectValues(this.touchSensors).forEach(function (t) { return t.scene.removeEntity(t); });
            this.colorSensors = {};
            this.ultrasonicSensors = {};
            this.touchSensors = {};
        };
        /**
         * Returns the color sensor which can be `undefined`
         */
        Robot.prototype.getColorSensors = function () {
            return Util_1.Util.nonNullObjectValues(this.colorSensors);
        };
        /**
         * Sets the color sensor at the position (x,y) in meters
         *
         * @param port the port of the sensor
         * @param x x position of the sensor in meters
         * @param y y position of the sensor in meters
         * @param graphicsRadius the radius of the circle graphic in meters
         * @returns false if a color sensor at `port` already exists and a new color sensor was not added
         */
        Robot.prototype.addColorSensor = function (port, x, y, graphicsRadius) {
            if (this.colorSensors[port]) {
                return false;
            }
            var colorSensor = new ColorSensor_1.ColorSensor(this.scene.unit, matter_js_1.Vector.create(x, y), graphicsRadius);
            this.colorSensors[port] = colorSensor;
            this.bodyContainer.addChild(colorSensor.graphics);
            return true;
        };
        Robot.prototype.getUltrasonicSensors = function () {
            return Util_1.Util.nonNullObjectValues(this.ultrasonicSensors);
        };
        Robot.prototype.addUltrasonicSensor = function (port, ultrasonicSensor) {
            if (this.ultrasonicSensors[port]) {
                return false;
            }
            this.ultrasonicSensors[port] = ultrasonicSensor;
            this.bodyContainer.addChild(ultrasonicSensor.graphics);
            return true;
        };
        Robot.prototype.getTouchSensors = function () {
            return Util_1.Util.nonNullObjectValues(this.touchSensors);
        };
        Robot.prototype.addGyroSensor = function (port, gyroSensor) {
            if (this.gyroSensors.has(port)) {
                return false;
            }
            this.gyroSensors.set(port, gyroSensor);
            return true;
        };
        /**
         * Adds `touchSensor` to `this.touchSensors` if the port is not occupied
         *
         * @param port The port of the touch sensor
         * @param touchSensor The touch sensor which will be added
         * @returns false if a touch sensor at `port` already exists and the new touch sensor was not added
         */
        Robot.prototype.addTouchSensor = function (port, touchSensor) {
            if (this.touchSensors[port]) {
                return false;
            }
            this.addChild(touchSensor);
            var sensorBody = touchSensor.physicsBody;
            matter_js_1.Body.rotate(sensorBody, this.body.angle);
            matter_js_1.Body.setPosition(sensorBody, matter_js_1.Vector.add(this.body.position, matter_js_1.Vector.rotate(touchSensor.physicsBody.position, this.body.angle)));
            matter_js_1.Composite.add(this.physicsComposite, sensorBody);
            this.physicsComposite.addRigidBodyConstraints(this.body, sensorBody, 0.3, 0.3);
            this.touchSensors[port] = touchSensor;
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
            this.robotBehaviour = new RobotSimBehaviour_1.RobotSimBehaviour(this.scene.unit);
            this.interpreter = new interpreter_interpreter_1.Interpreter(this.programCode, this.robotBehaviour, function () {
                _this.programTerminated();
            }, breakpoints);
            this.resetInternalState();
            return this.interpreter;
        };
        Robot.prototype.programTerminated = function () {
            console.log("Interpreter terminated");
        };
        // TODO: (Remove) it is an old but simpler implementation than `Wheel`
        Robot.prototype.updateWheelVelocity = function (wheel, dt) {
            var vec = this.vectorAlongBody(wheel);
            var velocityAlongBody = matter_js_1.Vector.mult(vec, matter_js_1.Vector.dot(vec, wheel.velocity));
            var velocityOrthBody = Util_1.Util.vectorSub(wheel.velocity, velocityAlongBody);
            var velocityChange = Util_1.Util.vectorAdd(matter_js_1.Vector.mult(velocityAlongBody, -this.wheelDriveFriction), matter_js_1.Vector.mult(velocityOrthBody, -this.wheelSlideFriction));
            // divide two times by `dt` since the simulation calculates velocity changes by adding
            // force/mass * dt
            matter_js_1.Body.applyForce(wheel, wheel.position, matter_js_1.Vector.mult(velocityChange, wheel.mass / dt));
        };
        /**
         * Reset the internal state of the robot. E.g. `endEncoder`, `leftForce`
         */
        Robot.prototype.resetInternalState = function () {
            this.needsNewCommands = true;
            this.endEncoder = null;
            this.leftForce = 0;
            this.rightForce = 0;
        };
        // IUpdatableEntity
        Robot.prototype.IUpdatableEntity = function () { };
        /**
         * Updates the robot with time step 'dt'.
         * @param dt The time step in internal units
         */
        Robot.prototype.update = function (dt) {
            var _this_1 = this;
            // update wheels velocities
            var gravitationalAcceleration = this.scene.unit.getAcceleration(9.81);
            var robotBodyGravitationalForce = gravitationalAcceleration * this.body.mass / this.wheelsList.length;
            this.wheelsList.forEach(function (wheel) {
                wheel.applyNormalForce(robotBodyGravitationalForce + wheel.physicsBody.mass * gravitationalAcceleration);
                wheel.update(dt);
                if (_this_1.transferWheelForcesToRobotBody) {
                    var force = wheel._wheelForceVector;
                    matter_js_1.Body.applyForce(wheel.physicsBody, wheel.physicsBody.position, matter_js_1.Vector.neg(force));
                    matter_js_1.Body.applyForce(_this_1.body, wheel.physicsBody.position, force);
                }
            });
            // update sensors
            this.updateRobotBehaviourHardwareStateSensors();
            if (!this.interpreter) {
                return;
            }
            if (this.delay > 0) {
                this.delay -= dt; // reduce delay by dt each tick
            }
            else {
                if (this.interpreter.isTerminated()) {
                    this.resetInternalState();
                }
                else if (!this.scene.getProgramManager().isProgramPaused() && this.needsNewCommands) {
                    // get delay from operation and convert seconds to internal time unit
                    this.delay = this.scene.getUnitConverter().getTime(this.interpreter.runNOperations(1000) / 1000);
                }
            }
            var t = this;
            /**
             * Uses `encoder` to reach the values of `endEncoder` by setting the appropriate values
             *
             * @param speedLeft Use magnitude as maximum left speed (can be negative)
             * @param speedRight Use magnitude as maximum right speed (can be negative)
             */
            function useEndEncoder(speedLeft, speedRight) {
                if (!t.endEncoder) {
                    return;
                }
                var encoderDifference = {
                    left: t.endEncoder.left - t.encoder.left,
                    right: t.endEncoder.right - t.encoder.right
                };
                var stopEncoder = Math.abs(encoderDifference.left) < t.endEncoderSettings.maxAngleDifference &&
                    Math.abs(encoderDifference.right) < t.endEncoderSettings.maxAngleDifference &&
                    Math.abs(t.leftDrivingWheel.angularVelocity) < t.endEncoderSettings.maxAngularVelocity &&
                    Math.abs(t.rightDrivingWheel.angularVelocity) < t.endEncoderSettings.maxAngularVelocity;
                if (stopEncoder) {
                    // on end
                    t.endEncoder = null;
                    t.robotBehaviour.resetCommands();
                    t.needsNewCommands = true;
                }
                else {
                    var maxDifference = t.endEncoderSettings.maxForceControlEncoderDifference;
                    t.leftForce = Util_1.Util.continuousSign(encoderDifference.left, maxDifference) * Math.abs(speedLeft);
                    t.rightForce = Util_1.Util.continuousSign(encoderDifference.right, maxDifference) * Math.abs(speedRight);
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
                        var driveFactor = 1 / this.calibrationParameters.driveForwardDistanceFactor;
                        this.endEncoder = {
                            left: this.encoder.left + driveData.distance / this.leftDrivingWheel.wheelRadius * driveData.speed.left / averageSpeed * driveFactor,
                            right: this.encoder.right + driveData.distance / this.rightDrivingWheel.wheelRadius * driveData.speed.right / averageSpeed * driveFactor
                        };
                    }
                    useEndEncoder(driveData.speed.left, driveData.speed.right);
                }
                if (driveData.speed && driveData.distance == undefined) {
                    this.leftForce = driveData.speed.left;
                    this.rightForce = driveData.speed.right;
                    this.robotBehaviour.drive = undefined;
                }
            }
            var rotateData = this.robotBehaviour.rotate;
            if (rotateData) {
                if (rotateData.angle) {
                    if (!this.endEncoder) {
                        this.needsNewCommands = false;
                        /** also wheel distance */
                        var axleLength = Util_1.Util.vectorDistance(this.leftDrivingWheel.physicsBody.position, this.rightDrivingWheel.physicsBody.position);
                        var wheelDrivingDistance = rotateData.angle * 0.5 * axleLength;
                        // left rotation for `angle * speed > 0`
                        var rotationFactor = Math.sign(rotateData.speed) / this.calibrationParameters.rotationAngleFactor;
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
                        this.leftForce = -rotationSpeed;
                        this.rightForce = rotationSpeed;
                    }
                    else {
                        this.leftForce = rotationSpeed;
                        this.rightForce = -rotationSpeed;
                    }
                    this.robotBehaviour.rotate = undefined;
                }
            }
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
            this.leftDrivingWheel.applyTorqueFromMotor(ElectricMotor_1.ElectricMotor.EV3(this.scene.unit), this.leftForce);
            this.rightDrivingWheel.applyTorqueFromMotor(ElectricMotor_1.ElectricMotor.EV3(this.scene.unit), this.rightForce);
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
        Robot.prototype.addHTMLSensorValuesTo = function (list) {
            var _a, _b, _c, _d;
            var s = this.scene;
            var appendAny = function (label, value) { list.push({ label: label, value: value }); };
            var append = function (label, value, end) {
                list.push({ label: label, value: Math.round(value * 1000000) / 1000000 + (end !== null && end !== void 0 ? end : "") });
            };
            var sensors = this.robotBehaviour.getHardwareStateSensors();
            append("Robot X", this.body.position.x);
            append("Robot Y", this.body.position.y);
            append("Robot θ", this.body.angle * 180 / Math.PI, "°");
            append("Motor left", Util_1.Util.toDegrees((_b = (_a = sensors.encoder) === null || _a === void 0 ? void 0 : _a.left) !== null && _b !== void 0 ? _b : 0), "°");
            append("Motor right", Util_1.Util.toDegrees((_d = (_c = sensors.encoder) === null || _c === void 0 ? void 0 : _c.right) !== null && _d !== void 0 ? _d : 0), "°");
            for (var port in this.touchSensors) {
                appendAny("Touch Sensor " + port, this.touchSensors[port].getIsTouched());
            }
            for (var port in this.colorSensors) {
                append("Light Sensor " + port, this.colorSensors[port].getDetectedBrightness() * 100, "%");
            }
            for (var port in this.colorSensors) {
                appendAny("Color Sensor " + port, "<span style=\"width: 20px; background-color:" + this.colorSensors[port].getColorHexValueString() + "\">&nbsp;</span>");
            }
            for (var port in this.ultrasonicSensors) {
                append("Ultra Sensor " + port, 100 * s.unit.fromLength(this.ultrasonicSensors[port].getMeasuredDistance()), "cm");
            }
        };
        /**
         * Returns the absolute position relative to `this.body`
         */
        Robot.prototype.getAbsolutePosition = function (relativePosition) {
            return Util_1.Util.vectorAdd(this.body.position, matter_js_1.Vector.rotate(relativePosition, this.body.angle));
        };
        Robot.prototype.updateRobotBehaviourHardwareStateSensors = function () {
            var e_1, _a;
            var _b, _c;
            var sensors = this.robotBehaviour.getHardwareStateSensors();
            // encoder
            sensors.encoder = {
                left: this.encoder.left,
                right: this.encoder.right
            };
            // gyo sensor
            // Note: OpenRoberta has a bug for the gyro.rate where they calculate it by
            // angleDifference * timeDifference but it should be angleDifference / timeDifference
            var gyroData = (_b = sensors.gyro) !== null && _b !== void 0 ? _b : {};
            var gyroRate = Util_1.Util.toDegrees(this.body.angularVelocity);
            var gyroAngleDifference = Util_1.Util.toDegrees(this.body.angle - this.body.anglePrev);
            var dt = this.scene.getDT();
            try {
                for (var _d = __values(this.gyroSensors), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var _f = __read(_e.value, 2), port = _f[0], gyroSensor = _f[1];
                    var referenceAngle = (_c = this.robotBehaviour.getGyroReferenceAngle(port)) !== null && _c !== void 0 ? _c : 0;
                    var angle = Util_1.Util.toDegrees(this.body.angle);
                    gyroSensor.update(angle, referenceAngle, dt);
                    // gyroData uses the 'true' angle instead of '' since the referenceAngle/"angleReset" is used
                    // in 'RobotSimBehaviour.getSensorValue'
                    gyroData[port] = {
                        angle: angle,
                        rate: gyroRate
                    };
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
            sensors.gyro = gyroData;
            var robotBodies = Util_1.Util.nonNullObjectValues(this.touchSensors).map(function (touchSensor) { return touchSensor.getPhysicsBody(); })
                .concat(this.physicsWheelsList, this.body);
            // color
            if (!sensors.color) {
                sensors.color = {};
            }
            for (var port in this.colorSensors) {
                var colorSensor = this.colorSensors[port];
                var colorSensorPosition = this.getAbsolutePosition(colorSensor.position);
                // the color array might be of length 4 or 16 (rgba with image size 1x1 or 2x2)
                var color = this.scene.getContainers().getGroundImageData(colorSensorPosition.x, colorSensorPosition.y, 1, 1).data;
                var r = color[0], g = color[1], b = color[2];
                colorSensor.setDetectedColor(r, g, b, this.updateSensorGraphics);
                var hsv = Color_1.rgbToHsv(r, g, b);
                var colour = Color_1.hsvToColorName(hsv);
                sensors.color[port] = {
                    ambientlight: 0,
                    colorValue: colour,
                    colour: colour,
                    light: ((r + g + b) / 3 / 2.55),
                    rgb: [r, g, b]
                };
            }
            var allBodies = this.scene.getAllPhysicsBodies();
            // ultrasonic sensor
            if (!sensors.ultrasonic) {
                sensors.ultrasonic = {};
            }
            if (!sensors.infrared) {
                sensors.infrared = {};
            }
            var _loop_1 = function (port) {
                var ultrasonicSensor = this_1.ultrasonicSensors[port];
                var sensorPosition = this_1.getAbsolutePosition(ultrasonicSensor.position);
                var ultrasonicDistance = void 0;
                var nearestPoint;
                if (BodyHelper_1.BodyHelper.someBodyContains(sensorPosition, allBodies, robotBodies)) {
                    ultrasonicDistance = 0;
                }
                else {
                    var halfAngle = ultrasonicSensor.angularRange / 2;
                    var angle = ultrasonicSensor.angle;
                    var rays = [
                        matter_js_1.Vector.rotate(matter_js_1.Vector.create(1, 0), angle + halfAngle + this_1.body.angle),
                        matter_js_1.Vector.rotate(matter_js_1.Vector.create(1, 0), angle - halfAngle + this_1.body.angle)
                    ]
                        .map(function (v) { return new Ray_1.Ray(sensorPosition, v); });
                    // (point - sensorPos) * vec > 0
                    var vectors_1 = rays.map(function (r) { return matter_js_1.Vector.perp(r.directionVector); });
                    var dotProducts_1 = vectors_1.map(function (v) { return matter_js_1.Vector.dot(v, sensorPosition); });
                    nearestPoint = BodyHelper_1.BodyHelper.getNearestPointTo(sensorPosition, allBodies, robotBodies, function (point) {
                        return matter_js_1.Vector.dot(point, vectors_1[0]) < dotProducts_1[0]
                            && matter_js_1.Vector.dot(point, vectors_1[1]) > dotProducts_1[1];
                    });
                    var minDistanceSquared_1 = nearestPoint ? Util_1.Util.vectorDistanceSquared(nearestPoint, sensorPosition) : Infinity;
                    var intersectionPoints = BodyHelper_1.BodyHelper.intersectionPointsWithLine(rays[0], allBodies, robotBodies).concat(BodyHelper_1.BodyHelper.intersectionPointsWithLine(rays[1], allBodies, robotBodies));
                    intersectionPoints.forEach(function (intersectionPoint) {
                        var distanceSquared = Util_1.Util.vectorDistanceSquared(intersectionPoint, sensorPosition);
                        if (distanceSquared < minDistanceSquared_1) {
                            minDistanceSquared_1 = distanceSquared;
                            nearestPoint = intersectionPoint;
                        }
                    });
                    ultrasonicDistance = nearestPoint ? Util_1.Util.vectorDistance(nearestPoint, sensorPosition) : Infinity;
                }
                ultrasonicSensor.setMeasuredDistance(ultrasonicDistance, this_1.updateSensorGraphics);
                if (this_1.updateSensorGraphics) {
                    // update nearestPoint
                    if (nearestPoint != undefined) {
                        if (!this_1.debugGraphics) {
                            this_1.debugGraphics = new PIXI.Graphics()
                                .beginFill(0xFF0000)
                                .drawRect(-5, -5, 10, 10)
                                .endFill();
                            this_1.bodyContainer.parent.addChild(this_1.debugGraphics);
                        }
                        this_1.debugGraphics.position.set(nearestPoint.x, nearestPoint.y);
                        this_1.debugGraphics.visible = ultrasonicDistance <= ultrasonicSensor.maximumMeasurableDistance;
                    }
                    else if (this_1.debugGraphics != undefined) {
                        this_1.debugGraphics.visible = false;
                    }
                }
                ultrasonicDistance = this_1.scene.unit.fromLength(ultrasonicDistance);
                sensors.ultrasonic[port] = {
                    // `distance` is in cm
                    distance: Math.min(ultrasonicDistance, ultrasonicSensor.maximumMeasurableDistance) * 100,
                    presence: false
                };
                // infrared sensor (use ultrasonic distance)
                sensors.infrared[port] = {
                    // `distance` is in cm and at maximum 70cm
                    distance: Math.min(ultrasonicDistance, 0.7) * 100,
                    presence: false
                };
            };
            var this_1 = this;
            for (var port in this.ultrasonicSensors) {
                _loop_1(port);
            }
            // touch sensor
            if (!sensors.touch) {
                sensors.touch = {};
            }
            for (var port in this.touchSensors) {
                var touchSensor = this.touchSensors[port];
                touchSensor.setIsTouched(BodyHelper_1.BodyHelper.bodyIntersectsOther(touchSensor.physicsBody, allBodies));
                sensors.touch[port] = touchSensor.getIsTouched();
            }
        };
        /**
         * LEGO EV3 like robot with 2 main wheels and one with less friction (e.g. swivel wheel)
         *
         * @param scale scale of the robot
         */
        Robot.default = function (scene, scale) {
            if (scale === void 0) { scale = 1; }
            var frontWheel = Wheel_1.Wheel.create(scene, 27 * scale, 0, 10 * scale, 10 * scale);
            frontWheel.slideFriction = 0.1;
            frontWheel.rollingFriction = 0.0;
            return new Robot({
                scene: scene,
                body: Entity_1.PhysicsRectEntity.createWithContainer(scene, 0, 0, 40 * scale, 30 * scale),
                leftDrivingWheel: Wheel_1.Wheel.create(scene, -0, -22 * scale, 20 * scale, 10 * scale),
                rightDrivingWheel: Wheel_1.Wheel.create(scene, -0, 22 * scale, 20 * scale, 10 * scale),
                otherWheels: [
                    frontWheel
                ]
            });
        };
        /**
         * Long robot with 4 wheels
         */
        Robot.default2 = function (scene) {
            return new Robot({
                scene: scene,
                body: Entity_1.PhysicsRectEntity.createWithContainer(scene, 0, 0, 40, 30),
                leftDrivingWheel: Wheel_1.Wheel.create(scene, -50, -20, 20, 10),
                rightDrivingWheel: Wheel_1.Wheel.create(scene, -50, 20, 20, 10),
                otherWheels: [
                    Wheel_1.Wheel.create(scene, 50, -15, 20, 10),
                    Wheel_1.Wheel.create(scene, 50, 15, 20, 10)
                ]
            });
        };
        // TODO: Use real robot parameters
        /**
         * Similar to the EV3 LEGO robot
         *
         * Real dimensions:
         * - brick: (xSize: 0.11m, ySize: 0.072m, mass: 0.268kg)
         * - wheel: (diameter: 0.043m, width: 0.022m, mass: 0.013kg, rollingFriction: 1.1°, slideFriction: 47.3°)
         * - motor: (mass: 0.080kg)
         * - 100% speed: (1m ca. 3.19s)
         * - total mass: 0.611kg
         */
        Robot.EV3 = function (scene) {
            var wheel = { diameter: 0.05, width: 0.02 };
            // TODO: Constraints are broken, if the front wheel has less mass (front wheel mass may be 0.030)
            var backWheel = Wheel_1.Wheel.create(scene, -0.09, 0, wheel.width, wheel.width, 0.30);
            backWheel.slideFriction = 0.05;
            backWheel.rollingFriction = 0.03;
            var robotBody = Entity_1.PhysicsRectEntity.createWithContainer(scene, 0, 0, 0.15, 0.10, { color: 0xf97306, strokeColor: 0xffffff, strokeWidth: 1, strokeAlpha: 0.5, strokeAlignment: 1 });
            matter_js_1.Body.setMass(robotBody.getPhysicsBody(), scene.unit.getMass(0.300));
            var robot = new Robot({
                scene: scene,
                body: robotBody,
                leftDrivingWheel: Wheel_1.Wheel.create(scene, 0, -0.07, wheel.diameter, wheel.width, 0.050),
                rightDrivingWheel: Wheel_1.Wheel.create(scene, 0, 0.07, wheel.diameter, wheel.width, 0.050),
                otherWheels: [
                    backWheel
                ]
            });
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
            var pointA = Util_1.Util.vectorAdd(this.bodyA.position, rotatedPositionA);
            /** positionB in world space */
            var pointB = Util_1.Util.vectorAdd(this.bodyB.position, rotatedPositionB);
            var relativePosition = Util_1.Util.vectorSub(pointB, pointA);
            var length = matter_js_1.Vector.magnitude(relativePosition);
            var unitRelativePosition = matter_js_1.Vector.mult(relativePosition, 1 / (length > 0 ? length : 1e-10));
            var lengthDelta = length - this.length;
            /** velocity of positionA in world space */
            var velocityA = Util_1.Util.vectorAdd(this.bodyA.velocity, matter_js_1.Vector.mult(matter_js_1.Vector.perp(rotatedPositionA), this.bodyA.angularVelocity));
            /** velocity of positionB in world space */
            var velocityB = Util_1.Util.vectorAdd(this.bodyB.velocity, matter_js_1.Vector.mult(matter_js_1.Vector.perp(rotatedPositionB), this.bodyB.angularVelocity));
            var relativeVelocity = Util_1.Util.vectorSub(velocityB, velocityA);
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
