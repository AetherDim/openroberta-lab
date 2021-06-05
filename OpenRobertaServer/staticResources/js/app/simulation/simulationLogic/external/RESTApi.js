define(["require", "exports", "../Util"], function (require, exports, Util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResultErrorType = exports.programRequest = void 0;
    function transferComplete() {
        console.log(this);
        console.log("The transfer is complete.");
    }
    function transferFailed() {
        console.log("An error occurred while transferring the file.");
    }
    function transferCanceled() {
        console.log("The transfer has been canceled by the user.");
    }
    function httpPostAsync(url, data, transferComplete) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", url, true);
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.addEventListener("load", transferComplete);
        xmlHttp.addEventListener("error", transferFailed);
        xmlHttp.addEventListener("abort", transferCanceled);
        xmlHttp.send(data);
    }
    // FIX: Change URLs
    var GET_URL = Util_1.Util.getRootURL(true) + ":1515/programs";
    var POST_URL = Util_1.Util.getRootURL(true) + ":1515/setscore";
    function programRequest(programRequest, callback) {
        function transferComplete() {
            var response = JSON.parse(this.responseText);
            callback(response);
        }
        httpPostAsync(GET_URL, JSON.stringify(programRequest), transferComplete);
    }
    exports.programRequest = programRequest;
    var ResultErrorType;
    (function (ResultErrorType) {
        ResultErrorType[ResultErrorType["NONE"] = 0] = "NONE";
        ResultErrorType[ResultErrorType["USER_VERIFICATION_FAILED"] = 1] = "USER_VERIFICATION_FAILED";
        ResultErrorType[ResultErrorType["INVALID_ARGUMENTS"] = 2] = "INVALID_ARGUMENTS";
        ResultErrorType[ResultErrorType["SQL_ERROR"] = 3] = "SQL_ERROR";
    })(ResultErrorType = exports.ResultErrorType || (exports.ResultErrorType = {}));
});
