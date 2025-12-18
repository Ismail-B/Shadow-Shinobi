/**
 * Orc movement, animation loops, and visibility helpers.
 * This file patches methods onto Orc.prototype and must be loaded after
 * the Orc class definition.
 *
 * @global
 */
(function () {
  /**
   * Returns the active world reference for this orc (instance first, then global fallback).
   *
   * @this {Orc}
   * @returns {*|null}
   */
  Orc.prototype.getWorldRef = function () {
    if (this.world) return this.world;
    if (typeof world !== 'undefined' && world) return world;
    return null;
  };

  /**
   * Returns whether the orc is on screen and currently chasing (best effort).
   *
   * @this {Orc}
   * @returns {boolean}
   */
  Orc.prototype.isVisibleAndChasing = function () {
    if (!this.isOnScreen()) return false;

    const w = this.getWorldRef();
    if (w && w.character) {
      return this.x > w.character.x - 50 && !this.otherDirection;
    }

    return true;
  };

  /**
   * Returns whether the orc is inside the current camera viewport.
   * If no world/canvas is available, this defaults to true.
   *
   * @this {Orc}
   * @returns {boolean}
   */
  Orc.prototype.isOnScreen = function () {
    const w = this.getWorldRef();
    if (!w || !w.canvas) return true;

    const camX = w.camera_x || 0;
    const canvasWidth = w.canvas.width || 720;
    const screenX = this.x + camX;

    return screenX + this.width > -100 && screenX < canvasWidth + 100;
  };

  /**
   * Starts the left movement loop.
   *
   * @this {Orc}
   * @returns {void}
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
   *
   * @this {Orc}
   * @returns {void}
   */
  Orc.prototype.startAnimationLoop = function () {
    this.playAnimationInterval = setInterval(() => {
      if (this.world?.bossIntroActive) return;
      if (this.isDying) return;

      this.playAnimation(this.IMAGES_WALKING);
    }, 200);
  };
})();
