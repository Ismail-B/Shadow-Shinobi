/**
 * Basisklasse aller Orc-Gegner.
 * Verantwortlich für Spawn, Bewegung, Sounds und Tod.
 * @extends MovableObject
 */
class Orc extends MovableObject {
  height = 100;
  width = 70;
  y = 265;

  /** @type {string[]} */
  IMAGES_WALKING = [];

  /** @type {string[]} */
  DEAD_IMAGES = [];

  isDying = false;
  collidable = true;

  walking_sound = new Audio('audio/running.mp3');

  // Globale Orc-Sounds
  static voiceClips = [
    new Audio('audio/orc.mp3'),
    new Audio('audio/orc1.mp3'),
    new Audio('audio/orc2.mp3')
  ];

  static instances = [];
  static lastVoiceTime = 0;
  static lastVoiceIndex = -1;
  static voiceLoopId = null;

  // Spawn-Parameter
  static MIN_SPAWN_X = 2000;
  static MAX_SPAWN_X = 7000;
  static MIN_SPAWN_DISTANCE = 220;

  moveLeftInterval = null;
  playAnimationInterval = null;

  _deadIndex = 0;
  _deadTimer = null;
  _deadFrameMs = 90;

  constructor() {
    super().loadImage('img/3_enemies_orcs/orc_green/1_walk/Walk_1.png');

    this.loadImages(this.IMAGES_WALKING);
    if (this.DEAD_IMAGES.length) this.loadImages(this.DEAD_IMAGES);

    this.x = this.getSpawnXWithMinDistance();
    this.speed = 0.15 + Math.random() * 3.5;

    Orc.instances.push(this);
    Orc.startVoiceLoop();

    this.startMoveLoop();
    this.startAnimationLoop();
  }

  // -----------------------------------------------------
  // Audio helpers (safe)
  // -----------------------------------------------------

