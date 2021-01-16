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
define(["require", "exports", "d3", "matter-js", "../Entity"], function (require, exports, d3_1, matter_js_1, Entity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Wheel = void 0;
    var Wheel = /** @class */ (function (_super) {
        __extends(Wheel, _super);
        /**
         * Creates a top down wheel at position `(x, y)` and `(width, height)`.
         * The wheel radius is half of the `width`.
         *
         * @param scene
         * @param x
         * @param y
         * @param width
         * @param height
         * @param physicsEntity
         * @param mass The mass of the wheel. If it is `null`, the default physics body mass is used.
         */
        function Wheel(scene, x, y, width, height, physicsEntity, mass) {
            var _a;
            var _this = _super.call(this, scene, physicsEntity.getDrawable()) || this;
            _this.rollingFriction = 0.03;
            _this.slideFriction = 0.3;
            /**
             * Positive torque indirectly exerts a forward force along the body
             */
            _this.torque = 0;
            /**
             * The force in the `z` direction
             */
            _this.normalForce = 0;
            _this.prevWheelAngle = 0;
            _this.wheelAngle = 0;
            _this.angularVelocity = 0;
            _this.wheelProfile = [];
            _this.debugContainer = new PIXI.Container();
            _this.physicsEntity = physicsEntity;
            _this.physicsBody = _this.physicsEntity.getPhysicsBody();
            _a = __read(scene.unit.getLengths([x, y, width, height]), 4), x = _a[0], y = _a[1], width = _a[2], height = _a[3];
            var container = _this.physicsEntity.getDrawable();
            var wheelProfileWidth = width * 0.3;
            _this.wheelProfileWidth = wheelProfileWidth;
            _this.wheelProfile = d3_1.range(4).map(function () {
                var graphics = new PIXI.Graphics();
                graphics.beginFill(0xFF0000);
                graphics.drawRect(0, -height / 2, wheelProfileWidth, height);
                graphics.endFill();
                container.addChild(graphics);
                return graphics;
            });
            _this.debugText = new PIXI.Text("");
            _this.debugText.style = new PIXI.TextStyle({ fill: 0x0000 });
            _this.debugText.angle = 45;
            // this.debugContainer.addChild(this.debugText)
            // container.addChild(this.debugText)
            container.addChild(_this.debugContainer);
            if (mass != undefined) {
                matter_js_1.Body.setMass(_this.physicsBody, scene.unit.getMass(mass));
            }
            _this.wheelRadius = width / 2;
            _this.momentOfInertia = 0.5 * _this.physicsBody.mass * Math.pow(_this.wheelRadius, 2);
            return _this;
        }
        // TODO: Workaround: static function instead of constructor since `super` has to be the first statement in constructor
        /**
         * Creates a top down wheel at position `(x, y)` and `(width, height)`.
         * The wheel radius is half of the `width`.
         *
         * @param scene
         * @param x
         * @param y
         * @param width
         * @param height
         * @param mass The mass of the wheel. If it is `null`, the default physics body mass is used.
         */
        Wheel.create = function (scene, x, y, width, height, mass) {
            return new Wheel(scene, x, y, width, height, Entity_1.PhysicsRectEntity.createWithContainer(scene, x, y, width, height, { color: 0, strokeColor: 0xffffff, strokeWidth: 1, strokeAlpha: 0.5, strokeAlignment: 1 }), mass);
        };
        // implement abstract DrawablePhysicsEntity method 
        Wheel.prototype.getPhysicsBody = function () {
            return this.physicsBody;
        };
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
                position.x = this.wheelRadius * Math.cos(angle) - this.wheelProfileWidth / 2 * Math.sin(angle);
                profileGraphics.scale.x = Math.sin(angle);
            }
            //this.debugText.text = "" + Unit.fromVelocity(this.angularVelocity * this.wheelRadius - this.physicsBody.velocityAlongBody())//(this.angularVelocity / (2 * Math.PI))
            // this.pixiContainer.removeChild(this.wheelDebugObject)
            // this.wheelDebugObject.destroy()
            // const text = new PIXI.Text("" + (this.angularVelocity / (2 * Math.PI)))
            // text.angle = 45
            // //this.wheelDebugGraphics = this.pixiRect(0, 0, 2, this.angularVelocity * 10 / (2 * Math.PI), 0x00FF00)
            // this.wheelDebugObject = text
            // this.pixiContainer.addChild(this.wheelDebugObject)
        };
        Wheel.prototype.customFunction = function (velocity, stepFunctionWidth) {
            if (stepFunctionWidth === void 0) { stepFunctionWidth = 10; }
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
            var orthVec = { x: -vec.y, y: vec.x };
            // torque from the rolling friction
            // rollingFriction = d/R and d * F_N = torque
            var rollingFrictionTorque = this.customFunction(-wheel.velocityAlongBody(), 100)
                * this.rollingFriction * this.wheelRadius * this.normalForce;
            // TODO: already simulated by `wheelSlideFrictionForce`?
            // const rollingFrictionForce = this.normalForce * this.rollingFriction * this.customFunction(-wheel.velocityAlongBody())
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
            var alongForce = 0;
            // TODO: A bot hacky to use a constant acceleration
            var mass = this.normalForce / this.scene.unit.getAcceleration(9.81); //wheel.mass
            var totalTorque = slidingFrictionTorque + this.torque + rollingFrictionTorque;
            /** time to adjust speed such that the wheel rotation speed matches the center of mass wheel speed */
            var timeToAdjustSpeed = wheelVelocityDifference / (alongSlideFrictionForce / mass - totalTorque / this.momentOfInertia * this.wheelRadius);
            // TODO: Change sign of rolling friction, if wheel.velocityAlongBody() changes sign
            var remainingTime = dt;
            if (0 < timeToAdjustSpeed && timeToAdjustSpeed < dt) {
                this.updateWithTorque(slidingFrictionTorque + this.torque + rollingFrictionTorque, timeToAdjustSpeed);
                remainingTime = dt - timeToAdjustSpeed;
                // kinetic/sliding friction
                alongForce += alongSlideFrictionForce * timeToAdjustSpeed / dt;
                // static friction
                alongForce += (this.torque + rollingFrictionTorque) / this.wheelRadius * remainingTime / dt;
                // calculate torque such that the wheel does not slip
                var wheelVelocityChange = alongForce / mass * dt;
                var newTorque = (wheelVelocityChange / this.wheelRadius) / remainingTime * this.momentOfInertia;
                this.torque = newTorque;
            }
            else {
                // torque of sliding friction
                this.applyTorque(slidingFrictionTorque + rollingFrictionTorque);
                alongForce += alongSlideFrictionForce;
            }
            // friction force
            // friction along wheel rolling direction
            var alongForceVec = matter_js_1.Vector.mult(vec, alongForce);
            // friction orthogonal to the wheel rolling direction
            var orthVelocity = matter_js_1.Vector.dot(wheel.velocity, orthVec);
            var orthSlideFrictionForce = this.normalForce * this.slideFriction
                * this.customFunction(-orthVelocity, 100);
            var orthSlideFrictionForceVec = matter_js_1.Vector.mult(orthVec, orthSlideFrictionForce);
            // apply the friction force
            matter_js_1.Body.applyForce(wheel, wheel.position, matter_js_1.Vector.add(alongForceVec, orthSlideFrictionForceVec));
            // update `wheelAngle` and `angularVelocity` using torque
            // this.angularVelocity = (this.wheelAngle - this.prevWheelAngle) / dt
            // this.prevWheelAngle = this.wheelAngle
            this.updateWithTorque(this.torque, remainingTime);
            // reset torque and normalForce
            this.torque = 0.0;
            this.normalForce = 0.0;
            this.updateWheelProfile();
        };
        Wheel.prototype.updateWithTorque = function (torque, dt) {
            this.angularVelocity += torque * dt / this.momentOfInertia;
            this.wheelAngle += this.angularVelocity * dt;
        };
        return Wheel;
    }(Entity_1.DrawablePhysicsEntity));
    exports.Wheel = Wheel;
});
