import { RobotMbedBehaviour } from './interpreter.robotSimBehaviour'
import { Interpreter } from './interpreter.interpreter'
import { SimulationEngine } from './simulationEngine'
import './extendedMatter'

var engine = new SimulationEngine('sceneCanvas', null, true, true);
//engine.scene.setupDebugRenderer('notConstantValue');
engine.scene.setupDebugRenderer('simDiv');

engine.scene.testPhysics();


var interpreters: Interpreter[]
var configurations: any[] = []

//$('#blockly').openRightView("sim", 0.5);

export function init(programs: any, refresh: boolean, robotType: string) {
    $('#blockly').openRightView("sim", 0.5);

    console.log("init");

    /*interpreters = programs.map((x:any) => {
        var src = JSON.parse(x.javaScriptProgram);
        configurations.push(x.javaScriptConfiguration);
        return new Interpreter(src, new RobotMbedBehaviour(), () => {console.log("Interpreter terminated")}, []);
    });*/

}


export function getNumRobots(): number {
    return 0;
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