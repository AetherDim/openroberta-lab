import { Util } from "../Util";
import { RobertaRobotSetupData } from "../Robot/RobertaRobotSetupData";
import { sensorTypeStrings } from "../Robot/Robot";
import { RobotSetupData } from "../Robot/RobotSetupData";

export class SimulationCache {
	
	storedRobertaRobotSetupDataList: RobertaRobotSetupData[] = []
	storedRobotType: string = ""

	constructor(robertaRobotSetupDataList: RobertaRobotSetupData[], robotType: string) {
		
		// check that the configuration values ("TOUCH", "GYRO", ...) are also in `sensorTypeStrings`
		for (const setupData of robertaRobotSetupDataList) {
			const configuration = setupData.javaScriptConfiguration
			const allKeys = Object.keys(configuration)
			const allValues = Util.nonNullObjectValues(configuration)
			const wrongValueCount = allValues.find((e) => !sensorTypeStrings.includes(e))?.length ?? 0
			if (wrongValueCount > 0 || allKeys.filter((e) => typeof e === "number").length > 0) {
				console.error(`The 'configuration' has not the expected type. Configuration: ${configuration}`)
			}
		}

		this.storedRobertaRobotSetupDataList = robertaRobotSetupDataList
		this.storedRobotType = robotType
	}

	toRobotSetupData(): RobotSetupData[] {
		return this.storedRobertaRobotSetupDataList.map(setup => {
			return {
				sensorConfiguration: setup.javaScriptConfiguration,
				program: {
					javaScriptProgram: setup.javaScriptProgram
				}
		}})
	}

	hasEqualConfiguration(cache: SimulationCache): boolean {
		function toProgramEqualityObject(data: RobertaRobotSetupData): unknown {
			return {
				javaScriptConfiguration: data.javaScriptConfiguration
			}
		}
		return Util.deepEqual(
			this.storedRobertaRobotSetupDataList.map(toProgramEqualityObject),
			cache.storedRobertaRobotSetupDataList.map(toProgramEqualityObject))
	}

}