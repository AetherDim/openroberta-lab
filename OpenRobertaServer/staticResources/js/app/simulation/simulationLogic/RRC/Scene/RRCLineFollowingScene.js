var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./RRCScene", "../RRAssetLoader", "../AgeGroup", "../../Waypoints/WaypointList", "../../Util"], function (require, exports, RRCScene_1, RRC, AgeGroup_1, WaypointList_1, Util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RRCLineFollowingScene = void 0;
    var RRCLineFollowingScene = /** @class */ (function (_super) {
        __extends(RRCLineFollowingScene, _super);
        function RRCLineFollowingScene() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.bigWaypointSize = 70;
            // Waypoints
            _this.waypointsES = [
                RRCScene_1.wp(62, 470, 0),
                RRCScene_1.wp(62, 360, 0),
                RRCScene_1.wp(62, 280, 0),
                RRCScene_1.wp(62, 200, 0),
                RRCScene_1.wp(105, 128, 0),
                RRCScene_1.wp(156, 115, 0),
                RRCScene_1.wp(259, 154, 0),
                RRCScene_1.wp(266, 191, 0),
                RRCScene_1.wp(258, 237, 0),
                RRCScene_1.wp(207, 339, 0),
                RRCScene_1.wp(228, 399, 0),
                RRCScene_1.wp(282, 434, 0),
                RRCScene_1.wp(338, 435, 0),
                RRCScene_1.wp(397, 395, 0),
                RRCScene_1.wp(421, 346, 0),
                RRCScene_1.wp(472, 309, 0),
                RRCScene_1.wp(559, 307, 0),
                RRCScene_1.wp(671, 309, 0),
                RRCScene_1.wp(735, 280, 0),
                RRCScene_1.wp(753, 184, 0),
                RRCScene_1.wp(756, 121, 0),
                RRCScene_1.wp(755, 60, 0),
            ];
            _this.waypointsMS = [
                RRCScene_1.wp(62, 470, 0),
                RRCScene_1.wp(62, 360, 0),
                RRCScene_1.wp(62, 280, 0),
                RRCScene_1.wp(86, 226, 0),
                RRCScene_1.wp(146, 226, 0),
                RRCScene_1.wp(191, 253, 0),
                RRCScene_1.wp(245, 310, 0),
                RRCScene_1.wp(258, 326, 0),
                RRCScene_1.wp(300, 373, 0),
                RRCScene_1.wp(367, 419, 0),
                RRCScene_1.wp(432, 384, 0),
                RRCScene_1.wp(435, 333, 0),
                RRCScene_1.wp(434, 268, 0),
                RRCScene_1.wp(465, 221, 0),
                RRCScene_1.wp(519, 219, 0),
                RRCScene_1.wp(592, 291, 0),
                RRCScene_1.wp(608, 312, 0),
                RRCScene_1.wp(643, 350, 0),
                RRCScene_1.wp(706, 348, 0),
                RRCScene_1.wp(740, 325, 0),
                RRCScene_1.wp(751, 300, 0),
                RRCScene_1.wp(757, 252, 0),
                RRCScene_1.wp(753, 184, 0),
                RRCScene_1.wp(756, 121, 0),
                RRCScene_1.wp(755, 60, 0),
            ];
            _this.waypointsHS = [
                RRCScene_1.wp(62, 470, 0),
                RRCScene_1.wp(62, 360, 0),
                RRCScene_1.wp(62, 280, 0),
                RRCScene_1.wp(86, 226, 0),
                RRCScene_1.wp(146, 226, 0),
                RRCScene_1.wp(191, 253, 0),
                RRCScene_1.wp(245, 310, 0),
                RRCScene_1.wp(258, 326, 0),
                RRCScene_1.wp(253, 253, 0),
                RRCScene_1.wp(271, 220, 0),
                RRCScene_1.wp(319, 223, 0),
                RRCScene_1.wp(346, 259, 0),
                RRCScene_1.wp(378, 310, 0),
                RRCScene_1.wp(412, 366, 0),
                RRCScene_1.wp(469, 419, 0),
                RRCScene_1.wp(510, 372, 0),
                RRCScene_1.wp(509, 329, 0),
                RRCScene_1.wp(510, 289, 0),
                RRCScene_1.wp(512, 255, 0),
                RRCScene_1.wp(537, 217, 0),
                RRCScene_1.wp(586, 237, 0),
                RRCScene_1.wp(612, 281, 0),
                RRCScene_1.wp(652, 350, 0),
                RRCScene_1.wp(706, 348, 0),
                RRCScene_1.wp(740, 325, 0),
                RRCScene_1.wp(751, 300, 0),
                RRCScene_1.wp(757, 252, 0),
                RRCScene_1.wp(753, 184, 0),
                RRCScene_1.wp(756, 121, 0),
                RRCScene_1.wp(755, 60, 0),
            ];
            _this.obstacleColor = 0xf68712;
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
            this.loader.load(function () {
                chain.next();
            }, this.getAsset(), RRC.GOAL_BACKGROUND);
        };
        RRCLineFollowingScene.prototype.getMaximumTimeBonusScore = function () {
            return 60 * 2;
        };
        /**
         * Returns the indices of the waypoints where a junction is
         */
        RRCLineFollowingScene.prototype.junctionIndices = function () {
            switch (this.ageGroup) {
                case AgeGroup_1.AgeGroup.ES: return [];
                case AgeGroup_1.AgeGroup.MS: return [17];
                case AgeGroup_1.AgeGroup.HS: return [7, 22];
                default: Util_1.Util.exhaustiveSwitch(this.ageGroup);
            }
        };
        RRCLineFollowingScene.prototype.onInit = function (chain) {
            var _this = this;
            this.initRobot({ position: { x: 62, y: 450 }, rotation: -90 });
            // TODO: Change the waypoints
            var waypointList = new WaypointList_1.WaypointList();
            var waypoints = this.getWaypoints();
            waypoints.forEach(function (waypoint) {
                var x = waypoint.x;
                var y = waypoint.y;
                var r = waypoint.r;
                var wp = _this.makeWaypoint({ x: x, y: y }, waypoint.score, r);
                waypointList.appendWaypoints(wp);
            });
            var reversedWaypoints = waypointList.reversed(false);
            // === set graphics ===
            waypointList.getLastWaypoint().setMaxDistanceInMatterUnits(this.bigWaypointSize);
            reversedWaypoints.getLastWaypoint().setMaxDistanceInMatterUnits(this.bigWaypointSize);
            // === set score ===
            // leaves the starting position 
            waypointList.get(1).score = this.ageGroup == AgeGroup_1.AgeGroup.ES ? 50 : 25;
            // arrives at the "tower"
            waypointList.getLastWaypoint().score = this.ageGroup == AgeGroup_1.AgeGroup.HS ? 50 : 100;
            // on the way back to the starting point
            reversedWaypoints.get(2).score = this.ageGroup == AgeGroup_1.AgeGroup.ES ? 50 : 25;
            // arrives at the starting position
            reversedWaypoints.getLastWaypoint().score = 100;
            // set junction waypoint scores
            var waypointsAfterTheJunction = 2;
            var junctionScore = 25;
            this.junctionIndices().forEach(function (index) {
                waypointList.get(index + waypointsAfterTheJunction).score = junctionScore;
                reversedWaypoints.get((reversedWaypoints.getLength() - 1) - (index - waypointsAfterTheJunction)).score = junctionScore;
            });
            waypointList.append(reversedWaypoints);
            this.setWaypointList(waypointList);
            var backgroundAsset = this.loader.get(this.getAsset()).texture;
            this.getContainers().groundContainer.addChild(new PIXI.Sprite(backgroundAsset));
            this.addStaticWallInPixels(this.getWall(), { color: this.obstacleColor, strokeColor: this.obstacleColor });
            this.addWalls(true);
            chain.next();
        };
        return RRCLineFollowingScene;
    }(RRCScene_1.RRCScene));
    exports.RRCLineFollowingScene = RRCLineFollowingScene;
});
