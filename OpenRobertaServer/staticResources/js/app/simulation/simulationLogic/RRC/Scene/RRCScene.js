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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
define(["require", "exports", "../RRAssetLoader", "../../Robot/Robot", "matter-js", "../../Unit", "../../Scene/Scene", "../../Entity", "../../Waypoints/ScoreWaypoint", "../../Util"], function (require, exports, RRC, Robot_1, matter_js_1, Unit_1, Scene_1, Entity_1, ScoreWaypoint_1, Util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RRCScene = void 0;
    var RRCScene = /** @class */ (function (_super) {
        __extends(RRCScene, _super);
        function RRCScene(ageGroup) {
            var _this = _super.call(this) || this;
            _this.addWaypointGraphics = true;
            _this.scoreTextContainer = new PIXI.Container();
            _this.ageGroup = ageGroup;
            return _this;
        }
        /**
         * @param position The position of the waypoint in matter Units
         * @param score The score for reaching the waypoint
         * @param maxDistance The maximum distance in matter units which still reaches the waypoint (default: 50 matter units)
         */
        RRCScene.prototype.makeWaypoint = function (position, score, maxDistance) {
            if (maxDistance === void 0) { maxDistance = 50; }
            return new ScoreWaypoint_1.ScoreWaypoint(this.unit, this.unit.fromPosition(position), this.unit.fromLength(maxDistance), score);
        };
        RRCScene.prototype.setWaypointList = function (list) {
            var e_1, _a;
            if (this.addWaypointGraphics) {
                try {
                    for (var _b = __values(list.waypoints), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var waypoint = _c.value;
                        this.addEntity(Entity_1.DrawableEntity.rect(this, waypoint.position.x, waypoint.position.y, waypoint.maxDistance * 2, waypoint.maxDistance * 2, {
                            color: 0xFF0000,
                            alpha: 0.5
                        }));
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            var t = this;
            this.waypointsManager.resetListAndEvent(list, function (idx, waypoint) {
                t.addToScore(waypoint.score);
                if (idx == list.getLastWaypointIndex()) {
                    t.showScoreScreen(10);
                }
            });
        };
        RRCScene.prototype.loadScoreAssets = function (chain) {
            RRC.loader.load(function () {
                chain.next();
            }, RRC.PROGGY_TINY_FONT, RRC.GOAL_BACKGROUND);
        };
        RRCScene.prototype.initScoreContainer = function (chain) {
            this.scoreContainer.zIndex = this.scoreContainerZ;
            var goal = RRC.loader.get(RRC.GOAL_BACKGROUND).texture;
            this.goalSprite = new PIXI.Sprite(goal);
            this.scoreContainer.addChild(this.goalSprite);
            // text
            this.scoreText = new PIXI.Text("", {
                fontFamily: 'ProggyTiny',
                fontSize: 160,
                fill: 0xf48613
            });
            this.scoreText2 = new PIXI.Text("", {
                fontFamily: 'ProggyTiny',
                fontSize: 160,
                fill: 0xc00001
            });
            this.scoreText3 = new PIXI.Text("", {
                fontFamily: 'ProggyTiny',
                fontSize: 160,
                fill: 0x00cb01
            });
            this.scoreTextContainer.addChild(this.scoreText3, this.scoreText2, this.scoreText);
            this.scoreContainer.addChild(this.scoreTextContainer);
            chain.next();
        };
        RRCScene.prototype.updateScoreAnimation = function (dt) {
            this.scoreTextContainer.x = this.goalSprite.width / 2;
            this.scoreTextContainer.y = this.goalSprite.height / 2;
            this.scoreTextContainer.rotation = 5 * Math.PI / 180 + Math.sin(Date.now() / 700) / Math.PI;
        };
        RRCScene.prototype.updateScoreText = function () {
            var text = "Score: " + this.getScore();
            this.scoreText.text = text;
            this.scoreText.position.set(-this.scoreText.width / 2, -this.scoreText.height / 2);
            this.scoreText2.text = text;
            this.scoreText2.position.set(-this.scoreText.width / 2 - 3, -this.scoreText.height / 2);
            this.scoreText3.text = text;
            this.scoreText3.position.set(-this.scoreText.width / 2 + 3, -this.scoreText.height / 2);
        };
        RRCScene.prototype.getUnitConverter = function () {
            // approx 60px = 20cm
            return new Unit_1.Unit({ m: 350 });
        };
        RRCScene.prototype.onInit = function (chain) {
            this.initRobot();
            this.setScore(266);
            this.showScoreScreen(100);
            chain.next();
        };
        /**
         * Sets the position (matter units) and rotation (degrees; clockwise) of the robot
         * @param opt Options of type '{ position?: Vector, rotation?: number }'
         */
        RRCScene.prototype.initRobot = function (opt) {
            var _a;
            var robot = Robot_1.Robot.EV3(this);
            var position = (_a = opt === null || opt === void 0 ? void 0 : opt.position) !== null && _a !== void 0 ? _a : matter_js_1.Vector.create();
            var unit = this.getUnitConverter();
            position.x = unit.fromLength(position.x);
            position.y = unit.fromLength(position.y);
            robot.setPose(this.unit.getPosition(position), (opt === null || opt === void 0 ? void 0 : opt.rotation) || 0, false);
            robot.body.enableMouseInteraction = true;
            this.addRobot(robot);
        };
        /**
         * Adds a static physics body rectangle where the coordinates are given in pixels
         *
         * @param x x coordinate of upper left corner
         * @param y y coordinate of upper left corner
         * @param w width of rectangle
         * @param h height of rectangle
         * @param options options for 'RectEntityOptions'
         */
        RRCScene.prototype.addStaticWallInPixels = function (wall, options) {
            var unit = this.getUnitConverter();
            var x = unit.fromLength(wall.x);
            var y = unit.fromLength(wall.y);
            var w = unit.fromLength(wall.w);
            var h = unit.fromLength(wall.h);
            var opts = Util_1.Util.getOptions(Entity_1.RectEntityOptions, options);
            if ((options === null || options === void 0 ? void 0 : options.relativeToCenter) == undefined) {
                opts.relativeToCenter = false;
            }
            var entity = Entity_1.PhysicsRectEntity.create(this, x, y, w, h, opts);
            matter_js_1.Body.setStatic(entity.getPhysicsBody(), true);
            this.addEntity(entity);
        };
        RRCScene.prototype.addWalls = function (visible) {
            if (visible === void 0) { visible = false; }
            var unit = this.getUnitConverter();
            var t = unit.fromLength(100);
            var x = unit.fromLength(0);
            var y = unit.fromLength(0);
            var w = unit.fromLength(800);
            var h = unit.fromLength(540);
            var options = {
                color: 0x000000,
                strokeColor: 0x000000,
                alpha: 0.2,
                relativeToCenter: false
            };
            var top = Entity_1.PhysicsRectEntity.create(this, x - t, y - t, w + 2 * t, t, options);
            var bottom = Entity_1.PhysicsRectEntity.create(this, x - t, y + h, w + 2 * t, t, options);
            var left = Entity_1.PhysicsRectEntity.create(this, x - t, y, t, h, options);
            var right = Entity_1.PhysicsRectEntity.create(this, x + w, y, t, h, options);
            this.addEntity(top);
            this.addEntity(bottom);
            this.addEntity(left);
            this.addEntity(right);
            matter_js_1.Body.setStatic(top.getPhysicsBody(), true);
            matter_js_1.Body.setStatic(bottom.getPhysicsBody(), true);
            matter_js_1.Body.setStatic(left.getPhysicsBody(), true);
            matter_js_1.Body.setStatic(right.getPhysicsBody(), true);
            top.getDrawable().visible = visible;
            bottom.getDrawable().visible = visible;
            left.getDrawable().visible = visible;
            right.getDrawable().visible = visible;
        };
        return RRCScene;
    }(Scene_1.Scene));
    exports.RRCScene = RRCScene;
});
