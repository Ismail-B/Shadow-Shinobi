/**
 * Audio setup + audio helper methods for Character.
 * Requires Character class to be defined.
 */
(function () {
  /**
   * Plays an Audio element without unhandled promise rejections.
   * @param {HTMLAudioElement} audio
   */
  function playAudioSafe(audio) {
    if (!audio || !(audio instanceof Audio)) return;

    try {
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // intentionally ignored
        });
      }
    } catch (e) {
      // intentionally ignored
    }
  }

  /**
   * Resets an Audio element to start if possible.
   * @param {HTMLAudioElement} audio
   */
  function resetAudioSafe(audio) {
    if (!audio || !(audio instanceof Audio)) return;
    try {
      audio.currentTime = 0;
    } catch (e) {
      // intentionally ignored
    }
  }

  /**
   * Sets volume if possible.
   * @param {HTMLAudioElement} audio
   * @param {number} volume
   */
  function setVolumeSafe(audio, volume) {
    if (!audio || !(audio instanceof Audio)) return;
    try {
      audio.volume = volume;
    } catch (e) {
      // intentionally ignored
    }
  }

  /**
   * Sets playbackRate if possible.
   * @param {HTMLAudioElement} audio
   * @param {number} rate
   */
  function setPlaybackRateSafe(audio, rate) {
    if (!audio || !(audio instanceof Audio)) return;
    try {
      audio.playbackRate = rate;
    } catch (e) {
      // intentionally ignored
    }
  }

  Character.prototype.initSounds = function () {
    this.walking_sound = new Audio('audio/running.mp3');
    this.kunai_throw_sound = new Audio('audio/throw_kunai.mp3');
    this.hit_sound = new Audio('audio/ninja-hit.wav');
    this.jump_sound = new Audio('audio/jump.mp3');
    this.hurt_sound = new Audio('audio/ninja-hurt.mp3');
    this.death_sound = new Audio('audio/ninja-dying.mp3');
  };

  /**
   * Plays the walking sound effect.
   * @param {number} volume - Volume (0–1).
   * @param {number} playbackRate - Playback speed.
   * @returns {void}
   */
  Character.prototype.soundEffects = function (volume, playbackRate) {
    if (!this.walking_sound) return;

    setPlaybackRateSafe(this.walking_sound, playbackRate);
    setVolumeSafe(this.walking_sound, volume);

    playAudioSafe(this.walking_sound);
  };

  /**
   * Plays the kunai throw sound.
   * @returns {void}
   */
  Character.prototype.playKunaiThrowSound = function () {
    if (!this.kunai_throw_sound) return;

    resetAudioSafe(this.kunai_throw_sound);
    setVolumeSafe(this.kunai_throw_sound, 0.3);
    playAudioSafe(this.kunai_throw_sound);
  };

  /**
   * Plays the melee hit sound.
   * @returns {void}
   */
  Character.prototype.playHitSound = function () {
    if (!this.hit_sound) return;

    resetAudioSafe(this.hit_sound);
    setVolumeSafe(this.hit_sound, 0.3);
    playAudioSafe(this.hit_sound);
  };

  /**
   * Plays the jump sound.
   * @returns {void}
   */
  Character.prototype.playJumpSound = function () {
    if (!this.jump_sound) return;

    resetAudioSafe(this.jump_sound);
    setVolumeSafe(this.jump_sound, 0.35);
    playAudioSafe(this.jump_sound);
  };

  /**
   * Plays the hurt sound.
   * @returns {void}
   */
  Character.prototype.playHurtSound = function () {
    if (!this.hurt_sound) return;

    resetAudioSafe(this.hurt_sound);
    setVolumeSafe(this.hurt_sound, 0.35);
    playAudioSafe(this.hurt_sound);
  };

  /**
   * Plays the death sound once.
   * @returns {void}
   */
  Character.prototype.playDeathSound = function () {
    if (this._deathSoundPlayed) return;
    this._deathSoundPlayed = true;

    if (!this.death_sound) return;

    resetAudioSafe(this.death_sound);
    setVolumeSafe(this.death_sound, 0.4);
    playAudioSafe(this.death_sound);
  };
})();
