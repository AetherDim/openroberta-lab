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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
define(["require", "exports", "../SharedAssetLoader"], function (require, exports, SharedAssetLoader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RAINBOW_BACKGROUND_HS_SPACE_INVADERS = exports.RAINBOW_BACKGROUND_MS_SPACE_INVADERS = exports.RAINBOW_BACKGROUND_MS_DINO = exports.RAINBOW_BACKGROUND_ES = exports.RAINBOW_BACKGROUND_ES_DINO = exports.LINE_FOLLOWING_BACKGROUND_HS = exports.LINE_FOLLOWING_BACKGROUND_MS = exports.LINE_FOLLOWING_BACKGROUND_ES = exports.LABYRINTH_BLANK_BACKGROUND_HS = exports.LABYRINTH_BLANK_BACKGROUND_MS = exports.LABYRINTH_BLANK_BACKGROUND_ES = exports.PROGGY_TINY_FONT = exports.GOAL_BACKGROUND = exports.BLANK_BACKGROUND = exports.loader = exports.RRC_ASSET_PATH = void 0;
    exports.RRC_ASSET_PATH = 'assets/roborave/';
    var RRCAsset = /** @class */ (function (_super) {
        __extends(RRCAsset, _super);
        function RRCAsset(path, name) {
            return _super.call(this, exports.RRC_ASSET_PATH + path, name) || this;
        }
        return RRCAsset;
    }(SharedAssetLoader_1.Asset));
    var RRCFontAsset = /** @class */ (function (_super) {
        __extends(RRCFontAsset, _super);
        function RRCFontAsset(css) {
            var families = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                families[_i - 1] = arguments[_i];
            }
            return _super.apply(this, __spreadArrays([exports.RRC_ASSET_PATH + css], families)) || this;
        }
        return RRCFontAsset;
    }(SharedAssetLoader_1.FontAsset));
    var RRCMultiAsset = /** @class */ (function (_super) {
        __extends(RRCMultiAsset, _super);
        function RRCMultiAsset(prefix, postfix, idStart, idEnd, name) {
            return _super.call(this, exports.RRC_ASSET_PATH + prefix, postfix, idStart, idEnd, name) || this;
        }
        return RRCMultiAsset;
    }(SharedAssetLoader_1.MultiAsset));
    exports.loader = new SharedAssetLoader_1.SharedAssetLoader();
    exports.BLANK_BACKGROUND = new RRCAsset('blank.svg');
    exports.GOAL_BACKGROUND = new RRCAsset('goal.svg');
    exports.PROGGY_TINY_FONT = new RRCFontAsset('fonts/ProggyTiny.css', 'ProggyTiny');
    // Labyrinth
    exports.LABYRINTH_BLANK_BACKGROUND_ES = new RRCAsset('labyrinth/es/labyrinth.svg');
    exports.LABYRINTH_BLANK_BACKGROUND_MS = new RRCAsset('labyrinth/ms/labyrinth.svg');
    exports.LABYRINTH_BLANK_BACKGROUND_HS = new RRCAsset('labyrinth/hs/labyrinth.svg');
    // line-following
    exports.LINE_FOLLOWING_BACKGROUND_ES = new RRCAsset('line-following/es/linefollowing.svg');
    exports.LINE_FOLLOWING_BACKGROUND_MS = new RRCAsset('line-following/ms/linefollowing.svg');
    exports.LINE_FOLLOWING_BACKGROUND_HS = new RRCAsset('line-following/hs/linefollowing.svg');
    // rainbow
    exports.RAINBOW_BACKGROUND_ES_DINO = new RRCAsset('rainbow/es/dino.svg');
    exports.RAINBOW_BACKGROUND_ES = new RRCAsset('rainbow/es/rainbow.svg');
    exports.RAINBOW_BACKGROUND_MS_DINO = new RRCMultiAsset('rainbow/ms/dino_', '.svg', 0, 23);
    exports.RAINBOW_BACKGROUND_MS_SPACE_INVADERS = new RRCMultiAsset('rainbow/ms/rainbow_', '.svg', 0, 23);
    exports.RAINBOW_BACKGROUND_HS_SPACE_INVADERS = new RRCMultiAsset('rainbow/hs/space_invaders_', '.svg', 0, 719);
});
