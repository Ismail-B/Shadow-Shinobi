/**
 * Orc death sequence and death animation.
 * This file patches methods onto Orc.prototype and must be loaded after
 * the Orc class definition.
 *
 * @global
 */
(function () {
  /**
   * Triggers the death sequence once.
   *
   * @this {Orc}
   * @returns {void}
   */
  Orc.prototype.die = function () {
    if (this.isDying) return;

    this.isDying = true;
    this.speed = 0;

    this.playDeathSound();
    this.stopOrcIntervals();
    this.prepareDeathSprite();
    this.startDeathAnimation();
  };

  /**
   * Stops movement and animation intervals for this orc.
   *
   * @this {Orc}
   * @returns {void}
   */
  Orc.prototype.stopOrcIntervals = function () {
    clearInterval(this.moveLeftInterval);
    clearInterval(this.playAnimationInterval);
  };

  /**
   * Adjusts sprite size/position and sets the first death frame.
   *
   * @this {Orc}
   * @returns {void}
   */
  Orc.prototype.prepareDeathSprite = function () {
    const oldWidth = this.width;
    const oldHeight = this.height;

    this.width = oldWidth * 1.4;
    this.height = oldHeight * 0.8;
    this.y += oldHeight * 0.2;

    this._deadIndex = 0;

    if (this.DEAD_IMAGES.length > 0) {
      this.img = this.imageCache[this.DEAD_IMAGES[0]];
    }
  };

  /**
   * Starts the death frame animation timer.
   *
   * @this {Orc}
   * @returns {void}
   */
  Orc.prototype.startDeathAnimation = function () {
    this._deadTimer = setInterval(() => {
      this.updateDeathFrame();
    }, this._deadFrameMs);
  };

  /**
   * Advances the death animation by one frame and disables collision on completion.
   *
   * @this {Orc}
   * @returns {void}
   */
  Orc.prototype.updateDeathFrame = function () {
    const lastIndex = this.DEAD_IMAGES.length - 1;

    if (this._deadIndex < lastIndex) {
      this._deadIndex++;
      this.img = this.imageCache[this.DEAD_IMAGES[this._deadIndex]];

      if (this._deadIndex === lastIndex) {
        this.collidable = false;
      }

      return;
    }

    clearInterval(this._deadTimer);
    this.collidable = false;
  };
})();
