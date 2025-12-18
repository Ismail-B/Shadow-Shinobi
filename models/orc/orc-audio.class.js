/**
 * Orc audio helpers and sound playback.
 * This file patches helpers onto Orc and Orc.prototype and must be loaded after
 * the Orc class definition.
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
  Orc.playAudioSafe = function (audio) {
    if (!isAudioElement(audio)) return;

    try {
      const promise = audio.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {});
      }
    } catch (_) {}
  };

  /**
   * Resets an audio element to the start position.
   *
   * @param {HTMLAudioElement} audio - Audio element to reset.
   * @returns {void}
   */
  Orc.resetAudioSafe = function (audio) {
    if (!isAudioElement(audio)) return;

    try {
      audio.currentTime = 0;
    } catch (_) {}
  };

  /**
   * Sets the volume of an audio element.
   *
   * @param {HTMLAudioElement} audio - Audio element to update.
   * @param {number} volume - Volume in range [0..1].
   * @returns {void}
   */
  Orc.setVolumeSafe = function (audio, volume) {
    if (!isAudioElement(audio)) return;

    try {
      audio.volume = volume;
    } catch (_) {}
  };

  /**
   * Sets the playback rate of an audio element.
   *
   * @param {HTMLAudioElement} audio - Audio element to update.
   * @param {number} rate - Playback rate multiplier.
   * @returns {void}
   */
  Orc.setPlaybackRateSafe = function (audio, rate) {
    if (!isAudioElement(audio)) return;

    try {
      audio.playbackRate = rate;
    } catch (_) {}
  };

  /**
   * Pauses an audio element.
   *
   * @param {HTMLAudioElement} audio - Audio element to pause.
   * @returns {void}
   */
  Orc.pauseAudioSafe = function (audio) {
    if (!isAudioElement(audio)) return;

    try {
      audio.pause();
    } catch (_) {}
  };

  /**
   * Returns whether game audio is currently muted.
   * This checks the global `world` reference if present.
   *
   * @returns {boolean}
   */
  Orc.isGameMuted = function () {
    if (typeof world === 'undefined' || !world) return false;

    if (typeof world.isMuted === 'boolean') return world.isMuted;
    if (world.music && typeof world.music.muted === 'boolean') return !!world.music.muted;

    return false;
  };

  /**
   * Plays the orc death sound (respects mute state).
   *
   * @this {Orc}
   * @returns {void}
   */
  Orc.prototype.playDeathSound = function () {
    if (Orc.isGameMuted()) return;

    const sound = new Audio('audio/orc-dying.mp3');
    Orc.setVolumeSafe(sound, 0.35);
    Orc.resetAudioSafe(sound);
    Orc.playAudioSafe(sound);
  };
})();
