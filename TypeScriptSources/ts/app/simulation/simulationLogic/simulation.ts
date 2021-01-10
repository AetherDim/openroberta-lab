import './pixijs'
import {SceneRender} from './SceneRenderer'
import './ExtendedMatter'
import {AgeGroup} from "./RRC/AgeGroup";
import {RRCLineFollowingScene} from "./RRC/Scene/RRCLineFollowingScene";
import {Scene} from "./Scene/Scene";
import {TestScene} from "./Scene/TestScene";
import {RRCRainbowScene} from "./RRC/Scene/RRCRainbowScene";
import {RRCScene} from "./RRC/Scene/RRCScene";
import {RRCLabyrinthScene} from "./RRC/Scene/RRCLabyrinthScene";


// TODO: check whether this has to be defined in here
// probably not
export class SceneHandle {
    readonly name: string;
    readonly description: string;
    readonly ID: string;
    readonly creteScene: () => Scene;

    constructor(name: string, ID: string, description: string, creteScene: () => Scene) {
        this.name = name;
        this.description = description;
        this.ID = ID;
        this.creteScene = creteScene;
    }

}

export class SceneManager {
    private readonly sceneHandleMap = new Map<string, SceneHandle>();
    private readonly sceneMap = new Map<string, Scene>();
    private currentID: string = null;

    getScene(ID: string) {
        let scene = this.sceneMap.get(ID);
        if(!scene) {
            const sceneHandle = this.sceneHandleMap.get(ID);
            if(sceneHandle) {
                scene = sceneHandle.creteScene();
                this.sceneMap.set(ID, scene);
            }
        }
        return scene;
    }

    registerScene(...sceneHandles: SceneHandle[]) {
        sceneHandles.forEach(handle => {
            if(this.sceneHandleMap.get(handle.ID)) {
                console.error('Scene with ID: ' + handle.ID + ' already registered!!!');
                return;
            }
            this.sceneHandleMap.set(handle.ID, handle);
        });
    }

    getSceneHandleList(): SceneHandle[] {
        return Array.from(this.sceneHandleMap.values());
    }

    getNextScene(): Scene {
        if(this.sceneHandleMap.size < 1) {
            console.error('No scenes registered!!!');
            return null;
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

    getCurrentHandle(): SceneHandle {
        return this.sceneHandleMap.get(this.currentID);
    }

    setCurrentScene(ID: string) {
        this.currentID = ID;
    }
}


const sceneManager = new SceneManager();


//
// register scenes
//

sceneManager.registerScene(

    //
    // Test
    //

    new SceneHandle(
    'Test Scene',
    'TestScene',
    'Test scene with all sim features',
    () => {
            return new TestScene();
        }
    ),

    new SceneHandle(
        'Empty Scene',
        'EmptyScene',
        'Empty Scene',
        () => {
            return new Scene();
        }
    ),

    new SceneHandle(
        'RRC - Test Scene',
        'RRCTest',
        'Roborave Cyberspace Test',
        () => {
            return new RRCScene(AgeGroup.ES);
        }
    ),

    //
    //  Line Following
    //

    new SceneHandle(
        'RRC - Line Following - ES',
        'RRCLineFollowingES',
        'Roborave Cyberspace line following ES',
        () => {
            return new RRCLineFollowingScene(AgeGroup.ES);
        }
    ),

    new SceneHandle(
        'RRC - Line Following - MS',
        'RRCLineFollowingMS',
        'Roborave Cyberspace line following MS',
        () => {
            return new RRCLineFollowingScene(AgeGroup.MS);
        }
    ),

    new SceneHandle(
        'RRC - Line Following - HS',
        'RRCLineFollowingHS',
        'Roborave Cyberspace line following HS',
        () => {
            return new RRCLineFollowingScene(AgeGroup.HS);
        }
    ),

    //
    // Rainbow
    //

    new SceneHandle(
        'RRC - Rainbow - ES',
        'RRCRainbowES',
        'Roborave Cyberspace Rainbow ES',
        () => {
            return new RRCRainbowScene(AgeGroup.ES);
        }
    ),

    new SceneHandle(
        'RRC - Rainbow - MS',
        'RRCRainbowMS',
        'Roborave Cyberspace Rainbow MS',
        () => {
            return new RRCRainbowScene(AgeGroup.MS);
        }
    ),

    new SceneHandle(
        'RRC - Rainbow - HS',
        'RRCRainbowHS',
        'Roborave Cyberspace Rainbow HS',
        () => {
            return new RRCRainbowScene(AgeGroup.HS);
        }
    ),

    //
    // Labyrinth
    //

    new SceneHandle(
        'RRC - Labyrinth - ES',
        'RRCLabyrinthES',
        'Roborave Cyberspace Labyrinth ES',
        () => {
            return new RRCLabyrinthScene(AgeGroup.ES);
        }
    ),

    new SceneHandle(
        'RRC - Labyrinth - MS',
        'RRCLabyrinthMS',
        'Roborave Cyberspace Labyrinth MS',
        () => {
            return new RRCLabyrinthScene(AgeGroup.MS);
        }
    ),

    new SceneHandle(
        'RRC - Labyrinth - HS',
        'RRCLabyrinthHS',
        'Roborave Cyberspace Labyrinth HS',
        () => {
            return new RRCLabyrinthScene(AgeGroup.HS);
        }
    ),


);





//
// create engine
//
var engine = new SceneRender('sceneCanvas', 'simDiv', sceneManager.getNextScene());
engine.getScene().setupDebugRenderer('notConstantValue');
//engine.getScene().setupDebugRenderer('simDiv');




// store old programs
let storedPrograms:any[];
let storedRobotType:string;


/**
 * @param programs 
 * @param refresh `true` if "SIM" is pressed, `false` if play is pressed
 * @param robotType 
 */
export function init(programs: any[], refresh: boolean, robotType: string) {
    storedPrograms = programs;
    storedRobotType = robotType;

    //$('simScene').hide();

    engine.getScene().getProgramManager().setPrograms(programs, refresh, robotType);
}


export function getNumRobots(): number {
    return engine.getScene().getNumberOfRobots();
}


export function setPause(pause:boolean) {
    engine.getScene().getProgramManager().setProgramPause(pause);
}

export function run(refresh:boolean, robotType: any) {
    init(storedPrograms, refresh, robotType);
}

/**
 * on stop program
 */
export function stopProgram() {
    // TODO: reset robot?
    engine.getScene().getProgramManager().stopProgram();
    init(storedPrograms, false, storedRobotType);
}

export function importImage() {
    alert('This function is not supported, sorry :(');
}

export function setInfo() {
    alert('info');
}

export function resetPose() {
    engine.getScene()?.reset();
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

export function getScenes(): SceneHandle[] {
    return sceneManager.getSceneHandleList();
}

export function selectScene(ID: string) {
    const scene = sceneManager.getScene(ID);
    sceneManager.setCurrentScene(ID);
    engine.switchScene(scene, true);
    scene?.fullReset();
}

export function nextScene(): SceneHandle {
    const scene = sceneManager.getNextScene();
    engine.switchScene(scene, true);
    scene?.fullReset();
    return sceneManager.getCurrentHandle();
}