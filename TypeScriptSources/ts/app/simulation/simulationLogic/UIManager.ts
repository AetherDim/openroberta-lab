
import Blockly = require("blockly");


export class UIManager {

	/**
	 * Set the appearance of the program run button to
	 * - run == true : e.g. play button
	 * - run == false: e.g. stop button
	 */
	static setProgramRunButton(run: boolean) {
		$('#simControl').removeClass('typcn-media-stop').removeClass('typcn-media-play').removeClass('typcn-media-play-outline');
		if (run) {
			$('#simControl').addClass('typcn-media-play');
			$('#simControl').attr('data-original-title', (<any>Blockly.Msg).MENU_SIM_START_TOOLTIP);
		} else {
			$('#simControl').addClass('typcn-media-stop');
			$('#simControl').attr('data-original-title', (<any>Blockly.Msg).MENU_SIM_STOP_TOOLTIP);
		}
	}

}