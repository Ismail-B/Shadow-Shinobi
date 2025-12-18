/**
 * Character damage, hurt state, and death animation handling.
 * This file patches methods onto Character.prototype and must be loaded after
 * the Character class and its audio helpers.
 *
 * @global
 */
(function () {
  /**
   * Applies damage to the character.
   *
   * @this {Character}
   * @param {number} [dmg=this.DAMAGE_PER_HIT] - Damage per hit.
   * @returns {void}
   */
  Character.prototype.hit = function (dmg = this.DAMAGE_PER_HIT) {
    if (this.isDead()) return;

    const oldEnergy = this.energy;

    this.energy -= dmg;
    if (this.energy < 0) this.energy = 0;

    this.updateLastHitTime(oldEnergy);
    this.handleHitSounds(oldEnergy);
  };

  /**
   * Updates the last hit timestamp if damage was taken and the character survived.
   *
   * @this {Character}
   * @param {number} oldEnergy - Energy before the hit.
   * @returns {void}
   */
  Character.prototype.updateLastHitTime = function (oldEnergy) {
    if (this.energy < oldEnergy && this.energy > 0) {
      this.lastHit = Date.now();
    }
  };

  /**
   * Plays hurt or death sounds depending on the new energy value.
   *
   * @this {Character}
   * @param {number} oldEnergy - Energy before the hit.
   * @returns {void}
   */
  Character.prototype.handleHitSounds = function (oldEnergy) {
    const deadNow = this.isDead();

    if (deadNow) {
      this.playDeathSound();
      return;
    }

    if (this.energy < oldEnergy) {
      this.playHurtSound();
    }
  };

  /**
   * Returns whether the character is dead.
   *
   * @this {Character}
   * @returns {boolean} True if energy is 0 or below.
   */
  Character.prototype.isDead = function () {
    return this.energy <= 0;
  };

  /**
   * Returns whether the character was hit recently (hurt window).
   *
   * @this {Character}
   * @returns {boolean} True if hit within the last second and still alive.
   */
  Character.prototype.isHurt = function () {
    const secondsSinceHit = (Date.now() - this.lastHit) / 1000;
    return this.energy > 0 && secondsSinceHit < 1;
  };

  /**
   * Starts the death animation once and freezes on the last frame.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.playDeathOnce = function () {
    if (this.deathFrozen || this.deathTimer) return;

    const seq = this.IMAGES_DEAD;
    this.img = this.imageCache[seq[this.deathIndex]];
    this.startDeathInterval(seq);
  };

  /**
   * Starts the interval that advances the death animation frames.
   *
   * @this {Character}
   * @param {string[]} seq - Death animation frame keys.
   * @returns {void}
   */
  Character.prototype.startDeathInterval = function (seq) {
    this.deathTimer = setInterval(() => {
      this.advanceDeathFrame(seq);
    }, this.deathFrameDuration);
  };

  /**
   * Advances the death animation by one frame and freezes on the last frame.
   *
   * @this {Character}
   * @param {string[]} seq - Death animation frame keys.
   * @returns {void}
   */
  Character.prototype.advanceDeathFrame = function (seq) {
    this.deathIndex = Math.min(this.deathIndex + 1, seq.length - 1);
    this.img = this.imageCache[seq[this.deathIndex]];

    if (this.deathIndex >= seq.length - 1) {
      clearInterval(this.deathTimer);
      this.deathTimer = null;
      this.deathFrozen = true;
    }
  };

  /**
   * Resets death animation state (e.g., on game restart).
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.resetDeathAnim = function () {
    this.deathIndex = 0;
    this.deathFrozen = false;

    if (this.deathTimer) {
      clearInterval(this.deathTimer);
      this.deathTimer = null;
    }

    this._deathSoundPlayed = false;
    this.loadImage(window.CHARACTER_ASSETS?.initial);
  };
})();
