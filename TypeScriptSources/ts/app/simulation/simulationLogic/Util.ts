

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

}
