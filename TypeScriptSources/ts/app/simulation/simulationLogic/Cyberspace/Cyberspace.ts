import { RobotProgram } from "../Robot/RobotProgram"
import { Scene } from "../Scene/Scene"
import { ScoreScene } from "../Scene/ScoreScene"
import { SceneRender } from "../SceneRenderer"
import { SceneDescriptor, SceneManager } from "./SceneManager"


export class Cyberspace {

	private readonly sceneManager = new SceneManager()
	private readonly renderer: SceneRender

	constructor(canvas: HTMLCanvasElement | string, autoResizeTo?: HTMLElement | string, scenes: SceneDescriptor[] = []) {
		this.sceneManager.registerScene(...scenes)
		this.renderer = new SceneRender(canvas, true, autoResizeTo, this.sceneManager.getNextScene())
	}

	
	/* ############################################################################################ */
	/* ####################################### Scene control ###################################### */
	/* ############################################################################################ */

	resetScene() {
		this.renderer.getScene().reset()
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

	loadScene(ID: string) {
		if(this.getScene().isLoadingComplete()) {
			const scene = this.sceneManager.getScene(ID)
			if(scene) {
				this.sceneManager.setCurrentScene(ID)
				this.renderer.switchScene(scene)
			}
		}
	}

	nextScene(): SceneDescriptor {
		if(this.getScene().isLoadingComplete()) {
			const scene = this.sceneManager.getNextScene()
			if(scene) {
				this.renderer.switchScene(scene)
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
	
	resetPrograms() {
		this.getProgramManager().resetProgram()
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


	setRobotConfig() {
		// TODO
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