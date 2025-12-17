/**
 * AI logic for Endboss.
 * Requires Endboss class + animation + damage methods.
 */
(function () {
  /**
   * Startet die AI-/Bewegungs-Logik.
   * @returns {void}
   */
  Endboss.prototype.startAiLoop = function () {
    setInterval(() => {
      this.updateBossAi();
    }, 1000 / 60);
  };

  /**
   * Aktualisiert AI: Aktivierung, Intro, Bewegung, Angriff.
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
   * Versucht den Boss zu aktivieren, wenn der Spieler nah genug ist.
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
   * Prüft, ob sich der Boss im Intro befindet.
   * @returns {boolean}
   */
  Endboss.prototype.isInIntroPhase = function () {
    if (!this.world) return false;
    return !!this.world.bossIntroActive;
  };

  /**
   * AI-Logik im aktiven Kampfzustand.
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
    } else {
      this.handleOutOfRangeMovement();
    }
  };

  /**
   * Verhalten, wenn Spieler in Angriffsreichweite ist.
   * @returns {void}
   */
  Endboss.prototype.handleInRangeAttack = function () {
    this.isMoving = false;
    this.startAttack();
  };

  /**
   * Verhalten, wenn Spieler außerhalb der Reichweite ist.
   * @returns {void}
   */
  Endboss.prototype.handleOutOfRangeMovement = function () {
    this.attacking = false;
    this.isMoving = true;
    this.moveLeft();
  };
})();
