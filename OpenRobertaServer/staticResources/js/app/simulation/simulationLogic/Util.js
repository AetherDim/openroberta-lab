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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Util = void 0;
    var Util = /** @class */ (function () {
        function Util() {
        }
        Util.mapNotNull = function (array, transform) {
            var e_1, _a;
            var result = [];
            try {
                for (var array_1 = __values(array), array_1_1 = array_1.next(); !array_1_1.done; array_1_1 = array_1.next()) {
                    var element = array_1_1.value;
                    var transformedElement = transform(element);
                    if (transformedElement != null && transformedElement != undefined) {
                        result.push(transformedElement);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (array_1_1 && !array_1_1.done && (_a = array_1.return)) _a.call(array_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result;
        };
        Util.getOptions = function (init, someOptions) {
            var options = new init();
            if (someOptions != undefined) {
                Object.assign(options, someOptions);
            }
            return options;
        };
        return Util;
    }());
    exports.Util = Util;
});
