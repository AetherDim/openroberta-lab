import {Scene} from "../Scene";

export class ContainerManager {

    private readonly scene: Scene

    constructor(scene: Scene) {
        this.scene = scene
        // setup graphic containers
        this.setupContainers();
    }

    /**
     * layer 0: ground
     */
    readonly groundContainer = new PIXI.Container();
    /**
     * z-index for PIXI, this will define the rendering layer
     */
    readonly groundContainerZ = 0;

    /**
     * layer 1: ground animation
     */
    readonly groundAnimationContainer = new PIXI.Container()
    /**
     * z-index for PIXI, this will define the rendering layer
     */
    readonly groundAnimationContainerZ = 10;

    /**
     * layer 2: entity bottom layer (shadows/effects/...)
     */
    readonly entityBottomContainer = new PIXI.Container()
    /**
     * z-index for PIXI, this will define the rendering layer
     */
    readonly entityBottomContainerZ = 20;

    /**
     * layer 3: physics/other things <- robots
     */
    readonly entityContainer = new PIXI.Container()
    /**
     * z-index for PIXI, this will define the rendering layer
     */
    readonly entityContainerZ = 30;

    /**
     * layer 4: for entity descriptions/effects
     */
    readonly entityTopContainer = new PIXI.Container()
    /**
     * z-index for PIXI, this will define the rendering layer
     */
    readonly entityTopContainerZ = 40;

    /**
     * layer 5: top/text/menus
     */
    readonly topContainer = new PIXI.Container()
    readonly topContainerZ = 50;


    readonly containerList: PIXI.Container[] = [
        this.groundContainer,
        this.groundAnimationContainer,
        this.entityBottomContainer,
        this.entityContainer,
        this.entityTopContainer,
        this.topContainer
    ];

    protected setupContainers() {
        this.groundContainer.zIndex = this.groundContainerZ;
        this.groundAnimationContainer.zIndex = this.groundAnimationContainerZ;
        this.entityBottomContainer.zIndex = this.entityBottomContainerZ;
        this.entityContainer.zIndex = this.entityContainerZ;
        this.entityTopContainer.zIndex = this.entityTopContainerZ;
        this.topContainer.zIndex = this.topContainerZ;
    }

    registerToEngine() {
        const renderer = this.scene.getRenderer()
        if (!renderer) {
            console.warn('No renderer to register containers to!');
            return
        }
        this.containerList.forEach(container => {
            renderer.add(container);
        });
    }

    setVisibility(visible: boolean) {
        this.containerList.forEach(container => {
            container.visible = visible;
        });
    }

    //protected removeTexturesOnUnload = true;
    //protected removeBaseTexturesOnUnload = true;

    private clearContainer(container: PIXI.Container) {
        // remove children from parent before destroy
        // see: https://github.com/pixijs/pixi.js/issues/2800
        // const children: PIXI.DisplayObject[] = []
        // for (const child of container.children) {
        // 	children.push(child)
        // }
        container.removeChildren();

        // FIXME: Should we destroy the children?
        // Note that e.g. scoreText has to be replaced since it might be destroyed

        // children.forEach(child => {
        // 	child.destroy();
        // });

        /*container.destroy({
            children: true,
            texture: this.removeTexturesOnUnload,
            baseTexture: this.removeBaseTexturesOnUnload
        });*/
    }


    private _initialGroundDataFunction(x: number, y: number, w: number, h: number): ImageData {
        this.updateGroundImageDataFunction()
        return this.getGroundImageData(x, y, w, h) // very hacky
    }

    resetGroundDataFunction() {
        this.getGroundImageData = this._initialGroundDataFunction
    }

    getGroundImageData: (x: number, y: number, w: number, h: number) => ImageData = this._initialGroundDataFunction

    updateGroundImageDataFunction() {
        const groundVisible = this.groundContainer.visible
        this.groundContainer.visible = true // the container needs to be visible for this to work

        const canvas = this.scene.getRenderer()?.getCanvasFromDisplayObject(this.groundContainer)
        const renderingContext = canvas?.getContext("2d")
        const bounds = this.groundContainer.getBounds()
        if (renderingContext) {
            const scaleX = 1 / this.groundContainer.parent.scale.x
            const scaleY = 1 / this.groundContainer.parent.scale.y
            bounds.x *= scaleX
            bounds.y *= scaleY
            bounds.width *= scaleX
            bounds.height *= scaleY
            this.getGroundImageData = (x, y, w, h) => renderingContext.getImageData(
                x - bounds.x,
                y - bounds.y, w, h)
        }

        this.groundContainer.visible = groundVisible
    }

    /**
     * CLear all containers
     */
    clear() {
        this.containerList.forEach(container => {
            this.clearContainer(container);
        });
    }

}