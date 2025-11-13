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

  // Für Wurf-Cooldown
  nextThrowAt = 0;
  throwCooldownMs = 150;

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.keyboard = keyboard;

    this.draw();
    this.setWorld();
    this.run();

    // ⬇️  Hier wird das Ereignis *innerhalb* des World-Konstruktors registriert:
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyV' && !e.repeat) {
        this.tryThrowKunai();  // ← das "this" zeigt korrekt auf DIESE World-Instanz
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
    this.level.enemies.forEach((enemy) => {
      if (
        this.character.isColliding(enemy) &&
        !this.character.isHurt() &&
        !this.character.isDead()
      ) {
        this.character.hit();
        this.statusBarLife.setPercentage(this.character.energy);
      }
    });
  }

  tryThrowKunai() {
    const now = performance.now();
    if (this.character.isDead()) return;
    if (now < this.nextThrowAt) return; // Cooldown aktiv → kein neuer Wurf

    this.throwKunai();
    this.nextThrowAt = now + this.throwCooldownMs;
  }

  throwKunai() {
    const kunai = new ThrowableObject(this.character.x, this.character.y + 60);
    this.throwableObjects.push(kunai);
  }

  checkForEndboss() {
    if (this.character.x > 3500 && !this.level.endbossLoaded) {
      const endboss = new Endboss();
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
        this.statusBarKunai.setPercentage(Math.min(100, this.kunaiCoinsCollected * 20));
      }
    }
  }
}
