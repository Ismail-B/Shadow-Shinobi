/**
 * Endboss audio initialization and sound effect helpers.
 * This file patches methods onto Endboss.prototype and must be loaded after
 * the Endboss class definition.
 *
 * @global
 */
(function () {
  /**
   * Returns true if the given value looks like an HTMLAudioElement.
   *
   * @param {*} audio - Candidate object.
   * @returns {audio is HTMLAudioElement}
   */
  function isAudioElement(audio) {
    return (
      !!audio &&
      typeof audio.play === 'function' &&
      typeof audio.pause === 'function' &&
      'currentTime' in audio &&
      'volume' in audio
    );
  }

  /**
   * Plays an audio element and safely ignores autoplay / playback rejections.
   *
   * @param {HTMLAudioElement} audio - Audio element to play.
   * @returns {void}
   */
  function playAudioSafe(audio) {
    if (!isAudioElement(audio)) return;

    try {
      const promise = audio.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {});
      }
    } catch (_) {}
  }

  /**
   * Resets an audio element to the start position.
   *
   * @param {HTMLAudioElement} audio - Audio element to reset.
   * @returns {void}
   */
  function resetAudioSafe(audio) {
    if (!isAudioElement(audio)) return;

    try {
      audio.currentTime = 0;
    } catch (_) {}
  }

  /**
   * Pauses an audio element.
   *
   * @param {HTMLAudioElement} audio - Audio element to pause.
   * @returns {void}
   */
  function pauseAudioSafe(audio) {
    if (!isAudioElement(audio)) return;

    try {
      audio.pause();
    } catch (_) {}
  }

  /**
   * Initializes all Endboss sound instances.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.initSounds = function () {
    /** @type {HTMLAudioElement} */
    this.attack_sound = new Audio('audio/endboss-attack.mp3');

    /** @type {HTMLAudioElement} */
    this.dying_sound = new Audio('audio/endboss-dying.mp3');

    /** @type {HTMLAudioElement[]} */
    this.hurt_sounds = [
      new Audio('audio/endboss-hurt.mp3'),
      new Audio('audio/endboss-hurt2.mp3'),
    ];
  };

  /**
   * Sets default volumes for boss sounds.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.initSoundVolumes = function () {
    if (isAudioElement(this.attack_sound)) this.attack_sound.volume = 0.5;
    if (isAudioElement(this.dying_sound)) this.dying_sound.volume = 0.6;

    if (Array.isArray(this.hurt_sounds)) {
      this.hurt_sounds.forEach((sound) => {
        if (isAudioElement(sound)) sound.volume = 0.55;
      });
    }
  };

  /**
   * Plays a boss sound while respecting the world's mute state.
   *
   * @this {Endboss}
   * @param {HTMLAudioElement|null|undefined} audio - Sound to play.
   * @returns {void}
   */
  Endboss.prototype.playBossSound = function (audio) {
    if (!isAudioElement(audio)) return;

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
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.playAttackSound = function () {
    this.playBossSound(this.attack_sound);
  };

  /**
   * Plays one of the boss hurt sounds (round-robin).
   *
   * @this {Endboss}
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
   * Plays the boss death sound once per Endboss instance.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.playDeathSound = function () {
    if (this._deathSoundPlayed) return;

    this._deathSoundPlayed = true;
    this.playBossSound(this.dying_sound);
  };
})();
