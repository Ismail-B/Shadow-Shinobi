/**
 * Character movement and animation loop logic.
 * This file patches methods onto Character.prototype and must be loaded after
 * the Character class, combat, damage, and audio helpers.
 *
 * @global
 */
(function () {
  /**
   * Starts movement and animation loops.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.animateCharacter = function () {
    this.startMovementLoop();
    this.startAnimationLoop();
  };

  /**
   * Starts the movement loop (physics, input, camera).
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.startMovementLoop = function () {
    this._movementIntervalId = setInterval(() => {
      this.updateMovement();
    }, 1000 / 60);
  };

  /**
   * Starts the animation loop (sprites, attack updates).
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.startAnimationLoop = function () {
    this._animationIntervalId = setInterval(() => {
      this.updateAnimation();
    }, 100);
  };

  /**
   * Updates movement and input handling within the movement loop.
   *
   * @this {Character}
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
   * Returns whether movement is currently blocked (boss intro or game end).
   *
   * @this {Character}
   * @returns {boolean} True if movement should be frozen.
   */
  Character.prototype.isMovementFrozen = function () {
    if (!this.world) return false;
    if (this.world.bossIntroActive) return true;
    return this.world.gameEnded;
  };

  /**
   * Handles horizontal movement input (left/right).
   *
   * @this {Character}
   * @returns {boolean} True if movement occurred.
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
   * Returns whether moving right is currently allowed.
   * While hurt, movement remains allowed even if isAttacking is true.
   *
   * @this {Character}
   * @returns {boolean}
   */
  Character.prototype.canMoveRight = function () {
    if (!this.world || !this.world.keyboard.RIGHT) return false;
    if (this.isDead()) return false;

    if (this.isAttacking && !this.isHurt()) return false;

    return this.x < this.world.level.level_end_x;
  };

  /**
   * Returns whether moving left is currently allowed.
   * While hurt, movement remains allowed even if isAttacking is true.
   *
   * @this {Character}
   * @returns {boolean}
   */
  Character.prototype.canMoveLeft = function () {
    if (!this.world || !this.world.keyboard.LEFT) return false;
    if (this.isDead()) return false;

    if (this.isAttacking && !this.isHurt()) return false;

    return this.x > -670;
  };

  /**
   * Handles jump input.
   *
   * @this {Character}
   * @param {boolean} onGround - True if the character is on the ground.
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
   * Returns whether a jump can be started.
   * While hurt, jumping remains allowed even if isAttacking is true.
   *
   * @this {Character}
   * @param {boolean} onGround - True if the character is on the ground.
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
   * Plays the jump sound exactly once per jump press.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.playJumpSoundOnce = function () {
    if (this._jumpSoundPlayed) return;

    this.playJumpSound();
    this._jumpSoundPlayed = true;
  };

  /**
   * Updates the active animation state and attack frames within the animation loop.
   *
   * @this {Character}
   * @returns {void}
   */
  Character.prototype.updateAnimation = function () {
    if (this.isDead()) {
      this.playDeathOnce();
      return;
    }

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
   * Switches between idle, jump, and walk animations.
   *
   * @this {Character}
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
