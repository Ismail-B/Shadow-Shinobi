/**
 * Red orc enemy variant (larger than the green orc).
 * @extends Orc
 */
class OrcRed extends Orc {
  /**
   * Base Y position of the orc.
   * @type {number}
   */
  y = 240;

  /**
   * Creates a red orc and preloads its animations.
   */
  constructor() {
    super();

    this.height = 120;
    this.width = 80;

    /** @type {string[]} */
    this.IMAGES_WALKING = [
      'img/3_enemies_orcs/orc_red/1_walk/Walk_1.png',
      'img/3_enemies_orcs/orc_red/1_walk/Walk_2.png',
      'img/3_enemies_orcs/orc_red/1_walk/Walk_3.png',
      'img/3_enemies_orcs/orc_red/1_walk/Walk_4.png',
      'img/3_enemies_orcs/orc_red/1_walk/Walk_5.png',
      'img/3_enemies_orcs/orc_red/1_walk/Walk_6.png',
      'img/3_enemies_orcs/orc_red/1_walk/Walk_7.png'
    ];

    /** @type {string[]} */
    this.DEAD_IMAGES = [
      'img/3_enemies_orcs/orc_red/2_dead/Dead_1.png',
      'img/3_enemies_orcs/orc_red/2_dead/Dead_2.png',
      'img/3_enemies_orcs/orc_red/2_dead/Dead_3.png',
      'img/3_enemies_orcs/orc_red/2_dead/Dead_4.png'
    ];

    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.DEAD_IMAGES);
  }
}
