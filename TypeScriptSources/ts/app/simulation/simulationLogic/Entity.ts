import {Scene} from "./Scene/Scene";
import {Body, Composite, Constraint, Vector, Bodies} from "matter-js";
import {text} from "d3";


export interface IEntity {

    getScene(): Scene;

}

export interface IUpdatableEntity extends IEntity {

    /**
     * called once per engine update
     */
    update();

}


export interface IDrawableEntity extends IEntity {

    /**
     * returns a drawable for this entity
     */
    getDrawable(): PIXI.DisplayObject;

    /**
     * get container to register graphics
     * if function is undefined, the entity layer will be used
     */
    getLayerContainer?(): PIXI.Container;

    setDrawablePosition(vec: Vector);

    setDrawableRotation(rotation: number);

    setDrawableScale(vec: Vector);

}

export interface IPhysicsBodyEntity extends IEntity {

    /**
     * returns the physics object of this entity
     */
    getPhysicsBody(): Body;

    setStatic(isStatic: boolean);

}

export interface IPhysicsCompositeEntity extends IEntity {

    /**
     * returns the physics object of this entity
     */
    getPhysicsComposite(): Composite;

}

export interface IPhysicsConstraintEntity extends IEntity {

    /**
     * returns the physics object of this entity
     */
    getPhysicsConstraint(): Constraint;

}

export interface IDrawablePhysicsEntity extends IDrawableEntity, IPhysicsBodyEntity {

    /**
     * update position of physics entity to the drawable part
     */
    updateDrawablePosition();

}

export abstract class DrawablePhysicsEntity implements IDrawablePhysicsEntity {

    readonly scene: Scene;

    protected constructor(scene: Scene) {
        this.scene = scene;
    }

    getScene(): Scene {
        return this.scene;
    }

    updateDrawablePosition() {
        this.setDrawablePosition(this.getPhysicsBody().position);
        this.setDrawableRotation(this.getPhysicsBody().angle);
    }

    setStatic(isStatic: boolean) {
        Body.setStatic(this.getPhysicsBody(), isStatic);
    }

}
// force define missing members (interface merging)
export interface DrawablePhysicsEntity extends IDrawablePhysicsEntity {}



//
//
//



export abstract class DrawSettings {

    color?: number = 0xFFFFFF;
    alpha?: number = 1;
    strokeColor?: number = 0x000000;
    strokeAlpha?: number = 1;
    strokeWidth?: number = 2;

}






//
// Specialized Entities
//

export class RectEntity extends DrawablePhysicsEntity {

    protected body: Body;

    private constructor(scene: Scene, x: number, y: number, width: number, height: number, drawSettings: DrawSettings, relativeToCenter:boolean = false) {
        super(scene);

        this.body = Bodies.rectangle(x, y, width, height);


    }


    static create(scene: Scene, x: number, y: number, width: number, height: number, drawSettings: DrawSettings, relativeToCenter:boolean = false): RectEntity {
        return new RectEntity(scene, x, y, width, height, drawSettings, relativeToCenter);
        // TODO
    }

    static createTexture(scene: Scene, x: number, y: number, texture: PIXI.Texture, drawSettings: DrawSettings, relativeToCenter:boolean = false): RectEntity {
        return new RectEntity(scene, x, y, texture.width, texture.height, drawSettings, relativeToCenter);
        // TODO
    }


}
