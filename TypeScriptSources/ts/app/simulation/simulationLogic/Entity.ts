import {Scene} from "./Scene/Scene";
import {Body, Composite, Constraint, Vector, Bodies, IBodyDefinition, IChamferableBodyDefinition} from "matter-js";
import { Util } from "./Util";


export class Meta<T> {
	name: keyof T
	constructor(name: keyof T) {
		this.name = name
	}

	isSupertypeOf(value: any): value is T {
		if (this.name in value) {
			return true
		}
		return false
	}
}

export class Type {
	static readonly IEntity = new Meta<IEntity>("IEntity")
	static readonly IUpdatableEntity = new Meta<IUpdatableEntity>("IUpdatableEntity")
	static readonly IDrawableEntity = new Meta<IDrawableEntity>("IDrawableEntity")
	static readonly IPhysicsEntity = new Meta<IPhysicsEntity>("IPhysicsEntity")
	static readonly IPhysicsCompositeEntity = new Meta<IPhysicsCompositeEntity>("IPhysicsCompositeEntity")
	static readonly IDrawablePhysicsEntity = new Meta<IDrawablePhysicsEntity>("IDrawablePhysicsEntity")
	static readonly IContainerEntity = new Meta<IContainerEntity>("IContainerEntity")
}



export interface IEntity {

	getScene(): Scene;

	getParent(): IContainerEntity | undefined
	_setParent(containerEntity: IContainerEntity | undefined): void

	IEntity(): void
}

export interface IUpdatableEntity extends IEntity {

	IUpdatableEntity(): void

	/**
	 * called once per engine update
	 */
	update(dt: number): void;

}


export interface IDrawableEntity extends IEntity {

	IDrawableEntity(): void

	/**
	 * returns a drawable for this entity
	 */
	getDrawable(): PIXI.DisplayObject;

	/**
	 * get container to register graphics
	 * if function is undefined, the entity layer of the `Scene` will be used
	 */
	getContainer?(): PIXI.Container;

}

export interface IPhysicsEntity extends IEntity {

	IPhysicsEntity(): void

	/**
	 * returns the physics object of this entity
	 */
	getPhysicsObject(): Body | Constraint | Composite;

}

export interface IPhysicsBodyEntity extends IPhysicsEntity {

	/**
	 * returns the physics object of this entity
	 */
	getPhysicsBody(): Body;

}

export interface IPhysicsCompositeEntity extends IPhysicsEntity {

	IPhysicsCompositeEntity(): void

	/**
	 * returns the physics object of this entity
	 */
	getPhysicsComposite(): Composite;

}

export interface IPhysicsConstraintEntity extends IPhysicsEntity {

	/**
	 * returns the physics object of this entity
	 */
	getPhysicsConstraint(): Constraint;

}

export interface IDrawablePhysicsEntity extends IDrawableEntity, IPhysicsBodyEntity {

	IDrawablePhysicsEntity(): void

	/**
	 * update position of physics entity to the drawable part
	 */
	updateDrawablePosition(): void;

}

export abstract class DrawablePhysicsEntity<Drawable extends PIXI.DisplayObject> implements IDrawablePhysicsEntity {

	readonly scene: Scene;

	private parent?: IContainerEntity

	protected drawable: Drawable

	protected constructor(scene: Scene, drawable: Drawable) {
		this.scene = scene;
		this.drawable = drawable
	}

	IEntity(){}
	getScene(): Scene {
		return this.scene;
	}

	getParent() {
		return this.parent
	}

	_setParent(parent: IContainerEntity | undefined) {
		this.parent = parent
	}

	IDrawablePhysicsEntity(){}
	updateDrawablePosition() {
		this.drawable.position.copyFrom(this.getPhysicsBody().position);
		this.drawable.rotation = this.getPhysicsBody().angle;
	}

	IDrawableEntity(){}
	getDrawable(): Drawable {
		return this.drawable
	}

	IPhysicsEntity(){}
	getPhysicsObject() {
		return this.getPhysicsBody()
	}

	abstract getPhysicsBody(): Body

}


export interface IContainerEntity extends IEntity {

	IContainerEntity(): void

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
	strokeColor?: number// = 0x000000;
	strokeAlpha?: number// = 1;
	strokeWidth?: number// = 2;
	/**
	 * 0: inner, 0.5: middle, 1: outer (default middle)
	 */
	strokeAlignment?: number

}

