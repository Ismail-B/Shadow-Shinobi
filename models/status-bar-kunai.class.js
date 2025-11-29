/**
 * Statusleiste für das Kunai-Ammo des Spielers.
 * Zeigt 6 Füllstufen zwischen 0 % und 100 % an.
 * @extends DrawableObject
 */
class StatusBarKunai extends DrawableObject {

    /**
     * Sprite-Pfade der Kunai-Statusbar.
     * @type {string[]}
     */
    IMAGES = [
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/0.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/20.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/40.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/60.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/80.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/100.png'
    ];

    /** @type {number} */
    percentage = 0;

    /**
     * Erstellt die Kunai-Statusbar.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 0;
        this.y = 100;
        this.width = 170;
        this.height = 50;
        this.setPercentage(0);
    }

    /**
     * Setzt den Füllstand der Kunai-Leiste.
     * @param {number} percentage
     */
    setPercentage(percentage) {
        this.percentage = Math.max(0, Math.min(100, percentage));
        const index = this.resolveImageIndex();
        this.img = this.imageCache[this.IMAGES[index]];
    }

    /**
     * Liefert das passende Sprite abhängig vom Prozentwert.
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
