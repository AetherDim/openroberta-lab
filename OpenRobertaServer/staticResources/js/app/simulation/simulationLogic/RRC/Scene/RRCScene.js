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
define(["require", "exports", "../RRAssetLoader", "../../Robot/Robot", "matter-js", "../../Unit", "./RRCScoreScene", "../../Entity", "../../Waypoints/ScoreWaypoint", "../../Util", "../../SharedAssetLoader"], function (require, exports, RRC, Robot_1, matter_js_1, Unit_1, RRCScoreScene_1, Entity_1, ScoreWaypoint_1, Util_1, SharedAssetLoader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RRCScene = void 0;
    var RRCScene = /** @class */ (function (_super) {
        __extends(RRCScene, _super);
        function RRCScene(name, ageGroup) {
            var _this = _super.call(this, name + " " + ageGroup) || this;
            _this.loader = new SharedAssetLoader_1.SharedAssetLoader();
            _this.scoreText2 = new PIXI.Text("");
            _this.scoreText3 = new PIXI.Text("");
            _this.scoreTextContainer = new PIXI.Container();
            /**
             * Padding for the scroll view zoom reset in pixels
             */
            _this.sceneFramePadding = 10;
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
            return new ScoreWaypoint_1.ScoreWaypoint(this, this.unit.fromPosition(position), this.unit.fromLength(maxDistance), score);
        };
        RRCScene.prototype.setWaypointList = function (list, waypointVisibilityBehavior) {
            var _this = this;
            if (waypointVisibilityBehavior === void 0) { waypointVisibilityBehavior = "showNext"; }
            this.waypointsManager.waypointVisibilityBehavior = waypointVisibilityBehavior;
            this.waypointsManager.resetListAndEvent(list, function (idx, waypoint) {
                _this.addToScore(waypoint.score);
                if (idx == list.getLastWaypointIndex()) {
                    _this.addToScore(_this.getTimeBonusScore());
                    _this.showScoreScreen(true);
                }
            });
            // add index text graphic to waypoints
            this.waypointsManager.getWaypoints().forEach(function (waypoint, index) {
                var text = new PIXI.Text(String(index));
                text.style = new PIXI.TextStyle({ align: 'center' });
                text.position.x = waypoint.position.x - text.width / 2;
                text.position.y = waypoint.position.y - text.height / 2;
                text.resolution = 4;
                //text.zIndex = 10000;
                waypoint.graphics.addChild(text);
            });
        };
        RRCScene.prototype.loadScoreAssets = function (chain) {
            console.log("start");
            this.loader.load(function () {
                chain.next();
                console.log("loaded");
            }, RRC.PROGGY_TINY_FONT, RRC.GOAL_BACKGROUND);
        };
        RRCScene.prototype.getTimeBonusScore = function () {
            var _a;
            return Math.floor(Math.max(0, this.getMaximumTimeBonusScore() - ((_a = this.getProgramRuntime()) !== null && _a !== void 0 ? _a : Infinity)));
        };
        RRCScene.prototype.getMaximumTimeBonusScore = function () {
            return 0;
        };
        RRCScene.prototype.initScoreContainer = function (chain) {
            /*this.scoreContainer.zIndex = this.scoreContainerZ;
    
            let goal = this.loader.get(RRC.GOAL_BACKGROUND).texture;
            this.goalSprite = new PIXI.Sprite(goal);
    
            this.scoreContainer.addChild(this.goalSprite);
    
    
            // text
    
            this.scoreText = new PIXI.Text("",
                {
                    fontFamily: 'ProggyTiny',
                    fontSize: 160,
                    fill: 0xf48613
                });
    
            this.scoreText2 = new PIXI.Text("",
                {
                    fontFamily: 'ProggyTiny',
                    fontSize: 160,
                    fill: 0xc00001
                });
    
            this.scoreText3 = new PIXI.Text("",
                {
                    fontFamily: 'ProggyTiny',
                    fontSize: 160,
                    fill: 0x00cb01
                });
    
            this.scoreTextContainer.addChild(this.scoreText3, this.scoreText2, this.scoreText);
    
            this.scoreContainer.addChild(this.scoreTextContainer);*/
            chain.next();
        };
        RRCScene.prototype.updateScoreAnimation = function (dt) {
            if (this.goalSprite != undefined) {
                this.scoreTextContainer.x = this.goalSprite.width / 2;
                this.scoreTextContainer.y = this.goalSprite.height / 2;
                this.scoreTextContainer.rotation = 5 * Math.PI / 180 + Math.sin(Date.now() / 700) / Math.PI;
            }
        };
        //updateScoreText() {
        /*let text = "Score: " + this.getScore();
        this.scoreText.text = text;
        this.scoreText.position.set(-this.scoreText.width / 2, -this.scoreText.height / 2);

        this.scoreText2.text = text;
        this.scoreText2.position.set(-this.scoreText.width / 2 - 3, -this.scoreText.height / 2);

        this.scoreText3.text = text;
        this.scoreText3.position.set(-this.scoreText.width / 2 + 3, -this.scoreText.height / 2);*/
        //}
        RRCScene.prototype.getUnitConverter = function () {
            // approx 60px = 20cm
            return new Unit_1.Unit({ m: 350 });
        };
        RRCScene.prototype.onInit = function (chain) {
            // create dynamic debug gui
            this.initDynamicDebugGui();
            this.initRobot();
            //this.setScore(266);
            //this.showScoreScreen(100);
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
        RRCScene.prototype.getSize = function () {
            return {
                width: 800 + 2 * this.sceneFramePadding,
                height: 540 + 2 * this.sceneFramePadding
            };
        };
        RRCScene.prototype.getOrigin = function () {
            return { x: -this.sceneFramePadding, y: -this.sceneFramePadding };
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
    }(RRCScoreScene_1.RRCScoreScene));
    exports.RRCScene = RRCScene;
});
