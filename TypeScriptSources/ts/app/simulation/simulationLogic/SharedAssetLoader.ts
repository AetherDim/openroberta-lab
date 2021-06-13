import * as WebFont from 'webfontloader'
import './pixijs'
import Texture = PIXI.Texture;
import {randomIntBetween} from "./Random";
import { Util } from "./Util"

export class Asset {

	constructor(path: string, name?: string) {
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
	readonly name: string;

	constructor(css: string, families: string[], name?: string) {
		this.families = families;
		this.css = css;
		if(name) {
			this.name = name;
		} else {
			this.name = css; // => the same as path
		}
	}


}

export class MultiAsset {

	constructor(prefix: string, postfix: string, idStart: number, idEnd:number, name?: string) {
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
	readonly name?: string;

	getAsset(id: number): Asset | undefined {
		if(id >= this.idStart && id <= this.idEnd) {
			let assetPath = this.prefix + id + this.postfix;
			let assetName = this.getAssetName(id);
			return new Asset(assetPath, assetName);
		} else {
			return undefined;
		}

	}

	getAssetName(id: number): string | undefined {
		if(id >= this.idStart && id <= this.idEnd && this.name) {
			return this.name + '_' + id;
		} else {
			return undefined;
		}
	}

	getRandomAsset(): Asset | undefined {
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
	private static readonly fontMap = new Map<string, FontAsset>();

	get(asset: Asset): PIXI.LoaderResource {
		return this.loader.resources[asset.name];
	}

	load(callback:() => void, ...assets: (Asset|FontAsset|undefined)[]) {
		let fontsToLoad: FontAsset[] = <FontAsset[]>assets.filter(asset => {
			return (asset instanceof FontAsset) && !SharedAssetLoader.fontMap.get(asset.name);
		});

		const assetsToLoad = Util.mapNotNull(assets, asset => {

			let assetToLoad: Asset | null = null;
			if(asset == undefined || asset instanceof FontAsset) {
				return null;
			} else {
				assetToLoad = asset;
			}

			if(this.get(assetToLoad)) {
				console.log('asset found!');
				return null;
			} else {
				console.log('asset not found, loading ...');
				return assetToLoad;
			}
		});

		let countToLoad = 1 + fontsToLoad.length;

		// check whether we have anything to load
		if((assetsToLoad.length + fontsToLoad.length) == 0) {
			console.log('nothing to load.')
			callback();
			return;
		}


		fontsToLoad.forEach(font => {
			if(!SharedAssetLoader.fontMap.has(font.name)) {
				SharedAssetLoader.fontMap.set(font.name, font);
				WebFont.load({
					inactive: () => {
						console.warn('Font inactive');
						countToLoad --;
						if(countToLoad == 0) {
							callback();
						}
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
			} else {
				countToLoad --;
				if(countToLoad == 0) {
					callback();
				}
			}
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