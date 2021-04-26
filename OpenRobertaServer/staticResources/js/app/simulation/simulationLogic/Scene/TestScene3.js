var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "../GlobalDebug", "../Robot/Robot", "../Robot/RobotTester", "../Unit", "../Util", "./Scene"], function (require, exports, GlobalDebug_1, Robot_1, RobotTester_1, Unit_1, Util_1, Scene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestScene3 = void 0;
    function constructProgram(operations) {
        return {
            javaScriptConfiguration: { 1: "TOUCH", 2: "GYRO", 3: "COLOR", 4: "ULTRASONIC" },
            javaScriptProgram: JSON.stringify({ "ops": Util_1.Util.flattenArray(operations) }, undefined, "\t")
        };
    }
    /**
     * @param speed from 0 to 100 (in %)
     * @param distance in meters
     */
    function driveForwardProgram(speed, distance) {
        var uuidExpr1 = Util_1.Util.genUid();
        var uuidExpr2 = Util_1.Util.genUid();
        var uuidDriveAction = Util_1.Util.genUid();
        return [
            {
                "opc": "expr",
                "expr": "NUM_CONST",
                "+": [
                    uuidExpr1
                ],
                // speed
                "value": speed.toString()
            },
            {
                "opc": "expr",
                "expr": "NUM_CONST",
                "+": [
                    uuidExpr2
                ],
                "-": [
                    uuidExpr1
                ],
                // distance
                "value": (distance * 100).toString()
            },
            {
                "opc": "DriveAction",
                "speedOnly": false,
                "SetTime": false,
                "name": "ev3",
                "+": [
                    uuidDriveAction
                ],
                // forward/backward
                "driveDirection": "FOREWARD",
                "-": [
                    uuidExpr2
                ]
            },
            {
                "opc": "stopDrive",
                "name": "ev3"
            },
            {
                "opc": "stop",
                "-": [
                    uuidDriveAction
                ]
            }
        ];
    }
    /**
     * @param speed from 0 to 100 (in %)
     * @param angle in degree
     */
    function rotateProgram(speed, angle, right) {
        var uuidExpr1 = Util_1.Util.genUid();
        var uuidExpr2 = Util_1.Util.genUid();
        var uuidRotateAction = Util_1.Util.genUid();
        var dir = right ? 'right' : 'left';
        return [
            {
                "opc": "expr",
                "expr": "NUM_CONST",
                "+": [
                    uuidExpr1
                ],
                "value": speed.toString()
            },
            {
                "opc": "expr",
                "expr": "NUM_CONST",
                "+": [
                    uuidExpr2
                ],
                "-": [
                    uuidExpr1
                ],
                "value": angle.toString()
            },
            {
                "opc": "TurnAction",
                "speedOnly": false,
                "turnDirection": dir,
                "SetTime": false,
                "name": "ev3",
                "+": [
                    uuidRotateAction
                ],
                "-": [
                    uuidExpr2
                ]
            },
            {
                "opc": "stopDrive",
                "name": "ev3"
            },
            {
                "opc": "stop",
                "-": [
                    uuidRotateAction
                ]
            }
        ];
    }
    var KeyData = /** @class */ (function () {
        function KeyData() {
            // (0.05, 0.5, 0.05)
            this.rollingFriction = Util_1.Util.range(0.03, 0.03, 0.1);
            // (0.05, 1.0, 0.05)
            this.slideFriction = Util_1.Util.range(0.3, 0.3, 0.1);
            this.otherRollingFriction = Util_1.Util.range(0.03, 0.03, 0.01);
            this.otherSlideFriction = Util_1.Util.range(0.05, 0.05, 0.01);
            //driveForwardSpeed = Util.range(10, 100, 10)
            //driveForwardDistance = Util.range(0.1, 1.0, 0.1)
            this.rotateSpeed = Util_1.Util.range(5, 100, 5);
            this.rotateAngle = Util_1.Util.range(0, 180, 10);
            this.directionRight = [true];
        }
        return KeyData;
    }());
    var ValueHelper = /** @class */ (function () {
        /**
         * @param getSignedDistance a function which returns the signed distance from `start` to `end`. E.g. for numbers `end - start` and for points the norm distance.
         */
        function ValueHelper(name, initialValue, endMaxDelta, context, getNewValue, getSignedDistance) {
            this.name = name;
            this.initialValue = initialValue;
            this.previousValue = initialValue;
            this.endMaxDelta = endMaxDelta;
            this.context = context;
            this.getSignedDistance = getSignedDistance;
            this._getNewValue = getNewValue;
        }
        ValueHelper.prototype.getPreviousValue = function () {
            return this.previousValue;
        };
        ValueHelper.prototype.update = function () {
            this.previousValue = this._getNewValue(this.context);
        };
        ValueHelper.prototype.getNewValue = function () {
            return this._getNewValue(this.context);
        };
        /**
         * @returns the absolute distance between the current value (`getNewValue`) and the `previousValue`
         */
        ValueHelper.prototype.getDistanceToPreviousValue = function () {
            return Math.abs(this.getSignedDistance(this.previousValue, this._getNewValue(this.context)));
        };
        ValueHelper.prototype.getSignedDistanceToInitialValue = function () {
            return this.getSignedDistance(this.initialValue, this._getNewValue(this.context));
        };
        ValueHelper.fromNumber = function (opt) {
            return new ValueHelper(opt.name, opt.initialValue, opt.endMaxDelta, opt.context, opt.getNewValue, function (start, end) { return end - start; });
        };
        ValueHelper.fromVector = function (opt) {
            return new ValueHelper(opt.name, opt.initialValue, opt.endMaxDelta, opt.context, opt.getNewValue, function (v1, v2) { return Util_1.Util.vectorDistance(v1, v2); });
        };
        return ValueHelper;
    }());
    var TestScene3 = /** @class */ (function (_super) {
        __extends(TestScene3, _super);
        function TestScene3() {
            var _this = _super.call(this, "Test Scene 3") || this;
            _this.time = 0.0;
            /**
             * A timeout for this simulation test in internal simulation time
             */
            _this.simulationTestTimeout = 300.0;
            /**
             * Time since start of test in sections
             */
            _this.startWallTime = 0.0;
            _this.radianToAngleFactor = 180 / Math.PI;
            _this.robotPositionValue = ValueHelper.fromVector({
                name: "initPositionDistance",
                initialValue: { x: 0.0, y: 0.0 },
                endMaxDelta: Infinity,
                context: _this,
                getNewValue: function (c) { return c.robot.body.position; }
            });
            _this.robotRotationValue = ValueHelper.fromNumber({
                name: "initAngleDelta",
                initialValue: 0,
                endMaxDelta: Infinity,
                context: _this,
                getNewValue: function (c) { return c.robot.body.angle * c.radianToAngleFactor; }
            });
            /**
             * The array of `ValueHelper`s. Note that `initialValue` has to be set in `onInit`
             */
            _this.valueHelpers = [_this.robotPositionValue, _this.robotRotationValue];
            _this.data = [];
            _this.keyIndex = 0;
            /**
             * Shuffling the keyValues can improve the ETA
             */
            _this.randomizeKeyValues = true;
            _this.keyData = new KeyData();
            _this.keyValues = [];
            _this.testTime = 0;
            _this.shouldWait = false;
            _this.autostartSim = false;
            _this.robot = Robot_1.Robot.EV3(_this);
            _this.robotTester = new RobotTester_1.RobotTester(_this.robot);
            // set poll sim ticker time to 0
            // TODO: Maybe set it always to 0 and remove timeout argument for `Timer.asyncStop`
            _this.setSimTickerStopPollTime(0);
            // make tuples from 'keyData' and maybe shuffle them in order to get a better ETA
            _this.keyValues = Util_1.Util.allPropertiesTuples(_this.keyData);
            if (_this.randomizeKeyValues) {
                Util_1.Util.shuffle(_this.keyValues);
            }
            var DebugGui = _this.getDebugGuiStatic();
            DebugGui === null || DebugGui === void 0 ? void 0 : DebugGui.addButton("Download data", function () { return GlobalDebug_1.downloadJSONFile("data.json", _this.data); });
            DebugGui === null || DebugGui === void 0 ? void 0 : DebugGui.addButton("Speeeeeed!!!!!", function () { return _this.setSpeedUpFactor(1000); });
            DebugGui === null || DebugGui === void 0 ? void 0 : DebugGui.addUpdatable("progress", function () { return _this.keyIndex + "/" + _this.keyValues.length; });
            DebugGui === null || DebugGui === void 0 ? void 0 : DebugGui.addUpdatable("ETA", function () { return Util_1.Util.toTimeString(_this.testTime / _this.keyIndex * (_this.keyValues.length - _this.keyIndex)); });
            DebugGui === null || DebugGui === void 0 ? void 0 : DebugGui.addUpdatable("test timing", function () { return String(_this.testTime); });
            DebugGui === null || DebugGui === void 0 ? void 0 : DebugGui.addButton("Reset", function () {
                _this.resetData();
                _this.autostartSim = false;
                _this.reset();
            });
            DebugGui === null || DebugGui === void 0 ? void 0 : DebugGui.addButton("Restart", function () {
                _this.resetData();
                _this.autostartSim = true;
                _this.reset();
            });
            return _this;
        }
        TestScene3.prototype.getUnitConverter = function () {
            return new Unit_1.Unit({ m: 1000 });
        };
        TestScene3.prototype.resetData = function () {
            this.shouldWait = true;
            this.keyIndex = 0;
            this.data = [];
        };
        TestScene3.prototype.onInit = function (asyncChain) {
            this.shouldWait = false;
            this.testTime = Date.now() / 1000 - this.startWallTime;
            if (this.keyIndex == 0) {
                this.startWallTime = Date.now() / 1000;
            }
            this.time = 0.0;
            this.robot = Robot_1.Robot.EV3(this);
            this.robotTester = new RobotTester_1.RobotTester(this.robot);
            this.robot.setPose(this.robotPositionValue.initialValue, this.robotRotationValue.initialValue);
            this.addRobot(this.robot);
            // start program
            if (this.keyIndex < this.keyValues.length) {
                var tuple = this.keyValues[this.keyIndex];
                this.robotTester.setWheelsFriction({
                    driveWheels: {
                        rollingFriction: tuple.rollingFriction,
                        slideFriction: tuple.slideFriction
                    },
                    otherWheels: {
                        rollingFriction: tuple.otherRollingFriction,
                        slideFriction: tuple.otherSlideFriction
                    }
                });
                // run(false, undefined)
                var program = true ?
                    [
                        constructProgram([
                            //driveForwardProgram(tuple.driveForwardSpeed, tuple.driveForwardDistance)
                            rotateProgram(tuple.rotateSpeed, tuple.rotateAngle, tuple.directionRight)
                        ])
                    ] : Util_1.Util.simulation.storedPrograms;
                this.getProgramManager().setPrograms(program, true, undefined);
                this.getProgramManager().startProgram();
            }
            asyncChain.next();
        };
        TestScene3.prototype.pushDataAndResetWithTimeout = function (didTimeOut) {
            var value = {
                key: this.keyValues[this.keyIndex]
            };
            this.valueHelpers.forEach(function (keyValue) {
                value[keyValue.name] = keyValue.getSignedDistanceToInitialValue();
            });
            value.didTimeOut = didTimeOut,
                value.simulationTime = this.time;
            this.data.push(value);
            // reset scene and automatically call 'onInit'
            this.keyIndex += 1;
            this.autostartSim = this.keyIndex < this.keyValues.length;
            this.reset();
            this.shouldWait = true;
        };
        TestScene3.prototype.onUpdatePostPhysics = function () {
            if (this.shouldWait) {
                return;
            }
            this.time += this.getDT();
            if (this.keyIndex < this.keyValues.length) {
                // there is still some 'keyValue' left
                if (this.time > this.simulationTestTimeout) {
                    // timeout
                    this.pushDataAndResetWithTimeout(true);
                }
                if (this.getProgramManager().allInterpretersTerminated()) {
                    // program terminated
                    var finished_1 = true;
                    this.valueHelpers.forEach(function (keyValue) {
                        if (finished_1 && keyValue.getDistanceToPreviousValue() > keyValue.endMaxDelta) {
                            finished_1 = false;
                        }
                    });
                    if (finished_1) {
                        // program terminated and robot does not move
                        this.pushDataAndResetWithTimeout(false);
                    }
                }
            }
            this.valueHelpers.forEach(function (e) { return e.update(); });
        };
        return TestScene3;
    }(Scene_1.Scene));
    exports.TestScene3 = TestScene3;
});
