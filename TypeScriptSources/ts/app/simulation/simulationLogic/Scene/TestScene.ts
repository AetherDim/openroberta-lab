"use strict";
import { Composite, Events, IBodyDefinition, Vector } from "matter-js";
import { PhysicsRectEntity } from "../Entity";
import { LineSegment } from "../Geometry/LineSegment";
import { Polygon } from "../Geometry/Polygon";
import { ElectricMotor } from "../Robot/ElectricMotor";
import { Robot } from "../Robot/Robot";
import { EventType, ScrollViewEvent } from "../ScrollView";
import { Unit } from "../Unit";
import { Scene } from "./Scene";
import { AsyncChain } from "./AsyncChain";
import { Util } from "../Util";

export class TestScene extends Scene {


	/**
	 * called to load resources
	 * 
	 * @override from Scene
	 */
	onLoadAssets(chain: AsyncChain) {
		setTimeout(() => {
			//this.setScore(266);
			//this.showScoreScreen(10);
			chain.next();
		}, 0);
	}

	private interactionEventHandlers: ((ev: ScrollViewEvent) => void)[] = []

	onInteractionEvent(ev: ScrollViewEvent) {
		this.interactionEventHandlers.forEach(handler => {
			handler(ev)
		});
	}

	getUnitConverter(): Unit {
		return new Unit({ m: 1000 })
	}

