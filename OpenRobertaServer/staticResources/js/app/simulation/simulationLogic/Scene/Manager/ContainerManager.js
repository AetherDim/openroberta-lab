define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContainerManager = void 0;
    var ContainerManager = /** @class */ (function () {
        function ContainerManager(scene) {
            /**
             * layer 0: ground
             */
            this.groundContainer = new PIXI.Container();
            /**
             * z-index for PIXI, this will define the rendering layer
             */
            this.groundContainerZ = 0;
            /**
             * layer 1: ground animation
             */
            this.groundAnimationContainer = new PIXI.Container();
            /**
             * z-index for PIXI, this will define the rendering layer
             */
            this.groundAnimationContainerZ = 10;
            /**
             * layer 2: entity bottom layer (shadows/effects/...)
             */
            this.entityBottomContainer = new PIXI.Container();
            /**
             * z-index for PIXI, this will define the rendering layer
             */
            this.entityBottomContainerZ = 20;
            /**
             * layer 3: physics/other things <- robots
             */
            this.entityContainer = new PIXI.Container();
            /**
             * z-index for PIXI, this will define the rendering layer
             */
            this.entityContainerZ = 30;
            /**
             * layer 4: for entity descriptions/effects
             */
            this.entityTopContainer = new PIXI.Container();
            /**
             * z-index for PIXI, this will define the rendering layer
             */
            this.entityTopContainerZ = 40;
            /**
             * layer 5: top/text/menus
             */
            this.topContainer = new PIXI.Container();
            this.topContainerZ = 50;
            this.containerList = [
                this.groundContainer,
                this.groundAnimationContainer,
                this.entityBottomContainer,
                this.entityContainer,
                this.entityTopContainer,
                this.topContainer
            ];
            this.getGroundImageData = this._initialGroundDataFunction;
            this.scene = scene;
            // setup graphic containers
            this.setupContainers();
        }
        ContainerManager.prototype.setupContainers = function () {
            this.groundContainer.zIndex = this.groundContainerZ;
            this.groundAnimationContainer.zIndex = this.groundAnimationContainerZ;
            this.entityBottomContainer.zIndex = this.entityBottomContainerZ;
            this.entityContainer.zIndex = this.entityContainerZ;
            this.entityTopContainer.zIndex = this.entityTopContainerZ;
            this.topContainer.zIndex = this.topContainerZ;
        };
        ContainerManager.prototype.registerToEngine = function () {
            var renderer = this.scene.getRenderer();
            if (!renderer) {
                console.warn('No renderer to register containers to!');
                return;
            }
            this.containerList.forEach(function (container) {
                renderer.add(container);
            });
        };
        ContainerManager.prototype.setVisibility = function (visible) {
            this.containerList.forEach(function (container) {
                container.visible = visible;
            });
        };
        //protected removeTexturesOnUnload = true;
        //protected removeBaseTexturesOnUnload = true;
        ContainerManager.prototype.clearContainer = function (container) {
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
        };
        ContainerManager.prototype._initialGroundDataFunction = function (x, y, w, h) {
            this.updateGroundImageDataFunction();
            return this.getGroundImageData(x, y, w, h); // very hacky
        };
        ContainerManager.prototype.resetGroundDataFunction = function () {
            this.getGroundImageData = this._initialGroundDataFunction;
        };
        ContainerManager.prototype.updateGroundImageDataFunction = function () {
            var _a;
            console.log('init color sensor texture');
            var groundVisible = this.groundContainer.visible;
            this.groundContainer.visible = true; // the container needs to be visible for this to work
            var bounds = this.groundContainer.getLocalBounds();
            var width = this.groundContainer.width;
            var height = this.groundContainer.height;
            var pixelData = (_a = this.scene.getRenderer()) === null || _a === void 0 ? void 0 : _a.convertToPixels(this.groundContainer);
            if (pixelData != undefined) {
                this.getGroundImageData = function (x, y, w, h) {
                    var newX = x - bounds.x;
                    var newY = y - bounds.y;
                    var index = (Math.round(newX) + Math.round(newY) * Math.round(width)) * 4;
                    if (0 <= newX && newX <= width &&
                        0 <= newY && newY <= height &&
                        0 <= index && index + 3 < pixelData.length) {
                        return [pixelData[index], pixelData[index + 1], pixelData[index + 2], pixelData[index + 3]];
                    }
                    else {
                        return [0, 0, 0, 0];
                    }
                };
            }
            this.groundContainer.visible = groundVisible;
        };
        /**
         * CLear all containers
         */
        ContainerManager.prototype.clear = function () {
            var _this = this;
            this.containerList.forEach(function (container) {
                _this.clearContainer(container);
            });
        };
        return ContainerManager;
    }());
    exports.ContainerManager = ContainerManager;
});
