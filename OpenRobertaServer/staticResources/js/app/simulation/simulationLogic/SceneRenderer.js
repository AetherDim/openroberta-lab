define(["require", "exports", "jquery", "./Scene/Scene", "./Color", "./ScrollView", "./Util", "./GlobalDebug", "./pixijs"], function (require, exports, $, Scene_1, Color_1, ScrollView_1, Util_1, GlobalDebug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SceneRender = void 0;
    // physics and graphics
    var SceneRender = /** @class */ (function () {
        function SceneRender(canvas, allowBlocklyAccess, autoResizeTo, scene) {
            var _this = this;
            this.allowBlocklyAccess = false;
            var htmlCanvas = null;
            var resizeTo = null;
            this.allowBlocklyAccess = allowBlocklyAccess;
            var backgroundColor = $('#simDiv').css('background-color');
            if (canvas instanceof HTMLCanvasElement) {
                htmlCanvas = canvas;
            }
            else {
                htmlCanvas = document.getElementById(canvas);
            }
            if (autoResizeTo) {
                if (autoResizeTo instanceof HTMLElement) {
                    resizeTo = autoResizeTo;
                }
                else {
                    resizeTo = document.getElementById(autoResizeTo);
                }
            }
            this.resizeTo = resizeTo;
            // The application will create a renderer using WebGL, if possible,
            // with a fallback to a canvas render. It will also setup the ticker
            // and the root stage PIXI.Container
            this.app = new PIXI.Application({
                view: htmlCanvas,
                backgroundColor: Color_1.rgbToNumber(backgroundColor),
                antialias: true,
                resizeTo: resizeTo || undefined,
                resolution: window.devicePixelRatio || 0.75,
            });
            // add mouse/touch control
            this.scrollView = new ScrollView_1.ScrollView(this.app.stage, this.app.renderer);
            this.scrollView.registerListener(function (ev) {
                if (_this.scene) {
                    _this.scene.interactionEvent(ev);
                }
            });
            // switch to scene
            if (scene) {
                this.switchScene(scene);
            }
            else {
                this.switchScene(new Scene_1.Scene("")); // empty scene as default (call after Engine.create() and renderer init !!!)
            }
            this.app.ticker.add(function (dt) {
                if (_this.scene) {
                    _this.scene.renderTick(dt);
                    if (_this.resizeTo && (_this.app.view.clientWidth != Util_1.Util.getPixelRatio() * _this.resizeTo.clientWidth ||
                        _this.app.view.clientHeight != Util_1.Util.getPixelRatio() * _this.resizeTo.clientHeight)) {
                        _this.app.queueResize();
                        console.log("resize");
                    }
                }
            }, this);
            //this.app.ticker.maxFPS = 30
            GlobalDebug_1.DebugGuiRoot === null || GlobalDebug_1.DebugGuiRoot === void 0 ? void 0 : GlobalDebug_1.DebugGuiRoot.addUpdatable('FPS', function () { return _this.app.ticker.FPS; });
        }
        SceneRender.prototype.getScene = function () {
            return this.scene;
        };
        // TODO: check this size
        SceneRender.prototype.getWidth = function () {
            return this.app.view.width;
        };
        SceneRender.prototype.getHeight = function () {
            return this.app.view.height;
        };
        // TODO: check this size
        SceneRender.prototype.getViewWidth = function () {
            return this.scrollView.getBounds().width;
        };
        SceneRender.prototype.getViewHeight = function () {
            return this.scrollView.getBounds().height;
        };
        SceneRender.prototype.getCanvasFromDisplayObject = function (object) {
            return this.app.renderer.extract.canvas(object);
        };
        SceneRender.prototype.zoomIn = function () {
            this.scrollView.zoomCenter(Math.sqrt(2));
        };
        SceneRender.prototype.zoomOut = function () {
            this.scrollView.zoomCenter(1 / Math.sqrt(2));
        };
        SceneRender.prototype.zoomReset = function () {
            this.scrollView.reset();
        };
        SceneRender.prototype.switchScene = function (scene, noLoad) {
            if (noLoad === void 0) { noLoad = false; }
            if (!scene) {
                console.log('undefined scene!');
                scene = new Scene_1.Scene("");
            }
            if (this.scene == scene) {
                return;
            }
            if (this.scene) {
                this.scene.stopSim();
                this.scene.setSceneRenderer(undefined); // unregister this renderer
            }
            // remove all children from PIXI renderer
            if (this.scrollView.children.length > 0) {
                //console.log('Number of children: ' + this.scrollView.children.length);
                this.scrollView.removeChildren(0, this.scrollView.children.length);
            }
            // reset rendering scale and offset
            this.scrollView.reset();
            this.scene = scene;
            scene.setSceneRenderer(this, this.allowBlocklyAccess, noLoad);
        };
        // TODO: remove before add? only add once?
        SceneRender.prototype.addDisplayable = function (displayable) {
            this.scrollView.addChild(displayable);
        };
        SceneRender.prototype.removeDisplayable = function (displayable) {
            this.scrollView.removeChild(displayable);
        };
        SceneRender.prototype.add = function (displayable) {
            this.scrollView.addChild(displayable);
        };
        SceneRender.prototype.remove = function (displayable) {
            this.scrollView.removeChild(displayable);
        };
        SceneRender.prototype.setSpeedUpFactor = function (speedup) {
            var _a;
            (_a = this.scene) === null || _a === void 0 ? void 0 : _a.setSpeedUpFactor(speedup);
        };
        return SceneRender;
    }());
    exports.SceneRender = SceneRender;
});
