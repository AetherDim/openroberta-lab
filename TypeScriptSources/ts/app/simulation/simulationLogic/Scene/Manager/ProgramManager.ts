import { Robot } from "../../Robot/Robot";
import { RobotManager } from "./RobotManager";
import { Interpreter } from "./../../interpreter.interpreter";
import { RobotProgram } from "../../Robot/RobotProgram";
import { EventManager, ParameterTypes } from "../../EventManager/EventManager";


export class ProgramManager {
	
	readonly robotManager: RobotManager;
	readonly robots: Robot[];

	private programPaused: boolean = true;

	private debugMode = false;
	private breakpoints: string[] = [];
	private interpreters: Interpreter[] = [];
	private initialized = false;

	private cachedPrograms: RobotProgram[] = []

	readonly eventManager = EventManager.init({
		onStartProgram: ParameterTypes.none,
		onPauseProgram: ParameterTypes.none,
		onStopProgram: ParameterTypes.none
	})


	hasBeenInitialized(): boolean {
		return this.initialized;
	}

	constructor(robotManager: RobotManager) {
		this.robotManager = robotManager;
		this.robots = robotManager.getRobots();
	}

	removeAllEventHandlers() {
		this.eventManager.removeAllEventHandlers()
	}

	setCachedPrograms() {
		this.setPrograms(this.cachedPrograms)
	}

	setPrograms(programs: RobotProgram[]) {
		if(programs.length < this.robots.length) {
			console.warn("Not enough programs!");
		}

		// cache old programs
		this.cachedPrograms = programs

		this.stopProgram() // reset program manager

		this.init()
	}

	private init() {
		if(!this.initialized) {
			for(let i = 0; i < this.cachedPrograms.length; i++) {
				if(i >= this.robots.length) {
					console.info('Not enough robots, too many programs!');
					break;
				}
				// We can use a single breakpoints array for all interpreters, because 
				// the breakpoint IDs are unique
				this.interpreters.push(this.robots[i].setProgram(this.cachedPrograms[i], this.breakpoints));
			}

			this.updateDebugMode(this.debugMode);

			this.initialized = true
		}
	}

	isProgramPaused(): boolean {
		return this.programPaused
	}

	isDebugMode(): boolean {
		return this.debugMode
	}

	private setProgramPause(pause: boolean) {
		this.programPaused = pause
	}

	startProgram() {
		this.init()
		this.setProgramPause(false)
		this.eventManager.onStartProgramCallHandlers()
	}

	pauseProgram() {
		this.setProgramPause(true)
		this.eventManager.onPauseProgramCallHandlers()
	}

	/**
	 * Stops the program and resets all interpreters
	 */
	stopProgram() {

		// remove all highlights from breakpoints
		for (var i = 0; i < this.interpreters.length; i++) {
			this.interpreters[i].removeHighlights();
		}

		this.interpreters = []

		// reset interpreters
		this.robots.forEach(robot => {
			robot.interpreter = undefined
		})

		this.initialized = false
		this.pauseProgram()

		// call event handlers
		this.eventManager.onStopProgramCallHandlers()
	}

	getSimVariables() {
		if (this.interpreters.length >= 1) {
			return this.interpreters[0].getVariables();
		} else {
			return {};
		}
	}
	

	/**
	 * has to be called after one simulation run
	 */
	update() {
		const allTerminated = this.allInterpretersTerminated();
		if(allTerminated && this.initialized) {
			console.log('All programs terminated');
			this.stopProgram();
		}
	}

	allInterpretersTerminated(): boolean {
		let allTerminated = true;
		this.interpreters.forEach(ip => {
			if(!ip.isTerminated()) {
				allTerminated = false;
				return;
			}
		});
		return allTerminated;
	}

	/** updates the debug mode for all interpreters */
	private updateDebugMode(mode: boolean) {
		this.debugMode = mode;

		for (var i = 0; i < this.interpreters.length; i++) {
			if(i < this.robots.length) {
				this.interpreters[i].setDebugMode(mode);
			}
		}
	}

	addBreakpoint(breakpointID: string) {
		this.breakpoints.push(breakpointID)
	}

	/** removes breakpoint with breakpointID */
	removeBreakpoint(breakpointID: string) {
		for (let i = 0; i < this.breakpoints.length; i++) {
			if (this.breakpoints[i] === breakpointID) {
				this.breakpoints.splice(i, 1);
			}
		}
	}

	/** adds an event to the interpreters */
	interpreterAddEvent(mode: any) {
		for (var i = 0; i < this.interpreters.length; i++) {
			if(i < this.robots.length) {
				this.interpreters[i].addEvent(mode);
			}
		}
	}

	/** removes an event to the interpreters */
	interpreterRemoveEvent(mode: any) {
		for (var i = 0; i < this.interpreters.length; i++) {
			if(i < this.robots.length) {
				this.interpreters[i].removeEvent(mode);
			}
		}
	}

	startDebugging() {
		this.updateDebugMode(true)
	}

	/** called to signify debugging is finished in simulation */
	endDebugging() {
		// this is equivalent to updateDebugMode with additional breakpoint removal
		for (var i = 0; i < this.interpreters.length; i++) {
			if(i < this.robots.length) {
				this.interpreters[i].setDebugMode(false);
				this.interpreters[i].breakpoints = [];
			}
		}

		this.breakpoints = [];
		this.debugMode = false;
	}

}