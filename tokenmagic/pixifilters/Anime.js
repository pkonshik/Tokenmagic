export class Anime {

    constructor(puppet) {

        let self = this;
        this.puppet = puppet;
        this.twoPi = Math.PI * 2;
        this.animated = null;
        this.animeId = randomID();
        this.isGood = false;

        // Time/synchronization related variables
        this.frameTime = {};
        this.elapsedTime = {};
        this.loops = {};
        this.ping = {};
        this.pauseBetweenElapsedTime = {};
        this.pauseBetween = {};

        if (!(this.puppet == null)) {
            if (this.puppet.hasOwnProperty("animated")
                && typeof this.puppet.animated === 'object'
                && Object.keys(this.puppet.animated).length > 0) {

                Object.keys(this.puppet.animated).forEach((effect) => {

                    // Internals init
                    this.elapsedTime[effect] = 0;
                    this.pauseBetweenElapsedTime[effect] = 0;
                    this.loops[effect] = 0;
                    this.frameTime[effect] = 0;
                    this.pauseBetween[effect] = false;
                    this.ping[effect] = false;

                    // Verify and put to defaults if necessary
                    if (!(this.puppet.animated[effect].hasOwnProperty("loops"))
                        || this.puppet.animated[effect].loops == null
                        || typeof this.puppet.animated[effect].loops != "number"
                        || this.puppet.animated[effect].loops <= 0) {
                        this.puppet.animated[effect].loops = Infinity;
                    }
                    if (!(this.puppet.animated[effect].hasOwnProperty("loopDuration"))
                        || this.puppet.animated[effect].loopDuration == null
                        || typeof this.puppet.animated[effect].loopDuration != "number"
                        || this.puppet.animated[effect].loopDuration <= 0) {
                        this.puppet.animated[effect].loopDuration = 3000;
                    }
                    if (!(this.puppet.animated[effect].hasOwnProperty("pauseBetweenDuration"))
                        || this.puppet.animated[effect].pauseBetweenDuration == null
                        || typeof this.puppet.animated[effect].pauseBetweenDuration != "number"
                        || this.puppet.animated[effect].pauseBetweenDuration <= 0) {
                        this.puppet.animated[effect].pauseBetweenDuration = 0;
                    }
                    if (!(this.puppet.animated[effect].hasOwnProperty("syncShift"))
                        || this.puppet.animated[effect].syncShift == null
                        || typeof this.puppet.animated[effect].syncShift != "number"
                        || this.puppet.animated[effect].syncShift < 0) {
                        this.puppet.animated[effect].syncShift = 0;
                    }
                    if (!(this.puppet.animated[effect].hasOwnProperty("val1"))
                        || this.puppet.animated[effect].val1 == null
                        || typeof this.puppet.animated[effect].val1 != "number") {
                        this.puppet.animated[effect].val1 = 0;
                    }
                    if (!(this.puppet.animated[effect].hasOwnProperty("val2"))
                        || this.puppet.animated[effect].val2 == null
                        || typeof this.puppet.animated[effect].val2 != "number") {
                        this.puppet.animated[effect].val2 = 0;
                    }
                    if (!(this.puppet.animated[effect].hasOwnProperty("animType"))
                        || this[this.puppet.animated[effect].animType] === undefined) {
                        this.puppet.animated[effect].animType = null;
                    }
                    if (!(this.puppet.animated[effect].hasOwnProperty("speed"))
                        || this.puppet.animated[effect].speed == null
                        || typeof this.puppet.animated[effect].speed != "number") {
                        this.puppet.animated[effect].speed = 0;
                    }
                    if (!(this.puppet.animated[effect].hasOwnProperty("chaosFactor"))
                        || this.puppet.animated[effect].chaosFactor == null
                        || typeof this.puppet.animated[effect].chaosFactor != "number") {
                        this.puppet.animated[effect].chaosFactor = 0.25;
                    }
                    if (!(this.puppet.animated[effect].hasOwnProperty("wantInteger"))
                        || this.puppet.animated[effect].wantInteger == null
                        || typeof this.puppet.animated[effect].wantInteger != "boolean") {
                        this.puppet.animated[effect].wantInteger = false;
                    }
                });
                // easy access to the puppet's animodes
                this.animated = this.puppet.animated;
                // this is good !
                this.isGood = true;
                // ready to tick
                Anime.addAnimation(self);
            }
        }
    }

    animate(frameTime) {
        Object.keys(this.puppet.animated).forEach((effect) => {
            if (this.animated[effect].active && this.cycleCheck(effect, frameTime)) {
                if (this[this.animated[effect].animType] != null) {
                    this[this.animated[effect].animType](effect);
                }
                this.elapsedTime[effect] += frameTime;
            }
        });
    }

    cycleCheck(effect, frameTime) {
        this.frameTime[effect] = frameTime;
        if (this.isPauseBetweenLoop(effect, frameTime)) {
            return false;
        }
        if (this.elapsedTime[effect] > this.animated[effect].loopDuration) {
            this.elapsedTime[effect] -= this.animated[effect].loopDuration;
            this.ping[effect] = true;
            if (this.animated[effect].loops != Infinity) {
                this.loops[effect]++;
            }
            if (this.loops[effect] >= this.animated[effect].loops) {
                this.loops[effect] = 0;
                return (this.animated[effect].active = false);
            } else if (this.animated[effect].pauseBetweenDuration > 0) {
                this.pauseBetween[effect] = true;
            }
        }
        return true;
    }

    isPauseBetweenLoop(effect, frametime) {
        if (this.pauseBetween[effect] && this.animated[effect].pauseBetweenDuration > 0) {
            this.pauseBetweenElapsedTime[effect] += frametime;
            if (this.pauseBetweenElapsedTime[effect] < this.animated[effect].pauseBetweenDuration) {
                return true;
            } else {
                this.pauseBetweenElapsedTime[effect] = 0;
                return (this.pauseBetween[effect] = false);
            }
        }
        return false;
    }

    pauseBetweenCheck(effect, frametime) {
        if (this.pauseStart[effect] && this.animated[effect].pauseStartDuration > 0) {
            this.pauseStartElapsedTime[effect] += frametime;
            if (this.pauseStartElapsedTime[effect] < this.animated[effect].pauseStartDuration) {
                return false;
            } else {
                this.pauseStart[effect] = false;
                return true;
            }
        }
    }

    moveToward(effect) {
        this.puppet[effect] = ((this.animated[effect].val1 - this.animated[effect].val2)
            / this.animated[effect].loopDuration) * this.elapsedTime[effect];
    }

    colorOscillation(effect) {
        var rgbValue1 = Anime.valueToRgb(this.animated[effect].val1);
        var rgbValue2 = Anime.valueToRgb(this.animated[effect].val2);

        this.puppet[effect] = Anime.rgbToValue(
            Math.floor(Anime.oscillation(this.elapsedTime[effect], this.animated[effect].loopDuration, this.animated[effect].syncShift, rgbValue1[0], rgbValue2[0], Math.cos, false)),
            Math.floor(Anime.oscillation(this.elapsedTime[effect], this.animated[effect].loopDuration, this.animated[effect].syncShift, rgbValue1[1], rgbValue2[1], Math.cos, false)),
            Math.floor(Anime.oscillation(this.elapsedTime[effect], this.animated[effect].loopDuration, this.animated[effect].syncShift, rgbValue1[2], rgbValue2[2], Math.cos, false))
        );
    }

    cosOscillation(effect) {
        this.puppet[effect] =
            Anime.oscillation(
                this.elapsedTime[effect],
                this.animated[effect].loopDuration,
                this.animated[effect].syncShift,
                this.animated[effect].val1,
                this.animated[effect].val2,
                Math.cos,
                false);
    }

    sinOscillation(effect) {
        this.puppet[effect] =
            Anime.oscillation(
                this.elapsedTime[effect],
                this.animated[effect].loopDuration,
                this.animated[effect].syncShift,
                this.animated[effect].val1,
                this.animated[effect].val2,
                Math.sin,
                false);
    }

    chaoticOscillation(effect) {
        this.puppet[effect] =
            Anime.oscillation(
                this.elapsedTime[effect],
                this.animated[effect].loopDuration,
                this.animated[effect].syncShift + (Math.random() * this.animated[effect].chaosFactor),
                this.animated[effect].val1,
                this.animated[effect].val2,
                Math.cos,
                false);
    }

    syncCosOscillation(effect) {
        this.puppet[effect] =
            Anime.oscillation(
                this.elapsedTime[effect],
                this.animated[effect].loopDuration,
                this.animated[effect].syncShift,
                this.animated[effect].val1,
                this.animated[effect].val2,
                Math.cos,
                true);
    }

    syncSinOscillation(effect) {
        this.puppet[effect] =
            Anime.oscillation(
                this.elapsedTime[effect],
                this.animated[effect].loopDuration,
                this.animated[effect].syncShift,
                this.animated[effect].val1,
                this.animated[effect].val2,
                Math.sin,
                true);
    }

    syncChaoticOscillation(effect) {
        this.puppet[effect] =
            Anime.oscillation(
                this.elapsedTime[effect],
                this.animated[effect].loopDuration,
                this.animated[effect].syncShift + (Math.random() * this.animated[effect].chaosFactor),
                this.animated[effect].val1,
                this.animated[effect].val2,
                Math.cos,
                true);
    }

    rotation(effect) {
        var computedRotation = (360 * this.elapsedTime[effect]) / this.animated[effect].loopDuration;
        this.puppet[effect] = (this.animated[effect].clockWise ? computedRotation : 360 - computedRotation);
    }

    syncRotation(effect) {
        var computedRotation = Anime.getSynchronizedRotation(this.animated[effect].loopDuration, this.animated[effect].syncShift);
        this.puppet[effect] = (this.animated[effect].clockWise ? computedRotation : 360 - computedRotation);
    }

    randomNumber(effect) {
        var randomNumber = Math.random()
            * (this.animated[effect].val2 - this.animated[effect].val1)
            + this.animated[effect].val1;
        if (this.animated[effect].wantInteger) {
            this.puppet[effect] = Math.floor(randomNumber);
        } else {
            this.puppet[effect] = randomNumber;
        }
    }

    randomNumberPerLoop(effect) {
        if (this._ringing(effect)) {
            this.randomNumber(effect, this.frameTime[effect]);
        }
    }

    randomColor(effect) {
        this.puppet[effect] = Math.floor(Math.random() * 16777215);
    }

    randomColorPerLoop(effect) {
        if (this._ringing(effect)) {
            this.randomColor(effect, this.frameTime[effect]);
        }
    }

    move(effect) {
        this.puppet[effect] += (this.animated[effect].speed * this.frameTime[effect]);
    }

    _ringing(effect) {
        if (this.ping[effect]) {
            this.ping[effect] = false;
            return true;
        }
        return false;
    }

    static rgbToValue(r, g, b) {
        var bin = r << 16 | g << 8 | b;
        return bin;
    }

    static valueToRgb(bin) {
        var r = bin >> 16;
        var g = bin >> 8 & 0xFF;
        var b = bin & 0xFF;
        return [r, g, b];
    }

    static oscillation(elapsed, loopDuration, syncShift, val1, val2, func, isSync) {
        return ((val1 - val2)
            * (func(Anime.twoPi
                * (isSync ? Anime.getSynchronizedTime(loopDuration, syncShift) : ((elapsed / loopDuration) + syncShift)))
                + 1) / 2) + val2;
    }

    static getSynchronizedTime(loopDuration, syncShift) {
        return (Anime._lastTime / loopDuration) + syncShift;
    }

    static getSynchronizedRotation(loopDuration, syncShift) {
        return (360 * ((Anime._lastTime + syncShift) % loopDuration)) / loopDuration;
    }

    static addAnimation(anime) {
        Anime._animeMap.set(anime.animeId, anime);
        Anime._resumeAnimation();
    }

    static removeAnimation(placeableId) {
        Anime._animeMap.forEach((anime, id) => {
            if (anime.puppet.placeableId === placeableId) {
                Anime._animeMap.delete(id);
            }
        });
        if (Anime._animeMap.size === 0) {
            Anime._suspendAnimation();
        }
    }

    static resetAnimation() {
        Anime._animeMap = new Map();
    }

    static _suspendAnimation() {
        Anime._suspended = true;
        if (Anime._activated) {
            canvas.app.ticker.remove(Anime.tick, this);
        }
        Anime._lastTime = 0;
        Anime._prevTime = 0;
    }

    static _resumeAnimation() {
        Anime._suspended = false;
        if (Anime._activated) {
            canvas.app.ticker.add(Anime.tick, this);
            Anime._lastTime = canvas.app.ticker.lastTime;
            Anime._prevTime = Anime._lastTime;
        }
    }

    static tick() {
        Anime._lastTime = canvas.app.ticker.lastTime;
        Anime._frameTime = Anime._lastTime - Anime._prevTime;

        // Animation
        if (Anime._frameTime >= canvas.app.ticker.deltaMS) {
            // enough time passed : call animate for each animation
            Anime._animeMap.forEach((anime, id) => {
                if (anime.puppet.hasOwnProperty("preComputation")) {
                    anime.puppet.preComputation();
                }
                anime.animate(Anime._frameTime);
            });
            Anime._prevTime = Anime._lastTime;
        }
    }

    static activateAnimation() {
        Anime._activated = true;
        if (!Anime._suspended) {
            canvas.app.ticker.add(Anime.tick, this);
            Anime._lastTime = canvas.app.ticker.lastTime;
            Anime._prevTime = Anime._lastTime;
        }
    }

    static desactivateAnimation() {
        Anime._activated = false;
        if (!Anime._suspended) {
            canvas.app.ticker.remove(Anime.tick, this);
        }
        Anime._lastTime = 0;
        Anime._prevTime = 0;
    }

    static getAnimeMap() {
        return Anime._animeMap;
    }
}

Anime._lastTime = 0;
Anime._prevTime = 0;
Anime._frameTime = 0;
Anime._animeMap = new Map();
Anime._suspended = false;
Anime._activated = false;
Anime.twoPi = Math.PI * 2;