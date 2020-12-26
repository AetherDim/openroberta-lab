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
    var compositePrototype = { addRigidBodyConstraints: addRigidBodyConstraints };
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
            options.density = 1000;
        }
        return oldBodyCreate(__assign(__assign({}, options), bodyPrototype));
    };
});
