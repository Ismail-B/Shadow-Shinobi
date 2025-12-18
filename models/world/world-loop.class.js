/**
 * Adds the main logic loop and end-of-game sequencing to the World prototype.
 */
(function () {
  /**
   * Starts the logic update loop (fixed timestep via setInterval).
   * @returns {void}
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
   * @returns {void}
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
   * Returns whether the player character is dead.
   * @returns {boolean} True if the character is dead
   */
  World.prototype.isCharacterDead = function () {
    if (!this.character || typeof this.character.isDead !== 'function') return false;
    return this.character.isDead();
  };

  /**
   * Returns whether the end boss is dead.
   * @returns {boolean} True if the end boss is dead
   */
  World.prototype.isEndbossDead = function () {
    const endboss = this.level && this.level.endboss;
    if (!endboss || typeof endboss.isDead !== 'function') return false;
    return endboss.isDead();
  };

  /**
   * Triggers the end sequence once (win or game over).
   * @param {boolean} playerWon - Whether the player won
   * @returns {void}
   */
  World.prototype.finishGame = function (playerWon) {
    if (this.endSequenceStarted) return;

    this.endSequenceStarted = true;
    this.startEndSequence(playerWon);
  };

  /**
   * Starts the end sequence: blocks input, pauses gameplay audio, shows overlay,
   * then hard-freezes the game after a configured delay.
   *
   * @param {boolean} playerWon - Whether the player won
   * @returns {void}
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
   * Clears all keyboard flags to prevent stuck input during the end sequence.
   * @returns {void}
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
   * Hard-freezes the game by stopping the logic loop, render loop, and tracked intervals.
   * @returns {void}
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
   * Displays the win or game-over overlay after a short delay.
   * @param {boolean} playerWon - Whether the player won
   * @returns {void}
   */
  World.prototype.showEndOverlayWithDelay = function (playerWon) {
    const overlayId = playerWon ? 'win-overlay' : 'game-over-overlay';

    setTimeout(() => {
      const overlay = document.getElementById(overlayId);
      if (overlay) overlay.style.display = 'flex';
    }, 1000);
  };

  /**
   * Stops the game immediately (e.g., restart or returning to menu).
   * @returns {void}
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
