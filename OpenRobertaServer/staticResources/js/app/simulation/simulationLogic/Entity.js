var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
define(["require", "exports", "matter-js", "./Util"], function (require, exports, matter_js_1, Util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PhysicsRectEntity = exports.RectEntityOptions = exports.DrawSettings = exports.DrawablePhysicsEntity = exports.Type = exports.Meta = void 0;
    var Meta = /** @class */ (function () {
        function Meta(name) {
            this.name = name;
        }
        Meta.prototype.isSupertypeOf = function (value) {
            if (this.name in value) {
                return true;
            }
            return false;
        };
        return Meta;
    }());
    exports.Meta = Meta;
    var Type = /** @class */ (function () {
        function Type() {
        }
        Type.IEntity = new Meta("IEntity");
        Type.IUpdatableEntity = new Meta("IUpdatableEntity");
        Type.IDrawableEntity = new Meta("IDrawableEntity");
        Type.IPhysicsEntity = new Meta("IPhysicsEntity");
        Type.IPhysicsCompositeEntity = new Meta("IPhysicsCompositeEntity");
        Type.IDrawablePhysicsEntity = new Meta("IDrawablePhysicsEntity");
        Type.IContainerEntity = new Meta("IContainerEntity");
        return Type;
    }());
    exports.Type = Type;
    var DrawablePhysicsEntity = /** @class */ (function () {
        function DrawablePhysicsEntity(scene, drawable) {
            this.scene = scene;
            this.drawable = drawable;
        }
        DrawablePhysicsEntity.prototype.IEntity = function () { };
        DrawablePhysicsEntity.prototype.getScene = function () {
            return this.scene;
        };
        DrawablePhysicsEntity.prototype.getParent = function () {
            return this.parent;
        };
        DrawablePhysicsEntity.prototype._setParent = function (parent) {
            this.parent = parent;
        };
        DrawablePhysicsEntity.prototype.IDrawablePhysicsEntity = function () { };
        DrawablePhysicsEntity.prototype.updateDrawablePosition = function () {
            this.drawable.position.copyFrom(this.getPhysicsBody().position);
            this.drawable.rotation = this.getPhysicsBody().angle;
        };
        DrawablePhysicsEntity.prototype.IDrawableEntity = function () { };
        DrawablePhysicsEntity.prototype.getDrawable = function () {
            return this.drawable;
        };
        DrawablePhysicsEntity.prototype.IPhysicsEntity = function () { };
        DrawablePhysicsEntity.prototype.getPhysicsObject = function () {
            return this.getPhysicsBody();
        };
        return DrawablePhysicsEntity;
    }());
    exports.DrawablePhysicsEntity = DrawablePhysicsEntity;
    //
    //
    //
    var DrawSettings = /** @class */ (function () {
        function DrawSettings() {
            this.color = 0xFFFFFF;
            this.alpha = 1;
        }
        return DrawSettings;
    }());
    exports.DrawSettings = DrawSettings;
    //
    // Specialized Entities
    //
    var RectEntityOptions = /** @class */ (function (_super) {
        __extends(RectEntityOptions, _super);
        function RectEntityOptions() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.roundingRadius = 0;
            _this.relativeToCenter = true;
            _this.physics = {};
            return _this;
        }
        return RectEntityOptions;
    }(DrawSettings));
    exports.RectEntityOptions = RectEntityOptions;
    var PhysicsRectEntity = /** @class */ (function (_super) {
        __extends(PhysicsRectEntity, _super);
        function PhysicsRectEntity(scene, x, y, width, height, drawable, opts) {
            var _this = _super.call(this, scene, drawable) || this;
            if (opts === null || opts === void 0 ? void 0 : opts.relativeToCenter) {
                x += width / 2;
                y += height / 2;
            }
            _this.body = matter_js_1.Bodies.rectangle(x, y, width, height, opts === null || opts === void 0 ? void 0 : opts.physics);
            return _this;
        }
        PhysicsRectEntity.prototype.getPhysicsBody = function () {
            return this.body;
        };
        PhysicsRectEntity.createGraphics = function (x, y, width, height, opts) {
            var options = Util_1.Util.getOptions(RectEntityOptions, opts);
            if (!options.relativeToCenter) {
                x += width / 2;
                y += height / 2;
            }
            var graphics = new PIXI.Graphics();
            graphics.lineStyle(options.strokeWidth, options.strokeColor, options.strokeAlpha);
            graphics.beginFill(options.color, options.alpha);
            graphics.drawRoundedRect(-width / 2, -height / 2, width, height, options.roundingRadius);
            graphics.endFill();
            return graphics;
        };
        PhysicsRectEntity.create = function (scene, x, y, width, height, opts) {
            var _a;
            _a = __read(scene.unit.getLengths([x, y, width, height]), 4), x = _a[0], y = _a[1], width = _a[2], height = _a[3];
            var graphics = PhysicsRectEntity.createGraphics(x, y, width, height, opts);
            return new PhysicsRectEntity(scene, x, y, width, height, graphics, opts);
        };
        PhysicsRectEntity.createWithContainer = function (scene, x, y, width, height, opts) {
            var _a;
            _a = __read(scene.unit.getLengths([x, y, width, height]), 4), x = _a[0], y = _a[1], width = _a[2], height = _a[3];
            var graphics = PhysicsRectEntity.createGraphics(x, y, width, height, opts);
            var container = new PIXI.Container();
            container.addChild(graphics);
            return new PhysicsRectEntity(scene, x, y, width, height, graphics, opts);
        };
        PhysicsRectEntity.createTexture = function (scene, x, y, texture, alpha, relativeToCenter, bodyOptions) {
            if (relativeToCenter === void 0) { relativeToCenter = false; }
            return new PhysicsRectEntity(scene, x, y, texture.width, texture.height, new PIXI.DisplayObject(), { physics: bodyOptions });
            // TODO
        };
        return PhysicsRectEntity;
    }(DrawablePhysicsEntity));
    exports.PhysicsRectEntity = PhysicsRectEntity;
});
