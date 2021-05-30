import { SharedAssetLoader, Asset, MultiAsset, FontAsset } from '../SharedAssetLoader';

export const RRC_ASSET_PATH = 'assets/roborave/';

class RRCAsset extends Asset {
	constructor(path: string, name?: string) {
		super(RRC_ASSET_PATH + path, name);
	}
}

class RRCFontAsset extends FontAsset {
	constructor(css: string, families: string[], name?: string) {
		super(RRC_ASSET_PATH + css, families, name);
	}
}

class RRCMultiAsset extends MultiAsset {
	constructor(prefix: string, postfix: string, idStart: number, idEnd:number, name?: string) {
		super(RRC_ASSET_PATH + prefix, postfix, idStart, idEnd, name);
	}
}

export const BLANK_BACKGROUND = new RRCAsset('blank.svg');
export const GOAL_BACKGROUND = new RRCAsset('goal.svg');

export const PROGGY_TINY_FONT = new RRCFontAsset('fonts/ProggyTiny.css', ['ProggyTiny']);

// Labyrinth
export const LABYRINTH_BLANK_BACKGROUND_ES = new RRCAsset('labyrinth/es/labyrinth.svg');
export const LABYRINTH_BLANK_BACKGROUND_MS = new RRCAsset('labyrinth/ms/labyrinth.svg');
export const LABYRINTH_BLANK_BACKGROUND_HS = new RRCAsset('labyrinth/hs/labyrinth.svg');

// line-following
export const LINE_FOLLOWING_BACKGROUND_ES = new RRCAsset('line-following/es/linefollowing.svg');
export const LINE_FOLLOWING_BACKGROUND_MS = new RRCAsset('line-following/ms/linefollowing.svg');
export const LINE_FOLLOWING_BACKGROUND_HS = new RRCAsset('line-following/hs/linefollowing.svg');

// rainbow
export const RAINBOW_BACKGROUND_ES_DINO = new RRCAsset('rainbow/es/dino.svg');
export const RAINBOW_BACKGROUND_ES = new RRCAsset('rainbow/es/rainbow.svg');

export const RAINBOW_BACKGROUND_MS_DINO = new RRCMultiAsset('rainbow/ms/dino_', '.svg', 0, 23);
export const RAINBOW_BACKGROUND_MS_SPACE_INVADERS = new RRCMultiAsset('rainbow/ms/rainbow_', '.svg', 0, 23);

export const RAINBOW_BACKGROUND_HS_SPACE_INVADERS = new RRCMultiAsset('rainbow/hs/space_invaders_', '.svg', 0, 719);