import Blockly = require("blockly");
import { CONSTANTS } from "./simulation.constants";
import { Interpreter } from "./interpreter.interpreter";
import { Robot } from "./Robot/Robot";
import { Scene } from "./Scene";

export class ProgramFlowManager {
    
    readonly scene: Scene;
    readonly robots: Robot[];

    private debugMode = false;
    private breakpoints = [];
    private observers = {};
    private interpreters: Interpreter[] = [];


    constructor(scene: Scene) {
        this.scene = scene;
        this.robots = scene.robots;
    }

    setPrograms(programs: any[]) {
        if(programs.length < this.robots.length) {
            console.warn("not enough programs!");
        }

        this.interpreters = [];

        // reset interpreters
        this.robots.forEach(robot => {
            robot.interpreter = null;
        });


        for(let i = 0; i < programs.length; i++) {
            if(i >= this.robots.length) {
                console.error('Not enough robots, too many programs!');
                break;
            }
            // TODO: use breakpoints for all programs?
            this.interpreters.push(this.robots[i].setProgram(programs[i], this.breakpoints));
        }

        this.updateDebugMode(this.debugMode);

        //this.resetProgramButtons();
    }



    /**
     * has to be called after one simulation run
     */
    update() {
        this.updateBreakpointEvent();
    }


    /** adds/removes the ability for a block to be a breakpoint to a block */
    updateBreakpointEvent() {
        if (this.debugMode) {
            Blockly.getMainWorkspace().getAllBlocks(false).forEach(function(block: any) {
                if (!$(block.svgGroup_).hasClass('blocklyDisabled')) {

                    if (this.observers.hasOwnProperty(block.id)) {
                        this.observers[block.id].disconnect();
                    }

                    let _this = this;

                    var observer = new MutationObserver(function(mutations) {
                        mutations.forEach(function(mutation) {
                            if ($(block.svgGroup_).hasClass('blocklyDisabled')) {
                                _this.removeBreakPoint(block);
                                $(block.svgPath_).removeClass('breakpoint').removeClass('selectedBreakpoint');
                            } else {
                                if ($(block.svgGroup_).hasClass('blocklySelected')) {
                                    if ($(block.svgPath_).hasClass('breakpoint')) {
                                        _this.removeBreakPoint(block);
                                        $(block.svgPath_).removeClass('breakpoint');
                                    } else if ($(block.svgPath_).hasClass('selectedBreakpoint')) {
                                        _this.removeBreakPoint(block);
                                        $(block.svgPath_).removeClass('selectedBreakpoint').stop(true, true).animate({ 'fill-opacity': '1' }, 0);
                                    } else {
                                        _this.breakpoints.push(block.id);
                                        $(block.svgPath_).addClass('breakpoint');
                                    }
                                }
                            }
                        });
                    });
                    this.observers[block.id] = observer;
                    observer.observe(block.svgGroup_, { attributes: true });
                }
            }, this);
        } else {
            Blockly.getMainWorkspace().getAllBlocks(false).forEach(function(block: any) {
                if (this.observers.hasOwnProperty(block.id)) {
                    this.observers[block.id].disconnect();
                }
                $(block.svgPath_).removeClass('breakpoint');
            }, this);
        }
    }

    /** updates the debug mode for all interpreters */
    updateDebugMode(mode: boolean) {
        this.debugMode = mode;
        if (this.interpreters !== null) {
            for (var i = 0; i < this.robots.length; i++) {
                this.interpreters[i].setDebugMode(mode);
            }
        }
        this.updateBreakpointEvent();
    }

    /** removes breakpoint block */
    removeBreakPoint(block) {
        for (var i = 0; i < this.breakpoints.length; i++) {
            if (this.breakpoints[i] === block.id) {
                this.breakpoints.splice(i, 1);
            }
        }
        if (!(this.breakpoints.length > 0) && this.interpreters !== null) {
            for (var i = 0; i < this.robots.length; i++) {
                this.interpreters[i].removeEvent(CONSTANTS.DEBUG_BREAKPOINT);
            }
        }
    }

    /** adds an event to the interpreters */
    interpreterAddEvent(mode: any) {
        this.updateBreakpointEvent();
        if (this.interpreters !== null) {
            for (var i = 0; i < this.robots.length; i++) {
                this.interpreters[i].addEvent(mode);
            }
        }
    }

    /** called to signify debugging is finished in simulation */
    endDebugging() {
        if (this.interpreters !== null) {
            for (var i = 0; i < this.robots.length; i++) {
                this.interpreters[i].setDebugMode(false);
                this.interpreters[i].breakpoints = [];
            }
        }
        Blockly.getMainWorkspace().getAllBlocks(false).forEach(function(block:any) {
            if (block.inTask && !block.disabled && !block.getInheritedDisabled()) {
                $(block.svgPath_).stop(true, true).animate({ 'fill-opacity': '1' }, 0);
            }
        }, this);
        this.breakpoints = [];
        this.debugMode = false;
        this.updateBreakpointEvent();
    }

    resetProgramButtons() {
        $('.simForward').removeClass('typcn-media-pause');
        $('.simForward').addClass('typcn-media-play');
        $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
        $('#simControl').attr('data-original-title', (<any>Blockly.Msg).MENU_SIM_START_TOOLTIP);
    }

}