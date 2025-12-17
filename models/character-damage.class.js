/**
 * Damage / death handling for Character.
 * Requires Character + audio methods to be loaded.
 */
(function () {
  /**
   * Verarbeitet Schaden am Charakter.
   * @param {number} [dmg=this.DAMAGE_PER_HIT] - Schaden je Treffer.
   * @returns {void}
   */
  Character.prototype.hit = function (dmg = this.DAMAGE_PER_HIT) {
    if (this.isDead()) return;

    const wasDeadBefore = this.isDead();
    const oldEnergy = this.energy;

    this.energy -= dmg;
    if (this.energy < 0) this.energy = 0;

    this.updateLastHitTime(oldEnergy);
    this.handleHitSounds(wasDeadBefore, oldEnergy);
  };

  /**
   * Aktualisiert den Zeitpunkt des letzten Treffers.
   * @param {number} oldEnergy - Energie vor dem Treffer.
   * @returns {void}
   */
  Character.prototype.updateLastHitTime = function (oldEnergy) {
    if (this.energy < oldEnergy && this.energy > 0) {
      this.lastHit = new Date().getTime();
    }
  };

  /**
   * Spielt bei Bedarf Hurt- oder Death-Sounds ab.
   * @param {boolean} wasDeadBefore - War der Charakter vorher schon tot?
   * @param {number} oldEnergy - Energie vor dem Treffer.
   * @returns {void}
   */
  Character.prototype.handleHitSounds = function (wasDeadBefore, oldEnergy) {
    const deadNow = this.isDead();
    if (wasDeadBefore) return;

    if (!wasDeadBefore && deadNow) {
      this.playDeathSound();
      return;
    }

    if (!deadNow && this.energy < oldEnergy) {
      this.playHurtSound();
    }
  };

  /**
   * Prüft, ob der Charakter tot ist.
   * @returns {boolean} true, wenn Energie <= 0.
   */
  Character.prototype.isDead = function () {
    return this.energy <= 0;
  };

  /**
   * Prüft, ob der Charakter vor kurzem Schaden erlitten hat.
   * @returns {boolean} true, wenn kürzlich getroffen.
   */
  Character.prototype.isHurt = function () {
    let timepassed = new Date().getTime() - this.lastHit;
    timepassed = timepassed / 1000;
    return this.energy > 0 && timepassed < 1;
  };

  /**
   * Spielt die Death-Animation genau einmal ab.
   * @returns {void}
   */
  Character.prototype.playDeathOnce = function () {
    if (this.deathFrozen || this.deathTimer) return;

    const seq = this.IMAGES_DEAD;
    this.img = this.imageCache[seq[this.deathIndex]];
    this.startDeathInterval(seq);
  };

  /**
   * Startet den Death-Animation-Interval.
   * @param {string[]} seq - Death-Frames.
   * @returns {void}
   */
  Character.prototype.startDeathInterval = function (seq) {
    this.deathTimer = setInterval(() => {
      this.advanceDeathFrame(seq);
    }, this.deathFrameDuration);
  };

  /**
   * Schaltet auf das nächste Death-Frame um.
   * @param {string[]} seq - Death-Frames.
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
   * Setzt die Death-Animation zurück (z.B. bei Restart).
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
