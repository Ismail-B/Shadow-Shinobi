/**
 * World audio helpers and playback logic.
 * Requires World class to be defined.
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
   * Resets an audio element (currentTime=0) if possible.
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
   * Pauses audio if possible.
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

  /**
   * Starts background sounds.
   */
  World.prototype.playBackgroundAudio = function () {
    setVolumeSafe(this.background_sound, 0.4);
    playAudioSafe(this.background_sound);

    setVolumeSafe(this.music, 0.4);
    playAudioSafe(this.music);
  };

  /**
   * Starts the boss intro sequence (with or without sound).
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
   * Handles boss intro when game is muted (no sound, just delay).
   */
  World.prototype.handleMutedBossIntro = function () {
    pauseAudioSafe(this.bossIntroSound);
    resetAudioSafe(this.bossIntroSound);

    setTimeout(() => {
      this.stopBossIntro();
    }, 2000);
  };

  /**
   * Plays the boss intro sound and ends intro when the sound ends.
   * Includes a fallback timeout to avoid getting stuck if "ended" doesn't fire.
   */
  World.prototype.playBossIntroSound = function () {
    const sound = this.bossIntroSound;
    if (!sound) {
      this.stopBossIntro();
      return;
    }

    // Clean previous listeners/timeouts if any
    if (this._bossIntroFallbackTimer) {
      clearTimeout(this._bossIntroFallbackTimer);
      this._bossIntroFallbackTimer = null;
    }
    if (this._onBossIntroEnded) {
      sound.removeEventListener('ended', this._onBossIntroEnded);
      this._onBossIntroEnded = null;
    }

    resetAudioSafe(sound);

    // End intro when audio ends
    this._onBossIntroEnded = () => {
      this.stopBossIntro();
    };
    sound.addEventListener('ended', this._onBossIntroEnded, { once: true });

    // Fallback: never keep the game locked forever
    this._bossIntroFallbackTimer = setTimeout(() => {
      this.stopBossIntro();
    }, 10000);

    playAudioSafe(sound);
  };

  /**
   * Stops the boss intro sequence.
   */
  World.prototype.stopBossIntro = function () {
    this.bossIntroActive = false;

    // Cleanup
    if (this._bossIntroFallbackTimer) {
      clearTimeout(this._bossIntroFallbackTimer);
      this._bossIntroFallbackTimer = null;
    }

    if (this.bossIntroSound && this._onBossIntroEnded) {
      try {
        this.bossIntroSound.removeEventListener('ended', this._onBossIntroEnded);
      } catch (e) {
        // intentionally ignored
      }
      this._onBossIntroEnded = null;
    }
  };

  /**
   * Pauses relevant game sounds on game over.
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
   * Plays the win sound.
   */
  World.prototype.playWinSound = function () {
    resetAudioSafe(this.win_sound);
    setVolumeSafe(this.win_sound, 0.8);
    playAudioSafe(this.win_sound);
  };

  /**
   * Plays the coin collect sound once (respects mute).
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
