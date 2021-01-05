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
    // TODO: pause/start program
    if(pause) {
        engine.stopSim()
    } else {
        engine.startSim()
    }
}

export function run(refresh:boolean, robotType: any) {
    init(storedPrograms, refresh, robotType);
}

export function stopProgram() {
    engine.stopSim();
    //TODO: reset
    //  reloadProgram();
    // remove debug highlights
    init(storedPrograms, false, storedRobotType);
    alert('stop');
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
    engine.updateDebugMode(debugMode);
}

export function endDebugging() {
    engine.endDebugging();
}

export function interpreterAddEvent(event:any) {
    engine.interpreterAddEvent(event);
}

export function cancel() {
    alert('cancel');
}