  /**
   * Plays an Audio element without unhandled promise rejections.
   * @param {HTMLAudioElement} audio
   */
  static playAudioSafe(audio) {
    if (!audio || !(audio instanceof Audio)) return;

    try {
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // intentionally ignored
        });
      }
    } catch (e) {
      // intentionally ignored
    }
  }

  /**
   * Resets an Audio element (currentTime=0) if possible.
   * @param {HTMLAudioElement} audio
   */
  static resetAudioSafe(audio) {
    if (!audio || !(audio instanceof Audio)) return;
    try {
      audio.currentTime = 0;
    } catch (e) {
      // intentionally ignored
    }
  }

  /**
   * Sets volume if possible.
   * @param {HTMLAudioElement} audio
   * @param {number} volume
   */
  static setVolumeSafe(audio, volume) {
    if (!audio || !(audio instanceof Audio)) return;
    try {
      audio.volume = volume;
    } catch (e) {
      // intentionally ignored
    }
  }

  /**
   * Sets playback rate if possible.
   * @param {HTMLAudioElement} audio
   * @param {number} rate
   */
  static setPlaybackRateSafe(audio, rate) {
    if (!audio || !(audio instanceof Audio)) return;
    try {
      audio.playbackRate = rate;
    } catch (e) {
      // intentionally ignored
    }
  }

  /**
   * Pauses audio if possible.
   * @param {HTMLAudioElement} audio
   */
  static pauseAudioSafe(audio) {
    if (!audio || !(audio instanceof Audio)) return;
    try {
      audio.pause();
    } catch (e) {
      // intentionally ignored
    }
  }

  /**
   * Returns whether game audio is currently muted (best effort).
   * @returns {boolean}
   */
  static isGameMuted() {
    if (typeof world === 'undefined' || !world) return false;

    if (typeof world.isMuted === 'boolean') return world.isMuted;
    if (world.music instanceof Audio) return !!world.music.muted;

    return false;
  }

  // -----------------------------------------------------
  // Spawn
  // -----------------------------------------------------

  /**
   * Sucht eine Spawnposition mit Mindestabstand.
   * @returns {number}
   */
  getSpawnXWithMinDistance() {
    const minX = Orc.MIN_SPAWN_X;
    const maxX = Orc.MAX_SPAWN_X;
    const minDist = Orc.MIN_SPAWN_DISTANCE;

    for (let tries = 0; tries < 50; tries++) {
      const candidate = minX + Math.random() * (maxX - minX);
      if (this.isSpawnPositionValid(candidate, minDist)) {
        return candidate;
      }
    }
    return minX + Math.random() * (maxX - minX);
  }

  /**
   * Prüft Mindestabstand zu vorhandenen Orcs.
   * @param {number} candidate
   * @param {number} minDist
   * @returns {boolean}
   */
  isSpawnPositionValid(candidate, minDist) {
    for (const o of Orc.instances) {
      if (!o) continue;
      if (Math.abs(candidate - o.x) < minDist) return false;
    }
    return true;
  }

  // ------------ Globaler Voice-Loop ------------

  /**
   * Startet den globalen Orc-Voice-Loop.
   */
  static startVoiceLoop() {
    if (Orc.voiceLoopId) {
      clearInterval(Orc.voiceLoopId);
      Orc.voiceLoopId = null;
    }

    Orc.voiceLoopId = setInterval(() => {
      Orc.checkAndPlayVoice();
    }, 400);
  }

  /**
   * Entscheidet, ob ein Orc-Sound gespielt wird.
   */
  static checkAndPlayVoice() {
    const now = Date.now();
    const visible = Orc.getVisibleOrcCount();

    if (!visible) return;
    if (!Orc.shouldPlayVoice(now, visible)) return;

    Orc.playNextVoiceClip(now);
  }

  /**
   * Zählt Orcs, die sichtbar und aktiv sind.
   * @returns {number}
   */
  static getVisibleOrcCount() {
    let count = 0;

    for (const orc of Orc.instances) {
      if (orc && !orc.isDying && orc.isVisibleAndChasing()) {
        count++;
      }
    }
    return count;
  }

  /**
   * Prüft, ob genügend Zeit seit dem letzten Sound vergangen ist.
   * @param {number} now
   * @param {number} visibleCount
   * @returns {boolean}
   */
  static shouldPlayVoice(now, visibleCount) {
    const baseDelay = 4500;
    const minDelay = 1200;
    const neededDelay = Math.max(minDelay, baseDelay / visibleCount);

    return now - Orc.lastVoiceTime >= neededDelay;
  }

  /**
   * Spielt den nächsten Orc-Voice-Clip ab.
   * @param {number} now
   */
  static playNextVoiceClip(now) {
    if (Orc.isGameMuted()) return;

    Orc.lastVoiceIndex = (Orc.lastVoiceIndex + 1) % Orc.voiceClips.length;

    const clip = Orc.voiceClips[Orc.lastVoiceIndex];
    Orc.setVolumeSafe(clip, 0.25);
    Orc.setPlaybackRateSafe(clip, 0.9 + Math.random() * 0.2);
    Orc.resetAudioSafe(clip);

    Orc.playAudioSafe(clip);
    Orc.lastVoiceTime = now;
  }

  /**
   * Setzt globale Audio-State zurück (z.B. bei Restart).
   */
  static resetAudioState() {
    if (Orc.voiceLoopId) {
      clearInterval(Orc.voiceLoopId);
      Orc.voiceLoopId = null;
    }
    Orc.instances = [];
    Orc.lastVoiceTime = 0;
    Orc.lastVoiceIndex = -1;
  }

  /**
   * Prüft, ob der Orc im Sichtbereich ist und jagt.
   * @returns {boolean}
   */
  isVisibleAndChasing() {
    if (!this.isOnScreen()) return false;

    if (typeof world !== 'undefined' && world && world.character) {
      return this.x > world.character.x - 50 && !this.otherDirection;
    }
    return true;
  }

  /**
   * Prüft Sichtbarkeit im Kameraausschnitt.
   * @returns {boolean}
   */
  isOnScreen() {
    if (typeof world === 'undefined' || !world || !world.canvas) {
      return true;
    }

    const camX = world.camera_x || 0;
    const canvasWidth = world.canvas.width || 720;
    const sx = this.x + camX;

    return sx + this.width > -100 && sx < canvasWidth + 100;
  }

  // ------------ Bewegung & Animation ------------

  /**
   * Startet die Bewegungs-Logik nach links.
   */
  startMoveLoop() {
    this.moveLeftInterval = setInterval(() => {
      if (this.world?.bossIntroActive) return;
      if (this.isDying) return;

      this.moveLeft();
      this.otherDirection = false;
    }, 1000 / 60);
  }

  /**
   * Startet die Laufanimation.
   */
  startAnimationLoop() {
    this.playAnimationInterval = setInterval(() => {
      if (this.world?.bossIntroActive) return;
      if (this.isDying) return;

      this.playAnimation(this.IMAGES_WALKING);
    }, 200);
  }

  // ------------ Tod ------------

  /**
   * Löst die Todes-Sequenz aus.
   */
  die() {
    if (this.isDying) return;

    this.isDying = true;
    this.speed = 0;

    this.playDeathSound();
    this.stopOrcIntervals();
    this.prepareDeathSprite();
    this.startDeathAnimation();
  }

  /**
   * Spielt den Todessound des Orcs.
   */
  playDeathSound() {
    if (Orc.isGameMuted()) return;

    const s = new Audio('audio/orc-dying.mp3');
    Orc.setVolumeSafe(s, 0.35);
    Orc.resetAudioSafe(s);

    Orc.playAudioSafe(s);
  }

  /**
   * Stoppt Bewegungs- und Animations-Intervalle.
   */
  stopOrcIntervals() {
    clearInterval(this.moveLeftInterval);
    clearInterval(this.playAnimationInterval);
  }

  /**
   * Skaliert Sprite und setzt erste Death-Frame.
   */
  prepareDeathSprite() {
    const ow = this.width;
    const oh = this.height;

    this.width = ow * 1.4;
    this.height = oh * 0.8;
    this.y += oh * 0.2;

    this._deadIndex = 0;
    if (this.DEAD_IMAGES.length) {
      this.img = this.imageCache[this.DEAD_IMAGES[0]];
    }
  }

  /**
   * Startet die Death-Frame-Animation.
   */
  startDeathAnimation() {
    this._deadTimer = setInterval(() => {
      this.updateDeathFrame();
    }, this._deadFrameMs);
  }

  /**
   * Aktualisiert ein Death-Frame.
   */
  updateDeathFrame() {
    const lastIndex = this.DEAD_IMAGES.length - 1;

    if (this._deadIndex < lastIndex) {
      this._deadIndex++;
      this.img = this.imageCache[this.DEAD_IMAGES[this._deadIndex]];

      if (this._deadIndex === lastIndex) {
        this.collidable = false;
      }
      return;
    }

    clearInterval(this._deadTimer);
    this.collidable = false;
  }
}
