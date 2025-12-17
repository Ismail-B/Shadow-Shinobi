/**
 * Audio setup + audio helper methods for Character.
 * Requires Character class to be defined.
 */
(function () {
  Character.prototype.initSounds = function () {
    this.walking_sound = new Audio('audio/running.mp3');
    this.kunai_throw_sound = new Audio('audio/throw_kunai.mp3');
    this.hit_sound = new Audio('audio/ninja-hit.wav');
    this.jump_sound = new Audio('audio/jump.mp3');
    this.hurt_sound = new Audio('audio/ninja-hurt.mp3');
    this.death_sound = new Audio('audio/ninja-dying.mp3');
  };

  /**
   * Spielt die Lauf-Soundeffekte ab.
   * @param {number} volume - Lautstärke (0–1).
   * @param {number} playbackRate - Abspielgeschwindigkeit.
   * @returns {void}
   */
Character.prototype.soundEffects = function (volume, playbackRate) {
  if (!this.walking_sound) return;

  this.walking_sound.playbackRate = playbackRate;
  this.walking_sound.volume = volume;

  const p = this.walking_sound.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});
};

  /**
   * Spielt den Kunai-Wurf-Sound ab.
   * @returns {void}
   */
  Character.prototype.playKunaiThrowSound = function () {
    if (!this.kunai_throw_sound) return;
    this.kunai_throw_sound.currentTime = 0;
    this.kunai_throw_sound.volume = 0.3;
    this.kunai_throw_sound.play();
  };

  /**
   * Spielt den Nahkampf-Sound ab.
   * @returns {void}
   */
  Character.prototype.playHitSound = function () {
    if (!this.hit_sound) return;
    this.hit_sound.currentTime = 0;
    this.hit_sound.volume = 0.3;
    this.hit_sound.play();
  };

  /**
   * Spielt den Sprung-Sound ab.
   * @returns {void}
   */
  Character.prototype.playJumpSound = function () {
    if (!this.jump_sound) return;
    this.jump_sound.currentTime = 0;
    this.jump_sound.volume = 0.35;
    this.jump_sound.play();
  };

  /**
   * Spielt den Hurt-Sound ab.
   * @returns {void}
   */
  Character.prototype.playHurtSound = function () {
    if (!this.hurt_sound) return;
    this.hurt_sound.currentTime = 0;
    this.hurt_sound.volume = 0.35;
    this.hurt_sound.play();
  };

  /**
   * Spielt den Death-Sound einmalig ab.
   * @returns {void}
   */
  Character.prototype.playDeathSound = function () {
    if (this._deathSoundPlayed) return;
    this._deathSoundPlayed = true;

    if (!this.death_sound) return;
    this.death_sound.currentTime = 0;
    this.death_sound.volume = 0.4;
    this.death_sound.play();
  };
})();
