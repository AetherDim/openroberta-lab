define(["require", "exports", "../GlobalDebug"], function (require, exports, GlobalDebug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResultErrorType = exports.sendSetScoreRequest = exports.sendStateRequest = exports.sendProgramRequest = exports.sendRESTRequest = void 0;
    function httpAsync(req, url, data, transferComplete, error, abort) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open(req, url, true);
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.addEventListener("load", transferComplete);
        xmlHttp.addEventListener("error", error);
        xmlHttp.addEventListener("abort", abort);
        xmlHttp.send(data);
    }
    function httpPostAsync(url, data, transferComplete, error, abort) {
        httpAsync("POST", url, data, transferComplete, error, abort);
    }
    function httpGetAsync(url, transferComplete, error, abort) {
        httpAsync("GET", url, undefined, transferComplete, error, abort);
    }
    // FIX: Change URLs
    var PROGRAMS_URL = "/sqlrest/programs";
    var SET_SCORE_URL = "/sqlrest/setScore";
    var GET_STATUS_URL = "/sqlrest/state";
    if ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && GlobalDebug_1.DEBUG) {
        // TODO: change this to a debug address
        PROGRAMS_URL = "https://next.cyberspace.roborave.de/sqlrest/programs";
        SET_SCORE_URL = "https://next.cyberspace.roborave.de/sqlrest/setScore";
        GET_STATUS_URL = "https://next.cyberspace.roborave.de/sqlrest/state";
    }
    function sendRESTRequest(url, programRequest, callback) {
        function transferComplete() {
            var response = JSON.parse(this.responseText);
            callback(response);
        }
        function onError() {
            callback();
        }
        httpPostAsync(url, JSON.stringify(programRequest), transferComplete, onError, onError);
    }
    exports.sendRESTRequest = sendRESTRequest;
    function sendProgramRequest(programRequest, callback) {
        sendRESTRequest(PROGRAMS_URL, programRequest, callback);
    }
    exports.sendProgramRequest = sendProgramRequest;
    function sendStateRequest(callback) {
        function transferComplete() {
            var response = JSON.parse(this.responseText);
            callback(response);
        }
        function onError() {
            callback();
        }
        httpGetAsync(GET_STATUS_URL, transferComplete, onError, onError);
    }
    exports.sendStateRequest = sendStateRequest;
    function sendSetScoreRequest(setScoreRequest, callback) {
        sendRESTRequest(SET_SCORE_URL, setScoreRequest, callback);
    }
    exports.sendSetScoreRequest = sendSetScoreRequest;
    var ResultErrorType;
    (function (ResultErrorType) {
        ResultErrorType[ResultErrorType["NONE"] = 0] = "NONE";
        ResultErrorType[ResultErrorType["USER_VERIFICATION_FAILED"] = 1] = "USER_VERIFICATION_FAILED";
        ResultErrorType[ResultErrorType["INVALID_ARGUMENTS"] = 2] = "INVALID_ARGUMENTS";
        ResultErrorType[ResultErrorType["SQL_ERROR"] = 3] = "SQL_ERROR";
    })(ResultErrorType = exports.ResultErrorType || (exports.ResultErrorType = {}));
});
