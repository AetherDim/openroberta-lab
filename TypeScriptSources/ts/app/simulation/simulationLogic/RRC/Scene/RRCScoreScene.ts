import {RobotSetupData} from "../../Robot/RobotSetupData";
import {AsyncChain, AsyncListener} from "../../Scene/AsyncChain";
import {Scene} from "../../Scene/Scene";
import {SharedAssetLoader} from "../../SharedAssetLoader";
import {GOAL_BACKGROUND, PROGGY_TINY_FONT} from "../RRAssetLoader";
import { EventManager, ParameterTypes } from "../../EventManager/EventManager";


export class RRCScoreScene extends Scene {

	readonly loader = new SharedAssetLoader();

	private scoreContainer = new PIXI.Container()
	private scoreTextContainer = new PIXI.Container()

	private scoreBackgroundSprite?: PIXI.Sprite
	private scoreText1 = new PIXI.Text("", new PIXI.TextStyle(
	{
		fontFamily: 'ProggyTiny',
		fontSize: 140,
		fill: 0xf48613
	}))
	private scoreText2 = new PIXI.Text("", new PIXI.TextStyle(
	{
		fontFamily: 'ProggyTiny',
		fontSize: 140,
		fill: 0xc00001
	}))
	private scoreText3 = new PIXI.Text("", new PIXI.TextStyle(
	{
		fontFamily: 'ProggyTiny',
		fontSize: 140,
		fill: 0x00cb01
	}))


	score: number = 0

	readonly scoreEventManager = EventManager.init({
		onShowHideScore: new ParameterTypes<["showScore" | "hideScore"]>()
	})

	constructor(name: string) {
		super(name)
		this.addOnAsyncChainBuildCompleteLister(chain => {
			chain.addBefore(this.onInit, new AsyncListener(this.onInitScore, this))
			chain.addBefore(this.onLoadAssets, new AsyncListener(this.onLoadScoreAssets, this))
		})
	}

	removeAllEventHandlers() {
		super.removeAllEventHandlers()
		this.scoreEventManager.removeAllEventHandlers()
	}

	onLoadScoreAssets(chain: AsyncChain) {
		this.loader.load(() => chain.next(),
			GOAL_BACKGROUND,
			PROGGY_TINY_FONT
		)
	}

	onInitScore(chain: AsyncChain) {
		this.showScoreScreen(false)

		this.scoreContainer.zIndex = 1000;

		let goal = this.loader.get(GOAL_BACKGROUND).texture;
		this.scoreBackgroundSprite = new PIXI.Sprite(goal)
		this.scoreContainer.addChild(this.scoreBackgroundSprite);

		// text
		this.scoreTextContainer.addChild(this.scoreText3, this.scoreText2, this.scoreText1)
		this.scoreContainer.addChild(this.scoreTextContainer);

		chain.next()
	}

	updateScoreText() {
		let text = "Score: " + String(Math.round(this.getScore() * 1000) / 1000);
		this.scoreText1.text = text;
		this.scoreText2.text = text;
		this.scoreText3.text = text;
		this.scoreText1.position.set(-this.scoreText1.width / 2, -this.scoreText1.height / 2);
		this.scoreText2.position.set(-this.scoreText1.width / 2 - 3, -this.scoreText1.height / 2);
		this.scoreText3.position.set(-this.scoreText1.width / 2 + 3, -this.scoreText1.height / 2);
	}

	getScore() {
		return this.score
	}

	updateScoreAnimation() {
		if(this.scoreBackgroundSprite) {
			this.scoreTextContainer.x = this.scoreBackgroundSprite.width / 2;
			this.scoreTextContainer.y = this.scoreBackgroundSprite.height / 2;
			this.scoreTextContainer.rotation = 5 * Math.PI / 180 + Math.sin(Date.now() / 700) / Math.PI;
		}
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
			if(!this.isVisible()) {
				this.containerManager.topContainer.addChild(this.scoreContainer)
			}
		} else {
			this.containerManager.topContainer.removeChild(this.scoreContainer)
		}
	}

	isVisible() {
		return this.containerManager.topContainer.children.includes(this.scoreContainer)
	}

	showScoreScreen(visible: boolean) {
		this.showScoreScreenNoButtonChange(visible)
		this.scoreEventManager.onShowHideScoreCallHandlers(visible ? "showScore" : "hideScore")
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
			return ((this.programEventTimes.stopTime ?? this.getSimulationTime()) - this.programEventTimes.startTime)/2
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

	onRenderTick() {
		this.updateScoreAnimation()
	}

}