//
// register scenes

import { SceneDescriptor } from "../Cyberspace/SceneManager";
import { DEBUG } from "../GlobalDebug";
import { AgeGroup } from "../RRC/AgeGroup";
import { RRCLabyrinthScene } from "../RRC/Scene/RRCLabyrinthScene";
import { RRCLineFollowingScene } from "../RRC/Scene/RRCLineFollowingScene";
import { RRCRainbowScene } from "../RRC/Scene/RRCRainbowScene";
import { RRCScene } from "../RRC/Scene/RRCScene";
import { Scene } from "../Scene/Scene";
import { TestScene } from "../Scene/TestScene";
import { TestScene2 } from "../Scene/TestScene2";
import { TestScene3 } from "../Scene/TestScene3";


let scenes: SceneDescriptor[] = []
//
if(DEBUG)

	//
	// Test
	//
	scenes.push(
		new SceneDescriptor(
		'Test Scene',
		'Test scene with all sim features',
		(descriptor) => {
				return new TestScene(descriptor.name);
			}
		),

		new SceneDescriptor(
			"Test Scene 2", "Test scene for testing different sensor configurations",
			(descriptor) => new TestScene2(descriptor.name, AgeGroup.ES)
		),

		new SceneDescriptor(
			"Test Scene 3", "Test scene for generating calibration data for the robot",
			(descriptor) => new TestScene3()
		),

		new SceneDescriptor(
			'Empty Scene',
			'Empty Scene',
			(descriptor) => {
				return new Scene(descriptor.name);
			}
		),

		new SceneDescriptor(
			'RRC - Test Scene',
			'Roborave Cyberspace Test',
			(descriptor) => {
				return new RRCScene(descriptor.name, AgeGroup.ES);
			}
		)
	)







export const sceneIDMap = {
	2: {
		0: 'idLineFollowingES',
		1: 'idLineFollowingMS',
		2: 'idLineFollowingHS',
	},
	1: {
		0: 'idLabyrinthES',
		1: 'idLabyrinthMS',
		2: 'idLabyrinthHS',
	},
	3: {
		0: 'idRainbowES',
		1: 'idRainbowMS',
		2: 'idRainbowHS',
	},
}



	//
	//  Line Following
	//
scenes.push(
	new SceneDescriptor(
		'RRC - Line Following - ES',
		'Roborave Cyberspace line following ES',
		(descriptor) => {
			return new RRCLineFollowingScene(descriptor.name, AgeGroup.ES);
		},
		sceneIDMap[2][0]
	),

	new SceneDescriptor(
		'RRC - Line Following - MS',
		'Roborave Cyberspace line following MS',
		(descriptor) => {
			return new RRCLineFollowingScene(descriptor.name, AgeGroup.MS);
		},
		sceneIDMap[2][1]
	),

	new SceneDescriptor(
		'RRC - Line Following - HS',
		'Roborave Cyberspace line following HS',
		(descriptor) => {
			return new RRCLineFollowingScene(descriptor.name, AgeGroup.HS);
		},
		sceneIDMap[2][2]
	),

	//
	// Labyrinth
	//

	new SceneDescriptor(
		'RRC - Labyrinth - ES',
		'Roborave Cyberspace Labyrinth ES',
		(descriptor) => {
			return new RRCLabyrinthScene(descriptor.name, AgeGroup.ES);
		},
		sceneIDMap[1][0]
	),

	new SceneDescriptor(
		'RRC - Labyrinth - MS',
		'Roborave Cyberspace Labyrinth MS',
		(descriptor) => {
			return new RRCLabyrinthScene(descriptor.name, AgeGroup.MS);
		},
		sceneIDMap[1][1]
	),

	new SceneDescriptor(
		'RRC - Labyrinth - HS',
		'Roborave Cyberspace Labyrinth HS',
		(descriptor) => {
			return new RRCLabyrinthScene(descriptor.name, AgeGroup.HS);
		},
		sceneIDMap[1][2]
	),


	//
	// Rainbow
	//

	new SceneDescriptor(
		'RRC - Rainbow - ES',
		'Roborave Cyberspace Rainbow ES',
		(descriptor) => {
			return new RRCRainbowScene(descriptor.name, AgeGroup.ES);
		},
		sceneIDMap[3][0]
	),

	new SceneDescriptor(
		'RRC - Rainbow - MS',
		'Roborave Cyberspace Rainbow MS',
		(descriptor) => {
			return new RRCRainbowScene(descriptor.name, AgeGroup.MS);
		},
		sceneIDMap[3][1]
	),

	new SceneDescriptor(
		'RRC - Rainbow - HS',
		'Roborave Cyberspace Rainbow HS',
		(descriptor) => {
			return new RRCRainbowScene(descriptor.name, AgeGroup.HS);
		},
		sceneIDMap[3][2]
	),
)

export const cyberspaceScenes = scenes