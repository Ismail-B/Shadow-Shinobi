/**
 * Orc death sequence and death animation.
 * Requires Orc class to be defined.
 */
(function () {
  /**
   * Triggers the death sequence once.
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
   * Stops movement and animation intervals.
   */
  Orc.prototype.stopOrcIntervals = function () {
    clearInterval(this.moveLeftInterval);
    clearInterval(this.playAnimationInterval);
  };

  /**
   * Scales the sprite and sets the first death frame.
   */
  Orc.prototype.prepareDeathSprite = function () {
    const ow = this.width;
    const oh = this.height;

    this.width = ow * 1.4;
    this.height = oh * 0.8;
    this.y += oh * 0.2;

    this._deadIndex = 0;
    if (this.DEAD_IMAGES.length) {
      this.img = this.imageCache[this.DEAD_IMAGES[0]];
    }
  };

  /**
   * Starts the death frame animation timer.
   */
  Orc.prototype.startDeathAnimation = function () {
    this._deadTimer = setInterval(() => {
      this.updateDeathFrame();
    }, this._deadFrameMs);
  };

  /**
   * Advances one death frame.
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
