import { RobertaRobotSetupData } from "../Robot/RobertaRobotSetupData"
import { RobotProgram } from "../Robot/RobotProgram"
import { SimulationCache } from "./SimulationCache"
import { Scene } from "../Scene/Scene"
import { RRCScoreScene } from "../RRC/Scene/RRCScoreScene"
import { SceneRender } from "../SceneRenderer"
import { SceneDescriptor, SceneManager } from "./SceneManager"
import { EventManager, ParameterTypes } from "../EventManager/EventManager"


export class Cyberspace {

	private readonly sceneManager = new SceneManager()
	private readonly renderer: SceneRender

	private simulationCache: SimulationCache = new SimulationCache([], "")

	readonly eventManager = EventManager.init({
		/** will be called after the simulation has been started */
		onStartSimulation: ParameterTypes.none,
		/** will be called after the simulation has been paused */
		onPauseSimulation: ParameterTypes.none,

		/** will be called after the program has been started */
		onStartPrograms: ParameterTypes.none,
		/** will be called after the program has been paused or stopped */
		onPausePrograms: ParameterTypes.none,
		/** will be called after the program has been stopped */
		onStopPrograms: ParameterTypes.none
	})

	readonly specializedEventManager = new class SpecializedEventManager {
		private handlerSetters: ((scene: Scene) => void)[] = []
		/**
		 * Adds the function `setHandler` which is later called in `Cyberspace.resetEventHandlersOfScene(scene)`.
		 * 
		 * @param sceneType The type of the scene
		 * @param setHandler The function which sets the event handlers of a scene of type `sceneType`.
		 */
		addEventHandlerSetter<S extends Scene>(sceneType: new (...args: any) => S, setHandler: (scene: S) => void) {
			this.handlerSetters.push(scene => {
				if (scene instanceof sceneType) {
					setHandler(scene)
				}
			})
		}
		/**
		 * Sets the specified event handlers for `scene`.
		 * 
		 * This method should only be called inside `Cyberspace`.
		 */
		_setEventHandlers(scene: Scene) {
			this.handlerSetters.forEach(handlerSetter => handlerSetter(scene))
		}
	}

	constructor(canvas: HTMLCanvasElement | string, autoResizeTo?: HTMLElement | string, scenes: SceneDescriptor[] = []) {
		this.sceneManager.registerScene(...scenes)
		// empty scene as default
		const emptyScene = new Scene("")
		this.renderer = new SceneRender(emptyScene, canvas, this.simulationCache.toRobotSetupData(), autoResizeTo)

		const t = this
		this.renderer.onSwitchScene(scene => t.resetEventHandlersOfScene(scene))
	}

	destroy() {
		this.sceneManager.destroy()
		this.renderer.destroy()
	}

	/* ############################################################################################ */
	/* ####################################### Scene control ###################################### */
	/* ############################################################################################ */

	private resetEventHandlersOfScene(scene: Scene) {
		scene.removeAllEventHandlers()

		this.specializedEventManager._setEventHandlers(scene)

		const eventHandlerLists = this.eventManager.eventHandlerLists
		const programManagerEventHandlerLists = scene.getProgramManager().eventManager.eventHandlerLists
		programManagerEventHandlerLists.onStartProgram.pushEventHandleList(
			eventHandlerLists.onStartPrograms)
		programManagerEventHandlerLists.onPauseProgram.pushEventHandleList(
			eventHandlerLists.onPausePrograms)
		programManagerEventHandlerLists.onStopProgram.pushEventHandleList(
			eventHandlerLists.onStopPrograms)

		const sceneEventHandlerLists = scene.eventManager.eventHandlerLists
		sceneEventHandlerLists.onStartSimulation.pushEventHandleList(
			eventHandlerLists.onStartSimulation)
		sceneEventHandlerLists.onPauseSimulation.pushEventHandleList(
			eventHandlerLists.onPauseSimulation)
	}

