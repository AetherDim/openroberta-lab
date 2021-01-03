import { ZoomControls } from 'blockly';
import { mouse } from 'd3';
import { NONAME } from 'dns';
import { IPointData } from 'pixi.js';
import './pixijs'


// https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
export function getBrowser() {
  var ua = navigator.userAgent, tem, 
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return {name:'IE',version:(tem[1] || '')};
    }
    if(M[1]=== 'Chrome'){
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem != null) return {name:tem[1].replace('OPR', 'Opera'),version:tem[2]};
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
    
    return {name:M[0], version:M[1], versionID:id};
}



// the following implementation borrowed some ideas from:
// https://github.com/davidfig/pixi-viewport/blob/0aec760f1bdbcb1f9693376a61c041459322d6a0/src/input-manager.js#L168



export enum EventType {
  ZOOM, // z-direction
  SCROLL, // x/y-direction
  MOVE,
  PRESS,
  RELEASE,
  DRAG,
  NONE
}

export enum MouseButton {
  LEFT = 0,
  WHEEL = 1,
  RIGHT = 2,
  BACK = 3,
  FORWARD = 4
}

export function cloneVector(vec: PIXI.IPointData) {
  if(!vec) {
    return null;
  }
  return {x: vec.x, y: vec.y};
}

export class ScrollViewEvent {

  constructor(data: EventData, type: EventType) {
    this.data = data;
    this.type = type;
  }

  cancelEvent: boolean = false;

  cancel() {
    this.cancelEvent = true;
    this.data.cancelEvent = true;
  }

  data: EventData;

  /**
   * The event type
   */
  type: EventType;

}

export class EventData {

  constructor(scrollView: ScrollView, isMouse:boolean, pressed:boolean) {
    this.scrollView = scrollView;
    this.isMouse = isMouse;
    this.pressed = pressed;
  }

  /**
   * The event source
   */
  scrollView: ScrollView;

  /**
   * whether this is a mouse event or a touch event
   */
  isMouse: boolean = false;

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
   * (Will only happen while dragging with more than one finger)
   */
  isMergeTouchEvent: boolean = false;

  /**
   * currently pressed mouse button with length 5
   * index by MouseButton enum
   */
  buttons: boolean[] = [false, false, false, false, false];

  /**
   * the id of the touch event
   */
  id: number = -1;

  /**
   * previous position, only availible from some events (MOVE, RELEASE, DRAG)
   */
  previousPosition: PIXI.IPointData = null;

  /**
   * Event location
   */
  currentPosition: PIXI.IPointData = null;

  /**
   * Contains delta information for mouse move, zoom and scroll
   */
  delta: PIXI.IPointData = null;

  /**
   * Delta zoom scale
   */
  deltaZoom: number = 1;

  /**
   * whether the touch or any mouse button is "down"
   */
  pressed: boolean = false;

  isLeftButtonPressed() {
    return this.buttons[MouseButton.LEFT];
  }

  isMiddleButtonPressed() {
    return this.buttons[MouseButton.WHEEL];
  }

  isRightButtonPressed() {
    return this.buttons[MouseButton.RIGHT];
  }

  setNewPosition(position: PIXI.IPointData) {
    this.previousPosition = this.currentPosition;
    this.currentPosition = position;
  }

  isAnyButtonPressed() {
    return this.buttons.includes(true);
  }

  getCurrentLocalPosition(): PIXI.IPointData {
    return this.scrollView.toLocal(this.currentPosition);
  }

  getPreviousLocalPosition(): PIXI.IPointData {
    return this.scrollView.toLocal(this.previousPosition);
  }

  getDeltaLocal() {
    return this.scrollView.toLocal(this.delta);
  }

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

  clone() {
    const event = new EventData(this.scrollView, this.isMouse, this.pressed);

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
  }

}

export class ScrollView extends PIXI.Container {

    readonly renderer: PIXI.Renderer;
    readonly viewport: PIXI.Container;
    private customHitArea = new PIXI.Rectangle(0, 0, 0, 0);

    minimalVisibleArea = 0.2;

    readonly browser = getBrowser();



    //
    // Event Data
    //
    private mouseEventData: EventData = new EventData(this, true, false);
    private touchEventDataMap = new Map<number, EventData>();


    private eventListeners: Array<(arg: ScrollViewEvent) => void> = [];


    constructor(viewport: PIXI.Container, renderer: PIXI.Renderer) {
        super();

        viewport.addChild(this);

        this.viewport = viewport;
        this.renderer = renderer;
        this.viewport.hitArea = this.customHitArea;

        this.updateInteractionRect();
        this.registerEventListeners();
    }

    /**
     * update hitbox for mouse interactions
     */
    private updateInteractionRect() {
        this.customHitArea.width = this.renderer.screen.width;
        this.customHitArea.height = this.renderer.screen.height;
    }

    private onResize() {
        this.updateInteractionRect();
    }



