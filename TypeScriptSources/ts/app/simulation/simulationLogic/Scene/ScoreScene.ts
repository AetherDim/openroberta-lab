import {RobotSetupData} from "../Robot/RobotSetupData";
import {AsyncChain, AsyncListener} from "./AsyncChain";
import {Scene} from "./Scene";
import {UIManager} from "../UIManager";
import {SharedAssetLoader} from "../SharedAssetLoader";
import {GOAL_BACKGROUND} from "../RRC/RRAssetLoader";


export class ScoreScene extends Scene {
	readonly loader = new SharedAssetLoader();

	scoreContainer = new PIXI.Container
	scoreText = new PIXI.Text("")
	private timeBonusScoreLabel = new PIXI.Text("")

	score: number = 0

	constructor(name: string) {
		super(name)
		this.addOnAsyncChainBuildCompleteLister(chain => {
			chain.addBefore(this.onInit, new AsyncListener(this.onInitScore, this))
		})
		this.timeBonusScoreLabel.position.set(0, -10)
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

		this.containerManager.topContainer.addChild(this.timeBonusScoreLabel)

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

	resetScoreAndProgramRuntime() {
		this.setScore(0)
		this.programEventTimes = undefined
	}

	reset(robotSetupData: RobotSetupData[]) {
		this.resetScoreAndProgramRuntime()
		super.reset(robotSetupData)
	}

	fullReset(robotSetupData: RobotSetupData[]) {
		this.resetScoreAndProgramRuntime()
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

	/**
	 * Returns the time since the program was started.
	 * If the program was stopped, the total program runtime will be returned.
	 * It returns `undefined`, if the program was never started.
	 */
	getProgramRuntime(): number | undefined {
		if (this.programEventTimes != undefined) {
			return (this.programEventTimes.stopTime ?? this.getSimulationTime()) - this.programEventTimes.startTime
		} else {
			return undefined
		}
	}

	private programEventTimes?: { startTime: number, stopTime?: number }

	onUpdatePrePhysics() {
		const robots = this.getRobotManager().getRobots()
		if (robots.length > 0) {
			if (robots[0].interpreter?.isTerminated() === false && !this.getProgramManager().isProgramPaused()) {
				// program is running
				if (this.programEventTimes == undefined || this.programEventTimes.stopTime != undefined) {
					// set the start time, if it was not set before, or if both time values were set
					this.programEventTimes = { startTime: this.getSimulationTime() }
				}
			} else {
				// robot has no interpreter or program is terminated
				if (this.programEventTimes != undefined) {
					// set the stop time, if it was not set before
					if (this.programEventTimes.stopTime == undefined) {
						this.programEventTimes.stopTime = this.getSimulationTime()
					}
				}
			}
		}
	}

}