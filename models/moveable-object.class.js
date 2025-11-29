/**
 * Basisklasse für bewegliche Objekte im Spiel.
 * Kümmert sich um Bewegung, Kollision, Gravitation und Schaden.
 * @extends DrawableObject
 */
class MovableObject extends DrawableObject {

    /** @type {number} */
    speed = 0.15;

    /** Blickrichtung: false = rechts, true = links */
    otherDirection = false;

    /** Vertikale Geschwindigkeit */
    speedY = 0;

    /** Schwerkraft-Beschleunigung */
    acceleration = 1;

    /** Lebenspunkte des Objekts */
    energy = 100;

    /** Zeitstempel des letzten Treffers (ms) */
    lastHit = 0;

    /** X-Position im letzten Frame (für Bewegungscheck) */
    lastX = 0;

    /**
     * Kollisionsoffset für Hitbox-Berechnung.
     * @type {{x:number, y:number, width:number, height:number}}
     */
    offset = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };

    /** Optionaler Lauf-Sound */
    walkingSound;

    /** Ob das Objekt bei Kollisionen berücksichtigt wird */
    collidable = true;

    /**
     * Berechnet die Hitbox unter Berücksichtigung des Offsets.
     * Diese Hitbox wird für Kollisionen verwendet.
     * @returns {{left:number, top:number, right:number, bottom:number, width:number, height:number}}
     */
    getHitbox() {
        const left   = this.x + this.offset.x;
        const top    = this.y + this.offset.y;
        const right  = this.x + this.width  - this.offset.width;
        const bottom = this.y + this.height - this.offset.height;

        return {
            left,
            top,
            right,
            bottom,
            width: right - left,
            height: bottom - top
        };
    }

    /**
     * Liefert die Bounding-Box ohne Offset.
     * @returns {{x:number, y:number, w:number, h:number}}
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            w: this.width,
            h: this.height
        };
    }

    /**
     * Prüft, ob die Bounding-Box dieses Objekts
     * mit einem gegebenen Rechteck überlappt.
     * @param {{x:number,y:number,w:number,h:number}} rect
     * @returns {boolean}
     */
    overlapsRect(rect) {
        const a = this.getBounds();

        return (
            a.x < rect.x + rect.w &&
            a.x + a.w > rect.x &&
            a.y < rect.y + rect.h &&
            a.y + a.h > rect.y
        );
    }

    /**
     * Bewegt das Objekt nach rechts.
     * @returns {void}
     */
    moveRight() {
        this.x += this.speed;
        this.otherDirection = false;
    }

    /**
     * Bewegt das Objekt nach links.
     * @returns {void}
     */
    moveLeft() {
        this.x -= this.speed;
        this.otherDirection = true;
    }

    /**
     * Spielt eine Bild-Animation über ein Array von Sprites ab.
     * @param {string[]} images - Pfade zu den Animationsbildern.
     * @returns {void}
     */
    playAnimation(images) {
        const i = this.currentImage % images.length;
        const path = images[i];

        this.img = this.imageCache[path];
        this.currentImage++;
    }

    /**
     * Wendet eine einfache Gravitation an.
     * @returns {void}
     */
    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 1000 / 70);
    }

    /**
     * Prüft, ob sich das Objekt über der Bodenlinie befindet.
     * @returns {boolean}
     */
    isAboveGround() {
        return this.y < 200;
    }

    /**
     * Prüft, ob das Objekt seine X-Position geändert hat.
     * @returns {boolean} true, wenn Objekt steht.
     */
    isNotMoving() {
        const isStationary = this.x === this.lastX;
        this.lastX = this.x;

        return isStationary;
    }

    /**
     * Startet einen Sprung nach oben.
     * @returns {void}
     */
    jump() {
        this.speedY = 20;
    }

    /**
     * Prüft, ob dieses Objekt mit einem anderen kollidiert.
     * @param {MovableObject} mo - anderes Objekt.
     * @returns {boolean}
     */
    isColliding(mo) {
        return (
            this.x + this.offset.x + this.width - this.offset.width >
                mo.x + mo.offset.x &&
            this.y + this.offset.y + this.height - this.offset.height >
                mo.y + mo.offset.y &&
            this.x + this.offset.x <
                mo.x + mo.offset.x + mo.width - mo.offset.width &&
            this.y + this.offset.y <
                mo.y + mo.offset.y + mo.height - mo.offset.height
        );
    }

    /**
     * Wendet Schaden auf dieses Objekt an.
     * @returns {void}
     */
    hit() {
        if (this.isDead()) return;
        if (this.isHurt()) return;

        this.energy -= 10;
        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    /**
     * Prüft, ob das Objekt als „tot“ gilt.
     * @returns {boolean}
     */
    isDead() {
        return this.energy <= 20;
    }

    /**
     * Prüft, ob das Objekt vor Kurzem Schaden erhalten hat.
     * @returns {boolean}
     */
    isHurt() {
        let timePassed = new Date().getTime() - this.lastHit;
        timePassed = timePassed / 1000;

        return timePassed < 0.5;
    }
}
