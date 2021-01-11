import { Body, World } from "matter-js";
import { createRect } from "../../Displayable";
import { AsyncChain } from "../../Scene/Scene";
import { Unit } from "../../Unit";
import { AgeGroup } from "../AgeGroup";
import {RRCScene} from "./RRCScene";
import * as RRC from '../RRAssetLoader'

class LabyrinthRect {
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
    color: number;

    constructor(labyrinthRect: LabyrinthRect) {
        this.x = labyrinthRect.x
        this.y = labyrinthRect.y
        this.w = labyrinthRect.w
        this.h = labyrinthRect.h
        this.rotation = labyrinthRect.rotation
        this.color = labyrinthRect.color
    }
}

export class RRCLabyrinthScene extends RRCScene {

    readonly MazeObstacleList_ES: LabyrinthRect[] = [{ // add obstacles with lists like this
        x: 500,
        y: 100,
        w: 200,
        h: 5,
        rotation: 0,
        color: 0x000000
    }, {
        x: 400,
        y: 0,
        w: 5,
        h: 200,
        rotation: 0,
        color: 0x000000
    }, {
        x: 400,
        y: 200,
        w: 200,
        h: 5,
        rotation: 0,
        color: 0x000000
    }, {
        x: 600,
        y: 200,
        w: 5,
        h: 250,
        rotation: 0,
        color: 0x000000
    }, {
        x: 400,
        y: 450,
        w: 200,
        h: 5,
        rotation: 0,
        color: 0x000000
    }, {
        x: 300,
        y: 100,
        w: 5,
        h: 450,
        rotation: 0,
        color: 0x000000
    }, {
        x: 300,
        y: 300,
        w: 200,
        h: 50,
        rotation: 0,
        color: 0x111111
    }, {
        x: 200,
        y: 0,
        w: 5,
        h: 350,
        rotation: 0,
        color: 0x000000
    }, {
        x: 100,
        y: 450,
        w: 200,
        h: 5,
        rotation: 0,
        color: 0x000000
    }, {
        x: 100,
        y: 100,
        w: 5,
        h: 350,
        rotation: 0,
        color: 0x000000
    }];

    MazeObstacleList_MS: LabyrinthRect[] = [{ // add obstacles with lists like this
        x: 500,
        y: 100,
        w: 200,
        h: 5,
        rotation: 0,
        color: 0x000000
    }, {
        x: 400,
        y: 0,
        w: 5,
        h: 200,
        rotation: 0,
        color: 0x000000
    }, {
        x: 400,
        y: 200,
        w: 200,
        h: 5,
        rotation: 0,
        color: 0x000000
    }, {
        x: 600,
        y: 200,
        w: 5,
        h: 250,
        rotation: 0,
        color: 0x000000
    }, {
        x: 400,
        y: 450,
        w: 200,
        h: 5,
        rotation: 0,
        color: 0x000000
    }, {
        x: 300,
        y: 100,
        w: 5,
        h: 450,
        rotation: 0,
        color: 0x000000
    }, {
        x: 300,
        y: 300,
        w: 200,
        h: 5,
        rotation: 0,
        color: 0x000000
    }, {
        x: 400,
        y: 300,
        w: 100,
        h: 50,
        rotation: 0,
        color: 0x111111
    }, {
        x: 200,
        y: 0,
        w: 5,
        h: 350,
        rotation: 0,
        color: 0x000000
    }, {
        x: 100,
        y: 450,
        w: 200,
        h: 5,
        rotation: 0,
        color: 0x000000
    }, {
        x: 100,
        y: 100,
        w: 5,
        h: 350,
        rotation: 0,
        color: 0x000000
    }];

    MazeObstacleList_HS: LabyrinthRect[] = [{ // add obstacles with lists like this
        x: 600,
        y: 100,
        w: 100,
        h: 5,
        rotation: 0,
        color: 0x000000
    }, {
        x: 400,
        y: 100,
        w: 100,
        h: 5,
        rotation: 0,
        color: 0x000000
    }, {
        x: 400,
        y: 0,
        w: 5,
        h: 100,
        rotation: 0,
        color: 0x000000
    }, {
        x: 500,
        y: 100,
        w: 5,
        h: 100,
        rotation: 0,
        color: 0x000000
    }, {
        x: 500,
        y: 200,
        w: 100,
        h: 5,
        rotation: 0,
        color: 0x000000
    }, {
        x: 600,
        y: 200,
        w: 5,
        h: 250,
        rotation: 0,
        color: 0x000000
    }, {
        x: 400,
        y: 450,
        w: 200,
        h: 5,
        rotation: 0,
        color: 0x000000
    }, {
        x: 300,
        y: 100,
        w: 5,
        h: 450,
        rotation: 0,
        color: 0x000000
    }, {
        x: 300,
        y: 300,
        w: 200,
        h: 50,
        rotation: 0,
        color: 0x111111
    }, {
        x: 300,
        y: 200,
        w: 100,
        h: 5,
        rotation: 0,
        color: 0x000000
    }, {
        x: 200,
        y: 0,
        w: 5,
        h: 350,
        rotation: 0,
        color: 0x000000
    }, {
        x: 100,
        y: 450,
        w: 200,
        h: 5,
        rotation: 0,
        color: 0x000000
    }, {
        x: 100,
        y: 100,
        w: 5,
        h: 350,
        rotation: 0,
        color: 0x000000
    }];


    addLabyrinth(labyrinth: LabyrinthRect[]) {
        labyrinth.forEach(rect => {
            const x = Unit.fromLength(rect.x);
            const y = Unit.fromLength(rect.y);
            const w = Unit.fromLength(rect.w);
            const h = Unit.fromLength(rect.h);
            const body: Body = createRect(x + w/2, y + h/2, w, h, 0, {color: rect.color, strokeColor: rect.color});
            body.displayable!.rotation = rect.rotation;
            Body.setStatic(body, true);
            body.enableMouseInteraction = true;
            World.add(this.engine.world, body);
        });
    }

    onLoadAssets(chain: AsyncChain) {
        RRC.loader.load(() => {
            chain.next();
        },
            this.getAsset()
        );
    }

    getAsset() {
        switch (this.ageGroup) {
            case AgeGroup.ES:
                return RRC.LABYRINTH_BLANK_BACKGROUND_ES;

            case AgeGroup.MS:
                return RRC.LABYRINTH_BLANK_BACKGROUND_MS;

            case AgeGroup.HS:
                return RRC.LABYRINTH_BLANK_BACKGROUND_HS;
        }
    }

    onInit(chain: AsyncChain) {

        this.initRobot();

        let goal = RRC.loader.get(this.getAsset()).texture;
        this.goalSprite = new PIXI.Sprite(goal);

        this.groundContainer.addChild(this.goalSprite);

        switch (this.ageGroup) {
            case AgeGroup.ES:
                this.addLabyrinth(this.MazeObstacleList_ES);
                break;
        
            case AgeGroup.MS:
                this.addLabyrinth(this.MazeObstacleList_MS);
                break;

            case AgeGroup.HS:
                this.addLabyrinth(this.MazeObstacleList_HS);
                break;
        }

        chain.next();
    }



}