import {IDrawablePhysicsEntity, IEntity, IUpdatableEntity, Type} from "../../Entity";
import {Composite} from "matter-js";
import {Util} from "../../Util";
import {Scene} from "../Scene";

export class EntityManager {

	private readonly scene: Scene

	constructor(scene: Scene) {
		this.scene = scene
	}

	private readonly entities: IEntity[] = []
	private readonly updatableEntities: IUpdatableEntity[] = []
	private readonly drawablePhysicsEntities: IDrawablePhysicsEntity[] = []

	containsEntity(entity: IEntity): boolean {
		return this.entities.includes(entity)
	}

	addEntities(...entities: IEntity[]) {
		entities.forEach(entity => this.addEntity(entity));
	}

	addEntity(entity: IEntity) {
		if (entity.getScene() != this.scene) {
			console.warn(`Entity ${entity} is not in this (${this}) scene`)
		}
		if(!this.entities.includes(entity)) {
			this.entities.push(entity);

			// register physics and graphics

			if (Type.IUpdatableEntity.isSupertypeOf(entity)) {
				this.updatableEntities.push(entity)
			}

			if (Type.IDrawableEntity.isSupertypeOf(entity)) {
				const container = entity.getContainer?.() ?? this.scene.getContainers().entityContainer;
				container.addChild(entity.getDrawable())
			}

			// TODO: Think about this. There might be wrapper types.
			// Only add entities with no parents to the physics world.
			// A parent should imply a physics `Composite` which only has to be added once.
			if (entity.getParent() == undefined && Type.IPhysicsEntity.isSupertypeOf(entity)) {
				Composite.add(this.scene.getWorld(), entity.getPhysicsObject())
			}

			if (Type.IDrawablePhysicsEntity.isSupertypeOf(entity)) {
				this.drawablePhysicsEntities.push(entity)
			}

			if (Type.IContainerEntity.isSupertypeOf(entity)) {
				const t = this
				entity.getChildren().forEach(entity => t.addEntity(entity))
			}

		}
	}

	removeEntity(entity: IEntity) {
		if (entity.getScene() != this.scene) {
			console.warn(`Entity ${entity} is not in this (${this}) scene`)
		}
		if(Util.removeFromArray(this.entities, entity)) {

			// remove from parent
			const parentEntity = entity.getParent()
			if (parentEntity != undefined) {
				parentEntity.removeChild(entity)
			}

			// remove physics and graphics

			if (Type.IUpdatableEntity.isSupertypeOf(entity)) {
				Util.removeFromArray(this.updatableEntities, entity)
			}

			if (Type.IDrawableEntity.isSupertypeOf(entity)) {
				entity.getContainer?.().removeChild(entity.getDrawable())
			}

			if (Type.IDrawablePhysicsEntity.isSupertypeOf(entity)) {
				// TODO: The entity might not be in the world and will therefore not
				// removed from its parent container
				Composite.remove(this.scene.getWorld(), entity.getPhysicsObject(), true)
				Util.removeFromArray(this.drawablePhysicsEntities, entity)
			}

			if (Type.IContainerEntity.isSupertypeOf(entity)) {
				const children = entity.getChildren()
				for (let i = 0; i < children.length; i++) {
					entity.removeChild(children[i])
				}
			}

		}
	}

	updateDrawablePosition() {
		this.drawablePhysicsEntities.forEach(entity => {
			entity.updateDrawablePosition()
		})
	}

	update() {
		this.updatableEntities.forEach(entity => entity.update(this.scene.getDT()))
	}

	getNumberOfEntities() {
		return this.entities.length
	}

	getNumberOfUpdatableEntities() {
		return this.updatableEntities.length
	}

	getNumberOfDrawablePhysicsEntities() {
		return this.drawablePhysicsEntities.length
	}

	/**
	 * remove all entities
	 */
	clear() {
		this.entities.length = 0
		this.updatableEntities.length = 0
		this.drawablePhysicsEntities.length = 0
	}
	
}