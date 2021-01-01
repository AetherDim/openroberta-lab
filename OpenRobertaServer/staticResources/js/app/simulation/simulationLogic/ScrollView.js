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
define(["require", "exports", "./pixijs"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScrollView = exports.EventData = exports.ScrollViewEvent = exports.cloneVector = exports.MouseButton = exports.EventType = void 0;
    // the following implementation borrowed some ideas from:
    // https://github.com/davidfig/pixi-viewport/blob/0aec760f1bdbcb1f9693376a61c041459322d6a0/src/input-manager.js#L168
    var EventType;
    (function (EventType) {
        EventType[EventType["ZOOM"] = 0] = "ZOOM";
        EventType[EventType["MOVE"] = 1] = "MOVE";
        EventType[EventType["PRESS"] = 2] = "PRESS";
        EventType[EventType["RELEASE"] = 3] = "RELEASE";
        EventType[EventType["DRAG"] = 4] = "DRAG";
        EventType[EventType["NONE"] = 5] = "NONE";
    })(EventType = exports.EventType || (exports.EventType = {}));
    var MouseButton;
    (function (MouseButton) {
        MouseButton[MouseButton["LEFT"] = 0] = "LEFT";
        MouseButton[MouseButton["WHEEL"] = 1] = "WHEEL";
        MouseButton[MouseButton["RIGHT"] = 2] = "RIGHT";
        MouseButton[MouseButton["BACK"] = 3] = "BACK";
        MouseButton[MouseButton["FORWARD"] = 4] = "FORWARD";
    })(MouseButton = exports.MouseButton || (exports.MouseButton = {}));
    function cloneVector(vec) {
        if (!vec) {
            return null;
        }
        return { x: vec.x, y: vec.y };
    }
    exports.cloneVector = cloneVector;
    var ScrollViewEvent = /** @class */ (function () {
        function ScrollViewEvent(data, type) {
            this.cancelScrolling = false;
            this.data = data;
            this.type = type;
        }
        ScrollViewEvent.prototype.cancel = function () {
            this.cancelScrolling = true;
        };
        return ScrollViewEvent;
    }());
    exports.ScrollViewEvent = ScrollViewEvent;
    var EventData = /** @class */ (function () {
        function EventData(scrollView, isMouse, pressed, buttons, currentPosition, delta, previousPosition, id) {
            if (buttons === void 0) { buttons = [false, false, false, false, false]; }
            if (currentPosition === void 0) { currentPosition = null; }
            if (delta === void 0) { delta = null; }
            if (previousPosition === void 0) { previousPosition = null; }
            if (id === void 0) { id = 0; }
            /**
             * whether this is a mouse event or a touch event
             */
            this.isMouse = false;
            /**
             * currently pressed mouse button with length 5
             * index by MouseButton enum
             */
            this.buttons = [false, false, false, false, false];
            /**
             * the id of the touch event
             */
            this.id = 0;
            /**
             * previous position, only availible from some events (MOVE, RELEASE, DRAG)
             */
            this.previousPosition = null;
            /**
             * Event location
             */
            this.currentPosition = null;
            /**
             * Contains delta information for mouse move, zoom and scroll
             */
            this.delta = null;
            /**
             * whether the touch or any mouse button is "down"
             */
            this.pressed = false;
            this.scrollView = scrollView;
            this.isMouse = isMouse;
            this.buttons = buttons;
            this.id = id;
            this.previousPosition = previousPosition;
            this.currentPosition = currentPosition;
            this.delta = delta;
            this.pressed = pressed;
        }
        EventData.prototype.isLeftButtonPressed = function () {
            return this.buttons[MouseButton.LEFT];
        };
        EventData.prototype.isMiddleButtonPressed = function () {
            return this.buttons[MouseButton.WHEEL];
        };
        EventData.prototype.isRightButtonPressed = function () {
            return this.buttons[MouseButton.RIGHT];
        };
        EventData.prototype.setNewPosition = function (position) {
            this.previousPosition = this.currentPosition;
            this.currentPosition = position;
        };
        EventData.prototype.isAnyButtonPressed = function () {
            return this.buttons.includes(true);
        };
        EventData.prototype.getCurrentLocalPosition = function () {
            return this.scrollView.toLocal(this.currentPosition);
        };
        EventData.prototype.getPreviousLocalPosition = function () {
            return this.scrollView.toLocal(this.previousPosition);
        };
        EventData.prototype.getDeltaLocal = function () {
            return this.scrollView.toLocal(this.delta);
        };
        EventData.prototype.clone = function () {
            return new EventData(this.scrollView, this.isMouse, this.pressed, Object.assign([], this.buttons), cloneVector(this.currentPosition), cloneVector(this.delta), cloneVector(this.previousPosition), this.id);
        };
        return EventData;
    }());
    exports.EventData = EventData;
    var ScrollView = /** @class */ (function (_super) {
        __extends(ScrollView, _super);
        function ScrollView(viewport, renderer) {
            var _this = _super.call(this) || this;
            _this.customHitArea = new PIXI.Rectangle(0, 0, 0, 0);
            _this.minimalVisibleArea = 0.2;
            //
            // Event Data
            //
            _this.mouseEventData = new EventData(_this, true, false);
            _this.touchEventDataMap = new Map();
            _this.eventListeners = [];
            _this.ctx = {
                global: { x: 0, y: 0 } // store it inside closure to avoid GC pressure
            };
            viewport.addChild(_this);
            _this.viewport = viewport;
            _this.renderer = renderer;
            _this.viewport.hitArea = _this.customHitArea;
            _this.updateInteractionRect();
            _this.registerEventListeners();
            return _this;
        }
        /**
         * update hitbox for mouse interactions
         */
        ScrollView.prototype.updateInteractionRect = function () {
            this.customHitArea.width = this.renderer.screen.width;
            this.customHitArea.height = this.renderer.screen.height;
        };
        ScrollView.prototype.onResize = function () {
            this.updateInteractionRect();
        };
        ScrollView.prototype.onDown = function (ev) {
            //console.log('down');
            var data;
            if (ev.data.pointerType == 'mouse') {
                data = this.mouseEventData;
                data.pressed = true;
                data.buttons[ev.data.button] = true;
            }
            else {
                data = this.touchEventDataMap.get(ev.data.pointerId);
                if (!data) {
                    data = new EventData(this, false, true);
                    data.id = ev.data.pointerId;
                    this.touchEventDataMap.set(ev.data.pointerId, data);
                }
            }
            data.setNewPosition(ev.data.global.clone());
            var cancel = this.fireEvent(new ScrollViewEvent(data.clone(), EventType.PRESS));
            // TODO: cancel move
        };
        ScrollView.prototype.onUp = function (ev) {
            //console.log('up');
            var data;
            if (ev.data.pointerType == 'mouse') {
                data = this.mouseEventData;
                data.buttons[ev.data.button] = false;
                data.pressed = data.isAnyButtonPressed();
            }
            else {
                data = this.touchEventDataMap.get(ev.data.pointerId);
                if (data) {
                    this.touchEventDataMap.delete(ev.data.pointerId);
                }
                else {
                    // This should not happen
                    console.error('touch reale before press!');
                    data = new EventData(this, false, false);
                    data.id = ev.data.pointerId;
                }
            }
            data.setNewPosition(ev.data.global.clone());
            var cancel = this.fireEvent(new ScrollViewEvent(data.clone(), EventType.RELEASE));
            // TODO: cancel move
        };
        ScrollView.prototype.onMove = function (ev) {
            // console.log('move');
            var data;
            if (ev.data.pointerType == 'mouse') {
                data = this.mouseEventData;
            }
            else {
                data = this.touchEventDataMap.get(ev.data.pointerId);
                if (!data) {
                    data = new EventData(this, false, false);
                    data.id = ev.data.pointerId;
                    this.touchEventDataMap.set(ev.data.pointerId, data);
                }
            }
            data.setNewPosition(ev.data.global.clone());
            if (data.previousPosition) {
                data.delta = {
                    x: data.previousPosition.x - data.currentPosition.x,
                    y: data.previousPosition.y - data.currentPosition.y
                };
            }
            else {
                data.delta = { x: 0, y: 0 };
            }
            var type;
            if (data.pressed) {
                type = EventType.DRAG;
            }
            else {
                type = EventType.MOVE;
            }
            var cancel = this.fireEvent(new ScrollViewEvent(data.clone(), type));
            // TODO: cancel move
            // TODO: change condition
            if (!cancel && data.pressed) {
                this.x -= data.delta.x;
                this.y -= data.delta.y;
                var visible = 1 - this.minimalVisibleArea;
                var check = this.customHitArea.x - this.width * visible;
                if (this.x < check) {
                    this.x = check;
                }
                check = this.customHitArea.y - this.height * visible;
                if (this.y < check) {
                    this.y = check;
                }
                check = this.customHitArea.x + this.customHitArea.width - this.width * this.minimalVisibleArea;
                if (this.x > check) {
                    this.x = check;
                }
                check = this.customHitArea.y + this.customHitArea.height - this.height * this.minimalVisibleArea;
                if (this.y > check) {
                    this.y = check;
                }
            }
        };
        ScrollView.prototype.onWheel = function (ev) {
            // https://github.com/anvaka/ngraph/blob/master/examples/pixi.js/03%20-%20Zoom%20And%20Pan/globalInput.js
            this.ctx.global.x = ev.clientX;
            this.ctx.global.y = ev.clientY;
            var point = PIXI.InteractionData.prototype.getLocalPosition.call(this.ctx, this.viewport);
            console.log(point);
            ev.preventDefault(); // disable scroll behaviour
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
        ScrollView.prototype.fireEvent = function (event) {
            this.eventListeners.forEach(function (e) { return e(event); });
            return event.cancelScrolling;
        };
        ScrollView.prototype.registerListener = function (func) {
            if (!this.eventListeners.includes(func)) {
                this.eventListeners.push(func);
            }
        };
        ScrollView.prototype.unregisterListener = function (func) {
            if (!this.eventListeners.includes(func)) {
                this.eventListeners.splice(this.eventListeners.indexOf(func));
            }
        };
        return ScrollView;
    }(PIXI.Container));
    exports.ScrollView = ScrollView;
});
