define(["require", "exports", "./ProgramManager", "./RobotConfigurationManager"], function (require, exports, ProgramManager_1, RobotConfigurationManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RobotManager = void 0;
    var RobotManager = /** @class */ (function () {
        function RobotManager(scene) {
            /**
             * Represents the number of robots after this scene has been initialized.
             * The GUI needs this information before the scene has finished loading.
             * @protected
             */
            this.numberOfRobots = 1;
            this.showRobotSensorValues = true;
            /**
             * All programmable robots within the scene.
             * The program flow manager will use the robots internally.
             */
            this.robots = new Array();
            this.programManager = new ProgramManager_1.ProgramManager(this);
            this.configurationManager = new RobotConfigurationManager_1.RobotConfigurationManager(this.robots);
            this.scene = scene;
        }
        RobotManager.prototype.getProgramManager = function () {
            return this.programManager;
        };
        RobotManager.prototype.getRobots = function () {
            return this.robots;
        };
        /**
         * Adds `robot` to scene (to `robots` array and entities)
         */
        RobotManager.prototype.addRobot = function (robot) {
            this.robots.push(robot);
            this.scene.getEntityManager().addEntity(robot);
            this.configurationManager.safeUpdateLastRobot();
        };
        RobotManager.prototype.getNumberOfRobots = function () {
            return this.numberOfRobots;
        };
        RobotManager.prototype.updateSensorValueView = function () {
            // TODO: refactor this, the simulation should not have a html/div dependency
            // update sensor value html
            var _this = this;
            if (this.showRobotSensorValues && $('#simValuesModal').is(':visible')) {
                var htmlElement = $('#notConstantValue');
                htmlElement.html('');
                var elementList_1 = [];
                elementList_1.push({ label: 'Simulation tick rate:', value: this.scene.getCurrentSimTickRate() });
                this.robots.forEach(function (robot) { return robot.addHTMLSensorValuesTo(elementList_1); });
                var htmlString = elementList_1.map(function (element) { return _this.htmlSensorValues(element.label, element.value); }).join("");
                htmlElement.append(htmlString);
            }
        };
        RobotManager.prototype.htmlSensorValues = function (label, value) {
            return "<div><label>" + label + "</label><span>" + value + "</span></div>";
        };
        /**
         * remove all robots
         */
        RobotManager.prototype.clear = function () {
            this.robots.length = 0;
        };
        return RobotManager;
    }());
    exports.RobotManager = RobotManager;
});
