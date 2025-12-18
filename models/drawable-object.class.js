/**
 * Base class for all drawable game objects.
 * Provides image loading, rendering, and optional debug drawing.
 */
class DrawableObject {
  /** @type {HTMLImageElement} */
  img;

  /** @type {Object.<string, HTMLImageElement>} */
  imageCache = {};

  /** @type {number} */
  currentImage = 0;

  /** @type {number} */
  x = 10;

  /** @type {number} */
  y = 0;

  /** @type {number} */
  height = 150;

  /** @type {number} */
  width = 100;

  /**
   * Loads a single image and assigns it to this object.
   *
   * @param {string} path - Image file path
   * @returns {void}
   */
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  /**
   * Draws the object onto the canvas.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @returns {void}
   */
  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  /**
   * Draws the visible bounding box for debugging purposes.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @returns {void}
   */
  drawFrame(ctx) {
    if (!this.shouldDrawFrame()) return;

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'red';
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.stroke();
  }

  /**
   * Draws the offset hitbox for debugging purposes.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @returns {void}
   */
  drawOffsetFrame(ctx) {
    if (!this.shouldDrawOffsetFrame()) return;

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'transparent';
    ctx.rect(
      this.x + this.offset.x,
      this.y + this.offset.y,
      this.width - this.offset.width,
      this.height - this.offset.height
    );
    ctx.stroke();
  }

  /**
   * Preloads multiple images and stores them in the image cache.
   *
   * @param {string[]} paths - Image file paths
   * @returns {void}
   */
  loadImages(paths) {
    paths.forEach((path) => {
      const img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }

  /**
   * Returns whether the main bounding box should be drawn for debugging.
   *
   * @returns {boolean}
   */
  shouldDrawFrame() {
    return (
      this instanceof Character ||
      this instanceof Orc ||
      this instanceof Endboss ||
      this instanceof Coin
    );
  }

  /**
   * Returns whether the offset hitbox should be drawn for debugging.
   *
   * @returns {boolean}
   */
  shouldDrawOffsetFrame() {
    return (
      this instanceof Character ||
      this instanceof Orc ||
      this instanceof Endboss ||
      this instanceof Coin ||
      this instanceof Kunai
    );
  }
}
