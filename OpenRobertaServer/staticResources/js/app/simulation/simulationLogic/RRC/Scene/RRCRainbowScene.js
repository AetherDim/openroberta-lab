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
define(["require", "exports", "./RRCScene", "../AgeGroup", "../RRAssetLoader", "../../Random", "../../Waypoints/WaypointList"], function (require, exports, RRCScene_1, AgeGroup_1, RRC, Random_1, WaypointList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RRCRainbowScene = void 0;
    var RRCRainbowScene = /** @class */ (function (_super) {
        __extends(RRCRainbowScene, _super);
        function RRCRainbowScene() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // colours
            _this.red = {
                r: 228,
                g: 3,
                b: 3
            };
            _this.orange = {
                r: 255,
                g: 140,
                b: 0
            };
            _this.yellow = {
                r: 255,
                g: 237,
                b: 0
            };
            _this.green = {
                r: 0,
                g: 128,
                b: 38
            };
            _this.blue = {
                r: 0,
                g: 77,
                b: 255
            };
            _this.purple = {
                r: 117,
                g: 7,
                b: 135
            };
            // colour order
            _this.colourES_MS = [
                _this.red,
                _this.yellow,
                _this.green,
                _this.blue
            ];
            _this.colourHS = [
                _this.red,
                _this.orange,
                _this.yellow,
                _this.green,
                _this.blue,
                _this.purple
            ];
            _this.bigWaypointSize = 70;
            // Waypoints for MS and ES
            _this.topWaypoints = [
                RRCScene_1.wp(400, 177, 10),
                RRCScene_1.wp(402, 71, 0),
                RRCScene_1.wp(480, 72, 0),
                RRCScene_1.wp(479, 119, 0),
                RRCScene_1.wp(520, 117, 0),
                RRCScene_1.wp(520, 181, 0),
                RRCScene_1.wp(611, 178, 0),
                RRCScene_1.wp(762, 178, 10, _this.bigWaypointSize),
            ];
            _this.rightWaypoints = [
                RRCScene_1.wp(505, 270, 10),
                RRCScene_1.wp(620, 270, 0),
                RRCScene_1.wp(730, 272, 0),
                RRCScene_1.wp(730, 345, 0),
                RRCScene_1.wp(730, 410, 0),
                RRCScene_1.wp(610, 411, 0),
                RRCScene_1.wp(492, 408, 0),
                RRCScene_1.wp(490, 503, 10, _this.bigWaypointSize),
            ];
            _this.downWaypoints = [
                RRCScene_1.wp(400, 362, 10),
                RRCScene_1.wp(400, 415, 0),
                RRCScene_1.wp(400, 470, 0),
                RRCScene_1.wp(286, 470, 0),
                RRCScene_1.wp(210, 470, 0),
                RRCScene_1.wp(120, 470, 0),
                RRCScene_1.wp(120, 423, 0),
                RRCScene_1.wp(68, 423, 0),
                RRCScene_1.wp(68, 360, 0),
                RRCScene_1.wp(180, 360, 0),
                RRCScene_1.wp(297, 360, 10, _this.bigWaypointSize),
            ];
            _this.leftWaypoints = [
                RRCScene_1.wp(280, 268, 10),
                RRCScene_1.wp(280, 182, 0),
                RRCScene_1.wp(280, 112, 0),
                RRCScene_1.wp(174, 112, 0),
                RRCScene_1.wp(72, 112, 0),
                RRCScene_1.wp(72, 185, 0),
                RRCScene_1.wp(72, 270, 0),
                RRCScene_1.wp(130, 270, 0),
                RRCScene_1.wp(188, 270, 0),
                RRCScene_1.wp(188, 183, 10, _this.bigWaypointSize),
            ];
            _this.waypointListES_MS = [
                _this.topWaypoints,
                _this.rightWaypoints,
                _this.downWaypoints,
                _this.leftWaypoints
            ];
            // Waypoints for HS
            _this.topLeftWaypoints = [
                RRCScene_1.wp(357, 196, 10),
                RRCScene_1.wp(207, 196, 0),
                RRCScene_1.wp(62, 196, 0),
                RRCScene_1.wp(62, 100, 0),
                RRCScene_1.wp(207, 100, 0),
                RRCScene_1.wp(279, 100, 0),
                RRCScene_1.wp(360, 60, 0),
                RRCScene_1.wp(387, 90, 0),
                RRCScene_1.wp(389, 128, 10, _this.bigWaypointSize),
            ];
            _this.topRightWaypoints = [
                RRCScene_1.wp(445, 190, 10),
                RRCScene_1.wp(460, 165, 0),
                RRCScene_1.wp(463, 138, 0),
                RRCScene_1.wp(501, 100, 0),
                RRCScene_1.wp(560, 100, 0),
                RRCScene_1.wp(543, 61, 0),
                RRCScene_1.wp(592, 61, 10, _this.bigWaypointSize),
            ];
            _this.middleRightWaypoint = [
                RRCScene_1.wp(500, 268, 10),
                RRCScene_1.wp(591, 180, 0),
                RRCScene_1.wp(740, 180, 0),
                RRCScene_1.wp(740, 270, 0),
                RRCScene_1.wp(740, 400, 0),
                RRCScene_1.wp(712, 392, 0),
                RRCScene_1.wp(604, 270, 0),
                RRCScene_1.wp(682, 270, 10, _this.bigWaypointSize),
            ];
            _this.downRightWaypoints = [
                RRCScene_1.wp(441, 344, 10),
                RRCScene_1.wp(456, 369, 0),
                RRCScene_1.wp(589, 351, 0),
                RRCScene_1.wp(611, 389, 0),
                RRCScene_1.wp(559, 420, 0),
                RRCScene_1.wp(469, 449, 0),
                RRCScene_1.wp(469, 490, 10, _this.bigWaypointSize),
            ];
            _this.downLeftWaypoints = [
                RRCScene_1.wp(357, 341, 10),
                RRCScene_1.wp(341, 369, 0),
                RRCScene_1.wp(389, 450, 0),
                RRCScene_1.wp(301, 469, 0),
                RRCScene_1.wp(142, 469, 0),
                RRCScene_1.wp(84, 410, 0),
                RRCScene_1.wp(297, 410, 10, _this.bigWaypointSize),
            ];
            _this.middleLeftWaypoints = [
                RRCScene_1.wp(317, 270, 10),
                RRCScene_1.wp(281, 270, 0),
                RRCScene_1.wp(281, 339, 0),
                RRCScene_1.wp(187, 339, 0),
                RRCScene_1.wp(83, 339, 0),
                RRCScene_1.wp(159, 251, 0),
                RRCScene_1.wp(47, 251, 10, _this.bigWaypointSize),
            ];
            _this.waypointListHS = [
                _this.topLeftWaypoints,
                _this.topRightWaypoints,
                _this.downLeftWaypoints,
                _this.downRightWaypoints,
                _this.middleLeftWaypoints,
                _this.middleRightWaypoint
            ];
            _this.obstacleColor = 0xff00ff;
            _this.obstacleListES_MS = [{
                    x: 285,
                    y: 340,
                    w: 25,
                    h: 40,
                }, {
                    x: 171,
                    y: 170,
                    w: 40,
                    h: 25,
                }, {
                    x: 750,
                    y: 158,
                    w: 25,
                    h: 40,
                }, {
                    x: 470,
                    y: 490,
                    w: 40,
                    h: 25,
                }];
            _this.obstacleListHS = [
                {
                    x: 288,
                    y: 401,
                    w: 15,
                    h: 20,
                }, {
                    x: 40,
                    y: 241,
                    w: 15,
                    h: 20,
                }, {
                    x: 675,
                    y: 263,
                    w: 15,
                    h: 20,
                }, {
                    x: 462,
                    y: 480,
                    w: 20,
                    h: 15,
                }, {
                    x: 585,
                    y: 51,
                    w: 15,
                    h: 20,
                }, {
                    x: 380,
                    y: 120,
                    w: 20,
                    h: 15,
                }
            ];
            _this.centerWaypoint = RRCScene_1.wp(402, 270, 0);
            return _this;
        }
        RRCRainbowScene.prototype.getWalls = function () {
            switch (this.ageGroup) {
                case AgeGroup_1.AgeGroup.ES:
                    return this.obstacleListES_MS;
                case AgeGroup_1.AgeGroup.MS:
                    return this.obstacleListES_MS;
                case AgeGroup_1.AgeGroup.HS:
                    return this.obstacleListHS;
            }
        };
        /**
         * creates a the Waypoint list in the correct order
         */
        RRCRainbowScene.prototype.sortColour = function () {
            var _this = this;
            var finalWaypointList = new WaypointList_1.WaypointList();
            this.getColourOrder().forEach(function (colour) {
                var waypointList = new WaypointList_1.WaypointList();
                _this.getWaypoints().forEach(function (waypoint) {
                    var waypointColour = _this.getColourFromPosition({ x: waypoint[0].x, y: waypoint[0].y });
                    var waypoints = _this.topWaypoints;
                    if (waypointColour != undefined) {
                        if (colour.r == waypointColour[0] && colour.g == waypointColour[1] && colour.b == waypointColour[2]) {
                            waypoints = waypoint;
                            waypoints.forEach(function (waypoint) {
                                var x = waypoint.x;
                                var y = waypoint.y;
                                var wp = _this.makeWaypoint({ x: x, y: y }, waypoint.score, waypoint.r);
                                waypointList.appendWaypoints(wp);
                            });
                            waypointList.appendReversedWaypoints();
                        }
                    }
                });
                finalWaypointList.append(waypointList);
            });
            finalWaypointList.appendWaypoints(this.makeWaypoint({ x: this.centerWaypoint.x, y: this.centerWaypoint.y }, this.centerWaypoint.score, this.centerWaypoint.r));
            this.setWaypointList(finalWaypointList);
        };
        /**
         * @returns a one-dimensional array of the colour order for each division
         */
        RRCRainbowScene.prototype.getColourOrder = function () {
            switch (this.ageGroup) {
                case AgeGroup_1.AgeGroup.ES:
                    return this.colourES_MS;
                case AgeGroup_1.AgeGroup.MS:
                    return this.colourES_MS;
                case AgeGroup_1.AgeGroup.HS:
                    return this.colourHS;
            }
        };
        /**
         * @returns a one-dimensional array of the waypoints
         */
        RRCRainbowScene.prototype.getWaypoints = function () {
            switch (this.ageGroup) {
                case AgeGroup_1.AgeGroup.ES:
                    return this.waypointListES_MS;
                case AgeGroup_1.AgeGroup.MS:
                    return this.waypointListES_MS;
                case AgeGroup_1.AgeGroup.HS:
                    return this.waypointListHS;
            }
        };
        /**
         * @param pos of the pixel that should be read
         * @returns returns one-dimensional array of the colour (red, green, blue) at pos
         */
        RRCRainbowScene.prototype.getColourFromPosition = function (pos) {
            return this.getContainers().getGroundImageData(pos.x, pos.y, 1, 1);
        };
        RRCRainbowScene.prototype.getAsset = function () {
            switch (this.ageGroup) {
                case AgeGroup_1.AgeGroup.ES:
                    if (Random_1.randomBool()) {
                        return RRC.RAINBOW_BACKGROUND_ES;
                    }
                    else {
                        return RRC.RAINBOW_BACKGROUND_ES_DINO;
                    }
                case AgeGroup_1.AgeGroup.MS:
                    if (Random_1.randomWeightedBool(RRC.RAINBOW_BACKGROUND_MS_DINO.getNumberOfIDs(), RRC.RAINBOW_BACKGROUND_MS_SPACE_INVADERS.getNumberOfIDs())) {
                        return RRC.RAINBOW_BACKGROUND_MS_DINO.getRandomAsset();
                    }
                    else {
                        return RRC.RAINBOW_BACKGROUND_MS_SPACE_INVADERS.getRandomAsset();
                    }
                case AgeGroup_1.AgeGroup.HS:
                    return RRC.RAINBOW_BACKGROUND_HS_SPACE_INVADERS.getRandomAsset();
            }
        };
        RRCRainbowScene.prototype.onLoadAssets = function (chain) {
            this.backgroundAsset = this.getAsset();
            this.loader.load(function () {
                chain.next();
            }, this.backgroundAsset, RRC.GOAL_BACKGROUND);
        };
        RRCRainbowScene.prototype.getMaximumTimeBonusScore = function () {
            return 60 * 5;
        };
        RRCRainbowScene.prototype.onInit = function (chain) {
            var _this = this;
            this.initRobot({ position: { x: 402, y: 270 }, rotation: -90 });
            var containers = this.getContainers();
            if (this.backgroundAsset) {
                var backgroundAsset = this.loader.get(this.backgroundAsset).texture;
                containers.groundContainer.addChild(new PIXI.Sprite(backgroundAsset));
            }
            this.sortColour();
            this.getWalls().forEach(function (wall) {
                _this.addStaticWallInPixels(wall, { color: _this.obstacleColor, strokeColor: _this.obstacleColor });
            });
            this.addWalls(true);
            chain.next();
        };
        return RRCRainbowScene;
    }(RRCScene_1.RRCScene));
    exports.RRCRainbowScene = RRCRainbowScene;
});
