import { Robot } from '../Robot/Robot';
import { Engine, Mouse, World, Render, MouseConstraint, Composite, Body, Constraint, Sleeping, Bounds, Vertices, Vector } from 'matter-js';
import { SceneRender } from '../SceneRenderer';
import { Timer } from '../Timer';
import { EventType, ScrollViewEvent } from '../ScrollView';
import { IEntity } from "../Entity";
import { Unit } from '../Unit';
import { Util } from '../Util';
import { AsyncChain } from "./AsyncChain";
import { WaypointsManager } from '../Waypoints/WaypointsManager';
import { ScoreWaypoint } from '../Waypoints/ScoreWaypoint';
import { DEBUG, SceneDebug } from "./../GlobalDebug";
import {EntityManager} from "./Manager/EntityManager";
import {ContainerManager} from "./Manager/ContainerManager";
import {RobotManager} from "./Manager/RobotManager";
import { RobotSetupData } from '../Robot/RobotSetupData';
import { EventManager, ParameterTypes } from '../EventManager/EventManager';

export class Scene {


	readonly robotManager = new RobotManager(this)
	readonly entityManager = new EntityManager(this)
	readonly containerManager = new ContainerManager(this)

	getContainers() {
		return this.containerManager
	}

	getEntityManager() {
		return this.entityManager
	}

	getRobotManager() {
		return this.robotManager
	}

	getProgramManager() {
		return this.getRobotManager().getProgramManager()
	}

	//
	// #############################################################################
	//

	readonly eventManager = EventManager.init({
		onStartSimulation: ParameterTypes.none,
		onPauseSimulation: ParameterTypes.none
	})

	removeAllEventHandlers() {
		this.eventManager.removeAllEventHandlers()
		this.getProgramManager().removeAllEventHandlers()
	}

	//
	// #############################################################################
	//

	addEntities(...entities: IEntity[]) {
		this.getEntityManager().addEntities(...entities)
	}

	addEntity(entity: IEntity) {
		this.getEntityManager().addEntity(entity)
	}

	removeEntity(entity: IEntity) {
		this.getEntityManager().removeEntity(entity)
	}

	addRobot(robot: Robot) {
		this.getRobotManager().addRobot(robot)
	}

	//
	// #############################################################################
	//
	private readonly onChainCompleteListeners: ((chain: AsyncChain) => void)[] = []

	addOnAsyncChainBuildCompleteLister(fnc: (chain: AsyncChain) => void) {
		this.onChainCompleteListeners.push(fnc)
	}

	//
	// #############################################################################
	//

	private _unit = new Unit({})

	get unit(): Unit {
		return this._unit
	}

	//
	// #############################################################################
	//

	private origin = {x: 0, y: 0}
	private size = {width: 0, height: 0}

	// TODO: copy coords
	getSize(): { width: number, height: number } {
		return this.size
	}

	getOrigin(): Vector {
		return this.origin
	}

	updateBounds() {
		this.origin = {x: 0, y: 0}
		this.size = {width: 0, height: 0}
		
		Composite.allBodies(this.world).forEach(body => {
			const min = body.bounds.min
			const max = body.bounds.max

			if(this.origin.x > min.x) {
				this.origin.x = min.x
			}
			
			if(this.origin.y > min.y) {
				this.origin.y = min.y
			}
			
			if(this.size.width < max.x) {
				this.size.width = max.x
			}

			if(this.size.height < max.y) {
				this.size.height = max.y
			}
		})

		this.size.width -= this.origin.x
		this.size.height -= this.origin.y
	}

	//
	// #############################################################################
	//

	readonly debug: SceneDebug

	getDebugGuiStatic() {
		return this.debug.debugGuiStatic
	}

	getDebugGuiDynamic() {
		return this.debug.debugGuiDynamic
	}

	initDynamicDebugGui() {
		this.debug.createDebugGuiDynamic()
	}


	readonly name: string

	getName() {
		return this.name
	}


	//
	// #############################################################################
	//

	private finishedLoadingQueue: ((scene: Scene) => void)[] = []

