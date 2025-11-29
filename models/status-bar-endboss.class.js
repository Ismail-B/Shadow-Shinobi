/**
 * Statusleiste für die Lebenspunkte des Endbosses.
 * Zeigt 6 Stufen zwischen 0 % und 100 % an.
 * @extends DrawableObject
 */
class StatusBarEndboss extends DrawableObject {
    /**
     * Sprite-Pfade der Endboss-Lebensanzeige.
     * @type {string[]}
     */
    IMAGES = [
        'img/7_statusbars/2_statusbar_endboss/orange/orange0.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange20.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange40.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange60.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange80.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange100.png'
    ];

    /** @type {number} */
    percentage = 100;

    /**
     * Erstellt die Endboss-Statusleiste.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 520;
        this.y = 10;
        this.width = 170;
        this.height = 50;
        this.setPercentage(100);
    }

    /**
     * Setzt den Prozentwert der Lebensanzeige.
     * @param {number} percentage
     */
    setPercentage(percentage) {
        this.percentage = Math.max(0, Math.min(100, percentage));
        const index = this.resolveImageIndex();
        this.img = this.imageCache[this.IMAGES[index]];
    }

    /**
     * Liefert den Bildindex basierend auf dem prozentualen Wert.
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
