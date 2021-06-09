import {Robot} from "../../Robot/Robot";
import {ProgramManager} from "./ProgramManager";
import {Scene} from "../Scene";
import { RobotConfigurationManager } from "./RobotConfigurationManager";


export class RobotManager {

	private readonly scene: Scene

	constructor(scene: Scene) {
		this.scene = scene
	}

	/**
	 * Represents the number of robots after this scene has been initialized.
	 * The GUI needs this information before the scene has finished loading.
	 * @protected
	 */
	protected numberOfRobots = 1;

	private showRobotSensorValues = true

	/**
	 * All programmable robots within the scene.
	 * The program flow manager will use the robots internally.
	 */
	private readonly robots: Array<Robot> = new Array<Robot>();

	readonly programManager = new ProgramManager(this);
	readonly configurationManager = new RobotConfigurationManager(this.robots)

	getProgramManager(): ProgramManager {
		return this.programManager;
	}

	getRobots(): Robot[] {
		return this.robots;
	}

	/**
	 * Adds `robot` to scene (to `robots` array and entities)
	 */
	addRobot(robot: Robot) {
		this.robots.push(robot)
		this.scene.getEntityManager().addEntity(robot)
		this.configurationManager.safeUpdateLastRobot()
	}

	getNumberOfRobots(): number {
		return this.robots.length;
	}

	updateSensorValueView() {
		// TODO: refactor this, the simulation should not have a html/div dependency
		// update sensor value html
		
		if (this.showRobotSensorValues && $('#simValuesModal').is(':visible')) {
			const htmlElement = $('#notConstantValue')
			htmlElement.html('');
			const elementList: { label: string, value: any }[] = []

			elementList.push({label: 'Simulation tick rate:', value: this.scene.getCurrentSimTickRate()})

			this.robots.forEach(robot => robot.addHTMLSensorValuesTo(elementList))
			const htmlString = elementList.map(element => this.htmlSensorValues(element.label, element.value)).join("")
			htmlElement.append(htmlString)
		}
	}

	private htmlSensorValues(label: String, value: any): string {
		return `<div><label>${label}</label><span>${value}</span></div>`
	}

	/**
	 * remove all robots
	 */
	clear() {
		this.robots.length = 0;
	}
	
}