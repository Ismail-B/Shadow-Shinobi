/**
 * Base class for all orc enemies.
 * Provides shared properties and initializes shared subsystems.
 * @extends MovableObject
 */
class Orc extends MovableObject {
  /** @type {number} */
  height = 100;

  /** @type {number} */
  width = 70;

  /** @type {number} */
  y = 265;

  /** @type {string[]} */
  IMAGES_WALKING = [];

  /** @type {string[]} */
  DEAD_IMAGES = [];

  /** @type {boolean} */
  isDying = false;

  /** @type {boolean} */
  collidable = true;

  /** @type {HTMLAudioElement} */
  walking_sound = new Audio('audio/running.mp3');

  /** @type {HTMLAudioElement[]} */
  static voiceClips = [
    new Audio('audio/orc.mp3'),
    new Audio('audio/orc1.mp3'),
    new Audio('audio/orc2.mp3')
  ];

  /** @type {Orc[]} */
  static instances = [];

  /** @type {number} */
  static lastVoiceTime = 0;

  /** @type {number} */
  static lastVoiceIndex = -1;

  /** @type {number|null} */
  static voiceLoopId = null;

  /** @type {number} */
  static MIN_SPAWN_X = 2000;

  /** @type {number} */
  static MAX_SPAWN_X = 7000;

  /** @type {number} */
  static MIN_SPAWN_DISTANCE = 220;

  /** @type {number|null} */
  moveLeftInterval = null;

  /** @type {number|null} */
  playAnimationInterval = null;

  /** @type {number} */
  _deadIndex = 0;

  /** @type {number|null} */
  _deadTimer = null;

  /** @type {number} */
  _deadFrameMs = 90;

  /**
   * Creates an orc instance, assigns a spawn position and starts movement/animation loops.
   */
  constructor() {
    super().loadImage('img/3_enemies_orcs/orc_green/1_walk/Walk_1.png');

    this.loadImages(this.IMAGES_WALKING);
    if (this.DEAD_IMAGES.length) this.loadImages(this.DEAD_IMAGES);

    this.x = this.getSpawnXWithMinDistance();
    this.speed = 0.15 + Math.random() * 3.5;

    Orc.instances.push(this);
    Orc.startVoiceLoop();

    this.startMoveLoop();
    this.startAnimationLoop();
  }
}