	private currentlyLoading = false;
	private resourcesLoaded = false;
	private hasBeenInitialized = false;
	private hasFinishedLoading = false;

	private loadingStartTime: number = 0;
	private minLoadTime = 0;

	private loadingChain?: AsyncChain;

	private finishedLoading(chain: AsyncChain) {

		// fake longer loading time for smooth animation
		const loadingTime = Date.now() - this.loadingStartTime;
		if(loadingTime < this.minLoadTime) {
			const _this = this;
			setTimeout(() => {
				this.finishedLoading(chain);
			}, this.minLoadTime-loadingTime);
			return;
		}

		// update the scene size
		this.updateBounds()

		// reset view position
		this.getRenderer()?.zoomReset()


		// make container visibility
		this.getContainers().setVisibility(true);

		// update image for rgb sensor
		this.getContainers().updateGroundImageDataFunction();

		this.currentlyLoading = false;
		this.hasFinishedLoading = true; // needs to be set before startSim() is called
		this.hasBeenInitialized = true;

		if(this.autostartSim) {
			// auto start simulation
			this.startSim();
		}

		console.log('Finished loading!');

		this.finishedLoadingQueue.forEach(func => func(this))

		chain.next(); // technically we don't need this
	}

	/**
	 * Runs `func` after the loading is complete.
	 * If the scene is not loading, then `func` is called directly
	 */
	runAfterLoading(func: (scene: Scene) => void) {
		if (this.isLoadingComplete()) {
			func(this)
		} else {
			this.finishedLoadingQueue.push(func)
		}
	}

	isLoadingComplete() {
		return this.hasFinishedLoading
	}

	/**
	 * Reloads the whole scene and force reloads the assets
	 */
	fullReset(robotSetupData: RobotSetupData[]) {
		this.load(robotSetupData, true);
	}

	/**
	 * Reloads the whole scene without reloading the assets
	 */
	reset(robotSetupData: RobotSetupData[]) {
		this.load(robotSetupData);
	}

	private unload(chain: AsyncChain) {

		// we could do this again if we need to
		if(this.simTicker.running) {
			console.warn('sim timer is still running!!!');
		}

		// remove robots
		this.getRobotManager().clear()

		// remove all physic bodies
		Composite.clear(this.getWorld(), false, true);

		// remove all drawables from the containers
		this.getContainers().clear();

		// reset function for rgb sensor
		this.getContainers().resetGroundDataFunction()

		// remove entities
		this.getEntityManager().clear()

		chain.next();
	}

	/**
	 * load or reload this scene
	 * @param forceLoadAssets
	 */
	load(robotSetupData: RobotSetupData[], forceLoadAssets: boolean = false) {
		if(this.currentlyLoading) {
			console.warn('Already loading scene... !');
			return;
		}

		this.getRobotManager().configurationManager.setRobotConfigurations(
			robotSetupData.map(setup => setup.sensorConfiguration)
		)
		this.getProgramManager().setPrograms(robotSetupData.map(setup => setup.program))

		// stop the simulation
		this.pauseSim()

		this.debug.clearDebugGuiDynamic() // if dynamic debug gui exist, clear it

		this.currentlyLoading = true; // this flag will start loading animation update
		this.hasFinishedLoading = false;

		// hide rendering containers
		this.getContainers().setVisibility(false);

		// build new async chain
		this.loadingChain = new AsyncChain();


		// 1. stop simulation
		this.loadingChain.push(this.simTicker.generateAsyncStopListener())

		// 2. if initialized, unload + deinit
		if(this.hasBeenInitialized) {
			// unload old things
			this.loadingChain.push(
				{func: this.unload, thisContext: this}, // unload scene (pixi/robots/matterjs)
				{func: this.onDeInit, thisContext: this}, // deinit scene
				{func: chain => {this.hasBeenInitialized = false; chain.next()}, thisContext: this}, // reset flag
			);
		}

		// 3. unload and/or reload assets
		if(!this.resourcesLoaded || forceLoadAssets) {

			if(this.resourcesLoaded) {
				// unload resources
				this.loadingChain.push(
					{func: this.onUnloadAssets, thisContext: this}, // unload user assets
					{func: chain => {this.resourcesLoaded = false; chain.next()}, thisContext: this}, // reset flag
				)
			}

			// load resources
			this.loadingChain.push(
				{func: this.onLoadAssets, thisContext: this}, // load user assets
				// set resource loaded flag
				{func: chain => {this.resourcesLoaded = true; chain.next();}, thisContext: this},
			);
		}

		// 4. init scene and finish loading
		this.loadingChain.push(
			{func: chain => {
				this._unit = this.getUnitConverter()
				this.simulationTime = 0
				chain.next()
			}, thisContext: this },
			{func: this.onInit, thisContext: this}, // init scene
			// swap from loading to scene, remove loading animation, cleanup, ...
			{func: this.finishedLoading, thisContext: this},
		);

		this.onChainCompleteListeners.forEach(listener => listener.call(this, this.loadingChain!))

		console.log('starting to load scene!');
		console.log('Loading stages: ' + this.loadingChain.length());

		// start time
		this.loadingStartTime = Date.now();

		this.loadingChain.next();
	}

