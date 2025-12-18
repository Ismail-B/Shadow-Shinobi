/**
 * Character audio initialization and sound effect helpers.
 * This file patches methods onto Character.prototype and must be loaded after
 * the Character class definition.
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
   * Sets the volume of an audio element.
   *
   * @param {HTMLAudioElement} audio - Audio element to update.
   * @param {number} volume - Volume in range [0..1].
   * @returns {void}
   */
  function setVolumeSafe(audio, volume) {
    if (!isAudioElement(audio)) return;

    try {
      audio.volume = volume;
    } catch (_) {}
  }

  /**
   * Sets the playback rate of an audio element.
   *
   * @param {HTMLAudioElement} audio - Audio element to update.
   * @param {number} rate - Playback rate multiplier.
   * @returns {void}
   */
  function setPlaybackRateSafe(audio, rate) {
    if (!isAudioElement(audio)) return;

    try {
      audio.playbackRate = rate;
    } catch (_) {}
  }

  /**
   * Initializes all Character sound instances.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.initSounds = function () {
    /** @type {HTMLAudioElement} */
    this.walking_sound = new Audio('audio/running.mp3');

    /** @type {HTMLAudioElement} */
    this.kunai_throw_sound = new Audio('audio/throw_kunai.mp3');

    /** @type {HTMLAudioElement} */
    this.hit_sound = new Audio('audio/ninja-hit.wav');

    /** @type {HTMLAudioElement} */
    this.jump_sound = new Audio('audio/jump.mp3');

    /** @type {HTMLAudioElement} */
    this.hurt_sound = new Audio('audio/ninja-hurt.mp3');

    /** @type {HTMLAudioElement} */
    this.death_sound = new Audio('audio/ninja-dying.mp3');
  };

  /**
   * Plays the walking loop sound (legacy method name kept for compatibility).
   *
   * @this {Character}
   * @param {number} volume - Volume in range [0..1].
   * @param {number} playbackRate - Playback rate multiplier.
   * @returns {void}
   */
  Character.prototype.soundEffects = function (volume, playbackRate) {
    if (!isAudioElement(this.walking_sound)) return;

    setPlaybackRateSafe(this.walking_sound, playbackRate);
    setVolumeSafe(this.walking_sound, volume);
    playAudioSafe(this.walking_sound);
  };

  /**
   * Plays the kunai throw sound.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.playKunaiThrowSound = function () {
    if (!isAudioElement(this.kunai_throw_sound)) return;

    resetAudioSafe(this.kunai_throw_sound);
    setVolumeSafe(this.kunai_throw_sound, 0.3);
    playAudioSafe(this.kunai_throw_sound);
  };

  /**
   * Plays the melee hit sound.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.playHitSound = function () {
    if (!isAudioElement(this.hit_sound)) return;

    resetAudioSafe(this.hit_sound);
    setVolumeSafe(this.hit_sound, 0.3);
    playAudioSafe(this.hit_sound);
  };

  /**
   * Plays the jump sound.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.playJumpSound = function () {
    if (!isAudioElement(this.jump_sound)) return;

    resetAudioSafe(this.jump_sound);
    setVolumeSafe(this.jump_sound, 0.35);
    playAudioSafe(this.jump_sound);
  };

  /**
   * Plays the hurt sound.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.playHurtSound = function () {
    if (!isAudioElement(this.hurt_sound)) return;

    resetAudioSafe(this.hurt_sound);
    setVolumeSafe(this.hurt_sound, 0.35);
    playAudioSafe(this.hurt_sound);
  };

  /**
   * Plays the death sound once per Character instance.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.playDeathSound = function () {
    if (this._deathSoundPlayed) return;
    this._deathSoundPlayed = true;

    if (!isAudioElement(this.death_sound)) return;

    resetAudioSafe(this.death_sound);
    setVolumeSafe(this.death_sound, 0.4);
    playAudioSafe(this.death_sound);
  };
})();
