class StatusBarEndboss extends DrawableObject {

    IMAGES = [
        'img/7_statusbars/2_statusbar_endboss/orange/orange0.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange20.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange40.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange60.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange80.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange100.png'
    ];

    percentage = 100;

    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 520;
        this.y = 10;
        this.width = 170;
        this.height = 50;
        this.setPercentage(100);
    }

    setPercentage(percentage) {
        this.percentage = percentage; // 0–100
        let path = this.IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    resolveImageIndex() {
        // 100, 80, 60, 40, 20, 0 – jeweils EIN Schritt
        if (this.percentage >= 100) {
            return 5;               // 100 %
        } else if (this.percentage >= 80) {
            return 4;               // 80–99 %
        } else if (this.percentage >= 60) {
            return 3;               // 60–79 %
        } else if (this.percentage >= 40) {
            return 2;               // 40–59 %
        } else if (this.percentage >= 20) {
            return 1;               // 20–39 %
        } else {
            return 0;               // 0–19 %
        }
    }
}
