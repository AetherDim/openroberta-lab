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
        return { "ops": Util_1.Util.flattenArray(operations) };
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
            this.rollingFriction = Util_1.Util.range(0.05, 0.3, 0.05);
            this.slideFriction = Util_1.Util.range(0.4, 1.0, 0.05);
            this.otherRollingFriction = Util_1.Util.range(0.03, 0.03, 0.01);
            this.otherSlideFriction = Util_1.Util.range(0.05, 0.05, 0.01);
            this.driveForwardSpeed = Util_1.Util.range(30, 30, 10);
            this.driveForwardDistance = Util_1.Util.range(0.2, 0.2, 0.1);
        }
        return KeyData;
    }());
    var TestScene3 = /** @class */ (function (_super) {
        __extends(TestScene3, _super);
        function TestScene3() {
            var _this = _super.call(this) || this;
            _this.time = 0.0;
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
            _this.shouldWait = false;
            _this.robot = Robot_1.Robot.EV3(_this);
            _this.robotTester = new RobotTester_1.RobotTester(_this.robot);
            _this.keyValues = Util_1.Util.allPropertiesTuples(_this.keyData);
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
            var _this = this;
            this.shouldWait = false;
            GlobalDebug_1.DebugGui === null || GlobalDebug_1.DebugGui === void 0 ? void 0 : GlobalDebug_1.DebugGui.addButton("Download data", function () { return GlobalDebug_1.downloadJSONFile("data.json", _this.data); });
            GlobalDebug_1.DebugGui === null || GlobalDebug_1.DebugGui === void 0 ? void 0 : GlobalDebug_1.DebugGui.addButton("Reset", function () { return _this.resetData(); });
            GlobalDebug_1.DebugGui === null || GlobalDebug_1.DebugGui === void 0 ? void 0 : GlobalDebug_1.DebugGui.addButton("Speeeeeed!!!!!", function () { return _this.setSpeedUpFactor(1000); });
            GlobalDebug_1.DebugGui === null || GlobalDebug_1.DebugGui === void 0 ? void 0 : GlobalDebug_1.DebugGui.add({ "progress": this.keyIndex + "/" + this.keyValues.length }, "progress");
            if (this.keyIndex == 0) {
                this.startWallTime = Date.now() / 1000;
            }
            GlobalDebug_1.DebugGui === null || GlobalDebug_1.DebugGui === void 0 ? void 0 : GlobalDebug_1.DebugGui.add({ "test timing": String(Date.now() / 1000 - this.startWallTime) }, "test timing");
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
                var program = false ? constructProgram([
                    driveForwardProgram(tuple.driveForwardSpeed, tuple.driveForwardDistance)
                ]) : Util_1.Util.simulation.storedPrograms;
                this.getProgramManager().setPrograms(program, true, undefined);
                this.getProgramManager().startProgram();
            }
            asyncChain.next();
        };
        TestScene3.prototype.onUpdatePostPhysics = function () {
            if (this.shouldWait) {
                return;
            }
            this.time += this.getDT();
            if (this.getProgramManager().allInterpretersTerminated()
                && this.keyIndex < this.keyValues.length) {
                if (Util_1.Util.vectorDistance(this.robot.body.position, this.prevRobotPosition) < this.endPositionAccuracy) {
                    // program terminated and robot does not move
                    this.data.push({
                        key: this.keyValues[this.keyIndex],
                        value: this.unit.fromLength(Util_1.Util.vectorDistance(this.initialPosition, this.prevRobotPosition))
                    });
                    // reset scene and automatically call 'onInit'
                    this.keyIndex += 1;
                    this.reset();
                    this.shouldWait = true;
                }
            }
            this.prevRobotPosition.x = this.robot.body.position.x;
            this.prevRobotPosition.y = this.robot.body.position.y;
        };
        return TestScene3;
    }(Scene_1.Scene));
    exports.TestScene3 = TestScene3;
});
