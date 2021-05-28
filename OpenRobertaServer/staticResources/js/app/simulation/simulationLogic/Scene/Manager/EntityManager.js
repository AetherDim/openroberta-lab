define(["require", "exports", "../../Entity", "matter-js", "../../Util"], function (require, exports, Entity_1, matter_js_1, Util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EntityManager = void 0;
    var EntityManager = /** @class */ (function () {
        function EntityManager(scene) {
            this.entities = [];
            this.updatableEntities = [];
            this.drawablePhysicsEntities = [];
            this.scene = scene;
        }
        EntityManager.prototype.containsEntity = function (entity) {
            return this.entities.includes(entity);
        };
        EntityManager.prototype.addEntities = function () {
            var _this = this;
            var entities = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                entities[_i] = arguments[_i];
            }
            entities.forEach(function (entity) { return _this.addEntity(entity); });
        };
        EntityManager.prototype.addEntity = function (entity) {
            var _a, _b;
            if (entity.getScene() != this.scene) {
                console.warn("Entity " + entity + " is not in this (" + this + ") scene");
            }
            if (!this.entities.includes(entity)) {
                this.entities.push(entity);
                // register physics and graphics
                if (Entity_1.Type.IUpdatableEntity.isSupertypeOf(entity)) {
                    this.updatableEntities.push(entity);
                }
                if (Entity_1.Type.IDrawableEntity.isSupertypeOf(entity)) {
                    var container = (_b = (_a = entity.getContainer) === null || _a === void 0 ? void 0 : _a.call(entity)) !== null && _b !== void 0 ? _b : this.scene.getContainers().entityContainer;
                    container.addChild(entity.getDrawable());
                }
                // TODO: Think about this. There might be wrapper types.
                // Only add entities with no parents to the physics world.
                // A parent should imply a physics `Composite` which only has to be added once.
                if (entity.getParent() == undefined && Entity_1.Type.IPhysicsEntity.isSupertypeOf(entity)) {
                    matter_js_1.Composite.add(this.scene.getWorld(), entity.getPhysicsObject());
                }
                if (Entity_1.Type.IDrawablePhysicsEntity.isSupertypeOf(entity)) {
                    this.drawablePhysicsEntities.push(entity);
                }
                if (Entity_1.Type.IContainerEntity.isSupertypeOf(entity)) {
                    var t_1 = this;
                    entity.getChildren().forEach(function (entity) { return t_1.addEntity(entity); });
                }
            }
        };
        EntityManager.prototype.removeEntity = function (entity) {
            var _a;
            if (entity.getScene() != this.scene) {
                console.warn("Entity " + entity + " is not in this (" + this + ") scene");
            }
            if (Util_1.Util.removeFromArray(this.entities, entity)) {
                // remove from parent
                var parentEntity = entity.getParent();
                if (parentEntity != undefined) {
                    parentEntity.removeChild(entity);
                }
                // remove physics and graphics
                if (Entity_1.Type.IUpdatableEntity.isSupertypeOf(entity)) {
                    Util_1.Util.removeFromArray(this.updatableEntities, entity);
                }
                if (Entity_1.Type.IDrawableEntity.isSupertypeOf(entity)) {
                    (_a = entity.getContainer) === null || _a === void 0 ? void 0 : _a.call(entity).removeChild(entity.getDrawable());
                }
                if (Entity_1.Type.IDrawablePhysicsEntity.isSupertypeOf(entity)) {
                    // TODO: The entity might not be in the world and will therefore not
                    // removed from its parent container
                    matter_js_1.Composite.remove(this.scene.getWorld(), entity.getPhysicsObject(), true);
                    Util_1.Util.removeFromArray(this.drawablePhysicsEntities, entity);
                }
                if (Entity_1.Type.IContainerEntity.isSupertypeOf(entity)) {
                    var children = entity.getChildren();
                    for (var i = 0; i < children.length; i++) {
                        entity.removeChild(children[i]);
                    }
                }
            }
        };
        EntityManager.prototype.updateDrawablePosition = function () {
            this.drawablePhysicsEntities.forEach(function (entity) {
                entity.updateDrawablePosition();
            });
        };
        EntityManager.prototype.update = function () {
            var _this = this;
            this.updatableEntities.forEach(function (entity) { return entity.update(_this.scene.getDT()); });
        };
        EntityManager.prototype.getNumberOfEntities = function () {
            return this.entities.length;
        };
        EntityManager.prototype.getNumberOfUpdatableEntities = function () {
            return this.updatableEntities.length;
        };
        EntityManager.prototype.getNumberOfDrawablePhysicsEntities = function () {
            return this.drawablePhysicsEntities.length;
        };
        /**
         * remove all entities
         */
        EntityManager.prototype.clear = function () {
            this.entities.length = 0;
            this.updatableEntities.length = 0;
            this.drawablePhysicsEntities.length = 0;
        };
        return EntityManager;
    }());
    exports.EntityManager = EntityManager;
});
