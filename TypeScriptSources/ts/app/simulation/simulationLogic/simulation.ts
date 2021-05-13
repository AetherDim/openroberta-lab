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
import { RobotProgram } from './Robot/RobotProgram';
import { DEBUG } from './GlobalDebug';

// TODO: check whether this has to be defined in here
// probably not
export class SceneDescriptor {
	readonly name: string;
	readonly description: string;
	readonly ID: string;
	private readonly _createScene: (descriptor: SceneDescriptor) => Scene;

	constructor(name: string, ID: string, description: string, creteScene: (descriptor: SceneDescriptor) => Scene) {
		this.name = name;
		this.description = description;
		this.ID = ID;
		this._createScene = creteScene;
	}

	createScene() {
		return this._createScene(this)
	}

}

export class SceneManager {
	private readonly sceneHandleMap = new Map<string, SceneDescriptor>();
	private readonly sceneMap = new Map<string, Scene>();
	private currentID?: string;

	getScene(ID: string) {
		let scene = this.sceneMap.get(ID);
		if(!scene) {
			const sceneHandle = this.sceneHandleMap.get(ID);
			if(sceneHandle) {
				scene = sceneHandle.createScene();
				this.sceneMap.set(ID, scene);
			}
		}
		return scene;
	}

	registerScene(...sceneHandles: SceneDescriptor[]) {
		sceneHandles.forEach(handle => {
			if(this.sceneHandleMap.get(handle.ID)) {
				console.error('Scene with ID: ' + handle.ID + ' already registered!!!');
				return;
			}
			this.sceneHandleMap.set(handle.ID, handle);
		});
	}

	getSceneHandleList(): SceneDescriptor[] {
		return Array.from(this.sceneHandleMap.values());
	}

	getNextScene(): Scene | undefined {
		if(this.sceneHandleMap.size < 1) {
			console.error('No scenes registered!!!');
			return undefined;
		}

		if(!this.currentID) {
			this.currentID = Array.from(this.sceneHandleMap.keys())[0];
			return this.getScene(this.currentID);
		}

		const keys = Array.from(this.sceneHandleMap.keys());
		var idx = keys.indexOf(this.currentID);

		if(idx >= 0) {
			idx ++;
			if(idx >= keys.length) {
				idx = 0;
			}
			this.currentID = keys[idx];
		} else  {
			// one loop around
			this.currentID = Array.from(this.sceneHandleMap.keys())[0];
		}

		return this.getScene(this.currentID);
	}

	getCurrentHandle(): SceneDescriptor | undefined {
		if (this.currentID) {
			return this.sceneHandleMap.get(this.currentID);
		}
		return undefined
	}

	setCurrentScene(ID: string) {
		this.currentID = ID;
	}
}


const sceneManager = new SceneManager();


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
	'TestScene',
	'Test scene with all sim features',
	(descriptor) => {
			return new TestScene(descriptor.name);
		}
	),

	new SceneDescriptor(
		"Test Scene 2", "TestScene2", "T",
		(descriptor) => new TestScene2(descriptor.name, AgeGroup.ES)
	),

	new SceneDescriptor(
		"Test Scene 3", "TestScene3", "Test scene for testing the robot",
		(descriptor) => new TestScene3()
	),

	new SceneDescriptor(
		'Empty Scene',
		'EmptyScene',
		'Empty Scene',
		(descriptor) => {
			return new Scene(descriptor.name);
		}
	),

	new SceneDescriptor(
		'RRC - Test Scene',
		'RRCTest',
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
		'RRCLineFollowingES',
		'Roborave Cyberspace line following ES',
		(descriptor) => {
			return new RRCLineFollowingScene(descriptor.name, AgeGroup.ES);
		}
	),

	new SceneDescriptor(
		'RRC - Line Following - MS',
		'RRCLineFollowingMS',
		'Roborave Cyberspace line following MS',
		(descriptor) => {
			return new RRCLineFollowingScene(descriptor.name, AgeGroup.MS);
		}
	),

	new SceneDescriptor(
		'RRC - Line Following - HS',
		'RRCLineFollowingHS',
		'Roborave Cyberspace line following HS',
		(descriptor) => {
			return new RRCLineFollowingScene(descriptor.name, AgeGroup.HS);
		}
	),

	//
	// Rainbow
	//

	new SceneDescriptor(
		'RRC - Rainbow - ES',
		'RRCRainbowES',
		'Roborave Cyberspace Rainbow ES',
		(descriptor) => {
			return new RRCRainbowScene(descriptor.name, AgeGroup.ES);
		}
	),

	new SceneDescriptor(
		'RRC - Rainbow - MS',
		'RRCRainbowMS',
		'Roborave Cyberspace Rainbow MS',
		(descriptor) => {
			return new RRCRainbowScene(descriptor.name, AgeGroup.MS);
		}
	),

	new SceneDescriptor(
		'RRC - Rainbow - HS',
		'RRCRainbowHS',
		'Roborave Cyberspace Rainbow HS',
		(descriptor) => {
			return new RRCRainbowScene(descriptor.name, AgeGroup.HS);
		}
	),

	//
	// Labyrinth
	//

	new SceneDescriptor(
		'RRC - Labyrinth - ES',
		'RRCLabyrinthES',
		'Roborave Cyberspace Labyrinth ES',
		(descriptor) => {
			return new RRCLabyrinthScene(descriptor.name, AgeGroup.ES);
		}
	),

	new SceneDescriptor(
		'RRC - Labyrinth - MS',
		'RRCLabyrinthMS',
		'Roborave Cyberspace Labyrinth MS',
		(descriptor) => {
			return new RRCLabyrinthScene(descriptor.name, AgeGroup.MS);
		}
	),

	new SceneDescriptor(
		'RRC - Labyrinth - HS',
		'RRCLabyrinthHS',
		'Roborave Cyberspace Labyrinth HS',
		(descriptor) => {
			return new RRCLabyrinthScene(descriptor.name, AgeGroup.HS);
		}
	),


);





