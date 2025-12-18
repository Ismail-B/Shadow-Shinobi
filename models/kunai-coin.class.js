/**
 * Collectible kunai coin within the level.
 * @extends MovableObject
 */
class KunaiCoin extends MovableObject {
  /** @type {number} */
  width = 150;

  /**
   * Collision offset defining the kunai coin hitbox.
   * @type {{x:number, y:number, width:number, height:number}}
   */
  offset = {
    x: 55,
    y: 55,
    width: 110,
    height: 110
  };

  /** @type {number} */
  baseY = 0;

  /** @type {number} */
  bobAmplitude = 4;

  /** @type {number} */
  bobSpeed = 2;

  /** @type {number} */
  bobPhase = Math.random() * Math.PI * 2;

  /**
   * Creates a kunai coin at the given position.
   *
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  constructor(x, y) {
    super();

    this.loadImage('img/8_coin/kunai-coin.png');
    this.x = x;
    this.baseY = y;
    this.y = y;
  }

  /**
   * Updates the vertical bobbing animation.
   *
   * @param {number} timeSeconds - Current time in seconds
   * @returns {void}
   */
  updateBobbing(timeSeconds) {
    const angle = timeSeconds * this.bobSpeed + this.bobPhase;
    this.y = this.baseY + Math.sin(angle) * this.bobAmplitude;
  }
}
