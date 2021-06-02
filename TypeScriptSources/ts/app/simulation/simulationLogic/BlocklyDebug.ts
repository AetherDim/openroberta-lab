import Blockly = require("blockly");
import { Cyberspace } from "./Cyberspace/Cyberspace";
import { Timer } from "./Timer";


export class BlocklyDebug {

	private observers: { [key: string]: MutationObserver} = {}

	private cyberspace: Cyberspace

	constructor(cyberspace: Cyberspace) {
		this.cyberspace = cyberspace

		const _this = this
		this.blocklyTicker = new Timer(this.blocklyUpdateSleepTime, (delta) => {
			// update blockly
			_this.updateBreakpointEvent()

			// update sim variables if some interpreter is running
			const allTerminated = _this.cyberspace.getProgramManager().allInterpretersTerminated();
			if(!allTerminated) {
				this.updateSimVariables();
			}
		});

		this.startBlocklyUpdate()
	}

	destroy() {
		this.blocklyTicker.stop()
		// TODO: Do we need/want this?
		this.cyberspace.destroy()
	}

	private removeBreakPoint(block: Blockly.Block) {
		this.cyberspace.getProgramManager().removeBreakpoint(block.id)
	}

	private addBreakpoint(block: Blockly.Block) {
		this.cyberspace.getProgramManager().addBreakpoint(block.id)
	}

	private isDebugMode(): boolean {
		return this.cyberspace.getProgramManager().isDebugMode()
	}

	/**
	 * sleep time before calling blockly update
	 */
	private blocklyUpdateSleepTime = 1/10;

	/**
	 * blockly ticker/timer
	 */
	private readonly blocklyTicker: Timer;

	private startBlocklyUpdate() {
		this.blocklyTicker.start();
	}

	private stopBlocklyUpdate() {
		this.blocklyTicker.stop();
	}

	setBlocklyUpdateSleepTime(simSleepTime: number) {
		this.blocklyUpdateSleepTime = simSleepTime;
		this.blocklyTicker.sleepTime = simSleepTime;
	}


	updateSimVariables() {
		if($("#simVariablesModal").attr('aria-hidden') == "false") {
			$("#variableValue").html("");
			const variables = this.cyberspace.getProgramManager().getSimVariables();
			if (Object.keys(variables).length > 0) {
				for (const v in variables) {
					const value = variables[v][0];
					this.addVariableValue(v, value);
				}
			} else {
				$('#variableValue').append('<div><label> No variables instantiated</label></div>')
			}
		}
	}

	addVariableValue(name: string, value: any) {
		switch (typeof value) {
			case "number": {
				$("#variableValue").append('<div><label>' + name + ' :  </label><span> ' + Math.round(value*100)/100 + '</span></div>');
				break;
			}
			case "string": {
				$("#variableValue").append('<div><label>' + name + ' :  </label><span> ' + value + '</span></div>');
				break;
			}
			case "boolean": {
				$("#variableValue").append('<div><label>' + name + ' :  </label><span> ' + value + '</span></div>');
				break;
			}
			case "object": {
				for (var i = 0; i < value.length; i++) {
					this.addVariableValue(name + " [" + String(i) + "]", value[i]);
				}
				break;
			}
		}
	}

	setDebugMode(mode: boolean) {
		if (mode) {
			this.cyberspace.getProgramManager().startDebugging()
		} else {
			Blockly.getMainWorkspace().getAllBlocks(false).forEach((block:any) => {
				if (this.observers.hasOwnProperty(block.id)) {
					this.observers[block.id].disconnect();
				}
				$((block).svgPath_).removeClass('breakpoint');
				if (block.inTask && !block.disabled && !block.getInheritedDisabled()) {
					$(block.svgPath_).stop(true, true).animate({ 'fill-opacity': '1' }, 0);
				}
			});
			this.cyberspace.getProgramManager().endDebugging()
		}
		
	}


	/** adds/removes the ability for a block to be a breakpoint to a block */
	updateBreakpointEvent() {
		let _this = this;

		if(!Blockly.getMainWorkspace()) {
			// blockly workspace not initialized
			return;
		}

		if (this.isDebugMode()) {
			Blockly.getMainWorkspace().getAllBlocks(false).forEach((realBlock) => {
				const block = <any>realBlock
				if (!$(block.svgGroup_).hasClass('blocklyDisabled')) {

					if (_this.observers.hasOwnProperty(block.id)) {
						_this.observers[realBlock.id].disconnect();
					}

					var observer = new MutationObserver((mutations) => {
						mutations.forEach(function(mutation) {
							if ($(block.svgGroup_).hasClass('blocklyDisabled')) {
								_this.removeBreakPoint(realBlock);
								$(block.svgPath_).removeClass('breakpoint').removeClass('selectedBreakpoint');
							} else {
								if ($(block.svgGroup_).hasClass('blocklySelected')) {
									if ($(block.svgPath_).hasClass('breakpoint')) {
										_this.removeBreakPoint(realBlock);
										$(block.svgPath_).removeClass('breakpoint');
									} else if ($(block.svgPath_).hasClass('selectedBreakpoint')) {
										_this.removeBreakPoint(realBlock);
										$(block.svgPath_).removeClass('selectedBreakpoint').stop(true, true).animate({ 'fill-opacity': '1' }, 0);
									} else {
										_this.addBreakpoint(realBlock)
										$(block.svgPath_).addClass('breakpoint');
									}
								}
							}
						});
					});
					_this.observers[realBlock.id] = observer;
					observer.observe(block.svgGroup_, { attributes: true });
				}
			});
		}
	}

	startProgram() {
		this.cyberspace.getProgramManager().startProgram()
	}

	stopProgram() {
		this.cyberspace.getProgramManager().stopProgram()
	}

	interpreterAddEvent(mode: any) {
		this.cyberspace.getProgramManager().interpreterAddEvent(mode)
	}

}