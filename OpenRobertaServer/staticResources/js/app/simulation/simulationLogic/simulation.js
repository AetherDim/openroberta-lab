define(["require", "exports", "./scene", "matter-js"], function (require, exports, scene_1, matter) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cancel = exports.interpreterAddEvent = exports.endDebugging = exports.updateDebugMode = exports.resetPose = exports.setInfo = exports.importImage = exports.stopProgram = exports.run = exports.setPause = exports.getNumRobots = exports.init = void 0;
    var Engine = matter.Engine;
    var Render = matter.Render;
    var World = matter.World;
    var Bodies = matter.Bodies;
    var Mouse = matter.Mouse;
    // create an engine
    var engine = Engine.create();
    // create two boxes and a ground
    var boxA = Bodies.rectangle(400, 200, 80, 80);
    var boxB = Bodies.rectangle(450, 50, 80, 80);
    var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
    // add all of the bodies to the world
    World.add(engine.world, [boxA, boxB, ground]);
    // run the engine
    Engine.run(engine);
    var scene = null;
    function init(resultArr, nani, nani2) {
        console.log("init");
        scene = new scene_1.Scene(engine);
    }
    exports.init = init;
    function getNumRobots() {
        return 0;
    }
    exports.getNumRobots = getNumRobots;
    function setPause(pause) {
    }
    exports.setPause = setPause;
    function run(p1, p2) {
        console.log("run");
    }
    exports.run = run;
    function stopProgram() {
    }
    exports.stopProgram = stopProgram;
    function importImage() {
    }
    exports.importImage = importImage;
    function setInfo() {
    }
    exports.setInfo = setInfo;
    function resetPose() {
    }
    exports.resetPose = resetPose;
    function updateDebugMode(p1) {
    }
    exports.updateDebugMode = updateDebugMode;
    function endDebugging() {
    }
    exports.endDebugging = endDebugging;
    function interpreterAddEvent(event) {
    }
    exports.interpreterAddEvent = interpreterAddEvent;
    function cancel() {
    }
    exports.cancel = cancel;
});
