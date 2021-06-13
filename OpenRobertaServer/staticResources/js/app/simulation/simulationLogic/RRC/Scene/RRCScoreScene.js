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
define(["require", "exports", "../../Scene/AsyncChain", "../../Scene/Scene", "../../SharedAssetLoader", "../RRAssetLoader", "../../EventManager/EventManager"], function (require, exports, AsyncChain_1, Scene_1, SharedAssetLoader_1, RRAssetLoader_1, EventManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RRCScoreScene = void 0;
    var RRCScoreScene = /** @class */ (function (_super) {
        __extends(RRCScoreScene, _super);
        function RRCScoreScene(name) {
            var _this = _super.call(this, name) || this;
            _this.loader = new SharedAssetLoader_1.SharedAssetLoader();
            _this.scoreContainer = new PIXI.Container();
            _this.scoreTextContainer = new PIXI.Container();
            _this.scoreText1 = new PIXI.Text("", {
                fontFamily: 'ProggyTiny',
                fontSize: 160,
                fill: 0xf48613
            });
            _this.scoreText2 = new PIXI.Text("", {
                fontFamily: 'ProggyTiny',
                fontSize: 160,
                fill: 0xc00001
            });
            _this.scoreText3 = new PIXI.Text("", {
                fontFamily: 'ProggyTiny',
                fontSize: 160,
                fill: 0x00cb01
            });
            _this.score = 0;
            _this.scoreEventManager = EventManager_1.EventManager.init({
                onShowHideScore: new EventManager_1.ParameterTypes()
            });
            _this.addOnAsyncChainBuildCompleteLister(function (chain) {
                chain.addBefore(_this.onInit, new AsyncChain_1.AsyncListener(_this.onInitScore, _this));
                chain.addBefore(_this.onLoadAssets, new AsyncChain_1.AsyncListener(_this.onLoadScoreAssets, _this));
            });
            return _this;
        }
        RRCScoreScene.prototype.removeAllEventHandlers = function () {
            _super.prototype.removeAllEventHandlers.call(this);
            this.scoreEventManager.removeAllEventHandlers();
        };
        RRCScoreScene.prototype.onLoadScoreAssets = function (chain) {
            this.loader.load(function () { return chain.next(); }, RRAssetLoader_1.GOAL_BACKGROUND, RRAssetLoader_1.PROGGY_TINY_FONT);
        };
        RRCScoreScene.prototype.onInitScore = function (chain) {
            this.showScoreScreen(false);
            this.scoreContainer.zIndex = 1000;
            var goal = this.loader.get(RRAssetLoader_1.GOAL_BACKGROUND).texture;
            this.scoreBackgroundSprite = new PIXI.Sprite(goal);
            this.scoreContainer.addChild(this.scoreBackgroundSprite);
            // text
            this.scoreTextContainer.addChild(this.scoreText3, this.scoreText2, this.scoreText1);
            this.scoreContainer.addChild(this.scoreTextContainer);
            chain.next();
        };
        RRCScoreScene.prototype.updateScoreText = function () {
            var text = "Score: " + this.getScore();
            this.scoreText1.text = text;
            this.scoreText2.text = text;
            this.scoreText3.text = text;
            this.scoreText1.position.set(-this.scoreText1.width / 2, -this.scoreText1.height / 2);
            this.scoreText2.position.set(-this.scoreText1.width / 2 - 3, -this.scoreText1.height / 2);
            this.scoreText3.position.set(-this.scoreText1.width / 2 + 3, -this.scoreText1.height / 2);
        };
        RRCScoreScene.prototype.getScore = function () {
            return this.score;
        };
        RRCScoreScene.prototype.updateScoreAnimation = function () {
            if (this.scoreBackgroundSprite) {
                this.scoreTextContainer.x = this.scoreBackgroundSprite.width / 2;
                this.scoreTextContainer.y = this.scoreBackgroundSprite.height / 2;
                this.scoreTextContainer.rotation = 5 * Math.PI / 180 + Math.sin(Date.now() / 700) / Math.PI;
            }
        };
        RRCScoreScene.prototype.setScore = function (score) {
            this.score = score;
            this.updateScoreText();
        };
        RRCScoreScene.prototype.resetScoreAndProgramRuntime = function () {
            this.setScore(0);
            this.programEventTimes = undefined;
        };
        RRCScoreScene.prototype.reset = function (robotSetupData) {
            this.resetScoreAndProgramRuntime();
            _super.prototype.reset.call(this, robotSetupData);
        };
        RRCScoreScene.prototype.fullReset = function (robotSetupData) {
            this.resetScoreAndProgramRuntime();
            _super.prototype.fullReset.call(this, robotSetupData);
        };
        RRCScoreScene.prototype.showScoreScreenNoButtonChange = function (visible) {
            if (visible) {
                if (!this.isVisible()) {
                    this.containerManager.topContainer.addChild(this.scoreContainer);
                }
            }
            else {
                this.containerManager.topContainer.removeChild(this.scoreContainer);
            }
        };
        RRCScoreScene.prototype.isVisible = function () {
            return this.containerManager.topContainer.children.includes(this.scoreContainer);
        };
        RRCScoreScene.prototype.showScoreScreen = function (visible) {
            this.showScoreScreenNoButtonChange(visible);
            this.scoreEventManager.onShowHideScoreCallHandlers(visible ? "showScore" : "hideScore");
        };
        RRCScoreScene.prototype.addToScore = function (score) {
            this.score += score;
            this.updateScoreText();
        };
        /**
         * Returns the time since the program was started.
         * If the program was stopped, the total program runtime will be returned.
         * It returns `undefined`, if the program was never started.
         */
        RRCScoreScene.prototype.getProgramRuntime = function () {
            var _a;
            if (this.programEventTimes != undefined) {
                return (((_a = this.programEventTimes.stopTime) !== null && _a !== void 0 ? _a : this.getSimulationTime()) - this.programEventTimes.startTime) / 2;
            }
            else {
                return undefined;
            }
        };
        RRCScoreScene.prototype.onUpdatePrePhysics = function () {
            var _a;
            var robots = this.getRobotManager().getRobots();
            if (robots.length > 0) {
                if (((_a = robots[0].interpreter) === null || _a === void 0 ? void 0 : _a.isTerminated()) === false && !this.getProgramManager().isProgramPaused()) {
                    // program is running
                    if (this.programEventTimes == undefined || this.programEventTimes.stopTime != undefined) {
                        // set the start time, if it was not set before, or if both time values were set
                        this.programEventTimes = { startTime: this.getSimulationTime() };
                    }
                }
                else {
                    // robot has no interpreter or program is terminated
                    if (this.programEventTimes != undefined) {
                        // set the stop time, if it was not set before
                        if (this.programEventTimes.stopTime == undefined) {
                            this.programEventTimes.stopTime = this.getSimulationTime();
                        }
                    }
                }
            }
        };
        RRCScoreScene.prototype.onRenderTick = function () {
            this.updateScoreAnimation();
        };
        return RRCScoreScene;
    }(Scene_1.Scene));
    exports.RRCScoreScene = RRCScoreScene;
});
