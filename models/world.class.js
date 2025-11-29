/**
 * Verwaltet Spielfigur, Gegner, Level, Sounds, HUD, Game-Loop und Rendering.
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
   * Erstellt eine neue Spielwelt.
   * @param {HTMLCanvasElement} canvas - Zeichenfläche.
   * @param {Keyboard} keyboard - Eingabesteuerung.
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
   * Verknüpft das Ende des Boss-Intro-Sounds mit stopBossIntro.
   */
  registerBossIntroEndHandler() {
    this.bossIntroSound.addEventListener('ended', () => {
      this.stopBossIntro();
    });
  }

  /**
   * Registriert Tastatur-Aktionen (Kunai-Wurf, Nahkampf).
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
   * Initialisiert Sounds und World-Referenzen für Charakter und Gegner.
   */
  setWorld() {
    this.playBackgroundAudio();
    this.character.world = this;
    this.setWorldOnEnemies();
  }

  /**
   * Startet Hintergrundsounds.
   */
  playBackgroundAudio() {
    this.background_sound.play();
    this.background_sound.volume = 0.4;
    this.music.play();
    this.music.volume = 0.4;
  }

  /**
   * Setzt die World-Referenz auf alle Gegner.
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
   * Startet den Game-Loop (Logik-Updates).
   */
  run() {
    const intervalMs = 1000 / 60;
    setInterval(() => {
      this.updateGameLoop();
    }, intervalMs);
  }

  /**
   * Führt einen Logik-Tick aus.
   */
  updateGameLoop() {
    if (this.gameEnded || this.bossIntroActive) {
      return;
    }

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
   * Prüft, ob der Charakter tot ist.
   * @returns {boolean}
   */
  isCharacterDead() {
    if (!this.character || typeof this.character.isDead !== 'function') {
      return false;
    }
    return this.character.isDead();
  }

  /**
   * Prüft, ob der Endboss tot ist.
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
   * Markiert das Spiel als beendet und triggert Game-Over-Logik.
   * @param {boolean} playerWon - True, wenn der Spieler gewonnen hat.
   */
  finishGame(playerWon) {
    this.gameEnded = true;
    this.onGameOver(playerWon);
  }

  /**
   * Startet das Boss-Intro (mit oder ohne Sound).
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
   * Boss-Intro ohne Sound, nur kurze Verzögerung.
   */
  handleMutedBossIntro() {
    this.bossIntroSound.pause();
    this.bossIntroSound.currentTime = 0;
    setTimeout(() => {
      this.stopBossIntro();
    }, 2000);
  }

  /**
   * Spielt den Boss-Intro-Sound mit Fallback.
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
   * Beendet das Boss-Intro.
   */
  stopBossIntro() {
    this.bossIntroActive = false;
  }

  /**
   * Reagiert auf Spielende: Sounds stoppen, Overlay anzeigen.
   * @param {boolean} playerWon - True, wenn der Spieler gewonnen hat.
   */
  onGameOver(playerWon) {
    this.pauseGameOverAudio();

    if (playerWon) {
      this.playWinSound();
    }

    this.showEndOverlayWithDelay(playerWon);
  }

  /**
   * Pausiert relevante Sounds beim Game-Over.
   */
  pauseGameOverAudio() {
    this.background_sound.pause();

    if (this.character && this.character.walking_sound) {
      this.character.walking_sound.pause();
    }

    this.bossIntroSound.pause();
  }

  /**
   * Spielt den Gewinn-Sound ab.
   */
  playWinSound() {
    this.win_sound.currentTime = 0;
    this.win_sound.volume = 0.8;
    this.win_sound.play();
  }

  /**
   * Zeigt das passende Overlay mit Verzögerung an.
   * @param {boolean} playerWon - True, wenn der Spieler gewonnen hat.
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
   * Stoppt das Spiel komplett.
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
   * Prüft Kollisionen zwischen Charakter, Gegnern und Kunai.
   */
  checkCollisions() {
    this.checkCharacterEnemyCollisions();
    this.checkKunaiEnemyCollisions();
  }

  /**
   * Prüft Kollisionen zwischen Charakter und allen Gegnern.
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
   * Behandelt Kollision mit Endboss.
   * @param {Endboss} enemy - Endboss-Instanz.
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
   * Behandelt Kollision mit Normalgegner.
   */
  handleRegularEnemyCollision() {
    if (this.character.isHurt()) {
      return;
    }
    this.applyCharacterHit();
  }

  /**
   * Trägt Schaden auf Charakter ein und aktualisiert Lebensleiste.
   */
  applyCharacterHit() {
    this.character.hit();
    this.statusBarLife.setPercentage(this.character.energy);
  }

  /**
   * Prüft Kollisionen zwischen Kunai und Gegnern.
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
   * Prüft Kunai-Treffer gegen Gegner.
   * @param {ThrowableObject} kunai - Aktueller Kunai.
   * @param {number} kunaiIndex - Index im Array.
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
   * Wendet Kunai-Treffer auf Gegner an.
   * @param {MovableObject} enemy - Getroffener Gegner.
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
   * Versucht, einen Kunai zu werfen.
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
   * Wird vom Charakter aufgerufen, wenn der Kunai wirklich fliegt.
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
   * Erzeugt ein Kunai-Projektil und fügt es der Welt hinzu.
   */
  throwKunai() {
    const kunaiY = this.character.y + 60;
    const kunai = new ThrowableObject(this.character.x, kunaiY);
    this.throwableObjects.push(kunai);
  }

  /**
   * Aktualisiert die Kunai-Leiste nach aktueller Munition.
   */
  updateKunaiBarFromAmmo() {
    const segments = Math.ceil(this.kunaiAmmo / this.kunaiPerSegment);
    const clamped = Math.min(this.maxKunaiSegments, Math.max(0, segments));
    const percentage = (clamped / this.maxKunaiSegments) * 100;
    this.statusBarKunai.setPercentage(percentage);
  }

  /**
   * Prüft, ob der Endboss gespawnt werden muss, und spawnt ihn ggf.
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
   * Bedingungen zum Laden des Endbosses.
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
   * Zeichnet komplettes Frame und plant das nächste.
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
   * Löscht den Zeichenbereich.
   */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Wendet Kameraverschiebung an.
   */
  translateCamera() {
    this.ctx.translate(this.camera_x, 0);
  }

  /**
   * Zeichnet Hintergrund-Objekte.
   */
  drawBackgroundObjects() {
    this.addObjectsToMap(this.level.backgroundObjects);
  }

  /**
   * Plant das nächste Zeichnen.
   */
  scheduleNextFrame() {
    this.animationFrameId = requestAnimationFrame(() => {
      this.draw();
    });
  }

  /**
   * Zeichnet bewegliche Weltobjekte und Charakter.
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
   * Setzt Kameraverschiebung zurück.
   */
  resetCamera() {
    this.ctx.translate(-this.camera_x, 0);
  }

  /**
   * Zeichnet Statusleisten (HUD).
   */
  drawStatusBars() {
    this.addToMap(this.statusBarLife);
    this.addToMap(this.statusBarCoin);
    this.addToMap(this.statusBarKunai);
    this.addToMap(this.statusBarEndboss);
  }

  /**
   * Erhält das Transform-Verhalten wie im Originalcode.
   */
  finalCameraTranslateHack() {
    this.ctx.translate(this.camera_x, 0);
    this.ctx.translate(-this.camera_x, 0);
  }

  /**
   * Zeichnet eine Liste von Objekten.
   * @param {MovableObject[]} objects - Zu zeichnende Objekte.
   */
  addObjectsToMap(objects) {
    objects.forEach((object) => {
      this.addToMap(object);
    });
  }

  /**
   * Zeichnet ein Objekt inkl. optionalem horizontalen Flip.
   * @param {MovableObject} mo - Zu zeichnendes Objekt.
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
   * Spiegelt die Darstellung eines Objekts horizontal.
   * @param {MovableObject} mo - Zu spiegelndes Objekt.
   */
  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  /**
   * Hebt den horizontalen Flip eines Objekts wieder auf.
   * @param {MovableObject} mo - Objekt mit zurückzusetzender Position.
   */
  flipImageBack(mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
  }

  /**
   * Prüft Einsammeln von Münzen und Kunai-Collectibles.
   */
  checkCollectibles() {
    this.collectCoins();
    this.collectKunaiCoins();
  }

  /**
   * Verarbeitet das Einsammeln aller Münzen.
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
   * Verarbeitet das Einsammeln aller Kunai-Collectibles.
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
