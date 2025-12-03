/**
 * Manages player, enemies, level, sounds, HUD, game loop and rendering.
 */
class World {
  character = new Character();
  level = createLevel1();

  canvas;
  ctx;
  keyboard;

  camera_x = 0;

  statusBarLife = new StatusBarLife();
  statusBarCoin = new StatusBarCoin();
  statusBarKunai = new StatusBarKunai();
  statusBarEndboss = new StatusBarEndboss();

  throwableObjects = [];

  background_sound = new Audio('audio/forest-background.mp3');
  music = new Audio('audio/music.mp3');
  win_sound = new Audio('audio/win.mp3');
  bossIntroSound = new Audio('audio/endboss-alert.mp3');

  bossIntroActive = false;
  isMuted = false;

  ninjaCoinsCollected = 0;
  kunaiCoinsCollected = 0;

  kunaiAmmo = 0;
  maxKunaiSegments = 5;
  kunaiPerSegment = 2;
  nextThrowAt = 0;
  throwCooldownMs = 150;

  animationFrameId = null;
  gameEnded = false;

  /**
   * Creates a new game world instance.
   * @param {HTMLCanvasElement} canvas - Rendering canvas.
   * @param {Keyboard} keyboard - Keyboard input instance.
   */
  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.keyboard = keyboard;

