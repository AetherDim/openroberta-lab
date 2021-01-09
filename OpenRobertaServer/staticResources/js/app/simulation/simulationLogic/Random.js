define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.randomWeightedBool = exports.randomBool = exports.randomIntBetween = void 0;
    function randomIntBetween(start, stop) {
        return Math.floor(Math.random() * Math.floor(stop - start + 1)) + start;
    }
    exports.randomIntBetween = randomIntBetween;
    function randomBool() {
        return Math.random() >= 0.5;
    }
    exports.randomBool = randomBool;
    function randomWeightedBool(a, b) {
        return Math.random() < a / (a + b);
    }
    exports.randomWeightedBool = randomWeightedBool;
});
