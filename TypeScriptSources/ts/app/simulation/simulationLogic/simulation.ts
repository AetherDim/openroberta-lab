import './pixijs'
import './ExtendedMatter'
import { cyberspaceScenes } from './external/SceneDesciptorList'
import { RobertaRobotSetupData } from './Robot/RobertaRobotSetupData'
import { Cyberspace } from './Cyberspace/Cyberspace';
import { SceneDescriptor } from './Cyberspace/SceneManager';
import { BlocklyDebug } from './BlocklyDebug';
import { UIManager } from './UIManager';
import { interpreterSimBreakEventHandlers } from "interpreter.jsHelper"
import { RRCScoreScene } from './RRC/Scene/RRCScoreScene';
import { RESTState, ResultErrorType, sendStateRequest } from './external/RESTApi';

//
// init all components for a simulation
//
const cyberspace = new Cyberspace('sceneCanvas', 'simDiv')
const sceneManager = cyberspace.getSceneManager()
const blocklyDebugManager = new BlocklyDebug(cyberspace)

UIManager.simSpeedUpButton.setState("fastForward")
UIManager.showScoreButton.setState("showScore")


sendStateRequest(res => {
	if(res && res.error == ResultErrorType.NONE) {
		const result: RESTState = <RESTState><any>(res!.result);
		if(result.uploadEnabled) {
			$('#head-navigation-upload').css('display', 'inline');
		}
	}
})


cyberspace.eventManager
	.onStartPrograms(() => UIManager.programControlButton.setState("stop"))
	.onStopPrograms(() => UIManager.programControlButton.setState("start"))
	.onStartSimulation(() => UIManager.physicsSimControlButton.setState("stop"))
	.onPauseSimulation(() => UIManager.physicsSimControlButton.setState("start"))

cyberspace.specializedEventManager
	.addEventHandlerSetter(RRCScoreScene, scoreScene =>
		scoreScene.scoreEventManager.onShowHideScore(state =>
			UIManager.showScoreButton.setState(state == "hideScore" ? "showScore" : "hideScore"))
		)

interpreterSimBreakEventHandlers.push(() => {
	cyberspace.pausePrograms()
})


sceneManager.registerScene(...cyberspaceScenes)

// switch to first scene
cyberspace.switchToNextScene(true)


/**
 * @param programs 
 * @param refresh `true` if "SIM" is pressed, `false` if play is pressed
 * @param robotType 
 */
export function init(programs: RobertaRobotSetupData[], refresh: boolean, robotType: string) {


	//$('simScene').hide();

	// TODO: prevent clicking run twice

	cyberspace.setRobertaRobotSetupData(programs, robotType)
}


export function getNumRobots(): number {
	return 1;
}


export function setPause(pause:boolean) {
	if(pause) {
		cyberspace.pausePrograms()
	} else {
		cyberspace.startPrograms()
	}
}

export function run(refresh:boolean, robotType: any) {
	//init(Util.simulation.storedRobertaRobotSetupData, refresh, robotType);
	console.log("run!")
}

/**
 * on stop program
 */
export function stopProgram() {
	cyberspace.stopPrograms()
}

export function importImage() {
	alert('This function is not supported, sorry :(');
}

export function setInfo() {
	alert('info');
}

/**
 * Reset robot position and zoom of ScrollView
 */
export function resetPose() {
	cyberspace.resetScene()
}

export function updateDebugMode(debugMode:boolean) {
	blocklyDebugManager.setDebugMode(debugMode)
}

export function endDebugging() {
	blocklyDebugManager.setDebugMode(false)
}

export function interpreterAddEvent(event:any) {
	blocklyDebugManager.interpreterAddEvent(event)
}

/**
 * on simulation close
 */
export function cancel() {
	cyberspace.pausePrograms()
}


//
// Scene selection functions
//

export function getScenes(): SceneDescriptor[] {
	return cyberspace.getScenes()
}

export function selectScene(ID: string) {
	cyberspace.loadScene(ID)
}

export function nextScene(): SceneDescriptor | undefined {
	return cyberspace.switchToNextScene();
}

export function sim(run: boolean) {
	if(run) {
		cyberspace.startSimulation()
	} else {
		cyberspace.pauseSimulation()
	}
}

export function score(visible: boolean) {
	const scene = cyberspace.getScene()
	if (scene instanceof RRCScoreScene) {
		scene.showScoreScreen(visible)
	}
}

export function zoomIn() {
	cyberspace.zoomViewIn()
}

export function zoomOut() {
	cyberspace.zoomViewOut()
}

export function zoomReset() {
	cyberspace.resetView()
}

export function setSimSpeed(speedup: number) {
	cyberspace.setSimulationSpeedupFactor(speedup)
}