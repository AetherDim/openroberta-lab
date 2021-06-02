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
	1: 'idLineFollowingES',
	2: 'idLineFollowingMS',
	3: 'idLineFollowingHS',

	4: 'idLabyrinthES',
	5: 'idLabyrinthMS',
	6: 'idLabyrinthHS',

	7: 'idRainbowES',
	8: 'idRainbowMS',
	9: 'idRainbowHS',
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
		sceneIDMap[1]
	),

	new SceneDescriptor(
		'RRC - Line Following - MS',
		'Roborave Cyberspace line following MS',
		(descriptor) => {
			return new RRCLineFollowingScene(descriptor.name, AgeGroup.MS);
		},
		sceneIDMap[2]
	),

	new SceneDescriptor(
		'RRC - Line Following - HS',
		'Roborave Cyberspace line following HS',
		(descriptor) => {
			return new RRCLineFollowingScene(descriptor.name, AgeGroup.HS);
		},
		sceneIDMap[3]
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
		sceneIDMap[4]
	),

	new SceneDescriptor(
		'RRC - Labyrinth - MS',
		'Roborave Cyberspace Labyrinth MS',
		(descriptor) => {
			return new RRCLabyrinthScene(descriptor.name, AgeGroup.MS);
		},
		sceneIDMap[5]
	),

	new SceneDescriptor(
		'RRC - Labyrinth - HS',
		'Roborave Cyberspace Labyrinth HS',
		(descriptor) => {
			return new RRCLabyrinthScene(descriptor.name, AgeGroup.HS);
		},
		sceneIDMap[6]
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
		sceneIDMap[7]
	),

	new SceneDescriptor(
		'RRC - Rainbow - MS',
		'Roborave Cyberspace Rainbow MS',
		(descriptor) => {
			return new RRCRainbowScene(descriptor.name, AgeGroup.MS);
		},
		sceneIDMap[8]
	),

	new SceneDescriptor(
		'RRC - Rainbow - HS',
		'Roborave Cyberspace Rainbow HS',
		(descriptor) => {
			return new RRCRainbowScene(descriptor.name, AgeGroup.HS);
		},
		sceneIDMap[9]
	),
)

export const cyberspaceScenes = scenes