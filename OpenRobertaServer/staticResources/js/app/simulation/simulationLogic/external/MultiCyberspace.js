var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
define(["require", "exports", "../Cyberspace/Cyberspace", "../GlobalDebug", "../Robot/RobotProgramGenerator", "../UIManager", "../Util", "./SceneDesciptorList"], function (require, exports, Cyberspace_1, GlobalDebug_1, RobotProgramGenerator_1, UIManager_1, Util_1, SceneDesciptorList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initEvents = exports.init = void 0;
    var cyberspaces = [];
    var simDiv = document.getElementById("simDiv");
    if (simDiv == null) {
        console.error("There is no 'simDiv' element.");
    }
    var multiCyberspaceDiv = document.createElement("div");
    multiCyberspaceDiv.style.backgroundColor = "rgb(50, 50, 50)";
    multiCyberspaceDiv.style.width = "100%";
    multiCyberspaceDiv.style.height = "100%";
    simDiv.appendChild(multiCyberspaceDiv);
    //simDiv.style.backgroundColor = "black"
    var sceneDescriptors = SceneDesciptorList_1.cyberspaceScenes;
    var CyberspaceData = /** @class */ (function () {
        function CyberspaceData(cyberspace, divElement) {
            this.cyberspace = cyberspace;
            this.divElement = divElement;
        }
        return CyberspaceData;
    }());
    function createCyberspaceData(sceneID, groupName) {
        var canvas = document.createElement("canvas");
        var cyberspaceDiv = document.createElement("div");
        cyberspaceDiv.appendChild(canvas);
        var groupNameDiv = document.createElement("div");
        groupNameDiv.style.position = "absolute";
        groupNameDiv.style.top = "2";
        groupNameDiv.style.left = "2";
        groupNameDiv.style.pointerEvents = "none";
        groupNameDiv.style.zIndex = "100"; // above the canvas
        var groupNameParagraph = document.createElement("p");
        groupNameParagraph.textContent = groupName;
        groupNameDiv.appendChild(groupNameParagraph);
        var paragraphStyle = groupNameParagraph.style;
        paragraphStyle.display = "inline";
        paragraphStyle.backgroundColor = "rgb(255, 255, 255, 0.5)";
        paragraphStyle.borderRadius = "5px";
        paragraphStyle.fontSize = "20";
        paragraphStyle.paddingLeft = "3";
        paragraphStyle.paddingRight = "3";
        cyberspaceDiv.appendChild(groupNameDiv);
        var cyberspace = new Cyberspace_1.Cyberspace(canvas, cyberspaceDiv, [sceneDescriptors[sceneID]]);
        cyberspace.switchToNextScene(true);
        return new CyberspaceData(cyberspace, cyberspaceDiv);
    }
    function setGridStyle(gridElements, opt) {
        var _a;
        var relativePadding = (_a = opt === null || opt === void 0 ? void 0 : opt.relativePadding) !== null && _a !== void 0 ? _a : 0;
        var heightCount = gridElements.length;
        var height = (100 - relativePadding) / heightCount;
        var heightStr = String(height - relativePadding) + "%";
        for (var y = 0; y < heightCount; y++) {
            var widthCount = gridElements[y].length;
            var width = (100 - relativePadding) / widthCount;
            var widthStr = String(width - relativePadding) + "%";
            var topStr = String(y * height + relativePadding) + "%";
            for (var x = 0; x < widthCount; x++) {
                var style = gridElements[y][x].style;
                style.left = String(x * width + relativePadding) + "%";
                style.top = topStr;
                style.width = widthStr;
                style.height = heightStr;
                style.position = "absolute";
            }
        }
    }
    var sceneCount = 4;
    var aspectRatio = {
        window: 16 / 9,
        scene: 16 / 9
    };
    function generateDebugRobertaRobotSetupData(count) {
        return Util_1.Util.range(0, count).map(function (index) {
            return {
                javaScriptConfiguration: {
                    "1": "TOUCH",
                    "3": "COLOR"
                },
                javaScriptProgram: RobotProgramGenerator_1.RobotProgramGenerator.generateProgram([
                    RobotProgramGenerator_1.RobotProgramGenerator.driveForwardOpCodes(100, 0.1 * index + 0.1)
                ]).javaScriptProgram
            };
        });
    }
    function generateRandomMultiSetupData(count) {
        return generateDebugRobertaRobotSetupData(count).map(function (robertaRobotSetupData, index) {
            return {
                sceneID: 0,
                groupName: "Test group " + index,
                robertaRobotSetupData: robertaRobotSetupData
            };
        });
    }
    function startPrograms() {
        cyberspaces.forEach(function (cyberspace) { return cyberspace.startPrograms(); });
    }
    function loadScenes(setupDataList) {
        var _a;
        // clear complete debug
        GlobalDebug_1.clearDebugGuiRoot();
        // add my debug
        var debug = GlobalDebug_1.DebugGuiRoot;
        if (debug != undefined) {
            debug.addButton("Add scene", function () {
                sceneCount += 1;
                loadScenes(generateRandomMultiSetupData(sceneCount));
            });
            debug.addButton("Remove scene", function () {
                if (sceneCount > 0) {
                    sceneCount -= 1;
                    loadScenes(generateRandomMultiSetupData(sceneCount));
                }
            });
            debug.addButton("Reload", function () {
                loadScenes(generateRandomMultiSetupData(sceneCount));
            });
            debug.addButton("Start programs", function () {
                startPrograms();
            });
            debug.add(aspectRatio, "window", 0.1, 2);
            debug.add(aspectRatio, "scene", 0.1, 2);
        }
        var cyberspaceDataList = setupDataList.map(function (setupData) {
            var cyberspaceData = createCyberspaceData(setupData.sceneID, setupData.groupName);
            cyberspaceData.cyberspace.getScene().runAfterLoading(function () {
                cyberspaceData.cyberspace.setRobertaRobotSetupData([setupData.robertaRobotSetupData], "");
            });
            return cyberspaceData;
        });
        var divElements = cyberspaceDataList.map(function (data) { return data.divElement; });
        // remove all cyberspace div nodes
        while (multiCyberspaceDiv.hasChildNodes()) {
            (_a = multiCyberspaceDiv.lastChild) === null || _a === void 0 ? void 0 : _a.remove();
        }
        // add new cyberspace div nodes
        divElements.forEach(function (element) {
            return multiCyberspaceDiv.appendChild(element);
        });
        // destroy all cyberspaces
        cyberspaces.forEach(function (cyberspace) {
            cyberspace.destroy();
        });
        cyberspaces.length = 0;
        cyberspaces.push.apply(cyberspaces, __spreadArray([], __read(cyberspaceDataList.map(function (data) { return data.cyberspace; }))));
        var windowAspectRatio = aspectRatio.window;
        var sceneAspectRatio = aspectRatio.scene;
        // given
        //   - divCount: int
        //   - windowAspectRatio: float
        // unknown
        //   - heightCount: int
        //   - widthCount: int
        //
        // windowAspectRatio = (widthCount * sceneWidth) / (heightCount * sceneHeight)
        //                   = widthCount / heightCount * sceneAspectRatio
        // <=> widthCount = heightCount * windowAspectRatio / sceneAspectRatio
        //
        //     divCount <= heightCount * widthCount
        // <=> divCount <= heightCount * (heightCount * windowAspectRatio / sceneAspectRatio)
        // <=> sqrt(divCount * sceneAspectRatio / windowAspectRatio) <= heightCount
        // or
        // <=> sqrt(divCount / sceneAspectRatio * windowAspectRatio) <= widthCount
        var divCount = divElements.length;
        // const heightCount = Math.ceil(Math.sqrt(divElements.length * sceneAspectRatio / windowAspectRatio))
        // const widthCount = Math.ceil(divCount / heightCount)
        var widthCount = Math.ceil(Math.sqrt(divElements.length / sceneAspectRatio * windowAspectRatio));
        var indices = Util_1.Util.range(0, divCount);
        setGridStyle(Util_1.Util.map2D(Util_1.Util.reshape1Dto2D(indices, widthCount), function (index) { return divElements[index]; }), {
            relativePadding: 1
        });
    }
    loadScenes(generateRandomMultiSetupData(sceneCount));
    function requestRobotSetupData(ids) {
        // TODO
        return new Promise(function (resolve, reject) {
        });
    }
    // called only once
    function init(robotSetupDataIDs, secretKey) {
        requestRobotSetupData(robotSetupDataIDs).then(function (robotSetupDataList) {
            // TODO
        });
    }
    exports.init = init;
    function forEachCyberspace(block) {
        cyberspaces.forEach(block);
    }
    function setPause(pause) {
        if (pause) {
            forEachCyberspace(function (c) { return c.pausePrograms(); });
        }
        else {
            forEachCyberspace(function (c) { return c.startPrograms(); });
        }
    }
    // TODO: Remove?
    function run(refresh, robotType) {
        console.log("run!");
    }
    /**
     * on stop program
     */
    function stopProgram() {
        forEachCyberspace(function (c) { return c.stopPrograms(); });
    }
    /**
     * Reset robot position and zoom of ScrollView
     */
    function resetPose() {
        forEachCyberspace(function (c) { return c.resetScene(); });
    }
    function sim(run) {
        if (run) {
            forEachCyberspace(function (c) { return c.startSimulation(); });
        }
        else {
            forEachCyberspace(function (c) { return c.pauseSimulation(); });
        }
    }
    function score(showScore) {
        if (showScore) {
            // TODO: show score
        }
        else {
            // TODO: hide score
        }
    }
    function zoomIn() {
        forEachCyberspace(function (c) { return c.zoomViewIn(); });
    }
    function zoomOut() {
        forEachCyberspace(function (c) { return c.zoomViewOut(); });
    }
    function zoomReset() {
        forEachCyberspace(function (c) { return c.resetView(); });
    }
    function setSimSpeed(speedup) {
        forEachCyberspace(function (c) { return c.setSimulationSpeedupFactor(speedup); });
    }
    function setDefaultButtonState() {
        // do not set 'simSpeedUpButton' since the state will be preserved
        UIManager_1.UIManager.programControlButton.setState("start");
        UIManager_1.UIManager.showScoreButton.setState("showScore");
        UIManager_1.UIManager.physicsSimControlButton.setState("stop");
    }
    function initEvents() {
        setDefaultButtonState();
        UIManager_1.UIManager.programControlButton.onClick(function (state) {
            if (state == "start") {
                // run(true, ...) // cannot get robot type
                setPause(false);
            }
            else {
                // setPause(true) // not needed
                stopProgram();
            }
        });
        UIManager_1.UIManager.showScoreButton.onClick(function (state) {
            return score(state == "showScore");
        });
        UIManager_1.UIManager.physicsSimControlButton.onClick(function (state) {
            return sim(state == "start");
        });
        UIManager_1.UIManager.simSpeedUpButton.setState("fastForward");
        UIManager_1.UIManager.simSpeedUpButton.onClick(function (state) {
            return setSimSpeed(state == "fastForward" ? 10 : 1);
        });
        UIManager_1.UIManager.resetSceneButton.onClick(function () {
            setDefaultButtonState();
            resetPose();
        });
        UIManager_1.UIManager.zoomOutButton.onClick(zoomOut);
        UIManager_1.UIManager.zoomInButton.onClick(zoomIn);
        UIManager_1.UIManager.zoomResetButton.onClick(zoomReset);
    }
    exports.initEvents = initEvents;
});
