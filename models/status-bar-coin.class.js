/**
 * Statusleiste für gesammelte Ninja-Coins.
 * Zeigt den Füllstand in 6 Stufen an.
 * @extends DrawableObject
 */
class StatusBarCoin extends DrawableObject {
    /**
     * Sprites der Statusbar in aufsteigender Reihenfolge.
     * @type {string[]}
     */
    IMAGES = [
        'img/7_statusbars/1_statusbar/1_statusbar_coin/green/0.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/green/20.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/green/40.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/green/60.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/green/80.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/green/100.png'
    ];

    /** @type {number} */
    percentage = 0;

    /**
     * Erstellt die Coin-Statusbar.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 0;
        this.y = 50;
        this.width = 170;
        this.height = 50;
        this.setPercentage(0);
    }

    /**
     * Setzt die Anzeige auf einen Prozentwert zwischen 0 und 100.
     * @param {number} percentage
     */
    setPercentage(percentage) {
        this.percentage = Math.max(0, Math.min(100, percentage));
        const index = this.resolveImageIndex();
        this.img = this.imageCache[this.IMAGES[index]];
    }

    /**
     * Bestimmt das passende Sprite abhängig vom Prozentwert.
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
