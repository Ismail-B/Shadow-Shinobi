(function () {
  /**
   * Starts the game loop (logic updates).
   */
World.prototype.run = function () {
  if (this.__loopStarted) return;
  this.__loopStarted = true;
  const intervalMs = 1000 / 60;
  this.gameLoopIntervalId = setInterval(() => {
    this.updateGameLoop();
  }, intervalMs);
};

  /**
   * Executes one logic tick of the game loop.
   */
  World.prototype.updateGameLoop = function () {
    if (this.gameEnded || this.bossIntroActive) return;
    if (this.gameEnding) return;

    this.updateCollectibleBobbing();

    this.checkCollisions();
    this.checkCollectibles();
    this.checkForEndboss();

    if (this.isCharacterDead()) {
      this.finishGame(false);
      return;
    }

    if (this.isEndbossDead()) {
      this.finishGame(true);
    }
  };

  /**
   * Checks if the player character is dead.
   * @returns {boolean}
   */
  World.prototype.isCharacterDead = function () {
    if (!this.character || typeof this.character.isDead !== 'function') return false;
    return this.character.isDead();
  };

  /**
   * Checks if the endboss is dead.
   * @returns {boolean}
   */
  World.prototype.isEndbossDead = function () {
    const endboss = this.level && this.level.endboss;
    if (!endboss || typeof endboss.isDead !== 'function') return false;
    return endboss.isDead();
  };

  /**
   * Marks the game as finished and triggers end sequence (without immediate freeze).
   * @param {boolean} playerWon - True if the player has won.
   */
  World.prototype.finishGame = function (playerWon) {
    if (this.endSequenceStarted) return;
    this.endSequenceStarted = true;
    this.startEndSequence(playerWon);
  };

  /**
   * Starts the end sequence: stop inputs + stop sounds,
   * but keep rendering alive until death animation is done.
   * @param {boolean} playerWon
   */
  World.prototype.startEndSequence = function (playerWon) {
    this.gameEnding = true;

    this.resetKeyboardState();
    this.pauseGameOverAudio();

    if (playerWon) {
      this.playWinSound();
    }

    this.showEndOverlayWithDelay(playerWon);

    const freezeDelay = playerWon
      ? this.endbossDeathFreezeDelayMs
      : this.characterDeathFreezeDelayMs;

    setTimeout(() => {
      this.hardFreeze();
    }, freezeDelay);
  };

  /**
   * Resets all keyboard flags to prevent stuck inputs during end sequence.
   */
  World.prototype.resetKeyboardState = function () {
    if (!this.keyboard) return;

    this.keyboard.LEFT = false;
    this.keyboard.RIGHT = false;
    this.keyboard.UP = false;
    this.keyboard.DOWN = false;
    this.keyboard.SPACE = false;
    this.keyboard.ATTACK = false;
    this.keyboard.D = false;
  };

  /**
   * Hard-freezes the game: stops RAF + world loop + all tracked intervals.
   */
  World.prototype.hardFreeze = function () {
    if (this.gameEnded) return;

    this.gameEnded = true;

    if (this.gameLoopIntervalId) {
      clearInterval(this.gameLoopIntervalId);
      this.gameLoopIntervalId = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (typeof clearAllIntervals === 'function') {
      clearAllIntervals();
    }
  };

  /**
   * Shows the game-over or win overlay after a short delay.
   * @param {boolean} playerWon - True if the player has won.
   */
  World.prototype.showEndOverlayWithDelay = function (playerWon) {
    const overlayId = playerWon ? 'win-overlay' : 'game-over-overlay';

    setTimeout(() => {
      const overlay = document.getElementById(overlayId);
      if (overlay) overlay.style.display = 'flex';
    }, 1000);
  };

  /**
   * Completely stops the game (used for restart/menu).
   */
  World.prototype.stop = function () {
    this.gameEnded = true;
    this.gameEnding = true;

    if (this.gameLoopIntervalId) {
      clearInterval(this.gameLoopIntervalId);
      this.gameLoopIntervalId = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (typeof clearAllIntervals === 'function') {
      clearAllIntervals();
    }

    this.pauseGameOverAudio();
  };
})();
