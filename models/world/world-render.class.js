(function () {
  /**
   * Draws a full frame and schedules the next one.
   */
  World.prototype.draw = function () {
    this.clearCanvas();
    this.translateCamera();
    this.drawBackgroundObjects();
    this.scheduleNextFrame();
    this.drawDynamicWorld();
    this.resetCamera();
    this.drawStatusBars();
    this.finalCameraTranslateHack();
  };

  World.prototype.clearCanvas = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  World.prototype.translateCamera = function () {
    this.ctx.translate(this.camera_x, 0);
  };

  World.prototype.drawBackgroundObjects = function () {
    this.addObjectsToMap(this.level.backgroundObjects);
  };

World.prototype.scheduleNextFrame = function () {
  if (this.gameEnded) return;
  if (this.__rafScheduled) return;
  this.__rafScheduled = true;

  this.animationFrameId = requestAnimationFrame(() => {
    this.__rafScheduled = false;
    this.draw();
  });
};


  World.prototype.drawDynamicWorld = function () {
    this.addObjectsToMap(this.level.fireflys);
    this.addObjectsToMap(this.throwableObjects);
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.kunais);
    this.addObjectsToMap(this.level.enemies);
    this.addToMap(this.character);
  };

  World.prototype.resetCamera = function () {
    this.ctx.translate(-this.camera_x, 0);
  };

  World.prototype.drawStatusBars = function () {
    this.addToMap(this.statusBarLife);
    this.addToMap(this.statusBarCoin);
    this.addToMap(this.statusBarKunai);
    this.addToMap(this.statusBarEndboss);
  };

  World.prototype.finalCameraTranslateHack = function () {
    this.ctx.translate(this.camera_x, 0);
    this.ctx.translate(-this.camera_x, 0);
  };

  /**
   * Draws a list of objects on the canvas.
   * @param {MovableObject[]} objects - Objects to draw.
   */
  World.prototype.addObjectsToMap = function (objects) {
    objects.forEach((object) => {
      this.addToMap(object);
    });
  };

  /**
   * Draws a single object, including optional horizontal flip.
   * @param {MovableObject} mo - Object to draw.
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
   * Flips an object's rendering horizontally.
   * @param {MovableObject} mo - Object to flip.
   */
  World.prototype.flipImage = function (mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  };

  /**
   * Restores the object position after horizontal flip.
   * @param {MovableObject} mo - Object to restore.
   */
  World.prototype.flipImageBack = function (mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
  };
})();
