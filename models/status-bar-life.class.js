/**
 * Statusleiste für die Lebenspunkte des Charakters.
 * Zeigt 6 Füllstufen zwischen 0 % und 100 % an.
 * @extends DrawableObject
 */
class StatusBarLife extends DrawableObject {

    /**
     * Sprite-Pfade der Lebensanzeige.
     * @type {string[]}
     */
    IMAGES = [
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png',
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png'
    ];

    /** @type {number} */
    percentage = 100;

    /**
     * Erstellt die Lebens-Statusbar.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 10;
        this.y = 0;
        this.width = 180;
        this.height = 50;
        this.setPercentage(100);
    }

    /**
     * Setzt den Gesundheitswert (0–100 %) und aktualisiert das Bild.
     * @param {number} percentage
     */
    setPercentage(percentage) {
        this.percentage = Math.max(0, Math.min(100, percentage));
        const index = this.resolveImageIndex();
        this.img = this.imageCache[this.IMAGES[index]];
    }

    /**
     * Ermittelt das passende Bild zur aktuellen Prozentstufe.
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
