/**
 * Orc audio helpers and sound playback.
 * Requires Orc class to be defined.
 */
(function () {
  /**
   * Plays an Audio element without unhandled promise rejections.
   * @param {HTMLAudioElement} audio
   */
  Orc.playAudioSafe = function (audio) {
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
  };

  /**
   * Resets an Audio element (currentTime=0) if possible.
   * @param {HTMLAudioElement} audio
   */
  Orc.resetAudioSafe = function (audio) {
    if (!audio || !(audio instanceof Audio)) return;
    try {
      audio.currentTime = 0;
    } catch (e) {
      // intentionally ignored
    }
  };

  /**
   * Sets volume if possible.
   * @param {HTMLAudioElement} audio
   * @param {number} volume
   */
  Orc.setVolumeSafe = function (audio, volume) {
    if (!audio || !(audio instanceof Audio)) return;
    try {
      audio.volume = volume;
    } catch (e) {
      // intentionally ignored
    }
  };

  /**
   * Sets playback rate if possible.
   * @param {HTMLAudioElement} audio
   * @param {number} rate
   */
  Orc.setPlaybackRateSafe = function (audio, rate) {
    if (!audio || !(audio instanceof Audio)) return;
    try {
      audio.playbackRate = rate;
    } catch (e) {
      // intentionally ignored
    }
  };

  /**
   * Pauses audio if possible.
   * @param {HTMLAudioElement} audio
   */
  Orc.pauseAudioSafe = function (audio) {
    if (!audio || !(audio instanceof Audio)) return;
    try {
      audio.pause();
    } catch (e) {
      // intentionally ignored
    }
  };

  /**
   * Returns whether the game audio is currently muted (best effort).
   * @returns {boolean}
   */
  Orc.isGameMuted = function () {
    if (typeof world === 'undefined' || !world) return false;

    if (typeof world.isMuted === 'boolean') return world.isMuted;
    if (world.music instanceof Audio) return !!world.music.muted;

    return false;
  };

  /**
   * Plays the orc death sound (respects mute).
   * @returns {void}
   */
  Orc.prototype.playDeathSound = function () {
    if (Orc.isGameMuted()) return;

    const s = new Audio('audio/orc-dying.mp3');
    Orc.setVolumeSafe(s, 0.35);
    Orc.resetAudioSafe(s);
    Orc.playAudioSafe(s);
  };
})();
