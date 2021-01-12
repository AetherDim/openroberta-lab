import {Scene} from "./Scene/Scene";
import {Body, Composite, Constraint, Vector, Bodies} from "matter-js";
import { Util } from "./Util";


export interface IEntity {

    getScene(): Scene;

    getParent(): IContainerEntity | undefined
    _setParent(containerEntity: IContainerEntity | undefined): void

}

export interface IUpdatableEntity extends IEntity {

    /**
     * called once per engine update
     */
    update(dt: number): void;

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

}

export interface IPhysicsBodyEntity extends IEntity {

    /**
     * returns the physics object of this entity
     */
    getPhysicsBody(): Body;

    setStatic(isStatic: boolean): void;

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
    updateDrawablePosition(): void;

}

export abstract class DrawablePhysicsEntity implements IDrawablePhysicsEntity {

    readonly scene: Scene;

    protected drawable: PIXI.DisplayObject

    protected constructor(scene: Scene, drawable: PIXI.DisplayObject) {
        this.scene = scene;
        this.drawable = drawable
    }

    getScene(): Scene {
        return this.scene;
    }

    updateDrawablePosition() {
        this.drawable.position.copyFrom(this.getPhysicsBody().position);
        this.drawable.rotation = this.getPhysicsBody().angle;
    }

    setStatic(isStatic: boolean) {
        Body.setStatic(this.getPhysicsBody(), isStatic);
    }

}
// force define missing members (interface merging)
export interface DrawablePhysicsEntity extends IDrawablePhysicsEntity {}


export interface IContainerEntity extends IEntity {

    getChildren(): IEntity[]

    removeChild(child: IEntity): void
    addChild(child: IEntity): void
}

//
//
//



export class DrawSettings {

    color: number = 0xFFFFFF;
    alpha: number = 1;
    strokeColor: number = 0x000000;
    strokeAlpha: number = 1;
    strokeWidth: number = 2;

}



//
// Specialized Entities
//

export class RectEntityOptions extends DrawSettings {
    roundingRadius: number = 0
    relativeToCenter: boolean = true
}

export class PhysicsRectEntity extends DrawablePhysicsEntity {

    protected body: Body;

    private constructor(scene: Scene, x: number, y: number, width: number, height: number, drawable: PIXI.DisplayObject) {
        super(scene, drawable);

        PhysicsRectEntity.create(scene, x, y, width, height, {})

        this.body = Bodies.rectangle(x, y, width, height);
    }


    static create(scene: Scene, x: number, y: number, width: number, height: number, opts?: Partial<RectEntityOptions>): PhysicsRectEntity {

        const options = Util.getOptions(RectEntityOptions, opts);
        
        [x, y, width, height] = scene.unit.getLengths([x, y, width, height])
        if (!options.relativeToCenter) {
            x += width / 2
            y += height / 2
        }

        const graphics = new PIXI.Graphics();

        graphics.lineStyle(options.strokeWidth, options.strokeColor, options.strokeAlpha);
        graphics.beginFill(options.color, options.alpha);
        graphics.drawRoundedRect(-width/2, -height/2, width, height, options.roundingRadius || 1);
        graphics.endFill();

        return new PhysicsRectEntity(scene, x, y, width, height, graphics);
    }

    static createTexture(scene: Scene, x: number, y: number, texture: PIXI.Texture, alpha: number, relativeToCenter:boolean = false): PhysicsRectEntity {
        return new PhysicsRectEntity(scene, x, y, texture.width, texture.height, new PIXI.DisplayObject());
        // TODO
    }


}
