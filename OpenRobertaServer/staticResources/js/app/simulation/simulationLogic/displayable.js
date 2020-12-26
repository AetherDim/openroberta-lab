define(["require", "exports", "matter-js", "./color"], function (require, exports, matter_js_1, color_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createPoligon = exports.createCircle = exports.createRect = exports.createDisplayableFromBody = exports.DisplaySettings = exports.Displayable = void 0;
    var Displayable = /** @class */ (function () {
        function Displayable(displayObject, x, y, rotation) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (rotation === void 0) { rotation = 0; }
            this.displayObject = null;
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.displayObject = displayObject;
            this.x = x;
            this.y = y;
            this.rotation = rotation;
        }
        Displayable.prototype.setPosition = function (x, y) {
            this.displayObject.x = x - this.x;
            this.displayObject.y = y - this.x;
        };
        Displayable.prototype.setRotation = function (rotation) {
            this.displayObject.rotation = rotation - this.rotation;
        };
        Displayable.prototype.setVisible = function (visible) {
            this.displayObject.visible = visible;
        };
        Displayable.prototype.setOrigin = function (x, y) {
            this.x = x;
            this.y = y;
        };
        Displayable.prototype.setOriginRotation = function (rotation) {
            this.rotation = rotation;
        };
        // TODO: optimize?
        Displayable.prototype.update = function (x, y, rotation) {
            this.setPosition(x, y);
            this.setRotation(rotation);
        };
        Displayable.prototype.updateFromBody = function (body) {
            this.setPosition(body.position.x, body.position.y);
            this.setRotation(body.angle);
        };
        return Displayable;
    }());
    exports.Displayable = Displayable;
    var DisplaySettings = /** @class */ (function () {
        function DisplaySettings() {
            this.color = 0xFFFFFF;
            this.alpha = 1;
            this.strokeColor = 0x000000;
            this.strokeAlpha = 1;
            this.strokeWidth = 2;
        }
        return DisplaySettings;
    }());
    exports.DisplaySettings = DisplaySettings;
    var colorPalette = new color_1.ColorPalette();
    function createDisplayableFromBody(body, settings) {
        if (!settings) {
            settings = {
                alpha: 0.5,
                color: colorPalette.next().toInt(),
                strokeColor: parseInt('FFFFFF', 16),
                strokeAlpha: 1,
                strokeWidth: 2,
            };
        }
        var container = new PIXI.Container();
        var graphics = new PIXI.Graphics();
        graphics.lineStyle(settings.strokeWidth, settings.strokeColor, settings.strokeAlpha);
        graphics.beginFill(settings.color, settings.alpha);
        var vertices = body.vertices;
        vertices = vertices.map(function (e) { return matter_js_1.Vector.sub(e, body.position); });
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
        var text = new PIXI.Text("ID: " + body.id);
        container.addChild(text);
        var displayable = new Displayable(container);
        //displayable.x = body.position.x;
        //displayable.y = body.position.y;
        return displayable;
    }
    exports.createDisplayableFromBody = createDisplayableFromBody;
    function createRect(x, y, width, height, roundingAngle, settings) {
        if (roundingAngle === void 0) { roundingAngle = 0; }
        if (settings === void 0) { settings = {}; }
        var graphics = new PIXI.Graphics();
        graphics.lineStyle(settings.strokeWidth, settings.strokeColor, settings.strokeAlpha);
        graphics.beginFill(settings.color, settings.alpha);
        graphics.drawRoundedRect(-width / 2, -height / 2, width, height, roundingAngle);
        graphics.endFill();
        var displayable = new Displayable(graphics);
        return matter_js_1.Bodies.rectangle(x, y, width, height, { displayable: displayable });
    }
    exports.createRect = createRect;
    function createCircle(x, y, radius, settings) {
        if (settings === void 0) { settings = {}; }
        var graphics = new PIXI.Graphics();
        graphics.lineStyle(settings.strokeWidth, settings.strokeColor, settings.strokeAlpha);
        graphics.beginFill(settings.color, settings.alpha);
        graphics.drawCircle(x, y, radius);
        graphics.endFill();
        var displayable = new Displayable(graphics);
        return matter_js_1.Bodies.circle(x, y, radius, { displayable: displayable });
    }
    exports.createCircle = createCircle;
    function createPoligon(x, y, radius, settings) {
        if (settings === void 0) { settings = {}; }
        var graphics = new PIXI.Graphics();
        graphics.lineStyle(settings.strokeWidth, settings.strokeColor, settings.strokeAlpha);
        graphics.beginFill(settings.color, settings.alpha);
        graphics.drawCircle(x, y, radius);
        graphics.endFill();
        var displayable = new Displayable(graphics);
        //return Bodies.polygon(settings.x, settings.y, width, height, {displayable: displayable});
    }
    exports.createPoligon = createPoligon;
});
