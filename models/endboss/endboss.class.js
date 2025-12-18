/**
 * Level endboss.
 * Manages health, animations, attacks, and basic AI state.
 *
 * @extends MovableObject
 */
class Endboss extends MovableObject {
  /** @type {number} */
  width = 380;

  /** @type {number} */
  height = 280;

  /** @type {number} */
  x = 3850;

  /** @type {number} */
  y = 110;

  /** @type {number} */
  speed = 2;

  /** @type {{ x: number, y: number, width: number, height: number }} */
  offset = { x: 0, y: 0, width: 0, height: 0 };

  /** @type {{ x: number, y: number, width: number, height: number }} */
  attackHitbox = { x: 0, y: 0, width: 380, height: 180 };

  /** @type {number} */
  scaleIdle = 1.0;

  /** @type {number} */
  scaleHurt = 1.15;

  /** @type {number} */
  scaleDead = 1.15;

  /** @type {number} */
  scaleAttack = 1.5;

  /** @type {number} */
  hurtYOffset = -10;

  /** @type {number} */
  deadYOffset = 60;

  /** @type {boolean} */
  collidable = true;

  /** @type {boolean} */
  isDying = false;

  /** @type {number} */
  energy = 100;

  /** @type {boolean} */
  isDeadFlag = false;

  /** @type {boolean} */
  hurtPlaying = false;

  /** @type {number} */
  hurtFrameIndex = 0;

  /** @type {boolean} */
  deathPlaying = false;

  /** @type {number} */
  deathFrameIndex = 0;

  /** @type {number} */
  minHitInterval = 350;

  /** @type {number} */
  lastHitAt = 0;

  /** @type {boolean} */
  attacking = false;

  /** @type {number} */
  attackFrameIndex = 0;

  /** @type {number} */
  currentAttackFrame = 0;

  /** @type {boolean} */
  isMoving = false;

  /** @type {number} */
  damageInterval = 600;

  /** @type {number} */
  lastDamageDealtAt = 0;

  /** @type {number} */
  attackCooldown = 900;

  /** @type {number} */
  lastAttackStartedAt = 0;

  /** @type {boolean} */
  activated = false;

  /** @type {number} */
  activationTime = 0;

  /** @type {number} */
  viewDistance = 720;

  /** @type {HTMLAudioElement|null} */
  attack_sound = null;

  /** @type {HTMLAudioElement|null} */
  dying_sound = null;

  /** @type {HTMLAudioElement[]} */
  hurt_sounds = [];

  /** @type {number} */
  nextHurtIndex = 0;

  /** @type {boolean} */
  _deathSoundPlayed = false;

  /** @type {string[]} */
  IMAGES_WALKING = [];

  /** @type {string[]} */
  IMAGES_ALERT = [];

  /** @type {string[]} */
  IMAGES_DEAD = [];

  /** @type {string[]} */
  IMAGES_HURT = [];

  /** @type {string[]} */
  IMAGES_ATTACK = [];

  /**
   * Creates the endboss, loads assets, and starts animation/AI loops.
   */
  constructor() {
    super().loadImage(window.ENDBOSS_ASSETS?.initial);

    /** @type {number} */
    this.baseY = this.y;

    /** @type {boolean} */
    this.isEndboss = true;

    this.initAssets();
    this.initSounds();
    this.initSoundVolumes();

    this.otherDirection = true;
    this.animate();
  }

  /**
   * Loads and caches all endboss sprite assets from the global registry.
   *
   * @returns {void}
   */
  initAssets() {
    const assets = window.ENDBOSS_ASSETS;
    if (!assets) return;

    this.IMAGES_WALKING = assets.walking;
    this.IMAGES_ALERT = assets.alert;
    this.IMAGES_HURT = assets.hurt;
    this.IMAGES_DEAD = assets.dead;
    this.IMAGES_ATTACK = assets.attack;

    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_ALERT);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_ATTACK);
  }
}
