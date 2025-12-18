/**
 * Endboss damage handling and player damage window logic.
 * This file patches methods onto Endboss.prototype and must be loaded after
 * the Endboss class and its audio helpers.
 *
 * @global
 */
(function () {
  /**
   * Applies a hit to the boss (melee/kunai).
   * Note: The current implementation uses a fixed damage value internally.
   *
   * @this {Endboss}
   * @param {number} [damage=10] - Currently unused (kept for API compatibility).
   * @returns {void}
   */
  Endboss.prototype.hit = function (damage = 10) {
    if (this.isDeadFlag) return;

    const now = performance.now();
    if (now - this.lastHitAt < this.minHitInterval) return;

    this.lastHitAt = now;
    this.applyBossDamage();
  };

  /**
   * Applies damage to the boss and updates related states.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.applyBossDamage = function () {
    this.energy -= 20;
    if (this.energy < 0) this.energy = 0;

    this.updateBossLifebar();
    this.setHurtState();
    this.playHurtSound();

    if (this.energy === 0) {
      this.handleBossDeath();
    }
  };

  /**
   * Updates the boss life bar UI.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.updateBossLifebar = function () {
    if (!this.world || !this.world.statusBarEndboss) return;
    this.world.statusBarEndboss.setPercentage(this.energy);
  };

  /**
   * Enters the hurt state and resets hurt animation playback.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.setHurtState = function () {
    this.isMoving = false;
    this.hurtPlaying = true;
    this.hurtFrameIndex = 0;
    this.img = this.imageCache[this.IMAGES_HURT[0]];
  };

  /**
   * Transitions the boss into the death state.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.handleBossDeath = function () {
    this.isDeadFlag = true;
    this.collidable = false;
    this.isDying = true;
    this.deathPlaying = true;
    this.deathFrameIndex = 0;
    this.attacking = false;
    this.isMoving = false;

    this.y = this.baseY + this.deadYOffset;
    this.img = this.imageCache[this.IMAGES_DEAD[0]];
    this.playDeathSound();
  };

  /**
   * Returns whether the boss is dead.
   *
   * @this {Endboss}
   * @returns {boolean}
   */
  Endboss.prototype.isDead = function () {
    return this.isDeadFlag;
  };

  /**
   * Returns whether the boss can deal damage to the player right now.
   * This includes a general damage interval gate.
   *
   * @this {Endboss}
   * @returns {boolean}
   */
  Endboss.prototype.canDamagePlayer = function () {
    if (this.isDamageBlocked()) return false;

    const now = performance.now();
    if (now - this.lastDamageDealtAt < this.damageInterval) return false;

    this.lastDamageDealtAt = now;
    return true;
  };

  /**
   * Returns whether boss-to-player damage is blocked by state or frame window.
   *
   * @this {Endboss}
   * @returns {boolean}
   */
  Endboss.prototype.isDamageBlocked = function () {
    if (!this.attacking || this.isDeadFlag) return true;
    if (this.hurtPlaying || this.deathPlaying) return true;

    const frame = this.currentAttackFrame;
    return frame !== 4 && frame !== 5;
  };
})();
