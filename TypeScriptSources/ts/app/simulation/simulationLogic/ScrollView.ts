import { mouse } from 'd3';
import { NONAME } from 'dns';
import './pixijs'



// the following implementation borrowed some ideas from:
// https://github.com/davidfig/pixi-viewport/blob/0aec760f1bdbcb1f9693376a61c041459322d6a0/src/input-manager.js#L168



export enum EventType {
  ZOOM,
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

    cancelScrolling: boolean = false;

    cancel() {
      this.cancelScrolling = true;
    }

    data: EventData;

    /**
     * The event type
     */
    type: EventType;

}

export class EventData {

  constructor(scrollView: ScrollView, isMouse:boolean, pressed:boolean, buttons:boolean[] = [false, false, false, false, false], currentPosition:PIXI.IPointData = null, delta:PIXI.IPointData = null, previousPosition:PIXI.IPointData = null, id:number = 0) {
    this.scrollView = scrollView;
    this.isMouse = isMouse;
    this.buttons = buttons;
    this.id = id;
    this.previousPosition = previousPosition;
    this.currentPosition = currentPosition;
    this.delta = delta;
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
   * currently pressed mouse button with length 5
   * index by MouseButton enum
   */
  buttons: boolean[] = [false, false, false, false, false];

  /**
   * the id of the touch event
   */
  id: number = 0;

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

  clone() {
    return new EventData(this.scrollView, this.isMouse, this.pressed, Object.assign([], this.buttons), cloneVector(this.currentPosition), cloneVector(this.delta), cloneVector(this.previousPosition), this.id);
  }

}

export class ScrollView extends PIXI.Container {

    readonly renderer: PIXI.Renderer;
    readonly viewport: PIXI.Container;
    private customHitArea = new PIXI.Rectangle(0, 0, 0, 0);

    minimalVisibleArea = 0.2;



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
        data = this.touchEventDataMap.get(ev.data.pointerId);
        if(!data) {
          data = new EventData(this, false, true);
          data.id = ev.data.pointerId;
          this.touchEventDataMap.set(ev.data.pointerId, data);
        }
      }

      data.setNewPosition(ev.data.global.clone());
      let cancel: boolean = this.fireEvent(new ScrollViewEvent(data.clone(), EventType.PRESS));

      // TODO: cancel move
        
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
          console.error('touch reale before press!');
          data = new EventData(this, false, false);
          data.id = ev.data.pointerId;
        }
      }

      data.setNewPosition(ev.data.global.clone());
      let cancel: boolean = this.fireEvent(new ScrollViewEvent(data.clone(), EventType.RELEASE));

      // TODO: cancel move

    }

    private onMove(ev: PIXI.InteractionEvent) {
      // console.log('move');

      let data: EventData;

      if(ev.data.pointerType == 'mouse') {
        data = this.mouseEventData;
      
      } else {
        data = this.touchEventDataMap.get(ev.data.pointerId);
        if(!data) {
          data = new EventData(this, false, false);
          data.id = ev.data.pointerId;
          this.touchEventDataMap.set(ev.data.pointerId, data);
        }
      }

      data.setNewPosition(ev.data.global.clone());

      if(data.previousPosition) {
        data.delta = {
          x: data.previousPosition.x-data.currentPosition.x,
          y: data.previousPosition.y-data.currentPosition.y
        };
      } else {
        data.delta = {x: 0, y: 0};
      }
      
      let type: EventType;

      if(data.pressed) {
        type = EventType.DRAG;
      } else {
        type = EventType.MOVE;
      }

      let cancel: boolean = this.fireEvent(new ScrollViewEvent(data.clone(), type));

      // TODO: cancel move
      // TODO: change condition
      if(!cancel && data.pressed) {

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

    ctx = {
      global: { x: 0, y: 0} // store it inside closure to avoid GC pressure
    };


    private onWheel(ev: WheelEvent) {
      // https://github.com/anvaka/ngraph/blob/master/examples/pixi.js/03%20-%20Zoom%20And%20Pan/globalInput.js
      
      this.ctx.global.x = ev.clientX; this.ctx.global.y = ev.clientY;
      let point = PIXI.InteractionData.prototype.getLocalPosition.call(this.ctx, this.viewport);

      console.log(point);

      ev.preventDefault(); // disable scroll behaviour
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

        this.renderer.view.addEventListener('wheel', (e) => this.onWheel(e))
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

        this.renderer.view.removeEventListener('wheel', (e) => this.onWheel(e))
    }

    destroy() {
        this.unregisterEventListeners();
        this.viewport.removeChild(this);
    }
    
    
    fireEvent(event: ScrollViewEvent) {
      this.eventListeners.forEach(e => e(event));
      return event.cancelScrolling;
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