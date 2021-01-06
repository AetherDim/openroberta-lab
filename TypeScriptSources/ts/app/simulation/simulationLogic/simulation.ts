import './pixijs'
import { SceneRender } from './SceneRenderer'
import './ExtendedMatter'
import { TestScene } from './Scene/TestScene';
import { RRCScene } from './RRC/Scene/RRCScene'

var engine = new SceneRender('sceneCanvas', 'simDiv', new TestScene());
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
    alert('reset pose');
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