import { DEBUG } from "../GlobalDebug";
import { Util } from "../Util";


function httpPostAsync(url: string, data: string,
	transferComplete: (this: XMLHttpRequest) => void,
	error: (this: XMLHttpRequest) => void,
	abort: (this: XMLHttpRequest) => void)
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("POST", url, true);
	xmlHttp.setRequestHeader('Content-Type', 'application/json');
	xmlHttp.addEventListener("load", transferComplete);
	xmlHttp.addEventListener("error", error);
	xmlHttp.addEventListener("abort", abort);
	xmlHttp.send(data);
}

// FIX: Change URLs
let PROGRAMS_URL = "/sqlrest/programs"
let SET_SCORE_URL = "/sqlrest/setScore"

if ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && DEBUG) {
	// TODO: change this to a debug address
	PROGRAMS_URL = "https://next.cyberspace.roborave.de/sqlrest/programs"
	SET_SCORE_URL = "https://next.cyberspace.roborave.de/sqlrest/setScore"
}


export interface ProgramSQLEntry {
	/** challenge id / scene id */
	challenge: number
	agegroup: number
	/** program URL */
	program: string
	comment: string
	/** timestamp in the format JJJJ-MM-DDThh:mm:ss.000Z e.g. 2020-10-04T17:13:42.000Z */
	timestamp: string
	/** name of the team */
	name: string
	/** id of the program ??????????????????????? */
	id: number
}

export function sendRESTRequest(url: string, programRequest: ProgramsRequest|SetScoreRequest, callback: (programsResult?: ProgramsRequestResult) => void) {
	function transferComplete(this: XMLHttpRequest) {
		const response = JSON.parse(this.responseText) as ProgramsRequestResult
		callback(response)
	}
	function onError(this: XMLHttpRequest) {
		callback()
	}
	httpPostAsync(url, JSON.stringify(programRequest), transferComplete, onError, onError)
}

export function sendProgramRequest(programRequest: ProgramsRequest, callback: (programsResult?: ProgramsRequestResult) => void) {
	sendRESTRequest(PROGRAMS_URL, programRequest, callback)
}


export interface SetScoreRequest {
	secret?: Secret,
	programID: number
	score: number
	time: number
	comment: string
	modifiedBy: string
}

export function sendSetScoreRequest(setScoreRequest: SetScoreRequest, callback: (programsResult?: ProgramsRequestResult) => void) {
	sendRESTRequest(SET_SCORE_URL, setScoreRequest, callback)
}

export type Secret = {
	secret: string
}

export interface ProgramsRequest {
	secret?: Secret,
	/** program IDs */
	programs: number[]
}

export enum ResultErrorType {
	NONE,
	USER_VERIFICATION_FAILED,
	INVALID_ARGUMENTS,
	SQL_ERROR
}

export interface ProgramsRequestResult {
	error: ResultErrorType
	message?: string
	result?: ProgramSQLEntry[]
}