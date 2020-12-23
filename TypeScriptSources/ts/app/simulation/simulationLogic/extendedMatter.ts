import { Composite, Constraint, Vector, Body, World, ICompositeDefinition } from "matter-js";
import { Displayable } from "./displayable";

declare module "matter-js" {
    export interface Body {
        displayable?: Displayable;
    }

    export interface IBodyDefinition {
        displayable?: Displayable;
    }

    export interface ICompositeDefinition {
        test?: () => void;
    }

    export interface Composite {
        test?: () => void;
    }

}

const oldCompositeCreate = Composite.create;
Composite.create = (options?: ICompositeDefinition) => {

    if(!options) {
        options = {};
    }

    options.test = () => {console.error("Hello World in red")};
    return oldCompositeCreate(options);
}

/*
// TODO: could be removed
const oldSetAngle = Body.setAngle;
Body.setAngle = (body: Body, angle: number) => {
    if(body.displayable) {
        body.displayable.setRotation(angle);
    }
    oldSetAngle(body, angle);
}

const oldSetPosition = Body.setPosition;
Body.setPosition = (body: Body, position: Vector) => {
    if(body.displayable) {
        body.displayable.setPosition(position.x, position.y);
    }
    oldSetPosition(body, position);
}
*/