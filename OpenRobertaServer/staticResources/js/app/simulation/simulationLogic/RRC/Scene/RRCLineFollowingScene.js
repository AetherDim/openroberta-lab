var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./RRCScene", "../RRAssetLoader", "../AgeGroup", "../../Waypoints/WaypointList"], function (require, exports, RRCScene_1, RRC, AgeGroup_1, WaypointList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RRCLineFollowingScene = void 0;
    var RRCLineFollowingScene = /** @class */ (function (_super) {
        __extends(RRCLineFollowingScene, _super);
        function RRCLineFollowingScene() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // Waypoints
            _this.waypointsES = [
                {
                    x: 35,
                    y: 235,
                    w: 80,
                    h: 20,
                    score: 50
                }, {
                    x: 165,
                    y: 70,
                    w: 20,
                    h: 80,
                    score: 0
                }, {
                    x: 700,
                    y: 280,
                    w: 50,
                    h: 50,
                    score: 50
                }, {
                    x: 710,
                    y: 40,
                    w: 100,
                    h: 80,
                    score: 100
                }
            ];
            _this.waypointsMS = [
                {
                    x: 35,
                    y: 350,
                    w: 80,
                    h: 20,
                    score: 25
                }, {
                    x: 650,
                    y: 340,
                    w: 50,
                    h: 50,
                    score: 50
                }, {
                    x: 730,
                    y: 230,
                    w: 50,
                    h: 50,
                    score: 25
                }, {
                    x: 710,
                    y: 40,
                    w: 100,
                    h: 80,
                    score: 100
                }
            ];
            _this.waypointsHS = [
                {
                    x: 35,
                    y: 350,
                    w: 80,
                    h: 20,
                    score: 25
                }, {
                    x: 250,
                    y: 320,
                    w: 50,
                    h: 50,
                    score: 50
                }, {
                    x: 650,
                    y: 330,
                    w: 50,
                    h: 50,
                    score: 50
                }, {
                    x: 730,
                    y: 230,
                    w: 50,
                    h: 50,
                    score: 25
                }, {
                    x: 710,
                    y: 40,
                    w: 100,
                    h: 80,
                    score: 50
                }
            ];
            // Walls
            _this.wallES = {
                x: 720,
                y: 50,
                w: 70,
                h: 25
            };
            _this.wallMS = {
                x: 720,
                y: 50,
                w: 70,
                h: 25
            };
            _this.wallHS = {
                x: 720,
                y: 50,
                w: 70,
                h: 25
            };
            return _this;
        }
        RRCLineFollowingScene.prototype.getWaypoints = function () {
            switch (this.ageGroup) {
                case AgeGroup_1.AgeGroup.ES:
                    return this.waypointsES;
                case AgeGroup_1.AgeGroup.MS:
                    return this.waypointsMS;
                case AgeGroup_1.AgeGroup.HS:
                    return this.waypointsHS;
            }
        };
        RRCLineFollowingScene.prototype.getWall = function () {
            switch (this.ageGroup) {
                case AgeGroup_1.AgeGroup.ES:
                    return this.wallES;
                case AgeGroup_1.AgeGroup.MS:
                    return this.wallMS;
                case AgeGroup_1.AgeGroup.HS:
                    return this.wallHS;
            }
        };
        RRCLineFollowingScene.prototype.getAsset = function () {
            switch (this.ageGroup) {
                case AgeGroup_1.AgeGroup.ES:
                    return RRC.LINE_FOLLOWING_BACKGROUND_ES;
                case AgeGroup_1.AgeGroup.MS:
                    return RRC.LINE_FOLLOWING_BACKGROUND_MS;
                case AgeGroup_1.AgeGroup.HS:
                    return RRC.LINE_FOLLOWING_BACKGROUND_HS;
            }
        };
        RRCLineFollowingScene.prototype.onLoadAssets = function (chain) {
            RRC.loader.load(function () {
                chain.next();
            }, this.getAsset());
        };
        RRCLineFollowingScene.prototype.onInit = function (chain) {
            var _this = this;
            this.initRobot({ position: { x: 62, y: 450 }, rotation: -90 });
            // TODO: Change the waypoints
            var waypointList = new WaypointList_1.WaypointList();
            var waypoints = this.getWaypoints();
            waypoints.forEach(function (waypoint) {
                var x = waypoint.x + waypoint.w / 2;
                var y = waypoint.y + waypoint.h / 2;
                var r = Math.sqrt(Math.pow(waypoint.w, 2) + Math.pow(waypoint.h, 2));
                var wp = _this.makeWaypoint({ x: x, y: y }, waypoint.score, r);
                waypointList.appendWaypoints(wp);
            });
            waypointList.appendReversedWaypoints();
            this.setWaypointList(waypointList);
            var goal = RRC.loader.get(this.getAsset()).texture;
            this.goalSprite = new PIXI.Sprite(goal);
            this.groundContainer.addChild(this.goalSprite);
            this.addStaticWallInPixels(this.getWall());
            this.addWalls(true);
            chain.next();
        };
        return RRCLineFollowingScene;
    }(RRCScene_1.RRCScene));
    exports.RRCLineFollowingScene = RRCLineFollowingScene;
});