	resetScene() {
		this.renderer.getScene().reset(this.simulationCache.toRobotSetupData())
	}

	fullResetScene() {
		this.renderer.getScene().fullReset(this.simulationCache.toRobotSetupData())
	}

	getScene(): Scene {
		return this.renderer.getScene()
	}

	getScoreScene(): RRCScoreScene|undefined {
		const scene = this.renderer.getScene()
		if(scene instanceof RRCScoreScene) {
			return scene
		}
		return undefined
	}

	getScenes(): SceneDescriptor[] {
		return this.sceneManager.getSceneDescriptorList()
	}

	private switchToScene(scene: Scene) {
		this.renderer.switchScene(this.simulationCache.toRobotSetupData(), scene)
		if (scene.isLoadingComplete()) {
			this.fullResetScene()
		}
	}

	loadScene(ID: string, forced: boolean = false) {
		if(this.getScene().isLoadingComplete()) {
			const scene = this.sceneManager.getScene(ID)
			if(scene) {
				this.sceneManager.setCurrentScene(ID)
				this.switchToScene(scene)
			}
		}
	}

	switchToNextScene(forced: boolean = false): SceneDescriptor {
		if(forced || this.getScene().isLoadingComplete()) {
			const scene = this.sceneManager.getNextScene()
			if(scene != undefined) {
				this.switchToScene(scene)
			}
		}
		return this.sceneManager.getCurrentSceneDescriptor()!
	}

	getSceneManager() {
		return this.sceneManager
	}

	
	/* ############################################################################################ */
	/* #################################### Simulation control #################################### */
	/* ############################################################################################ */

	startSimulation() {
		this.getScene().startSim()
	}

	pauseSimulation() {
		this.getScene().pauseSim()
	}

	resetSimulation() {
		this.resetScene()
	}

	setSimulationSpeedupFactor(speedup: number) {
		this.getScene().setSpeedUpFactor(speedup)
	}

	
	/* ############################################################################################ */
	/* ##################################### Program control ###################################### */
	/* ############################################################################################ */

	getProgramManager() {
		return this.getScene().getProgramManager()
	}

	startPrograms() {
		this.getProgramManager().startProgram()
	}

	stopPrograms() {
		this.getProgramManager().stopProgram()
	}

	resumePrograms() {
		this.getProgramManager().startProgram()
	}

	pausePrograms() {
		this.getProgramManager().pauseProgram()
	}

	setPrograms(programs: RobotProgram[]) {
		this.getProgramManager().setPrograms(programs)
	}

	enableDebugMode() {
		this.getProgramManager().startDebugging()
	}

	disableDebugMode() {
		this.getProgramManager().endDebugging()
	}

	registerDebugEventsForAllPrograms() {

	}

	registerDebugEventsForMainPrograms() {
		
	}


	setRobertaRobotSetupData(robertaRobotSetupDataList: RobertaRobotSetupData[], robotType: string) {
		const newSimulationCache = new SimulationCache(robertaRobotSetupDataList, robotType)
		const oldCache = this.simulationCache
		this.simulationCache = newSimulationCache
		if (!newSimulationCache.hasEqualConfiguration(oldCache)) {
			// sets the robot programs and sensor configurations based on 'simulationCache'
			this.resetScene()
		}
		// always set the programs
		this.getProgramManager().setPrograms(
			newSimulationCache.toRobotSetupData().map(setup => setup.program)
		)
	}


	/* ############################################################################################ */
	/* #################################### ScrollView control #################################### */
	/* ############################################################################################ */

	/**
	 * Reset zoom of ScrollView
	 */
	resetView() {
		this.renderer.zoomReset()
	}

	/**
	 * Zoom into ScrollView
	 */
	zoomViewIn() {
		this.renderer.zoomIn()
	}

	/**
	 * zoom out of ScrollView
	 */
	zoomViewOut() {
		this.renderer.zoomOut()
	}

}