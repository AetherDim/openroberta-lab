import { Body, Bodies, Vertices } from "matter-js";

export class Displayable {
    displayObject: PIXI.DisplayObject = null;

    x: number = 0;
    y: number = 0;
    rotation: number = 0;

    constructor(displayObject: PIXI.DisplayObject, x: number = 0, y: number = 0, rotation: number = 0) {
        this.displayObject = displayObject;
        this.x = x;
        this.y = y;
        this.rotation = rotation;
    }

    setPosition(x: number, y: number) {
        this.displayObject.x = x-this.x;
        this.displayObject.y = y-this.x;
    }

    setRotation(rotation: number) {
        this.displayObject.rotation = rotation-this.rotation;
    }

    setVisible(visible: boolean) {
        this.displayObject.visible = visible;
    }

    setOrigin(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    setOriginRotation(rotation: number) {
        this.rotation = rotation;
    }

    // TODO: optimize?
    update(x: number, y: number, rotation: number) {
        this.setPosition(x, y);
        this.setRotation(rotation);
    }

    updateFromBody(body: Body) {
        this.setPosition(body.position.x, body.position.y);
        this.setRotation(body.angle);
    }

}


export abstract class DisplaySettings {

    x: number;
    y: number;

    texture?: PIXI.Texture;
    color?: number = 0xFFFFFF;
    alpha?: number = 1;
    strokeColor?: number = 0x000000;
    strokeAlpha?: number = 1;
    strokeWidth?: number = 2;

}


export function createRect(settings: DisplaySettings, width: number, height: number, roundingAngle: number=0) {

    const graphics = new PIXI.Graphics();

    graphics.lineStyle(settings.strokeWidth, settings.strokeColor, settings.strokeAlpha);
    graphics.beginFill(settings.color, settings.alpha);
    graphics.drawRoundedRect(settings.x, settings.y, width, height, roundingAngle);
    graphics.endFill();


    var displayable = new Displayable(graphics);

    return Bodies.rectangle(settings.x, settings.y, width, height, {displayable: displayable});
}

export function createCircle(settings: DisplaySettings, radius: number) {

    const graphics = new PIXI.Graphics();

    graphics.lineStyle(settings.strokeWidth, settings.strokeColor, settings.strokeAlpha);
    graphics.beginFill(settings.color, settings.alpha);
    graphics.drawCircle(settings.x, settings.y, radius);
    graphics.endFill();

    var displayable = new Displayable(graphics);

    return Bodies.circle(settings.x, settings.y, radius, {displayable: displayable});
}

export function createPoligon(settings: DisplaySettings, radius: number) {

    const graphics = new PIXI.Graphics();

    graphics.lineStyle(settings.strokeWidth, settings.strokeColor, settings.strokeAlpha);
    graphics.beginFill(settings.color, settings.alpha);
    graphics.drawCircle(settings.x, settings.y, radius);
    graphics.endFill();

    var displayable = new Displayable(graphics);


    //return Bodies.polygon(settings.x, settings.y, width, height, {displayable: displayable});


}

