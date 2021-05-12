define(["require", "exports", "matter-js", "../Entity", "../Util", "./TouchSensor", "./UltrasonicSensor"], function (require, exports, matter_js_1, Entity_1, Util_1, TouchSensor_1, UltrasonicSensor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RobotConfigurator = void 0;
    var MaxSensorCount = /** @class */ (function () {
        function MaxSensorCount(maxCount) {
            this.maxCount = maxCount;
            this.length = maxCount;
        }
        return MaxSensorCount;
    }());
    var RobotConfigurator = /** @class */ (function () {
        function RobotConfigurator() {
        }
        RobotConfigurator.getMaxNumberOfSensors = function (portMap, sensor) {
            var _a, _b, _c;
            var length = (_b = (_a = portMap.get(sensor)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
            var sensorConfiguration = this.robotConfiguration[sensor];
            return Math.min(length, (_c = sensorConfiguration === null || sensorConfiguration === void 0 ? void 0 : sensorConfiguration.length) !== null && _c !== void 0 ? _c : 0);
        };
        RobotConfigurator.addColorSensor = function (robot, port, scene, configuration) {
            robot.addColorSensor(port, configuration.x, configuration.y);
        };
        RobotConfigurator.addTouchSensor = function (robot, port, scene, configuration) {
            var touchSensorBody = Entity_1.PhysicsRectEntity.create(scene, configuration.x, configuration.y, configuration.width, configuration.height, { color: 0xFF0000, strokeColor: 0xffffff, strokeWidth: 1, strokeAlpha: 0.5, strokeAlignment: 1 });
            matter_js_1.Body.setMass(touchSensorBody.getPhysicsBody(), scene.unit.getMass(configuration.mass));
            matter_js_1.Body.setAngle(touchSensorBody.getPhysicsBody(), Util_1.Util.toRadians(configuration.angle));
            robot.addTouchSensor(port, new TouchSensor_1.TouchSensor(scene, touchSensorBody));
        };
        RobotConfigurator.addUltrasonicSensor = function (robot, port, scene, configuration) {
            robot.addUltrasonicSensor(port, new UltrasonicSensor_1.UltrasonicSensor(scene.unit, matter_js_1.Vector.create(configuration.x, configuration.y), Util_1.Util.toRadians(configuration.angle), Util_1.Util.toRadians(configuration.angularRange)));
        };
        RobotConfigurator.addSensors = function (robot, portMap, sensorType, addSensor) {
            var _a;
            var sensorCount = this.getMaxNumberOfSensors(portMap, sensorType);
            var scene = robot.getScene();
            var ports = (_a = portMap.get(sensorType)) !== null && _a !== void 0 ? _a : [];
            /** any[][] | undefined[] | undefined */
            var allSensorsConfigurations = this.robotConfiguration[sensorType];
            /** any[] | undefined  where any[] is the array of values used for each port */
            var sensorsConfiguration = Util_1.Util.safeIndexing(allSensorsConfigurations, sensorCount - 1);
            for (var i = 0; i < sensorCount; i++) {
                addSensor(robot, ports[i], scene, Util_1.Util.safeIndexing(sensorsConfiguration, i));
            }
        };
        RobotConfigurator.configureRobot = function (robot, configuration) {
            var portMap = new Map();
            for (var port in configuration) {
                var sensorType = configuration[port];
                if (!portMap.has(sensorType)) {
                    portMap.set(sensorType, []);
                }
                portMap.get(sensorType).push(port);
                console.log('port: ' + port);
            }
            RobotConfigurator.addSensors(robot, portMap, "TOUCH", this.addTouchSensor);
            RobotConfigurator.addSensors(robot, portMap, "COLOR", this.addColorSensor);
            RobotConfigurator.addSensors(robot, portMap, "ULTRASONIC", this.addUltrasonicSensor);
            //RobotConfigurator.addSensors(robot, portMap, "COMPASS", never)
            //RobotConfigurator.addSensors(robot, portMap, "GYRO", never)
            //RobotConfigurator.addSensors(robot, portMap, "INFRARED", null)
            //RobotConfigurator.addSensors(robot, portMap, "SOUND", this.add)
        };
        RobotConfigurator.colorSensorOffset = 0.01;
        RobotConfigurator.ultrasonicSensorOffset = 0.01;
        RobotConfigurator.robotConfiguration = {
            TOUCH: [
                [{ x: 0.085, y: 0, width: 0.01, height: 0.12, angle: 0, mass: 0.05 }]
            ],
            COLOR: 
            // vertically centered colorsensors at the front of the robot
            Util_1.Util.closedRange(0, 3).map(function (count) {
                return Util_1.Util.closedRange(0, count).map(function (index) {
                    return { x: 0.06, y: (index - count / 2) * RobotConfigurator.colorSensorOffset };
                });
            }),
            ULTRASONIC: (function () {
                var o = RobotConfigurator.colorSensorOffset;
                return [
                    [{ x: 0.095, y: 0, angle: 0, angularRange: 90 }],
                    [
                        { x: 0.095, y: o / 2, angle: 20, angularRange: 60 },
                        { x: 0.095, y: -o / 2, angle: -20, angularRange: 60 }
                    ],
                    [
                        { x: 0.095, y: o, angle: 40, angularRange: 60 },
                        { x: 0.095, y: 0, angle: 0, angularRange: 60 },
                        { x: 0.095, y: -o, angle: -40, angularRange: 60 }
                    ],
                    [
                        { x: 0.095, y: 0.04, angle: 45, angularRange: 60 },
                        { x: 0.095, y: -0.04, angle: -45, angularRange: 60 },
                        { x: 0.095, y: 0.04, angle: 45 + 90, angularRange: 60 },
                        { x: 0.095, y: -0.04, angle: -45 - 90, angularRange: 60 }
                    ]
                ];
            })(),
            INFRARED: [],
            GYRO: new Array(4),
            SOUND: new Array(4),
            COMPASS: new Array(4),
        };
        return RobotConfigurator;
    }());
    exports.RobotConfigurator = RobotConfigurator;
});
