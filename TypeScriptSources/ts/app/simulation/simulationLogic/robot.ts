import { World, Engine, Mouse, MouseConstraint, Render, Bodies, Body, Vector, Constraint, Events, Composite } from 'matter-js'

import "./extendedMatter"

export class Robot {

    physicsComposite: Composite
    body = Bodies.rectangle(0, 0, 40, 30)
    wheels = {
        rearLeft: Bodies.rectangle(-50, -20, 20, 10),
        rearRight: Bodies.rectangle(-50,  20, 20, 10),
        frontLeft: Bodies.rectangle( 50, -15, 20, 10),
        frontRight: Bodies.rectangle( 50,  15, 20, 10)
    }

    constructor() {
        this.makePhysicsObject()
    }

    private makePhysicsObject() {
        
        const wheels = [
            this.wheels.rearLeft,
            this.wheels.rearRight,
            this.wheels.frontLeft,
            this.wheels.frontRight
        ]

        this.physicsComposite = Composite.create({bodies: [this.body].concat(wheels)})

        // set friction
        wheels.forEach(wheel => {
            wheel.frictionAir = 0.3
            this.physicsComposite.addRigidBodyConstraints(this.body, wheel, 0.1, 0.001)
        });

        this.body.frictionAir = 0.0;
    }

}