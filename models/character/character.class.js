/**
 * Repräsentiert den spielbaren Charakter (Ninja).
 * Steuert Bewegung, Angriffe, Schaden und Animationen.
 * @extends MovableObject
 */
class Character extends MovableObject {
  width = 100;
  speed = 10;

  offset = { x: 10, y: 0, width: 27, height: 0 };

  /**
   * Wieviel Schaden der Charakter pro Treffer erleidet.
   * @type {number}
   */
  DAMAGE_PER_HIT = 20;

  // Death-Anim Steuerung
  deathIndex = 0;
  deathFrozen = false;
  deathTimer = null;
  deathFrameDuration = 180;

  // --- Angriff-Status (Nahkampf + Kunai) ---
  isAttacking = false;
  attackFrameIndex = 0;
  attackFrameMs = 10;
  attackCooldownMs = 250;
  lastAttackAt = 0;
  _lastAttackTick = 0;
  attackType = null; // 'melee' | 'kunai' | null
  _hasDealtDamageThisAttack = false;

  // Sound-Flags
  _hitSoundPlayed = false;
  _jumpSoundPlayed = false;
  _deathSoundPlayed = false;

  world;

  // Sounds (werden in initSounds() gesetzt)
  walking_sound = null;
  kunai_throw_sound = null;
  hit_sound = null;
  jump_sound = null;
  hurt_sound = null;
  death_sound = null;

  // Image arrays (werden in initAssets() gesetzt)
  IMAGES_WALKING = [];
  IMAGES_IDLE = [];
  IMAGES_ATTACK = [];
  IMAGES_JUMPING = [];
  IMAGES_DEAD = [];
  IMAGES_HURT = [];

  /**
   * Erzeugt den Charakter, lädt alle Bilder und startet die Animation.
   * @constructor
   */
  constructor() {
    super().loadImage(window.CHARACTER_ASSETS?.initial);
    this.initAssets();
    this.initSounds();
    this.applyGravity();
    this.animateCharacter();
  }

  /**
   * Lädt und cached alle Character-Assets.
   * @returns {void}
   */
  initAssets() {
    const a = window.CHARACTER_ASSETS;
    if (!a) return;

    this.IMAGES_WALKING = a.walking;
    this.IMAGES_JUMPING = a.jumping;
    this.IMAGES_DEAD = a.dead;
    this.IMAGES_HURT = a.hurt;
    this.IMAGES_IDLE = a.idle;
    this.IMAGES_ATTACK = a.attack;

    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_ATTACK);
  }
}
