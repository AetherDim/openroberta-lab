import { Util } from "../Util";

function transferComplete(this: XMLHttpRequest) {
	console.log(this)
	console.log("The transfer is complete.");
}

function transferFailed(this: XMLHttpRequest) {
	console.log("An error occurred while transferring the file.");
}

function transferCanceled(this: XMLHttpRequest) {
	console.log("The transfer has been canceled by the user.");
}


function httpPostAsync(url: string, data: string, transferComplete: (this: XMLHttpRequest) => void)
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("POST", url, true);
	xmlHttp.setRequestHeader('Content-Type', 'application/json');
	xmlHttp.addEventListener("load", transferComplete);
	xmlHttp.addEventListener("error", transferFailed);
	xmlHttp.addEventListener("abort", transferCanceled);
	xmlHttp.send(data);
}

// FIX: Change URLs
const GET_URL = Util.getRootURL(true) + ":1515/programs"
const POST_URL = Util.getRootURL(true) + ":1515/setscore"

/*httpPostAsync(GET_URL, JSON.stringify({
	secret: {secret: ''},
	programs: [1, 2, 3]
}), transferComplete)


httpPostAsync(POST_URL, JSON.stringify({
	secret: {secret: ''},
	programID: 1,
	score: 42,
	comment: "This is a comment!!!",
	modifiedBy: "Modified by me :D",
	time: 25664
}), transferComplete)*/


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
export function programRequest(programRequest: ProgramsRequest, callback: (programsResult: ProgramsRequestResult) => void) {
	function transferComplete(this: XMLHttpRequest) {
		const response = JSON.parse(this.responseText) as ProgramsRequestResult
		callback(response)
	}
	httpPostAsync(GET_URL, JSON.stringify(programRequest), transferComplete)
}



export type Secret = {
	secret: string
}

export interface ProgramsRequest {
	secret?: Secret,
	/** program IDs */
	programs: number[]
}

export interface SetScoreRequest {
	secret?: Secret,
	programID: number
	score: number
	time: number
	comment: string
	modifiedBy: string
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