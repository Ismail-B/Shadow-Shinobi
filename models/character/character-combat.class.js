/**
 * Character combat logic and endboss movement blocking.
 * This file patches methods onto Character.prototype and must be loaded after
 * the Character class and its audio helpers.
 *
 * @global
 */
(function () {
  /**
   * Checks whether the character would collide with the endboss at a given X position.
   *
   * @this {Character}
   * @param {number} testX - Candidate X position.
   * @returns {boolean} True if the character would collide with the endboss.
   */
  Character.prototype.collidesWithEndbossAtX = function (testX) {
    if (!this.world?.level?.enemies) return false;

    const enemies = this.world.level.enemies;
    const oldX = this.x;
    this.x = testX;

    const hit = enemies.some(
      (enemy) =>
        enemy &&
        enemy.isEndboss &&
        enemy.collidable &&
        this.isColliding(enemy)
    );

    this.x = oldX;
    return hit;
  };

  /**
   * Moves the character to the right and stops before colliding with the endboss.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.moveRight = function () {
    const oldX = this.x;
    this.x = this.findLastFreeXToRight(oldX);
    this.otherDirection = false;
  };

  /**
   * Finds the last free X position to the right without colliding with the endboss.
   *
   * @this {Character}
   * @param {number} startX - Starting X position.
   * @returns {number} The last reachable X position.
   */
  Character.prototype.findLastFreeXToRight = function (startX) {
    let lastFreeX = startX;

    for (let step = 1; step <= this.speed; step++) {
      const testX = startX + step;
      if (this.collidesWithEndbossAtX(testX)) break;
      lastFreeX = testX;
    }

    return lastFreeX;
  };

  /**
   * Moves the character to the left.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.moveLeft = function () {
    this.otherDirection = true;
    this.x -= this.speed;
  };

  /**
   * Starts a melee attack if allowed.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.tryStartAttack = function () {
    const now = performance.now();
    if (this.isAttackBlocked(now)) return;

    this.isAttacking = true;
    this.attackType = 'melee';
    this.attackFrameIndex = 0;
    this.attackFrameMs = 60;
    this._lastAttackTick = now;
    this.lastAttackAt = now;

    this._hasDealtDamageThisAttack = false;
    this.img = this.imageCache[this.IMAGES_ATTACK[0]];
  };

  /**
   * Returns whether initiating an attack is currently blocked.
   *
   * @this {Character}
   * @param {number} now - Current timestamp in ms.
   * @returns {boolean} True if an attack cannot be started.
   */
  Character.prototype.isAttackBlocked = function (now) {
    if (this.world && (this.world.gameEnded || this.world.bossIntroActive)) return true;
    if (this.isDead() || this.isAttacking) return true;
    return now - this.lastAttackAt < this.attackCooldownMs;
  };

  /**
   * Starts a kunai throw attack animation.
   * Only allowed while facing right and if ammo is available.
   *
   * @this {Character}
   * @returns {boolean} True if the throw was started.
   */
  Character.prototype.tryStartKunaiThrow = function () {
    const now = performance.now();

    if (this.world && (this.world.gameEnded || this.world.bossIntroActive)) return false;
    if (!this.world || this.world.kunaiAmmo <= 0) return false;
    if (this.otherDirection === true) return false;
    if (this.isDead() || this.isAttacking) return false;

    this.isAttacking = true;
    this.attackType = 'kunai';
    this.attackFrameIndex = 0;
    this.attackFrameMs = 60;
    this._lastAttackTick = now;
    this._hasDealtDamageThisAttack = false;

    this.img = this.imageCache[this.IMAGES_ATTACK[0]];
    return true;
  };

  /**
   * Returns whether a kunai throw is currently blocked.
   *
   * @this {Character}
   * @returns {boolean} True if the character cannot start a kunai throw.
   */
  Character.prototype.isKunaiThrowBlocked = function () {
    if (this.world && (this.world.gameEnded || this.world.bossIntroActive)) return true;
    if (!this.world || this.world.kunaiAmmo <= 0) return true;
    return this.isDead() || this.isAttacking;
  };

  /**
   * Advances the active attack animation and triggers frame-based effects.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.updateAttack = function () {
    if (!this.isAttacking) return;

    const now = performance.now();
    if (!this.isNextAttackFrameDue(now)) return;

    this.attackFrameIndex++;

    if (this.isAttackFinished()) {
      this.resetAttackState();
      return;
    }

    this.updateAttackFrameImage();
    this.handleAttackEffects();
  };

  /**
   * Checks whether the next attack frame is due based on attackFrameMs.
   *
   * @this {Character}
   * @param {number} now - Current timestamp in ms.
   * @returns {boolean} True if the next frame should be applied.
   */
  Character.prototype.isNextAttackFrameDue = function (now) {
    if (now - this._lastAttackTick < this.attackFrameMs) return false;
    this._lastAttackTick = now;
    return true;
  };

  /**
   * Returns whether the current attack animation has finished.
   *
   * @this {Character}
   * @returns {boolean} True if the animation has completed.
   */
  Character.prototype.isAttackFinished = function () {
    return this.attackFrameIndex >= this.IMAGES_ATTACK.length;
  };

  /**
   * Resets attack state after the animation ends.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.resetAttackState = function () {
    this.isAttacking = false;
    this.attackType = null;
    this._hitSoundPlayed = false;
    this._hasDealtDamageThisAttack = false;
  };

  /**
   * Updates the current attack frame image.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.updateAttackFrameImage = function () {
    const key = this.IMAGES_ATTACK[this.attackFrameIndex];
    this.img = this.imageCache[key];
  };

  /**
   * Triggers frame-based effects depending on the active attack type.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.handleAttackEffects = function () {
    if (this.attackType === 'melee') this.handleMeleeAttackFrame();
    if (this.attackType === 'kunai') this.handleKunaiAttackFrame();
  };

  /**
   * Handles the melee hit window frames.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.handleMeleeAttackFrame = function () {
    if (this.attackFrameIndex !== 2 && this.attackFrameIndex !== 3) return;

    this.applyMeleeHit();
    this.playMeleeHitSoundOnce();
  };

  /**
   * Plays the melee hit sound exactly once per melee attack.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.playMeleeHitSoundOnce = function () {
    if (this._hitSoundPlayed) return;

    this.playHitSound();
    this._hitSoundPlayed = true;
  };

  /**
   * Handles the kunai release frame.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.handleKunaiAttackFrame = function () {
    if (this.attackFrameIndex !== 3) return;

    if (this.world && typeof this.world.onCharacterKunaiRelease === 'function') {
      this.world.onCharacterKunaiRelease();
    }

    this.playKunaiThrowSound();
  };

  /**
   * Applies melee damage to the first valid enemy hit (orcs and endboss).
   * Only one enemy can be hit per attack animation.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.applyMeleeHit = function () {
    if (!this.world?.level?.enemies) return;
    if (this._hasDealtDamageThisAttack) return;

    const hitbox = this.createMeleeHitbox();
    const enemies = this.world.level.enemies;

    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (this.isInvalidMeleeTarget(enemy, hitbox)) continue;

      this.applyMeleeDamageToEnemy(enemy);
      this._hasDealtDamageThisAttack = true;
      break;
    }
  };

  /**
   * Creates a melee hitbox in front of the character.
   *
   * @this {Character}
   * @returns {{x:number, y:number, w:number, h:number}} Hitbox rectangle.
   */
  Character.prototype.createMeleeHitbox = function () {
    const range = 45;
    const height = this.height * 0.6;
    const y = this.y + this.height * 0.2;
    const facingRight = !this.otherDirection;
    const x = facingRight ? this.x + this.width : this.x - range;

    return { x, y, w: range, h: height };
  };

  /**
   * Returns whether an enemy is not a valid melee target.
   *
   * @this {Character}
   * @param {*} enemy - Enemy candidate.
   * @param {{x:number, y:number, w:number, h:number}} hitbox - Melee hitbox.
   * @returns {boolean} True if the enemy cannot be hit.
   */
  Character.prototype.isInvalidMeleeTarget = function (enemy, hitbox) {
    if (!enemy || !enemy.collidable || enemy.isDying) return true;
    if (typeof enemy.overlapsRect !== 'function') return true;
    return !enemy.overlapsRect(hitbox);
  };

  /**
   * Applies melee damage to a valid enemy target.
   *
   * @this {Character}
   * @param {*} enemy - Hit enemy.
   * @returns {void}
   */
  Character.prototype.applyMeleeDamageToEnemy = function (enemy) {
    if (enemy.isEndboss && typeof enemy.hit === 'function') {
      enemy.hit();
      return;
    }

    if (!enemy.isEndboss && typeof enemy.die === 'function') {
      enemy.die();
    }
  };
})();
