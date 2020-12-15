import { objectAssign, getPlaceableById, getMinPadding, PlaceableType, Magic } from "../../../module/tokenmagic.js";
import "../../../module/proto/PlaceableObjectProto.js";
import { CustomFilter } from '../CustomFilter.js';

PIXI.Filter.prototype.setTMParams = function (params) {
    this.autoDisable = false;
    this.autoDestroy = false;
    this.padding = 0;
    this.gridPadding = 0;
    this.rawPadding = 0;
    this.boundsPadding = new PIXI.Point(0, 0);
    this.currentPadding = 0;
    this.recalculatePadding = true;
    this.dummy = false;
    objectAssign(this, params);
    if (!this.dummy) {
        this.rawPadding = this.padding;
        this.originalPadding = Math.max(this.padding, getMinPadding());
        this.assignPlaceable();
        this.activateTransform();
        Object.defineProperty(this, "padding", {
            get: function () {
                if (this.recalculatePadding)
                    this.calculatePadding();
                return this.currentPadding;
            },
            set: function (padding) {
                this.rawPadding = padding;
                this.originalPadding = Math.max(padding, getMinPadding());
            }
        });
    } else {
        this.apply = function () { }
    }
}

PIXI.Filter.prototype.getPlaceable = function () {
    return getPlaceableById(this.placeableId, this.placeableType);
}

PIXI.Filter.prototype.getPlaceableType = function () {
    return this.placeableType;
}

PIXI.Filter.prototype.calculatePadding = function () {
    const scale = this.targetPlaceable.worldTransform.a;
    const rotation = this.placeableImg.rotation;
    const width = this.placeableImg.width;
    const height = this.placeableImg.height;

    let boundsPadding;

    if (this.gridPadding > 0) {
        const imgSize = Math.max(width, height);
        const toSize = (canvas.dimensions.size >= imgSize
            ? canvas.dimensions.size - imgSize
            : imgSize % canvas.dimensions.size);

        boundsPadding =
            (scale * (this.gridPadding - 1)
                * canvas.dimensions.size) + ((toSize * scale) / 2);
    } else {
        boundsPadding = scale * this.rawPadding;
    }

    if (!(this instanceof CustomFilter)) {
        this.boundsPadding.x = boundsPadding;
        this.boundsPadding.y = boundsPadding;
        this.currentPadding = boundsPadding;
    } else if (this.sticky) {
        this.boundsPadding.x = boundsPadding;
        this.boundsPadding.y = boundsPadding;
        this.currentPadding = Math.max(
            Math.abs(boundsPadding * Math.cos(rotation)) + Math.abs(boundsPadding * Math.sin(rotation)),
            Math.abs(boundsPadding * Math.sin(rotation)) + Math.abs(boundsPadding * Math.cos(rotation))
        );
    } else {
        if (this.placeableType === PlaceableType.TOKEN) {
            this.boundsPadding.x = boundsPadding;
            this.boundsPadding.y = boundsPadding;
        } else {
            const sx = (Math.abs(width * Math.cos(rotation)) + Math.abs(height * Math.sin(rotation))) / width - 1;
            const sy = (Math.abs(width * Math.sin(rotation)) + Math.abs(height * Math.cos(rotation))) / height - 1;
            this.boundsPadding.x = boundsPadding + scale * width * sx / 2;
            this.boundsPadding.y = boundsPadding + scale * height * sy / 2;
        }
        this.currentPadding = boundsPadding;
    }

    this.currentPadding += scale * (this.originalPadding - this.rawPadding);
}

PIXI.Filter.prototype.assignPlaceable = function () {

    this.targetPlaceable = this.getPlaceable();
    this.targetPlaceable != null
        ? this.placeableImg = this.targetPlaceable._TMFXgetSprite()
        : this.placeableImg = null;
}

PIXI.Filter.prototype.activateTransform = function () {
    this.preComputation = this.filterTransform;
    this.filterTransform();

    const apply = this.apply;
    this.apply = function () {
        if ("handleTransform" in this) {
            this.handleTransform();
        }
        return apply.apply(this, arguments);
    }
}

PIXI.Filter.prototype.filterTransform = function () {
    if (this.hasOwnProperty("zIndex")) {
        this.placeableImg.parent.zIndex = this.zIndex;
    }
}

PIXI.Filter.prototype.normalizeTMParams = function () {

    if (this.hasOwnProperty("animated") && !(this.animated == null)) {

        // Normalize animations properties
        Object.keys(this.animated).forEach((effect) => {
            if (!(this.animated[effect].hasOwnProperty("active"))
                || this.animated[effect].active == null
                || typeof this.animated[effect].active != "boolean") {
                this.animated[effect].active = true;
            }
            if (!(this.animated[effect].hasOwnProperty("loops"))
                || this.animated[effect].loops == null
                || typeof this.animated[effect].loops != "number"
                || this.animated[effect].loops <= 0) {
                this.animated[effect].loops = Infinity;
            }
            if (!(this.animated[effect].hasOwnProperty("loopDuration"))
                || this.animated[effect].loopDuration == null
                || typeof this.animated[effect].loopDuration != "number"
                || this.animated[effect].loopDuration <= 0) {
                this.animated[effect].loopDuration = 3000;
            }
            if (!(this.animated[effect].hasOwnProperty("pauseBetweenDuration"))
                || this.animated[effect].pauseBetweenDuration == null
                || typeof this.animated[effect].pauseBetweenDuration != "number"
                || this.animated[effect].pauseBetweenDuration <= 0) {
                this.animated[effect].pauseBetweenDuration = 0;
            }
            if (!(this.animated[effect].hasOwnProperty("syncShift"))
                || this.animated[effect].syncShift == null
                || typeof this.animated[effect].syncShift != "number"
                || this.animated[effect].syncShift < 0) {
                this.animated[effect].syncShift = 0;
            }
            if (!(this.animated[effect].hasOwnProperty("val1"))
                || this.animated[effect].val1 == null
                || typeof this.animated[effect].val1 != "number") {
                this.animated[effect].val1 = 0;
            }
            if (!(this.animated[effect].hasOwnProperty("val2"))
                || this.animated[effect].val2 == null
                || typeof this.animated[effect].val2 != "number") {
                this.animated[effect].val2 = 0;
            }
            if (!(this.animated[effect].hasOwnProperty("animType"))
                || this.anime[this.animated[effect].animType] === undefined) {
                this.animated[effect].animType = null;
            }
            if (!(this.animated[effect].hasOwnProperty("speed"))
                || this.animated[effect].speed == null
                || typeof this.animated[effect].speed != "number") {
                this.animated[effect].speed = 0;
            }
            if (!(this.animated[effect].hasOwnProperty("chaosFactor"))
                || this.animated[effect].chaosFactor == null
                || typeof this.animated[effect].chaosFactor != "number") {
                this.animated[effect].chaosFactor = 0.25;
            }
            if (!(this.animated[effect].hasOwnProperty("wantInteger"))
                || this.animated[effect].wantInteger == null
                || typeof this.animated[effect].wantInteger != "boolean") {
                this.animated[effect].wantInteger = false;
            }

            if (!this.anime.hasInternals(effect)) {
                this.anime.initInternals(effect);
            }

            this.anime.animated = this.animated;
        });
    }
}