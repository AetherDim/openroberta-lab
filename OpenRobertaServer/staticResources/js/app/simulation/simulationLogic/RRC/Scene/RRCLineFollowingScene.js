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
define(["require", "exports", "./RRCScene", "../RRAssetLoader", "../AgeGroup"], function (require, exports, RRCScene_1, RRC, AgeGroup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RRCLineFollowingScene = void 0;
    var RRCLineFollowingScene = /** @class */ (function (_super) {
        __extends(RRCLineFollowingScene, _super);
        function RRCLineFollowingScene() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RRCLineFollowingScene.prototype.getAsset = function () {
            switch (this.ageGroup) {
                case AgeGroup_1.AgeGroup.ES:
                    return RRC.LINE_FOLLOWING_BACKGROUND_ES;
                case AgeGroup_1.AgeGroup.MS:
                    return RRC.LINE_FOLLOWING_BACKGROUND_MS;
                case AgeGroup_1.AgeGroup.HS:
                    return RRC.LINE_FOLLOWING_BACKGROUND_HS;
            }
        };
        RRCLineFollowingScene.prototype.onLoadAssets = function (chain) {
            RRC.loader.load(function () {
                chain.next();
            }, this.getAsset());
        };
        RRCLineFollowingScene.prototype.onInit = function (chain) {
            var goal = RRC.loader.get(this.getAsset()).texture;
            this.goalSprite = new PIXI.Sprite(goal);
            this.groundContainer.addChild(this.goalSprite);
            chain.next();
        };
        return RRCLineFollowingScene;
    }(RRCScene_1.RRCScene));
    exports.RRCLineFollowingScene = RRCLineFollowingScene;
});
