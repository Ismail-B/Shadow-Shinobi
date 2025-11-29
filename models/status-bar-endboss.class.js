/**
 * Statusleiste für die Lebenspunkte des Endbosses.
 * @extends StatusBarBase
 */
class StatusBarEndboss extends StatusBarBase {

    /**
     * Erstellt die Endboss-Statusbar.
     */
    constructor() {
        const images = [
            'img/7_statusbars/2_statusbar_endboss/orange/orange0.png',
            'img/7_statusbars/2_statusbar_endboss/orange/orange20.png',
            'img/7_statusbars/2_statusbar_endboss/orange/orange40.png',
            'img/7_statusbars/2_statusbar_endboss/orange/orange60.png',
            'img/7_statusbars/2_statusbar_endboss/orange/orange80.png',
            'img/7_statusbars/2_statusbar_endboss/orange/orange100.png'
        ];

        super(images, 520, 10, 170, 50, 100);
    }
}
