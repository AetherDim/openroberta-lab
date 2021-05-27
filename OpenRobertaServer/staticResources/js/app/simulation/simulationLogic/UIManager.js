define(["require", "exports", "blockly"], function (require, exports, Blockly) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UIManager = void 0;
    var UIManager = /** @class */ (function () {
        function UIManager() {
        }
        /**
         * Set the appearance of the program start/stop button to
         * - mode == "START": play button (triangle pointing to the right)
         * - mode == "STOP" : stop button (red square)
         */
        UIManager.setProgramRunButton = function (mode) {
            $('#simControl').removeClass('typcn-media-stop').removeClass('typcn-media-play').removeClass('typcn-media-play-outline');
            if (mode == "START") {
                $('#simControl').addClass('typcn-media-play');
                $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
            }
            else {
                $('#simControl').addClass('typcn-media-stop');
                $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_STOP_TOOLTIP);
            }
        };
        /**
         * Set the appearance of the simulation run button to
         * - mode == "START": outline flash/lightning
         * - mode == "STOP" : filled flash/lightning
         */
        UIManager.setSimulationRunButton = function (mode) {
            if (mode == "START") {
                $('#simFLowControl').addClass('typcn-flash-outline').removeClass('typcn-flash');
            }
            else {
                $('#simFLowControl').addClass('typcn-flash').removeClass('typcn-flash-outline');
            }
        };
        return UIManager;
    }());
    exports.UIManager = UIManager;
});
