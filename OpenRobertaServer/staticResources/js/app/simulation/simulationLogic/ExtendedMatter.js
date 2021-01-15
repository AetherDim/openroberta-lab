var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
define(["require", "exports", "matter-js"], function (require, exports, matter_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // === Composite ===
    function addRigidBodyConstraints(bodyA, bodyB, rotationStiffnessA, rotationStiffnessB, offsetA, offsetB) {
        var _this = this;
        if (rotationStiffnessA === void 0) { rotationStiffnessA = 0.1; }
        if (rotationStiffnessB === void 0) { rotationStiffnessB = 0.1; }
        if (offsetA === void 0) { offsetA = matter_js_1.Vector.create(0, 0); }
        if (offsetB === void 0) { offsetB = matter_js_1.Vector.create(0, 0); }
        function makeConstraint(posA, posB, stiffness) {
            return matter_js_1.Constraint.create({
                bodyA: bodyA, bodyB: bodyB,
                pointA: posA, pointB: posB,
                // stiffness larger than 0.1 is sometimes unstable
                stiffness: stiffness
            });
        }
        // add constraints to world or compound body
        [
            makeConstraint(matter_js_1.Vector.sub(bodyB.position, bodyA.position), offsetB, rotationStiffnessA),
            makeConstraint(offsetA, matter_js_1.Vector.sub(bodyA.position, bodyB.position), rotationStiffnessB)
        ].forEach(function (constraint) { return matter_js_1.Composite.add(_this, constraint); });
    }
    function scale(scaleX, scaleY, point, recursive) {
        if (recursive === void 0) { recursive = true; }
        // TODO: Wrong return type of 'allConstraints' in 'index.d.ts'
        var constraints = recursive ? matter_js_1.Composite.allConstraints(this) : this.constraints;
        constraints.forEach(function (constraint) {
            if (constraint.bodyA) {
                constraint.pointA.x = point.x + (constraint.pointA.x - point.x) * scaleX;
                constraint.pointA.y = point.y + (constraint.pointA.y - point.y) * scaleY;
            }
            if (constraint.bodyB) {
                constraint.pointB.x = point.x + (constraint.pointB.x - point.x) * scaleX;
                constraint.pointB.y = point.y + (constraint.pointB.y - point.y) * scaleY;
            }
            // `constraint.length` 
        });
        matter_js_1.Composite.scale(this, scaleX, scaleY, point, recursive);
    }
    var compositePrototype = { addRigidBodyConstraints: addRigidBodyConstraints, scale: scale };
    Object.setPrototypeOf(matter_js_1.Composite, compositePrototype);
    var oldCreate = matter_js_1.Composite.create;
    matter_js_1.Composite.create = function (options) {
        if (options === void 0) { options = {}; }
        return oldCreate(__assign(__assign({}, options), compositePrototype));
    };
    // === Body ===
    function vectorAlongBody(length) {
        if (length === void 0) { length = 1; }
        return matter_js_1.Vector.create(length * Math.cos(this.angle), length * Math.sin(this.angle));
    }
    function velocityAlongBody() {
        return matter_js_1.Vector.dot(this.velocity, this.vectorAlongBody());
    }
    var bodyPrototype = { vectorAlongBody: vectorAlongBody, velocityAlongBody: velocityAlongBody };
    var oldBodyCreate = matter_js_1.Body.create;
    matter_js_1.Body.create = function (options) {
        if (!options.density) {
            options.density = 1;
        }
        return oldBodyCreate(__assign(__assign({}, options), bodyPrototype));
    };
    matter_js_1.Body.update = function update(body, deltaTime, timeScale, correction) {
        // from the previous step
        var frictionAir = 1 - body.frictionAir * timeScale * body.timeScale, velocityPrevX = (body.position.x - body.positionPrev.x) / deltaTime, velocityPrevY = (body.position.y - body.positionPrev.y) / deltaTime;
        // update velocity with Verlet integration
        body.velocity.x = (velocityPrevX * frictionAir * correction) + (body.force.x / body.mass) * deltaTime;
        body.velocity.y = (velocityPrevY * frictionAir * correction) + (body.force.y / body.mass) * deltaTime;
        body.positionPrev.x = body.position.x;
        body.positionPrev.y = body.position.y;
        body.position.x += body.velocity.x * deltaTime;
        body.position.y += body.velocity.y * deltaTime;
        // update angular velocity with Verlet integration
        body.angularVelocity = ((body.angle - body.anglePrev) / deltaTime * frictionAir * correction) + (body.torque / body.inertia) * deltaTime;
        body.anglePrev = body.angle;
        body.angle += body.angularVelocity * deltaTime;
        // track speed and acceleration
        body.speed = matter_js_1.Vector.magnitude(body.velocity);
        body.angularSpeed = Math.abs(body.angularVelocity);
        // transform the body geometry
        var positionTranslation = matter_js_1.Vector.mult(body.velocity, deltaTime);
        var angleDelta = body.angularVelocity * deltaTime;
        for (var i = 0; i < body.parts.length; i++) {
            var part = body.parts[i];
            matter_js_1.Vertices.translate(part.vertices, positionTranslation, 1);
            if (i > 0) {
                part.position.x += positionTranslation.x;
                part.position.y += positionTranslation.y;
            }
            if (angleDelta !== 0) {
                matter_js_1.Vertices.rotate(part.vertices, angleDelta, body.position);
                matter_js_1.Axes.rotate(part.axes, angleDelta);
                if (i > 0) {
                    matter_js_1.Vector.rotateAbout(part.position, angleDelta, body.position, part.position);
                }
            }
            matter_js_1.Bounds.update(part.bounds, part.vertices, positionTranslation);
        }
    };
});
