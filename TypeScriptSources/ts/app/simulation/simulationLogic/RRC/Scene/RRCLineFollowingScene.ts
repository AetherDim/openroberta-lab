import {RRCScene} from "./RRCScene";
import { AsyncChain } from "../../Scene/AsyncChain";
import * as RRC from '../RRAssetLoader'
import {AgeGroup} from "../AgeGroup";
import { WaypointList } from "../../Waypoints/WaypointList";

export class RRCLineFollowingScene extends RRCScene {


    getAsset() {
        switch (this.ageGroup) {
            case AgeGroup.ES:
                return RRC.LINE_FOLLOWING_BACKGROUND_ES;

            case AgeGroup.MS:
                return RRC.LINE_FOLLOWING_BACKGROUND_MS;

            case AgeGroup.HS:
                return RRC.LINE_FOLLOWING_BACKGROUND_HS;
        }
    }

    onLoadAssets(chain: AsyncChain) {
        RRC.loader.load(() => {
            chain.next();
        },
            this.getAsset()
        );
    }

    onInit(chain: AsyncChain) {
        this.initRobot({ position: {x: 62, y: 450 }, rotation: -90 });

        // TODO: Change the waypoints
        const waypoints = new WaypointList([
            this.makeWaypoint({x: 62, y: 300 }, 100),
            this.makeWaypoint({x: 200, y: 300 }, 100),
            this.makeEndWaypoint({x: 200, y: 450 }, 100),
        ])
        this.setWaypointList(waypoints)

        let goal = RRC.loader.get(this.getAsset()).texture;
        this.goalSprite = new PIXI.Sprite(goal);

        this.groundContainer.addChild(this.goalSprite);

        this.addWalls(true);

        chain.next();
    }


}