	//
	// #############################################################################
	//

	/**
	 * Physics engine used by the scene
	 */
	readonly engine: Engine = Engine.create();
	readonly world: World = this.engine.world;
	public autostartSim = true;

	getEngine(): Engine {
		return this.engine;
	}

	getWorld(): World {
		return this.world;
	}

	/**
	 * current delta time for the physics simulation (internal units)
	 */
	private dt = 0.016;

	private simulationTime = 0

	/**
	 * Returns the time since the simulation is running in seconds
	 */
	getSimulationTime(): number {
		return this.unit.fromTime(this.simulationTime)
	}

	/**
	 * Sets the simulation DT in seconds (SI-Unit)
	 * @param dt
	 */
	setDT(dt: number) {
		this.dt = this.getUnitConverter().getTime(dt);
	}

	getDT() {
		return this.dt
	}

	getAllPhysicsBodies() {
		return Composite.allBodies(this.world)
	}

	/**
	 * Returns all bodies containing the given point
	 * @param position position to check for bodies
	 * @param singleBody whether to return only one body
	 */
	getBodiesAt(position: PIXI.IPointData, singleBody:boolean = false): Body[] {
		let intersected:Body[] = []
		let bodies: Body[] = Composite.allBodies(this.world);

		// code borrowed from Matterjs MouseConstraint
		for (let i = 0; i < bodies.length; i++) {
			let body = bodies[i];
			if (Bounds.contains(body.bounds, position) && body.enableMouseInteraction) {
				for (let j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
					let part = body.parts[j];
					if (Vertices.contains(part.vertices, position)) {
						intersected.push(body);

						if(singleBody) {
							return intersected;
						}

						break;
					}
				}
			}
		}

		return intersected;
	}

	//
	// #############################################################################
	//

	/**
	 * sleep time before calling update (SI-Unit)
	 */
	private simSleepTime = this.dt;
	private simMinSpeedupFactor = 2;
	private simSpeedupFactor = this.simMinSpeedupFactor;

	/**
	 * simulation ticker/timer
	 */
	private readonly simTicker: Timer;

	setSimTickerStopPollTime(pollTime: number) {
		this.simTicker.setTickerStopPollTime(pollTime)
	}

	startSim() {
		if(this.hasFinishedLoading) {
			this.simTicker.start()
			this.eventManager.onStartSimulationCallHandlers()
		} else {
			console.warn("'startSim()' is called during the loading process.")
		}
	}

	pauseSim() {
		this.simTicker.stop()
		this.eventManager.onPauseSimulationCallHandlers()
	}

	/**
	 * Sets the sim sleep time in seconds.
	 * @param simSleepTime
	 */
	setSimSleepTime(simSleepTime: number) {
		this.simSleepTime = simSleepTime;
		this.simTicker.sleepTime = this.simSleepTime;
	}

	setSpeedUpFactor(speedup: number) {
		speedup = Math.round(speedup)
		if(speedup < 1) {
			console.error("Sim speed needs to be greater than 0!")
			return
		}

		this.simSpeedupFactor = Math.max(speedup, this.simMinSpeedupFactor)
	}

