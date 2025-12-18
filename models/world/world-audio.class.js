/**
 * Adds audio helper methods and playback logic to the World prototype.
 */
(function () {
  /**
   * Plays an audio element while suppressing autoplay-related promise rejections.
   *
   * @param {HTMLAudioElement} audio - Audio element to play
   * @returns {void}
   */
  function playAudioSafe(audio) {
    if (!audio || !(audio instanceof Audio)) return;

    try {
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    } catch (e) {}
  }

  /**
   * Resets an audio element to the beginning if supported.
   *
   * @param {HTMLAudioElement} audio - Audio element to reset
   * @returns {void}
   */
  function resetAudioSafe(audio) {
    if (!audio || !(audio instanceof Audio)) return;

    try {
      audio.currentTime = 0;
    } catch (e) {}
  }

  /**
   * Sets the volume on an audio element if supported.
   *
   * @param {HTMLAudioElement} audio - Audio element to update
   * @param {number} volume - Volume in the range 0..1
   * @returns {void}
   */
  function setVolumeSafe(audio, volume) {
    if (!audio || !(audio instanceof Audio)) return;

    try {
      audio.volume = volume;
    } catch (e) {}
  }

  /**
   * Pauses an audio element if supported.
   *
   * @param {HTMLAudioElement} audio - Audio element to pause
   * @returns {void}
   */
  function pauseAudioSafe(audio) {
    if (!audio || !(audio instanceof Audio)) return;

    try {
      audio.pause();
    } catch (e) {}
  }

  /**
   * Starts ambient background audio (looping tracks).
   * @returns {void}
   */
  World.prototype.playBackgroundAudio = function () {
    setVolumeSafe(this.background_sound, 0.4);
    playAudioSafe(this.background_sound);

    setVolumeSafe(this.music, 0.4);
    playAudioSafe(this.music);
  };

  /**
   * Starts the boss intro sequence and blocks gameplay while it is active.
   * @returns {void}
   */
  World.prototype.startBossIntro = function () {
    if (this.bossIntroActive || this.gameEnded || this.gameEnding) return;

    this.bossIntroActive = true;

    if (this.isMuted) {
      this.handleMutedBossIntro();
      return;
    }

    this.playBossIntroSound();
  };

  /**
   * Runs the boss intro timing while muted (no audio playback).
   * @returns {void}
   */
  World.prototype.handleMutedBossIntro = function () {
    pauseAudioSafe(this.bossIntroSound);
    resetAudioSafe(this.bossIntroSound);

    setTimeout(() => {
      this.stopBossIntro();
    }, 2000);
  };

  /**
   * Plays the boss intro sound and ends the intro when playback finishes.
   * Uses a fallback timeout in case the audio "ended" event does not fire.
   *
   * @returns {void}
   */
  World.prototype.playBossIntroSound = function () {
    const sound = this.bossIntroSound;
    if (!sound) {
      this.stopBossIntro();
      return;
    }

    if (this._bossIntroFallbackTimer) {
      clearTimeout(this._bossIntroFallbackTimer);
      this._bossIntroFallbackTimer = null;
    }

    if (this._onBossIntroEnded) {
      sound.removeEventListener('ended', this._onBossIntroEnded);
      this._onBossIntroEnded = null;
    }

    resetAudioSafe(sound);

    this._onBossIntroEnded = () => {
      this.stopBossIntro();
    };
    sound.addEventListener('ended', this._onBossIntroEnded, { once: true });

    this._bossIntroFallbackTimer = setTimeout(() => {
      this.stopBossIntro();
    }, 10000);

    playAudioSafe(sound);
  };

  /**
   * Ends the boss intro sequence and cleans up related listeners/timeouts.
   * @returns {void}
   */
  World.prototype.stopBossIntro = function () {
    this.bossIntroActive = false;

    if (this._bossIntroFallbackTimer) {
      clearTimeout(this._bossIntroFallbackTimer);
      this._bossIntroFallbackTimer = null;
    }

    if (this.bossIntroSound && this._onBossIntroEnded) {
      try {
        this.bossIntroSound.removeEventListener('ended', this._onBossIntroEnded);
      } catch (e) {}
      this._onBossIntroEnded = null;
    }
  };

  /**
   * Pauses all relevant game audio sources used during gameplay.
   * @returns {void}
   */
  World.prototype.pauseGameOverAudio = function () {
    pauseAudioSafe(this.background_sound);
    pauseAudioSafe(this.music);

    if (this.character && this.character.walking_sound) {
      pauseAudioSafe(this.character.walking_sound);
    }

    pauseAudioSafe(this.bossIntroSound);

    if (Array.isArray(this.coinCollectSounds)) {
      this.coinCollectSounds.forEach((s) => pauseAudioSafe(s));
    }
  };

  /**
   * Plays the win sound effect.
   * @returns {void}
   */
  World.prototype.playWinSound = function () {
    resetAudioSafe(this.win_sound);
    setVolumeSafe(this.win_sound, 0.8);
    playAudioSafe(this.win_sound);
  };

  /**
   * Plays one coin-collect sound (round-robin) if audio is not muted.
   * @returns {void}
   */
  World.prototype.playCoinCollectSound = function () {
    if (this.isMuted) return;

    const sounds = this.coinCollectSounds || [];
    if (sounds.length === 0) return;

    const sound = sounds[this.nextCoinSoundIndex % sounds.length];
    this.nextCoinSoundIndex++;

    resetAudioSafe(sound);
    setVolumeSafe(sound, 0.35);
    playAudioSafe(sound);
  };
})();
