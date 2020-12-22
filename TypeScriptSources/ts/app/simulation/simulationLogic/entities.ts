import { Vector, Body, Bodies } from 'matter-js'
import { Scene } from './scene';

export abstract class Entity {

    displayObject: PIXI.DisplayObject = null; // visual representation of the object
    scene: Scene = null;

    setPosition(x: number, y: number) {
        if(this.displayObject) {
            this.displayObject.x = x;
            this.displayObject.x = y;
        }
    }

    setRotation(rotation: number) {
        if(this.displayObject) {
            this.displayObject.rotation = rotation;
        }
    }

    setVisible(visible: boolean) {
        if(this.displayObject) {
            this.displayObject.visible = visible;
        }
    }

    /**
     * TODO: optimize
     * Will only be called if registered by scene!
     */
    prePhysicsSim() {}

    /**
     * TODO: optimize
     * Will only be called if registered by scene!
     */
    postPhysicsSim() {}


}


export abstract class PhysicsEntity extends Entity {

    physicsBody: Body = null;
    

    constructor(physicsBody: Body) {
        super();
        
        this.physicsBody = physicsBody;
    }

    /**
     * Applies a force to a body from a given world-space position, including resulting torque.
     * @param position 
     * @param force 
     */
    applyForce(position: Vector, force: Vector) {
        Body.applyForce(this.physicsBody, position, force);
    }

    setAngularVelocity(velocity: number) {
        Body.setAngularVelocity(this.physicsBody, velocity);
    }

    setDensity(density: number) {
        Body.setDensity(this.physicsBody, density);
    }

    setInertia(inertia: number) {
        Body.setInertia(this.physicsBody, inertia);
    }

    setMass(mass: number) {
        Body.setMass(this.physicsBody, mass);
    }

    setStatic(isStatic: boolean) {
        Body.setStatic(this.physicsBody, isStatic);
    }

    setVelocity(velocity: Vector) {
        Body.setVelocity(this.physicsBody, velocity);
    }

    /**
     * Disable physics interaction (remove from engine?)
     * @param disable 
     */
    setDisable(disable: boolean) {
        // TODO        
        // use this.physicsBody.parent ???
    }

    resetVelocity() {
        this.setVelocity({x: 0, y: 0});
        this.setAngularVelocity(0);
    }



    setPosition(x: number, y: number) {
        super.setPosition(x, y);
        Body.setPosition(this.physicsBody, {x: x, y: y})
    }

    setRotation(rotation: number) {
        super.setRotation(rotation);
        Body.setAngle(this.physicsBody, rotation);
    }

}



export class Rectangle extends PhysicsEntity {

    constructor(x: number, y: number, width: number, height: number) {
        super(Bodies.rectangle(x, y, width, height));
        var g = new PIXI.Graphics();
    }

}

export class Circle extends PhysicsEntity {

}

export class Poligon extends PhysicsEntity {

}

// vertices?