import { Cyberspace } from "../Cyberspace/Cyberspace"
import { clearDebugGuiRoot, DebugGuiRoot } from "../GlobalDebug"
import { RobertaRobotSetupData } from "../Robot/RobertaRobotSetupData"
import { RobotProgramGenerator } from "../Robot/RobotProgramGenerator"
import { RobotSetupData } from "../Robot/RobotSetupData"
import { UIManager } from "../UIManager"
import { Util } from "../Util"
import { cyberspaceScenes } from "./SceneDesciptorList"


const cyberspaces: Cyberspace[] = []

const simDiv = document.getElementById("simDiv")!
if (simDiv == null) {
	console.error("There is no 'simDiv' element.")
}

const multiCyberspaceDiv = document.createElement("div")
multiCyberspaceDiv.style.backgroundColor = "rgb(50, 50, 50)"
multiCyberspaceDiv.style.width = "100%"
multiCyberspaceDiv.style.height = "100%"
simDiv.appendChild(multiCyberspaceDiv)

//simDiv.style.backgroundColor = "black"
const sceneDescriptors = cyberspaceScenes

class CyberspaceData {
	cyberspace: Cyberspace
	divElement: HTMLElement

	constructor(cyberspace: Cyberspace, divElement: HTMLElement) {
		this.cyberspace = cyberspace
		this.divElement = divElement
	}
}

function createCyberspaceData(index: number): CyberspaceData {
	const canvas = document.createElement("canvas")
	const cyberspaceDiv = document.createElement("div")
	//cyberspaceDiv.style.padding = "4px"
	cyberspaceDiv.appendChild(canvas)

	const cyberspace = new Cyberspace(canvas, cyberspaceDiv, [sceneDescriptors[index]])
	cyberspace.switchToNextScene(true)
	return new CyberspaceData(cyberspace, cyberspaceDiv)
}

function setGridStyle(gridElements: HTMLElement[][], opt?: { relativePadding?: number }) {
	const relativePadding = opt?.relativePadding ?? 0

	const heightCount = gridElements.length
	const height = (100 - relativePadding) / heightCount
	const heightStr = String(height - relativePadding) + "%"
	for (let y = 0; y < heightCount; y++) {
		const widthCount = gridElements[y].length
		const width = (100 - relativePadding) / widthCount
		const widthStr = String(width - relativePadding ) + "%"
		const topStr = String(y * height + relativePadding) + "%"
		for (let x = 0; x < widthCount; x++) {
			const style = gridElements[y][x].style
			style.left = String(x * width + relativePadding) + "%"
			style.top = topStr
			style.width = widthStr
			style.height = heightStr
			style.position = "absolute"
		}
	}
}

let sceneCount = 4
const aspectRatio = {
	window: 16/9,
	scene: 16/9
}

function generateDebugRobertaRobotSetupData(count: number): RobertaRobotSetupData[] {
	return Util.range(0, count).map(index => {
		return {
			javaScriptConfiguration: {
				"1": "TOUCH",
				"3": "COLOR"
			},
			javaScriptProgram: RobotProgramGenerator.generateProgram([
				RobotProgramGenerator.driveForwardOpCodes(100, 0.1 * index + 0.1)
			]).javaScriptProgram
		}
	})
}

type MultiCyberspaceSetupData = { sceneID: number, robertaRobotSetupData: RobertaRobotSetupData }

function generateRandomMultiSetupData(count: number): MultiCyberspaceSetupData[] {
	return generateDebugRobertaRobotSetupData(count).map(robertaRobotSetupData => {
		return {
			sceneID: 0,
			robertaRobotSetupData: robertaRobotSetupData
		}
	})
}

function startPrograms() {
	cyberspaces.forEach(cyberspace => cyberspace.startPrograms())
}