	/**
	 * called after resource loading on Init
	 * 
	 * @override from Scene
	 */
	onInit(chain: AsyncChain) {

		// create dynamic debug gui
		this.initDynamicDebugGui()

		// use 0.001 for EV3
		const scale = 0.001;
		
		const unit = this.unit

		// (<any>Resolver)._restingThresh = 4 * scale;
		// (<any>Resolver)._restingThreshTangent = 6 * scale;
		// (<any>Sleeping)._motionWakeThreshold = 0.18 * scale;
		// (<any>Sleeping)._motionSleepThreshold = 0.08 * scale;
		// (<any>Constraint)._minLength = 0.000001 * scale;

		//this.sceneRenderer.setRenderingScaleAndOffset(1 / scale, Vector.create())
		
		// add some background elements
		this.getContainers().groundContainer.addChild(new PIXI.Graphics().beginFill(0xFF0000).drawRect(100, 200, 30, 60).endFill())

		const useEV3 = true
		const robot = useEV3 ? Robot.EV3(this) : Robot.default(this, scale)
		this.addRobot(robot);
		
		const robotComposite = robot.physicsComposite

		//World.add(this.engine.world, robotComposite);

		Composite.translate(robotComposite, unit.getPositionVec(100 * scale, 100 * scale))

		const polygon = new Polygon([
			Vector.create(0, 0),
			Vector.create(100, 0),
			Vector.create(100, 50),
			Vector.create(0, 100),
			Vector.create(50, 50)
		].map(v => unit.getPosition(Vector.mult(Util.vectorAdd(v, Vector.create(200, 200)), scale))))
	
		const polygonGraphics = new PIXI.Graphics()
		polygonGraphics.beginFill(0xFF0000)
		polygonGraphics.moveTo(polygon.vertices[0].x, polygon.vertices[0].y)
		polygon.vertices.forEach(v => polygonGraphics.lineTo(v.x, v.y))
		polygonGraphics.closePath()
		polygonGraphics.endFill()

		function makePoint(color: number): PIXI.Graphics {
			return setToPoint(new PIXI.Graphics(), color)
		}

		function setToPoint(graphics: PIXI.Graphics, color: number): PIXI.Graphics {
			return graphics
				.clear()
				.beginFill(color)
				.drawRect(-5, -5, 10, 10)
				.endFill()
		}
		const mousePointGraphics = makePoint(0x00FF00)
		const nearestPointGraphics = makePoint(0x0000FF)
		
		const lineSegmentGraphics = new PIXI.Graphics()
			.lineStyle(2)
			.moveTo(0, 0)
			.lineTo(20, 100)
		let intersectionPointGraphics: PIXI.Graphics[] = []

		const container = new PIXI.Container()
		container.addChild(polygonGraphics, nearestPointGraphics, mousePointGraphics, lineSegmentGraphics)
		this.getContainers().topContainer.addChild(container)

		this.interactionEventHandlers.push(event => {
			const mousePosData = event.data.getCurrentLocalPosition()
			const mousePos = Vector.create(mousePosData.x, mousePosData.y)
			mousePointGraphics.position.set(mousePos.x, mousePos.y)
			const pos = polygon.nearestPointTo(mousePos)
			if (pos) {
				nearestPointGraphics.position.set(pos.x, pos.y)
			}

			if (polygon.containsPoint(mousePos)) {
				setToPoint(mousePointGraphics, 0x0044FF)
			} else {
				setToPoint(mousePointGraphics, 0x00FF00)
			}

			if (event.type == EventType.DRAG) {
				const ls = new LineSegment(mousePos, Util.vectorAdd(mousePos, Vector.create(20, 100)))
				lineSegmentGraphics.position.set(mousePos.x, mousePos.y)
				const intersectionPoints = polygon.intersectionPointsWithLine(ls)
				intersectionPointGraphics.forEach(g => {
					container.removeChild(g)
					g.destroy()
				})
				intersectionPointGraphics = intersectionPoints.map(p => {
					const graphics = makePoint(0x00FF00)
					graphics.position.set(p.x, p.y)
					container.addChild(graphics)
					return graphics
				})
			}
		})

		this.engine.world.gravity.y = 0.0;
	
	
		var body = robot.body;
		body.enableMouseInteraction = true
	
		var keyDownList: Array<string> = []
	
		document.onkeydown = function (event) {
			if (!keyDownList.includes(event.key)) {
				keyDownList.push(event.key)
			}
		}
		document.onkeyup = function (event) {
			keyDownList = keyDownList.filter(key => key != event.key)
		}
	
		function updateKeysActions() {
	
			// $('#notConstantValue').html('');
			// $("#notConstantValue").append('<div><label>Test</label><span>' + keyDownList + '</span></div>');    
	
			var leftForce = 0
			var rightForce = 0
			const factor = keyDownList.includes("s") ? -1 : 1
			keyDownList.forEach(key => {
				switch (key) {
					case 'w':
						leftForce += 1
						rightForce += 1
						break
					case 's':
						leftForce += -1
						rightForce += -1
						break
					case 'a':
						leftForce += -1 * factor
						rightForce += 1 * factor
						break
					case 'd':
						leftForce += 1 * factor
						rightForce += -1 * factor
						break
				}
			})
	
			let vec = Vector.create(Math.cos(body.angle), Math.sin(body.angle))
			const force = Vector.mult(vec, 0.0001 * 1000 * 1000 * 1000 * 1000)
			let normalVec = Vector.mult(Vector.create(-vec.y, vec.x), 10)
	
			const forcePos = Util.vectorAdd(body.position, Vector.mult(vec, -40))
	
			
			const maxTorque = unit.getTorque(100*1000*1000 * Math.pow(scale, 3.5))
			const motor = useEV3 ? ElectricMotor.EV3(unit) : new ElectricMotor(unit, 120, maxTorque)
			robot.leftDrivingWheel.applyTorqueFromMotor(motor, leftForce)
			robot.rightDrivingWheel.applyTorqueFromMotor(motor, rightForce)

		}
	
	
		Events.on(this.engine, 'beforeUpdate', function () {
			updateKeysActions()
		});


		const t = this
		function makeRect(x: number, y: number, w: number, h: number, opt: IBodyDefinition): PhysicsRectEntity {
			return PhysicsRectEntity.create(t, scale*x, scale*y, scale*w, scale*h, { physics: opt })
		}
		const bodies = [
			// blocks
			makeRect(200, 100, 60, 60, { frictionAir: 0.001 }),
			makeRect(400, 100, 60, 60, { frictionAir: 0.05 }),
			makeRect(600, 100, 60, 60, { frictionAir: 0.1 }),
	
			// walls
			makeRect(400, -25, 800, 50, { isStatic: true }),
			makeRect(400, 600, 800, 50, { isStatic: true }),
			makeRect(800, 300, 50, 600, { isStatic: true }),
			makeRect(-25, 300, 50, 600, { isStatic: true })
		]

		bodies.forEach(b => t.addEntity(b))

		// const allBodies = Composite.allBodies(world)
		// allBodies.forEach(body => body.slop *= scale)


		chain.next();
	}

}