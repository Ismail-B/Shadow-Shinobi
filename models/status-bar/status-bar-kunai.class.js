/**
 * Status bar displaying available kunai ammunition.
 * @extends StatusBarBase
 */
class StatusBarKunai extends StatusBarBase {
  /**
   * Creates the kunai status bar.
   */
  constructor() {
    const images = [
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/0.png',
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/20.png',
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/40.png',
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/60.png',
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/80.png',
      'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/100.png'
    ];

    super(images, 0, 100, 170, 50, 0);
  }
}