export class RectOptions extends DrawSettings {
	roundingRadius: number = 0
	relativeToCenter: boolean = true
}

//
// Specialized Entities
//

export class RectEntityOptions extends RectOptions {
	physics: IChamferableBodyDefinition = {}
}

export class PhysicsRectEntity<Drawable extends PIXI.DisplayObject = PIXI.DisplayObject> extends DrawablePhysicsEntity<Drawable> {

	protected body: Body;

	protected constructor(scene: Scene, x: number, y: number, width: number, height: number, drawable: Drawable, opts: RectEntityOptions) {
		super(scene, drawable);

		if(!opts.relativeToCenter) {
			x += width/2;
			y += height/2;
		}

		this.body = Bodies.rectangle(x, y, width, height, opts?.physics);
	}

	getPhysicsBody() {
		return this.body
	}

	/**
	 * Create the graphics with center (0,0)
	 */
	private static createGraphics(width: number, height: number, options: RectEntityOptions): PIXI.Graphics {

		const graphics = new PIXI.Graphics();

		graphics.lineStyle(options.strokeWidth, options.strokeColor, options.strokeAlpha, options.strokeAlignment);
		graphics.beginFill(options.color, options.alpha);
		graphics.drawRoundedRect(-width/2, -height/2, width, height, options.roundingRadius);
		graphics.endFill();

		return graphics
	}

	static create(scene: Scene, x: number, y: number, width: number, height: number, opts?: Partial<RectEntityOptions>): PhysicsRectEntity<PIXI.Graphics> {
		[x, y, width, height] = scene.unit.getLengths([x, y, width, height])
		const options = Util.getOptions(RectEntityOptions, opts);
		const graphics = PhysicsRectEntity.createGraphics(width, height, options)
		return new PhysicsRectEntity(scene, x, y, width, height, graphics, options);
	}

	static createWithContainer(scene: Scene, x: number, y: number, width: number, height: number, opts?: Partial<RectEntityOptions>): PhysicsRectEntity<PIXI.Container> {
		[x, y, width, height] = scene.unit.getLengths([x, y, width, height])
		const options = Util.getOptions(RectEntityOptions, opts);
		const graphics = PhysicsRectEntity.createGraphics(width, height, options)
		const container = new PIXI.Container()
		container.addChild(graphics)
		return new PhysicsRectEntity<PIXI.Container>(scene, x, y, width, height, graphics, options);
	}


	static createTexture(scene: Scene, x: number, y: number, texture: PIXI.Texture, alpha: number, relativeToCenter:boolean = false, bodyOptions?: IChamferableBodyDefinition): PhysicsRectEntity<PIXI.DisplayObject> {
		return new PhysicsRectEntity(scene, x, y, texture.width, texture.height, new PIXI.DisplayObject(), Util.getOptions(RectEntityOptions, {physics: bodyOptions}));
		// TODO
	}


}


export class DrawableEntity<Drawable extends PIXI.DisplayObject = PIXI.DisplayObject> implements IDrawableEntity {

	private scene: Scene
	private parent?: IContainerEntity
	private drawable: Drawable

	constructor(scene: Scene, drawable: Drawable) {
		this.scene = scene
		this.drawable = drawable
	}

	IEntity(){}

	getScene(): Scene {
		return this.scene
	}

	getParent(): IContainerEntity | undefined {
		return this.parent
	}

	_setParent(parent: IContainerEntity | undefined) {
		this.parent = parent
	}

	IDrawableEntity(){}

	getDrawable(): Drawable {
		return this.drawable
	}

	static rect(scene: Scene, x: number, y: number, width: number, height: number, opts?: Partial<RectOptions>): DrawableEntity<PIXI.Graphics> {

		const options = Util.getOptions(RectOptions, opts)

		let graphicsX = 0
		let graphicsY = 0
		if (options.relativeToCenter) {
			graphicsX -= width/2
			graphicsY -= height/2
		}

		const graphics = new PIXI.Graphics()
			.lineStyle(options.strokeWidth, options.strokeColor, options.strokeAlpha, options.strokeAlignment)
			.beginFill(options.color, options.alpha)
			.drawRoundedRect(graphicsX, graphicsY, width, height, options.roundingRadius)
			.endFill()
		graphics.position.set(x, y)
		
		return new DrawableEntity(scene, graphics)
	}

}