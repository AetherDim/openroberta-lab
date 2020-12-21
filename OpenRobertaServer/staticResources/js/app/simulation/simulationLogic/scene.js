define(["require", "exports", "jquery", "matter-js", "./pixijs", "./util"], function (require, exports, $, matter) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Scene = void 0;
    var Engine = matter.Engine;
    var Render = matter.Render;
    var World = matter.World;
    var Bodies = matter.Bodies;
    // https://stackoverflow.com/questions/13070054/convert-rgb-strings-to-hex-in-javascript
    function rgbToNumber(rgb) {
        var raw = rgb.split("(")[1].split(")")[0];
        var numbers = raw.split(',');
        var hexnumber = '0x' + parseInt(numbers[0]).toString(16) + parseInt(numbers[1]).toString(16) + parseInt(numbers[2]).toString(16);
        return parseInt(hexnumber, 16);
    }
    var Scene = /** @class */ (function () {
        function Scene(engine) {
            var _this = this;
            this.engine = engine;
            $('#blockly').openRightView("sim", 0.5);
            // The application will create a canvas element for you that you
            // can then insert into the DOM
            var canvas = document.getElementById('sceneCanvas');
            var backgroundColor = $('#simDiv').css('background-color');
            // The application will create a renderer using WebGL, if possible,
            // with a fallback to a canvas render. It will also setup the ticker
            // and the root stage PIXI.Container
            this.app = new PIXI.Application({ view: canvas, backgroundColor: rgbToNumber(backgroundColor) });
            this.app.ticker.add(function (delta) {
                _this.render(delta);
            });
            this.g = new PIXI.Graphics();
            this.app.stage.addChild(this.g);
            // add mouse control
            var mouse = matter.Mouse.create(canvas), mouseConstraint = matter.MouseConstraint.create(engine, {
                mouse: mouse
            });
            World.add(engine.world, mouseConstraint);
        }
        Scene.prototype.render = function (delta) {
            var bodies = matter.Composite.allBodies(this.engine.world);
            var g = this.g;
            g.clear();
            // set a fill and line style
            g.beginFill(0xFF3300);
            g.lineStyle(4, 0xffd900, 1);
            for (var i = 0; i < bodies.length; i += 1) {
                var vertices = bodies[i].vertices;
                g.moveTo(vertices[0].x, vertices[0].y);
                for (var j = 1; j < vertices.length; j += 1) {
                    g.lineTo(vertices[j].x, vertices[j].y);
                }
                g.lineTo(vertices[0].x, vertices[0].y);
            }
            g.endFill();
        };
        return Scene;
    }());
    exports.Scene = Scene;
});
