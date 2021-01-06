import { AsyncChain, Scene } from "../../Scene/Scene";
import * as RRC from '../RRAssetLoader'

export class RRCScene extends Scene {

    loadScoreAssets(chain: AsyncChain) {
        RRC.loader.load(() => {
            chain.next();
        },
        RRC.PROGGY_TINY_FONT,
        RRC.GOAL_BACKGROUND
        );
    }

    initScoreContainer() {
        this.scoreContainer.zIndex = this.scoreContainerZ;

        this.scoreText = new PIXI.Text("Score: " + this.getScore(),
        {
            fontFamily : 'ProggyTiny',
            fontSize: 60,
            fill : 0x6e750e // olive
        });

        this.scoreContainer.addChild(this.scoreText);

        this.scoreContainer.x = 200;
        this.scoreContainer.y = 200;
    }

    onInit() {
        this.setScore(266);
        this.showScoreScreen(10);
    }



}