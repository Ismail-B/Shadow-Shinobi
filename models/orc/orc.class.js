/**
 * Base class for all Orc enemies.
 * Responsible for shared state and bootstrapping of sub-systems.
 * @extends MovableObject
 */
class Orc extends MovableObject {
  height = 100;
  width = 70;
  y = 265;

  /** @type {string[]} */
  IMAGES_WALKING = [];

  /** @type {string[]} */
  DEAD_IMAGES = [];

  isDying = false;
  collidable = true;

  walking_sound = new Audio('audio/running.mp3');

  // Global orc voice system state
  static voiceClips = [
    new Audio('audio/orc.mp3'),
    new Audio('audio/orc1.mp3'),
    new Audio('audio/orc2.mp3')
  ];

  static instances = [];
  static lastVoiceTime = 0;
  static lastVoiceIndex = -1;
  static voiceLoopId = null;

  // Spawn parameters
  static MIN_SPAWN_X = 2000;
  static MAX_SPAWN_X = 7000;
  static MIN_SPAWN_DISTANCE = 220;

  moveLeftInterval = null;
  playAnimationInterval = null;

  _deadIndex = 0;
  _deadTimer = null;
  _deadFrameMs = 90;

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
