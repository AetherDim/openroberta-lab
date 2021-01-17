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
    exports.ScrollView = exports.EventData = exports.ScrollViewEvent = exports.cloneVectorOrUndefined = exports.cloneVector = exports.MouseButton = exports.EventType = exports.getBrowser = exports.Browser = void 0;
    var Browser = /** @class */ (function () {
        function Browser(o) {
            this.name = o.name;
            this.version = o.version;
            this.versionID = o.versionID;
            this.hasMultiTouchInteraction = o.hasMultiTouchInteraction;
        }
        Browser.prototype.isTouchSafari = function () {
            return this.hasMultiTouchInteraction && this.name == "Safari";
        };
        Browser.prototype.isSafariEvent = function (event) {
            return this.name == "Safari";
        };
        return Browser;
    }());
    exports.Browser = Browser;
    /**
     * Returns browser version and name
     * borrowed from: https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
     */
    function getBrowser() {
        var ua = navigator.userAgent;
        var tem;
        var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        // https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
        var hasMultiTouchInteraction = navigator.maxTouchPoints > 1;
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return new Browser({ name: 'IE', version: (tem[1] || ''), hasMultiTouchInteraction: hasMultiTouchInteraction });
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null)
                return new Browser({ name: tem[1].replace('OPR', 'Opera'), version: tem[2], hasMultiTouchInteraction: hasMultiTouchInteraction });
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
        return new Browser({ name: M[0], version: M[1], versionID: id, hasMultiTouchInteraction: hasMultiTouchInteraction });
    }
    exports.getBrowser = getBrowser;
    // the following implementation borrowed some ideas from:
    // https://github.com/davidfig/pixi-viewport/blob/0aec760f1bdbcb1f9693376a61c041459322d6a0/src/input-manager.js#L168
    /**
     * Different type of mouse/touch events
     */
    var EventType;
    (function (EventType) {
        /**
         * z-direction scroll (zoom)
         */
        EventType[EventType["ZOOM"] = 0] = "ZOOM";
        /**
         * x/y-direction - not used as of now
         */
        EventType[EventType["SCROLL"] = 1] = "SCROLL";
        /**
         * similar to SCROLL in x/y-direction
         */
        EventType[EventType["MOVE"] = 2] = "MOVE";
        /**
         * on press event
         */
        EventType[EventType["PRESS"] = 3] = "PRESS";
        /**
         * release event
         */
        EventType[EventType["RELEASE"] = 4] = "RELEASE";
        /**
         * mouse drag event (x/y-direction with pressed button/touch)
         */
        EventType[EventType["DRAG"] = 5] = "DRAG";
        /**
         * not used as of now
         */
        EventType[EventType["NONE"] = 6] = "NONE";
    })(EventType = exports.EventType || (exports.EventType = {}));
    /**
     * All the available mouse buttons
     */
    var MouseButton;
    (function (MouseButton) {
        MouseButton[MouseButton["LEFT"] = 0] = "LEFT";
        MouseButton[MouseButton["WHEEL"] = 1] = "WHEEL";
        MouseButton[MouseButton["RIGHT"] = 2] = "RIGHT";
        MouseButton[MouseButton["BACK"] = 3] = "BACK";
        MouseButton[MouseButton["FORWARD"] = 4] = "FORWARD";
    })(MouseButton = exports.MouseButton || (exports.MouseButton = {}));
    /**
     * Copy point or vector
     * @param vec vector/point to copy
     */
    function cloneVector(vec) {
        return { x: vec.x, y: vec.y };
    }
    exports.cloneVector = cloneVector;
    /**
     * Copy point or vector
     * @param vec vector/point to copy
     */
    function cloneVectorOrUndefined(vec) {
        if (!vec) {
            return undefined;
        }
        return { x: vec.x, y: vec.y };
    }
    exports.cloneVectorOrUndefined = cloneVectorOrUndefined;
    /**
     * Scroll view event. This event contains data and is cancelable.
     */
    var ScrollViewEvent = /** @class */ (function () {
        function ScrollViewEvent(data, type) {
            /**
             * whether this event should be canceled
             */
            this.cancelEvent = false;
            this.data = data;
            this.type = type;
        }
        /**
         * Disable mouse dragging/scrolling for this touch/press.
         */
        ScrollViewEvent.prototype.cancel = function () {
            this.cancelEvent = true;
            this.data.cancelEvent = true;
        };
        return ScrollViewEvent;
    }());
    exports.ScrollViewEvent = ScrollViewEvent;
    /**
     * Contains all data provided to listeners of the ScrollViewEvent.
     * Listeners will get a copy of this object to prevent modification of movement control data.
     */
    var EventData = /** @class */ (function () {
        /**
         * Construct a new event data object.
         * @param scrollView the corresponding scroll view
         * @param isMouse whether the event origin is a mouse
         * @param pressed whether any button is pressed
         * @param position (This will clone the position to prevent shared objects)
         */
        function EventData(scrollView, isMouse, pressed, position) {
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
             * (Will only happen while dragging with more than one finger and signals the end of one cycle)
             */
            this.isMergeTouchEvent = false;
            /**
             * currently pressed mouse button with length 5
             * index by using the MouseButton enum
             */
            this.buttons = [false, false, false, false, false];
            /**
             * the id of the touch event
             */
            this.id = -1;
            /**
             * Event (mouse/touch) location.
             */
            this.currentPosition = { x: 0, y: 0 };
            /**
             * Delta zoom scale (this factor should be around 1).
             */
            this.deltaZoom = 1;
            /**
             * whether the touch or any mouse button is "down"
             */
            this.pressed = false;
            this.scrollView = scrollView;
            this.isMouse = isMouse;
            this.pressed = pressed;
            // prevent a certain edge case on devices with touchscreen and chrome
            if (isNaN(position.x) || isNaN(position.y)) {
                console.error('mouse position is NaN (this can be safely ignored by users and does not break anything)');
                position = { x: 0, y: 0 };
            }
            // init both positions and delta
            // position and delta should never be null
            this.previousPosition = cloneVector(position);
            this.currentPosition = cloneVector(position);
            this.updateDelta();
        }
        /**
         * Helper method to check whether the left mouse button is pressed.
         */
        EventData.prototype.isLeftButtonPressed = function () {
            return this.buttons[MouseButton.LEFT];
        };
        /**
         * Helper method to check whether the middle mouse button is pressed.
         */
        EventData.prototype.isMiddleButtonPressed = function () {
            return this.buttons[MouseButton.WHEEL];
        };
        /**
         * Helper method to check whether the right mouse button is pressed.
         */
        EventData.prototype.isRightButtonPressed = function () {
            return this.buttons[MouseButton.RIGHT];
        };
        /**
         * Set the new position and copy the old one to previous position.
         * (This will clone the position to prevent shared objects)
         * @param position new position
         */
        EventData.prototype.setNewPosition = function (position) {
            if (isNaN(position.x) || isNaN(position.y)) {
                //console.error('position cannot be NaN');
                // this happens if the simulation is closed
                // probably because the viewport has no dimension
                return;
            }
            this.previousPosition = this.currentPosition;
            this.currentPosition = cloneVector(position);
        };
        /**
         * Checks for any mouse button press. This is not necessary because
         * this.pressed will contain this information.
         * This function is used internally to set the pressed flag.
         */
        EventData.prototype.isAnyButtonPressed = function () {
            return this.buttons.includes(true);
        };
        /**
         * Translates the current global positions to the scroll view local position.
         */
        EventData.prototype.getCurrentLocalPosition = function () {
            return this.scrollView.toLocal(this.currentPosition);
        };
        /**
         * Translates the previous global positions to the scroll view local position.
         */
        EventData.prototype.getPreviousLocalPosition = function () {
            if (!this.previousPosition) {
                return undefined;
            }
            return this.scrollView.toLocal(this.previousPosition);
        };
        /**
         * Translates the global delta to a local delta relative to the scroll view.
         */
        EventData.prototype.getDeltaLocal = function () {
            // TODO: Maybe wrong since delta is a relative vector and not an absolute one
            if (!this.delta) {
                return undefined;
            }
            return this.scrollView.toLocal(this.delta);
        };
        /**
         * Calculate the current delta with the current and previous position. If the previous position is not set,
         * this will set delta to {x: 0, y: 0}.
         */
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
        /**
         * Clones the object. All information will be cloned except the scroll view instance.
         */
        EventData.prototype.clone = function () {
            var event = new EventData(this.scrollView, this.isMouse, this.pressed, this.currentPosition);
            event.buttons = Object.assign([], this.buttons);
            event.id = this.id;
            event.previousPosition = cloneVectorOrUndefined(this.previousPosition);
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
    /**
     * The scroll view, controlling mouse and touch interaction.
     */
    var ScrollView = /** @class */ (function (_super) {
        __extends(ScrollView, _super);
        function ScrollView(viewport, renderer) {
            var _this = _super.call(this) || this;
            /**
             * The custom hit area for the parent viewport. This will be updated to the current
             * screen width and height to catch all mouse interactions.
             */
            _this.customHitArea = new PIXI.Rectangle(0, 0, 0, 0);
            /**
             * Contains browser information.
             * {name:string, version:string, versionId: number}
             */
            _this.browser = getBrowser();
            /**
             * Whether to fire all touch events or only fire touch events after a full cycle has been completed.
             * A full cycle means, each touch position has been updated.
             */
            _this.fireOnlyMergeTouchEvents = false;
            //
            // Event Data
            //
            /**
             * All mouse data.
             */
            _this.mouseEventData = new EventData(_this, true, false, { x: 0, y: 0 });
            /**
             * Touch event data list.
             */
            _this.touchEventDataMap = new Map();
            /**
             * All registered event listeners.
             */
            _this.eventListeners = [];
            /**
             * last touch distance between two fingers
             */
            _this.lastTouchDistance = -1;
            viewport.addChild(_this);
            _this.viewport = viewport;
            _this.renderer = renderer;
            _this.viewport.hitArea = _this.customHitArea;
            _this.updateInteractionRect();
            _this.registerEventListeners();
            _this.reset();
            return _this;
        }
        ScrollView.prototype.reset = function () {
            var initialZoom = 1 / this.getPixelRatio();
            this.setTransform(0, 0, initialZoom, initialZoom, 0, 0, 0, 0, 0);
        };
        /**
         * update hitbox for mouse interactions
         */
        ScrollView.prototype.updateInteractionRect = function () {
            this.customHitArea.width = this.renderer.screen.width;
            this.customHitArea.height = this.renderer.screen.height;
        };
        /**
         * Warning: this will create a new object if no object with this ID exists!!!
         * @param id id of the touch
         */
        ScrollView.prototype.getTouchDataAndUpdatePosition = function (id, currentPosition) {
            var data = this.touchEventDataMap.get(id);
            if (!data) {
                data = new EventData(this, false, false, currentPosition);
                data.id = id;
                this.touchEventDataMap.set(id, data);
            }
            else {
                data.setNewPosition(currentPosition);
            }
            return data;
        };
        /**
         * returns the pixel ratio of this device
         */
        ScrollView.prototype.getPixelRatio = function () {
            return window.devicePixelRatio || 0.75; // 0.75 is default for old browsers
        };
        /**
         * zoom into position
         * @param delta zoom delta
         * @param pos position
         */
        ScrollView.prototype.zoom = function (delta, pos) {
            this.x = (this.x - pos.x) * delta + pos.x;
            this.y = (this.y - pos.y) * delta + pos.y;
            this.scale.x *= delta;
            this.scale.y *= delta;
        };
        //
        // Events
        //
        /**
         * resize event
         * This method will be called multiple times per second!
         */
        ScrollView.prototype.onResize = function () {
            //console.log('resize');
            this.updateInteractionRect();
        };
        /**
         * mouse press / touch down event
         * @param ev interaction data
         */
        ScrollView.prototype.onDown = function (ev) {
            console.log('down ' + this.touchEventDataMap.size);
            var data;
            if (ev.data.pointerType == 'mouse') {
                data = this.mouseEventData;
                data.pressed = true;
                data.buttons[ev.data.button] = true;
                data.setNewPosition(ev.data.global);
            }
            else {
                // creates new touch data
                data = this.getTouchDataAndUpdatePosition(ev.data.pointerId, ev.data.global);
                data.pressed = true;
            }
            var cancel = this.fireEvent(data, EventType.PRESS);
            // ignore cancel (cancelEvent ist stored within the object)
            ev.stopPropagation();
        };
        /**
         * mouse release / touch up event
         * @param ev interaction data
         */
        ScrollView.prototype.onUp = function (ev) {
            console.log('up ' + this.touchEventDataMap.size);
            var data;
            if (ev.data.pointerType == 'mouse') {
                data = this.mouseEventData;
                data.buttons[ev.data.button] = false;
                data.pressed = data.isAnyButtonPressed();
            }
            else {
                // find and remove touch data
                var tempData = this.touchEventDataMap.get(ev.data.pointerId);
                if (tempData) {
                    this.touchEventDataMap.delete(ev.data.pointerId);
                    data = tempData;
                }
                else {
                    // This should not happen
                    //console.error('touch released before press!');
                    // happens on surface devices
                    data = new EventData(this, false, false, ev.data.global);
                    data.id = ev.data.pointerId;
                }
            }
            data.setNewPosition(ev.data.global);
            // we could update the delta here
            var cancel = this.fireEvent(data, EventType.RELEASE);
            // ignore cancel (cancelEvent ist stored within the object)
            data.cancelEvent = false; // reset cancel event flag (for the mouse)
            ev.stopPropagation();
        };
        /**
         * mouse move/drag or touch drag event
         * @param ev  interaction data
         */
        ScrollView.prototype.onMove = function (ev) {
            var _a, _b;
            console.log('move');
            if (isNaN(ev.data.global.x) || isNaN(ev.data.global.y)) {
                return;
            }
            // Fix for surface devices where touch input does not generate an up event and
            // we cannot remove the event object
            if (!this.renderer.screen.contains(ev.data.global.x, ev.data.global.y)) {
                return;
            }
            var data;
            var type;
            var cancel;
            var allEventFired = true; // for touch only
            if (ev.data.pointerType == 'mouse') {
                data = this.mouseEventData;
                // check for mouse move or drag
                if (data.pressed) {
                    type = EventType.DRAG;
                }
                else {
                    type = EventType.MOVE;
                }
                // update position and delta
                data.setNewPosition(ev.data.global);
                data.updateDelta();
                // fire event
                cancel = this.fireEvent(data, type);
            }
            else { // touch
                //console.log("id: " + ev.data.pointerId);
                data = this.getTouchDataAndUpdatePosition(ev.data.pointerId, ev.data.global);
                data.updateDelta();
                data.eventFired = true;
                type = EventType.DRAG; // move should be impossible (except stylus?)
                // fire only if required by settings
                if (!this.fireOnlyMergeTouchEvents) {
                    cancel = this.fireEvent(data, type);
                }
                this.touchEventDataMap.forEach(function (data, id, map) {
                    if (!data.eventFired) {
                        allEventFired = false;
                    }
                });
                if (allEventFired) {
                    var previousPosition_1 = { x: 0, y: 0 };
                    var currentPosition_1 = { x: 0, y: 0 };
                    var oneCancelled_1 = false;
                    this.touchEventDataMap.forEach(function (data, id, map) {
                        var _a, _b;
                        // ignore incomplete touch events
                        previousPosition_1.x += ((_a = data.previousPosition) === null || _a === void 0 ? void 0 : _a.x) || 0;
                        previousPosition_1.y += ((_b = data.previousPosition) === null || _b === void 0 ? void 0 : _b.y) || 0;
                        currentPosition_1.x += data.currentPosition.x;
                        currentPosition_1.y += data.currentPosition.y;
                        data.eventFired = false; // reset all events fired
                        oneCancelled_1 || (oneCancelled_1 = data.cancelEvent);
                    });
                    var numOfTouches = this.touchEventDataMap.size;
                    previousPosition_1.x /= numOfTouches;
                    previousPosition_1.y /= numOfTouches;
                    currentPosition_1.x /= numOfTouches;
                    currentPosition_1.y /= numOfTouches;
                    data = new EventData(this, false, true, currentPosition_1); // this will set the current position
                    data.previousPosition = previousPosition_1;
                    data.isMergeTouchEvent = true;
                    data.cancelEvent = oneCancelled_1; // whether this event is already cancelled
                    data.updateDelta();
                    cancel = this.fireEvent(data, type);
                }
                // here we also check if the event is cancelled before we attempt zoom
                // TODO: cancel might not initialized. Do not use optional booleans if possible
                if (!cancel && this.touchEventDataMap.size == 2 && !this.browser.isTouchSafari()) { // zoom mode
                    // get the touch input from the map
                    var touches = this.touchEventDataMap.values();
                    var touch1 = touches.next().value;
                    var touch2 = touches.next().value;
                    if (!touch1 || !touch2) {
                        console.error('Touch is null!');
                    }
                    else {
                        // calculate previous touch distance
                        var pp1 = touch1.previousPosition;
                        var pp2 = touch2.previousPosition;
                        var previousLength = Math.sqrt(Math.pow(pp1.x - pp2.x, 2) + Math.pow(pp1.y - pp2.y, 2));
                        // calculate current touch distance
                        var cp1 = touch1.currentPosition;
                        var cp2 = touch2.currentPosition;
                        var currentLength = Math.sqrt(Math.pow(cp1.x - cp2.x, 2) + Math.pow(cp1.y - cp2.y, 2));
                        // calculate delta zoom factor
                        var deltaZoom = currentLength / previousLength;
                        // this could happen and would break everything
                        if (isNaN(deltaZoom)) {
                            deltaZoom = 1;
                        }
                        data.deltaZoom = deltaZoom;
                        var cancelZoom = this.fireEvent(data, EventType.ZOOM);
                        if (!cancelZoom) {
                            //console.log('zoom: ' + zoomFactor);
                            this.zoom(deltaZoom, { x: (cp1.x + cp2.x) / 2, y: (cp1.y + cp2.y) / 2 });
                        }
                    }
                }
            }
            if (!cancel && type == EventType.DRAG && allEventFired) {
                // move view to new position and check bounds
                this.x -= ((_a = data.delta) === null || _a === void 0 ? void 0 : _a.x) || 0;
                this.y -= ((_b = data.delta) === null || _b === void 0 ? void 0 : _b.y) || 0;
                /*let visible = 1-this.minimalVisibleArea;
                let check = this.customHitArea.x - this.width*visible
                if(this.x < check) {
                    this.x = check;
                }
    
                check = this.customHitArea.y - this.height*visible
                if(this.y < check) {
                    this.y = check;
                }
    
                check = this.customHitArea.x + this.customHitArea.width - this.width * this.minimalVisibleArea
                if(this.x > check) {
                    this.x = check;
                }
    
                check = this.customHitArea.y + this.customHitArea.height - this.height * this.minimalVisibleArea
                if(this.y > check) {
                    this.y = check;
                }*/
            }
            ev.stopPropagation();
        };
        /**
         * mouse wheel event
         * @param ev  interaction data
         */
        ScrollView.prototype.onWheel = function (ev) {
            console.log('wheel');
            var pixelRatio = this.getPixelRatio();
            var data;
            if (ev.type == "wheel") {
                var type = void 0;
                data = this.mouseEventData;
                // calculate mouse position
                var rect = this.renderer.view.getBoundingClientRect();
                data.setNewPosition({
                    x: (ev.clientX - rect.x) / pixelRatio,
                    y: (ev.clientY - rect.y) / pixelRatio
                });
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
        /**
         * zoom event (gesture event)
         * @param e event data
         */
        ScrollView.prototype.onZoom = function (e) {
            console.log('zoom');
            // TODO: we could use this for other browsers if there is another with support
            if (this.browser.isSafariEvent(e)) {
                if (this.lastTouchDistance > 0) {
                    // calculate distance change between fingers
                    var delta = e.scale / this.lastTouchDistance;
                    this.mouseEventData.delta = { x: delta, y: 0 };
                    if (this.browser.isTouchSafari()) {
                        this.mouseEventData.setNewPosition({ x: e.layerX, y: e.layerY });
                    }
                    this.lastTouchDistance = e.scale;
                    var cancel = this.fireEvent(this.mouseEventData, EventType.ZOOM);
                    if (!cancel) {
                        // here we use the old mouse position because we don't
                        // have access to the current one but this should be very
                        // accurate none the less
                        this.zoom(delta, this.mouseEventData.currentPosition);
                    }
                }
            }
            else {
                console.log('Zoom from non Safari browser!');
            }
            e.preventDefault();
        };
        /**
         * zoom begin event (gesture begin event)
         * @param e event data
         */
        ScrollView.prototype.onZoomBegin = function (e) {
            console.log('safari zoom');
            if (this.browser.isSafariEvent(e)) {
                this.lastTouchDistance = e.scale;
            }
            e.preventDefault();
        };
        /**
         * zoom end event (gesture end event)
         * @param e event data
         */
        ScrollView.prototype.onZoomEnd = function (e) {
            this.lastTouchDistance = -1;
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
            this.viewport.on('onpointerleave', this.onUp, this);
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
            this.viewport.off('onpointerleave', this.onUp, this);
            // TODO: other events
            console.error('not fully implemented function!!!');
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
            data.cancelEvent = event.cancelEvent; // store within data for later usage
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
