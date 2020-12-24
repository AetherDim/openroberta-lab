import { SimulationEngine } from './simulationEngine'
import './extendedMatter'

var engine = new SimulationEngine('sceneCanvas', null, true, true);
//engine.scene.setupDebugRenderer('notConstantValue');
engine.scene.setupDebugRenderer('simDiv');

engine.scene.testPhysics();



/**
 * @param programs 
 * @param refresh `true` if "SIM" is pressed, `false` if play is pressed
 * @param robotType 
 */
export function init(programs: any, refresh: boolean, robotType: string) {
    $('#blockly').openRightView("sim", 0.5);

    console.log("init");

    engine.setPrograms(programs)
    engine.startSim()
}


export function getNumRobots(): number {
    return 1;
}

export function setPause(pause:boolean) {
    
}

export function run(p1:boolean, p2: any) {
    engine.startSim();
}

export function stopProgram() {
    engine.stopSim();
}

export function importImage() {
    
}

export function setInfo() {
    
}

export function resetPose() {
    
}

export function updateDebugMode(p1:boolean) {
    
}

export function endDebugging() {
    
}

export function interpreterAddEvent(event:any) {
    
}

export function cancel() {

}