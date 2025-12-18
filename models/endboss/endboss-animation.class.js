/**
 * Endboss rendering and animation logic (idle/walk, hurt, death, attack).
 * This file patches methods onto Endboss.prototype and must be loaded after
 * the Endboss class and its audio helpers.
 *
 * @global
 */
(function () {
  /**
   * Draws the boss with state-dependent scaling (idle/hurt/dead/attack).
   *
   * @this {Endboss}
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context.
   * @returns {void}
   */
  Endboss.prototype.draw = function (ctx) {
    const scale = this.getCurrentScale();
    const w = this.width * scale;
    const h = this.height * scale;

    const dx = this.x - (w - this.width) / 2;
    const dy = this.y - (h - this.height);

    ctx.drawImage(this.img, dx, dy, w, h);
  };

  /**
   * Returns the current scale factor depending on the active state.
   *
   * @this {Endboss}
   * @returns {number}
   */
  Endboss.prototype.getCurrentScale = function () {
    if (this.hurtPlaying) return this.scaleHurt;
    if (this.deathPlaying) return this.scaleDead;
    if (this.attacking) return this.scaleAttack;
    return this.scaleIdle;
  };

  /**
   * Starts the main animation loop and the AI loop.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.animate = function () {
    this.startMainAnimationLoop();
    this.startAiLoop();
  };

  /**
   * Starts the sprite animation loop (visuals only).
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.startMainAnimationLoop = function () {
    this._animationIntervalId = setInterval(() => {
      this.updateAnimation();
    }, 100);
  };

  /**
   * Updates the animation depending on current state.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.updateAnimation = function () {
    if (this.deathPlaying) {
      this.playDeathOnce();
      return;
    }

    if (this.hurtPlaying) {
      this.playHurtOnce();
      return;
    }

    if (this.attacking) {
      this.playAttackOnce();
      return;
    }

    this.updateIdleOrWalkAnimation();
  };

  /**
   * Plays either the walking or alert animation depending on movement state.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.updateIdleOrWalkAnimation = function () {
    if (this.isMoving) {
      this.playAnimation(this.IMAGES_WALKING);
      return;
    }

    this.playAnimation(this.IMAGES_ALERT);
  };

  /**
   * Starts an attack if the cooldown has elapsed.
   *
   * @this {Endboss}
   * @returns {boolean} True if the attack was started.
   */
  Endboss.prototype.startAttack = function () {
    const now = performance.now();
    if (now - this.lastAttackStartedAt < this.attackCooldown) return false;

    this.beginAttack(now);
    return true;
  };

  /**
   * Initializes attack state and plays the attack sound.
   *
   * @this {Endboss}
   * @param {number} now - Current timestamp in ms.
   * @returns {void}
   */
  Endboss.prototype.beginAttack = function (now) {
    this.lastAttackStartedAt = now;
    this.attacking = true;
    this.attackFrameIndex = 0;
    this.currentAttackFrame = 0;
    this.isMoving = false;

    this.otherDirection = true;
    this.img = this.imageCache[this.IMAGES_ATTACK[0]];
    this.playAttackSound();
  };

  /**
   * Plays the hurt animation sequence once.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.playHurtOnce = function () {
    this.y = this.baseY + this.hurtYOffset;

    if (this.hurtFrameIndex >= this.IMAGES_HURT.length) {
      this.resetHurtState();
      return;
    }

    this.img = this.imageCache[this.IMAGES_HURT[this.hurtFrameIndex++]];
  };

  /**
   * Resets hurt state back to normal.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.resetHurtState = function () {
    this.hurtPlaying = false;
    this.hurtFrameIndex = 0;
    this.y = this.baseY;
  };

  /**
   * Plays the death animation sequence once and freezes on the last frame.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.playDeathOnce = function () {
    this.y = this.baseY + this.deadYOffset;

    if (this.deathFrameIndex >= this.IMAGES_DEAD.length) {
      const lastIndex = this.IMAGES_DEAD.length - 1;
      this.img = this.imageCache[this.IMAGES_DEAD[lastIndex]];
      return;
    }

    this.img = this.imageCache[this.IMAGES_DEAD[this.deathFrameIndex++]];
  };

  /**
   * Plays the attack animation once and updates the attack hitbox.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.playAttackOnce = function () {
    const frame = this.attackFrameIndex;

    if (frame >= this.IMAGES_ATTACK.length) {
      this.resetAttackState();
      return;
    }

    this.updateAttackFrame(frame);
    this.updateAttackHitbox();
  };

  /**
   * Resets attack state after the animation ends.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.resetAttackState = function () {
    this.attackFrameIndex = 0;
    this.currentAttackFrame = 0;
    this.attacking = false;
  };

  /**
   * Updates the current attack frame image and advances frame counters.
   *
   * @this {Endboss}
   * @param {number} frame - Current frame index.
   * @returns {void}
   */
  Endboss.prototype.updateAttackFrame = function (frame) {
    const path = this.IMAGES_ATTACK[frame];
    this.img = this.imageCache[path];

    this.currentAttackFrame = frame;
    this.attackFrameIndex++;
  };

  /**
   * Positions the attack hitbox relative to the boss.
   *
   * @this {Endboss}
   * @returns {void}
   */
  Endboss.prototype.updateAttackHitbox = function () {
    this.attackHitbox.x = this.x - 60;
    this.attackHitbox.y = this.y + 40;
  };
})();
