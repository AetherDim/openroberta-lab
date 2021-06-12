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
            // Waypoints for MS and ES
            _this.topWaypoints = [
                {
                    x: 390,
                    y: 160,
                    w: 40,
                    h: 40,
                    score: 10
                }, {
                    x: 680,
                    y: 165,
                    w: 40,
                    h: 40,
                    score: 10
                }
            ];
            _this.rightWaypoints = [
                {
                    x: 485,
                    y: 250,
                    w: 40,
                    h: 40,
                    score: 10
                },
                {
                    x: 470,
                    y: 440,
                    w: 40,
                    h: 40,
                    score: 10
                }
            ];
            _this.downWaypoints = [
                {
                    x: 400,
                    y: 350,
                    w: 40,
                    h: 40,
                    score: 10
                }, {
                    x: 230,
                    y: 340,
                    w: 40,
                    h: 40,
                    score: 10
                }
            ];
            _this.leftWaypoints = [
                {
                    x: 270,
                    y: 250,
                    w: 40,
                    h: 40,
                    score: 10
                }, {
                    x: 170,
                    y: 195,
                    w: 40,
                    h: 40,
                    score: 10
                }
            ];
            _this.waypointListES_MS = [
                _this.topWaypoints,
                _this.rightWaypoints,
                _this.downWaypoints,
                _this.leftWaypoints
            ];
            // Waypoints for HS
            _this.topLeftWaypoints = [
                {
                    x: 310,
                    y: 175,
                    w: 20,
                    h: 20,
                    score: 10
                },
                {
                    x: 382,
                    y: 95,
                    w: 20,
                    h: 20,
                    score: 10
                }
            ];
            _this.topRightWaypoints = [
                {
                    x: 445,
                    y: 175,
                    w: 20,
                    h: 20,
                    score: 10
                },
                {
                    x: 565,
                    y: 57,
                    w: 20,
                    h: 20,
                    score: 10
                }
            ];
            _this.downLeftWaypoints = [
                {
                    x: 345,
                    y: 385,
                    w: 20,
                    h: 20,
                    score: 10
                },
                {
                    x: 245,
                    y: 403,
                    w: 20,
                    h: 20,
                    score: 10
                }
            ];
            _this.downRightWaypoints = [
                {
                    x: 470,
                    y: 363,
                    w: 20,
                    h: 20,
                    score: 10
                },
                {
                    x: 470,
                    y: 450,
                    w: 20,
                    h: 20,
                    score: 10
                }
            ];
            _this.middleLeftWaypoints = [
                {
                    x: 278,
                    y: 263,
                    w: 20,
                    h: 20,
                    score: 10
                },
                {
                    x: 64,
                    y: 245,
                    w: 20,
                    h: 20,
                    score: 10
                }
            ];
            _this.middleRightWaypoint = [
                {
                    x: 490,
                    y: 265,
                    w: 20,
                    h: 20,
                    score: 10
                },
                {
                    x: 660,
                    y: 265,
                    w: 20,
                    h: 20,
                    score: 10
                }
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
                                var x = waypoint.x + waypoint.w / 2;
                                var y = waypoint.y + waypoint.h / 2;
                                var wp = _this.makeWaypoint({ x: x, y: y }, waypoint.score);
                                waypointList.appendWaypoints(wp);
                            });
                            waypointList.appendReversedWaypoints();
                        }
                    }
                });
                finalWaypointList.append(waypointList);
            });
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
            return this.getContainers().getGroundImageData(pos.x, pos.y, 1, 1).data;
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
                var goal = this.loader.get(this.backgroundAsset).texture;
                this.goalSprite = new PIXI.Sprite(goal);
                containers.groundContainer.addChild(this.goalSprite);
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
