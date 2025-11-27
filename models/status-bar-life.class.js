class StatusBarLife extends DrawableObject {
    IMAGES = [
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png',   // 0%
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png',  // 20%
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png',  // 40%
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png',  // 60%
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png',  // 80%
        'img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png'  // 100%
    ];

    percentage = 100; // Start: voll

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
     * Setzt den Prozentwert (0–100) und wählt das passende Bild.
     */
    setPercentage(percentage) {
        this.percentage = percentage;
        const index = this.resolveImageIndex();
        const path = this.IMAGES[index];
        this.img = this.imageCache[path];
    }

    /**
     * Sorgt dafür, dass JEDE 20er-Stufe genau EIN Bild weiterspringt:
     * 100 → Bild für 100
     * 80  → Bild für 80
     * 60  → Bild für 60
     * 40  → Bild für 40
     * 20  → Bild für 20
     * 0   → Bild für 0
     */
    resolveImageIndex() {
        if (this.percentage >= 100) {
            return 5; // 100
        } else if (this.percentage >= 80) {
            return 4; // 80
        } else if (this.percentage >= 60) {
            return 3; // 60
        } else if (this.percentage >= 40) {
            return 2; // 40
        } else if (this.percentage >= 20) {
            return 1; // 20
        } else {
            return 0; // 0
        }
    }
}
