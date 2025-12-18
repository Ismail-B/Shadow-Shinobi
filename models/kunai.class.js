/**
 * Thrown kunai projectile.
 * Created by the World when the character throws a kunai.
 * @extends MovableObject
 */
class Kunai extends MovableObject {
  /** @type {number} */
  width = 150;

  /** @type {World|undefined} */
  world;

  /**
   * Collision offset defining the kunai hitbox.
   * @type {{x:number, y:number, width:number, height:number}}
   */
  offset = {
    x: 55,
    y: 55,
    width: 110,
    height: 110
  };

  /**
   * Creates a kunai projectile at the given position.
   *
   * @param {number} x - Initial X position
   * @param {number} y - Initial Y position
   */
  constructor(x, y) {
    super();

    this.loadImage('img/8_coin/kunai-coin.png');
    this.x = x;
    this.y = y;
  }
}
