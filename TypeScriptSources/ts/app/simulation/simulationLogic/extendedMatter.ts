import { Composite, Constraint, Vector, Body, World } from "matter-js";

declare module "matter-js" {

    // export interface IBodyDefinition {
    //     displayObject: PIXI.DisplayObject;
    // }

    export interface Constraint {
        /** 
         * Adds constraints to `bodyA` and `bodyB` such that their current
         * relative position and orientaion is preseved (depending on `stiffness`).
         * 
         * Note: A `rotationStiffness` which is larger than `0.1` may be unstable.
         * 
         * @param composite the `Composite` to which the constraints are added
         * @param bodyA the first `Body` of the constraint
         * @param bodyB the second `Body` of the constraint
         * @param rotationStiffnessA the stiffness of the constraint constraining the rotation of `bodyA` (default: 0.1)
         * @param rotationStiffnessB the stiffness of the constraint constraining the rotation of `bodyB` (default: 0.1)
         * @param offsetA the constraint offset on `bodyA` in its coordinate system (default: (0,0))
         * @param offsetB the constraint offset on `bodyB` in its coordinate system (default: (0,0))
         */ 
        addRigidBodyConstraints(
            composite: Composite,
            bodyA: Body, bodyB: Body,
            rotationStiffnessA?: number,
            rotationStiffnessB?: number,
            offsetA?: Vector,
            offsetB?: Vector)
    }

}


Constraint.prototype.addRigidBodyConstraints = function addRigidBodyConstraints(
    composite: Composite,
    bodyA: Body, bodyB: Body,
    rotationStiffnessA: number = 0.1,
    rotationStiffnessB: number = 0.1,
    offsetA: Vector = Vector.create(0, 0),
    offsetB: Vector = Vector.create(0, 0)
    ) {

    function makeConstraint(posA: Vector, posB: Vector, stiffness: number): Constraint {
        return Constraint.create({
            bodyA: bodyA, bodyB: bodyB,
            pointA: posA, pointB: posB,
            // stiffness larger than 0.1 is sometimes unstable
            stiffness: stiffness
        })
    }

    // add constraints to world or compound body
    [
        makeConstraint(Vector.sub(bodyB.position, bodyA.position), offsetB, rotationStiffnessA),
        makeConstraint(offsetA, Vector.sub(bodyA.position, bodyB.position), rotationStiffnessB)
    ].forEach(constraint => Composite.add(composite, constraint))
}