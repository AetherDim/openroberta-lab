define(["require", "exports", "blockly", "./simulation.constants"], function (require, exports, Blockly, simulation_constants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProgramFlowManager = void 0;
    var ProgramFlowManager = /** @class */ (function () {
        function ProgramFlowManager(scene) {
            this.debugMode = false;
            this.breakpoints = [];
            this.observers = {};
            this.interpreters = [];
            this.scene = scene;
            this.robots = scene.robots;
        }
        ProgramFlowManager.prototype.setPrograms = function (programs) {
            if (programs.length < this.robots.length) {
                console.warn("not enough programs!");
            }
            this.interpreters = [];
            // reset interpreters
            this.robots.forEach(function (robot) {
                robot.interpreter = null;
            });
            for (var i = 0; i < programs.length; i++) {
                if (i >= this.robots.length) {
                    console.error('Not enough robots, too many programs!');
                    break;
                }
                // TODO: use breakpoints for all programs?
                this.interpreters.push(this.robots[i].setProgram(programs[i], this.breakpoints));
            }
            this.updateDebugMode(this.debugMode);
            //this.resetProgramButtons();
        };
        /**
         * has to be called after one simulation run
         */
        ProgramFlowManager.prototype.update = function () {
            this.updateBreakpointEvent();
        };
        /** adds/removes the ability for a block to be a breakpoint to a block */
        ProgramFlowManager.prototype.updateBreakpointEvent = function () {
            if (this.debugMode) {
                Blockly.getMainWorkspace().getAllBlocks(false).forEach(function (block) {
                    if (!$(block.svgGroup_).hasClass('blocklyDisabled')) {
                        if (this.observers.hasOwnProperty(block.id)) {
                            this.observers[block.id].disconnect();
                        }
                        var _this_1 = this;
                        var observer = new MutationObserver(function (mutations) {
                            mutations.forEach(function (mutation) {
                                if ($(block.svgGroup_).hasClass('blocklyDisabled')) {
                                    _this_1.removeBreakPoint(block);
                                    $(block.svgPath_).removeClass('breakpoint').removeClass('selectedBreakpoint');
                                }
                                else {
                                    if ($(block.svgGroup_).hasClass('blocklySelected')) {
                                        if ($(block.svgPath_).hasClass('breakpoint')) {
                                            _this_1.removeBreakPoint(block);
                                            $(block.svgPath_).removeClass('breakpoint');
                                        }
                                        else if ($(block.svgPath_).hasClass('selectedBreakpoint')) {
                                            _this_1.removeBreakPoint(block);
                                            $(block.svgPath_).removeClass('selectedBreakpoint').stop(true, true).animate({ 'fill-opacity': '1' }, 0);
                                        }
                                        else {
                                            _this_1.breakpoints.push(block.id);
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
            }
            else {
                Blockly.getMainWorkspace().getAllBlocks(false).forEach(function (block) {
                    if (this.observers.hasOwnProperty(block.id)) {
                        this.observers[block.id].disconnect();
                    }
                    $(block.svgPath_).removeClass('breakpoint');
                }, this);
            }
        };
        /** updates the debug mode for all interpreters */
        ProgramFlowManager.prototype.updateDebugMode = function (mode) {
            this.debugMode = mode;
            if (this.interpreters !== null) {
                for (var i = 0; i < this.robots.length; i++) {
                    this.interpreters[i].setDebugMode(mode);
                }
            }
            this.updateBreakpointEvent();
        };
        /** removes breakpoint block */
        ProgramFlowManager.prototype.removeBreakPoint = function (block) {
            for (var i = 0; i < this.breakpoints.length; i++) {
                if (this.breakpoints[i] === block.id) {
                    this.breakpoints.splice(i, 1);
                }
            }
            if (!(this.breakpoints.length > 0) && this.interpreters !== null) {
                for (var i = 0; i < this.robots.length; i++) {
                    this.interpreters[i].removeEvent(simulation_constants_1.CONSTANTS.DEBUG_BREAKPOINT);
                }
            }
        };
        /** adds an event to the interpreters */
        ProgramFlowManager.prototype.interpreterAddEvent = function (mode) {
            this.updateBreakpointEvent();
            if (this.interpreters !== null) {
                for (var i = 0; i < this.robots.length; i++) {
                    this.interpreters[i].addEvent(mode);
                }
            }
        };
        /** called to signify debugging is finished in simulation */
        ProgramFlowManager.prototype.endDebugging = function () {
            if (this.interpreters !== null) {
                for (var i = 0; i < this.robots.length; i++) {
                    this.interpreters[i].setDebugMode(false);
                    this.interpreters[i].breakpoints = [];
                }
            }
            Blockly.getMainWorkspace().getAllBlocks(false).forEach(function (block) {
                if (block.inTask && !block.disabled && !block.getInheritedDisabled()) {
                    $(block.svgPath_).stop(true, true).animate({ 'fill-opacity': '1' }, 0);
                }
            }, this);
            this.breakpoints = [];
            this.debugMode = false;
            this.updateBreakpointEvent();
        };
        ProgramFlowManager.prototype.resetProgramButtons = function () {
            $('.simForward').removeClass('typcn-media-pause');
            $('.simForward').addClass('typcn-media-play');
            $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
            $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
        };
        return ProgramFlowManager;
    }());
    exports.ProgramFlowManager = ProgramFlowManager;
});
