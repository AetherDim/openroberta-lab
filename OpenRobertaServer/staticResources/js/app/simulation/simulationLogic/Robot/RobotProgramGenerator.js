define(["require", "exports", "../Util"], function (require, exports, Util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RobotProgramGenerator = void 0;
    var RobotProgramGenerator = /** @class */ (function () {
        function RobotProgramGenerator() {
        }
        RobotProgramGenerator.generateProgram = function (operations) {
            return {
                javaScriptProgram: JSON.stringify({ "ops": Util_1.Util.flattenArray(operations) }, undefined, "\t")
            };
        };
        /**
         * @param speed from 0 to 100 (in %)
         * @param distance in meters
         */
        RobotProgramGenerator.driveForwardOpCodes = function (speed, distance) {
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
        };
        /**
         * @param speed from 0 to 100 (in %)
         * @param angle in degree
         */
        RobotProgramGenerator.rotateOpCodes = function (speed, angle, right) {
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
        };
        return RobotProgramGenerator;
    }());
    exports.RobotProgramGenerator = RobotProgramGenerator;
});
