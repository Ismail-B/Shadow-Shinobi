/**
 * Background firefly layer that continuously moves to the left.
 * @extends MovableObject
 */
class Firefly extends MovableObject {
  /** @type {number} */
  y = 0;

  /** @type {number} */
  height = 480;

  /** @type {number} */
  width = 720;

  /**
   * Creates a firefly background layer at the given X position.
   *
   * @param {number} x - Initial X position
   */
  constructor(x) {
    super().loadImage('img/5_background/layers/4_fireflys/fireflys.png');
    this.x = x;
    this.animate();
  }

  /**
   * Starts the continuous leftward movement.
   * @returns {void}
   */
  animate() {
    setInterval(() => {
      this.moveLeft();
    }, 1000 / 60);
  }
}
