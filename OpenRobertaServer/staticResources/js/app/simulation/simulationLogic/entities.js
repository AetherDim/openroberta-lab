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
define(["require", "exports", "matter-js"], function (require, exports, matter_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Poligon = exports.Circle = exports.Rectangle = exports.PhysicsEntity = exports.Entity = void 0;
    var Entity = /** @class */ (function () {
        function Entity() {
            this.displayObject = null; // visual representation of the object
            this.scene = null;
        }
        Entity.prototype.setPosition = function (x, y) {
            if (this.displayObject) {
                this.displayObject.x = x;
                this.displayObject.x = y;
            }
        };
        Entity.prototype.setRotation = function (rotation) {
            if (this.displayObject) {
                this.displayObject.rotation = rotation;
            }
        };
        Entity.prototype.setVisible = function (visible) {
            if (this.displayObject) {
                this.displayObject.visible = visible;
            }
        };
        /**
         * TODO: optimize
         * Will only be called if registered by scene!
         */
        Entity.prototype.prePhysicsSim = function () { };
        /**
         * TODO: optimize
         * Will only be called if registered by scene!
         */
        Entity.prototype.postPhysicsSim = function () { };
        return Entity;
    }());
    exports.Entity = Entity;
    var PhysicsEntity = /** @class */ (function (_super) {
        __extends(PhysicsEntity, _super);
        function PhysicsEntity(physicsBody) {
            var _this = _super.call(this) || this;
            _this.physicsBody = null;
            _this.physicsBody = physicsBody;
            return _this;
        }
        /**
         * Applies a force to a body from a given world-space position, including resulting torque.
         * @param position
         * @param force
         */
        PhysicsEntity.prototype.applyForce = function (position, force) {
            matter_js_1.Body.applyForce(this.physicsBody, position, force);
        };
        PhysicsEntity.prototype.setAngularVelocity = function (velocity) {
            matter_js_1.Body.setAngularVelocity(this.physicsBody, velocity);
        };
        PhysicsEntity.prototype.setDensity = function (density) {
            matter_js_1.Body.setDensity(this.physicsBody, density);
        };
        PhysicsEntity.prototype.setInertia = function (inertia) {
            matter_js_1.Body.setInertia(this.physicsBody, inertia);
        };
        PhysicsEntity.prototype.setMass = function (mass) {
            matter_js_1.Body.setMass(this.physicsBody, mass);
        };
        PhysicsEntity.prototype.setStatic = function (isStatic) {
            matter_js_1.Body.setStatic(this.physicsBody, isStatic);
        };
        PhysicsEntity.prototype.setVelocity = function (velocity) {
            matter_js_1.Body.setVelocity(this.physicsBody, velocity);
        };
        /**
         * Disable physics interaction (remove from engine?)
         * @param disable
         */
        PhysicsEntity.prototype.setDisable = function (disable) {
            // TODO        
            // use this.physicsBody.parent ???
        };
        PhysicsEntity.prototype.resetVelocity = function () {
            this.setVelocity({ x: 0, y: 0 });
            this.setAngularVelocity(0);
        };
        PhysicsEntity.prototype.setPosition = function (x, y) {
            _super.prototype.setPosition.call(this, x, y);
            matter_js_1.Body.setPosition(this.physicsBody, { x: x, y: y });
        };
        PhysicsEntity.prototype.setRotation = function (rotation) {
            _super.prototype.setRotation.call(this, rotation);
            matter_js_1.Body.setAngle(this.physicsBody, rotation);
        };
        return PhysicsEntity;
    }(Entity));
    exports.PhysicsEntity = PhysicsEntity;
    var Rectangle = /** @class */ (function (_super) {
        __extends(Rectangle, _super);
        function Rectangle(x, y, width, height) {
            var _this = _super.call(this, matter_js_1.Bodies.rectangle(x, y, width, height)) || this;
            var g = new PIXI.Graphics();
            return _this;
        }
        return Rectangle;
    }(PhysicsEntity));
    exports.Rectangle = Rectangle;
    var Circle = /** @class */ (function (_super) {
        __extends(Circle, _super);
        function Circle() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Circle;
    }(PhysicsEntity));
    exports.Circle = Circle;
    var Poligon = /** @class */ (function (_super) {
        __extends(Poligon, _super);
        function Poligon() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Poligon;
    }(PhysicsEntity));
    exports.Poligon = Poligon;
});
// vertices?
