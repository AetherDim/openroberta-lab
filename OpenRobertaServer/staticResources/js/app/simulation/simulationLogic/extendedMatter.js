define(["require", "exports", "matter-js"], function (require, exports, matter_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var oldCompositeCreate = matter_js_1.Composite.create;
    matter_js_1.Composite.create = function (options) {
        if (!options) {
            options = {};
        }
        options.test = function () { console.error("Hello World in red"); };
        return oldCompositeCreate(options);
    };
});
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
