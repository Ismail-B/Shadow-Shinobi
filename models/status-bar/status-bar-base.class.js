/**
 * Basisklasse für alle Statusleisten (HP, Coins, Kunai, Endboss).
 * Kümmert sich um Bildauswahl und Prozentlogik.
 * @extends DrawableObject
 */
class StatusBarBase extends DrawableObject {

    /**
     * Sprite-Pfade in aufsteigender Füllstufe.
     * @type {string[]}
     */
    IMAGES = [];

    /** @type {number} */
    percentage = 0;

    /**
     * Erstellt eine generische Statusleiste.
     * @param {string[]} images - Bildpfade für die Stufen.
     * @param {number} x - X-Position.
     * @param {number} y - Y-Position.
     * @param {number} width - Breite.
     * @param {number} height - Höhe.
     * @param {number} initialPercentage - Startfüllstand (0–100).
     */
    constructor(images, x, y, width, height, initialPercentage) {
        super();
        this.IMAGES = images;
        this.loadImages(this.IMAGES);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.setPercentage(initialPercentage);
    }

    /**
     * Setzt den Füllstand der Leiste (0–100 %) und aktualisiert das Bild.
     * @param {number} percentage
     */
    setPercentage(percentage) {
        this.percentage = Math.max(0, Math.min(100, percentage));
        const index = this.resolveImageIndex();
        this.img = this.imageCache[this.IMAGES[index]];
    }

    /**
     * Ermittelt das passende Sprite zum aktuellen Prozentwert.
     * @returns {number}
     */
    resolveImageIndex() {
        if (this.percentage >= 100) return 5;
        if (this.percentage >= 80)  return 4;
        if (this.percentage >= 60)  return 3;
        if (this.percentage >= 40)  return 2;
        if (this.percentage >= 20)  return 1;
        return 0;
    }
}
