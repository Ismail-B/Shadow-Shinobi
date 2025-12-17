/**
 * Audio setup + audio helper methods for Endboss.
 * Requires Endboss class to be defined.
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
   * Pauses an Audio element if possible.
   * @param {HTMLAudioElement} audio
   */
  function pauseAudioSafe(audio) {
    if (!audio || !(audio instanceof Audio)) return;
    try {
      audio.pause();
    } catch (e) {
      // intentionally ignored
    }
  }

  Endboss.prototype.initSounds = function () {
    this.attack_sound = new Audio('audio/endboss-attack.mp3');
    this.dying_sound = new Audio('audio/endboss-dying.mp3');
    this.hurt_sounds = [
      new Audio('audio/endboss-hurt.mp3'),
      new Audio('audio/endboss-hurt2.mp3')
    ];
  };

  /**
   * Sets the default volume of boss sounds.
   * @returns {void}
   */
  Endboss.prototype.initSoundVolumes = function () {
    if (this.attack_sound) this.attack_sound.volume = 0.5;
    if (this.dying_sound) this.dying_sound.volume = 0.6;

    if (Array.isArray(this.hurt_sounds)) {
      this.hurt_sounds.forEach((sound) => {
        if (sound instanceof Audio) sound.volume = 0.55;
      });
    }
  };

  /**
   * Central sound control respecting mute state.
   * @param {HTMLAudioElement} audio
   * @returns {void}
   */
  Endboss.prototype.playBossSound = function (audio) {
    if (!audio) return;

    if (this.world && this.world.isMuted) {
      pauseAudioSafe(audio);
      resetAudioSafe(audio);
      return;
    }

    resetAudioSafe(audio);
    playAudioSafe(audio);
  };

  /**
   * Plays the boss attack sound.
   * @returns {void}
   */
  Endboss.prototype.playAttackSound = function () {
    this.playBossSound(this.attack_sound);
  };

  /**
   * Plays one of the boss hurt sounds (alternating).
   * @returns {void}
   */
  Endboss.prototype.playHurtSound = function () {
    const sounds = this.hurt_sounds || [];
    if (sounds.length === 0) return;

    const sound = sounds[this.nextHurtIndex % sounds.length];
    this.nextHurtIndex = (this.nextHurtIndex + 1) % sounds.length;

    this.playBossSound(sound);
  };

  /**
   * Plays the death sound once.
   * @returns {void}
   */
  Endboss.prototype.playDeathSound = function () {
    if (this._deathSoundPlayed) return;
    this._deathSoundPlayed = true;
    this.playBossSound(this.dying_sound);
  };
})();
