define(["require", "exports", "matter-js", "./displayable"], function (require, exports, matter_js_1, displayable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Wheel = void 0;
    var Wheel = /** @class */ (function () {
        /**
         * Creates a top down wheel at position `(x, y)` and `(width, height)`.
         * The wheel radius is half of the `width`.
         *
         * @param x
         * @param y
         * @param width
         * @param height
         */
        function Wheel(x, y, width, height) {
            this.rollingFriction = 0.03;
            this.slideFriction = 2.0;
            /**
             * Positive torque indirectly exerts a forward force along the body
             */
            this.torque = 0;
            /**
             * The force in the `z` direction
             */
            this.normalForce = 0;
            this.wheelAngle = 0;
            this.angularVelocity = 0;
            this.physicsWheel = displayable_1.createRect(x, y, width, height);
            this.wheelRadius = width / 2;
            this.momentOfInertia = 0.5 * this.physicsWheel.mass * Math.pow(this.wheelRadius, 2);
        }
        Wheel.prototype.applyTorque = function (torque) {
            this.torque += torque;
        };
        /**
         * @param motor the `ElectricMotor` which applies the torque
         * @param strength from -1 to 1 where 1 is forward in the direction of the wheel
         */
        Wheel.prototype.applyTorqueFromMotor = function (motor, strength) {
            this.applyTorque(strength * motor.getAbsTorqueForAngularVelocity(this.angularVelocity));
        };
        Wheel.prototype.applyNormalForce = function (force) {
            this.normalForce += force;
        };
        Wheel.prototype.continuousStepFunction = function (x, width) {
            if (Math.abs(x) > width) {
                return Math.sign(x);
            }
            return x / width;
        };
        Wheel.prototype.update = function (dt) {
            var wheel = this.physicsWheel;
            var vec = wheel.vectorAlongBody();
            var orthVec = matter_js_1.Vector.perp(vec);
            // torque from the rolling friction
            // rollingFriction = d/R and d * F_N = torque
            this.applyTorque(this.continuousStepFunction(wheel.velocityAlongBody(), 0.1)
                * this.rollingFriction * this.wheelRadius * this.normalForce);
            // TODO: already simulated by `wheelSlideFrictionForce`?
            // const rollingFrictionForce = this.normalForce * this.rollingFriction
            // torque for 
            var wheelVelocityDifference = this.angularVelocity * this.wheelRadius - wheel.velocityAlongBody();
            var alongSlideFrictionForce = this.normalForce * this.slideFriction
                * this.continuousStepFunction(wheelVelocityDifference, 0.1);
            // torque of sliding friction
            this.applyTorque(-alongSlideFrictionForce * this.wheelRadius);
            // friction force
            // friction along wheel rolling direction
            var alongSlideFrictionForceVec = matter_js_1.Vector.mult(vec, alongSlideFrictionForce);
            // friction orthogonal to the wheel rolling direction
            var orthVelocity = matter_js_1.Vector.dot(wheel.velocity, orthVec);
            var orthSlideFrictionForce = this.normalForce * this.slideFriction
                * this.continuousStepFunction(-orthVelocity, 0.1);
            var orthSlideFrictionForceVec = matter_js_1.Vector.mult(orthVec, orthSlideFrictionForce);
            // apply the friction force
            matter_js_1.Body.applyForce(wheel, wheel.position, matter_js_1.Vector.add(alongSlideFrictionForceVec, orthSlideFrictionForceVec));
            // update `wheelAngle` and `angularVelocity` using torque
            this.angularVelocity += this.torque * dt / this.momentOfInertia;
            this.wheelAngle += this.angularVelocity * dt;
            // reset torque and normalForce
            this.torque = 0.0;
            this.normalForce = 0.0;
        };
        return Wheel;
    }());
    exports.Wheel = Wheel;
});
