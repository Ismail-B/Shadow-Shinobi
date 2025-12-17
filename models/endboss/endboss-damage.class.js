/**
 * Damage + attack window logic for Endboss.
 * Requires Endboss class + audio methods.
 */
(function () {
  /**
   * Boss bekommt Schaden vom Spieler (Nahkampf/Kunai).
   * @param {number} [damage=10] - ungenutzt, Logik zieht feste 20 ab.
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
   * Wendet Schaden auf den Boss an und setzt States.
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
   * Aktualisiert die Lebensleiste des Bosses.
   * @returns {void}
   */
  Endboss.prototype.updateBossLifebar = function () {
    if (!this.world || !this.world.statusBarEndboss) return;
    this.world.statusBarEndboss.setPercentage(this.energy);
  };

  /**
   * Versetzt den Boss in den Hurt-State.
   * @returns {void}
   */
  Endboss.prototype.setHurtState = function () {
    this.isMoving = false;
    this.hurtPlaying = true;
    this.hurtFrameIndex = 0;
    this.img = this.imageCache[this.IMAGES_HURT[0]];
  };

  /**
   * Behandelt den Übergang in den Death-State.
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
   * Prüft, ob der Boss tot ist.
   * @returns {boolean}
   */
  Endboss.prototype.isDead = function () {
    return this.isDeadFlag;
  };

  /**
   * Prüft, ob der Boss den Spieler aktuell schädigen darf.
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
   * Prüft Blocker für Boss → Player-Schaden.
   * @returns {boolean}
   */
  Endboss.prototype.isDamageBlocked = function () {
    if (!this.attacking || this.isDeadFlag) return true;
    if (this.hurtPlaying || this.deathPlaying) return true;

    const frame = this.currentAttackFrame;
    return frame !== 4 && frame !== 5;
  };
})();
