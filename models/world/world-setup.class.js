(function () {
  /**
   * Registers handler for when the boss intro sound ends.
   */
  World.prototype.registerBossIntroEndHandler = function () {
    this.bossIntroSound.addEventListener('ended', () => {
      this.stopBossIntro();
    });
  };

  /**
   * Registers keyboard actions (kunai throw, melee attack).
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
   * Initializes sounds and world references for character and enemies.
   */
  World.prototype.setWorld = function () {
    this.playBackgroundAudio();
    this.character.world = this;
    this.setWorldOnEnemies();
  };

  /**
   * Sets world reference on all enemies.
   */
  World.prototype.setWorldOnEnemies = function () {
    const enemies = this.level && this.level.enemies;
    if (!enemies) return;

    enemies.forEach((enemy) => {
      if (enemy) enemy.world = this;
    });
  };
})();
