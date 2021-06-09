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
define(["require", "exports", "./AsyncChain", "./Scene", "../UIManager", "../SharedAssetLoader", "../RRC/RRAssetLoader"], function (require, exports, AsyncChain_1, Scene_1, UIManager_1, SharedAssetLoader_1, RRAssetLoader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScoreScene = void 0;
    var ScoreScene = /** @class */ (function (_super) {
        __extends(ScoreScene, _super);
        function ScoreScene(name) {
            var _this = _super.call(this, name) || this;
            _this.loader = new SharedAssetLoader_1.SharedAssetLoader();
            _this.scoreContainer = new PIXI.Container;
            _this.scoreText = new PIXI.Text("");
            _this.score = 0;
            _this.addOnAsyncChainBuildCompleteLister(function (chain) {
                chain.addBefore(_this.onInit, new AsyncChain_1.AsyncListener(_this.onInitScore, _this));
            });
            var T = _this;
            UIManager_1.UIManager.showScoreButton.onClick(function (state) { return T.showScoreScreenNoButtonChange(state == "showScore"); });
            return _this;
        }
        ScoreScene.prototype.onLoadAssets = function (chain) {
            this.loader.load(function () { return chain.next(); }, RRAssetLoader_1.GOAL_BACKGROUND);
        };
        ScoreScene.prototype.onInitScore = function (chain) {
            UIManager_1.UIManager.showScoreButton.setState("showScore");
            // image
            var texture = this.loader.get(RRAssetLoader_1.GOAL_BACKGROUND).texture;
            var scoreImageContainer = new PIXI.Sprite(texture);
            this.scoreContainer.addChild(scoreImageContainer);
            // text
            this.scoreText = new PIXI.Text("", {
                fontFamily: 'ProggyTiny',
                fontSize: 160,
                fill: 0xf48613
            });
            this.updateScoreText();
            this.scoreText.anchor.set(0.5, 0.5);
            this.scoreText.position.x = scoreImageContainer.width / 2;
            this.scoreText.position.y = scoreImageContainer.height / 2;
            this.scoreContainer.addChild(this.scoreText);
            chain.next();
        };
        ScoreScene.prototype.updateScoreText = function () {
            this.scoreText.text = "Score: " + this.score;
            this.scoreText.resolution = 4;
        };
        ScoreScene.prototype.setScore = function (score) {
            this.score = score;
            this.updateScoreText();
        };
        ScoreScene.prototype.resetScore = function () {
            this.setScore(0);
        };
        ScoreScene.prototype.reset = function (robotSetupData) {
            this.resetScore();
            _super.prototype.reset.call(this, robotSetupData);
        };
        ScoreScene.prototype.fullReset = function (robotSetupData) {
            this.resetScore();
            _super.prototype.fullReset.call(this, robotSetupData);
        };
        ScoreScene.prototype.showScoreScreenNoButtonChange = function (visible) {
            if (visible) {
                this.containerManager.topContainer.addChild(this.scoreContainer);
            }
            else {
                this.containerManager.topContainer.removeChild(this.scoreContainer);
            }
        };
        ScoreScene.prototype.showScoreScreen = function (visible) {
            this.showScoreScreenNoButtonChange(visible);
            UIManager_1.UIManager.showScoreButton.setState(visible ? "hideScore" : "showScore");
        };
        ScoreScene.prototype.addToScore = function (score) {
            this.score += score;
            this.updateScoreText();
        };
        return ScoreScene;
    }(Scene_1.Scene));
    exports.ScoreScene = ScoreScene;
});
