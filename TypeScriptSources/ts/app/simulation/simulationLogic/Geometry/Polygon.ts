import { Vector } from "matter-js";
import { LineSegment } from "./LineSegment";


export class Polygon {

    readonly vertices: Vector[]

    constructor(vertices: Vector[]) {
        this.vertices = vertices
    }

    distanceTo(point: Vector): number {

        var minDistanceSquared = Infinity

        const newVertices = this.vertices.map(p => Vector.sub(p, point))

        const zeroVector = Vector.create()

        var vertex0 = newVertices[0]
        var vertex1 = newVertices[1]

        var lastVertexIsNear = false
        var lastVertexDistanceSquared = Vector.magnitudeSquared(vertex1)

        const lineSegment = new LineSegment(vertex0, vertex1)
        const parameter = lineSegment.uncheckedNearestParameterTo(zeroVector)
        if (parameter <= 0) {
            minDistanceSquared = Vector.magnitudeSquared(vertex0)
        } else if (parameter >= 1) {
            minDistanceSquared = lastVertexDistanceSquared
            lastVertexIsNear = true
        } else {
            minDistanceSquared = Vector.magnitudeSquared(lineSegment.getPoint(parameter))
        }

        // distance of line to origin:
        // d/dt (s + t * r)^2 = 2 * (s + t * r) * r = 0
        // t = -(s*r)/(r^2)
        //   (s - s*r/(r^2) * r)^2
        // = s^2 + (s*r)^2*r^2/r^4 - 2*s*r*(s*r)/r^2
        // = s^2 - (s*r)^2/r^2
        // = s^2 + (s*r)*t

        for (let i = 2; i < newVertices.length; i++) {
            const vertex0 = newVertices[i-1]
            const vertex1 = newVertices[i]

            const vertex1DistanceSquared = Vector.magnitudeSquared(vertex1)
            
            var direction: Vector 
            var dotProduct: number
            var endVertexDistanceSquared: number
            if (lastVertexIsNear) {
                direction = Vector.sub(vertex1, vertex0)
                dotProduct = Vector.dot(vertex0, direction)
                endVertexDistanceSquared = vertex1DistanceSquared
            } else {
                direction = Vector.sub(vertex0, vertex1)
                dotProduct = Vector.dot(vertex1, direction)
                endVertexDistanceSquared = lastVertexDistanceSquared
            }

            var newLastVertexIsNear = false

            if (dotProduct < 0) {

                // total: 3 mult, 0 div, 2 add, 0 sub, 1 negate
                // 2 mult, 0 div, 1 add, 0 sub, 1 negate
                const parameter = -dotProduct / Vector.magnitudeSquared(direction)
                var newDistanceSquared: number
                if (parameter < 1) {
                    // 1 mult, 0 div, 1 add, 0 sub, 0 negate
                    // Pythagoras
                    newDistanceSquared = endVertexDistanceSquared + dotProduct * parameter
                } else {
                    if (lastVertexIsNear) {
                        newDistanceSquared = vertex1DistanceSquared
                        newLastVertexIsNear = true
                    } else {
                        newDistanceSquared = lastVertexDistanceSquared
                    }
                }

                if (newDistanceSquared < minDistanceSquared) {
                    minDistanceSquared = newDistanceSquared
                }

                // // total: 5 mult, 1 div, 0 add, 2 sub, 0 negate
                // // 2 mult, 0 div, 0 add, 1 sub, 0 negate
                // const area = Vector.cross(direction, vertex0)
                // // 3 mult, 1 div, 0 add, 1 sub, 0 negate
                // const distanceSquared = area * area / Vector.magnitudeSquared(direction)
            } else {
                if (!lastVertexIsNear) {
                    newLastVertexIsNear = true
                    if (vertex1DistanceSquared < minDistanceSquared) {
                        minDistanceSquared = vertex1DistanceSquared
                    }
                }
            }
            
            lastVertexIsNear = newLastVertexIsNear
            lastVertexDistanceSquared = vertex1DistanceSquared

        }

        return Math.sqrt(minDistanceSquared)
    }

    distanceTo2(point: Vector): number {

        var minDistanceSquared = Infinity

        const newVertices = this.vertices.map(p => Vector.sub(p, point))

        const zeroVector = Vector.create()

        for (let i = 2; i < newVertices.length; i++) {
            const vertex0 = newVertices[i-1]
            const vertex1 = newVertices[i]

            const lineSegment = new LineSegment(vertex0, vertex1)
            const parameter = lineSegment.uncheckedNearestParameterTo(zeroVector)
            if (parameter <= 0) {
                minDistanceSquared = Math.min(Vector.magnitudeSquared(vertex0), minDistanceSquared)
            } else if (parameter >= 1) {
                minDistanceSquared = Math.min(Vector.magnitudeSquared(vertex1), minDistanceSquared)
            } else {
                minDistanceSquared = Vector.magnitudeSquared(lineSegment.getPoint(parameter))
            }
        }

        return Math.sqrt(minDistanceSquared)
    }

    distanceTo3(point: Vector): number {
        return Vector.magnitude(this.nearestPointTo(point))
    }

    nearestPointTo(point: Vector): Vector {

        var minDistanceSquared = Infinity
        var minDistancePoint = Vector.create()

        const newVertices = this.vertices.map(p => Vector.sub(p, point))

        const zeroVector = Vector.create()

        function updateWithVertices(vertex0: Vector, vertex1: Vector) {
            const lineSegment = new LineSegment(vertex0, vertex1)
            const parameter = lineSegment.uncheckedNearestParameterTo(zeroVector)
            
            var newMinPoint: Vector
            if (parameter <= 0) {
                newMinPoint = vertex0
            } else if (parameter >= 1) {
                newMinPoint = vertex1
            } else {
                newMinPoint = lineSegment.getPoint(parameter)
            }

            const newMinDistanceSquared = Vector.magnitudeSquared(newMinPoint)
            if (newMinDistanceSquared < minDistanceSquared) {
                minDistancePoint = newMinPoint
                minDistanceSquared = newMinDistanceSquared
            }
        }

        for (let i = 1; i < newVertices.length; i++) {
            updateWithVertices(newVertices[i-1], newVertices[i])
        }

        updateWithVertices(newVertices[newVertices.length - 1], newVertices[0])

        return Vector.add(minDistancePoint, point)
    }

}