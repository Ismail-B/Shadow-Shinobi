/**
 * Thrown projectile object (kunai).
 * Moves horizontally and is affected by gravity.
 * @extends MovableObject
 */
class ThrowableObject extends MovableObject {
  /** @type {number} */
  width = 50;

  /** @type {number} */
  height = 15;

  /**
   * Creates a new throwable projectile.
   *
   * @param {number} x - Initial X position
   * @param {number} y - Initial Y position
   */
  constructor(x, y) {
    super();

    this.loadImage('img/6_kunai/kunai.png');
    this.throw(x, y);
  }

  /**
   * Starts the throw movement and enables gravity.
   *
   * @param {number} x - Start X position
   * @param {number} y - Start Y position
   * @returns {void}
   */
  throw(x, y) {
    this.x = x;
    this.y = y;
    this.speedY = 1;

    this.applyGravity();

    setInterval(() => {
      this.x += 10;
    }, 15);
  }
}
