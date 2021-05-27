define(["require", "exports", "../../EventManager/EventManager"], function (require, exports, EventManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProgramManager = void 0;
    /*export interface DebugEventHandler {
        onUpdateSimValues(manager: ProgramManager): void
    
        onProgramPause(manager: ProgramManager): void
        onProgramResume(manager: ProgramManager): void
        onProgramStart(manager: ProgramManager): void
        onProgramStop(manager: ProgramManager): void
        onProgramReset(manager: ProgramManager): void
        
        onUpdateDebugMode(manager: ProgramManager, debugEnabled: boolean): void
        onInterpreterAddEvent(manager: ProgramManager, mode: any): void
        onRemoveBreakPoint(manager: ProgramManager, block: Blockly.Block): void
    }*/
    var ProgramManager = /** @class */ (function () {
        function ProgramManager(robotManager) {
            this.programPaused = true;
            this.debugMode = false;
            this.breakpoints = [];
            this.interpreters = [];
            this.initialized = false;
            this.cachedPrograms = [];
            this.eventManager = EventManager_1.EventManager.init({
                onStartProgram: EventManager_1.ParameterTypes.none,
                onPauseProgram: EventManager_1.ParameterTypes.none,
                onStopProgram: EventManager_1.ParameterTypes.none
            });
            this.robotManager = robotManager;
            this.robots = robotManager.getRobots();
        }
        ProgramManager.prototype.hasBeenInitialized = function () {
            return this.initialized;
        };
        ProgramManager.prototype.removeAllEventHandlers = function () {
            this.eventManager.removeAllEventHandlers();
        };
        ProgramManager.prototype.setCachedPrograms = function () {
            this.setPrograms(this.cachedPrograms);
        };
        ProgramManager.prototype.setPrograms = function (programs) {
            if (programs.length < this.robots.length) {
                console.warn("Not enough programs!");
            }
            // cache old programs
            this.cachedPrograms = programs;
            this.stopProgram(); // reset program manager
            this.init();
        };
        ProgramManager.prototype.init = function () {
            if (!this.initialized) {
                for (var i = 0; i < this.cachedPrograms.length; i++) {
                    if (i >= this.robots.length) {
                        console.info('Not enough robots, too many programs!');
                        break;
                    }
                    // We can use a single breakpoints array for all interpreters, because 
                    // the breakpoint IDs are unique
                    this.interpreters.push(this.robots[i].setProgram(this.cachedPrograms[i], this.breakpoints));
                }
                this.updateDebugMode(this.debugMode);
                this.initialized = true;
            }
        };
        ProgramManager.prototype.isProgramPaused = function () {
            return this.programPaused;
        };
        ProgramManager.prototype.isDebugMode = function () {
            return this.debugMode;
        };
        ProgramManager.prototype.setProgramPause = function (pause) {
            this.programPaused = pause;
        };
        ProgramManager.prototype.startProgram = function () {
            this.init();
            this.setProgramPause(false);
            this.eventManager.onStartProgramCallHandlers();
        };
        ProgramManager.prototype.pauseProgram = function () {
            this.setProgramPause(true);
            this.eventManager.onPauseProgramCallHandlers();
        };
        /**
         * Stops the program and resets all interpreters
         */
        ProgramManager.prototype.stopProgram = function () {
            // remove all highlights from breakpoints
            for (var i = 0; i < this.interpreters.length; i++) {
                this.interpreters[i].removeHighlights();
            }
            this.interpreters = [];
            // reset interpreters
            this.robots.forEach(function (robot) {
                robot.interpreter = undefined;
            });
            this.initialized = false;
            this.pauseProgram();
            // call event handlers
            this.eventManager.onStopProgramCallHandlers();
        };
        ProgramManager.prototype.getSimVariables = function () {
            if (this.interpreters.length >= 1) {
                return this.interpreters[0].getVariables();
            }
            else {
                return {};
            }
        };
        /**
         * has to be called after one simulation run
         */
        ProgramManager.prototype.update = function () {
            var allTerminated = this.allInterpretersTerminated();
            if (allTerminated && this.initialized) {
                console.log('All programs terminated');
                this.stopProgram();
            }
        };
        ProgramManager.prototype.allInterpretersTerminated = function () {
            var allTerminated = true;
            this.interpreters.forEach(function (ip) {
                if (!ip.isTerminated()) {
                    allTerminated = false;
                    return;
                }
            });
            return allTerminated;
        };
        /** updates the debug mode for all interpreters */
        ProgramManager.prototype.updateDebugMode = function (mode) {
            this.debugMode = mode;
            for (var i = 0; i < this.interpreters.length; i++) {
                if (i < this.robots.length) {
                    this.interpreters[i].setDebugMode(mode);
                }
            }
        };
        ProgramManager.prototype.addBreakpoint = function (breakpointID) {
            this.breakpoints.push(breakpointID);
        };
        /** removes breakpoint with breakpointID */
        ProgramManager.prototype.removeBreakpoint = function (breakpointID) {
            for (var i = 0; i < this.breakpoints.length; i++) {
                if (this.breakpoints[i] === breakpointID) {
                    this.breakpoints.splice(i, 1);
                }
            }
        };
        /** adds an event to the interpreters */
        ProgramManager.prototype.interpreterAddEvent = function (mode) {
            for (var i = 0; i < this.interpreters.length; i++) {
                if (i < this.robots.length) {
                    this.interpreters[i].addEvent(mode);
                }
            }
        };
        /** removes an event to the interpreters */
        ProgramManager.prototype.interpreterRemoveEvent = function (mode) {
            for (var i = 0; i < this.interpreters.length; i++) {
                if (i < this.robots.length) {
                    this.interpreters[i].removeEvent(mode);
                }
            }
        };
        ProgramManager.prototype.startDebugging = function () {
            this.updateDebugMode(true);
        };
        /** called to signify debugging is finished in simulation */
        ProgramManager.prototype.endDebugging = function () {
            // this is equivalent to updateDebugMode with additional breakpoint removal
            for (var i = 0; i < this.interpreters.length; i++) {
                if (i < this.robots.length) {
                    this.interpreters[i].setDebugMode(false);
                    this.interpreters[i].breakpoints = [];
                }
            }
            this.breakpoints = [];
            this.debugMode = false;
        };
        return ProgramManager;
    }());
    exports.ProgramManager = ProgramManager;
});
