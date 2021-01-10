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
define(["require", "exports", "matter-js", "../../Displayable", "../../Unit", "../AgeGroup", "./RRCScene", "../RRAssetLoader"], function (require, exports, matter_js_1, Displayable_1, Unit_1, AgeGroup_1, RRCScene_1, RRC) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RRCLabyrinthScene = void 0;
    var LabyrinthRect = /** @class */ (function () {
        function LabyrinthRect(labyrinthRect) {
            this.x = labyrinthRect.x;
            this.y = labyrinthRect.y;
            this.w = labyrinthRect.w;
            this.h = labyrinthRect.h;
            this.rotation = labyrinthRect.rotation;
            this.color = labyrinthRect.color;
        }
        return LabyrinthRect;
    }());
    var RRCLabyrinthScene = /** @class */ (function (_super) {
        __extends(RRCLabyrinthScene, _super);
        function RRCLabyrinthScene() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.MazeObstacleList_ES = [{
                    x: 500,
                    y: 100,
                    w: 200,
                    h: 5,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 400,
                    y: 0,
                    w: 5,
                    h: 200,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 400,
                    y: 200,
                    w: 200,
                    h: 5,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 600,
                    y: 200,
                    w: 5,
                    h: 250,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 400,
                    y: 450,
                    w: 200,
                    h: 5,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 300,
                    y: 100,
                    w: 5,
                    h: 450,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 300,
                    y: 300,
                    w: 200,
                    h: 50,
                    rotation: 0,
                    color: 0x111111
                }, {
                    x: 200,
                    y: 0,
                    w: 5,
                    h: 350,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 100,
                    y: 450,
                    w: 200,
                    h: 5,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 100,
                    y: 100,
                    w: 5,
                    h: 350,
                    rotation: 0,
                    color: 0x000000
                }];
            _this.MazeObstacleList_MS = [{
                    x: 500,
                    y: 100,
                    w: 200,
                    h: 5,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 400,
                    y: 0,
                    w: 5,
                    h: 200,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 400,
                    y: 200,
                    w: 200,
                    h: 5,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 600,
                    y: 200,
                    w: 5,
                    h: 250,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 400,
                    y: 450,
                    w: 200,
                    h: 5,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 300,
                    y: 100,
                    w: 5,
                    h: 450,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 300,
                    y: 300,
                    w: 200,
                    h: 5,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 400,
                    y: 300,
                    w: 100,
                    h: 50,
                    rotation: 0,
                    color: 0x111111
                }, {
                    x: 200,
                    y: 0,
                    w: 5,
                    h: 350,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 100,
                    y: 450,
                    w: 200,
                    h: 5,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 100,
                    y: 100,
                    w: 5,
                    h: 350,
                    rotation: 0,
                    color: 0x000000
                }];
            _this.MazeObstacleList_HS = [{
                    x: 600,
                    y: 100,
                    w: 100,
                    h: 5,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 400,
                    y: 100,
                    w: 100,
                    h: 5,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 400,
                    y: 0,
                    w: 5,
                    h: 100,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 500,
                    y: 100,
                    w: 5,
                    h: 100,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 500,
                    y: 200,
                    w: 100,
                    h: 5,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 600,
                    y: 200,
                    w: 5,
                    h: 250,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 400,
                    y: 450,
                    w: 200,
                    h: 5,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 300,
                    y: 100,
                    w: 5,
                    h: 450,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 300,
                    y: 300,
                    w: 200,
                    h: 50,
                    rotation: 0,
                    color: 0x111111
                }, {
                    x: 300,
                    y: 200,
                    w: 100,
                    h: 5,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 200,
                    y: 0,
                    w: 5,
                    h: 350,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 100,
                    y: 450,
                    w: 200,
                    h: 5,
                    rotation: 0,
                    color: 0x000000
                }, {
                    x: 100,
                    y: 100,
                    w: 5,
                    h: 350,
                    rotation: 0,
                    color: 0x000000
                }];
            return _this;
        }
        RRCLabyrinthScene.prototype.addLabyrinth = function (labyrinth) {
            var _this = this;
            labyrinth.forEach(function (rect) {
                var x = Unit_1.Unit.fromLength(rect.x);
                var y = Unit_1.Unit.fromLength(rect.y);
                var w = Unit_1.Unit.fromLength(rect.w);
                var h = Unit_1.Unit.fromLength(rect.h);
                var body = Displayable_1.createRect(x + w / 2, y + h / 2, w, h, 0, { color: rect.color, strokeColor: rect.color });
                body.displayable.rotation = rect.rotation;
                matter_js_1.Body.setStatic(body, true);
                body.enableMouseInteraction = true;
                matter_js_1.World.add(_this.engine.world, body);
            });
        };
        RRCLabyrinthScene.prototype.onLoadAssets = function (chain) {
            RRC.loader.load(function () {
                chain.next();
            }, this.getAsset());
        };
        RRCLabyrinthScene.prototype.getAsset = function () {
            switch (this.ageGroup) {
                case AgeGroup_1.AgeGroup.ES:
                    return RRC.LABYRINTH_BLANK_BACKGROUND_ES;
                case AgeGroup_1.AgeGroup.MS:
                    return RRC.LABYRINTH_BLANK_BACKGROUND_MS;
                case AgeGroup_1.AgeGroup.HS:
                    return RRC.LABYRINTH_BLANK_BACKGROUND_HS;
            }
        };
        RRCLabyrinthScene.prototype.onInit = function (chain) {
            this.initRobot();
            var goal = RRC.loader.get(this.getAsset()).texture;
            this.goalSprite = new PIXI.Sprite(goal);
            this.groundContainer.addChild(this.goalSprite);
            switch (this.ageGroup) {
                case AgeGroup_1.AgeGroup.ES:
                    this.addLabyrinth(this.MazeObstacleList_ES);
                    break;
                case AgeGroup_1.AgeGroup.MS:
                    this.addLabyrinth(this.MazeObstacleList_MS);
                    break;
                case AgeGroup_1.AgeGroup.HS:
                    this.addLabyrinth(this.MazeObstacleList_HS);
                    break;
            }
            chain.next();
        };
        return RRCLabyrinthScene;
    }(RRCScene_1.RRCScene));
    exports.RRCLabyrinthScene = RRCLabyrinthScene;
});
