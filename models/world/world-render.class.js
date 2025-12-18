/**
 * Adds rendering and canvas draw helpers to the World prototype.
 */
(function () {
  /**
   * Renders one full frame and schedules the next frame.
   * @returns {void}
   */
  World.prototype.draw = function () {
    this.clearCanvas();
    this.translateCamera();
    this.drawBackgroundObjects();
    this.scheduleNextFrame();
    this.drawDynamicWorld();
    this.resetCamera();
    this.drawStatusBars();
    this.finalizeCameraTransform();
  };

  /**
   * Clears the entire canvas.
   * @returns {void}
   */
  World.prototype.clearCanvas = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  /**
   * Applies the current camera translation.
   * @returns {void}
   */
  World.prototype.translateCamera = function () {
    this.ctx.translate(this.camera_x, 0);
  };

  /**
   * Draws background objects (parallax layers, static scenery).
   * @returns {void}
   */
  World.prototype.drawBackgroundObjects = function () {
    this.addObjectsToMap(this.level.backgroundObjects);
  };

  /**
   * Schedules the next render frame via requestAnimationFrame.
   * Uses a guard to prevent multiple RAF callbacks from being queued.
   *
   * @returns {void}
   */
  World.prototype.scheduleNextFrame = function () {
    if (this.gameEnded) return;
    if (this.__rafScheduled) return;

    this.__rafScheduled = true;

    this.animationFrameId = requestAnimationFrame(() => {
      this.__rafScheduled = false;
      this.draw();
    });
  };

  /**
   * Draws all dynamic entities (effects, projectiles, collectibles, enemies, player).
   * @returns {void}
   */
  World.prototype.drawDynamicWorld = function () {
    this.addObjectsToMap(this.level.fireflys);
    this.addObjectsToMap(this.throwableObjects);
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.kunais);
    this.addObjectsToMap(this.level.enemies);
    this.addToMap(this.character);
  };

  /**
   * Resets the camera translation to the default coordinate system.
   * @returns {void}
   */
  World.prototype.resetCamera = function () {
    this.ctx.translate(-this.camera_x, 0);
  };

  /**
   * Draws all status bars (HUD).
   * @returns {void}
   */
  World.prototype.drawStatusBars = function () {
    this.addToMap(this.statusBarLife);
    this.addToMap(this.statusBarCoin);
    this.addToMap(this.statusBarKunai);
    this.addToMap(this.statusBarEndboss);
  };

  /**
   * Applies a no-op translate cycle to finalize the transform state.
   * @returns {void}
   */
  World.prototype.finalizeCameraTransform = function () {
    this.ctx.translate(this.camera_x, 0);
    this.ctx.translate(-this.camera_x, 0);
  };

  /**
   * Draws a list of objects on the canvas.
   * @param {MovableObject[]} objects - Objects to draw
   * @returns {void}
   */
  World.prototype.addObjectsToMap = function (objects) {
    objects.forEach((object) => {
      this.addToMap(object);
    });
  };

  /**
   * Draws a single object, including optional horizontal flipping.
   * @param {MovableObject} mo - Object to draw
   * @returns {void}
   */
  World.prototype.addToMap = function (mo) {
    if (mo.otherDirection) {
      this.flipImage(mo);
    }

    mo.draw(this.ctx);
    mo.drawOffsetFrame(this.ctx);

    if (mo.otherDirection) {
      this.flipImageBack(mo);
    }
  };

  /**
   * Flips an object's rendering horizontally by updating the canvas transform.
   * @param {MovableObject} mo - Object to flip
   * @returns {void}
   */
  World.prototype.flipImage = function (mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  };

  /**
   * Restores the canvas transform and object position after a horizontal flip.
   * @param {MovableObject} mo - Object to restore
   * @returns {void}
   */
  World.prototype.flipImageBack = function (mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
  };
})();
