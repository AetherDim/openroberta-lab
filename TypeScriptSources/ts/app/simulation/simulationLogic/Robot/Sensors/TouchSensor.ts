import { Body } from "matter-js";
import { DrawablePhysicsEntity, IDrawablePhysicsEntity } from "../../Entity";
import { Scene } from "../../Scene/Scene";


export class TouchSensor extends DrawablePhysicsEntity<PIXI.DisplayObject> {

	private isTouched = false

	physicsBody: Body

	constructor(scene: Scene, drawablePhysicsEntity: IDrawablePhysicsEntity) {
		super(scene, drawablePhysicsEntity.getDrawable())
		this.physicsBody = drawablePhysicsEntity.getPhysicsBody()
	}

	getPhysicsBody() {
		return this.physicsBody
	}

	onTouchChanged: (isTouched: boolean) => void = function() {}

	getIsTouched(): boolean {
		return this.isTouched
	}

	setIsTouched(isTouched: boolean) {
		if (this.isTouched != isTouched) {
			this.onTouchChanged(isTouched)
		}
		this.isTouched = isTouched
	}

}