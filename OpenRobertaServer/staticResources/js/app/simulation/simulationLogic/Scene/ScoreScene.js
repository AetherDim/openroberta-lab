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
define(["require", "exports", "./AsyncChain", "./Scene"], function (require, exports, AsyncChain_1, Scene_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScoreScene = void 0;
    var ScoreScene = /** @class */ (function (_super) {
        __extends(ScoreScene, _super);
        function ScoreScene(name) {
            var _this = _super.call(this, name) || this;
            _this.score = 0;
            _this.scoreText = new PIXI.Text("");
            _this.addOnAsyncChainBuildCompleteLister(function (chain) {
                chain.addBefore(_this.onInit, new AsyncChain_1.AsyncListener(_this.onInitScore, _this));
            });
            return _this;
        }
        ScoreScene.prototype.onInitScore = function (chain) {
            this.getContainers().entityTopContainer.addChild(this.scoreText);
            this.scoreText.position.y = -50;
            this.updateScoreText();
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
        ScoreScene.prototype.reset = function () {
            _super.prototype.reset.call(this);
            this.resetScore();
        };
        ScoreScene.prototype.fullReset = function () {
            _super.prototype.fullReset.call(this);
            this.resetScore();
        };
        ScoreScene.prototype.setVisible = function (visible) {
            this.scoreText.visible = visible;
        };
        ScoreScene.prototype.addToScore = function (score) {
            this.score += score;
            this.updateScoreText();
        };
        return ScoreScene;
    }(Scene_1.Scene));
    exports.ScoreScene = ScoreScene;
});
