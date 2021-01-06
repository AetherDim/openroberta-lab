define(["require", "exports", "jquery", "./Scene/Scene", "./Color", "./ScrollView", "./pixijs"], function (require, exports, $, Scene_1, Color_1, ScrollView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SceneRender = void 0;
    // physics and graphics
    var SceneRender = /** @class */ (function () {
        function SceneRender(canvas, autoResizeTo, scene) {
            var _this = this;
            if (autoResizeTo === void 0) { autoResizeTo = null; }
            if (scene === void 0) { scene = null; }
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
            // The application will create a renderer using WebGL, if possible,
            // with a fallback to a canvas render. It will also setup the ticker
            // and the root stage PIXI.Container
            this.app = new PIXI.Application({
                view: htmlCanvas,
                backgroundColor: Color_1.rgbToNumber(backgroundColor),
                antialias: true,
                resizeTo: resizeTo,
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
                this.switchScene(new Scene_1.Scene()); // empty scene as default (call after Engine.create() and renderer init !!!)
            }
            this.app.ticker.add(function (dt) {
                if (_this.scene) {
                    _this.scene.renderTick(dt);
                    _this.app.queueResize(); // allow auto resize
                }
            }, this);
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
        SceneRender.prototype.switchScene = function (scene) {
            if (!scene) {
                scene = new Scene_1.Scene();
            }
            if (this.scene == scene) {
                return;
            }
            // remove all children from PIXI renderer
            if (this.scrollView.children.length > 0) {
                this.scrollView.removeChildren(0, this.scrollView.children.length - 1);
            }
            // reset rendering scale and offset
            this.scrollView.reset();
            this.scene = scene;
            scene.setSimulationEngine(this);
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
        return SceneRender;
    }());
    exports.SceneRender = SceneRender;
});
