import { Scene } from "./scene";
import * as matter from 'matter-js'

const Engine = matter.Engine;
const Render = matter.Render;
const World = matter.World;
const Bodies = matter.Bodies;
const Mouse = matter.Mouse;

// create an engine
const engine = Engine.create()

// create two boxes and a ground
var boxA = Bodies.rectangle(400, 200, 80, 80);
var boxB = Bodies.rectangle(450, 50, 80, 80);
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ground]);

// run the engine
Engine.run(engine);

var scene = null;

export function init(resultArr: any, nani:boolean, nani2:any) {
    console.log("init");
    scene = new Scene(engine);

}


export function getNumRobots(): number {
    return 0;
}

export function setPause(pause:boolean) {
    
}

export function run(p1:boolean, p2: any) {
    console.log("run");
}

export function stopProgram() {
    
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