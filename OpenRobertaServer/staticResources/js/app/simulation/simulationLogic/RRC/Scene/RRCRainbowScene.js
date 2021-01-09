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
define(["require", "exports", "./RRCScene", "../AgeGroup", "../RRAssetLoader", "../../Random"], function (require, exports, RRCScene_1, AgeGroup_1, RRC, Random_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RRCRainbowScene = void 0;
    var RRCRainbowScene = /** @class */ (function (_super) {
        __extends(RRCRainbowScene, _super);
        function RRCRainbowScene() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.backgroundAsset = null;
            return _this;
        }
        RRCRainbowScene.prototype.getAsset = function () {
            switch (this.ageGroup) {
                case AgeGroup_1.AgeGroup.ES:
                    if (Random_1.randomBool()) {
                        return RRC.RAINBOW_BACKGROUND_ES;
                    }
                    else {
                        return RRC.RAINBOW_BACKGROUND_ES_DINO;
                    }
                case AgeGroup_1.AgeGroup.MS:
                    if (Random_1.randomWeightedBool(RRC.RAINBOW_BACKGROUND_MS_DINO.getNumberOfIDs(), RRC.RAINBOW_BACKGROUND_MS_SPACE_INVADERS.getNumberOfIDs())) {
                        return RRC.RAINBOW_BACKGROUND_MS_DINO.getRandomAsset();
                    }
                    else {
                        return RRC.RAINBOW_BACKGROUND_MS_SPACE_INVADERS.getRandomAsset();
                    }
                case AgeGroup_1.AgeGroup.HS:
                    return RRC.RAINBOW_BACKGROUND_HS_SPACE_INVADERS.getRandomAsset();
            }
        };
        RRCRainbowScene.prototype.onLoadAssets = function (chain) {
            this.backgroundAsset = this.getAsset();
            RRC.loader.load(function () {
                chain.next();
            }, this.backgroundAsset);
        };
        RRCRainbowScene.prototype.onInit = function (chain) {
            var goal = RRC.loader.get(this.backgroundAsset).texture;
            this.goalSprite = new PIXI.Sprite(goal);
            this.groundContainer.addChild(this.goalSprite);
            chain.next();
        };
        return RRCRainbowScene;
    }(RRCScene_1.RRCScene));
    exports.RRCRainbowScene = RRCRainbowScene;
});
