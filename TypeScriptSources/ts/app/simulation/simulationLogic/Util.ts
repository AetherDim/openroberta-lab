

export class Util {

	static mapNotNull<T, U>(array: T[], transform: (element: T) => (U | null | undefined)): U[] {
		const result: U[] = []
		for (const element of array) {
			const transformedElement = transform(element)
			if (transformedElement != null && transformedElement != undefined) {
				result.push(transformedElement)
			}
		}
		return result
	}

	static getOptions<T>(init: new () => T, someOptions?: Partial<T>): T {
		const options =  new init()
		if (someOptions != undefined) {
			Object.assign(options, someOptions)
		}
		return options
	}

}

type ObjectKeys<T> = 
	T extends object ? (keyof T)[] :
	T extends number ? [] :
	T extends Array<any> | string ? string[] :
	never

declare global {
	export interface ObjectConstructor {
		keys<T>(o: T): ObjectKeys<T>
	}
}

