/**
 * Endboss AI logic.
 * This file patches methods onto Endboss.prototype and must be loaded after
 * the Endboss class and its animation/damage helpers.
 *
 * @global
 */
(function () {
  /**
   * Starts the AI loop (movement/decision updates).
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.startAiLoop = function () {
    this._aiIntervalId = setInterval(() => {
      this.updateBossAi();
    }, 1000 / 60);
  };

  /**
   * Updates AI state: activation, intro blocking, movement and attack decisions.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.updateBossAi = function () {
    if (!this.activated) {
      this.tryActivateByPlayer();
      return;
    }

    if (this.isInIntroPhase()) {
      this.isMoving = false;
      this.attacking = false;
      return;
    }

    if (this.hurtPlaying || this.deathPlaying || this.attacking) {
      this.isMoving = false;
      return;
    }

    this.updateActiveAi();
  };

  /**
   * Activates the boss once the player is within view distance.
   * Also triggers the world boss intro hook if available.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.tryActivateByPlayer = function () {
    if (!this.world || !this.world.character) return;

    const char = this.world.character;
    if (char.x + this.viewDistance < this.x) return;

    this.activated = true;
    this.activationTime = performance.now();
    this.isMoving = false;
    this.attacking = false;

    if (typeof this.world.startBossIntro === 'function') {
      this.world.startBossIntro();
    }
  };

  /**
   * Returns whether the boss is currently blocked by the intro phase.
   *
   * @this {Endboss}
   * @returns {boolean}
   */
  Endboss.prototype.isInIntroPhase = function () {
    if (!this.world) return false;
    return !!this.world.bossIntroActive;
  };

  /**
   * AI logic while actively fighting the player.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.updateActiveAi = function () {
    this.otherDirection = true;

    if (!this.world || !this.world.character) {
      this.moveLeft();
      this.isMoving = true;
      return;
    }

    const char = this.world.character;
    const dx = this.x - char.x;
    const attackRange = 40;

    if (dx <= attackRange) {
      this.handleInRangeAttack();
      return;
    }

    this.handleOutOfRangeMovement();
  };

  /**
   * Behavior when the player is in attack range.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.handleInRangeAttack = function () {
    this.isMoving = false;
    this.startAttack();
  };

  /**
   * Behavior when the player is out of range.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.handleOutOfRangeMovement = function () {
    this.attacking = false;
    this.isMoving = true;
    this.moveLeft();
  };
})();
