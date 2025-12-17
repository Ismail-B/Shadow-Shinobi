/**
 * Orc movement, animation loops and visibility helpers.
 * Requires Orc class to be defined.
 */
(function () {
  /**
   * Returns whether the orc is on screen and currently chasing.
   * @returns {boolean}
   */
  Orc.prototype.isVisibleAndChasing = function () {
    if (!this.isOnScreen()) return false;

    if (typeof world !== 'undefined' && world && world.character) {
      return this.x > world.character.x - 50 && !this.otherDirection;
    }
    return true;
  };

  /**
   * Returns whether the orc is inside the camera viewport.
   * @returns {boolean}
   */
  Orc.prototype.isOnScreen = function () {
    if (typeof world === 'undefined' || !world || !world.canvas) {
      return true;
    }

    const camX = world.camera_x || 0;
    const canvasWidth = world.canvas.width || 720;
    const sx = this.x + camX;

    return sx + this.width > -100 && sx < canvasWidth + 100;
  };

  /**
   * Starts the left movement loop.
   */
  Orc.prototype.startMoveLoop = function () {
    this.moveLeftInterval = setInterval(() => {
      if (this.world?.bossIntroActive) return;
      if (this.isDying) return;

      this.moveLeft();
      this.otherDirection = false;
    }, 1000 / 60);
  };

  /**
   * Starts the walking animation loop.
   */
  Orc.prototype.startAnimationLoop = function () {
    this.playAnimationInterval = setInterval(() => {
      if (this.world?.bossIntroActive) return;
      if (this.isDying) return;

      this.playAnimation(this.IMAGES_WALKING);
    }, 200);
  };
})();
