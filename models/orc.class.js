class Orc extends MovableObject {
  height = 100;
  width = 70;
  y = 265;

  IMAGES_WALKING = [];
  DEAD_IMAGES = []; // von Subklassen befüllt

  isDying = false;
  collidable = true;

  walking_sound = new Audio('audio/running.mp3');
  orc_sound = new Audio('audio/orc.mp3');

  // Intervalle referenzieren, damit wir sie stoppen können
  moveLeftInterval = null;
  playAnimationInterval = null;
  soundInterval = null;

  // Death-Anim
  _deadIndex = 0;
  _deadTimer = null;
  _deadFrameMs = 90;

  constructor() {
    super().loadImage('img/3_enemies_orcs/orc_green/1_walk/Walk_1.png');
    this.loadImages(this.IMAGES_WALKING);
    if (this.DEAD_IMAGES?.length) this.loadImages(this.DEAD_IMAGES);

    this.x = 2000 + Math.random() * 5000;
    this.speed = 0.15 + Math.random() * 3.5;

    this.animate();
  }

  animate() {
    this.moveLeftInterval = setInterval(() => {
      if (!this.isDying) {
        this.moveLeft();
        this.otherDirection = false;
      }
    }, 1000 / 60);

    this.playAnimationInterval = setInterval(() => {
      if (!this.isDying) {
        this.playAnimation(this.IMAGES_WALKING);
      }
    }, 200);

    this.soundInterval = setInterval(() => {
      // optional Sounds
      // this.orc_sound.play();
      // this.orc_sound.volume = 0.2;
      // this.orc_sound.playbackRate = 0.8;
    }, Math.random() * 100000);
  }

die() {
  if (this.isDying) return;
  this.isDying = true;
  this.speed = 0;

  // Bewegungs-/Anim-Intervalle stoppen
  clearInterval(this.moveLeftInterval);
  clearInterval(this.playAnimationInterval);

  // --- NEU: Orc legt sich hin → breiter, etwas flacher ---
  const originalWidth = this.width;
  const originalHeight = this.height;
  this.width = originalWidth * 1.4;   // etwa 40 % breiter
  this.height = originalHeight * 0.8; // etwas flacher
  this.y += originalHeight * 0.2;     // leicht nach unten verschieben, damit er "liegt"

  // sofort erstes Dead-Bild zeigen
  this._deadIndex = 0;
  if (this.DEAD_IMAGES?.length) {
    this.img = this.imageCache[this.DEAD_IMAGES[0]];
  }

  // Death-Frames abspielen und am letzten Bild stehen bleiben
  this._deadTimer = setInterval(() => {
    if (this._deadIndex < this.DEAD_IMAGES.length - 1) {
      this._deadIndex++;
      this.img = this.imageCache[this.DEAD_IMAGES[this._deadIndex]];

      // sobald letztes Bild erreicht → keine Hitbox mehr
      if (this._deadIndex === this.DEAD_IMAGES.length - 1) {
        this.collidable = false;
      }
    } else {
      clearInterval(this._deadTimer);
      this.collidable = false;
    }
  }, this._deadFrameMs);
}

}