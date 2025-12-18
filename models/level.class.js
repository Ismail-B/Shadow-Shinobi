/**
 * Represents a game level containing enemies, background layers,
 * and collectible objects.
 */
class Level {
  /** @type {MovableObject[]} */
  enemies;

  /** @type {Firefly[]} */
  fireflys;

  /** @type {BackgroundObject[]} */
  backgroundObjects;

  /** @type {Coin[]} */
  coins;

  /** @type {KunaiCoin[]} */
  kunais;

  /** @type {number} */
  level_end_x = 3600;

  /** @type {boolean} */
  endbossLoaded = false;

  /** @type {Endboss|undefined} */
  endboss;

  /**
   * Creates a new level instance.
   *
   * @param {MovableObject[]} enemies - All enemies in the level
   * @param {Firefly[]} fireflys - Background firefly layers
   * @param {BackgroundObject[]} backgroundObjects - Static background layers
   * @param {Coin[]} [coins=[]] - Collectible coins
   * @param {KunaiCoin[]} [kunais=[]] - Collectible kunai coins
   */
  constructor(enemies, fireflys, backgroundObjects, coins, kunais) {
    this.enemies = enemies;
    this.fireflys = fireflys;
    this.backgroundObjects = backgroundObjects;
    this.coins = coins || [];
    this.kunais = kunais || [];
  }
}