    private onDown(ev: PIXI.InteractionEvent) {
      //console.log('down');

      let data: EventData;

      if(ev.data.pointerType == 'mouse') {
        data = this.mouseEventData;
        data.pressed = true;
        data.buttons[ev.data.button] = true;
      } else {
        data = this.getTouchData(ev.data.pointerId);
        data.pressed = true;
      }

      data.setNewPosition(ev.data.global.clone());
      let cancel: boolean = this.fireEvent(data, EventType.PRESS);

      // ignore cancel (cancelEvent ist stored within the object)
        
    }

    /**
     * Warning: this will create a new object if no object with this ID exists!!!
     * @param id id of the touch
     */
    private getTouchData(id: number): EventData {
      let data = this.touchEventDataMap.get(id);
      if(!data) {
        data = new EventData(this, false, false);
        data.id = id;
        this.touchEventDataMap.set(id, data);
      }
      return data;
    }

    private onUp(ev: PIXI.InteractionEvent) {
      //console.log('up');
      
      let data: EventData;

      if(ev.data.pointerType == 'mouse') {
        data = this.mouseEventData;
        data.buttons[ev.data.button] = false;
        data.pressed = data.isAnyButtonPressed();
      
      } else {
        data = this.touchEventDataMap.get(ev.data.pointerId);
        if(data) {
          this.touchEventDataMap.delete(ev.data.pointerId);
        } else {
          // This should not happen
          console.error('touch released before press!');
          data = new EventData(this, false, false);
          data.id = ev.data.pointerId;
        }
      }

      data.setNewPosition(ev.data.global.clone());
      let cancel: boolean = this.fireEvent(data, EventType.RELEASE);

       // ignore cancel (cancelEvent ist stored within the object)

       data.cancelEvent = false; // reset cancel event flag

    }

