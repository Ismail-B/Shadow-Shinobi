/**
 * Statusleiste für gesammelte Ninja-Coins.
 * @extends StatusBarBase
 */
class StatusBarCoin extends StatusBarBase {

    /**
     * Erstellt die Coin-Statusbar.
     */
    constructor() {
        const images = [
            'img/7_statusbars/1_statusbar/1_statusbar_coin/green/0.png',
            'img/7_statusbars/1_statusbar/1_statusbar_coin/green/20.png',
            'img/7_statusbars/1_statusbar/1_statusbar_coin/green/40.png',
            'img/7_statusbars/1_statusbar/1_statusbar_coin/green/60.png',
            'img/7_statusbars/1_statusbar/1_statusbar_coin/green/80.png',
            'img/7_statusbars/1_statusbar/1_statusbar_coin/green/100.png'
        ];

        super(images, 0, 50, 170, 50, 0);
    }
}