//
// create engine
//
var engine = new SceneRender('sceneCanvas', true, 'simDiv', sceneManager.getNextScene());
//engine.getScene().setupDebugRenderer('notConstantValue');
//engine.getScene().setupDebugRenderer('simDiv');



/**
 * @param programs 
 * @param refresh `true` if "SIM" is pressed, `false` if play is pressed
 * @param robotType 
 */
export function init(programs: RobotProgram[], refresh: boolean, robotType: string) {

	function toProgramEqualityObject(p: RobotProgram): unknown {
		return {
			javaScriptConfiguration: p.javaScriptConfiguration
		}
	}
	let hasNewConfiguration = !Util.deepEqual(
		programs.map(toProgramEqualityObject),
		Util.simulation.storedPrograms.map(toProgramEqualityObject))

	Util.simulation.storedPrograms = programs;
	Util.simulation.storedRobotType = robotType;

	//$('simScene').hide();

	// TODO: prevent clicking run twice

	const configurationManager = engine.getScene().getRobotManager().configurationManager
	configurationManager.setRobotConfigurations(programs.map(p => p.javaScriptConfiguration))
	engine.getScene().getProgramManager().setPrograms(programs, refresh, robotType)

	if (hasNewConfiguration) {
		engine.getScene().reset()
	}
}


export function getNumRobots(): number {
	return engine.getScene().getRobotManager().getNumberOfRobots();
}


export function setPause(pause:boolean) {
	engine.getScene().getProgramManager().setProgramPause(pause);
}

export function run(refresh:boolean, robotType: any) {
	init(Util.simulation.storedPrograms, refresh, robotType);
}

/**
 * on stop program
 */
export function stopProgram() {
	// TODO: reset robot?
	engine.getScene().getProgramManager().stopProgram();
	init(Util.simulation.storedPrograms, false, Util.simulation.storedRobotType);
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
	engine.getScene()?.reset();
	//engine.getScene()?.fullReset();
}

export function updateDebugMode(debugMode:boolean) {
	engine.getScene().getProgramManager().updateDebugMode(debugMode);
}

export function endDebugging() {
	engine.getScene().getProgramManager().endDebugging();
}

export function interpreterAddEvent(event:any) {
	engine.getScene().getProgramManager().interpreterAddEvent(event);
}

/**
 * on simulation close
 */
export function cancel() {
	engine.getScene().getProgramManager().stopProgram();
}


//
// Scene selection functions
//

export function getScenes(): SceneDescriptor[] {
	return sceneManager.getSceneHandleList();
}

export function selectScene(ID: string) {
	const scene = sceneManager.getScene(ID);
	sceneManager.setCurrentScene(ID);
	engine.switchScene(scene, true);
	scene?.fullReset();
}

export function nextScene(): SceneDescriptor | undefined {
	const scene = sceneManager.getNextScene();
	engine.switchScene(scene, true);
	scene?.fullReset();
	return sceneManager.getCurrentHandle();
}

export function sim(run: boolean) {
	if(run) {
		engine.getScene().startSim();
	} else {
		engine.getScene().pauseSim();
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
	engine.zoomIn()
}

export function zoomOut() {
	engine.zoomOut()
}

export function zoomReset() {
	engine.zoomReset()
}

export function setSimSpeed(speedup: number) {
	engine.setSpeedUpFactor(speedup)
}