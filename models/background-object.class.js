/**
 * Static background object that scrolls with the camera.
 * @extends MovableObject
 */
class BackgroundObject extends MovableObject {
  /** @type {number} */
  width = 720;

  /** @type {number} */
  height = 480;

  /**
   * Creates a background object positioned at the bottom of the level.
   *
   * @param {string} imagePath - Background image path
   * @param {number} x - X position in the level
   */
  constructor(imagePath, x) {
    super().loadImage(imagePath);

    this.x = x;
    this.y = 480 - this.height;
  }
}
