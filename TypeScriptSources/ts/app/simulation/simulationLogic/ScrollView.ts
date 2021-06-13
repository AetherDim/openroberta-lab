import './pixijs'
import { Util } from './Util'

export class Browser {

	name: string
	version: string
	versionID?: number
	hasMultiTouchInteraction: boolean

	constructor(o: {name: string, version: string, versionID?: number, hasMultiTouchInteraction: boolean}) {
		this.name = o.name
		this.version = o.version
		this.versionID = o.versionID
		this.hasMultiTouchInteraction = o.hasMultiTouchInteraction
	}

	isTouchSafari(): boolean {
		return this.hasMultiTouchInteraction && this.name == "Safari"
	}

	isSafariEvent(event: Event): event is SafariEvent & Event {
		return this.name == "Safari"
	}
}

/**
 * Returns browser version and name
 * borrowed from: https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
 */
export function getBrowser(): Browser {
	let ua = navigator.userAgent
	let tem
	let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	
	// https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
	const hasMultiTouchInteraction = navigator.maxTouchPoints > 1

	if(/trident/i.test(M[1])){
			tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
			return new Browser({name:'IE',version:(tem[1] || ''), hasMultiTouchInteraction: hasMultiTouchInteraction})
	}
	if(M[1]=== 'Chrome'){
			tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
			if(tem != null) return new Browser({name:tem[1].replace('OPR', 'Opera'),version:tem[2], hasMultiTouchInteraction: hasMultiTouchInteraction})
	}
	M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
	if((tem = ua.match(/version\/(\d+)/i))!= null) {
		M.splice(1, 1, tem[1]);
	} 
	
	var arr = M[1].split('.', 1);
	var id = -1;
	if(arr.length < 0) {
		id = Number.parseInt(arr[0]); 
	}
	
	return new Browser({name:M[0], version:M[1], versionID:id, hasMultiTouchInteraction: hasMultiTouchInteraction})
}



// the following implementation borrowed some ideas from:
// https://github.com/davidfig/pixi-viewport/blob/0aec760f1bdbcb1f9693376a61c041459322d6a0/src/input-manager.js#L168


/**
 * Different type of mouse/touch events
 */
export enum EventType {
	/**
	 * z-direction scroll (zoom)
	 */
	ZOOM,
	/**
	 * x/y-direction - not used as of now
	 */
	SCROLL,
	/**
	 * similar to SCROLL in x/y-direction
	 */
	MOVE,
	/**
	 * on press event
	 */
	PRESS,
	/**
	 * release event
	 */
	RELEASE,
	/**
	 * mouse drag event (x/y-direction with pressed button/touch)
	 */
	DRAG,
	/**
	 * not used as of now
	 */
	NONE
}

/**
 * All the available mouse buttons
 */
export enum MouseButton {
	LEFT = 0,
	WHEEL = 1,
	RIGHT = 2,
	BACK = 3,
	FORWARD = 4
}

/**
 * Copy point or vector
 * @param vec vector/point to copy
 */
export function cloneVector(vec: PIXI.IPointData) {
	return {x: vec.x, y: vec.y};
}

/**
 * Copy point or vector
 * @param vec vector/point to copy
 */
export function cloneVectorOrUndefined(vec?: PIXI.IPointData) {
	if(!vec) {
		return undefined;
	}
	return {x: vec.x, y: vec.y};
}


/**
 * Scroll view event. This event contains data and is cancelable.
 */
export class ScrollViewEvent {

	constructor(data: EventData, type: EventType) {
		this.data = data;
		this.type = type;
	}

	/**
	 * whether this event should be canceled
	 */
	cancelEvent: boolean = false;

	/**
	 * Disable mouse dragging/scrolling for this touch/press.
	 */
	cancel() {
		this.cancelEvent = true;
		this.data.cancelEvent = true;
	}

	/**
	 * Event data
	 */
	data: EventData;

	/**
	 * The event type
	 */
	type: EventType;

}

