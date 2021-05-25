import { RobertaRobotSetupData } from "../Robot/RobertaRobotSetupData"
import { RobotProgram } from "../Robot/RobotProgram"
import { SimulationCache } from "./SimulationCache"
import { Scene } from "../Scene/Scene"
import { ScoreScene } from "../Scene/ScoreScene"
import { SceneRender } from "../SceneRenderer"
import { SceneDescriptor, SceneManager } from "./SceneManager"


export class Cyberspace {

	private readonly sceneManager = new SceneManager()
	private readonly renderer: SceneRender

	private simulationCache: SimulationCache = new SimulationCache([], "")

	constructor(canvas: HTMLCanvasElement | string, autoResizeTo?: HTMLElement | string, scenes: SceneDescriptor[] = []) {
		this.sceneManager.registerScene(...scenes)
		this.renderer = new SceneRender(
			canvas, true, this.simulationCache.toRobotSetupData(), autoResizeTo
		)
	}


	/* ############################################################################################ */
	/* ####################################### Scene control ###################################### */
	/* ############################################################################################ */

	resetScene() {
		this.renderer.getScene().reset(this.simulationCache.toRobotSetupData())
	}

	fullResetScene() {
		this.renderer.getScene().fullReset(this.simulationCache.toRobotSetupData())
	}

	getScene(): Scene {
		return this.renderer.getScene()
	}

	getScoreScene(): ScoreScene|undefined {
		const scene = this.renderer.getScene()
		if(scene instanceof ScoreScene) {
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

	loadScene(ID: string) {
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
		this.getProgramManager().setProgramPause(false)
	}

	pausePrograms() {
		this.getProgramManager().setProgramPause(true)
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
		} else {
			// always set the programs
			this.getProgramManager().setPrograms(
				newSimulationCache.toRobotSetupData().map(setup => setup.program)
			)
		}
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