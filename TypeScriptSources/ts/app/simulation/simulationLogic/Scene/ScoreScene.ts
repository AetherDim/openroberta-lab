import { AsyncChain, AsyncListener } from "./AsyncChain";
import { Scene } from "./Scene";

export class ScoreScene extends Scene {

    score: number = 0
    
    constructor(name: string) {
        super(name)
        
        this.addOnAsyncChainBuildCompleteLister(chain => {
            chain.addBefore(this.onInit, new AsyncListener(this.onInitScore, this))
        })
    }

    scoreText = new PIXI.Text("")


    onInitScore(chain: AsyncChain) {
        this.getContainers().entityTopContainer.addChild(this.scoreText)
        this.scoreText.position.y -= 50

        this.updateScoreText()
        

        chain.next()
    }

    updateScoreText() {
        this.scoreText.text = "Score: " + this.score
    }


    setScore(score: number) {
        this.score = score
        this.updateScoreText()
    }

    setVisible(visible: boolean) {
        this.scoreText.visible = visible
    }

    addToScore(score: number) {
        this.score += score
        this.updateScoreText()
    }

}