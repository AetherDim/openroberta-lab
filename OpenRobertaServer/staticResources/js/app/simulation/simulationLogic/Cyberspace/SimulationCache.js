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
define(["require", "exports", "../Util", "../Robot/Robot"], function (require, exports, Util_1, Robot_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimulationCache = void 0;
    var SimulationCache = /** @class */ (function () {
        function SimulationCache(robertaRobotSetupDataList, robotType) {
            var e_1, _a;
            var _b, _c;
            this.storedRobertaRobotSetupDataList = [];
            this.storedRobotType = "";
            try {
                // check that the configuration values ("TOUCH", "GYRO", ...) are also in `sensorTypeStrings`
                for (var robertaRobotSetupDataList_1 = __values(robertaRobotSetupDataList), robertaRobotSetupDataList_1_1 = robertaRobotSetupDataList_1.next(); !robertaRobotSetupDataList_1_1.done; robertaRobotSetupDataList_1_1 = robertaRobotSetupDataList_1.next()) {
                    var setupData = robertaRobotSetupDataList_1_1.value;
                    var configuration = setupData.javaScriptConfiguration;
                    var allKeys = Object.keys(configuration);
                    var allValues = Util_1.Util.nonNullObjectValues(configuration);
                    var wrongValueCount = (_c = (_b = allValues.find(function (e) { return !Robot_1.sensorTypeStrings.includes(e); })) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0;
                    if (wrongValueCount > 0 || allKeys.filter(function (e) { return typeof e === "number"; }).length > 0) {
                        console.error("The 'configuration' has not the expected type. Configuration: " + configuration);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (robertaRobotSetupDataList_1_1 && !robertaRobotSetupDataList_1_1.done && (_a = robertaRobotSetupDataList_1.return)) _a.call(robertaRobotSetupDataList_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.storedRobertaRobotSetupDataList = robertaRobotSetupDataList;
            this.storedRobotType = robotType;
        }
        SimulationCache.prototype.toRobotSetupData = function () {
            return this.storedRobertaRobotSetupDataList.map(function (setup) {
                return {
                    sensorConfiguration: setup.javaScriptConfiguration,
                    program: {
                        javaScriptProgram: setup.javaScriptProgram
                    }
                };
            });
        };
        SimulationCache.prototype.hasEqualConfiguration = function (cache) {
            function toProgramEqualityObject(data) {
                return {
                    javaScriptConfiguration: data.javaScriptConfiguration
                };
            }
            return Util_1.Util.deepEqual(this.storedRobertaRobotSetupDataList.map(toProgramEqualityObject), cache.storedRobertaRobotSetupDataList.map(toProgramEqualityObject));
        };
        return SimulationCache;
    }());
    exports.SimulationCache = SimulationCache;
});
