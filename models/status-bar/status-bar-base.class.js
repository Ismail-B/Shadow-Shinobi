/**
 * Base class for all status bars (HP, coins, kunai, end boss).
 * Handles sprite selection and percentage-based display logic.
 * @extends DrawableObject
 */
class StatusBarBase extends DrawableObject {
  /**
   * Sprite paths ordered by increasing fill level.
   * @type {string[]}
   */
  IMAGES = [];

  /**
   * Current fill percentage (0–100).
   * @type {number}
   */
  percentage = 0;

  /**
   * Creates a generic status bar.
   *
   * @param {string[]} images - Sprite paths for the different fill levels
   * @param {number} x - X position on the canvas
   * @param {number} y - Y position on the canvas
   * @param {number} width - Width of the status bar
   * @param {number} height - Height of the status bar
   * @param {number} initialPercentage - Initial fill percentage (0–100)
   */
  constructor(images, x, y, width, height, initialPercentage) {
    super();

    this.IMAGES = images;
    this.loadImages(this.IMAGES);

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.setPercentage(initialPercentage);
  }

  /**
   * Updates the fill percentage and refreshes the displayed sprite.
   *
   * @param {number} percentage - New fill percentage (0–100)
   * @returns {void}
   */
  setPercentage(percentage) {
    this.percentage = Math.max(0, Math.min(100, percentage));
    const index = this.resolveImageIndex();
    this.img = this.imageCache[this.IMAGES[index]];
  }

  /**
   * Resolves the sprite index for the current percentage value.
   *
   * @returns {number} Sprite index
   */
  resolveImageIndex() {
    if (this.percentage >= 100) return 5;
    if (this.percentage >= 80) return 4;
    if (this.percentage >= 60) return 3;
    if (this.percentage >= 40) return 2;
    if (this.percentage >= 20) return 1;
    return 0;
  }
}