/**
 * Contains all data provided to listeners of the ScrollViewEvent.
 * Listeners will get a copy of this object to prevent modification of movement control data.
 */
export class EventData {

	/**
	 * Construct a new event data object.
	 * @param scrollView the corresponding scroll view
	 * @param isMouse whether the event origin is a mouse
	 * @param pressed whether any button is pressed
	 * @param position (This will clone the position to prevent shared objects)
	 */
	constructor(scrollView: ScrollView, isMouse:boolean, pressed:boolean, position: PIXI.IPointData) {
		this.scrollView = scrollView;
		this.isMouse = isMouse;
		this.pressed = pressed;

		// prevent a certain edge case on devices with touchscreen and chrome
		if(isNaN(position.x) || isNaN(position.y)) {
			console.error('mouse position is NaN (this can be safely ignored by users and does not break anything)');
			position = {x: 0, y:0 };
		}


		// init both positions and delta
		// position and delta should never be null
		this.previousPosition = cloneVector(position);
		this.currentPosition = cloneVector(position);
		this.updateDelta();
	}

	/**
	 * The event source view
	 */
	readonly scrollView: ScrollView;

	/**
	 * whether this is a mouse event or a touch event
	 */
	readonly isMouse: boolean = false;

	/**
	 * whether this event has been canceled.
	 * Do not set this parameter, this will do nothing. Use the ScrollViewEvent's cancel() method instead!
	 */
	cancelEvent: boolean = false;

	/**
	 * Internal flag, used to detect whether a touch has already fired an event (within one cycle).
	 */
	eventFired: boolean = false;

	/**
	 * Whether this event is a merge from multiple touch events.
	 * (Will only happen while dragging with more than one finger and signals the end of one cycle)
	 */
	isMergeTouchEvent: boolean = false;

	/**
	 * currently pressed mouse button with length 5
	 * index by using the MouseButton enum
	 */
	private buttons: boolean[] = [false, false, false, false, false];

	/**
	 * the id of the touch event
	 */
	id: number = -1;

	/**
	 * previous position, only available from some events (MOVE, RELEASE, DRAG)
	 * For all other events, this will contain old data or no data.
	 */
	previousPosition?: PIXI.IPointData;

	/**
	 * Event (mouse/touch) location.
	 */
	currentPosition: PIXI.IPointData = { x: 0, y: 0 };

	/**
	 * Contains delta information for mouse move, drag and scroll
	 */
	delta?: PIXI.IPointData;

	/**
	 * Delta zoom scale (this factor should be around 1).
	 */
	deltaZoom: number = 1;

	/**
	 * whether the touch or any mouse button is "down"
	 */
	pressed: boolean = false;

	/**
	 * Helper method to check whether the left mouse button is pressed.
	 */
	isLeftButtonPressed() {
		return this.buttons[MouseButton.LEFT];
	}

	/**
	 * Helper method to check whether the middle mouse button is pressed.
	 */
	isMiddleButtonPressed() {
		return this.buttons[MouseButton.WHEEL];
	}

	/**
	 * Helper method to check whether the right mouse button is pressed.
	 */
	isRightButtonPressed() {
		return this.buttons[MouseButton.RIGHT];
	}

	/**
	 * Set the new position and copy the old one to previous position.
	 * (This will clone the position to prevent shared objects)
	 * @param position new position
	 */
	setNewPosition(position: PIXI.IPointData) {

		if(isNaN(position.x) || isNaN(position.y)) {
			//console.error('position cannot be NaN');
			// this happens if the simulation is closed
			// probably because the viewport has no dimension
			return;
		}

		this.previousPosition = this.currentPosition;
		this.currentPosition = cloneVector(position);
	}

	isButtonPressed(id: number): boolean {
		if(id < this.buttons.length && id >= 0) {
			return this.buttons[id]
		} else {
			return false
		}
	}

	setButtonPressed(id: number, pressed: boolean) {
		if(id < this.buttons.length && id >= 0) {
			this.buttons[id] = pressed
		}
	}

