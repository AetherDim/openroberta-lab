define(["require", "exports", "jquery", "./Color", "./ScrollView", "./Util", "./GlobalDebug", "./pixijs"], function (require, exports, $, Color_1, ScrollView_1, Util_1, GlobalDebug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SceneRender = void 0;
    // physics and graphics
    var SceneRender = /** @class */ (function () {
        function SceneRender(scene, canvas, robotSetupData, autoResizeTo) {
            var _this = this;
            this.onSwitchSceneEventHandler = [];
            var htmlCanvas = null;
            var resizeTo = null;
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
                autoDensity: true,
                resolution: Util_1.Util.getPixelRatio(),
            });
            // add mouse/touch control
            this.scrollView = new ScrollView_1.ScrollView(this.app.stage, this.app.renderer);
            this.scrollView.registerListener(function (ev) {
                if (_this.scene) {
                    _this.scene.interactionEvent(ev);
                }
            });
            if (!robotSetupData) {
                robotSetupData = [];
            }
            // switch to scene
            this.scene = scene;
            this.switchScene(robotSetupData, scene);
            this.app.ticker.add(function (dt) {
                if (_this.scene) {
                    _this.scene.renderTick(dt);
                    if (_this.resizeTo && (_this.app.view.clientWidth != _this.resizeTo.clientWidth ||
                        _this.app.view.clientHeight != _this.resizeTo.clientHeight)) {
                        //resize = true
                        var oldWidth = _this.app.renderer.screen.width;
                        var oldHeight = _this.app.renderer.screen.height;
                        //this.app.queueResize()
                        _this.app.resize();
                        _this.onResize(oldWidth, oldHeight);
                    }
                }
            }, this);
            //this.app.ticker.maxFPS = 30
            GlobalDebug_1.initGlobalSceneDebug(this);
        }
        SceneRender.prototype.destroy = function () {
            this.app.stop();
            this.scene.destroy();
        };
        SceneRender.prototype.onSwitchScene = function (onSwitchSceneHandler) {
            this.onSwitchSceneEventHandler.push(onSwitchSceneHandler);
        };
        SceneRender.prototype.onResize = function (oldWidth, oldHeight) {
            this.scrollView.x += (this.app.renderer.screen.width - oldWidth) / 2;
            this.scrollView.y += (this.app.renderer.screen.height - oldHeight) / 2;
            var zoomX = Math.max(this.app.renderer.screen.width, this.scrollView.minScreenSize) / Math.max(oldWidth, this.scrollView.minScreenSize);
            //const zoomY = Math.max(this.app.renderer.screen.height, this.scrollView.minScreenSize)/Math.max(oldHeight, this.scrollView.minScreenSize)
            this.scrollView.zoomCenter(zoomX);
        };
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
            // the scene should never be undefined!
            var size = this.scene.getSize();
            var origin = this.scene.getOrigin();
            this.scrollView.resetCentered(origin.x, origin.y, size.width, size.height);
        };
        SceneRender.prototype.switchScene = function (robotSetupData, scene, noLoad) {
            if (noLoad === void 0) { noLoad = false; }
            if (this.scene == scene) {
                return;
            }
            this.scene.pauseSim();
            this.scene.setSceneRenderer(robotSetupData, undefined); // unregister this renderer
            // remove all children from PIXI renderer
            if (this.scrollView.children.length > 0) {
                //console.log('Number of children: ' + this.scrollView.children.length);
                this.scrollView.removeChildren(0, this.scrollView.children.length);
            }
            this.scene = scene;
            scene.setSceneRenderer(robotSetupData, this, noLoad);
            this.onSwitchSceneEventHandler.forEach(function (handler) { return handler(scene); });
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
            this.scene.setSpeedUpFactor(speedup);
        };
        return SceneRender;
    }());
    exports.SceneRender = SceneRender;
});
