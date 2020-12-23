define(["require", "exports", "matter-js", "./displayable", "./extendedMatter"], function (require, exports, matter_js_1, displayable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Robot = void 0;
    var Robot = /** @class */ (function () {
        function Robot() {
            /**
             * The body of the robot as `Body`s
             */
            this.body = displayable_1.createRect(0, 0, 40, 30);
            /**
             * The wheels of the robot as `Body`s
             */
            this.wheels = {
                rearLeft: displayable_1.createRect(-50, -20, 20, 10),
                rearRight: displayable_1.createRect(-50, 20, 20, 10),
                frontLeft: displayable_1.createRect(50, -15, 20, 10),
                frontRight: displayable_1.createRect(50, 15, 20, 10)
            };
            this.makePhysicsObject();
        }
        Robot.prototype.makePhysicsObject = function () {
            var _this = this;
            var wheels = [
                this.wheels.rearLeft,
                this.wheels.rearRight,
                this.wheels.frontLeft,
                this.wheels.frontRight
            ];
            this.physicsComposite = matter_js_1.Composite.create({ bodies: [this.body].concat(wheels) });
            // set friction
            wheels.forEach(function (wheel) {
                wheel.frictionAir = 0.3;
                _this.physicsComposite.addRigidBodyConstraints(_this.body, wheel, 0.1, 0.001);
            });
            this.body.frictionAir = 0.0;
        };
        return Robot;
    }());
    exports.Robot = Robot;
});