	/**
	 * Checks for any mouse button press. This is not necessary because
	 * this.pressed will contain this information.
	 * This function is used internally to set the pressed flag.
	 */
	isAnyButtonPressed() {
		return this.buttons.includes(true);
	}

	/**
	 * Translates the current global positions to the scroll view local position.
	 */
	getCurrentLocalPosition(): PIXI.IPointData {
		return this.scrollView.toLocal(this.currentPosition);
	}

	/**
	 * Translates the previous global positions to the scroll view local position.
	 */
	getPreviousLocalPosition(): PIXI.IPointData | undefined {
		if (!this.previousPosition) {
			return undefined
		}
		return this.scrollView.toLocal(this.previousPosition);
	}

	/**
	 * Translates the global delta to a local delta relative to the scroll view.
	 */
	getDeltaLocal() {
		// TODO: Maybe wrong since delta is a relative vector and not an absolute one
		if (!this.delta) {
			return undefined
		}
		return this.scrollView.toLocal(this.delta);
	}

	/**
	 * Calculate the current delta with the current and previous position. If the previous position is not set,
	 * this will set delta to {x: 0, y: 0}.
	 */
	updateDelta() {
		if(this.previousPosition) {
			this.delta = {
				x: this.previousPosition.x-this.currentPosition.x,
				y: this.previousPosition.y-this.currentPosition.y
			};
		} else {
			this.delta = {x: 0, y: 0};
		}
	}

	/**
	 * Clones the object. All information will be cloned except the scroll view instance.
	 */
	clone() {
		const event = new EventData(this.scrollView, this.isMouse, this.pressed, this.currentPosition);

		event.buttons = Object.assign([], this.buttons);
		event.id = this.id;
		event.previousPosition = cloneVectorOrUndefined(this.previousPosition);
		event.delta = this.delta;
		event.deltaZoom = this.deltaZoom;
		event.eventFired = this.eventFired;
		event.isMergeTouchEvent = this.isMergeTouchEvent;
		event.cancelEvent = this.cancelEvent;

		return event;
	}

	/**
	 * Sets all things pressed to false
	 */
	clear() {
		this.pressed = false
		for (let i = 0; i < this.buttons.length; i++) {
			this.buttons[i] = false;
		}
	}

}

interface SafariEvent {
	scale: number
	layerX: number
	layerY: number
}

/**
 * The scroll view, controlling mouse and touch interaction.
 */
export class ScrollView extends PIXI.Container {

	/**
	 * The pixijs renderer for event registration.
	 */
	readonly renderer: PIXI.Renderer;
	/**
	 * The viewport (app.stage) to hold this viewport.
	 * This viewport will be moved and scaled according to mouse interactions.
	 */
	readonly viewport: PIXI.Container;
	/**
	 * The custom hit area for the parent viewport. This will be updated to the current
	 * screen width and height to catch all mouse interactions.
	 */
	private customHitArea = new PIXI.Rectangle(0, 0, 0, 0);

	/**
	 * Contains browser information.
	 * {name:string, version:string, versionId: number}
	 */
	readonly browser = getBrowser();

	/**
	 * Whether to fire all touch events or only fire touch events after a full cycle has been completed.
	 * A full cycle means, each touch position has been updated.
	 */
	fireOnlyMergeTouchEvents = false;


	/**
	 * Inverts zoom behaviour
	 */
	invertZoom = false;

	public minScreenSize = { width: 400, height: 300 }



	//
	// Event Data
	//

	/**
	 * All mouse data.
	 */
	private mouseEventData: EventData = new EventData(this, true, false, {x: 0, y: 0});
	/**
	 * Touch event data list.
	 */
	private touchEventDataMap = new Map<number, EventData>();


	/**
	 * All registered event listeners.
	 */
	private eventListeners: Array<(arg: ScrollViewEvent) => void> = [];


	constructor(viewport: PIXI.Container, renderer: PIXI.Renderer) {
			super();

			viewport.addChild(this);

			this.viewport = viewport;
			this.renderer = renderer;
			this.viewport.hitArea = this.customHitArea;

			this.updateInteractionRect();
			this.registerEventListeners();

			this.reset()
	}


