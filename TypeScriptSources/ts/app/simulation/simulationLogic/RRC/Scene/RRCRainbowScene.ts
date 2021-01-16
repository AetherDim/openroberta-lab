import {RRCScene} from "./RRCScene";
import {AgeGroup} from "../AgeGroup";
import * as RRC from "../RRAssetLoader";
import { AsyncChain } from "../../Scene/AsyncChain";
import {randomBool, randomIntBetween, randomWeightedBool} from "../../Random";
import {Asset} from "../../SharedAssetLoader";
import { Vector } from "matter-js";
import { Unit } from "../../Unit";

export class RRCRainbowScene extends RRCScene {

    getAsset() {
        switch (this.ageGroup) {
            case AgeGroup.ES:
                if(randomBool()) {
                    return RRC.RAINBOW_BACKGROUND_ES;
                } else {
                    return RRC.RAINBOW_BACKGROUND_ES_DINO;
                }

            case AgeGroup.MS:
                if(randomWeightedBool(RRC.RAINBOW_BACKGROUND_MS_DINO.getNumberOfIDs(), RRC.RAINBOW_BACKGROUND_MS_SPACE_INVADERS.getNumberOfIDs())) {
                    return RRC.RAINBOW_BACKGROUND_MS_DINO.getRandomAsset();
                } else {
                    return RRC.RAINBOW_BACKGROUND_MS_SPACE_INVADERS.getRandomAsset();
                }

            case AgeGroup.HS:
                return RRC.RAINBOW_BACKGROUND_HS_SPACE_INVADERS.getRandomAsset();
        }
    }

    backgroundAsset?: Asset;

    onLoadAssets(chain: AsyncChain) {
        this.backgroundAsset = this.getAsset();
        RRC.loader.load(() => {
                chain.next();
            },
            this.backgroundAsset
        );
    }

    onInit(chain: AsyncChain) {
        this.initRobot({ position: {x: 0.5, y: 0.5 }, rotation: 45 });

        if (this.backgroundAsset) {
            let goal = RRC.loader.get(this.backgroundAsset).texture;
            this.goalSprite = new PIXI.Sprite(goal);

            this.groundContainer.addChild(this.goalSprite);
        }

        this.addWalls(true);

        chain.next();
    }



}