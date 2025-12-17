/**
 * Repräsentiert den Endboss des Levels.
 * Steuert Leben, Animationen, Angriffe und einfache AI.
 * @extends MovableObject
 */
class Endboss extends MovableObject {
  width = 380;
  height = 280;
  x = 3850;
  y = 110;
  speed = 2;

  offset = { x: 0, y: 0, width: 0, height: 0 };

  attackHitbox = { x: 0, y: 0, width: 380, height: 180 };

  // Skalierung
  scaleIdle = 1.0;
  scaleHurt = 1.15;
  scaleDead = 1.15;
  scaleAttack = 1.5;

  // Y-Offsets
  hurtYOffset = -10;
  deadYOffset = 60;

  // Kollisionslogik
  collidable = true;
  isDying = false;

  // Leben
  energy = 100;
  isDeadFlag = false;

  // Hurt / Death
  hurtPlaying = false;
  hurtFrameIndex = 0;
  deathPlaying = false;
  deathFrameIndex = 0;

  // Treffer-Cooldown von Spieler → Boss
  minHitInterval = 350;
  lastHitAt = 0;

  // Attack / Hitbox
  attacking = false;
  attackFrameIndex = 0;
  currentAttackFrame = 0;
  isMoving = false;

  // Boss → Character Schaden-Cooldown
  damageInterval = 600;
  lastDamageDealtAt = 0;

  // Cooldown zwischen zwei Attack-Starts
  attackCooldown = 900;
  lastAttackStartedAt = 0;

  // Spawn / Aktivierung
  activated = false;
  activationTime = 0;
  viewDistance = 720;

  // --- Audio (wird in initSounds() gesetzt) ---
  attack_sound = null;
  dying_sound = null;
  hurt_sounds = [];
  nextHurtIndex = 0;
  _deathSoundPlayed = false;

  // Animationen (werden in initAssets() gesetzt)
  IMAGES_WALKING = [];
  IMAGES_ALERT = [];
  IMAGES_DEAD = [];
  IMAGES_HURT = [];
  IMAGES_ATTACK = [];

  /**
   * Erzeugt den Endboss, lädt alle Animationen
   * und startet die Animations-/AI-Loops.
   */
  constructor() {
    super().loadImage(window.ENDBOSS_ASSETS?.initial);

    this.baseY = this.y;
    this.isEndboss = true;

    this.initAssets();
    this.initSounds();
    this.initSoundVolumes();

    this.otherDirection = true;
    this.animate();
  }

  /**
   * Lädt und cached alle Endboss-Assets.
   * @returns {void}
   */
  initAssets() {
    const a = window.ENDBOSS_ASSETS;
    if (!a) return;

    this.IMAGES_WALKING = a.walking;
    this.IMAGES_ALERT = a.alert;
    this.IMAGES_HURT = a.hurt;
    this.IMAGES_DEAD = a.dead;
    this.IMAGES_ATTACK = a.attack;

    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_ALERT);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_ATTACK);
  }
}
