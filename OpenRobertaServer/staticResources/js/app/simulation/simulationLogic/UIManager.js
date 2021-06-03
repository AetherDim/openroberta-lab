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
define(["require", "exports", "blockly"], function (require, exports, Blockly) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UIManager = exports.UIRobertaToggleStateButton = exports.UIRobertaStateButton = exports.UIRobertaButton = void 0;
    var UIRobertaButton = /** @class */ (function () {
        function UIRobertaButton(buttonID) {
            this.buttonID = buttonID;
            this.jQueryHTMLElement = $("#" + buttonID);
        }
        /**
         * Adds `onClickHandler` to the html element as click handler
         *
         * @param onClickHandler will be called with the state in which the button is in **before** the state change.
         * It returns the new button state.
         *
         * @returns `this`
         */
        UIRobertaButton.prototype.onClick = function (onClickHandler) {
            var t = this;
            this.jQueryHTMLElement.onWrap("click", onClickHandler, this.buttonID + " clicked");
            return this;
        };
        UIRobertaButton.prototype.update = function () {
            this.jQueryHTMLElement = $("#" + this.buttonID);
        };
        return UIRobertaButton;
    }());
    exports.UIRobertaButton = UIRobertaButton;
    var UIRobertaStateButton = /** @class */ (function () {
        function UIRobertaStateButton(buttonID, initialState, buttonSettingsState) {
            this.buttonID = buttonID;
            this.jQueryHTMLElement = $("#" + buttonID);
            this.stateMappingObject = buttonSettingsState;
            this.state = initialState;
        }
        /**
         * Adds `onClickHandler` to the html element as click handler
         *
         * @param onClickHandler will be called with the state in which the button is in **before** the state change.
         * It returns the new button state.
         *
         * @returns `this`
         */
        UIRobertaStateButton.prototype.onClick = function (onClickHandler) {
            var t = this;
            this.jQueryHTMLElement.onWrap("click", function () {
                var _a;
                t.jQueryHTMLElement.removeClass(t.stateMappingObject[t.state].class);
                t.state = onClickHandler(t.state);
                var buttonSettings = t.stateMappingObject[t.state];
                t.jQueryHTMLElement.addClass(buttonSettings.class);
                t.jQueryHTMLElement.attr("data-original-title", (_a = buttonSettings.tooltip) !== null && _a !== void 0 ? _a : "");
            }, this.buttonID + " clicked");
            return this;
        };
        UIRobertaStateButton.prototype.update = function () {
            var _this = this;
            var _a;
            // remove all classes in 'stateMappingObject'
            Object.values(this.stateMappingObject).forEach(function (buttonSettings) {
                return _this.jQueryHTMLElement.removeClass(buttonSettings.class);
            });
            // add the state class
            var buttonSettings = this.stateMappingObject[this.state];
            this.jQueryHTMLElement.addClass(buttonSettings.class);
            this.jQueryHTMLElement.attr("data-original-title", (_a = buttonSettings.tooltip) !== null && _a !== void 0 ? _a : "");
        };
        UIRobertaStateButton.prototype.setState = function (state) {
            this.state = state;
            this.update();
        };
        return UIRobertaStateButton;
    }());
    exports.UIRobertaStateButton = UIRobertaStateButton;
    var UIRobertaToggleStateButton = /** @class */ (function (_super) {
        __extends(UIRobertaToggleStateButton, _super);
        function UIRobertaToggleStateButton() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Adds `onClickHandler` to the html element as click handler
         *
         * @param onClickHandler will be called with the state in which the button is in **before** the state change.
         *
         * @returns `this`
         */
        UIRobertaToggleStateButton.prototype.onClick = function (onClickHandler) {
            var t = this;
            _super.prototype.onClick.call(this, function (state) {
                onClickHandler(state);
                var keys = Object.keys(t.stateMappingObject);
                // toggle the state
                return keys[keys.indexOf(state) == 0 ? 1 : 0];
            });
            return this;
        };
        return UIRobertaToggleStateButton;
    }(UIRobertaStateButton));
    exports.UIRobertaToggleStateButton = UIRobertaToggleStateButton;
    var BlocklyMsg = Blockly.Msg;
    var UIManager = /** @class */ (function () {
        function UIManager() {
        }
        UIManager.programControlButton = new UIRobertaToggleStateButton("simControl", "start", {
            start: { class: "typcn-media-play", tooltip: BlocklyMsg.MENU_SIM_START_TOOLTIP },
            stop: { class: "typcn-media-stop", tooltip: BlocklyMsg.MENU_SIM_STOP_TOOLTIP }
        });
        UIManager.physicsSimControlButton = new UIRobertaToggleStateButton("simFLowControl", "stop", {
            start: { class: "typcn-flash-outline", tooltip: "Start simulation" },
            stop: { class: "typcn-flash", tooltip: "Stop simulation" }
        });
        UIManager.showScoreButton = new UIRobertaToggleStateButton("simScore", "showScore", {
            showScore: { class: "typcn-star" },
            hideScore: { class: "typcn-star-outline" },
        });
        UIManager.simSpeedUpButton = new UIRobertaToggleStateButton("simSpeedUp", "fastForward", {
            fastForward: { class: "typcn-media-fast-forward-outline" },
            normalSpeed: { class: "typcn-media-fast-forward" }
        });
        UIManager.resetSceneButton = new UIRobertaButton("simResetPose");
        UIManager.zoomOutButton = new UIRobertaButton("zoomOut");
        UIManager.zoomInButton = new UIRobertaButton("zoomIn");
        UIManager.zoomResetButton = new UIRobertaButton("zoomReset");
        return UIManager;
    }());
    exports.UIManager = UIManager;
});
