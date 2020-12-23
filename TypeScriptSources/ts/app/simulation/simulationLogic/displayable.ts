import { Body } from "matter-js";

export class Displayable {
    displayObject: PIXI.DisplayObject = null;

    x: number = 0;
    y: number = 0;
    rotation: number = 0;

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
