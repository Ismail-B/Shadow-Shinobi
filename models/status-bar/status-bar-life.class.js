/**
 * Status bar displaying the character's health.
 * @extends StatusBarBase
 */
class StatusBarLife extends StatusBarBase {
  /**
   * Creates the life (health) status bar.
   */
  constructor() {
    const images = [
      'img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png',
      'img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png',
      'img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png',
      'img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png',
      'img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png',
      'img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png'
    ];

    super(images, 0, 0, 170, 50, 100);
  }
}
