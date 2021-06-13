var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "../Entity"], function (require, exports, Entity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Waypoint = void 0;
    /**
     * A waypoint with a position and maximum distance to reach it.
     * By default it is added to the `topContainer`.
     */
    var Waypoint = /** @class */ (function (_super) {
        __extends(Waypoint, _super);
        /**
         * Creates a Waypoint at the specified `position` which is by default visible.
         *
         * @param scene The `Scene` in which the waypoint will be placed
         * @param position The position of the waypoint in meters
         * @param maxDistance The maximum distance to reach the waypoint in meters
         *
         * @see this.graphics where you can change the graphics
         */
        function Waypoint(scene, position, maxDistance) {
            var _this = this;
            var pos = scene.unit.getPosition(position);
            var radius = scene.unit.getLength(maxDistance);
            var graphics = new PIXI.Graphics();
            _this = _super.call(this, scene, graphics) || this;
            _this.graphics = graphics;
            _this.position = pos;
            _this.maxDistance = radius;
            _this.updateGraphics();
            return _this;
        }
        /**
         * Set `maxDistance` and updates the graphics
         */
        Waypoint.prototype.setMaxDistanceInMatterUnits = function (distance) {
            this.maxDistance = distance;
            this.updateGraphics();
        };
        Waypoint.prototype.updateGraphics = function () {
            this.graphics
                .clear()
                .lineStyle(4, 0x0000FF)
                .beginFill(undefined, 0)
                .drawCircle(this.position.x, this.position.y, this.maxDistance)
                .endFill();
        };
        Waypoint.prototype.getContainer = function () {
            return this.getScene().containerManager.topContainer;
        };
        Waypoint.prototype.clone = function () {
            var scene = this.getScene();
            return new Waypoint(scene, scene.unit.fromPosition(this.position), scene.unit.fromLength(this.maxDistance));
        };
        return Waypoint;
    }(Entity_1.DrawableEntity));
    exports.Waypoint = Waypoint;
});
