import { Scene } from "../Scene/Scene";
import { Util } from "../Util";

export class SceneDescriptor {
	readonly name: string
	readonly description: string
	readonly ID: string
	private readonly _createScene: (descriptor: SceneDescriptor) => Scene

	constructor(name: string, description: string, createScene: (descriptor: SceneDescriptor) => Scene, ID:string|undefined=undefined) {
		this.name = name
		this.description = description

		if(ID) {
			this.ID = ID
		} else {
			this.ID = Util.genHtmlUid2()
		}
		
		this._createScene = createScene
	}

	createScene() {
		return this._createScene(this)
	}

}

export class SceneManager {
	private readonly sceneHandleMap = new Map<string, SceneDescriptor>()
	private readonly sceneMap = new Map<string, Scene>()
	private currentID?: string
	public disableSceneCache: boolean = false

	destroy() {
		Array.from(this.sceneMap.values()).forEach(scene => scene.destroy())
		this.sceneMap.clear()
	}

	getScene(ID: string) {
		let scene = this.sceneMap.get(ID)
		if(this.disableSceneCache) {
			scene = undefined
		}
		if(!scene) {
			const sceneHandle = this.sceneHandleMap.get(ID)
			if(sceneHandle) {
				scene = sceneHandle.createScene()
				this.sceneMap.set(ID, scene)
			}
		}
		return scene
	}

	registerScene(...sceneHandles: SceneDescriptor[]) {
		sceneHandles.forEach(handle => {
			if(this.sceneHandleMap.get(handle.ID)) {
				console.error('Scene with ID: ' + handle.ID + ' already registered!!!')
				return
			}
			this.sceneHandleMap.set(handle.ID, handle)
		})
	}

	getSceneDescriptorList(): SceneDescriptor[] {
		return Array.from(this.sceneHandleMap.values())
	}

	getNextScene(): Scene | undefined {
		if(this.sceneHandleMap.size < 1) {
			console.error('No scenes registered!!!')
			return undefined
		}

		if(!this.currentID) {
			this.currentID = Array.from(this.sceneHandleMap.keys())[0]
			return this.getScene(this.currentID)
		}

		const keys = Array.from(this.sceneHandleMap.keys())
		var idx = keys.indexOf(this.currentID)

		if(idx >= 0) {
			idx ++
			if(idx >= keys.length) {
				idx = 0
			}
			this.currentID = keys[idx]
		} else  {
			// one loop around
			this.currentID = Array.from(this.sceneHandleMap.keys())[0]
		}

		return this.getScene(this.currentID)
	}

	getCurrentSceneDescriptor(): SceneDescriptor | undefined {
		if (this.currentID) {
			return this.sceneHandleMap.get(this.currentID)
		}
		return undefined
	}

	setCurrentScene(ID: string) {
		this.currentID = ID
	}
}