	resetCentered(x: number, y: number, width: number, height: number, zoomFactorReset: "fit" | "fill" | "none" = "fit") {

		const screen = this.renderer.screen
		const screenWidth = screen.width
		const screenHeight = screen.height
		if(isNaN(screenWidth) || isNaN(screenHeight)) {
			this.setTransform(0, 0, 1, 1, 0, 0, 0, 0, 0)
		} else {
			const translationX = screen.width / 2 - (x + width / 2)
			const translationY = screen.height / 2 - (y + height / 2)
			this.setTransform(translationX, translationY, 1, 1, 0, 0, 0, 0, 0)
		}

		const scalingWith = Math.max(screenWidth, this.minScreenSize.width)
		const scalingHeight = Math.max(screenHeight, this.minScreenSize.height)
		this.zoomCenter(
			zoomFactorReset == "fill" ? Math.max(scalingWith / width, scalingHeight / height) :
			zoomFactorReset == "fit"  ? Math.min(scalingWith / width, scalingHeight / height) :
			1 // zoomFactorReset == "none"
		)

		// to fix any touch/mouse issues
		this.touchEventDataMap.clear()
		this.mouseEventData.clear()
	}
	
	reset() {
		const initialZoom = 1
		this.setTransform(0, 0, initialZoom, initialZoom, 0, 0, 0, 0, 0);

		// to fix any touch/mouse issues
		this.touchEventDataMap.clear()
		this.mouseEventData.clear()
	}

	/**
	 * update hitbox for mouse interactions
	 */
	private updateInteractionRect() {
			this.customHitArea.width = this.renderer.screen.width;
			this.customHitArea.height = this.renderer.screen.height;
	}

	/**
	 * Warning: this will create a new object if no object with this ID exists!!!
	 * @param id id of the touch
	 */
	private getTouchDataAndUpdatePosition(id: number, currentPosition: PIXI.IPointData): EventData {
		let data = this.touchEventDataMap.get(id);
		if(!data) {
			data = new EventData(this, false, false, currentPosition);
			data.id = id;
			this.touchEventDataMap.set(id, data);
		} else {
			data.setNewPosition(currentPosition);
		}
		return data;
	}

	/**
	 * zoom into position
	 * @param delta zoom delta
	 * @param pos position
	 */
	public zoom(delta: number, pos: PIXI.IPointData) {
		this.x = (this.x - pos.x) * delta + pos.x;
		this.y = (this.y - pos.y) * delta + pos.y;
		
		this.scale.x *= delta;
		this.scale.y *= delta;
	}

	public zoomCenter(delta: number) {
		this.zoom(delta, {x: this.renderer.screen.width/2, y: this.renderer.screen.height/2})
	}


	//
	// Events
	//

	/**
	 * resize event
	 * This method will be called multiple times per second!
	 */
	private onResize() {
		//console.log('resize');
		this.updateInteractionRect();
	}

	/**
	 * mouse press / touch down event
	 * @param ev interaction data
	 */
	private onDown(ev: PIXI.InteractionEvent) {
		//console.log('down ' + this.touchEventDataMap.size);

		let data: EventData;

		if(ev.data.pointerType == 'mouse') {
			data = this.mouseEventData;
			data.pressed = true;
			data.setButtonPressed(ev.data.button, true);
			data.setNewPosition(ev.data.global);
		} else {
			// creates new touch data
			data = this.getTouchDataAndUpdatePosition(ev.data.pointerId, ev.data.global);
			data.pressed = true;
		}

		
		let cancel: boolean = this.fireEvent(data, EventType.PRESS);

		// ignore cancel (cancelEvent ist stored within the object)

		ev.stopPropagation();
	}

