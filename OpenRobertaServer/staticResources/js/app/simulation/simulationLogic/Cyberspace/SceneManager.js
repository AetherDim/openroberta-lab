define(["require", "exports", "../Util"], function (require, exports, Util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SceneManager = exports.SceneDescriptor = void 0;
    var SceneDescriptor = /** @class */ (function () {
        function SceneDescriptor(name, description, createScene, ID) {
            if (ID === void 0) { ID = undefined; }
            this.name = name;
            this.description = description;
            if (ID) {
                this.ID = ID;
            }
            else {
                this.ID = Util_1.Util.genHtmlUid2();
            }
            this._createScene = createScene;
        }
        SceneDescriptor.prototype.createScene = function () {
            return this._createScene(this);
        };
        return SceneDescriptor;
    }());
    exports.SceneDescriptor = SceneDescriptor;
    var SceneManager = /** @class */ (function () {
        function SceneManager() {
            this.sceneHandleMap = new Map();
            this.sceneMap = new Map();
            this.disableSceneCache = false;
        }
        SceneManager.prototype.destroy = function () {
            Array.from(this.sceneMap.values()).forEach(function (scene) { return scene.destroy(); });
            this.sceneMap.clear();
        };
        SceneManager.prototype.getScene = function (ID) {
            var scene = this.sceneMap.get(ID);
            if (this.disableSceneCache) {
                scene = undefined;
            }
            if (!scene) {
                var sceneHandle = this.sceneHandleMap.get(ID);
                if (sceneHandle) {
                    scene = sceneHandle.createScene();
                    this.sceneMap.set(ID, scene);
                }
            }
            return scene;
        };
        SceneManager.prototype.registerScene = function () {
            var _this = this;
            var sceneHandles = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                sceneHandles[_i] = arguments[_i];
            }
            sceneHandles.forEach(function (handle) {
                if (_this.sceneHandleMap.get(handle.ID)) {
                    console.error('Scene with ID: ' + handle.ID + ' already registered!!!');
                    return;
                }
                _this.sceneHandleMap.set(handle.ID, handle);
            });
        };
        SceneManager.prototype.getSceneDescriptorList = function () {
            return Array.from(this.sceneHandleMap.values());
        };
        SceneManager.prototype.getNextScene = function () {
            if (this.sceneHandleMap.size < 1) {
                console.error('No scenes registered!!!');
                return undefined;
            }
            if (!this.currentID) {
                this.currentID = Array.from(this.sceneHandleMap.keys())[0];
                return this.getScene(this.currentID);
            }
            var keys = Array.from(this.sceneHandleMap.keys());
            var idx = keys.indexOf(this.currentID);
            if (idx >= 0) {
                idx++;
                if (idx >= keys.length) {
                    idx = 0;
                }
                this.currentID = keys[idx];
            }
            else {
                // one loop around
                this.currentID = Array.from(this.sceneHandleMap.keys())[0];
            }
            return this.getScene(this.currentID);
        };
        SceneManager.prototype.getCurrentSceneDescriptor = function () {
            if (this.currentID) {
                return this.sceneHandleMap.get(this.currentID);
            }
            return undefined;
        };
        SceneManager.prototype.setCurrentScene = function (ID) {
            this.currentID = ID;
        };
        return SceneManager;
    }());
    exports.SceneManager = SceneManager;
});
