class World {
  character = new Character();
  level = createLevel1();   // <-- jedes Mal frisches Level
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

  // Boss-Intro / Alert-Sound
  bossIntroSound = new Audio('audio/endboss-alert.mp3');
  bossIntroActive = false;

  // wird von game.js gesetzt, u.a. für Endboss-Sounds
  isMuted = false;

  ninjaCoinsCollected = 0;
  kunaiCoinsCollected = 0;

  // Kunai-Logik
  kunaiAmmo = 0;
  maxKunaiSegments = 5;
  kunaiPerSegment = 2;
  nextThrowAt = 0;
  throwCooldownMs = 150;

  // Render-Loop
  animationFrameId = null;

  // Game-Status
  gameEnded = false;

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.keyboard = keyboard;

    // wenn der Alert-Sound fertig ist → Intro beenden
    this.bossIntroSound.addEventListener('ended', () => {
      this.stopBossIntro();
    });

    this.draw();
    this.setWorld();
    this.run();

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyV' && !e.repeat) {
        this.tryThrowKunai();
      }
      if (e.code === 'KeyB' && !e.repeat) {
        this.character.tryStartAttack();
      }
    });
  }

  setWorld() {
    this.background_sound.play();
    this.background_sound.volume = 0.4;
    this.music.play();
    this.music.volume = 0.4;

    this.character.world = this;

    // Enemies (Orcs / Endboss) bekommen ebenfalls die World-Referenz
    if (this.level && this.level.enemies) {
      this.level.enemies.forEach((e) => {
        if (e) e.world = this;
      });
    }
  }

  run() {
    setInterval(() => {
      if (this.gameEnded) return;

      // Während Boss-Intro KEINE Kollisions-/Spiel-Logik
      if (this.bossIntroActive) return;

      this.checkCollisions();
      this.checkCollectibles();
      this.checkForEndboss();

      // Charakter tot?
      if (this.character && typeof this.character.isDead === 'function' && this.character.isDead()) {
        this.gameEnded = true;
        this.onGameOver(false);
        return;
      }

      // Endboss tot?
      if (
        this.level &&
        this.level.endboss &&
        typeof this.level.endboss.isDead === 'function' &&
        this.level.endboss.isDead()
      ) {
        this.gameEnded = true;
        this.onGameOver(true);
        return;
      }

    }, 1000 / 60);
  }

  /** Wird vom Endboss aufgerufen, wenn der Spieler ihn erstmals „sieht“ */
  startBossIntro() {
    if (this.bossIntroActive || this.gameEnded) return;

    this.bossIntroActive = true;

    // Wenn gemutet → kein Sound, aber kurzes „stummes“ Intro
    if (this.isMuted) {
      this.bossIntroSound.pause();
      this.bossIntroSound.currentTime = 0;
      setTimeout(() => this.stopBossIntro(), 2000);
      return;
    }

    // Sound einmalig abspielen
    try {
      this.bossIntroSound.currentTime = 0;
      this.bossIntroSound.play();
    } catch (e) {
      console.warn('bossIntroSound konnte nicht abgespielt werden:', e);
      // Falls der Sound nicht spielt, Intro trotzdem nach 2s beenden
      setTimeout(() => this.stopBossIntro(), 2000);
    }
  }

  /** Wird automatisch nach Sound-Ende aufgerufen (oder von Fallback oben) */
  stopBossIntro() {
    this.bossIntroActive = false;
  }

  onGameOver(playerWon) {
    this.background_sound.pause();
    if (this.character && this.character.walking_sound) {
      this.character.walking_sound.pause();
    }
    this.bossIntroSound.pause();

    if (playerWon) {
      this.win_sound.currentTime = 0;
      this.win_sound.volume = 0.8;
      this.win_sound.play();
    }

    setTimeout(() => {
      const id = playerWon ? 'win-overlay' : 'game-over-overlay';
      const overlay = document.getElementById(id);
      if (overlay) {
        overlay.style.display = 'flex';
      }
    }, 1000);
  }

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

  checkCollisions() {
    const enemies = this.level.enemies;

    enemies.forEach((enemy) => {
      if (!enemy || !enemy.collidable || enemy.isDying) return;

      const colliding = this.character.isColliding(enemy);

      // Schaden vom Gegner auf den Charakter
      if (colliding && !this.character.isDead()) {
        if (enemy.isEndboss && typeof enemy.canDamagePlayer === 'function') {
          if (!this.character.isHurt() && enemy.canDamagePlayer()) {
            this.character.hit();
            this.statusBarLife.setPercentage(this.character.energy);
          }
        } else {
          if (!this.character.isHurt()) {
            this.character.hit();
            this.statusBarLife.setPercentage(this.character.energy);
          }
        }
      }
    });

    // Kunai vs Enemies
    for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
      const kunai = this.throwableObjects[i];
      if (!kunai || typeof kunai.isColliding !== 'function') continue;

      for (let j = this.level.enemies.length - 1; j >= 0; j--) {
        const enemy = this.level.enemies[j];
        if (!enemy || !enemy.collidable || enemy.isDying) continue;

        if (kunai.isColliding(enemy)) {
          if (enemy.isEndboss && typeof enemy.hit === 'function') {
            enemy.hit(15);
            this.statusBarEndboss.setPercentage(enemy.energy);
          } else if (typeof enemy.die === 'function') {
            enemy.die();
          }
          this.throwableObjects.splice(i, 1);
          break;
        }
      }
    }
  }

  // Kunai-Logik
  tryThrowKunai() {
    const now = performance.now();

    if (this.bossIntroActive) return;       // während Intro nicht werfen
    if (this.character.isDead()) return;
    if (now < this.nextThrowAt) return;
    if (this.kunaiAmmo <= 0) return;
    if (this.character.isAttacking) return;

    const started = this.character.tryStartKunaiThrow();
    if (!started) return;
  }

  onCharacterKunaiRelease() {
    if (this.kunaiAmmo <= 0) return;

    this.throwKunai();

    this.kunaiAmmo -= 1;
    this.updateKunaiBarFromAmmo();
    this.nextThrowAt = performance.now() + this.throwCooldownMs;
  }

  throwKunai() {
    const kunai = new ThrowableObject(this.character.x, this.character.y + 60);
    this.throwableObjects.push(kunai);
  }

  updateKunaiBarFromAmmo() {
    const segments = Math.ceil(this.kunaiAmmo / this.kunaiPerSegment);
    const clampedSegments = Math.min(this.maxKunaiSegments, Math.max(0, segments));
    const percentage = (clampedSegments / this.maxKunaiSegments) * 100;
    this.statusBarKunai.setPercentage(percentage);
  }

  checkForEndboss() {
    // Endboss wird geladen, wenn der Character weit genug ist
    if (this.character.x > 3500 && !this.level.endbossLoaded) {
      const endboss = new Endboss();
      endboss.world = this;
      endboss.isEndboss = true;

      this.level.enemies.push(endboss);
      this.level.endbossLoaded = true;
      this.level.endboss = endboss;

      this.statusBarEndboss.setPercentage(endboss.energy);

      console.log("Endboss wurde geladen!");
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.camera_x, 0);

    this.addObjectsToMap(this.level.backgroundObjects);

    let self = this;
    this.animationFrameId = requestAnimationFrame(function () {
      self.draw();
    });

    this.addObjectsToMap(this.level.fireflys);
    this.addObjectsToMap(this.throwableObjects);
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.kunais);
    this.addObjectsToMap(this.level.enemies);

    this.addToMap(this.character);
    this.ctx.translate(-this.camera_x, 0);

    this.addToMap(this.statusBarLife);
    this.addToMap(this.statusBarCoin);
    this.addToMap(this.statusBarKunai);
    this.addToMap(this.statusBarEndboss);
    this.ctx.translate(this.camera_x, 0);
    this.ctx.translate(-this.camera_x, 0);
  }

  addObjectsToMap(objects) {
    objects.forEach((o) => this.addToMap(o));
  }

  addToMap(mo) {
    if (mo.otherDirection) this.flipImage(mo);
    mo.draw(this.ctx);
    mo.drawOffsetFrame(this.ctx);
    if (mo.otherDirection) this.flipImageBack(mo);
  }

  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  flipImageBack(mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
  }

  checkCollectibles() {
    for (let i = this.level.coins.length - 1; i >= 0; i--) {
      const c = this.level.coins[i];
      if (this.character.isColliding(c)) {
        this.level.coins.splice(i, 1);
        this.ninjaCoinsCollected++;
        this.statusBarCoin.setPercentage(Math.min(100, this.ninjaCoinsCollected * 20));
      }
    }

    for (let i = this.level.kunais.length - 1; i >= 0; i--) {
      const kc = this.level.kunais[i];
      if (this.character.isColliding(kc)) {
        this.level.kunais.splice(i, 1);
        this.kunaiCoinsCollected++;

        this.kunaiAmmo += this.kunaiPerSegment;

        const maxAmmo = this.maxKunaiSegments * this.kunaiPerSegment;
        if (this.kunaiAmmo > maxAmmo) this.kunaiAmmo = maxAmmo;

        this.updateKunaiBarFromAmmo();
      }
    }
  }
}
