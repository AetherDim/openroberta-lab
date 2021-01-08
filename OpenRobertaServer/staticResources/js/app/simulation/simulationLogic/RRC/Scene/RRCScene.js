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
        function RRCScene(ageGroup) {
            var _this = _super.call(this) || this;
            _this.scoreTextContainer = new PIXI.Container();
            _this.ageGroup = ageGroup;
            return _this;
        }
        RRCScene.prototype.loadScoreAssets = function (chain) {
            RRC.loader.load(function () {
                chain.next();
            }, RRC.PROGGY_TINY_FONT, RRC.GOAL_BACKGROUND);
        };
        RRCScene.prototype.initScoreContainer = function () {
            this.scoreContainer.zIndex = this.scoreContainerZ;
            var goal = RRC.loader.get(RRC.GOAL_BACKGROUND).texture;
            this.goalSprite = new PIXI.Sprite(goal);
            this.scoreContainer.addChild(this.goalSprite);
            // text
            this.scoreText = new PIXI.Text("", {
                fontFamily: 'ProggyTiny',
                fontSize: 160,
                fill: 0xf48613
            });
            this.scoreText2 = new PIXI.Text("", {
                fontFamily: 'ProggyTiny',
                fontSize: 160,
                fill: 0xc00001
            });
            this.scoreText3 = new PIXI.Text("", {
                fontFamily: 'ProggyTiny',
                fontSize: 160,
                fill: 0x00cb01
            });
            this.scoreTextContainer.addChild(this.scoreText3, this.scoreText2, this.scoreText);
            this.scoreContainer.addChild(this.scoreTextContainer);
        };
        RRCScene.prototype.updateScoreAnimation = function (dt) {
            this.scoreTextContainer.x = this.goalSprite.width / 2;
            this.scoreTextContainer.y = this.goalSprite.height / 2;
            this.scoreTextContainer.rotation = 5 * Math.PI / 180 + Math.sin(Date.now() / 700) / Math.PI;
        };
        RRCScene.prototype.updateScoreText = function () {
            var text = "Score: " + this.getScore();
            this.scoreText.text = text;
            this.scoreText.position.set(-this.scoreText.width / 2, -this.scoreText.height / 2);
            this.scoreText2.text = text;
            this.scoreText2.position.set(-this.scoreText.width / 2 - 3, -this.scoreText.height / 2);
            this.scoreText3.text = text;
            this.scoreText3.position.set(-this.scoreText.width / 2 + 3, -this.scoreText.height / 2);
        };
        RRCScene.prototype.onInit = function () {
            this.setScore(266);
            this.showScoreScreen(100);
        };
        return RRCScene;
    }(Scene_1.Scene));
    exports.RRCScene = RRCScene;
});