    this.registerBossIntroEndHandler();
    this.setWorld();
    this.draw();
    this.run();
    this.registerKeyListeners();
  }

  /**
   * Registers handler for when the boss intro sound ends.
   */
  registerBossIntroEndHandler() {
    this.bossIntroSound.addEventListener('ended', () => {
      this.stopBossIntro();
    });
  }

  /**
   * Registers keyboard actions (kunai throw, melee attack).
   */
  registerKeyListeners() {
    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyV' && !event.repeat) {
        this.tryThrowKunai();
      }
      if (event.code === 'KeyB' && !event.repeat) {
        this.character.tryStartAttack();
      }
    });
  }

  /**
   * Initializes sounds and world references for character and enemies.
   */
  setWorld() {
    this.playBackgroundAudio();
    this.character.world = this;
    this.setWorldOnEnemies();
  }

  /**
   * Starts background sounds.
   */
  playBackgroundAudio() {
    this.background_sound.play();
    this.background_sound.volume = 0.4;
    this.music.play();
    this.music.volume = 0.4;
  }

  /**
   * Sets world reference on all enemies.
   */
  setWorldOnEnemies() {
    const enemies = this.level && this.level.enemies;
    if (!enemies) {
      return;
    }

    enemies.forEach((enemy) => {
      if (enemy) {
        enemy.world = this;
      }
    });
  }

  /**
   * Starts the game loop (logic updates).
   */
  run() {
    const intervalMs = 1000 / 60;
    setInterval(() => {
      this.updateGameLoop();
    }, intervalMs);
  }

  /**
   * Executes one logic tick of the game loop.
   */
  updateGameLoop() {
    if (this.gameEnded || this.bossIntroActive) {
      return;
    }

    this.updateCollectibleBobbing();

    this.checkCollisions();
    this.checkCollectibles();
    this.checkForEndboss();

    if (this.isCharacterDead()) {
      this.finishGame(false);
      return;
    }

    if (this.isEndbossDead()) {
      this.finishGame(true);
    }
  }

  /**
   * Checks if the player character is dead.
   * @returns {boolean}
   */
  isCharacterDead() {
    if (!this.character || typeof this.character.isDead !== 'function') {
      return false;
    }
    return this.character.isDead();
  }

  /**
   * Checks if the endboss is dead.
   * @returns {boolean}
   */
  isEndbossDead() {
    const endboss = this.level && this.level.endboss;
    if (!endboss || typeof endboss.isDead !== 'function') {
      return false;
    }
    return endboss.isDead();
  }

  /**
   * Marks the game as finished and triggers game-over logic.
   * @param {boolean} playerWon - True if the player has won.
   */
  finishGame(playerWon) {
    this.gameEnded = true;
    this.onGameOver(playerWon);
  }

  /**
   * Starts the boss intro sequence (with or without sound).
   */
  startBossIntro() {
    if (this.bossIntroActive || this.gameEnded) {
      return;
    }

    this.bossIntroActive = true;

    if (this.isMuted) {
      this.handleMutedBossIntro();
      return;
    }

    this.playBossIntroSound();
  }

  /**
   * Handles boss intro when game is muted (no sound, just delay).
   */
  handleMutedBossIntro() {
    this.bossIntroSound.pause();
    this.bossIntroSound.currentTime = 0;
    setTimeout(() => {
      this.stopBossIntro();
    }, 2000);
  }

  /**
   * Plays the boss intro sound with error fallback.
   */
  playBossIntroSound() {
    try {
      this.bossIntroSound.currentTime = 0;
      this.bossIntroSound.play();
    } catch (error) {
      setTimeout(() => {
        this.stopBossIntro();
      }, 2000);
    }
  }

  /**
   * Stops the boss intro sequence.
   */
  stopBossIntro() {
    this.bossIntroActive = false;
  }

  /**
   * Handles game over: stops sounds and shows the appropriate overlay.
   * @param {boolean} playerWon - True if the player has won.
   */
  onGameOver(playerWon) {
    this.pauseGameOverAudio();

    if (playerWon) {
      this.playWinSound();
    }

    this.showEndOverlayWithDelay(playerWon);
  }

  /**
   * Pauses relevant game sounds on game over.
   */
  pauseGameOverAudio() {
    this.background_sound.pause();

    if (this.character && this.character.walking_sound) {
      this.character.walking_sound.pause();
    }

    this.bossIntroSound.pause();
  }

  /**
   * Plays the win sound.
   */
  playWinSound() {
    this.win_sound.currentTime = 0;
    this.win_sound.volume = 0.8;
    this.win_sound.play();
  }

  /**
   * Shows the game-over or win overlay after a short delay.
   * @param {boolean} playerWon - True if the player has won.
   */
  showEndOverlayWithDelay(playerWon) {
    const overlayId = playerWon ? 'win-overlay' : 'game-over-overlay';

    setTimeout(() => {
      const overlay = document.getElementById(overlayId);
      if (overlay) {
        overlay.style.display = 'flex';
      }
    }, 1000);
  }

  /**
   * Completely stops the game.
   */
  stop() {
    this.gameEnded = true;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.background_sound.pause();
    this.music.pause();
    this.bossIntroSound.pause();

    if (this.character && this.character.walking_sound) {
      this.character.walking_sound.pause();
    }
  }

  /**
   * Checks collisions between character, enemies and kunai projectiles.
   */
  checkCollisions() {
    this.checkCharacterEnemyCollisions();
    this.checkKunaiEnemyCollisions();
  }

  /**
   * Checks collisions between character and all enemies.
   */
  checkCharacterEnemyCollisions() {
    const enemies = this.level.enemies;
    if (!enemies) {
      return;
    }

    enemies.forEach((enemy) => {
      if (!enemy || !enemy.collidable || enemy.isDying) {
        return;
      }

      const colliding = this.character.isColliding(enemy);
      if (!colliding || this.character.isDead()) {
        return;
      }

      if (enemy.isEndboss && typeof enemy.canDamagePlayer === 'function') {
        this.handleEndbossCollision(enemy);
        return;
      }

      this.handleRegularEnemyCollision();
    });
  }

  /**
   * Handles collision with the endboss.
   * @param {Endboss} enemy - Endboss instance.
   */
  handleEndbossCollision(enemy) {
    if (this.character.isHurt()) {
      return;
    }
    if (!enemy.canDamagePlayer()) {
      return;
    }
    this.applyCharacterHit();
  }

  /**
   * Handles collision with a regular enemy.
   */
  handleRegularEnemyCollision() {
    if (this.character.isHurt()) {
      return;
    }
    this.applyCharacterHit();
  }

  /**
   * Applies damage to the character and updates the life bar.
   */
  applyCharacterHit() {
    this.character.hit();
    this.statusBarLife.setPercentage(this.character.energy);
  }

  /**
   * Checks collisions between kunai projectiles and enemies.
   */
  checkKunaiEnemyCollisions() {
    for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
      const kunai = this.throwableObjects[i];
      if (!kunai || typeof kunai.isColliding !== 'function') {
        continue;
      }
      this.handleKunaiHitsEnemies(kunai, i);
    }
  }

  /**
   * Checks kunai projectile hits against enemies.
   * @param {ThrowableObject} kunai - The current kunai.
   * @param {number} kunaiIndex - Index in the projectiles array.
   */
  handleKunaiHitsEnemies(kunai, kunaiIndex) {
    const enemies = this.level.enemies;

    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];

      if (!enemy || !enemy.collidable || enemy.isDying) {
        continue;
      }
      if (!kunai.isColliding(enemy)) {
        continue;
      }

      this.applyKunaiHitOnEnemy(enemy);
      this.throwableObjects.splice(kunaiIndex, 1);
      return;
    }
  }

  /**
   * Applies kunai hit to an enemy.
   * @param {MovableObject} enemy - Hit enemy instance.
   */
  applyKunaiHitOnEnemy(enemy) {
    if (enemy.isEndboss && typeof enemy.hit === 'function') {
      enemy.hit(15);
      this.statusBarEndboss.setPercentage(enemy.energy);
      return;
    }

    if (typeof enemy.die === 'function') {
      enemy.die();
    }
  }

  /**
   * Tries to throw a kunai if all conditions are met.
   */
  tryThrowKunai() {
    const now = performance.now();

    if (this.bossIntroActive) {
      return;
    }
    if (this.character.isDead()) {
      return;
    }
    if (now < this.nextThrowAt) {
      return;
    }
    if (this.kunaiAmmo <= 0) {
      return;
    }
    if (this.character.isAttacking) {
      return;
    }

    const started = this.character.tryStartKunaiThrow();
    if (!started) {
      return;
    }
  }

  /**
   * Called by the character when the kunai actually gets thrown.
   */
  onCharacterKunaiRelease() {
    if (this.kunaiAmmo <= 0) {
      return;
    }

    this.throwKunai();
    this.kunaiAmmo -= 1;
    this.updateKunaiBarFromAmmo();
    this.nextThrowAt = performance.now() + this.throwCooldownMs;
  }

  /**
   * Creates a kunai projectile and adds it to the world.
   */
  throwKunai() {
    const kunaiY = this.character.y + 60;
    const throwLeft = !!this.character.otherDirection;

    const kunai = new ThrowableObject(this.character.x, kunaiY, throwLeft);
    this.throwableObjects.push(kunai);
  }

  /**
   * Updates the kunai status bar based on current ammo.
   */
  updateKunaiBarFromAmmo() {
    const segments = Math.ceil(this.kunaiAmmo / this.kunaiPerSegment);
    const clamped = Math.min(this.maxKunaiSegments, Math.max(0, segments));
    const percentage = (clamped / this.maxKunaiSegments) * 100;
    this.statusBarKunai.setPercentage(percentage);
  }

  /**
   * Updates bobbing animation of coins and kunai collectibles.
   */
  updateCollectibleBobbing() {
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
  }

  /**
   * Checks if the endboss should be spawned and spawns it if needed.
   */
  checkForEndboss() {
    if (!this.shouldSpawnEndboss()) {
      return;
    }

    const endboss = new Endboss();
    endboss.world = this;
    endboss.isEndboss = true;

    this.level.enemies.push(endboss);
    this.level.endbossLoaded = true;
    this.level.endboss = endboss;

    this.statusBarEndboss.setPercentage(endboss.energy);
  }

  /**
   * Conditions for loading/spawning the endboss.
   * @returns {boolean}
   */
  shouldSpawnEndboss() {
    if (this.character.x <= 3500) {
      return false;
    }
    if (!this.level || this.level.endbossLoaded) {
      return false;
    }
    return true;
  }

  /**
   * Draws a full frame and schedules the next one.
   */
  draw() {
    this.clearCanvas();
    this.translateCamera();
    this.drawBackgroundObjects();
    this.scheduleNextFrame();
    this.drawDynamicWorld();
    this.resetCamera();
    this.drawStatusBars();
    this.finalCameraTranslateHack();
  }

  /**
   * Clears the drawing area.
   */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Applies the camera translation.
   */
  translateCamera() {
    this.ctx.translate(this.camera_x, 0);
  }

  /**
   * Draws background objects.
   */
  drawBackgroundObjects() {
    this.addObjectsToMap(this.level.backgroundObjects);
  }

  /**
   * Schedules the next draw call via requestAnimationFrame.
   */
  scheduleNextFrame() {
    this.animationFrameId = requestAnimationFrame(() => {
      this.draw();
    });
  }

  /**
   * Draws all dynamic world objects and the character.
   */
  drawDynamicWorld() {
    this.addObjectsToMap(this.level.fireflys);
    this.addObjectsToMap(this.throwableObjects);
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.kunais);
    this.addObjectsToMap(this.level.enemies);
    this.addToMap(this.character);
  }

  /**
   * Resets the camera translation.
   */
  resetCamera() {
    this.ctx.translate(-this.camera_x, 0);
  }

  /**
   * Draws the HUD status bars.
   */
  drawStatusBars() {
    this.addToMap(this.statusBarLife);
    this.addToMap(this.statusBarCoin);
    this.addToMap(this.statusBarKunai);
    this.addToMap(this.statusBarEndboss);
  }

  /**
   * Keeps transform behavior aligned with the original implementation.
   */
  finalCameraTranslateHack() {
    this.ctx.translate(this.camera_x, 0);
    this.ctx.translate(-this.camera_x, 0);
  }

  /**
   * Draws a list of objects on the canvas.
   * @param {MovableObject[]} objects - Objects to draw.
   */
  addObjectsToMap(objects) {
    objects.forEach((object) => {
      this.addToMap(object);
    });
  }

  /**
   * Draws a single object, including optional horizontal flip.
   * @param {MovableObject} mo - Object to draw.
   */
  addToMap(mo) {
    if (mo.otherDirection) {
      this.flipImage(mo);
    }
    mo.draw(this.ctx);
    mo.drawOffsetFrame(this.ctx);
    if (mo.otherDirection) {
      this.flipImageBack(mo);
    }
  }

  /**
   * Flips an object's rendering horizontally.
   * @param {MovableObject} mo - Object to flip.
   */
  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  /**
   * Restores the object position after horizontal flip.
   * @param {MovableObject} mo - Object to restore.
   */
  flipImageBack(mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
  }

  /**
   * Checks collectible pickups (coins + kunai collectibles).
   */
  checkCollectibles() {
    this.collectCoins();
    this.collectKunaiCoins();
  }

  /**
   * Handles picking up all coins.
   */
  collectCoins() {
    for (let i = this.level.coins.length - 1; i >= 0; i--) {
      const coin = this.level.coins[i];
      if (this.character.isColliding(coin)) {
        this.level.coins.splice(i, 1);
        this.ninjaCoinsCollected++;
        const percentage = Math.min(100, this.ninjaCoinsCollected * 20);
        this.statusBarCoin.setPercentage(percentage);
      }
    }
  }

  /**
   * Handles picking up all kunai collectibles.
   */
  collectKunaiCoins() {
    for (let i = this.level.kunais.length - 1; i >= 0; i--) {
      const kunaiCoin = this.level.kunais[i];
      if (this.character.isColliding(kunaiCoin)) {
        this.level.kunais.splice(i, 1);
        this.kunaiCoinsCollected++;
        this.kunaiAmmo += this.kunaiPerSegment;

        const maxAmmo = this.maxKunaiSegments * this.kunaiPerSegment;
        if (this.kunaiAmmo > maxAmmo) {
          this.kunaiAmmo = maxAmmo;
        }

        this.updateKunaiBarFromAmmo();
      }
    }
  }
}
