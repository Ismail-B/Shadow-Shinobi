/**
 * Combat + boss-block movement for Character.
 * Requires Character + audio methods to be loaded.
 */
(function () {
  /* =========================================================
     >>> HORIZONTALBEWEGUNG MIT BOSS-BLOCK <<<
     ========================================================= */

  /**
   * Prüft, ob der Charakter bei testX mit dem Endboss kollidiert.
   * @param {number} testX - Testposition auf der X-Achse.
   * @returns {boolean} true, wenn eine Kollision mit dem Endboss vorliegt.
   */
  Character.prototype.collidesWithEndbossAtX = function (testX) {
    if (!this.world?.level?.enemies) return false;

    const enemies = this.world.level.enemies;
    const oldX = this.x;
    this.x = testX;

    const hit = enemies.some(
      (enemy) => enemy && enemy.isEndboss && enemy.collidable && this.isColliding(enemy)
    );

    this.x = oldX;
    return hit;
  };

  /**
   * Bewegt den Charakter nach rechts und stoppt vor dem Endboss.
   * @returns {void}
   */
  Character.prototype.moveRight = function () {
    const oldX = this.x;
    this.x = this.findLastFreeXToRight(oldX);
    this.otherDirection = false;
  };

  /**
   * Bestimmt die letzte freie X-Position nach rechts.
   * @param {number} startX - Ausgangsposition.
   * @returns {number} Letzte freie X-Position.
   */
  Character.prototype.findLastFreeXToRight = function (startX) {
    let lastFreeX = startX;

    for (let s = 1; s <= this.speed; s++) {
      const testX = startX + s;
      if (this.collidesWithEndbossAtX(testX)) break;
      lastFreeX = testX;
    }

    return lastFreeX;
  };

  /**
   * Bewegt den Charakter nach links.
   * @returns {void}
   */
  Character.prototype.moveLeft = function () {
    this.otherDirection = true;
    this.x -= this.speed;
  };

  /* ===================== ANGRIFFS-LOGIK ===================== */

  /**
   * Startet einen Nahkampfangriff (Taste B), falls möglich.
   * @returns {void}
   */
  Character.prototype.tryStartAttack = function () {
    const now = performance.now();
    if (this.isAttackBlocked(now)) return;

    this.isAttacking = true;
    this.attackType = 'melee';
    this.attackFrameIndex = 0;
    this.attackFrameMs = 60;
    this._lastAttackTick = now;
    this.lastAttackAt = now;

    this._hasDealtDamageThisAttack = false;
    this.img = this.imageCache[this.IMAGES_ATTACK[0]];
  };

  /**
   * Prüft, ob ein Angriff aktuell blockiert ist.
   * @param {number} now - Aktuelle Zeit in ms.
   * @returns {boolean} true, wenn Angriff blockiert ist.
   */
  Character.prototype.isAttackBlocked = function (now) {
    if (this.world && (this.world.gameEnded || this.world.bossIntroActive)) return true;
    if (this.isDead() || this.isAttacking) return true;
    return now - this.lastAttackAt < this.attackCooldownMs;
  };

  /**
   * Startet einen Kunai-Wurf mit Attack-Animation.
   * Nur möglich, wenn Charakter nach rechts schaut.
   * @returns {boolean}
   */
  Character.prototype.tryStartKunaiThrow = function () {
    const now = performance.now();

    if (this.world && (this.world.gameEnded || this.world.bossIntroActive)) return false;
    if (!this.world || this.world.kunaiAmmo <= 0) return false;
    if (this.otherDirection === true) return false;
    if (this.isDead() || this.isAttacking) return false;

    this.isAttacking = true;
    this.attackType = 'kunai';
    this.attackFrameIndex = 0;
    this.attackFrameMs = 60;
    this._lastAttackTick = now;
    this._hasDealtDamageThisAttack = false;

    this.img = this.imageCache[this.IMAGES_ATTACK[0]];
    return true;
  };

  /**
   * Prüft, ob Kunai-Wurf aktuell blockiert ist.
   * @returns {boolean} true, wenn Kunai-Wurf blockiert ist.
   */
  Character.prototype.isKunaiThrowBlocked = function () {
    if (this.world && (this.world.gameEnded || this.world.bossIntroActive)) return true;
    if (!this.world || this.world.kunaiAmmo <= 0) return true;
    return this.isDead() || this.isAttacking;
  };

  /**
   * Aktualisiert die aktuelle Angriffs-Animation.
   * @returns {void}
   */
  Character.prototype.updateAttack = function () {
    if (!this.isAttacking) return;

    const now = performance.now();
    if (!this.isNextAttackFrameDue(now)) return;

    this.attackFrameIndex++;
    if (this.isAttackFinished()) {
      this.resetAttackState();
      return;
    }

    this.updateAttackFrameImage();
    this.handleAttackEffects();
  };

  /**
   * Prüft, ob das nächste Angriffs-Frame fällig ist.
   * @param {number} now - Aktuelle Zeit in ms.
   * @returns {boolean} true, wenn das nächste Frame angezeigt werden soll.
   */
  Character.prototype.isNextAttackFrameDue = function (now) {
    if (now - this._lastAttackTick < this.attackFrameMs) return false;
    this._lastAttackTick = now;
    return true;
  };

  /**
   * Prüft, ob die Angriffs-Animation zu Ende ist.
   * @returns {boolean} true, wenn Angriff fertig ist.
   */
  Character.prototype.isAttackFinished = function () {
    return this.attackFrameIndex >= this.IMAGES_ATTACK.length;
  };

  /**
   * Setzt den Angriffsstatus nach Ende der Animation zurück.
   * @returns {void}
   */
  Character.prototype.resetAttackState = function () {
    this.isAttacking = false;
    this.attackType = null;
    this._hitSoundPlayed = false;
    this._hasDealtDamageThisAttack = false;
  };

  /**
   * Aktualisiert das aktuell angezeigte Angriffsbild.
   * @returns {void}
   */
  Character.prototype.updateAttackFrameImage = function () {
    const key = this.IMAGES_ATTACK[this.attackFrameIndex];
    this.img = this.imageCache[key];
  };

  /**
   * Führt Effekte für Nahkampf oder Kunai beim passenden Frame aus.
   * @returns {void}
   */
  Character.prototype.handleAttackEffects = function () {
    if (this.attackType === 'melee') this.handleMeleeAttackFrame();
    if (this.attackType === 'kunai') this.handleKunaiAttackFrame();
  };

  /**
   * Behandelt das Trefffenster beim Nahkampf.
   * @returns {void}
   */
  Character.prototype.handleMeleeAttackFrame = function () {
    if (this.attackFrameIndex !== 2 && this.attackFrameIndex !== 3) return;
    this.applyMeleeHit();
    this.playMeleeHitSoundOnce();
  };

  /**
   * Spielt den Nahkampf-Sound genau einmal pro Angriff.
   * @returns {void}
   */
  Character.prototype.playMeleeHitSoundOnce = function () {
    if (this._hitSoundPlayed) return;
    this.playHitSound();
    this._hitSoundPlayed = true;
  };

  /**
   * Behandelt das Wurf-Frame beim Kunai-Angriff.
   * @returns {void}
   */
  Character.prototype.handleKunaiAttackFrame = function () {
    if (this.attackFrameIndex !== 3) return;

    if (this.world && typeof this.world.onCharacterKunaiRelease === 'function') {
      this.world.onCharacterKunaiRelease();
    }

    this.playKunaiThrowSound();
  };

  /**
   * Nahkampftreffer auf Gegner (Orcs & Endboss).
   * Pro Attacke nur ein getroffener Gegner.
   * @returns {void}
   */
  Character.prototype.applyMeleeHit = function () {
    if (!this.world?.level?.enemies) return;
    if (this._hasDealtDamageThisAttack) return;

    const hitbox = this.createMeleeHitbox();
    const enemies = this.world.level.enemies;

    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (this.isInvalidMeleeTarget(enemy, hitbox)) continue;

      this.applyMeleeDamageToEnemy(enemy);
      this._hasDealtDamageThisAttack = true;
      break;
    }
  };

  /**
   * Erzeugt die Nahkampf-Hitbox vor dem Charakter.
   * @returns {{x:number,y:number,w:number,h:number}} Hitbox-Objekt.
   */
  Character.prototype.createMeleeHitbox = function () {
    const range = 0;
    const height = this.height * 0.6;
    const y = this.y + this.height * 0.2;
    const facingRight = !this.otherDirection;
    const x = facingRight ? this.x + this.width : this.x - range;
    return { x, y, w: range, h: height };
  };

  /**
   * Prüft, ob ein Gegner für Nahkampftreffer ungeeignet ist.
   * @param {Object} enemy - Der zu prüfende Gegner.
   * @param {Object} hitbox - Hitbox des Angriffs.
   * @returns {boolean} true, wenn kein gültiges Ziel.
   */
  Character.prototype.isInvalidMeleeTarget = function (enemy, hitbox) {
    if (!enemy || !enemy.collidable || enemy.isDying) return true;
    if (typeof enemy.overlapsRect !== 'function') return true;
    return !enemy.overlapsRect(hitbox);
  };

  /**
   * Wendet Nahkampfschaden auf einen Gegner an.
   * @param {Object} enemy - Getroffener Gegner.
   * @returns {void}
   */
  Character.prototype.applyMeleeDamageToEnemy = function (enemy) {
    if (enemy.isEndboss && typeof enemy.hit === 'function') {
      enemy.hit();
      return;
    }

    if (!enemy.isEndboss && typeof enemy.die === 'function') {
      enemy.die();
    }
  };
})();
