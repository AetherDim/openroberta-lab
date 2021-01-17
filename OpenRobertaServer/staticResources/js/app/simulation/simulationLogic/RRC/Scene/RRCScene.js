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
define(["require", "exports", "../RRAssetLoader", "../../Robot/Robot", "matter-js", "../../Unit", "../../Scene/Scene", "../../Entity", "../../Waypoints/ScoreWaypoint"], function (require, exports, RRC, Robot_1, matter_js_1, Unit_1, Scene_1, Entity_1, ScoreWaypoint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RRCScene = void 0;
    var RRCScene = /** @class */ (function (_super) {
        __extends(RRCScene, _super);
        function RRCScene(ageGroup) {
            var _this = _super.call(this) || this;
            _this.scoreTextContainer = new PIXI.Container();
            _this.ageGroup = ageGroup;
            return _this;
        }
        /**
         * @param position The position of the waypoint in matter Units
         * @param score The score for reaching the waypoint
         */
        RRCScene.prototype.makeWaypoint = function (position, score) {
            return new ScoreWaypoint_1.ScoreWaypoint(this.unit, this.unit.fromPosition(position), score);
        };
        /**
         * @param position The position of the waypoint in matter Units
         */
        RRCScene.prototype.makeEndWaypoint = function (position, score) {
            this.endWaypoint = new ScoreWaypoint_1.ScoreWaypoint(this.unit, this.unit.fromPosition(position), score);
            return this.endWaypoint;
        };
        RRCScene.prototype.setWaypointList = function (list) {
            var _this = this;
            var t = this;
            this.waypointsManager.resetListAndEvent(list, function (waypoint) {
                t.setScore(t.getScore() + waypoint.score);
                if (waypoint == _this.endWaypoint) {
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
        RRCScene.prototype.addWalls = function (visible) {
            if (visible === void 0) { visible = false; }
            var unit = this.getUnitConverter();
            var t = unit.fromLength(100);
            var x = unit.fromLength(0);
            var y = unit.fromLength(0);
            var w = unit.fromLength(800);
            var h = unit.fromLength(540);
            var top = Entity_1.PhysicsRectEntity.create(this, x - t, y - t, w + 2 * t, t, { color: 0x000000, strokeColor: 0x000000, alpha: 0.2, relativeToCenter: true });
            var bottom = Entity_1.PhysicsRectEntity.create(this, x - t, y + h, w + 2 * t, t, { color: 0x000000, strokeColor: 0x000000, alpha: 0.2, relativeToCenter: true });
            var left = Entity_1.PhysicsRectEntity.create(this, x - t, y, t, h, { color: 0x000000, strokeColor: 0x000000, alpha: 0.2, relativeToCenter: true });
            var right = Entity_1.PhysicsRectEntity.create(this, x + w, y, t, h, { color: 0x000000, strokeColor: 0x000000, alpha: 0.2, relativeToCenter: true });
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
