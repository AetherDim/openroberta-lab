

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

	/**
     * @param array Array where the first occurrence of `element` will be removed
     * @param element The element which will bew removed from `array`
     * @returns `true` if the element was removed
     */
    static removeFromArray<T>(array: T[], element: T): boolean {
        const index = array.indexOf(element, 0);
        if (index > -1) {
            array.splice(index, 1)
            return true
        }
        return false
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