	/**
	 * mouse release / touch up event
	 * @param ev interaction data
	 */
	private onUp(ev: PIXI.InteractionEvent) {
		//console.log('up ' + this.touchEventDataMap.size);
		
		let data: EventData;

		if(ev.data.pointerType == 'mouse') {
			data = this.mouseEventData;
			data.setButtonPressed(ev.data.button, false);
			data.pressed = data.isAnyButtonPressed();
		} else {
			// find and remove touch data
			const tempData = this.touchEventDataMap.get(ev.data.pointerId);
			if (tempData) {
				this.touchEventDataMap.delete(ev.data.pointerId);
				data = tempData
			} else {
				// This should not happen
				//console.error('touch released before press!');
				// happens on surface devices
				data = new EventData(this, false, false, ev.data.global);
				data.id = ev.data.pointerId;
			}
		}

		data.setNewPosition(ev.data.global);
		// we could update the delta here
		let cancel: boolean = this.fireEvent(data, EventType.RELEASE);

		// ignore cancel (cancelEvent ist stored within the object)

		data.cancelEvent = false; // reset cancel event flag (for the mouse)

		ev.stopPropagation();
	}

	/**
	 * mouse move/drag or touch drag event
	 * @param ev  interaction data
	 */
	private onMove(ev: PIXI.InteractionEvent) {
		//console.log('move');

		if(isNaN(ev.data.global.x) || isNaN(ev.data.global.y)) {
			return;
		}

		// Fix for surface devices where touch input does not generate an up event and
		// we cannot remove the event object
		if(!this.renderer.screen.contains(ev.data.global.x, ev.data.global.y)) {
			return;
		}

		let data: EventData;
		let type: EventType;
		let cancel: boolean = false;

		let allEventFired = true; // for touch only

		if(ev.data.pointerType == 'mouse') {
			data = this.mouseEventData;

			// check for mouse move or drag
			if(data.pressed) {
				type = EventType.DRAG;
			} else {
				type = EventType.MOVE;
			}

			// update position and delta
			data.setNewPosition(ev.data.global);
			data.updateDelta();

			// fire event
			cancel = this.fireEvent(data, type);

		} else { // touch
			//console.log("id: " + ev.data.pointerId);

			data = this.getTouchDataAndUpdatePosition(ev.data.pointerId, ev.data.global);
			data.updateDelta();
			data.eventFired = true;

			type = EventType.DRAG; // move should be impossible (except stylus?)

			// fire only if required by settings
			if(!this.fireOnlyMergeTouchEvents) {
				cancel = this.fireEvent(data, type);
			}

			this.touchEventDataMap.forEach((data: EventData, id: number, map: Map<number, EventData>) => {
				if(!data.eventFired) {
					allEventFired = false;
				}
			});

			if(allEventFired) {

				let previousPosition: PIXI.IPointData = {x: 0, y: 0};
				let currentPosition: PIXI.IPointData = {x: 0, y: 0};
				let oneCancelled = false;

				this.touchEventDataMap.forEach((data: EventData, id: number, map: Map<number, EventData>) => {
					// ignore incomplete touch events
					previousPosition.x += data.previousPosition?.x || 0;
					previousPosition.y += data.previousPosition?.y || 0;
					currentPosition.x += data.currentPosition.x;
					currentPosition.y += data.currentPosition.y;
					data.eventFired = false; // reset all events fired
					oneCancelled ||= data.cancelEvent;
				});

				const numOfTouches = this.touchEventDataMap.size;

				previousPosition.x /= numOfTouches;
				previousPosition.y /= numOfTouches;
				currentPosition.x /= numOfTouches;
				currentPosition.y /= numOfTouches;


				data = new EventData(this, false, true, currentPosition); // this will set the current position
				data.previousPosition = previousPosition;
				data.isMergeTouchEvent = true;
				data.cancelEvent = oneCancelled; // whether this event is already cancelled
				data.updateDelta();

				cancel = this.fireEvent(data, type);
			}

			// here we also check if the event is cancelled before we attempt zoom
			if(!cancel && this.touchEventDataMap.size == 2 && !this.browser.isTouchSafari()) { // zoom mode

				// get the touch input from the map
				let touches = this.touchEventDataMap.values();
				let touch1:EventData = touches.next().value;
				let touch2:EventData = touches.next().value;

				if(!touch1 || !touch2) {
					console.error('Touch is null!');
				} else {

					// calculate previous touch distance
					let pp1 = touch1.previousPosition!;
					let pp2 = touch2.previousPosition!;
					let previousLength = Math.sqrt(Math.pow(pp1.x-pp2.x, 2) + Math.pow(pp1.y-pp2.y, 2));

					// calculate current touch distance
					let cp1 = touch1.currentPosition;
					let cp2 = touch2.currentPosition;
					let currentLength = Math.sqrt(Math.pow(cp1.x-cp2.x, 2) + Math.pow(cp1.y-cp2.y, 2));

					// calculate delta zoom factor
					let deltaZoom = currentLength/previousLength;

					// this could happen and would break everything
					if(isNaN(deltaZoom)) {
						deltaZoom = 1;
					}

					data.deltaZoom = deltaZoom;
					let cancelZoom =  this.fireEvent(data, EventType.ZOOM);

					if(!cancelZoom) {
						//console.log('zoom: ' + zoomFactor);
						this.zoom(deltaZoom, {x: (cp1.x + cp2.x)/2, y: (cp1.y + cp2.y)/2});
					}
				}

			}
			
		}

		
		if(!cancel && type == EventType.DRAG && allEventFired) {
			// move view to new position and check bounds
			this.x -= data.delta?.x || 0;
			this.y -= data.delta?.y || 0;

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

	}

	/**
	 * mouse wheel event
	 * @param ev  interaction data
	 */
	private onWheel(ev: WheelEvent) {
		//console.log('wheel');

		let data: EventData;

		if (ev.type == "wheel") {

			let type: EventType;

			data = this.mouseEventData;

			// calculate mouse position
			let rect = this.renderer.view.getBoundingClientRect();
			data.setNewPosition({
				x: (ev.clientX - rect.x),
				y: (ev.clientY - rect.y)
			});
		
			// this should not work with safari mobile
			/*if(ev.ctrlKey) {
				// x/y-scrolling
				type = EventType.SCROLL;          
			} else {
				// zoom
				type = EventType.ZOOM;
			}*/

			let delta = ev.deltaY;
			let zoomFactor = 1;

			switch (ev.deltaMode) {
				case WheelEvent.DOM_DELTA_LINE:
					// for old firefox
					if(ev.ctrlKey) { // 12 for default text height
						zoomFactor = Math.exp(delta * 12 / -50); // -50 is good feeling magic number
					} else {
						zoomFactor = Math.exp(delta * 12 / 150); // 150 is good feeling magic number
					}
					break;
				case WheelEvent.DOM_DELTA_PAGE:
					console.warn('Delta page scrolling is not implemented!'); // ignore
					break;
				case WheelEvent.DOM_DELTA_PIXEL:
						if(ev.ctrlKey) {
							zoomFactor = Math.exp(delta / -50); // -50 is good feeling magic number
						} else {
							zoomFactor = Math.exp(delta / 150); // 150 is good feeling magic number
						}
					break;
			
				default:
					console.error('Unknown mouse wheel delta mode!');
					break;
			}

			if(!this.invertZoom) {
				zoomFactor = 1/zoomFactor
			}
			// TODO: include event data into invertZoom???
			data.delta = {x: ev.deltaX, y: ev.deltaY};

			let cancel: boolean = this.fireEvent(data, EventType.ZOOM);

			if(!cancel) {
				this.zoom(zoomFactor, data.currentPosition);
			}

		} else {
			console.error('unknown wheel event');
		}

		ev.preventDefault();
	}


	/**
	 * last touch distance between two fingers
	 */
	private lastTouchDistance = -1;

	/**
	 * zoom event (gesture event)
	 * @param e event data
	 */
	private onZoom(e: Event) {
		//console.log('zoom');

		// TODO: we could use this for other browsers if there is another with support
		if(this.browser.isSafariEvent(e)) {

			if(this.lastTouchDistance > 0) {

				// calculate distance change between fingers
				const delta = e.scale / this.lastTouchDistance
				this.mouseEventData.delta = {x: delta, y: 0};
				if (this.browser.isTouchSafari()) {
					this.mouseEventData.setNewPosition({x: e.layerX, y: e.layerY })
				}
	
				this.lastTouchDistance = <number>e.scale;

				let cancel: boolean = this.fireEvent(this.mouseEventData, EventType.ZOOM);

				if(!cancel) {
					// here we use the old mouse position because we don't
					// have access to the current one but this should be very
					// accurate none the less
					this.zoom(delta, this.mouseEventData.currentPosition)
				}

			}
			
		} else {
			console.error('Zoom from non Safari browser!');
		}

		e.preventDefault();
	}

	/**
	 * zoom begin event (gesture begin event)
	 * @param e event data
	 */
	private onZoomBegin(e: Event) {
		//console.log('safari zoom');
		if (this.browser.isSafariEvent(e)) {
			this.lastTouchDistance = e.scale;
		}
		e.preventDefault();
	}

	/**
	 * zoom end event (gesture end event)
	 * @param e event data
	 */
	private onZoomEnd(e: Event) {
		this.lastTouchDistance = -1;
		e.preventDefault();
	}

	private registerEventListeners() {
		this.viewport.interactive = true;

		this.renderer.on('resize', this.onResize, this);

		this.viewport.on('pointerdown', this.onDown, this);
		this.viewport.on('pointermove', this.onMove, this);
		this.viewport.on('pointerup', this.onUp, this);
		this.viewport.on('pointerupoutside', this.onUp, this);
		this.viewport.on('pointercancel', this.onUp, this);
		this.viewport.on('pointerout', this.onUp, this);
		this.viewport.on('onpointerleave', this.onUp, this);

		const view = this.renderer.view;

		// 2017 recommended event
		view.addEventListener("wheel", (e) => this.onWheel(e));
		// Before 2017, IE9, Chrome, Safari, Opera
		view.addEventListener("mousewheel", (e) =>  {
			console.error('Scroll/Zoom: mousewheel (old Chrome, Safari, Opera?)');
			e.preventDefault();
		});
		// Old versions of Firefox
		view.addEventListener("DOMMouseScroll", (e) =>  {
			console.error('Scroll/Zoom: DOM scroll event (old Firefox?)');
			e.preventDefault();
		}); // disable scroll behaviour);

		// for Safari
		view.addEventListener('click', function(e) {
			//if (e.ctrlKey) return;
			e.preventDefault();
		});
		view.addEventListener('contextmenu', function(e) {
			e.preventDefault();
		});

		// new Safari only (probably)
		view.addEventListener('gesturestart', (e) => this.onZoomBegin(e));
		view.addEventListener('gesturechange', (e) => this.onZoom(e));
		view.addEventListener('gestureend', (e) => this.onZoomEnd(e));
	}


	// TODO: optimize for shorter function
	private unregisterEventListeners() {
			this.viewport.interactive = false

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
	}

	destroy() {
			this.unregisterEventListeners();
			this.viewport.removeChild(this);
	}
	
	
	fireEvent(data: EventData, type: EventType) {
		const event = new ScrollViewEvent(data.clone(), type);

		if(data.cancelEvent) {
			event.cancel(); // cancel event
		}

		this.eventListeners.forEach(e => e(event));

		data.cancelEvent = event.cancelEvent; // store within data for later usage
		return event.cancelEvent;
	}


	registerListener(func: (arg: ScrollViewEvent) => void) {
		if(!this.eventListeners.includes(func)) {
			this.eventListeners.push(func);
		}
	}

	unregisterListener(func: (arg: ScrollViewEvent) => void) {
		if(!this.eventListeners.includes(func)) {
			this.eventListeners.splice(this.eventListeners.indexOf(func));
		}
	}

}