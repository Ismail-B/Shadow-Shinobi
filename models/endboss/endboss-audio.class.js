/**
 * Audio setup + audio helper methods for Endboss.
 * Requires Endboss class to be defined.
 */
(function () {
  Endboss.prototype.initSounds = function () {
    this.attack_sound = new Audio('audio/endboss-attack.mp3');
    this.dying_sound = new Audio('audio/endboss-dying.mp3');
    this.hurt_sounds = [
      new Audio('audio/endboss-hurt.mp3'),
      new Audio('audio/endboss-hurt2.mp3')
    ];
  };

  /**
   * Setzt die Grundlautstärke der Boss-Sounds.
   * @returns {void}
   */
  Endboss.prototype.initSoundVolumes = function () {
    if (this.attack_sound) this.attack_sound.volume = 0.5;
    if (this.dying_sound) this.dying_sound.volume = 0.6;

    this.hurt_sounds.forEach((sound) => {
      sound.volume = 0.55;
    });
  };

  /**
   * Zentrale Soundsteuerung, berücksichtigt Mute-Status.
   * @param {HTMLAudioElement} audio - Audioinstanz.
   * @returns {void}
   */
  Endboss.prototype.playBossSound = function (audio) {
    if (!audio) return;

    if (this.world && this.world.isMuted) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  };

  /**
   * Spielt den Angriffssound des Bosses ab.
   * @returns {void}
   */
  Endboss.prototype.playAttackSound = function () {
    this.playBossSound(this.attack_sound);
  };

  /**
   * Spielt einen der Hurt-Sounds ab (abwechselnd).
   * @returns {void}
   */
  Endboss.prototype.playHurtSound = function () {
    const sound = this.hurt_sounds[this.nextHurtIndex];
    this.nextHurtIndex = (this.nextHurtIndex + 1) % this.hurt_sounds.length;
    this.playBossSound(sound);
  };

  /**
   * Spielt den Death-Sound einmalig ab.
   * @returns {void}
   */
  Endboss.prototype.playDeathSound = function () {
    if (this._deathSoundPlayed) return;
    this._deathSoundPlayed = true;
    this.playBossSound(this.dying_sound);
  };
})();
