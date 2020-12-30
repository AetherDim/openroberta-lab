define(["require", "exports", "d3", "matter-js", "./displayable", "./Unit"], function (require, exports, d3_1, matter_js_1, displayable_1, Unit_1) {
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
         * @param mass The mass of the wheel. If it is `null`, the default physics body mass is used.
         */
        function Wheel(x, y, width, height, mass) {
            var _a;
            if (mass === void 0) { mass = null; }
            this.rollingFriction = 0.03;
            this.slideFriction = 0.3;
            /**
             * Positive torque indirectly exerts a forward force along the body
             */
            this.torque = 0;
            /**
             * The force in the `z` direction
             */
            this.normalForce = 0;
            this.prevWheelAngle = 0;
            this.wheelAngle = 0;
            this.angularVelocity = 0;
            this.debugText = null;
            this.physicsBody = displayable_1.createRect(x, y, width, height);
            _a = Unit_1.Unit.getLengths([x, y, width, height]), x = _a[0], y = _a[1], width = _a[2], height = _a[3];
            var displayable = this.physicsBody.displayable;
            var container = new PIXI.Container();
            container.addChild(displayable.displayObject);
            this.wheelProfile = d3_1.range(4).map(function () {
                var graphics = new PIXI.Graphics();
                graphics.beginFill(0xFF0000);
                graphics.drawRect(0, -height / 2, width * 0.1, height);
                graphics.endFill();
                container.addChild(graphics);
                return graphics;
            });
            this.debugContainer = new PIXI.Container();
            this.debugText = new PIXI.Text("");
            this.debugText.style = new PIXI.TextStyle({ fill: 0x0000 });
            this.debugText.angle = 45;
            this.debugText.scale.x = 0.001;
            this.debugText.scale.y = 0.001;
            //this.debugContainer.addChild(this.debugText)
            // container.addChild(this.debugText)
            container.addChild(this.debugContainer);
            this.physicsBody.displayable.displayObject = container;
            if (mass) {
                matter_js_1.Body.setMass(this.physicsBody, Unit_1.Unit.getMass(mass));
            }
            this.wheelRadius = width / 2;
            this.momentOfInertia = 0.5 * this.physicsBody.mass * Math.pow(this.wheelRadius, 2);
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
        Wheel.prototype.updateWheelProfile = function () {
            for (var i = 0; i < this.wheelProfile.length; i++) {
                var profileGraphics = this.wheelProfile[i];
                var position = profileGraphics.position;
                var angle = this.wheelAngle + 2 * Math.PI * i / this.wheelProfile.length;
                profileGraphics.visible = Math.sin(angle) < 0;
                position.x = this.wheelRadius * Math.cos(angle) - profileGraphics.width / 2;
                profileGraphics.scale.x = Math.sin(angle);
            }
            //this.debugText.text = "" + (this.angularVelocity * this.wheelRadius - this.physicsBody.velocityAlongBody())//(this.angularVelocity / (2 * Math.PI))
            // this.pixiContainer.removeChild(this.wheelDebugObject)
            // this.wheelDebugObject.destroy()
            // const text = new PIXI.Text("" + (this.angularVelocity / (2 * Math.PI)))
            // text.angle = 45
            // //this.wheelDebugGraphics = this.pixiRect(0, 0, 2, this.angularVelocity * 10 / (2 * Math.PI), 0x00FF00)
            // this.wheelDebugObject = text
            // this.pixiContainer.addChild(this.wheelDebugObject)
        };
        Wheel.prototype.customFunction = function (velocity, stepFunctionWidth) {
            if (stepFunctionWidth === void 0) { stepFunctionWidth = 1; }
            if (false) {
                return velocity / stepFunctionWidth;
            }
            else {
                return this.continuousStepFunction(velocity, stepFunctionWidth);
            }
        };
        Wheel.prototype.update = function (dt) {
            var wheel = this.physicsBody;
            var vec = wheel.vectorAlongBody();
            var orthVec = matter_js_1.Vector.perp(vec);
            // torque from the rolling friction
            // rollingFriction = d/R and d * F_N = torque
            this.applyTorque(this.customFunction(-wheel.velocityAlongBody())
                * this.rollingFriction * this.wheelRadius * this.normalForce);
            // TODO: already simulated by `wheelSlideFrictionForce`?
            // const rollingFrictionForce = this.normalForce * this.rollingFriction
            // torque for 
            var wheelVelocityDifference = this.angularVelocity * this.wheelRadius - wheel.velocityAlongBody();
            var alongSlideFrictionForce = this.normalForce * this.slideFriction
                * this.customFunction(wheelVelocityDifference);
            // v0 + f/m * t = v1
            // o0 + T/I * t = o1
            //
            // v1 / r = o1 (condition)
            //
            // v0 + f/m * t = v1 = o0 * r + T/I * t * r
            // (f/m - T/I*r) * t = o0 * r - v0
            // t = (o0 * r - v0) / (f/m - T/I*r)
            //
            // define: dv = o0 * r - v0
            // t = dv / (f/m - T/I*r)
            //
            // if T = -f * r, then
            // sign(f) = sign(v)  and sign(f) = -sign(T) => sign(t) = 1
            //
            // for m -> infinity:
            // t = (o0 * r - v0) / (-T/I*r)
            //   = (o0 * r - v0)/r / (-T/I)
            var slidingFrictionTorque = -alongSlideFrictionForce * this.wheelRadius;
            var mass = this.normalForce / Unit_1.Unit.getAcceleration(9.81);
            var timeToAdjustSpeed = wheelVelocityDifference / (alongSlideFrictionForce / mass - (slidingFrictionTorque + this.torque) / this.momentOfInertia * this.wheelRadius);
            timeToAdjustSpeed = Math.abs(timeToAdjustSpeed);
            if (0 < timeToAdjustSpeed && timeToAdjustSpeed < dt) {
                slidingFrictionTorque *= timeToAdjustSpeed / dt;
                alongSlideFrictionForce *= timeToAdjustSpeed / dt;
            }
            // torque of sliding friction
            this.applyTorque(slidingFrictionTorque);
            // friction force
            // friction along wheel rolling direction
            var alongSlideFrictionForceVec = matter_js_1.Vector.mult(vec, alongSlideFrictionForce);
            // friction orthogonal to the wheel rolling direction
            var orthVelocity = matter_js_1.Vector.dot(wheel.velocity, orthVec);
            var orthSlideFrictionForce = this.normalForce * this.slideFriction
                * this.customFunction(-orthVelocity);
            var orthSlideFrictionForceVec = matter_js_1.Vector.mult(orthVec, orthSlideFrictionForce);
            // apply the friction force
            matter_js_1.Body.applyForce(wheel, wheel.position, matter_js_1.Vector.add(alongSlideFrictionForceVec, orthSlideFrictionForceVec));
            // update `wheelAngle` and `angularVelocity` using torque
            // this.angularVelocity = (this.wheelAngle - this.prevWheelAngle) / dt
            // this.prevWheelAngle = this.wheelAngle
            this.angularVelocity += this.torque * dt / this.momentOfInertia;
            this.wheelAngle += this.angularVelocity * dt;
            // reset torque and normalForce
            this.torque = 0.0;
            this.normalForce = 0.0;
            this.updateWheelProfile();
        };
        return Wheel;
    }());
    exports.Wheel = Wheel;
});
