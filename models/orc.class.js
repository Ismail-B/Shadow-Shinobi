class Orc extends MovableObject {
  height = 100;
  width = 70;
  y = 265;

  IMAGES_WALKING = [];
  DEAD_IMAGES = []; // von Subklassen befüllt

  isDying = false;
  collidable = true;

  walking_sound = new Audio('audio/running.mp3');

  // ---------------- Gemeinsame Orc-Sounds ----------------
  static voiceClips = [
    new Audio('audio/orc.mp3'),
    new Audio('audio/orc1.mp3'),
    new Audio('audio/orc2.mp3'),
  ];

  static instances = [];
  static lastVoiceTime = 0;
  static lastVoiceIndex = -1;
  static voiceLoopId = null;

  // ---- Spawn-Parameter ----
  static MIN_SPAWN_X = 2000;
  static MAX_SPAWN_X = 7000;
  static MIN_SPAWN_DISTANCE = 220;

  // Intervalle pro Instanz
  moveLeftInterval = null;
  playAnimationInterval = null;

  // Death-Anim
  _deadIndex = 0;
  _deadTimer = null;
  _deadFrameMs = 90;

  constructor() {
    super().loadImage('img/3_enemies_orcs/orc_green/1_walk/Walk_1.png');
    this.loadImages(this.IMAGES_WALKING);
    if (this.DEAD_IMAGES?.length) this.loadImages(this.DEAD_IMAGES);

    // Spawn-Position mit Abstand
    this.x = this.getSpawnXWithMinDistance();

    // Orc-Variationen
    this.speed = 0.15 + Math.random() * 3.5;

    Orc.instances.push(this);
    Orc.startVoiceLoop();

    this.animate();
  }

  /** Spawn mit Mindestabstand zu anderen Orcs */
  getSpawnXWithMinDistance() {
    const minX = Orc.MIN_SPAWN_X;
    const maxX = Orc.MAX_SPAWN_X;
    const minDist = Orc.MIN_SPAWN_DISTANCE;

    for (let tries = 0; tries < 50; tries++) {
      const candidate = minX + Math.random() * (maxX - minX);
      let ok = true;

      for (const o of Orc.instances) {
        if (!o) continue;

        if (Math.abs(candidate - o.x) < minDist) {
          ok = false;
          break;
        }
      }

      if (ok) return candidate;
    }

    return minX + Math.random() * (maxX - minX);
  }

  // -------- ORC GLOBALER SOUND LOOP --------
  static startVoiceLoop() {
    if (Orc.voiceLoopId) {
      clearInterval(Orc.voiceLoopId);
      Orc.voiceLoopId = null;
    }

    Orc.voiceLoopId = setInterval(() => {
      Orc.checkAndPlayVoice();
    }, 400);
  }

  static checkAndPlayVoice() {
    const now = Date.now();

    let visibleOrcs = 0;
    for (const orc of Orc.instances) {
      if (orc && !orc.isDying && orc.isVisibleAndChasing()) {
        visibleOrcs++;
      }
    }

    if (!visibleOrcs) return;

    const baseDelay = 4500;
    const minDelay = 1200;
    const neededDelay = Math.max(minDelay, baseDelay / visibleOrcs);

    if (now - Orc.lastVoiceTime < neededDelay) return;

    Orc.lastVoiceIndex = (Orc.lastVoiceIndex + 1) % Orc.voiceClips.length;
    const clip = Orc.voiceClips[Orc.lastVoiceIndex];

    clip.volume = 0.25;
    clip.playbackRate = 0.9 + Math.random() * 0.2;
    clip.currentTime = 0;

    clip.play().catch(() => {});
    Orc.lastVoiceTime = now;
  }

  static resetAudioState() {
    if (Orc.voiceLoopId) {
      clearInterval(Orc.voiceLoopId);
      Orc.voiceLoopId = null;
    }
    Orc.instances = [];
    Orc.lastVoiceTime = 0;
    Orc.lastVoiceIndex = -1;
  }

  isVisibleAndChasing() {
    let onScreen = true;

    if (typeof this.isInCamera === 'function') {
      onScreen = this.isInCamera();
    } else if (typeof world !== 'undefined' && world && world.canvas) {
      const camX = world.camera_x || 0;
      const canvasWidth = world.canvas.width || 720;
      const sx = this.x + camX;
      onScreen = sx + this.width > -100 && sx < canvasWidth + 100;
    }

    if (!onScreen) return false;

    if (typeof world !== 'undefined' && world && world.character) {
      return this.x > world.character.x - 50 && !this.otherDirection;
    }

    return true;
  }

  // --------- Animation ---------
  animate() {
    this.moveLeftInterval = setInterval(() => {
      // Während Boss-Intro stehen bleiben
      if (this.world && this.world.bossIntroActive) {
        return;
      }

      if (!this.isDying) {
        this.moveLeft();
        this.otherDirection = false;
      }
    }, 1000 / 60);

    this.playAnimationInterval = setInterval(() => {
      // Während Boss-Intro keine Lauf-Animation (Orc „friert ein“)
      if (this.world && this.world.bossIntroActive) {
        return;
      }

      if (!this.isDying) {
        this.playAnimation(this.IMAGES_WALKING);
      }
    }, 200);
  }

  // --------- TOD ---------
  die() {
    if (this.isDying) return;
    this.isDying = true;
    this.speed = 0;

    // 👉 EINMALIGER TODESSOUND
    const dyingSound = new Audio('audio/orc-dying.mp3');
    dyingSound.volume = 0.35;
    dyingSound.currentTime = 0;
    if (typeof world !== 'undefined' && world && world.music instanceof Audio) {
      dyingSound.muted = world.music.muted;
    }
    dyingSound.play();

    clearInterval(this.moveLeftInterval);
    clearInterval(this.playAnimationInterval);

    const ow = this.width;
    const oh = this.height;
    this.width = ow * 1.4;
    this.height = oh * 0.8;
    this.y += oh * 0.2;

    this._deadIndex = 0;
    if (this.DEAD_IMAGES?.length) {
      this.img = this.imageCache[this.DEAD_IMAGES[0]];
    }

    this._deadTimer = setInterval(() => {
      if (this._deadIndex < this.DEAD_IMAGES.length - 1) {
        this._deadIndex++;
        this.img = this.imageCache[this.DEAD_IMAGES[this._deadIndex]];

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
