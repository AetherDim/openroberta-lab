import * as WebFont from 'webfontloader'
import Texture = PIXI.Texture;
import {randomIntBetween} from "./Random";

export class Asset {

    constructor(path: string, name: string = null) {
        this.path = path;
        if(name) {
            this.name = name;
        } else {
            this.name = path;
        }
    }

    readonly name: string;
    readonly path: string;
}

export class FontAsset {

    readonly families: string[];
    readonly css: string;

    constructor(css: string, ...families: string[]) {
        this.families = families;
        this.css = css;
    }


}

export class MultiAsset {

    constructor(prefix: string, postfix: string, idStart: number, idEnd:number, name: string = null) {
        this.prefix = prefix;
        this.postfix = postfix;
        this.idStart = idStart;
        this.idEnd = idEnd;
        this.name = name;
    }

    readonly prefix: string;
    readonly postfix: string;
    readonly idStart:number;
    readonly idEnd: number;
    readonly name: string;

    getAsset(id: number): Asset {
        if(id >= this.idStart && id <= this.idEnd) {
            let assetPath = this.prefix + id + this.postfix;
            let assetName = this.getAssetName(id);
            return new Asset(assetPath, assetName);
        } else {
            return null;
        }

    }

    getAssetName(id: number): string {
        if(id >= this.idStart && id <= this.idEnd && this.name) {
            return this.name + '_' + id;
        } else {
            return null;
        }
    }

    getRandomAsset(): Asset {
        return this.getAsset(this.getRandomAssetID());
    }

    getRandomAssetID(): number {
        return randomIntBetween(this.idStart, this.idEnd);
    }

    getNumberOfIDs() {
        return this.idEnd - this.idStart + 1;
    }

}



export class SharedAssetLoader {

    private readonly loader = new PIXI.Loader(); // you can also create your own if you want

    get(asset: Asset): PIXI.LoaderResource {
        return this.loader.resources[asset.name];
    }

    load(callback:() => void, ...assets: (Asset|FontAsset)[]) {
        var fontsToLoad: FontAsset[] = <FontAsset[]>assets.filter(asset => {
            return (asset instanceof FontAsset);
        });

        let assetsToLoad: Asset[] = assets.map(asset => {

            var assetToLoad: Asset = null;
            if(asset instanceof FontAsset) {
                return null;
            } else {
                assetToLoad = asset;
            }

            if(this.get(assetToLoad)) {
                return null;
            } else {
                return assetToLoad;
            }
        });

        assetsToLoad = assetsToLoad.filter(asset => {
            return asset != null;
        });

        let countToLoad = 1 + fontsToLoad.length;


        // TODO: threadless, lock?
        fontsToLoad.forEach(font => {
            WebFont.load({
                inactive: () => {
                    console.warn('Font inactive');
                },
                active: () => {
                    countToLoad --;
                    if(countToLoad == 0) {
                        callback();
                    }
                },
                custom: {
                    families: font.families,
                    urls: [font.css],
                }
            });
        });

        assetsToLoad.forEach(asset => {
            if(asset) {
                this.loader.add(asset.name, asset.path);
            }
        })

        this.loader.load(() => {
            countToLoad --;
            if(countToLoad == 0) {
                callback();
            }
        });
    }

}