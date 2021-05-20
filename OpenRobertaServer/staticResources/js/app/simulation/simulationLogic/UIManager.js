define(["require", "exports", "blockly"], function (require, exports, Blockly) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UIManager = void 0;
    var UIManager = /** @class */ (function () {
        function UIManager() {
        }
        /**
         * Set the appearance of the program run button to
         * - run == true : e.g. play button
         * - run == false: e.g. stop button
         */
        UIManager.setProgramRunButton = function (run) {
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
        return UIManager;
    }());
    exports.UIManager = UIManager;
});
