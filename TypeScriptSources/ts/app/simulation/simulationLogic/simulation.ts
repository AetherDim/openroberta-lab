import { SceneRender } from './SceneRenderer'
import './ExtendedMatter'
import { debug } from 'console';

var engine = new SceneRender('sceneCanvas', 'simDiv');
engine.getScene().setupDebugRenderer('notConstantValue');
//engine.getScene().setupDebugRenderer('simDiv');

engine.getScene().testPhysics();

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

    //$('#blockly').openRightView("sim", 0.5);
    console.log("init simulation");

    engine.setPrograms(programs, refresh, robotType);

    // TODO: reset scene on refresh
}


export function getNumRobots(): number {
    let scene = engine.getScene();
    return scene ? scene.robots.length : 0;
}


export function setPause(pause:boolean) {
    engine.getScene().programFlowManager.setProgramPause(pause);
}

export function run(refresh:boolean, robotType: any) {
    init(storedPrograms, refresh, robotType);
}

/**
 * on stop program
 */
export function stopProgram() {
    // TODO: reset robot?
    engine.getScene().programFlowManager.stopProgram();
    init(storedPrograms, false, storedRobotType);
}

export function importImage() {
    // TODO: remove
    alert('This function is not supported, sorry :(');
}

export function setInfo() {
    alert('info');
}

export function resetPose() {
    alert('reset pose');
}

export function updateDebugMode(debugMode:boolean) {
    engine.getScene().programFlowManager.updateDebugMode(debugMode);
}

export function endDebugging() {
    engine.getScene().programFlowManager.endDebugging();
}

export function interpreterAddEvent(event:any) {
    engine.getScene().programFlowManager.interpreterAddEvent(event);
}

/**
 * on simulation close
 */
export function cancel() {
    engine.getScene().programFlowManager.stopProgram();
}