import {RRCScene} from "./RRCScene";
import {AsyncChain} from "../../Scene/Scene";
import * as RRC from '../RRAssetLoader'
import {AgeGroup} from "../AgeGroup";

export class RRCLineFollowingScene extends RRCScene {


    getAsset() {
        switch (this.ageGroup) {
            case AgeGroup.ES:
                return RRC.LINE_FOLLOWING_BACKGROUND_ES;

            case AgeGroup.MS:
                return RRC.LINE_FOLLOWING_BACKGROUND_MS;

            case AgeGroup.HS:
                return RRC.LINE_FOLLOWING_BACKGROUND_HS;
        }
    }

    onLoadAssets(chain: AsyncChain) {
        RRC.loader.load(() => {
            chain.next();
        },
            this.getAsset()
        );
    }

    onInit(chain: AsyncChain) {
        this.initRobot();

        let goal = RRC.loader.get(this.getAsset()).texture;
        this.goalSprite = new PIXI.Sprite(goal);

        this.groundContainer.addChild(this.goalSprite);

        chain.next();
    }


}