define(["require", "exports", "./pixijs"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Scene = void 0;
    var Scene = /** @class */ (function () {
        function Scene() {
        }
        Scene.prototype.prePhysicsSim = function () {
        };
        Scene.prototype.postPhysicsSim = function () {
        };
        Scene.prototype.getEntities = function () {
            return [];
        };
        return Scene;
    }());
    exports.Scene = Scene;
});
