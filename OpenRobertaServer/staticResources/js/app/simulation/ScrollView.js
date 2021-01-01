var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScrollView = void 0;
    var ScrollView = /** @class */ (function (_super) {
        __extends(ScrollView, _super);
        function ScrollView(viewport, renderer) {
            var _this = _super.call(this) || this;
            _this.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
            _this.isMouseDown = false;
            _this.touchInputs = [];
            _this.mouseDownEvents = [];
            _this.mouseUpEvents = [];
            _this.mouseMovedEvents = [];
            _this.mouseWheelEvents = [];
            viewport.addChild(_this);
            _this.viewport = viewport;
            _this.renderer = renderer;
            _this.viewport.hitArea = _this.hitArea;
            _this.updateInteractionRect();
            _this.registerEventListeners();
            return _this;
        }
        /**
         * update hitbox for mouse interactions
         */
        ScrollView.prototype.updateInteractionRect = function () {
            this.hitArea.width = this.renderer.screen.width;
            this.hitArea.height = this.renderer.screen.height;
        };
        ScrollView.prototype.onResize = function () {
            this.updateInteractionRect();
        };
        ScrollView.prototype.onDown = function () {
            console.log('down');
        };
        ScrollView.prototype.onUp = function () {
            console.log('up');
        };
        ScrollView.prototype.onMove = function () {
            console.log('move');
        };
        ScrollView.prototype.onScroll = function (ev) {
            console.log('scroll');
        };
        ScrollView.prototype.onWheel = function (ev) {
            console.log('wheel');
            console.log(ev);
        };
        ScrollView.prototype.registerEventListeners = function () {
            var _this = this;
            this.viewport.interactive = true;
            this.renderer.on('resize', this.onResize, this);
            this.viewport.on('pointerdown', this.onDown, this);
            this.viewport.on('pointermove', this.onMove, this);
            this.viewport.on('pointerup', this.onUp, this);
            this.viewport.on('pointerupoutside', this.onUp, this);
            this.viewport.on('pointercancel', this.onUp, this);
            this.viewport.on('pointerout', this.onUp, this);
            this.renderer.view.addEventListener('wheel', function (e) { return _this.onWheel(e); });
        };
        // TODO: optimize for shorter function
        ScrollView.prototype.unregisterEventListeners = function () {
            var _this = this;
            this.viewport.interactive = false;
            this.renderer.off('resize', this.onResize, this);
            this.viewport.off('pointerdown', this.onDown, this);
            this.viewport.off('pointermove', this.onMove, this);
            this.viewport.off('pointerup', this.onUp, this);
            this.viewport.off('pointerupoutside', this.onUp, this);
            this.viewport.off('pointercancel', this.onUp, this);
            this.viewport.off('pointerout', this.onUp, this);
            this.renderer.view.removeEventListener('wheel', function (e) { return _this.onWheel(e); });
        };
        ScrollView.prototype.destroy = function () {
            this.unregisterEventListeners();
            this.viewport.removeChild(this);
        };
        return ScrollView;
    }(PIXI.Container));
    exports.ScrollView = ScrollView;
});
