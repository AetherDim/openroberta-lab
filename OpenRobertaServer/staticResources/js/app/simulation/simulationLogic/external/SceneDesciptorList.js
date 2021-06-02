//
// register scenes
define(["require", "exports", "../Cyberspace/SceneManager", "../GlobalDebug", "../RRC/AgeGroup", "../RRC/Scene/RRCLabyrinthScene", "../RRC/Scene/RRCLineFollowingScene", "../RRC/Scene/RRCRainbowScene", "../RRC/Scene/RRCScene", "../Scene/Scene", "../Scene/TestScene", "../Scene/TestScene2", "../Scene/TestScene3"], function (require, exports, SceneManager_1, GlobalDebug_1, AgeGroup_1, RRCLabyrinthScene_1, RRCLineFollowingScene_1, RRCRainbowScene_1, RRCScene_1, Scene_1, TestScene_1, TestScene2_1, TestScene3_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cyberspaceScenes = exports.sceneIDMap = void 0;
    var scenes = [];
    //
    if (GlobalDebug_1.DEBUG)
        //
        // Test
        //
        scenes.push(new SceneManager_1.SceneDescriptor('Test Scene', 'Test scene with all sim features', function (descriptor) {
            return new TestScene_1.TestScene(descriptor.name);
        }), new SceneManager_1.SceneDescriptor("Test Scene 2", "Test scene for testing different sensor configurations", function (descriptor) { return new TestScene2_1.TestScene2(descriptor.name, AgeGroup_1.AgeGroup.ES); }), new SceneManager_1.SceneDescriptor("Test Scene 3", "Test scene for generating calibration data for the robot", function (descriptor) { return new TestScene3_1.TestScene3(); }), new SceneManager_1.SceneDescriptor('Empty Scene', 'Empty Scene', function (descriptor) {
            return new Scene_1.Scene(descriptor.name);
        }), new SceneManager_1.SceneDescriptor('RRC - Test Scene', 'Roborave Cyberspace Test', function (descriptor) {
            return new RRCScene_1.RRCScene(descriptor.name, AgeGroup_1.AgeGroup.ES);
        }));
    exports.sceneIDMap = {
        1: 'idLineFollowingES',
        2: 'idLineFollowingMS',
        3: 'idLineFollowingHS',
        4: 'idLabyrinthES',
        5: 'idLabyrinthMS',
        6: 'idLabyrinthHS',
        7: 'idRainbowES',
        8: 'idRainbowMS',
        9: 'idRainbowHS',
    };
    //
    //  Line Following
    //
    scenes.push(new SceneManager_1.SceneDescriptor('RRC - Line Following - ES', 'Roborave Cyberspace line following ES', function (descriptor) {
        return new RRCLineFollowingScene_1.RRCLineFollowingScene(descriptor.name, AgeGroup_1.AgeGroup.ES);
    }, exports.sceneIDMap[1]), new SceneManager_1.SceneDescriptor('RRC - Line Following - MS', 'Roborave Cyberspace line following MS', function (descriptor) {
        return new RRCLineFollowingScene_1.RRCLineFollowingScene(descriptor.name, AgeGroup_1.AgeGroup.MS);
    }, exports.sceneIDMap[2]), new SceneManager_1.SceneDescriptor('RRC - Line Following - HS', 'Roborave Cyberspace line following HS', function (descriptor) {
        return new RRCLineFollowingScene_1.RRCLineFollowingScene(descriptor.name, AgeGroup_1.AgeGroup.HS);
    }, exports.sceneIDMap[3]), 
    //
    // Labyrinth
    //
    new SceneManager_1.SceneDescriptor('RRC - Labyrinth - ES', 'Roborave Cyberspace Labyrinth ES', function (descriptor) {
        return new RRCLabyrinthScene_1.RRCLabyrinthScene(descriptor.name, AgeGroup_1.AgeGroup.ES);
    }, exports.sceneIDMap[4]), new SceneManager_1.SceneDescriptor('RRC - Labyrinth - MS', 'Roborave Cyberspace Labyrinth MS', function (descriptor) {
        return new RRCLabyrinthScene_1.RRCLabyrinthScene(descriptor.name, AgeGroup_1.AgeGroup.MS);
    }, exports.sceneIDMap[5]), new SceneManager_1.SceneDescriptor('RRC - Labyrinth - HS', 'Roborave Cyberspace Labyrinth HS', function (descriptor) {
        return new RRCLabyrinthScene_1.RRCLabyrinthScene(descriptor.name, AgeGroup_1.AgeGroup.HS);
    }, exports.sceneIDMap[6]), 
    //
    // Rainbow
    //
    new SceneManager_1.SceneDescriptor('RRC - Rainbow - ES', 'Roborave Cyberspace Rainbow ES', function (descriptor) {
        return new RRCRainbowScene_1.RRCRainbowScene(descriptor.name, AgeGroup_1.AgeGroup.ES);
    }, exports.sceneIDMap[7]), new SceneManager_1.SceneDescriptor('RRC - Rainbow - MS', 'Roborave Cyberspace Rainbow MS', function (descriptor) {
        return new RRCRainbowScene_1.RRCRainbowScene(descriptor.name, AgeGroup_1.AgeGroup.MS);
    }, exports.sceneIDMap[8]), new SceneManager_1.SceneDescriptor('RRC - Rainbow - HS', 'Roborave Cyberspace Rainbow HS', function (descriptor) {
        return new RRCRainbowScene_1.RRCRainbowScene(descriptor.name, AgeGroup_1.AgeGroup.HS);
    }, exports.sceneIDMap[9]));
    exports.cyberspaceScenes = scenes;
});
