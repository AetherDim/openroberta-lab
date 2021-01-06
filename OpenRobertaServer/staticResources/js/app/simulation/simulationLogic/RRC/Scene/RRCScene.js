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
define(["require", "exports", "../../Scene/Scene", "../RRAssetLoader"], function (require, exports, Scene_1, RRC) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RRCScene = void 0;
    var RRCScene = /** @class */ (function (_super) {
        __extends(RRCScene, _super);
        function RRCScene() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RRCScene.prototype.loadScoreAssets = function (chain) {
            RRC.loader.load(function () {
                chain.next();
            }, RRC.PROGGY_TINY_FONT, RRC.GOAL_BACKGROUND);
        };
        RRCScene.prototype.initScoreContainer = function () {
            this.scoreContainer.zIndex = this.scoreContainerZ;
            this.scoreText = new PIXI.Text("Score: " + this.getScore(), {
                fontFamily: 'ProggyTiny',
                fontSize: 60,
                fill: 0x6e750e // olive
            });
            this.scoreContainer.addChild(this.scoreText);
            this.scoreContainer.x = 200;
            this.scoreContainer.y = 200;
        };
        RRCScene.prototype.onInit = function () {
            this.setScore(266);
            this.showScoreScreen(10);
        };
        return RRCScene;
    }(Scene_1.Scene));
    exports.RRCScene = RRCScene;
});
