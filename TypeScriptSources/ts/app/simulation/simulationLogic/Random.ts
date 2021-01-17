
export function randomIntBetween(start: number, stop: number) {
	return Math.floor(Math.random() * Math.floor(stop - start + 1)) + start;
}

export function randomBool() {
	return Math.random() >= 0.5;
}

export function randomWeightedBool(a:number, b:number) {
	return Math.random() < a/(a+b);
}