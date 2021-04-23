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
    exports.Util = exports.asUniqueArray = void 0;
    var asUniqueArray = function (a) { return a; };
    exports.asUniqueArray = asUniqueArray;
    function applyRestrictedKey(type, key) {
        return type[key];
    }
    var Util = /** @class */ (function () {
        function Util() {
        }
        /**
         * Returns an array of numbers starting from 'start' to (inclusive) 'end' with a step size 'step'
         *
         * @param start inclusive start of range
         * @param end inclusive end of range
         * @param step the step size of the range
         */
        Util.range = function (start, end, step) {
            if (step === void 0) { step = 1.0; }
            var ans = [];
            for (var i = start; i <= end; i += step) {
                ans.push(i);
            }
            return ans;
        };
        /**
         * Generate a unique ID.  This should be globally unique.
         * 87 characters ^ 20 length > 128 bits (better than a UUID).
         * @return {string} A globally unique ID string.
         */
        Util.genUid = function () {
            var length = 20;
            var soupLength = Util.soup_.length;
            var id = [];
            for (var i = 0; i < length; i++) {
                id[i] = Util.soup_.charAt(Math.random() * soupLength);
            }
            return id.join('');
        };
        ;
        Util.flattenArray = function (array) {
            return [].concat.apply([], array);
        };
        // // unique tuple elements
        // static test<
        // 	N extends Narrowable,
        // 	A extends ReadonlyArray<N> & UniqueTupleElements<A>
        // >(key: A) {
        // }
        /**
         * Returns a list of all possible tuples/lists whose i-th element is from `list[i]`.
         *
         * i.e.`[[list[0][0],list[1][0], list[2][0],...], [list[0][1],list[1][0], list[2][0],...], ...]`
         */
        Util.anyTuples = function (list) {
            var e_1, _a;
            if (list.length == 0) {
                return list;
            }
            else if (list.length == 1) {
                return list[0].map(function (e) { return [e]; });
            }
            else {
                var result = [];
                var _loop_1 = function (value) {
                    var val = Util.anyTuples(list.slice(0, -1)).map(function (tuple) {
                        return tuple.concat(value);
                    });
                    result.push.apply(result, val);
                };
                try {
                    for (var _b = __values(list[list.length - 1]), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var value = _c.value;
                        _loop_1(value);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return result;
            }
        };
        /**
         * Returns a list of all possible tuples/lists whose i-th element is from `list[i]`.
         *
         * i.e.`[[list[0][0],list[1][0], list[2][0],...], [list[0][1],list[1][0], list[2][0],...], ...]`
         */
        Util.tuples = function (list) {
            return Util.anyTuples(list);
        };
        Util.strictPropertiesTuples = function (type, keys) {
            for (var i = 0; i < keys.length; i++) {
                for (var j = i + 1; j < keys.length; j++) {
                    if (keys[i] === keys[j]) {
                        console.error("The property name (" + keys[i] + ") is duplicate");
                    }
                }
            }
            var values = keys.map(function (key) { return applyRestrictedKey(type, key); });
            var tuples = Util.anyTuples(values);
            return tuples.map(function (tuple) {
                var obj = {};
                for (var i = 0; i < keys.length; i++) {
                    obj[keys[i]] = tuple[i];
                }
                return obj;
            });
        };
        Util.propertiesTuples = function (type, keys) {
            for (var i = 0; i < keys.length; i++) {
                for (var j = i + 1; j < keys.length; j++) {
                    if (keys[i] === keys[j]) {
                        console.error("The property name (" + keys[i] + ") is duplicate");
                    }
                }
            }
            var values = keys.map(function (key) { return applyRestrictedKey(type, key); });
            var tuples = Util.anyTuples(values);
            return tuples.map(function (tuple) {
                var obj = {};
                for (var i = 0; i < keys.length; i++) {
                    obj[keys[i]] = tuple[i];
                }
                return obj;
            });
        };
        Util.allPropertiesTuples = function (type) {
            var keys = Object.keys(type);
            return Util.propertiesTuples(type, keys);
        };
        Util.mapNotNull = function (array, transform) {
            var e_2, _a;
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
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (array_1_1 && !array_1_1.done && (_a = array_1.return)) _a.call(array_1);
                }
                finally { if (e_2) throw e_2.error; }
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
        /**
         * @param array Array where the first occurrence of `element` will be removed
         * @param element The element which will bew removed from `array`
         * @returns `true` if the element was removed
         */
        Util.removeFromArray = function (array, element) {
            var index = array.indexOf(element, 0);
            if (index > -1) {
                array.splice(index, 1);
                return true;
            }
            return false;
        };
        Util.stringReplaceAll = function (string, searchValue, replacement) {
            return string.split(searchValue).join(string);
        };
        Util.vectorEqual = function (v1, v2) {
            return v1.x === v2.x && v1.y === v2.y;
        };
        Util.vectorAdd = function (v1, v2) {
            return { x: v1.x + v2.x, y: v1.y + v2.y };
        };
        Util.vectorSub = function (v1, v2) {
            return { x: v1.x - v2.x, y: v1.y - v2.y };
        };
        Util.vectorDistance = function (v1, v2) {
            var dx = v1.x - v2.x;
            var dy = v1.y - v2.y;
            return Math.sqrt(dx * dx + dy * dy);
        };
        Util.vectorDistanceSquared = function (v1, v2) {
            var dx = v1.x - v2.x;
            var dy = v1.y - v2.y;
            return dx * dx + dy * dy;
        };
        /**
         * returns the pixel ratio of this device
         */
        Util.getPixelRatio = function () {
            return window.devicePixelRatio || 0.75; // 0.75 is default for old browsers
        };
        Util.simulation = {
            storedPrograms: [],
            storedRobotType: ""
        };
        /**
         * Legal characters for the unique ID.  Should be all on a US keyboard.
         * No characters that conflict with XML or JSON.  Requests to remove additional
         * 'problematic' characters from this soup will be denied.  That's your failure
         * to properly escape in your own environment.  Issues #251, #625, #682, #1304.
         * @private
         */
        Util.soup_ = '!#$%()*+,-./:;=?@[]^_`{|}~' +
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Util;
    }());
    exports.Util = Util;
});
