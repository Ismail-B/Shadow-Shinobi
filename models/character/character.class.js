/**
 * Playable character (ninja).
 * Handles movement, attacks, damage, and animation state.
 *
 * @extends MovableObject
 */
class Character extends MovableObject {
  /** @type {number} */
  width = 100;

  /** @type {number} */
  speed = 10;

  /** @type {{ x: number, y: number, width: number, height: number }} */
  offset = { x: 10, y: 0, width: 27, height: 0 };

  /**
   * Damage taken per hit.
   *
   * @type {number}
   */
  DAMAGE_PER_HIT = 20;

  /** @type {number} */
  deathIndex = 0;

  /** @type {boolean} */
  deathFrozen = false;

  /** @type {number|null} */
  deathTimer = null;

  /** @type {number} */
  deathFrameDuration = 180;

  /** @type {boolean} */
  isAttacking = false;

  /** @type {number} */
  attackFrameIndex = 0;

  /** @type {number} */
  attackFrameMs = 10;

  /** @type {number} */
  attackCooldownMs = 250;

  /** @type {number} */
  lastAttackAt = 0;

  /** @type {number} */
  _lastAttackTick = 0;

  /** @type {'melee' | 'kunai' | null} */
  attackType = null;

  /** @type {boolean} */
  _hasDealtDamageThisAttack = false;

  /** @type {boolean} */
  _hitSoundPlayed = false;

  /** @type {boolean} */
  _jumpSoundPlayed = false;

  /** @type {boolean} */
  _deathSoundPlayed = false;

  /** @type {World} */
  world;

  /** @type {HTMLAudioElement|null} */
  walking_sound = null;

  /** @type {HTMLAudioElement|null} */
  kunai_throw_sound = null;

  /** @type {HTMLAudioElement|null} */
  hit_sound = null;

  /** @type {HTMLAudioElement|null} */
  jump_sound = null;

  /** @type {HTMLAudioElement|null} */
  hurt_sound = null;

  /** @type {HTMLAudioElement|null} */
  death_sound = null;

  /** @type {string[]} */
  IMAGES_WALKING = [];

  /** @type {string[]} */
  IMAGES_IDLE = [];

  /** @type {string[]} */
  IMAGES_ATTACK = [];

  /** @type {string[]} */
  IMAGES_JUMPING = [];

  /** @type {string[]} */
  IMAGES_DEAD = [];

  /** @type {string[]} */
  IMAGES_HURT = [];

  /**
   * Creates the character instance, loads assets, and starts all runtime loops.
   */
  constructor() {
    super().loadImage(window.CHARACTER_ASSETS?.initial);
    this.initAssets();
    this.initSounds();
    this.applyGravity();
    this.animateCharacter();
  }

  /**
   * Loads and caches all character sprite assets from the global registry.
   *
   * @returns {void}
   */
  initAssets() {
    const assets = window.CHARACTER_ASSETS;
    if (!assets) return;

    this.IMAGES_WALKING = assets.walking;
    this.IMAGES_JUMPING = assets.jumping;
    this.IMAGES_DEAD = assets.dead;
    this.IMAGES_HURT = assets.hurt;
    this.IMAGES_IDLE = assets.idle;
    this.IMAGES_ATTACK = assets.attack;

    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_ATTACK);
  }
}
