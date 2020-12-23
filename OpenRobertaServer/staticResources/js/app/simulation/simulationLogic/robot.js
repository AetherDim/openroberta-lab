define(["require", "exports", "matter-js", "./extendedMatter"], function (require, exports, matter_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Robot = void 0;
    var Robot = /** @class */ (function () {
        function Robot() {
            this.body = matter_js_1.Bodies.rectangle(0, 0, 40, 30);
            this.wheels = {
                rearLeft: matter_js_1.Bodies.rectangle(-50, -20, 20, 10),
                rearRight: matter_js_1.Bodies.rectangle(-50, 20, 20, 10),
                frontLeft: matter_js_1.Bodies.rectangle(50, -15, 20, 10),
                frontRight: matter_js_1.Bodies.rectangle(50, 15, 20, 10)
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
