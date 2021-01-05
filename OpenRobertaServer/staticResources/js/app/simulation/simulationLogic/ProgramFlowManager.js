define(["require", "exports", "blockly", "./simulation.constants"], function (require, exports, Blockly, CONSTANTS) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProgramFlowManager = void 0;
    var ProgramFlowManager = /** @class */ (function () {
        function ProgramFlowManager(scene) {
            this.programPaused = true;
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
                // I think we can use a single breakpoints array for all interpreters, because 
                // the breakpoint IDs are unique
                this.interpreters.push(this.robots[i].setProgram(programs[i], this.breakpoints));
            }
            this.updateDebugMode(this.debugMode);
            this.setSimRunButton(this.programPaused);
        };
        ProgramFlowManager.prototype.isProgramPaused = function () {
            return this.programPaused;
        };
        ProgramFlowManager.prototype.isDebugMode = function () {
            return this.debugMode;
        };
        ProgramFlowManager.prototype.setProgramPause = function (pause) {
            this.programPaused = pause;
            this.setSimRunButton(pause && !this.debugMode);
        };
        ProgramFlowManager.prototype.startProgram = function () {
            this.setProgramPause(false);
            this.setSimRunButton(true);
        };
        ProgramFlowManager.prototype.stopProgram = function () {
            this.setProgramPause(true);
            this.setSimRunButton(true);
            if (this.debugMode) {
                for (var i = 0; i < this.interpreters.length; i++) {
                    this.interpreters[i].removeHighlights();
                }
            }
            this.updateDebugMode(this.debugMode);
        };
        ProgramFlowManager.prototype.getSimVariables = function () {
            if (this.interpreters.length >= 1) {
                return this.interpreters[0].getVariables();
            }
            else {
                return {};
            }
        };
        ProgramFlowManager.prototype.updateSimVariables = function () {
            if ($("#simVariablesModal").attr('aria-hidden') == "false") {
                $("#variableValue").html("");
                var variables = this.getSimVariables();
                if (Object.keys(variables).length > 0) {
                    for (var v in variables) {
                        var value = variables[v][0];
                        this.addVariableValue(v, value);
                    }
                }
                else {
                    $('#variableValue').append('<div><label> No variables instantiated</label></div>');
                }
            }
        };
        ProgramFlowManager.prototype.addVariableValue = function (name, value) {
            switch (typeof value) {
                case "number": {
                    $("#variableValue").append('<div><label>' + name + ' :  </label><span> ' + Math.round(value * 100) / 100 + '</span></div>');
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
        };
        ProgramFlowManager.prototype.setSimRunButton = function (run) {
            $('#simControl').removeClass('typcn-media-stop').removeClass('typcn-media-play').removeClass('typcn-media-play-outline');
            if (run) {
                $('#simControl').addClass('typcn-media-play');
                $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
            }
            else {
                $('#simControl').addClass('typcn-media-stop');
                $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_STOP_TOOLTIP);
            }
        };
        /**
         * has to be called after one simulation run
         */
        ProgramFlowManager.prototype.update = function () {
            this.updateBreakpointEvent();
            if (this.allInterpretersTerminated() && !this.programPaused) {
                console.log('All programs terminated');
                this.stopProgram();
            }
            this.updateSimVariables();
        };
        ProgramFlowManager.prototype.allInterpretersTerminated = function () {
            var allTerminated = true;
            this.interpreters.forEach(function (ip) {
                if (!ip.isTerminated()) {
                    allTerminated = false;
                    return;
                }
            });
            return allTerminated;
        };
        /** adds/removes the ability for a block to be a breakpoint to a block */
        ProgramFlowManager.prototype.updateBreakpointEvent = function () {
            var _this = this;
            if (this.debugMode) {
                Blockly.getMainWorkspace().getAllBlocks(false).forEach(function (block) {
                    if (!$(block.svgGroup_).hasClass('blocklyDisabled')) {
                        if (_this.observers.hasOwnProperty(block.id)) {
                            _this.observers[block.id].disconnect();
                        }
                        var observer = new MutationObserver(function (mutations) {
                            mutations.forEach(function (mutation) {
                                if ($(block.svgGroup_).hasClass('blocklyDisabled')) {
                                    _this.removeBreakPoint(block);
                                    $(block.svgPath_).removeClass('breakpoint').removeClass('selectedBreakpoint');
                                }
                                else {
                                    if ($(block.svgGroup_).hasClass('blocklySelected')) {
                                        if ($(block.svgPath_).hasClass('breakpoint')) {
                                            _this.removeBreakPoint(block);
                                            $(block.svgPath_).removeClass('breakpoint');
                                        }
                                        else if ($(block.svgPath_).hasClass('selectedBreakpoint')) {
                                            _this.removeBreakPoint(block);
                                            $(block.svgPath_).removeClass('selectedBreakpoint').stop(true, true).animate({ 'fill-opacity': '1' }, 0);
                                        }
                                        else {
                                            _this.breakpoints.push(block.id);
                                            $(block.svgPath_).addClass('breakpoint');
                                        }
                                    }
                                }
                            });
                        });
                        _this.observers[block.id] = observer;
                        observer.observe(block.svgGroup_, { attributes: true });
                    }
                });
            }
            else {
                Blockly.getMainWorkspace().getAllBlocks(false).forEach(function (block) {
                    if (_this.observers.hasOwnProperty(block.id)) {
                        _this.observers[block.id].disconnect();
                    }
                    $(block.svgPath_).removeClass('breakpoint');
                });
            }
        };
        /** updates the debug mode for all interpreters */
        ProgramFlowManager.prototype.updateDebugMode = function (mode) {
            this.debugMode = mode;
            for (var i = 0; i < this.robots.length; i++) {
                this.interpreters[i].setDebugMode(mode);
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
                    this.interpreters[i].removeEvent(CONSTANTS.DEBUG_BREAKPOINT);
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
            var _this = this;
            Blockly.getMainWorkspace().getAllBlocks(false).forEach(function (block) {
                if (block.inTask && !block.disabled && !block.getInheritedDisabled()) {
                    $(block.svgPath_).stop(true, true).animate({ 'fill-opacity': '1' }, 0);
                }
            });
            this.breakpoints = [];
            this.debugMode = false;
            this.updateBreakpointEvent();
        };
        return ProgramFlowManager;
    }());
    exports.ProgramFlowManager = ProgramFlowManager;
});
