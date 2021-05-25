import './pixijs'
import {SceneRender} from './SceneRenderer'
import './ExtendedMatter'
import {AgeGroup} from "./RRC/AgeGroup";
import {RRCLineFollowingScene} from "./RRC/Scene/RRCLineFollowingScene";
import {Scene} from "./Scene/Scene";
import {TestScene} from "./Scene/TestScene";
import {TestScene2} from "./Scene/TestScene2"
import {RRCRainbowScene} from "./RRC/Scene/RRCRainbowScene";
import {RRCScene} from "./RRC/Scene/RRCScene";
import {RRCLabyrinthScene} from "./RRC/Scene/RRCLabyrinthScene";
import { TestScene3 } from './Scene/TestScene3';
import { Util } from './Util';
import { DEBUG } from './GlobalDebug';
import { RobertaRobotSetupData } from './Robot/RobertaRobotSetupData'
import { sensorTypeStrings } from './Robot/Robot';
import { Cyberspace } from './Cyberspace/Cyberspace';
import { SceneDescriptor } from './Cyberspace/SceneManager';
import { BlocklyDebug } from './BlocklyDebug';

//
// init all components for a simulation
//
const cyberspace = new Cyberspace('sceneCanvas', 'simDiv')
const sceneManager = cyberspace.getSceneManager()
const blocklyDebugManager = new BlocklyDebug(cyberspace)


//
// register scenes
//
if(DEBUG)
sceneManager.registerScene(

	//
	// Test
	//

	new SceneDescriptor(
	'Test Scene',
	'Test scene with all sim features',
	(descriptor) => {
			return new TestScene(descriptor.name);
		}
	),

	new SceneDescriptor(
		"Test Scene 2", "Test scene for testing different sensor configurations",
		(descriptor) => new TestScene2(descriptor.name, AgeGroup.ES)
	),

	new SceneDescriptor(
		"Test Scene 3", "Test scene for generating calibration data for the robot",
		(descriptor) => new TestScene3()
	),

	new SceneDescriptor(
		'Empty Scene',
		'Empty Scene',
		(descriptor) => {
			return new Scene(descriptor.name);
		}
	),

	new SceneDescriptor(
		'RRC - Test Scene',
		'Roborave Cyberspace Test',
		(descriptor) => {
			return new RRCScene(descriptor.name, AgeGroup.ES);
		}
	)
)

sceneManager.registerScene(
	//
	//  Line Following
	//

	new SceneDescriptor(
		'RRC - Line Following - ES',
		'Roborave Cyberspace line following ES',
		(descriptor) => {
			return new RRCLineFollowingScene(descriptor.name, AgeGroup.ES);
		}
	),

	new SceneDescriptor(
		'RRC - Line Following - MS',
		'Roborave Cyberspace line following MS',
		(descriptor) => {
			return new RRCLineFollowingScene(descriptor.name, AgeGroup.MS);
		}
	),

	new SceneDescriptor(
		'RRC - Line Following - HS',
		'Roborave Cyberspace line following HS',
		(descriptor) => {
			return new RRCLineFollowingScene(descriptor.name, AgeGroup.HS);
		}
	),

	//
	// Labyrinth
	//

	new SceneDescriptor(
		'RRC - Labyrinth - ES',
		'Roborave Cyberspace Labyrinth ES',
		(descriptor) => {
			return new RRCLabyrinthScene(descriptor.name, AgeGroup.ES);
		}
	),

	new SceneDescriptor(
		'RRC - Labyrinth - MS',
		'Roborave Cyberspace Labyrinth MS',
		(descriptor) => {
			return new RRCLabyrinthScene(descriptor.name, AgeGroup.MS);
		}
	),

	new SceneDescriptor(
		'RRC - Labyrinth - HS',
		'Roborave Cyberspace Labyrinth HS',
		(descriptor) => {
			return new RRCLabyrinthScene(descriptor.name, AgeGroup.HS);
		}
	),


	//
	// Rainbow
	//

	new SceneDescriptor(
		'RRC - Rainbow - ES',
		'Roborave Cyberspace Rainbow ES',
		(descriptor) => {
			return new RRCRainbowScene(descriptor.name, AgeGroup.ES);
		}
	),

	new SceneDescriptor(
		'RRC - Rainbow - MS',
		'Roborave Cyberspace Rainbow MS',
		(descriptor) => {
			return new RRCRainbowScene(descriptor.name, AgeGroup.MS);
		}
	),

	new SceneDescriptor(
		'RRC - Rainbow - HS',
		'Roborave Cyberspace Rainbow HS',
		(descriptor) => {
			return new RRCRainbowScene(descriptor.name, AgeGroup.HS);
		}
	),
);

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

export function score(score: boolean) {
	if(score) {
		//engine.getScene().showScoreScreen(0);
	} else {
		//engine.getScene().hideScore();
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