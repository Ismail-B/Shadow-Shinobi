/**
 * Movement + animation loop logic for Character.
 * Requires Character + combat + damage + audio methods to be loaded.
 */
(function () {
  /**
   * Startet die Bewegungs- und Animations-Loops.
   * @returns {void}
   */
  Character.prototype.animateCharacter = function () {
    this.startMovementLoop();
    this.startAnimationLoop();
  };

  /**
   * Startet den Bewegungs-Loop (Physik, Input, Kamera).
   * @returns {void}
   */
  Character.prototype.startMovementLoop = function () {
    setInterval(() => {
      this.updateMovement();
    }, 1000 / 60);
  };

  /**
   * Startet den Animations-Loop (Sprites, Angriffe).
   * @returns {void}
   */
  Character.prototype.startAnimationLoop = function () {
    setInterval(() => {
      this.updateAnimation();
    }, 100);
  };

  /**
   * Aktualisiert Bewegung und Eingaben innerhalb des Movement-Loops.
   * @returns {void}
   */
  Character.prototype.updateMovement = function () {
    if (this.isMovementFrozen()) {
      if (this.walking_sound) this.walking_sound.pause();
      return;
    }

    const onGround = !this.isAboveGround();

    const moved = this.handleHorizontalMovement();
    this.handleJump(onGround);

    if (!moved && this.walking_sound) this.walking_sound.pause();

    if (this.world) this.world.camera_x = -this.x + 50;
  };

  /**
   * Prüft, ob der Charakter wegen Boss-Intro oder GameEnd eingefroren ist.
   * @returns {boolean} true, wenn Bewegung gesperrt.
   */
  Character.prototype.isMovementFrozen = function () {
    if (!this.world) return false;
    if (this.world.bossIntroActive) return true;
    return this.world.gameEnded;
  };

  /**
   * Verarbeitet horizontale Eingaben (Links/Rechts).
   * @returns {boolean} true, wenn Bewegung stattgefunden hat.
   */
  Character.prototype.handleHorizontalMovement = function () {
    let moved = false;

    if (this.canMoveRight()) {
      this.moveRight();
      this.soundEffects(0.3, 2.5);
      moved = true;
    }

    if (this.canMoveLeft()) {
      this.moveLeft();
      this.soundEffects(0.3, 2.5);
      moved = true;
    }

    return moved;
  };

  /**
   * Prüft, ob eine Rechtsbewegung erlaubt ist.
   * Während Hurt soll Bewegung auch dann möglich sein, wenn isAttacking=true.
   * @returns {boolean}
   */
  Character.prototype.canMoveRight = function () {
    if (!this.world || !this.world.keyboard.RIGHT) return false;
    if (this.isDead()) return false;

    if (this.isAttacking && !this.isHurt()) return false;

    return this.x < this.world.level.level_end_x;
  };

  /**
   * Prüft, ob eine Linksbewegung erlaubt ist.
   * Während Hurt soll Bewegung auch dann möglich sein, wenn isAttacking=true.
   * @returns {boolean}
   */
  Character.prototype.canMoveLeft = function () {
    if (!this.world || !this.world.keyboard.LEFT) return false;
    if (this.isDead()) return false;

    if (this.isAttacking && !this.isHurt()) return false;

    return this.x > -670;
  };

  /**
   * Verarbeitet Sprung-Eingaben.
   * @param {boolean} onGround
   * @returns {void}
   */
  Character.prototype.handleJump = function (onGround) {
    if (this.canStartJump(onGround)) {
      this.playJumpSoundOnce();
      this.jump();
    }

    if (onGround && !this.world.keyboard.SPACE) {
      this._jumpSoundPlayed = false;
    }
  };

  /**
   * Prüft, ob ein Sprung gestartet werden kann.
   * Während Hurt soll Jump auch dann möglich sein, wenn isAttacking=true.
   * @param {boolean} onGround
   * @returns {boolean}
   */
  Character.prototype.canStartJump = function (onGround) {
    if (!this.world || !this.world.keyboard.SPACE) return false;
    if (!onGround) return false;
    if (this.isDead()) return false;

    if (this.isAttacking && !this.isHurt()) return false;

    return true;
  };

  /**
   * Spielt den Sprung-Sound genau einmal pro Sprung.
   * @returns {void}
   */
  Character.prototype.playJumpSoundOnce = function () {
    if (this._jumpSoundPlayed) return;
    this.playJumpSound();
    this._jumpSoundPlayed = true;
  };

  /**
   * Aktualisiert Animation und Angriff innerhalb des Animation-Loops.
   * @returns {void}
   */
Character.prototype.updateAnimation = function () {
  if (this.isDead()) {
    this.playDeathOnce();
    return;
  }

  // WICHTIG: Attack/Kunai soll auch während Hurt sofort laufen
  if (this.isAttacking) {
    this.updateAttack();
    return;
  }

  if (this.isHurt()) {
    this.playAnimation(this.IMAGES_HURT);
    return;
  }

  if (this.isMovementFrozen()) {
    this.playAnimation(this.IMAGES_IDLE);
    return;
  }

  this.handleMovementAnimation();
};


  /**
   * Schaltet zwischen Idle-, Jump- und Walk-Animation um.
   * @returns {void}
   */
  Character.prototype.handleMovementAnimation = function () {
    if (this.isAboveGround()) {
      this.playAnimation(this.IMAGES_JUMPING);
      return;
    }

    if (this.world?.keyboard.RIGHT || this.world?.keyboard.LEFT) {
      this.playAnimation(this.IMAGES_WALKING);
      return;
    }

    if (this.isNotMoving()) {
      this.playAnimation(this.IMAGES_IDLE);
    }
  };
})();
