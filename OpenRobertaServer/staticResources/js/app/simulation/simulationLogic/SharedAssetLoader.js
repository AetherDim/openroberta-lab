define(["require", "exports", "webfontloader", "./Random"], function (require, exports, WebFont, Random_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SharedAssetLoader = exports.MultiAsset = exports.FontAsset = exports.Asset = void 0;
    var Asset = /** @class */ (function () {
        function Asset(path, name) {
            if (name === void 0) { name = null; }
            this.path = path;
            if (name) {
                this.name = name;
            }
            else {
                this.name = path;
            }
        }
        return Asset;
    }());
    exports.Asset = Asset;
    var FontAsset = /** @class */ (function () {
        function FontAsset(css, families, name) {
            if (name === void 0) { name = null; }
            this.families = families;
            this.css = css;
            if (name) {
                this.name = name;
            }
            else {
                this.name = css; // => the same as path
            }
        }
        return FontAsset;
    }());
    exports.FontAsset = FontAsset;
    var MultiAsset = /** @class */ (function () {
        function MultiAsset(prefix, postfix, idStart, idEnd, name) {
            if (name === void 0) { name = null; }
            this.prefix = prefix;
            this.postfix = postfix;
            this.idStart = idStart;
            this.idEnd = idEnd;
            this.name = name;
        }
        MultiAsset.prototype.getAsset = function (id) {
            if (id >= this.idStart && id <= this.idEnd) {
                var assetPath = this.prefix + id + this.postfix;
                var assetName = this.getAssetName(id);
                return new Asset(assetPath, assetName);
            }
            else {
                return null;
            }
        };
        MultiAsset.prototype.getAssetName = function (id) {
            if (id >= this.idStart && id <= this.idEnd && this.name) {
                return this.name + '_' + id;
            }
            else {
                return null;
            }
        };
        MultiAsset.prototype.getRandomAsset = function () {
            return this.getAsset(this.getRandomAssetID());
        };
        MultiAsset.prototype.getRandomAssetID = function () {
            return Random_1.randomIntBetween(this.idStart, this.idEnd);
        };
        MultiAsset.prototype.getNumberOfIDs = function () {
            return this.idEnd - this.idStart + 1;
        };
        return MultiAsset;
    }());
    exports.MultiAsset = MultiAsset;
    var SharedAssetLoader = /** @class */ (function () {
        function SharedAssetLoader() {
            this.loader = new PIXI.Loader(); // you can also create your own if you want
            this.fontMap = new Map();
        }
        SharedAssetLoader.prototype.get = function (asset) {
            return this.loader.resources[asset.name];
        };
        SharedAssetLoader.prototype.load = function (callback) {
            var _this_1 = this;
            var assets = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                assets[_i - 1] = arguments[_i];
            }
            var fontsToLoad = assets.filter(function (asset) {
                return (asset instanceof FontAsset) && !_this_1.fontMap.get(asset.name);
            });
            var assetsToLoad = assets.map(function (asset) {
                var assetToLoad = null;
                if (asset instanceof FontAsset) {
                    return null;
                }
                else {
                    assetToLoad = asset;
                }
                if (_this_1.get(assetToLoad)) {
                    console.log('asset found!');
                    return null;
                }
                else {
                    console.log('asset not found, loading ...');
                    return assetToLoad;
                }
            });
            assetsToLoad = assetsToLoad.filter(function (asset) {
                return asset != null;
            });
            var countToLoad = 1 + fontsToLoad.length;
            // check whether we have anything to load
            if ((assetsToLoad.length + fontsToLoad.length) == 0) {
                console.log('nothing to load.');
                callback();
                return;
            }
            // TODO: threadless, lock?
            fontsToLoad.forEach(function (font) {
                var _this = _this_1;
                WebFont.load({
                    inactive: function () {
                        console.warn('Font inactive');
                    },
                    active: function () {
                        _this.fontMap.set(font.name, font);
                        countToLoad--;
                        if (countToLoad == 0) {
                            callback();
                        }
                    },
                    custom: {
                        families: font.families,
                        urls: [font.css],
                    }
                });
            });
            assetsToLoad.forEach(function (asset) {
                if (asset) {
                    _this_1.loader.add(asset.name, asset.path);
                }
            });
            this.loader.load(function () {
                countToLoad--;
                if (countToLoad == 0) {
                    callback();
                }
            });
        };
        return SharedAssetLoader;
    }());
    exports.SharedAssetLoader = SharedAssetLoader;
});
