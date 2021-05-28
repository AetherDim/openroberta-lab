define(["require", "exports", "blockly", "./Timer"], function (require, exports, Blockly, Timer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BlocklyDebug = void 0;
    var BlocklyDebug = /** @class */ (function () {
        function BlocklyDebug(cyberspace) {
            var _this_1 = this;
            this.observers = {};
            /**
             * sleep time before calling blockly update
             */
            this.blocklyUpdateSleepTime = 1 / 10;
            this.cyberspace = cyberspace;
            var _this = this;
            this.blocklyTicker = new Timer_1.Timer(this.blocklyUpdateSleepTime, function (delta) {
                // update blockly
                _this.updateBreakpointEvent();
                // update sim variables if some interpreter is running
                var allTerminated = _this.cyberspace.getProgramManager().allInterpretersTerminated();
                if (!allTerminated) {
                    _this_1.updateSimVariables();
                }
            });
            this.startBlocklyUpdate();
        }
        BlocklyDebug.prototype.removeBreakPoint = function (block) {
            this.cyberspace.getProgramManager().removeBreakpoint(block.id);
        };
        BlocklyDebug.prototype.addBreakpoint = function (block) {
            this.cyberspace.getProgramManager().addBreakpoint(block.id);
        };
        BlocklyDebug.prototype.isDebugMode = function () {
            return this.cyberspace.getProgramManager().isDebugMode();
        };
        BlocklyDebug.prototype.startBlocklyUpdate = function () {
            this.blocklyTicker.start();
        };
        BlocklyDebug.prototype.stopBlocklyUpdate = function () {
            this.blocklyTicker.stop();
        };
        BlocklyDebug.prototype.setBlocklyUpdateSleepTime = function (simSleepTime) {
            this.blocklyUpdateSleepTime = simSleepTime;
            this.blocklyTicker.sleepTime = simSleepTime;
        };
        BlocklyDebug.prototype.updateSimVariables = function () {
            if ($("#simVariablesModal").attr('aria-hidden') == "false") {
                $("#variableValue").html("");
                var variables = this.cyberspace.getProgramManager().getSimVariables();
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
        BlocklyDebug.prototype.addVariableValue = function (name, value) {
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
        BlocklyDebug.prototype.setDebugMode = function (mode) {
            var _this_1 = this;
            if (mode) {
                this.cyberspace.getProgramManager().startDebugging();
            }
            else {
                Blockly.getMainWorkspace().getAllBlocks(false).forEach(function (block) {
                    if (_this_1.observers.hasOwnProperty(block.id)) {
                        _this_1.observers[block.id].disconnect();
                    }
                    $((block).svgPath_).removeClass('breakpoint');
                    if (block.inTask && !block.disabled && !block.getInheritedDisabled()) {
                        $(block.svgPath_).stop(true, true).animate({ 'fill-opacity': '1' }, 0);
                    }
                });
                this.cyberspace.getProgramManager().endDebugging();
            }
        };
        /** adds/removes the ability for a block to be a breakpoint to a block */
        BlocklyDebug.prototype.updateBreakpointEvent = function () {
            var _this = this;
            if (!Blockly.getMainWorkspace()) {
                // blockly workspace not initialized
                return;
            }
            if (this.isDebugMode()) {
                Blockly.getMainWorkspace().getAllBlocks(false).forEach(function (realBlock) {
                    var block = realBlock;
                    if (!$(block.svgGroup_).hasClass('blocklyDisabled')) {
                        if (_this.observers.hasOwnProperty(block.id)) {
                            _this.observers[realBlock.id].disconnect();
                        }
                        var observer = new MutationObserver(function (mutations) {
                            mutations.forEach(function (mutation) {
                                if ($(block.svgGroup_).hasClass('blocklyDisabled')) {
                                    _this.removeBreakPoint(realBlock);
                                    $(block.svgPath_).removeClass('breakpoint').removeClass('selectedBreakpoint');
                                }
                                else {
                                    if ($(block.svgGroup_).hasClass('blocklySelected')) {
                                        if ($(block.svgPath_).hasClass('breakpoint')) {
                                            _this.removeBreakPoint(realBlock);
                                            $(block.svgPath_).removeClass('breakpoint');
                                        }
                                        else if ($(block.svgPath_).hasClass('selectedBreakpoint')) {
                                            _this.removeBreakPoint(realBlock);
                                            $(block.svgPath_).removeClass('selectedBreakpoint').stop(true, true).animate({ 'fill-opacity': '1' }, 0);
                                        }
                                        else {
                                            _this.addBreakpoint(realBlock);
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
        };
        BlocklyDebug.prototype.startProgram = function () {
            this.cyberspace.getProgramManager().startProgram();
        };
        BlocklyDebug.prototype.stopProgram = function () {
            this.cyberspace.getProgramManager().stopProgram();
        };
        BlocklyDebug.prototype.interpreterAddEvent = function (mode) {
            this.cyberspace.getProgramManager().interpreterAddEvent(mode);
        };
        return BlocklyDebug;
    }());
    exports.BlocklyDebug = BlocklyDebug;
});
