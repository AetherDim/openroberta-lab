import { color } from "d3";
import { contains } from "jquery";
import { Body, Bodies, Vertices, Vector } from "matter-js";
import { ColorPalette } from "./color";

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

    texture?: PIXI.Texture;
    color?: number = 0xFFFFFF;
    alpha?: number = 1;
    strokeColor?: number = 0x000000;
    strokeAlpha?: number = 1;
    strokeWidth?: number = 2;

}


const colorPalette = new ColorPalette();


export function createDisplayableFromBody(body: Body, settings?: DisplaySettings) {

    if(!settings) {
        settings = {
            alpha: 0.5,
            color: colorPalette.next().toInt(),
            strokeColor: parseInt('FFFFFF', 16),
            strokeAlpha: 1,
            strokeWidth: 2,
        }
    }

    const container = new PIXI.Container();

    var graphics = new PIXI.Graphics();

    graphics.lineStyle(settings.strokeWidth, settings.strokeColor, settings.strokeAlpha);
    graphics.beginFill(settings.color, settings.alpha);

    var vertices = body.vertices;
    vertices = vertices.map(e => Vector.sub(e, body.position));

    graphics.moveTo(vertices[0].x, vertices[0].y);

    for (var j = 1; j < vertices.length; j += 1) {
        graphics.lineTo(vertices[j].x, vertices[j].y);
    }

    graphics.lineTo(vertices[0].x, vertices[0].y);

    graphics.endFill();

    container.addChild(graphics);


    // center
    graphics = new PIXI.Graphics();

    graphics.beginFill(settings.strokeColor, settings.alpha);
    graphics.drawRect(0, 0, 10, 10);
    graphics.endFill();

    container.addChild(graphics);

    const text = new PIXI.Text("ID: " + body.id);
    container.addChild(text);

    const displayable = new Displayable(container);

    //displayable.x = body.position.x;
    //displayable.y = body.position.y;

    return displayable;
}


export function createRect(x: number, y: number, width: number, height: number, roundingAngle: number = 0, settings: DisplaySettings = {}) {

    const graphics = new PIXI.Graphics();

    graphics.lineStyle(settings.strokeWidth, settings.strokeColor, settings.strokeAlpha);
    graphics.beginFill(settings.color, settings.alpha);
    graphics.drawRoundedRect(-width/2, -height/2, width, height, roundingAngle);
    graphics.endFill();


    var displayable = new Displayable(graphics);

    return Bodies.rectangle(x, y, width, height, {displayable: displayable});
}

export function createCircle(x: number, y: number, radius: number, settings: DisplaySettings = {}) {

    const graphics = new PIXI.Graphics();

    graphics.lineStyle(settings.strokeWidth, settings.strokeColor, settings.strokeAlpha);
    graphics.beginFill(settings.color, settings.alpha);
    graphics.drawCircle(x, y, radius);
    graphics.endFill();

    var displayable = new Displayable(graphics);

    return Bodies.circle(x, y, radius, {displayable: displayable});
}

export function createPoligon(x: number, y: number, radius: number, settings: DisplaySettings = {}) {

    const graphics = new PIXI.Graphics();

    graphics.lineStyle(settings.strokeWidth, settings.strokeColor, settings.strokeAlpha);
    graphics.beginFill(settings.color, settings.alpha);
    graphics.drawCircle(x, y, radius);
    graphics.endFill();

    var displayable = new Displayable(graphics);


    //return Bodies.polygon(settings.x, settings.y, width, height, {displayable: displayable});


}