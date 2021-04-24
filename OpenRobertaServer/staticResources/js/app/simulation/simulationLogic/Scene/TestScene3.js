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
    var KeyData = /** @class */ (function () {
        function KeyData() {
            // (0.05, 0.5, 0.05)
            this.rollingFriction = Util_1.Util.range(0.1, 0.1, 0.01);
            // (0.05, 1.0, 0.05)
            this.slideFriction = Util_1.Util.range(0.3, 0.3, 0.01);
            this.otherRollingFriction = Util_1.Util.range(0.03, 0.03, 0.01);
            this.otherSlideFriction = Util_1.Util.range(0.05, 0.05, 0.01);
            this.driveForwardSpeed = Util_1.Util.range(10, 100, 10);
            this.driveForwardDistance = Util_1.Util.range(0.1, 1.0, 0.1);
        }
        return KeyData;
    }());
    var TestScene3 = /** @class */ (function (_super) {
        __extends(TestScene3, _super);
        function TestScene3() {
            var _this = _super.call(this, "Test Scene 3") || this;
            _this.time = 0.0;
            /**
             * A timeout for this simulation test in internal simulation time
             */
            _this.simulationTestTimeout = 20.0;
            /**
             * Time since start of test in sections
             */
            _this.startWallTime = 0.0;
            _this.endPositionAccuracy = Infinity;
            _this.initialPosition = { x: 0.0, y: 0.0 };
            _this.prevRobotPosition = { x: 0.0, y: 0.0 };
            _this.data = [];
            _this.keyIndex = 0;
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
            _this.keyValues = Util_1.Util.allPropertiesTuples(_this.keyData);
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
            this.robot.setPose(this.initialPosition, 0);
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
                            driveForwardProgram(tuple.driveForwardSpeed, tuple.driveForwardDistance)
                        ])
                    ] : Util_1.Util.simulation.storedPrograms;
                this.getProgramManager().setPrograms(program, true, undefined);
                this.getProgramManager().startProgram();
            }
            asyncChain.next();
        };
        TestScene3.prototype.pushDataAndResetWithTimeout = function (didTimeOut) {
            this.data.push({
                key: this.keyValues[this.keyIndex],
                value: this.unit.fromLength(Util_1.Util.vectorDistance(this.initialPosition, this.prevRobotPosition)),
                didTimeOut: didTimeOut,
                simulationTime: this.time
            });
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
                    if (Util_1.Util.vectorDistance(this.robot.body.position, this.prevRobotPosition) < this.endPositionAccuracy) {
                        // program terminated and robot does not move
                        this.pushDataAndResetWithTimeout(false);
                    }
                }
            }
            this.prevRobotPosition.x = this.robot.body.position.x;
            this.prevRobotPosition.y = this.robot.body.position.y;
        };
        return TestScene3;
    }(Scene_1.Scene));
    exports.TestScene3 = TestScene3;
});
