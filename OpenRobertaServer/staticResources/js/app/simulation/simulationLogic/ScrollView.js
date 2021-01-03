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
    exports.ScrollView = exports.EventData = exports.ScrollViewEvent = exports.cloneVector = exports.MouseButton = exports.EventType = exports.getBrowser = void 0;
    // https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
    function getBrowser() {
        var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return { name: 'IE', version: (tem[1] || '') };
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null)
                return { name: tem[1].replace('OPR', 'Opera'), version: tem[2] };
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) {
            M.splice(1, 1, tem[1]);
        }
        var arr = M[1].split('.', 1);
        var id = -1;
        if (arr.length < 0) {
            id = Number.parseInt(arr[0]);
        }
        return { name: M[0], version: M[1], versionID: id };
    }
    exports.getBrowser = getBrowser;
    // the following implementation borrowed some ideas from:
    // https://github.com/davidfig/pixi-viewport/blob/0aec760f1bdbcb1f9693376a61c041459322d6a0/src/input-manager.js#L168
    var EventType;
    (function (EventType) {
        EventType[EventType["ZOOM"] = 0] = "ZOOM";
        EventType[EventType["SCROLL"] = 1] = "SCROLL";
        EventType[EventType["MOVE"] = 2] = "MOVE";
        EventType[EventType["PRESS"] = 3] = "PRESS";
        EventType[EventType["RELEASE"] = 4] = "RELEASE";
        EventType[EventType["DRAG"] = 5] = "DRAG";
        EventType[EventType["NONE"] = 6] = "NONE";
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
            this.cancelEvent = false;
            this.data = data;
            this.type = type;
        }
        ScrollViewEvent.prototype.cancel = function () {
            this.cancelEvent = true;
            this.data.cancelEvent = true;
        };
        return ScrollViewEvent;
    }());
    exports.ScrollViewEvent = ScrollViewEvent;
    var EventData = /** @class */ (function () {
        function EventData(scrollView, isMouse, pressed) {
            /**
             * whether this is a mouse event or a touch event
             */
            this.isMouse = false;
            /**
             * whether this event has been canceled.
             * Do not set this parameter, this will do nothing. Use the ScrollViewEvent's cancel() method instead!
             */
            this.cancelEvent = false;
            /**
             * Internal flag, used to detect whether a touch has already fired an event (within one cycle).
             */
            this.eventFired = false;
            /**
             * Whether this event is a merge from multiple touch events.
             * (Will only happen while dragging with more than one finger)
             */
            this.isMergeTouchEvent = false;
            /**
             * currently pressed mouse button with length 5
             * index by MouseButton enum
             */
            this.buttons = [false, false, false, false, false];
            /**
             * the id of the touch event
             */
            this.id = -1;
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
             * Delta zoom scale
             */
            this.deltaZoom = 1;
            /**
             * whether the touch or any mouse button is "down"
             */
            this.pressed = false;
            this.scrollView = scrollView;
            this.isMouse = isMouse;
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
        EventData.prototype.updateDelta = function () {
            if (this.previousPosition) {
                this.delta = {
                    x: this.previousPosition.x - this.currentPosition.x,
                    y: this.previousPosition.y - this.currentPosition.y
                };
            }
            else {
                this.delta = { x: 0, y: 0 };
            }
        };
        EventData.prototype.clone = function () {
            var event = new EventData(this.scrollView, this.isMouse, this.pressed);
            event.buttons = Object.assign([], this.buttons);
            event.id = this.id;
            event.previousPosition = cloneVector(this.previousPosition);
            event.currentPosition = cloneVector(this.currentPosition);
            event.delta = this.delta;
            event.deltaZoom = this.deltaZoom;
            event.eventFired = this.eventFired;
            event.isMergeTouchEvent = this.isMergeTouchEvent;
            event.cancelEvent = this.cancelEvent;
            return event;
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
            _this.browser = getBrowser();
            //
            // Event Data
            //
            _this.mouseEventData = new EventData(_this, true, false);
            _this.touchEventDataMap = new Map();
            _this.eventListeners = [];
            _this.lastZoom = -1;
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
                data = this.getTouchData(ev.data.pointerId);
                data.pressed = true;
            }
            data.setNewPosition(ev.data.global.clone());
            var cancel = this.fireEvent(data, EventType.PRESS);
            // ignore cancel (cancelEvent ist stored within the object)
        };
        /**
         * Warning: this will create a new object if no object with this ID exists!!!
         * @param id id of the touch
         */
        ScrollView.prototype.getTouchData = function (id) {
            var data = this.touchEventDataMap.get(id);
            if (!data) {
                data = new EventData(this, false, false);
                data.id = id;
                this.touchEventDataMap.set(id, data);
            }
            return data;
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
                    console.error('touch released before press!');
                    data = new EventData(this, false, false);
                    data.id = ev.data.pointerId;
                }
            }
            data.setNewPosition(ev.data.global.clone());
            var cancel = this.fireEvent(data, EventType.RELEASE);
            // ignore cancel (cancelEvent ist stored within the object)
            data.cancelEvent = false; // reset cancel event flag
        };
        ScrollView.prototype.onMove = function (ev) {
            // console.log('move');
            var data;
            var type;
            var cancel;
            var noDrag = false;
            if (ev.data.pointerType == 'mouse') {
                data = this.mouseEventData;
                if (data.pressed) {
                    type = EventType.DRAG;
                }
                else {
                    type = EventType.MOVE;
                }
                data.setNewPosition(ev.data.global.clone());
                data.updateDelta();
                cancel = this.fireEvent(data, type);
            }
            else { // touch
                //console.log("id: " + ev.data.pointerId);
                data = this.getTouchData(ev.data.pointerId);
                data.setNewPosition(ev.data.global.clone()); // update position
                data.updateDelta();
                data.eventFired = true;
                type = EventType.DRAG; // move should be impossible (except stylus?)
                cancel = this.fireEvent(data, type);
                // ignore cancel for this call
                var allEventFired_1 = true;
                this.touchEventDataMap.forEach(function (data, id, map) {
                    if (!data.eventFired) {
                        allEventFired_1 = false;
                    }
                });
                if (allEventFired_1) {
                    var previousPosition_1 = { x: 0, y: 0 };
                    var currentPosition_1 = { x: 0, y: 0 };
                    var oneCacelled_1 = false;
                    this.touchEventDataMap.forEach(function (data, id, map) {
                        if (data.previousPosition) {
                            // ignore incomplete touch events
                            previousPosition_1.x += data.previousPosition.x;
                            previousPosition_1.y += data.previousPosition.y;
                            currentPosition_1.x += data.currentPosition.x;
                            currentPosition_1.y += data.currentPosition.y;
                        }
                        data.eventFired = false; // reset all events fired
                        oneCacelled_1 || (oneCacelled_1 = data.cancelEvent);
                    });
                    var numOfTouches = this.touchEventDataMap.size;
                    previousPosition_1.x /= numOfTouches;
                    previousPosition_1.y /= numOfTouches;
                    currentPosition_1.x /= numOfTouches;
                    currentPosition_1.y /= numOfTouches;
                    data = new EventData(this, false, true);
                    data.previousPosition = previousPosition_1;
                    data.currentPosition = currentPosition_1;
                    data.isMergeTouchEvent = true;
                    data.cancelEvent = oneCacelled_1; // whether this event is already cancelled
                    data.updateDelta();
                    cancel = this.fireEvent(data, type);
                    if (this.touchEventDataMap.size == 2) { // zoom mode
                        var touches = this.touchEventDataMap.values();
                        var touch1 = touches.next().value;
                        var touch2 = touches.next().value;
                        if (!touch1 || !touch2) {
                            console.error('Touch is null!');
                        }
                        else {
                            var pp1 = touch1.previousPosition;
                            var pp2 = touch2.previousPosition;
                            if (pp1 && pp2) {
                                var previousLength = Math.sqrt(Math.pow(pp1.x - pp2.x, 2) + Math.pow(pp1.y - pp2.y, 2));
                                var cp1 = touch1.currentPosition;
                                var cp2 = touch2.currentPosition;
                                var currentLength = Math.sqrt(Math.pow(cp1.x - cp2.x, 2) + Math.pow(cp1.y - cp2.y, 2));
                                var deltaZoom = currentLength - previousLength;
                                var pixelRatio = this.getPixelRatio();
                                var zoomFactor = Math.exp(deltaZoom / pixelRatio / 150); // 150 is good feeling magic number
                                data.deltaZoom = zoomFactor;
                                var cancelZoom = this.fireEvent(data, EventType.ZOOM);
                                if (!cancel && !cancelZoom) {
                                    //console.log('zoom: ' + zoomFactor);
                                    this.zoom(zoomFactor, data.currentPosition);
                                }
                            }
                            else {
                                console.error('previous position is null');
                            }
                        }
                    }
                }
                noDrag = !allEventFired_1;
            }
            if (!cancel && type == EventType.DRAG && !noDrag) {
                // move view to new position and check bounds
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
        ScrollView.prototype.getPixelRatio = function () {
            return window.devicePixelRatio || 0.75; // 0.75 is default for old browsers
        };
        ScrollView.prototype.onWheel = function (ev) {
            //console.log('wheel');
            var pixelRatio = this.getPixelRatio();
            var data;
            if (ev.type == "wheel") {
                var type = void 0;
                data = this.mouseEventData;
                // calculate mouse position
                var rect = this.renderer.view.getBoundingClientRect();
                data.setNewPosition({ x: ev.clientX - rect.x, y: ev.clientY - rect.y });
                // this should not work with safari mobile
                /*if(ev.ctrlKey) {
                  // x/y-scrolling
                  type = EventType.SCROLL;
                } else {
                  // zoom
                  type = EventType.ZOOM;
                }*/
                var delta = ev.deltaY;
                var zoomFactor = 1;
                switch (ev.deltaMode) {
                    case WheelEvent.DOM_DELTA_LINE:
                        // for old firefox
                        if (ev.ctrlKey) { // 12 for default text height
                            zoomFactor = Math.exp(delta * 12 / pixelRatio / -50); // -50 is good feeling magic number
                        }
                        else {
                            zoomFactor = Math.exp(delta * 12 / pixelRatio / 150); // 150 is good feeling magic number
                        }
                        break;
                    case WheelEvent.DOM_DELTA_PAGE:
                        console.warn('Delta page scrolling is not implemented!'); // ignore
                        break;
                    case WheelEvent.DOM_DELTA_PIXEL:
                        if (ev.ctrlKey) {
                            zoomFactor = Math.exp(delta / pixelRatio / -50); // -50 is good feeling magic number
                        }
                        else {
                            zoomFactor = Math.exp(delta / pixelRatio / 150); // 150 is good feeling magic number
                        }
                        break;
                    default:
                        console.error('Unknown mouse wheel delta mode!');
                        break;
                }
                data.delta = { x: ev.deltaX, y: ev.deltaY };
                var cancel = this.fireEvent(data, EventType.ZOOM);
                if (!cancel) {
                    this.zoom(zoomFactor, data.currentPosition);
                }
            }
            else {
                console.error('unknown wheel event');
            }
            ev.preventDefault();
        };
        ScrollView.prototype.zoom = function (delta, pos) {
            this.x = (this.x - pos.x) * delta + pos.x;
            this.y = (this.y - pos.y) * delta + pos.y;
            this.scale.x *= delta;
            this.scale.y *= delta;
        };
        ScrollView.prototype.onZoom = function (e) {
            console.log('zoom');
            if (this.browser.name == 'Safari') {
                if (this.lastZoom > 0) {
                    // calculate distance change between fingers
                    var delta = Math.pow(e.scale / this.lastZoom, 1.5); // magic 2 for better scroll feeling
                    this.mouseEventData.delta.x = delta;
                    this.lastZoom = e.scale;
                    var cancel = this.fireEvent(this.mouseEventData, EventType.ZOOM);
                    if (!cancel) {
                        this.zoom(delta, this.mouseEventData.currentPosition);
                    }
                }
                else {
                    console.log('Zoom from non Safari browser!');
                }
            }
            e.preventDefault();
        };
        ScrollView.prototype.onZoomBegin = function (e) {
            this.lastZoom = e.scale;
            e.preventDefault();
        };
        ScrollView.prototype.onZoomEnd = function (e) {
            this.lastZoom = -1;
            e.preventDefault();
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
            // 2017 recommended event
            this.renderer.view.addEventListener("wheel", function (e) { return _this.onWheel(e); });
            // Before 2017, IE9, Chrome, Safari, Opera
            this.renderer.view.addEventListener("mousewheel", function (e) {
                console.error('Scroll/Zoom: mousewheel (old Chrome, Safari, Opera?)');
                e.preventDefault();
            });
            // Old versions of Firefox
            this.renderer.view.addEventListener("DOMMouseScroll", function (e) {
                console.error('Scroll/Zoom: DOM scroll event (old Firefox?)');
                e.preventDefault();
            }); // disable scroll behaviour);
            // new Safari only (probably)
            this.renderer.view.addEventListener('gesturestart', function (e) { return _this.onZoomBegin(e); });
            this.renderer.view.addEventListener('gesturechange', function (e) { return _this.onZoom(e); });
            this.renderer.view.addEventListener('gestureend', function (e) { return _this.onZoomEnd(e); });
        };
        // TODO: optimize for shorter function
        ScrollView.prototype.unregisterEventListeners = function () {
            this.viewport.interactive = false;
            this.renderer.off('resize', this.onResize, this);
            this.viewport.off('pointerdown', this.onDown, this);
            this.viewport.off('pointermove', this.onMove, this);
            this.viewport.off('pointerup', this.onUp, this);
            this.viewport.off('pointerupoutside', this.onUp, this);
            this.viewport.off('pointercancel', this.onUp, this);
            this.viewport.off('pointerout', this.onUp, this);
            // TODO: other events
        };
        ScrollView.prototype.destroy = function () {
            this.unregisterEventListeners();
            this.viewport.removeChild(this);
        };
        ScrollView.prototype.fireEvent = function (data, type) {
            var event = new ScrollViewEvent(data.clone(), type);
            if (data.cancelEvent) {
                event.cancel(); // cancel event
            }
            this.eventListeners.forEach(function (e) { return e(event); });
            data.cancelEvent = event.cancelEvent; // store within event for later usage
            return event.cancelEvent;
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
