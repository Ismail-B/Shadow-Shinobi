class Orc extends MovableObject {
  height = 100;
  width = 70;
  y = 265;

  IMAGES_WALKING = [];
  DEAD_IMAGES = []; // von Subklassen befüllt

  isDying = false;
  collidable = true;

  walking_sound = new Audio('audio/running.mp3');

  // ---------------- Gemeinsame Orc-Sounds (für alle Orcs) ----------------
  static voiceClips = [
    new Audio('audio/orc.mp3'),
    new Audio('audio/orc1.mp3'),
    new Audio('audio/orc2.mp3'),
  ];

  static instances = [];          // alle existierenden Orcs
  static lastVoiceTime = 0;       // letzter Schrei-Zeitpunkt
  static lastVoiceIndex = -1;     // welcher Clip zuletzt lief
  static voiceLoopId = null;      // ID des globalen Sound-Loops

  // Intervalle pro Instanz (Bewegung / Animation)
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

    this.x = 2000 + Math.random() * 5000;
    this.speed = 0.15 + Math.random() * 3.5;

    // Orc in globale Liste eintragen
    Orc.instances.push(this);

    // globalen Sound-Loop sicherstellen
    Orc.startVoiceLoop();

    this.animate();
  }

  // --------- globaler Loop, der entscheidet, ob gerade ein Orc schreit ---------
  static startVoiceLoop() {
    // Sicherheitsmaßnahme: alten Loop (falls vorhanden) beenden
    if (Orc.voiceLoopId) {
      clearInterval(Orc.voiceLoopId);
      Orc.voiceLoopId = null;
    }

    Orc.voiceLoopId = setInterval(() => {
      Orc.checkAndPlayVoice();
    }, 400); // alle 0,4s prüfen
  }

  static checkAndPlayVoice() {
    const now = Date.now();

    // a) relevante Orcs zählen (sichtbar + laufen auf den Charakter zu)
    let visibleOrcs = 0;
    for (const orc of Orc.instances) {
      if (orc && !orc.isDying && orc.isVisibleAndChasing()) {
        visibleOrcs++;
      }
    }
    if (!visibleOrcs) return;

    // b) Delay abhängig von der Anzahl Orcs
    const baseDelay = 4500; // ~4,5s bei 1 Orc
    const minDelay = 1200;  // nie öfter als ca. alle 1,2s
    const neededDelay = Math.max(minDelay, baseDelay / visibleOrcs);

    if (now - Orc.lastVoiceTime < neededDelay) return;

    // c) nächsten Clip auswählen (abwechselnd)
    Orc.lastVoiceIndex = (Orc.lastVoiceIndex + 1) % Orc.voiceClips.length;
    const clip = Orc.voiceClips[Orc.lastVoiceIndex];

    clip.volume = 0.25;
    clip.playbackRate = 0.9 + Math.random() * 0.2; // leicht variieren
    clip.currentTime = 0;

    clip.play().catch(() => { /* Audio-Fehler ignorieren */ });

    Orc.lastVoiceTime = now;
  }

  // beim Neustart aufrufen, damit alles sauber ist
  static resetAudioState() {
    if (Orc.voiceLoopId) {
      clearInterval(Orc.voiceLoopId);
      Orc.voiceLoopId = null;
    }
    Orc.instances = [];
    Orc.lastVoiceTime = 0;
    Orc.lastVoiceIndex = -1;
  }

  // prüft, ob dieser Orc für Sounds relevant ist
  isVisibleAndChasing() {
    // Sichtbarkeit im Kamerabereich
    let onScreen = true;

    if (typeof this.isInCamera === 'function') {
      // falls du schon eine isInCamera()-Funktion hast, nutze die
      onScreen = this.isInCamera();
    } else if (typeof world !== 'undefined' && world && world.canvas) {
      const camX = world.camera_x || 0;
      const canvasWidth = world.canvas.width || 720;
      const screenX = this.x + camX;

      // kleiner Puffer links/rechts
      onScreen = screenX + this.width > -100 && screenX < canvasWidth + 100;
    }

    if (!onScreen) return false;

    // "zulaufen": grob Orc rechts vom Character und schaut nach links
    if (typeof world !== 'undefined' && world && world.character) {
      return this.x > world.character.x - 50 && !this.otherDirection;
    }

    // Fallback, falls es keinen world gibt
    return true;
  }

  // ---------------- normale Orc-Animation ----------------
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
  }

  // ---------------- Death-Logik ----------------
  die() {
    if (this.isDying) return;
    this.isDying = true;
    this.speed = 0;

    // Bewegungs-/Anim-Intervalle stoppen
    clearInterval(this.moveLeftInterval);
    clearInterval(this.playAnimationInterval);

    // --- Orc legt sich hin → breiter, etwas flacher ---
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