    private onMove(ev: PIXI.InteractionEvent) {
      // console.log('move');

      let data: EventData;
      let type: EventType;
      let cancel: boolean;
      let noDrag = false;

      if(ev.data.pointerType == 'mouse') {
        data = this.mouseEventData;

        if(data.pressed) {
          type = EventType.DRAG;
        } else {
          type = EventType.MOVE;
        }
  
        data.setNewPosition(ev.data.global.clone());
        data.updateDelta();

        cancel = this.fireEvent(data, type);

      } else { // touch
        //console.log("id: " + ev.data.pointerId);

        data = this.getTouchData(ev.data.pointerId);
        data.setNewPosition(ev.data.global.clone()); // update position
        data.updateDelta();
        data.eventFired = true;

        type = EventType.DRAG; // move should be impossible (except stylus?)

        cancel = this.fireEvent(data, type);
        // ignore cancel for this call


        let allEventFired = true;

        this.touchEventDataMap.forEach((data: EventData, id: number, map: Map<number, EventData>) => {
          if(!data.eventFired) {
            allEventFired = false;
          }
        });

        if(allEventFired) {

          let previousPosition: PIXI.IPointData = {x: 0, y: 0};
          let currentPosition: PIXI.IPointData = {x: 0, y: 0};
          let oneCacelled = false;

          this.touchEventDataMap.forEach((data: EventData, id: number, map: Map<number, EventData>) => {
            if(data.previousPosition) {
              // ignore incomplete touch events
              previousPosition.x += data.previousPosition.x;
              previousPosition.y += data.previousPosition.y;
              currentPosition.x += data.currentPosition.x;
              currentPosition.y += data.currentPosition.y;
            }
            data.eventFired = false; // reset all events fired
            oneCacelled ||= data.cancelEvent;
          });

          let numOfTouches = this.touchEventDataMap.size;
          previousPosition.x /= numOfTouches;
          previousPosition.y /= numOfTouches;
          currentPosition.x /= numOfTouches;
          currentPosition.y /= numOfTouches;


          data = new EventData(this, false, true);
          data.previousPosition = previousPosition;
          data.currentPosition = currentPosition;
          data.isMergeTouchEvent = true;
          data.cancelEvent = oneCacelled; // whether this event is already cancelled
          data.updateDelta();

          cancel = this.fireEvent(data, type);

          if(this.touchEventDataMap.size == 2) { // zoom mode

            let touches = this.touchEventDataMap.values();
            let touch1:EventData = touches.next().value;
            let touch2:EventData = touches.next().value;
  
            if(!touch1 || !touch2) {
              console.error('Touch is null!');
            } else {
  
              let pp1 = touch1.previousPosition;
              let pp2 = touch2.previousPosition;
              if(pp1 && pp2) {
                let previousLength = Math.sqrt(Math.pow(pp1.x-pp2.x, 2) + Math.pow(pp1.y-pp2.y, 2));
  
                let cp1 = touch1.currentPosition;
                let cp2 = touch2.currentPosition;
                let currentLength = Math.sqrt(Math.pow(cp1.x-cp2.x, 2) + Math.pow(cp1.y-cp2.y, 2));
  
                let deltaZoom = currentLength-previousLength;
  
                let pixelRatio = this.getPixelRatio(); 
                let zoomFactor = Math.exp(deltaZoom / pixelRatio / 150); // 150 is good feeling magic number
  
                data.deltaZoom = zoomFactor;
                let cancelZoom =  this.fireEvent(data, EventType.ZOOM);
  
                if(!cancel && !cancelZoom) {
                  //console.log('zoom: ' + zoomFactor);
                  this.zoom(zoomFactor, data.currentPosition);
                }
              } else {
                console.error('previous position is null');
              }
            }
  
          }
        }
        
        noDrag = !allEventFired;
        
      }

      


      if(!cancel && type == EventType.DRAG && !noDrag) {
        // move view to new position and check bounds
        this.x -= data.delta.x;
        this.y -= data.delta.y;

        let visible = 1-this.minimalVisibleArea;
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
        }

      }

    }

    private getPixelRatio() {
      return window.devicePixelRatio || 0.75; // 0.75 is default for old browsers
    }

    private onWheel(ev: WheelEvent) {
      //console.log('wheel');

      let pixelRatio = this.getPixelRatio(); 

      let data: EventData;

      if (ev.type == "wheel") {

        let type: EventType;

        data = this.mouseEventData;

        // calculate mouse position
        let rect = this.renderer.view.getBoundingClientRect();
        data.setNewPosition({x: ev.clientX - rect.x, y: ev.clientY - rect.y});
      
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
              zoomFactor = Math.exp(delta * 12 / pixelRatio / -50); // -50 is good feeling magic number
            } else {
              zoomFactor = Math.exp(delta * 12 / pixelRatio / 150); // 150 is good feeling magic number
            }
            break;
          case WheelEvent.DOM_DELTA_PAGE:
            console.warn('Delta page scrolling is not implemented!'); // ignore
            break;
          case WheelEvent.DOM_DELTA_PIXEL:
              if(ev.ctrlKey) {
                zoomFactor = Math.exp(delta / pixelRatio / -50); // -50 is good feeling magic number
              } else {
                zoomFactor = Math.exp(delta / pixelRatio / 150); // 150 is good feeling magic number
              }
            break;
        
          default:
            console.error('Unknown mouse wheel delta mode!');
            break;
        }

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


    zoom(delta: number, pos: PIXI.IPointData) {
      this.x = (this.x - pos.x) * delta + pos.x;
      this.y = (this.y - pos.y) * delta + pos.y;
      
      this.scale.x *= delta;
      this.scale.y *= delta;
    }


    private lastZoom = -1;

    private onZoom(e) {
      console.log('zoom');

      if(this.browser.name == 'Safari') {

        if(this.lastZoom > 0) {

          // calculate distance change between fingers
          var delta = Math.pow(e.scale/this.lastZoom, 1.5); // magic 2 for better scroll feeling
          this.mouseEventData.delta.x = delta;
    
          this.lastZoom = <number>e.scale;

          let cancel: boolean = this.fireEvent(this.mouseEventData, EventType.ZOOM);

          if(!cancel) {
            this.zoom(delta, this.mouseEventData.currentPosition);
          }

        } else {
          console.log('Zoom from non Safari browser!');
        }
      }

      e.preventDefault();
    }

    private onZoomBegin(e) {
      this.lastZoom = e.scale;
      e.preventDefault();
    }

    private onZoomEnd(e) {
      this.lastZoom = -1;
      e.preventDefault();
    }

    private registerEventListeners() {
        this.viewport.interactive = true

        this.renderer.on('resize', this.onResize, this);

        this.viewport.on('pointerdown', this.onDown, this);
        this.viewport.on('pointermove', this.onMove, this);
        this.viewport.on('pointerup', this.onUp, this);
        this.viewport.on('pointerupoutside', this.onUp, this);
        this.viewport.on('pointercancel', this.onUp, this);
        this.viewport.on('pointerout', this.onUp, this);

        
        // 2017 recommended event
        this.renderer.view.addEventListener("wheel", (e) => this.onWheel(e));
        // Before 2017, IE9, Chrome, Safari, Opera
        this.renderer.view.addEventListener("mousewheel", (e) =>  {
          console.error('Scroll/Zoom: mousewheel (old Chrome, Safari, Opera?)');
          e.preventDefault();
        });
        // Old versions of Firefox
        this.renderer.view.addEventListener("DOMMouseScroll", (e) =>  {
          console.error('Scroll/Zoom: DOM scroll event (old Firefox?)');
          e.preventDefault();
        }); // disable scroll behaviour);

        // new Safari only (probably)
        this.renderer.view.addEventListener('gesturestart', (e) => this.onZoomBegin(e));
        this.renderer.view.addEventListener('gesturechange', (e) => this.onZoom(e));
        this.renderer.view.addEventListener('gestureend', (e) => this.onZoomEnd(e));
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

        // TODO: other events
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

      data.cancelEvent = event.cancelEvent; // store within event for later usage
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