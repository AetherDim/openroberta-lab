define(["require", "exports", "matter-js"], function (require, exports, matter_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Entity = void 0;
    var oldSetAngle = matter_js_1.Body.setAngle;
    matter_js_1.Body.setAngle = function (body, angle) {
        if (body.displayObject) {
        }
    };
    var Entity = /** @class */ (function () {
        function Entity() {
        }
        return Entity;
    }());
    exports.Entity = Entity;
});
