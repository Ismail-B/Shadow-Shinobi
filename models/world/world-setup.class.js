/**
 * Adds input handling and world initialization helpers to the World prototype.
 */
(function () {
  /**
   * Registers a handler to end the boss intro when the intro sound finishes.
   * @returns {void}
   */
  World.prototype.registerBossIntroEndHandler = function () {
    this.bossIntroSound.addEventListener('ended', () => {
      this.stopBossIntro();
    });
  };

  /**
   * Registers keyboard listeners for player actions.
   * Handles kunai throws and melee attacks.
   *
   * @returns {void}
   */
  World.prototype.registerKeyListeners = function () {
    window.addEventListener('keydown', (event) => {
      if (this.gameEnded || this.gameEnding) return;

      if (event.code === 'KeyV' && !event.repeat) {
        this.tryThrowKunai();
      }

      if (event.code === 'KeyB' && !event.repeat) {
        this.character.tryStartAttack();
      }
    });
  };

  /**
   * Initializes world references and starts background audio.
   * @returns {void}
   */
  World.prototype.setWorld = function () {
    this.playBackgroundAudio();
    this.character.world = this;
    this.setWorldOnEnemies();
  };

  /**
   * Assigns the world reference to all enemies in the current level.
   * @returns {void}
   */
  World.prototype.setWorldOnEnemies = function () {
    const enemies = this.level && this.level.enemies;
    if (!enemies) return;

    enemies.forEach((enemy) => {
      if (enemy) enemy.world = this;
    });
  };
})();
