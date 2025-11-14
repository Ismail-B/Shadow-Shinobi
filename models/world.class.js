class World {
  character = new Character();
  level = level1;
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
  ninjaCoinsCollected = 0;
  kunaiCoinsCollected = 0;

  // Kunai-Logik
  kunaiAmmo = 0;             // aktuelle Anzahl verfügbarer Würfe
  maxKunaiSegments = 5;      // Anzahl Segmente in der Kunai-Bar (100% = 5)
  kunaiPerSegment = 2;       // 2 Würfe pro Segment
  nextThrowAt = 0;           // Zeitstempel für Cooldown
  throwCooldownMs = 150;     // kleiner Wurf-Cooldown

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.keyboard = keyboard;

    this.draw();
    this.setWorld();
    this.run();

    // Kunai-Wurf bei Tastendruck V (ein Wurf pro Druck)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyV' && !e.repeat) {
        this.tryThrowKunai();
      }
      // Nahkampfangriff mit Taste B
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
  }

  run() {
    setInterval(() => {
      this.checkCollisions();
      this.checkCollectibles();
      this.checkForEndboss();
    }, 200);
  }

checkCollisions() {
  /** --------- 1. Charakter vs. Enemies (wie bisher) --------- */
  this.level.enemies.forEach((enemy) => {
    // sterbende/„tote“ Gegner ignorieren
    if (!enemy.collidable || enemy.isDying) return;

    if (
      this.character.isColliding(enemy) &&
      !this.character.isHurt() &&
      !this.character.isDead()
    ) {
      this.character.hit();
      this.statusBarLife.setPercentage(this.character.energy);
    }
  });

  /** --------- 2. Kunai vs. Enemies (NEU) --------- */
  // rückwärts iterieren, damit wir splicen können
  for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
    const kunai = this.throwableObjects[i];

    // Sicherheitscheck: hat das Objekt überhaupt eine Kollisions-Funktion?
    if (!kunai || typeof kunai.isColliding !== 'function') continue;

    // jeden Orc prüfen
    for (let j = this.level.enemies.length - 1; j >= 0; j--) {
      const enemy = this.level.enemies[j];

      if (!enemy || !enemy.collidable || enemy.isDying) continue;

      // Endboss z. B. nicht per Kunai one-shotten:
      if (enemy.isEndboss) continue;

      if (kunai.isColliding(enemy)) {
        // Orc killen, wenn möglich
        if (typeof enemy.die === 'function') {
          enemy.die();
        }

        // Kunai nach Treffer entfernen
        this.throwableObjects.splice(i, 1);

        // wichtig: inneren Loop abbrechen, weil dieses Kunai weg ist
        break;
      }
    }
  }
}


  /** ------------------ Kunai-Funktionen ------------------ **/

  /**
   * Startet den Kunai-Wurf:
   * - prüft Cooldown + Munition
   * - triggert Attack-Animation im Charakter
   * Das eigentliche Werfen passiert dann erst bei Attack_4.png.
   */
  tryThrowKunai() {
    const now = performance.now();
    if (this.character.isDead()) return;
    if (now < this.nextThrowAt) return; // Cooldown aktiv → kein neuer Wurf
    if (this.kunaiAmmo <= 0) return;    // Keine Munition → kein Wurf möglich

    // Wenn der Charakter gerade schon angreift, keinen neuen Wurf starten
    if (this.character.isAttacking) return;

    const started = this.character.tryStartKunaiThrow();
    if (!started) return;
    // Munition & Cooldown werden erst beim tatsächlichen Wurf (Frame 4) abgezogen
  }

  /**
   * Wird vom Charakter bei Attack_4.png (Frame-Index 3) aufgerufen.
   * Hier passiert der eigentliche Wurf: Kunai spawnen, Munition runter,
   * Kunai-Bar updaten, Cooldown setzen.
   */
  onCharacterKunaiRelease() {
    if (this.kunaiAmmo <= 0) return; // Safety, falls sich zwischendurch etwas ändert

    this.throwKunai();

    // 1 Wurf verbraucht 1 Munition
    this.kunaiAmmo -= 1;
    this.updateKunaiBarFromAmmo();

    // Cooldown setzen ab dem Moment des Abwurfs
    this.nextThrowAt = performance.now() + this.throwCooldownMs;
  }

  throwKunai() {
    const kunai = new ThrowableObject(this.character.x, this.character.y + 60);
    this.throwableObjects.push(kunai);
  }

  // Berechnet die Prozentanzeige der Kunai-Bar aus aktueller Munition
  updateKunaiBarFromAmmo() {
    const segments = Math.ceil(this.kunaiAmmo / this.kunaiPerSegment);
    const clampedSegments = Math.min(this.maxKunaiSegments, Math.max(0, segments));
    const percentage = (clampedSegments / this.maxKunaiSegments) * 100;
    this.statusBarKunai.setPercentage(percentage);
  }

  /** ------------------------------------------------------ **/

  checkForEndboss() {
    if (this.character.x > 3500 && !this.level.endbossLoaded) {
      const endboss = new Endboss();
      endboss.isEndboss = true; // <— falls nicht schon in der Klasse gesetzt
      this.level.enemies.push(endboss);
      this.level.endbossLoaded = true;
      console.log("Endboss wurde geladen!");
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.camera_x, 0);

    this.addObjectsToMap(this.level.backgroundObjects);

    let self = this;
    requestAnimationFrame(function () {
      self.draw();
    });

    this.addObjectsToMap(this.level.fireflys);
    this.addObjectsToMap(this.throwableObjects);
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.kunais);
    this.addObjectsToMap(this.level.enemies);

    this.addToMap(this.character);
    this.ctx.translate(-this.camera_x, 0);

    // Fixed UI
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

  /** ------------------ Collectibles ------------------ **/

  checkCollectibles() {
    // Ninja-Coins
    for (let i = this.level.coins.length - 1; i >= 0; i--) {
      const c = this.level.coins[i];
      if (this.character.isColliding(c)) {
        this.level.coins.splice(i, 1);
        this.ninjaCoinsCollected++;
        this.statusBarCoin.setPercentage(Math.min(100, this.ninjaCoinsCollected * 20));
      }
    }

    // Kunai-Coins
    for (let i = this.level.kunais.length - 1; i >= 0; i--) {
      const kc = this.level.kunais[i];
      if (this.character.isColliding(kc)) {
        this.level.kunais.splice(i, 1);
        this.kunaiCoinsCollected++;

        // +2 Würfe pro Coin
        this.kunaiAmmo += this.kunaiPerSegment;

        // Maximal 10 Würfe (5 Balken * 2 Würfe)
        const maxAmmo = this.maxKunaiSegments * this.kunaiPerSegment;
        if (this.kunaiAmmo > maxAmmo) this.kunaiAmmo = maxAmmo;

        // Kunai-Bar aktualisieren
        this.updateKunaiBarFromAmmo();
      }
    }
  }
}
