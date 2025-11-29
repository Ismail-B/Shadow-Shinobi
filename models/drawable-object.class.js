/**
 * Basisklasse für alle renderbaren Objekte im Spiel.
 * Stellt Laden und Zeichnen von Bildern bereit.
 */
class DrawableObject {
    /** @type {HTMLImageElement} */
    img;

    /** Cache für vorgeladene Bilder */
    imageCache = {};

    /** Index des aktuell angezeigten Sprites */
    currentImage = 0;

    /** Position und Größe */
    x = 10;
    y = 0;
    height = 150;
    width = 100;

    /**
     * Lädt ein einzelnes Bild in das Objekt.
     * @param {string} path - Pfad zur Bilddatei.
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Zeichnet das Objekt in das Canvas-Kontext.
     * @param {CanvasRenderingContext2D} ctx - Canvas-Kontext.
     */
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    /**
     * Zeichnet die sichtbare Hitbox (Debug).
     * @param {CanvasRenderingContext2D} ctx - Canvas-Kontext.
     */
    drawFrame(ctx) {
        if (!this.shouldDrawFrame()) return;

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "red";
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
    }

    /**
     * Zeichnet die Offset-Hitbox (Debug).
     * @param {CanvasRenderingContext2D} ctx - Canvas-Kontext.
     */
    drawOffsetFrame(ctx) {
        if (!this.shouldDrawOffsetFrame()) return;

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "transparent"; // debug hitbox visibility
        ctx.rect(
            this.x + this.offset.x,
            this.y + this.offset.y,
            this.width - this.offset.width,
            this.height - this.offset.height
        );
        ctx.stroke();
    }

    /**
     * Lädt mehrere Bilder und speichert sie im ImageCache.
     * @param {string[]} arr - Pfade der Bilder.
     */
    loadImages(arr) {
        arr.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    /**
     * Prüft, ob die „rote Hitbox“ für Debug gezeichnet werden soll.
     * @returns {boolean}
     */
    shouldDrawFrame() {
        return (
            this instanceof Character ||
            this instanceof Orc ||
            this instanceof Endboss ||
            this instanceof Coin
        );
    }

    /**
     * Prüft, ob die Offset-Hitbox (transparent) gezeichnet werden soll.
     * @returns {boolean}
     */
    shouldDrawOffsetFrame() {
        return (
            this instanceof Character ||
            this instanceof Orc ||
            this instanceof Endboss ||
            this instanceof Coin ||
            this instanceof Kunai
        );
    }
}