function loadScenes(setupDataList: MultiCyberspaceSetupData[]) {

	// clear complete debug
	clearDebugGuiRoot()

	// add my debug
	const debug = DebugGuiRoot
	if (debug != undefined) {
		debug.addButton("Add scene", () => {
			sceneCount += 1
			loadScenes(generateRandomMultiSetupData(sceneCount))
		})
		debug.addButton("Remove scene", () => {
			if (sceneCount > 0) {
				sceneCount -= 1
				loadScenes(generateRandomMultiSetupData(sceneCount))
			}
		})
		debug.addButton("Reload", () => {
			loadScenes(generateRandomMultiSetupData(sceneCount))
		})
		debug.addButton("Start programs", () => {
			startPrograms()
		})
		debug.add(aspectRatio, "window", 0.1, 2)
		debug.add(aspectRatio, "scene", 0.1, 2)
	}


	const cyberspaceDataList = setupDataList.map(setupData => {
		const cyberspaceData = createCyberspaceData(setupData.sceneID)
		cyberspaceData.cyberspace.getScene().runAfterLoading(() => {
			cyberspaceData.cyberspace.setRobertaRobotSetupData([setupData.robertaRobotSetupData], "")
		})
		return cyberspaceData
	})
	const divElements = cyberspaceDataList.map(data => data.divElement)
	// remove all cyberspace div nodes
	while (multiCyberspaceDiv.hasChildNodes()) {
		multiCyberspaceDiv.lastChild?.remove()
	}
	// add new cyberspace div nodes
	divElements.forEach(element =>
		multiCyberspaceDiv.appendChild(element)	
	)
	// destroy all cyberspaces
	cyberspaces.forEach(cyberspace => {
		cyberspace.destroy()
	})
	cyberspaces.length = 0
	cyberspaces.push(...cyberspaceDataList.map(data => data.cyberspace))

	const windowAspectRatio = aspectRatio.window
	const sceneAspectRatio = aspectRatio.scene
	// given
	//   - divCount: int
	//   - windowAspectRatio: float
	// unknown
	//   - heightCount: int
	//   - widthCount: int
	//
	// windowAspectRatio = (widthCount * sceneWidth) / (heightCount * sceneHeight)
	//                   = widthCount / heightCount * sceneAspectRatio
	// <=> widthCount = heightCount * windowAspectRatio / sceneAspectRatio
	//
	//     divCount <= heightCount * widthCount
	// <=> divCount <= heightCount * (heightCount * windowAspectRatio / sceneAspectRatio)
	// <=> sqrt(divCount * sceneAspectRatio / windowAspectRatio) <= heightCount
	// or
	// <=> sqrt(divCount / sceneAspectRatio * windowAspectRatio) <= widthCount
	const divCount = divElements.length
	// const heightCount = Math.ceil(Math.sqrt(divElements.length * sceneAspectRatio / windowAspectRatio))
	// const widthCount = Math.ceil(divCount / heightCount)
	const widthCount = Math.ceil(Math.sqrt(divElements.length / sceneAspectRatio * windowAspectRatio))

	const indices = Util.range(0, divCount)
	setGridStyle(
		Util.map2D(
			Util.reshape1Dto2D(indices, widthCount)
			, index => divElements[index]
		)
		, {
			relativePadding: 1
		}
	)
}

loadScenes(generateRandomMultiSetupData(sceneCount))



function requestRobotSetupData(ids: number[]): Promise<RobotSetupData[]> {
	// TODO
	return new Promise((resolve, reject) => {

	})
}

// called only once
export function init(robotSetupDataIDs: number[], secretKey: string) {
	requestRobotSetupData(robotSetupDataIDs).then(robotSetupDataList => {
		// TODO
	})


}

function forEachCyberspace(block: (cyberspace: Cyberspace) => void) {
	cyberspaces.forEach(block)
}

function setPause(pause: boolean) {
	if(pause) {
		forEachCyberspace(c => c.pausePrograms())
	} else {
		forEachCyberspace(c => c.startPrograms())
	}
}

// TODO: Remove?
function run(refresh: boolean, robotType: any) {
	console.log("run!")
}

/**
 * on stop program
 */
function stopProgram() {
	forEachCyberspace(c => c.stopPrograms())
}

/**
 * Reset robot position and zoom of ScrollView
 */
function resetPose() {
	forEachCyberspace(c => c.resetScene())
}

function sim(run: boolean) {
	if(run) {
		forEachCyberspace(c => c.startSimulation())
	} else {
		forEachCyberspace(c => c.pauseSimulation())
	}
}

function score(showScore: boolean) {
	if(showScore) {
		// TODO: show score
	} else {
		// TODO: hide score
	}
}

function zoomIn() {
	forEachCyberspace(c => c.zoomViewIn())
}

function zoomOut() {
	forEachCyberspace(c => c.zoomViewOut())
}

function zoomReset() {
	forEachCyberspace(c => c.resetView())
}

function setSimSpeed(speedup: number) {
	forEachCyberspace(c => c.setSimulationSpeedupFactor(speedup))
}

function setDefaultButtonState() {
	// do not set 'simSpeedUpButton' since the state will be preserved
	UIManager.programControlButton.setState("start")
	UIManager.showScoreButton.setState("showScore")
	UIManager.physicsSimControlButton.setState("stop")
}

export function initEvents() {

	setDefaultButtonState()

	UIManager.programControlButton.onClick(state => {
		if (state == "start") {
			// run(true, ...) // cannot get robot type
			setPause(false)
		} else {
			// setPause(true) // not needed
			stopProgram()
		}
	})

	UIManager.showScoreButton.onClick(state =>
		score(state == "showScore"))

	UIManager.physicsSimControlButton.onClick(state =>
		sim(state == "start"))

	UIManager.simSpeedUpButton.setState("fastForward")
	UIManager.simSpeedUpButton.onClick(state =>
		setSimSpeed(state == "fastForward" ? 10 : 1))

	UIManager.resetSceneButton.onClick(() => {
		setDefaultButtonState()
		resetPose()
	})
	UIManager.zoomOutButton.onClick(zoomOut)
	UIManager.zoomInButton.onClick(zoomIn)
	UIManager.zoomResetButton.onClick(zoomReset)

}