	getCurrentSimTickRate(): number {
		return Math.round(1000/this.simTicker.lastDT) * this.simSpeedupFactor
	}

	//
	// #############################################################################
	//

	/**
	 * Debug renderer used by the scene for all registered physics object
	 */
	private debugRenderer?: Render;

	/**
	 * whether to create debug displayables to show all physics objects
	 */
	private debugPixiRendering = false;

	
	/**
	 * current rendering instance
	 */
	private sceneRenderer?: SceneRender;

	getRenderer(): SceneRender | undefined {
		return this.sceneRenderer;
	}

	setSceneRenderer(robotSetupData: RobotSetupData[], sceneRenderer?: SceneRender, noLoad: boolean = false) {

		if(sceneRenderer != this.sceneRenderer) {
			this.sceneRenderer = sceneRenderer;

			if(sceneRenderer) {
				// this will remove all registered rendering containers
				sceneRenderer.switchScene(robotSetupData, this); 

				// register rendering containers
				this.getContainers().registerToEngine()
			}
		}

		if(sceneRenderer && !this.hasFinishedLoading && !noLoad) {
			this.load(robotSetupData, true); // force reload assets
		}
	}

	renderTick(dt: number) {
		// update rendering positions
		this.getEntityManager().updateDrawablePosition()

		// update sensor data overlay
		this.getRobotManager().updateSensorValueView()

		this.onRenderTick(dt)
	}

	//
	// #############################################################################
	//

	/**
	 * 
	 * @param name if name is an empty string -> disable debug gui
	 */
	constructor(name: string) {

		// set scene name
		this.name = name
		
		// register events
		const _this = this;

		this.simTicker = new Timer(this.simSleepTime, (delta) => {
			// delta is the time from last render call
			for(let i = 0; i < _this.simSpeedupFactor; i++) {
				if (_this.simTicker.shallStop) {
					break
				}
				_this.update();
			}
		});

		// simulation defaults
		// TODO: Gravity scale may depend on the chosen units
		this.engine.world.gravity = { scale: 1, x: 0, y: 0};

		if(this.constructor.name === Scene.name) {
			// No specialized scene => finished loading
			this.autostartSim = false
			this.finishedLoading(new AsyncChain())
		}

		// has to be called after the name has been defined
		// defined 
		this.debug = new SceneDebug(this, this.constructor.name === Scene.name) // TODO: remove disabled flag???
	}

	//
	// #############################################################################
	//

	destroy() {
		this.simTicker.stop()
	}

	//
	// #############################################################################
	//

	private mouseConstraint?: Constraint

	interactionEvent(ev: ScrollViewEvent) {
		switch (ev.type) {
			case EventType.PRESS:

				// get bodies
				const mousePosition = ev.data.getCurrentLocalPosition()
				const bodies = this.getBodiesAt(mousePosition);

				if(DEBUG) {
					console.log(`Mouse position: ${JSON.stringify(mousePosition)}`)
				}

				if (bodies.length >= 1) {
					const body = bodies[0]
					ev.cancel()
					Sleeping.set(body, false)
					if (this.mouseConstraint) {
						World.remove(this.world, this.mouseConstraint)
					}
					this.mouseConstraint = Constraint.create({
						bodyA: body,
						pointA: Util.vectorSub(mousePosition, body.position),
						pointB: mousePosition
					})
					// attach constraint
					World.add(this.world, this.mouseConstraint)
				}
				break;

			case EventType.RELEASE:
				// remove constrain
				if (this.mouseConstraint) {
					World.remove(this.world, this.mouseConstraint)
					this.mouseConstraint = undefined
				}
				break;

			case EventType.DRAG:
				// move constrain
				if (this.mouseConstraint) {
					this.mouseConstraint.pointB = ev.data.getCurrentLocalPosition()
					ev.cancel()
				}
				break;
		
			default:
				break;
		}
		

		this.onInteractionEvent(ev);
	}

	//
	// #############################################################################
	//

	protected waypointsManager = new WaypointsManager<ScoreWaypoint>()

