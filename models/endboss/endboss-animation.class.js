/**
 * Animation + drawing + attack animation for Endboss.
 * Requires Endboss class + audio methods.
 */
(function () {
  /**
   * Zeichnet den Boss skaliert (Idle/Hurt/Dead/Attack).
   * @param {CanvasRenderingContext2D} ctx - Canvas-Kontext.
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
   * Liefert den aktuellen Skalierungsfaktor je nach State.
   * @returns {number}
   */
  Endboss.prototype.getCurrentScale = function () {
    if (this.hurtPlaying) return this.scaleHurt;
    if (this.deathPlaying) return this.scaleDead;
    if (this.attacking) return this.scaleAttack;
    return this.scaleIdle;
  };

  /**
   * Startet Animations- und AI-Schleifen.
   * @returns {void}
   */
  Endboss.prototype.animate = function () {
    this.startMainAnimationLoop();
    this.startAiLoop();
  };

  /**
   * Steuert die reinen Grafik-Animationen.
   * @returns {void}
   */
  Endboss.prototype.startMainAnimationLoop = function () {
    setInterval(() => {
      this.updateAnimation();
    }, 100);
  };

  /**
   * Aktualisiert die Animation je nach State.
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
   * Spielt Alert- oder Walk-Animation ab.
   * @returns {void}
   */
  Endboss.prototype.updateIdleOrWalkAnimation = function () {
    if (this.isMoving) {
      this.playAnimation(this.IMAGES_WALKING);
    } else {
      this.playAnimation(this.IMAGES_ALERT);
    }
  };

  /**
   * Startet einen Angriff, falls Cooldown abgelaufen ist.
   * @returns {boolean} true, wenn Angriff gestartet wurde.
   */
  Endboss.prototype.startAttack = function () {
    const now = performance.now();
    if (now - this.lastAttackStartedAt < this.attackCooldown) return false;

    this.beginAttack(now);
    return true;
  };

  /**
   * Setzt die Attack-States und spielt Sound.
   * @param {number} now - aktuelle Zeit.
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
   * Spielt einmal die Hurt-Animation ab.
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
   * Setzt Hurt-State zurück.
   * @returns {void}
   */
  Endboss.prototype.resetHurtState = function () {
    this.hurtPlaying = false;
    this.hurtFrameIndex = 0;
    this.y = this.baseY;
  };

  /**
   * Spielt einmal die Death-Animation ab.
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
   * Spielt einmal die Attack-Animation ab.
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
   * Setzt Attack-Status zurück.
   * @returns {void}
   */
  Endboss.prototype.resetAttackState = function () {
    this.attackFrameIndex = 0;
    this.currentAttackFrame = 0;
    this.attacking = false;
  };

  /**
   * Aktualisiert Bild und Frameindex der Attack-Animation.
   * @param {number} frame - aktueller Frameindex.
   * @returns {void}
   */
  Endboss.prototype.updateAttackFrame = function (frame) {
    const path = this.IMAGES_ATTACK[frame];
    this.img = this.imageCache[path];

    this.currentAttackFrame = frame;
    this.attackFrameIndex++;
  };

  /**
   * Positioniert die Angriff-Hitbox.
   * @returns {void}
   */
  Endboss.prototype.updateAttackHitbox = function () {
    this.attackHitbox.x = this.x - 60;
    this.attackHitbox.y = this.y + 40;
  };
})();
