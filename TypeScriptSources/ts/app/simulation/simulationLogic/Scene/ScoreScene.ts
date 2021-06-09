import {RobotSetupData} from "../Robot/RobotSetupData";
import {AsyncChain, AsyncListener} from "./AsyncChain";
import {Scene} from "./Scene";
import {UIManager} from "../UIManager";
import {SharedAssetLoader} from "../SharedAssetLoader";
import {GOAL_BACKGROUND} from "../RRC/RRAssetLoader";
import * as Blockly from "blockly/blockly";
import G = Blockly.utils.Svg.G;


export class ScoreScene extends Scene {
    readonly loader = new SharedAssetLoader();

    scoreContainer = new PIXI.Container
    scoreText = new PIXI.Text("")

    score: number = 0

    constructor(name: string) {
        super(name)
        this.addOnAsyncChainBuildCompleteLister(chain => {
            chain.addBefore(this.onInit, new AsyncListener(this.onInitScore, this))
        })
        const T = this
        UIManager.showScoreButton.onClick(state => T.showScoreScreenNoButtonChange(state == "showScore"))
    }

    onLoadAssets(chain: AsyncChain) {
        this.loader.load(() => chain.next(),
            GOAL_BACKGROUND
        )
    }

    onInitScore(chain: AsyncChain) {
        UIManager.showScoreButton.setState("showScore")

        // image

        const texture = this.loader.get(GOAL_BACKGROUND).texture
        let scoreImageContainer = new PIXI.Sprite(texture)
        this.scoreContainer.addChild(scoreImageContainer)

        // text
        this.scoreText = new PIXI.Text("",
            {
                fontFamily: 'ProggyTiny',
                fontSize: 160,
                fill: 0xf48613
            });
        this.updateScoreText()

        this.scoreText.anchor.set(0.5, 0.5)
        this.scoreText.position.x = scoreImageContainer.width / 2
        this.scoreText.position.y = scoreImageContainer.height / 2

        this.scoreContainer.addChild(this.scoreText);

        chain.next()
    }

    updateScoreText() {
        this.scoreText.text = "Score: " + this.score
        this.scoreText.resolution = 4
    }

    setScore(score: number) {
        this.score = score
        this.updateScoreText()
    }

    resetScore() {
        this.setScore(0)
    }

    reset(robotSetupData: RobotSetupData[]) {
        this.resetScore()
        super.reset(robotSetupData)
    }

    fullReset(robotSetupData: RobotSetupData[]) {
        this.resetScore()
        super.fullReset(robotSetupData)
    }

    private showScoreScreenNoButtonChange(visible: boolean) {
        if (visible) {
            this.containerManager.topContainer.addChild(this.scoreContainer)
        } else {
            this.containerManager.topContainer.removeChild(this.scoreContainer)
        }
    }

    showScoreScreen(visible: boolean) {
        this.showScoreScreenNoButtonChange(visible)
        UIManager.showScoreButton.setState(visible ? "hideScore" : "showScore")
    }

    addToScore(score: number) {
        this.score += score
        this.updateScoreText()
    }

}