	/**
	 * update physics and robots
	 */
	private update() {

		this.onUpdatePrePhysics();

		this.simulationTime += this.dt

		// update physics
		Engine.update(this.engine, this.dt)

		// update entities e.g. robots
		this.getEntityManager().update()


		// TODO: Handle multiple robots and waypoints
		if (this.robotManager.getNumberOfRobots() >= 1) {
			this.waypointsManager.update(this.robotManager.getRobots()[0].body.position)
		}

		this.getProgramManager().update(); // update breakpoints, ...

		// FIX Grid bucket memory consumption
		// Remove empty buckets
		const grid = this.engine.broadphase
		grid.bucketHeight = 10000
		grid.bucketWidth = 10000
		const anyGrid = <any>grid
		for (const key in anyGrid.buckets) {
			if (anyGrid.buckets[key].length == 0) {
				delete anyGrid.buckets[key]
			}
		}

		this.onUpdatePostPhysics();
	}

	// for debugging
	setupDebugRenderer(canvas: string | HTMLElement, wireframes: boolean=false, enableMouse: boolean=true) {

		if(this.debugRenderer) {
			console.error("Debug renderer already used!");
			return;
		}

		let htmlCanvas = null;

		if(canvas instanceof HTMLElement) {
			htmlCanvas = canvas;
		} else {
			htmlCanvas = document.getElementById(canvas);
		}

		this.debugRenderer = Render.create({
			element: htmlCanvas ? htmlCanvas : undefined,
			engine: this.engine,
			options: {wireframes:wireframes}
		});
		// scaling the context for close up rendering
		//this.debugRenderer.context.scale(10, 10)
		Render.run(this.debugRenderer);

		// TODO: Remove this if since there is an implementation in 'interactionEvent'?
		if(enableMouse && htmlCanvas) {
			var mouse = Mouse.create(htmlCanvas); // call before scene switch
			// TODO: different mouse constarains?
			var mouseConstraint = MouseConstraint.create(this.engine, {
				mouse: mouse
			});
			World.add(this.world, mouseConstraint);
		}

	}


	//
	// User defined functions
	//


	/**
	 * Loading of a scene:
	 *
	 * if this is a reset: call deInit
	 * (scene has to be initialized)
	 *
	 * Do after full reset or first time load:
	 * ---> loading animation
	 *  1. Load resources for internal things
	 *  2. call onLoad
	 *
	 * Do after position/scene reset:
	 * ---> loading animation
	 *
	 *  3. Init internal things
	 *      - score screen
	 *      - ???
	 *  4. call onInit
	 *
	 * ---> remove/disable loading animation
	 */


	/**
	 * unload all assets
	 */
	onUnloadAssets(chain: AsyncChain) {
		console.log('on asset unload');
		chain.next();
	}

	/**
	 * load all textures/resources and call chain.next() when done
	 * please do not block within this method and use the PIXI.Loader callbacks
	 */
	onLoadAssets(chain: AsyncChain) {
		console.log('on asset load');
		chain.next();
	}

	/**
	 * Returns the unit converter which is used for this scene
	 */
	getUnitConverter(): Unit {
		return new Unit({})
	}

	/**
	 * called on scene switch
	 *
	 * create Robot, physics and other scene elements
	 *
	 * intit is included in the loading process
	 */
	onInit(chain: AsyncChain) {
		// create dynamic debug gui
		this.initDynamicDebugGui()
		
		console.log('on init');
		chain.next();
	}

	/**
	 * called on scene reset/unload
	 */
	onDeInit(chain: AsyncChain) {
		console.log('on deinit/unload');
		chain.next();
	}

	/**
	 * called before updating physics and robots
	 */
	onUpdatePrePhysics() {

	}

	/**
	 * called after all physics updates
	 * probably use onUpdate instead
	 */
	onUpdatePostPhysics() {

	}

	/**
	 * called once per frame
	 */
	onRenderTick(dt: number) {

	}

	/**
	 * called after a mouse/touch or scroll event
	 * @param ev event data
	 */
	onInteractionEvent(ev: ScrollViewEvent) {

	}


}