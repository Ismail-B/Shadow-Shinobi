(function () {
  /**
   * Checks collisions between character, enemies and kunai projectiles.
   */
  World.prototype.checkCollisions = function () {
    this.checkCharacterEnemyCollisions();
    this.checkKunaiEnemyCollisions();
  };

  World.prototype.checkCharacterEnemyCollisions = function () {
    const enemies = this.level && this.level.enemies;
    if (!enemies) return;

    enemies.forEach((enemy) => {
      if (!enemy || !enemy.collidable || enemy.isDying) return;

      const colliding = this.character.isColliding(enemy);
      if (!colliding || this.character.isDead()) return;

      if (enemy.isEndboss && typeof enemy.canDamagePlayer === 'function') {
        this.handleEndbossCollision(enemy);
        return;
      }

      this.handleRegularEnemyCollision();
    });
  };

  World.prototype.handleEndbossCollision = function (enemy) {
    if (this.character.isHurt()) return;
    if (!enemy.canDamagePlayer()) return;
    this.applyCharacterHit();
  };

  World.prototype.handleRegularEnemyCollision = function () {
    if (this.character.isHurt()) return;
    this.applyCharacterHit();
  };

  World.prototype.applyCharacterHit = function () {
    this.character.hit();
    this.statusBarLife.setPercentage(this.character.energy);
  };

  World.prototype.checkKunaiEnemyCollisions = function () {
    for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
      const kunai = this.throwableObjects[i];
      if (!kunai || typeof kunai.isColliding !== 'function') continue;
      this.handleKunaiHitsEnemies(kunai, i);
    }
  };

  World.prototype.handleKunaiHitsEnemies = function (kunai, kunaiIndex) {
    const enemies = this.level && this.level.enemies;
    if (!enemies) return;

    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];

      if (!enemy || !enemy.collidable || enemy.isDying) continue;
      if (!kunai.isColliding(enemy)) continue;

      this.applyKunaiHitOnEnemy(enemy);
      this.throwableObjects.splice(kunaiIndex, 1);
      return;
    }
  };

  World.prototype.applyKunaiHitOnEnemy = function (enemy) {
    if (enemy.isEndboss && typeof enemy.hit === 'function') {
      enemy.hit(15);
      this.statusBarEndboss.setPercentage(enemy.energy);
      return;
    }

    if (typeof enemy.die === 'function') {
      enemy.die();
    }
  };

  /**
   * Tries to throw a kunai if all conditions are met.
   */
  World.prototype.tryThrowKunai = function () {
    const now = performance.now();

    if (this.bossIntroActive) return;
    if (this.character.isDead()) return;
    if (now < this.nextThrowAt) return;
    if (this.kunaiAmmo <= 0) return;
    if (this.character.isAttacking) return;

    const started = this.character.tryStartKunaiThrow();
    if (!started) return;
  };

  /**
   * Called by the character when the kunai actually gets thrown.
   */
  World.prototype.onCharacterKunaiRelease = function () {
    if (this.kunaiAmmo <= 0) return;

    this.throwKunai();
    this.kunaiAmmo -= 1;
    this.updateKunaiBarFromAmmo();
    this.nextThrowAt = performance.now() + this.throwCooldownMs;
  };

  World.prototype.throwKunai = function () {
    const kunaiY = this.character.y + 60;
    const throwLeft = !!this.character.otherDirection;

    const kunai = new ThrowableObject(this.character.x, kunaiY, throwLeft);
    this.throwableObjects.push(kunai);
  };

  World.prototype.updateKunaiBarFromAmmo = function () {
    const segments = Math.ceil(this.kunaiAmmo / this.kunaiPerSegment);
    const clamped = Math.min(this.maxKunaiSegments, Math.max(0, segments));
    const percentage = (clamped / this.maxKunaiSegments) * 100;
    this.statusBarKunai.setPercentage(percentage);
  };

  /**
   * Checks collectible pickups (coins + kunai collectibles).
   */
  World.prototype.checkCollectibles = function () {
    this.collectCoins();
    this.collectKunaiCoins();
  };

  World.prototype.collectCoins = function () {
    for (let i = this.level.coins.length - 1; i >= 0; i--) {
      const coin = this.level.coins[i];
      if (this.character.isColliding(coin)) {
        this.level.coins.splice(i, 1);

        this.playCoinCollectSound();

        this.ninjaCoinsCollected++;
        const percentage = Math.min(100, this.ninjaCoinsCollected * 20);
        this.statusBarCoin.setPercentage(percentage);
      }
    }
  };

  World.prototype.collectKunaiCoins = function () {
    for (let i = this.level.kunais.length - 1; i >= 0; i--) {
      const kunaiCoin = this.level.kunais[i];
      if (this.character.isColliding(kunaiCoin)) {
        this.level.kunais.splice(i, 1);

        this.playCoinCollectSound();

        this.kunaiCoinsCollected++;
        this.kunaiAmmo += this.kunaiPerSegment;

        const maxAmmo = this.maxKunaiSegments * this.kunaiPerSegment;
        if (this.kunaiAmmo > maxAmmo) {
          this.kunaiAmmo = maxAmmo;
        }

        this.updateKunaiBarFromAmmo();
      }
    }
  };

  /**
   * Updates bobbing animation of coins and kunai collectibles.
   */
  World.prototype.updateCollectibleBobbing = function () {
    const timeSeconds = performance.now() / 1000;

    this.level.coins.forEach((coin) => {
      if (coin && typeof coin.updateBobbing === 'function') {
        coin.updateBobbing(timeSeconds);
      }
    });

    this.level.kunais.forEach((kunaiCoin) => {
      if (kunaiCoin && typeof kunaiCoin.updateBobbing === 'function') {
        kunaiCoin.updateBobbing(timeSeconds);
      }
    });
  };

  /**
   * Checks if the endboss should be spawned and spawns it if needed.
   */
  World.prototype.checkForEndboss = function () {
    if (!this.shouldSpawnEndboss()) return;

    const endboss = new Endboss();
    endboss.world = this;
    endboss.isEndboss = true;

    this.level.enemies.push(endboss);
    this.level.endbossLoaded = true;
    this.level.endboss = endboss;

    this.statusBarEndboss.setPercentage(endboss.energy);
  };

  /**
   * Conditions for loading/spawning the endboss.
   * @returns {boolean}
   */
  World.prototype.shouldSpawnEndboss = function () {
    if (this.character.x <= 3500) return false;
    if (!this.level || this.level.endbossLoaded) return false;
    return true;
  };
})();
