define(["require", "exports"], function (require, exports) {
    function addMethodToObject(obj, name, method) {
        obj[name] = method;
    }
    exports.addMethodToObject = addMethodToObject;
});
