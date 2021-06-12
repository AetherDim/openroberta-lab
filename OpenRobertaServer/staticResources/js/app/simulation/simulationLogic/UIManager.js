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
            this.clickHanders = [];
            // TODO: Convert all the 'onWrap' js code to use the 'UIManager'
            // Workaround since 'onWrap' is not loaded initially
            this.needsOnWrapHandler = true;
            this.buttonID = buttonID;
            this.jQueryHTMLElement = $("#" + buttonID);
            this.stateMappingObject = buttonSettingsState;
            this.state = initialState;
            // TODO: Convert all the 'onWrap' js code to use the 'UIManager'
            // call 'setButtonEventHandler' only for buttons on which 'onClick' is called
            //this.setButtonEventHandler()
        }
        /**
         * Tries to set the button event handler as long 'onWrap' is not definied for `JQuery`.
         */
        UIRobertaStateButton.prototype.setButtonEventHandler = function () {
            var _this = this;
            if (!this.needsOnWrapHandler) {
                return;
            }
            if (this.jQueryHTMLElement.onWrap !== undefined) {
                var t_1 = this;
                this.jQueryHTMLElement.onWrap("click", function () {
                    var _a, _b, _c;
                    t_1.jQueryHTMLElement.removeClass(t_1.stateMappingObject[t_1.state].class);
                    var state = t_1.state;
                    t_1.clickHanders.forEach(function (handler) { return handler(state); });
                    t_1.state = (_b = (_a = t_1.stateChangeHandler) === null || _a === void 0 ? void 0 : _a.call(t_1, state)) !== null && _b !== void 0 ? _b : state;
                    var buttonSettings = t_1.stateMappingObject[t_1.state];
                    t_1.jQueryHTMLElement.addClass(buttonSettings.class);
                    t_1.jQueryHTMLElement.attr("data-original-title", (_c = buttonSettings.tooltip) !== null && _c !== void 0 ? _c : "");
                }, this.buttonID + " clicked");
            }
            else {
                // workaround for onWrap not loaded
                setTimeout(function () { return _this.setButtonEventHandler(); }, 200);
            }
        };
        /**
         * Set the state change handler.
         *
         * @param stateChangeHandler will be called with the state in which the button is in **before** the state change.
         * It returns the new button state.
         *
         * @returns `this`
         */
        UIRobertaStateButton.prototype.setStateChangeHandler = function (stateChangeHandler) {
            this.stateChangeHandler = stateChangeHandler;
            return this;
        };
        /**
         * Adds `onClickHandler` to the click handler list.
         *
         * @param onClickHandler will be called with the state in which the button is in **before** the state change.
         *
         * @returns `this`
         */
        UIRobertaStateButton.prototype.onClick = function (onClickHandler) {
            // TODO: 'setButtonEventHandler' to the constructor if all 'onWrap' code is converted to TypeScript 
            this.setButtonEventHandler();
            this.clickHanders.push(onClickHandler);
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
        function UIRobertaToggleStateButton(buttonID, initialState, buttonSettingsState) {
            var _this = _super.call(this, buttonID, initialState, buttonSettingsState) || this;
            _this.setStateChangeHandler(function (state) {
                var keys = Object.keys(buttonSettingsState);
                return keys[keys.indexOf(state) == 0 ? 1 : 0];
            });
            return _this;
        }
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
