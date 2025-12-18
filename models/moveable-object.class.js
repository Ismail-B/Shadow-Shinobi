/**
 * Base class for all movable game objects.
 * Handles movement, collision detection, gravity, and damage logic.
 * @extends DrawableObject
 */
class MovableObject extends DrawableObject {
  /** @type {number} */
  speed = 0.15;

  /** @type {boolean} */
  otherDirection = false;

  /** @type {number} */
  speedY = 0;

  /** @type {number} */
  acceleration = 1;

  /** @type {number} */
  energy = 100;

  /** @type {number} */
  lastHit = 0;

  /** @type {number} */
  lastX = 0;

  /**
   * Collision offset defining the hitbox.
   * @type {{x:number, y:number, width:number, height:number}}
   */
  offset = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  /** @type {HTMLAudioElement|undefined} */
  walkingSound;

  /** @type {boolean} */
  collidable = true;

  /**
   * Returns the collision hitbox including offset adjustments.
   *
   * @returns {{
   *   left:number,
   *   top:number,
   *   right:number,
   *   bottom:number,
   *   width:number,
   *   height:number
   * }}
   */
  getHitbox() {
    const left = this.x + this.offset.x;
    const top = this.y + this.offset.y;
    const right = this.x + this.width - this.offset.width;
    const bottom = this.y + this.height - this.offset.height;

    return {
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top
    };
  }

  /**
   * Returns the object's bounding box without offsets.
   *
   * @returns {{x:number, y:number, w:number, h:number}}
   */
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height
    };
  }

  /**
   * Checks whether this object overlaps with a given rectangle.
   *
   * @param {{x:number, y:number, w:number, h:number}} rect - Rectangle to test
   * @returns {boolean}
   */
  overlapsRect(rect) {
    const a = this.getBounds();

    return (
      a.x < rect.x + rect.w &&
      a.x + a.w > rect.x &&
      a.y < rect.y + rect.h &&
      a.y + a.h > rect.y
    );
  }

  /**
   * Moves the object to the right.
   * @returns {void}
   */
  moveRight() {
    this.x += this.speed;
    this.otherDirection = false;
  }

  /**
   * Moves the object to the left.
   * @returns {void}
   */
  moveLeft() {
    this.x -= this.speed;
    this.otherDirection = true;
  }

  /**
   * Plays a sprite animation sequence.
   *
   * @param {string[]} images - Animation image paths
   * @returns {void}
   */
  playAnimation(images) {
    const i = this.currentImage % images.length;
    const path = images[i];

    this.img = this.imageCache[path];
    this.currentImage++;
  }

  /**
   * Applies basic gravity using a fixed interval.
   * @returns {void}
   */
  applyGravity() {
    setInterval(() => {
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      }
    }, 1000 / 70);
  }

  /**
   * Returns whether the object is above the ground level.
   * @returns {boolean}
   */
  isAboveGround() {
    return this.y < 200;
  }

  /**
   * Returns whether the object has not moved since the last frame.
   *
   * @returns {boolean} True if the object is stationary
   */
  isNotMoving() {
    const isStationary = this.x === this.lastX;
    this.lastX = this.x;

    return isStationary;
  }

  /**
   * Initiates an upward jump.
   * @returns {void}
   */
  jump() {
    this.speedY = 20;
  }

  /**
   * Checks collision with another movable object.
   *
   * @param {MovableObject} mo - Other object
   * @returns {boolean}
   */
  isColliding(mo) {
    return (
      this.x + this.offset.x + this.width - this.offset.width >
        mo.x + mo.offset.x &&
      this.y + this.offset.y + this.height - this.offset.height >
        mo.y + mo.offset.y &&
      this.x + this.offset.x <
        mo.x + mo.offset.x + mo.width - mo.offset.width &&
      this.y + this.offset.y <
        mo.y + mo.offset.y + mo.height - mo.offset.height
    );
  }

  /**
   * Applies damage to the object if it is not already dead or hurt.
   * @returns {void}
   */
  hit() {
    if (this.isDead()) return;
    if (this.isHurt()) return;

    this.energy -= 10;

    if (this.energy < 0) {
      this.energy = 0;
    } else {
      this.lastHit = Date.now();
    }
  }

  /**
   * Returns whether the object is considered dead.
   * @returns {boolean}
   */
  isDead() {
    return this.energy <= 20;
  }

  /**
   * Returns whether the object was hit recently.
   * @returns {boolean}
   */
  isHurt() {
    let timePassed = Date.now() - this.lastHit;
    timePassed /= 1000;

    return timePassed < 0.5;
  }
}
