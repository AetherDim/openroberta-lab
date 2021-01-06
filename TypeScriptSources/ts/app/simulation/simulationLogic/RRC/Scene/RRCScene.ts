import { AsyncChain, Scene } from "../../Scene/Scene";
import * as RRC from '../RRAssetLoader'

export class RRCScene extends Scene {

    loadScoreAssets(chain: AsyncChain) {
        RRC.loader.load(() => {
            chain.next();
        },
        RRC.PROGGY_TINY_FONT,
        RRC.GOAL_BACKGROUND,
        );
    }

    protected goalSprite: PIXI.Sprite;

    scoreText2: PIXI.Text;
    scoreText3: PIXI.Text;
    scoreTextContainer: PIXI.Container = new PIXI.Container();

    initScoreContainer() {
        this.scoreContainer.zIndex = this.scoreContainerZ;

        let goal = RRC.loader.get(RRC.GOAL_BACKGROUND).texture;
        this.goalSprite = new PIXI.Sprite(goal);
        
        this.scoreContainer.addChild(this.goalSprite);


        // text
        
        this.scoreText = new PIXI.Text("",
        {
            fontFamily : 'ProggyTiny',
            fontSize: 160,
            fill : 0xf48613
        });

        this.scoreText2 = new PIXI.Text("",
        {
            fontFamily : 'ProggyTiny',
            fontSize: 160,
            fill : 0xc00001
        });

        this.scoreText3 = new PIXI.Text("",
        {
            fontFamily : 'ProggyTiny',
            fontSize: 160,
            fill : 0x00cb01
        });

        this.scoreTextContainer.addChild(this.scoreText3, this.scoreText2, this.scoreText);

        this.scoreContainer.addChild(this.scoreTextContainer);
    }

    updateScoreAnimation(dt: number) {
        this.scoreTextContainer.x = this.goalSprite.width/2;
        this.scoreTextContainer.y = this.goalSprite.height/2;

        this.scoreTextContainer.rotation = 5 * Math.PI / 180 + Math.sin(Date.now()/700)/Math.PI;
    }

    updateScoreText() {
        let text = "Score: " + this.getScore();
        this.scoreText.text = text;
        this.scoreText.position.set(-this.scoreText.width/2, -this.scoreText.height/2);

        this.scoreText2.text = text;
        this.scoreText2.position.set(-this.scoreText.width/2-3, -this.scoreText.height/2);

        this.scoreText3.text = text;
        this.scoreText3.position.set(-this.scoreText.width/2+3, -this.scoreText.height/2);
    }
    

    onInit() {
        this.setScore(266);
        this.showScoreScreen(100);
    }



}