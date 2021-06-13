
import Blockly = require("blockly");
import { UnionToTuple } from "./Util";

interface RobertaButtonSettings {
	class: string
	tooltip?: string
}

export class UIRobertaButton {

	readonly buttonID: string
	private jQueryHTMLElement: JQuery<HTMLElement>

	constructor(buttonID: string) {
		this.buttonID = buttonID
		this.jQueryHTMLElement = $("#"+buttonID)
	}

	/**
	 * Adds `onClickHandler` to the html element as click handler
	 * 
	 * @param onClickHandler will be called with the state in which the button is in **before** the state change.
	 * It returns the new button state.
	 * 
	 * @returns `this`
	 */
	onClick(onClickHandler: () => void): UIRobertaButton {
		const t = this;
		this.jQueryHTMLElement.onWrap("click", onClickHandler, this.buttonID + " clicked")
		return this
	}

	update() {
		this.jQueryHTMLElement = $("#"+this.buttonID)
	}
}

export class UIRobertaStateButton<T extends { [key in string]: RobertaButtonSettings }> {
	readonly buttonID: string
	private jQueryHTMLElement: JQuery<HTMLElement>
	protected stateMappingObject: T
	protected state: keyof T

	private stateChangeHandler?: (state: keyof T) => keyof T
	private clickHanders: ((state: keyof T) => void)[] = []

	// TODO: Convert all the 'onWrap' js code to use the 'UIManager'
	// Workaround since 'onWrap' is not loaded initially
	private needsOnWrapHandler = true

	constructor(buttonID: string, initialState: keyof T, buttonSettingsState: T) {
		this.buttonID = buttonID
		this.jQueryHTMLElement = $("#"+buttonID)
		this.stateMappingObject = buttonSettingsState
		this.state = initialState

		// TODO: Convert all the 'onWrap' js code to use the 'UIManager'
		// call 'setButtonEventHandler' only for buttons on which 'onClick' is called
		//this.setButtonEventHandler()
	}

	/**
	 * Tries to set the button event handler as long 'onWrap' is not definied for `JQuery`.
	 */
	private setButtonEventHandler() {
		if (!this.needsOnWrapHandler) {
			return
		}
		if (this.jQueryHTMLElement.onWrap !== undefined) {
			const t = this;
			this.jQueryHTMLElement.onWrap("click", () => {
				t.jQueryHTMLElement.removeClass(t.stateMappingObject[t.state].class)
				const state = t.state
				t.clickHanders.forEach(handler => handler(state))
				t.state = t.stateChangeHandler?.(state) ?? state
				const buttonSettings = t.stateMappingObject[t.state]
				t.jQueryHTMLElement.addClass(buttonSettings.class)
				t.jQueryHTMLElement.attr("data-original-title", buttonSettings.tooltip ?? "");
			}, this.buttonID + " clicked")
		} else {
			// workaround for onWrap not loaded
			setTimeout(() => this.setButtonEventHandler(), 200)
		}
	}

	/**
	 * Set the state change handler.
	 * 
	 * @param stateChangeHandler will be called with the state in which the button is in **before** the state change.
	 * It returns the new button state.
	 * 
	 * @returns `this`
	 */
	setStateChangeHandler(stateChangeHandler: (state: keyof T) => keyof T): UIRobertaStateButton<T> {
		this.stateChangeHandler = stateChangeHandler
		return this
	}

	/**
	 * Adds `onClickHandler` to the click handler list.
	 * 
	 * @param onClickHandler will be called with the state in which the button is in **before** the state change.
	 * 
	 * @returns `this`
	 */
	onClick(onClickHandler: (state: keyof T) => void): UIRobertaStateButton<T> {
		// TODO: 'setButtonEventHandler' to the constructor if all 'onWrap' code is converted to TypeScript 
		this.setButtonEventHandler()
		this.clickHanders.push(onClickHandler)
		return this
	}

	update() {
		// remove all classes in 'stateMappingObject'
		Object.values(this.stateMappingObject).forEach(buttonSettings =>
			this.jQueryHTMLElement.removeClass(buttonSettings.class))
		// add the state class
		const buttonSettings = this.stateMappingObject[this.state]
		this.jQueryHTMLElement.addClass(buttonSettings.class)
		this.jQueryHTMLElement.attr("data-original-title", buttonSettings.tooltip ?? "");
	}

	setState(state: keyof T) {
		this.state = state
		this.update()
	}
}

export type TwoProperties<T, PropertyType> =
	UnionToTuple<keyof T> extends [string, string]
		? { [key in string]: PropertyType }
		: never

export class UIRobertaToggleStateButton<T extends TwoProperties<T, RobertaButtonSettings>> extends UIRobertaStateButton<T> {

	constructor(buttonID: string, initialState: keyof T, buttonSettingsState: T) {
		super(buttonID, initialState, buttonSettingsState)
		this.setStateChangeHandler(state => {
			const keys = Object.keys(buttonSettingsState)
			return keys[keys.indexOf(state as string) == 0 ? 1 : 0]
		})
	}

}

const BlocklyMsg: any = Blockly.Msg

export class UIManager {

	static readonly programControlButton = new UIRobertaToggleStateButton(
		"simControl", "start", {
			start: { class: "typcn-media-play", tooltip: BlocklyMsg.MENU_SIM_START_TOOLTIP },
			stop: { class: "typcn-media-stop", tooltip: BlocklyMsg.MENU_SIM_STOP_TOOLTIP }
		})

	static readonly physicsSimControlButton = new UIRobertaToggleStateButton(
		"simFLowControl", "stop", {
			start: { class: "typcn-flash-outline", tooltip: "Start simulation" },
			stop: { class: "typcn-flash", tooltip: "Stop simulation" }
		})
	
	static readonly showScoreButton = new UIRobertaToggleStateButton(
		"simScore", "showScore", {
			showScore: { class: "typcn-star" },
			hideScore: { class: "typcn-star-outline" },
		})
	
	static readonly simSpeedUpButton = new UIRobertaToggleStateButton(
		"simSpeedUp", "fastForward" , {
			fastForward: { class: "typcn-media-fast-forward-outline" },
			normalSpeed: { class: "typcn-media-fast-forward" }
		}
	)

	static readonly resetSceneButton = new UIRobertaButton("simResetPose")
	static readonly zoomOutButton = new UIRobertaButton("zoomOut")
	static readonly zoomInButton = new UIRobertaButton("zoomIn")
	static readonly zoomResetButton = new UIRobertaButton("zoomReset")

}