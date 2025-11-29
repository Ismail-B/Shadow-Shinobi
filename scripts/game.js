let canvas;
let world;
let keyboard = new Keyboard();
let intervalIds = [];

/* ========= SIMPLE DEVICE CHECK: HANDY / TABLET / KLEINES FENSTER ========= */

const MOBILE_MAX_SIDE = 912; // Schwelle für "mobil/tablet"

/**
 * Gilt als "mobil", wenn:
 * - klassischer Mobile-UserAgent ODER
 * - die kürzere Seite (Breite/Höhe) <= MOBILE_MAX_SIDE ist
 *   → funktioniert für Portrait + Landscape von Tablets / Phones
 */
function isMobileLike() {
  const uaMobile = /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry/i.test(
    navigator.userAgent
  );

  const minSide = Math.min(window.innerWidth, window.innerHeight);
  const sizeMobile = minSide <= MOBILE_MAX_SIDE;

  return uaMobile || sizeMobile;
}

/* ========= FULLSCREEN-BUTTON AUTO-HIDE AUF MOBIL ========= */

function updateFullscreenButtonVisibility() {
  const fsBtn = document.querySelector(".fullscreen-button");
  if (!fsBtn) return;

  if (isMobileLike()) {
    fsBtn.style.display = "none"; // auf Handy/Tablet immer ausblenden
  } else {
    fsBtn.style.display = "block"; // auf Desktop anzeigen
  }
}

// einmal initial versuchen (falls Button schon da ist)
updateFullscreenButtonVisibility();

// Touch-Listener nur einmal registrieren
let touchControlsInitialized = false;

/* Joystick-Zustand */
let joystickBase = null;
let joystickThumb = null;
let joystickActive = false;
let joystickRect = null;
let joystickCenterX = 0;
let joystickCenterY = 0;
let joystickJumpTriggered = false;

/* ========= GLOBALER MUTE-STATUS NUR FÜR DIE AKTUELLE SESSION ========= */

// Wird NICHT mehr in localStorage gespeichert.
let isMutedGlobal = false;

/**
 * Falls ein neuer World erstellt wird (init / restart),
 * den aktuellen Mute-Status auf die Sounds anwenden.
 */
function applyMuteStateToWorld() {
  if (!world) return;
  if (isMutedGlobal) {
    muteMusic();
  } else {
    world.isMuted = false;
  }
}

/* ========= setInterval-Sammlung ========= */

/** Alle setInterval-Aufrufe einsammeln */
const _originalSetInterval = window.setInterval;
window.setInterval = function (fn, delay) {
  const id = _originalSetInterval(fn, delay);
  intervalIds.push(id);
  return id;
};

function clearAllIntervals() {
  intervalIds.forEach(id => clearInterval(id));
  intervalIds = [];
}

/* ========= SPIELSTEUERUNG ========= */

function init() {
  canvas = document.getElementById("canvas");

  if (typeof Orc !== 'undefined' && typeof Orc.resetAudioState === 'function') {
    Orc.resetAudioState();
  }

  world = new World(canvas, keyboard);

  applyMuteStateToWorld();

  setupTouchControls();
  handleOrientation();
  updateFullscreenButtonVisibility();

  // auf Handy/Tablet direkt Fullscreen versuchen (läuft im Klick-Event von "Start")
  if (isMobileLike()) {
    enterFullscreenSafe();
  }
}

function toggle(canvasId) {
  let canvas = document.getElementById(canvasId);
  let startOverlay = document.getElementById("startoverlay");

  if (canvas.style.display === "none" || canvas.style.display === "") {
    canvas.style.display = "block";
    startOverlay.style.display = "none";
  } else {
    canvas.style.display = "none";
    startOverlay.style.display = "flex";
  }
}

/** Richtiger Restart ohne Reload */
function restartGame() {
  clearAllIntervals();

  if (world && typeof world.stop === 'function') {
    world.stop();
  }

  if (typeof Orc !== 'undefined' && typeof Orc.resetAudioState === 'function') {
    Orc.resetAudioState();
  }

  const go = document.getElementById('game-over-overlay');
  const win = document.getElementById('win-overlay');
  if (go) go.style.display = 'none';
  if (win) win.style.display = 'none';

  const canvasEl = document.getElementById('canvas');
  canvasEl.style.display = 'block';

  world = new World(canvasEl, keyboard);

  applyMuteStateToWorld();
  handleOrientation();
  updateFullscreenButtonVisibility();

  if (isMobileLike()) {
    enterFullscreenSafe();
  }
}

/** Zurück ins Menü, auch ohne Reload */
function backToMenu() {
  clearAllIntervals();

  if (world && typeof world.stop === 'function') {
    world.stop();
  }

  if (typeof Orc !== 'undefined' && typeof Orc.resetAudioState === 'function') {
    Orc.resetAudioState();
  }

  const go = document.getElementById('game-over-overlay');
  const win = document.getElementById('win-overlay');
  if (go) go.style.display = 'none';
  if (win) win.style.display = 'none';

  const canvasEl = document.getElementById('canvas');
  canvasEl.style.display = 'none';

  const startOverlay = document.getElementById('startoverlay');
  startOverlay.style.display = 'flex';

  world = null;
  handleOrientation();
  updateFullscreenButtonVisibility();
}

/* ========= Sound + Fullscreen ========= */

function toggleMusic(id) {
  let loud = document.getElementById(id);
  let mute = document.getElementById('mute-btn');

  if (getComputedStyle(loud).display === "none") {
    loud.style.display = "block";
    mute.style.display = "none";
  } else {
    loud.style.display = "none";
    mute.style.display = "block";
  }
}

/** alles stummschalten */
function muteMusic() {
  isMutedGlobal = true;

  if (!world) return;

  world.isMuted = true;

  const gameAudios = [
    world.music,
    world.background_sound,
    world.win_sound,
    world.character && world.character.walking_sound,
    world.character && world.character.kunai_throw_sound,
    world.character && world.character.hit_sound,
    world.character && world.character.jump_sound,
    world.character && world.character.hurt_sound,
    world.character && world.character.death_sound,
    world.endbossAlertSound
  ];

  if (world.endboss) {
    const boss = world.endboss;
    if (boss.attack_sound) gameAudios.push(boss.attack_sound);
    if (boss.dying_sound) gameAudios.push(boss.dying_sound);
    if (Array.isArray(boss.hurt_sounds)) {
      boss.hurt_sounds.forEach(s => gameAudios.push(s));
    }
  }

  gameAudios.forEach(a => {
    if (a instanceof Audio) a.muted = true;
  });

  if (typeof Orc !== 'undefined' && Array.isArray(Orc.voiceClips)) {
    Orc.voiceClips.forEach(clip => {
      if (clip instanceof Audio) clip.muted = true;
    });
  }

  if (typeof Orc !== 'undefined' && Array.isArray(Orc.instances)) {
    Orc.instances.forEach(o => {
      if (o && o.walking_sound instanceof Audio) {
        o.walking_sound.muted = true;
      }
    });
  }
}

/** alle Sounds wieder an */
function turnOnMusic() {
  isMutedGlobal = false;

  if (!world) return;

  world.isMuted = false;

  const gameAudios = [
    world.music,
    world.background_sound,
    world.win_sound,
    world.character && world.character.walking_sound,
    world.character && world.character.kunai_throw_sound,
    world.character && world.character.hit_sound,
    world.character && world.character.jump_sound,
    world.character && world.character.hurt_sound,
    world.character && world.character.death_sound,
    world.endbossAlertSound
  ];

  if (world.endboss) {
    const boss = world.endboss;
    if (boss.attack_sound) gameAudios.push(boss.attack_sound);
    if (boss.dying_sound) gameAudios.push(boss.dying_sound);
    if (Array.isArray(boss.hurt_sounds)) {
      boss.hurt_sounds.forEach(s => gameAudios.push(s));
    }
  }

  gameAudios.forEach(a => {
    if (a instanceof Audio) a.muted = false;
  });

  if (typeof Orc !== 'undefined' && Array.isArray(Orc.voiceClips)) {
    Orc.voiceClips.forEach(clip => {
      if (clip instanceof Audio) clip.muted = false;
    });
  }

  if (typeof Orc !== 'undefined' && Array.isArray(Orc.instances)) {
    Orc.instances.forEach(o => {
      if (o && o.walking_sound instanceof Audio) {
        o.walking_sound.muted = false;
      }
    });
  }
}

function fullscreen() {
  if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
    exitFullscreen();
  } else {
    const elem = document.documentElement;
    enterFullscreen(elem);
  }
}

function enterFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

function enterFullscreenSafe() {
  try {
    if (
      !document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      enterFullscreen(document.documentElement);
    }
  } catch (e) {
    // ignore
  }
}

/* ========= MOBILE: ORIENTATION + TOUCH-STEUERUNG ========= */

function isLandscapeOrientation() {
  if (window.matchMedia) {
    const mqLandscape = window.matchMedia("(orientation: landscape)");
    const mqPortrait = window.matchMedia("(orientation: portrait)");
    if (mqLandscape.matches) return true;
    if (mqPortrait.matches) return false;
  }
  return window.innerWidth > window.innerHeight;
}

/**
 * Orientation:
 * - Mobil/klein + Portrait: Hinweis an, Touch-Steuerung aus
 * - Mobil/klein + Landscape: Hinweis aus, Touch-Steuerung nur wenn world existiert
 * - Großes Desktopfenster: alles aus
 */
function handleOrientation() {
  const rotateOverlay = document.getElementById("rotate-overlay");
  const touchControls = document.getElementById("touch-controls");

  if (!rotateOverlay && !touchControls) return;

  if (!isMobileLike()) {
    if (rotateOverlay) rotateOverlay.style.display = "none";
    if (touchControls) touchControls.style.display = "none";
    return;
  }

  const landscape = isLandscapeOrientation();
  const gameStarted = !!world;

  if (!landscape) {
    if (rotateOverlay) rotateOverlay.style.display = "flex";
    if (touchControls) touchControls.style.display = "none";
  } else {
    if (rotateOverlay) rotateOverlay.style.display = "none";
    if (touchControls) {
      touchControls.style.display = gameStarted ? "block" : "none";
    }
  }
}

/* ======== JOYSTICK-Helfer ======== */

function getPointerPosition(e) {
  if (e.touches && e.touches.length > 0) return e.touches[0];
  if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0];
  return e;
}

function processJoystickMove(e) {
  if (!joystickRect) return;

  const p = getPointerPosition(e);
  const dx = p.clientX - joystickCenterX;
  const dy = p.clientY - joystickCenterY;

  const maxRadius = joystickRect.width / 2 - 10;
  const deadZone = 10;

  const dist = Math.sqrt(dx * dx + dy * dy);
  const clamped = Math.min(maxRadius, dist);
  const angle = Math.atan2(dy, dx);
  const offsetX = Math.cos(angle) * clamped;
  const offsetY = Math.sin(angle) * clamped;

  const localX = joystickRect.width / 2 + offsetX;
  const localY = joystickRect.height / 2 + offsetY;

  joystickThumb.style.left = `${localX}px`;
  joystickThumb.style.top = `${localY}px`;

  // Links / Rechts
  if (dx < -deadZone) {
    keyboard.LEFT = true;
    keyboard.RIGHT = false;
  } else if (dx > deadZone) {
    keyboard.RIGHT = true;
    keyboard.LEFT = false;
  } else {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
  }

  // Sprung: kräftig nach oben ziehen → Space
  const jumpThreshold = -20;
  if (dy < jumpThreshold && !joystickJumpTriggered) {
    joystickJumpTriggered = true;
    keyboard.SPACE = true;
    setTimeout(() => {
      keyboard.SPACE = false;
    }, 80);
  } else if (dy > jumpThreshold + 10) {
    joystickJumpTriggered = false;
  }
}

function onJoystickStart(e) {
  if (!joystickBase || !joystickThumb) return;

  joystickActive = true;
  joystickRect = joystickBase.getBoundingClientRect();
  joystickCenterX = joystickRect.left + joystickRect.width / 2;
  joystickCenterY = joystickRect.top + joystickRect.height / 2;

  if (e.cancelable) e.preventDefault();
  processJoystickMove(e);
}

function onJoystickMove(e) {
  if (!joystickActive) return;
  if (e.cancelable) e.preventDefault();
  processJoystickMove(e);
}

function onJoystickEnd(e) {
  joystickActive = false;
  keyboard.LEFT = false;
  keyboard.RIGHT = false;
  joystickJumpTriggered = false;

  if (joystickRect) {
    joystickThumb.style.left = `${joystickRect.width / 2}px`;
    joystickThumb.style.top = `${joystickRect.height / 2}px`;
  }

  if (e && e.cancelable) e.preventDefault();
}

/* ======== Touch-Buttons & Joystick verbinden ======== */

function setupTouchControls() {
  if (!isMobileLike()) return;
  if (touchControlsInitialized) return;

  // Buttons rechts: rufen direkt die Methoden im Character auf
  const attackBtn = document.getElementById("btn-attack");
  const throwBtn  = document.getElementById("btn-throw");

  if (attackBtn) {
    const startAttack = (e) => {
      if (e && e.cancelable) e.preventDefault();
      keyboard.ATTACK = true;
      if (world && world.character && typeof world.character.tryStartAttack === "function") {
        world.character.tryStartAttack();
      }
    };
    const endAttack = (e) => {
      if (e && e.cancelable) e.preventDefault();
      keyboard.ATTACK = false;
    };

    ["touchstart", "pointerdown", "mousedown"].forEach((evt) =>
      attackBtn.addEventListener(evt, startAttack)
    );
    ["touchend", "touchcancel", "pointerup", "pointercancel", "mouseup", "mouseleave"].forEach(
      (evt) => attackBtn.addEventListener(evt, endAttack)
    );
  }

  if (throwBtn) {
    const startThrow = (e) => {
      if (e && e.cancelable) e.preventDefault();
      keyboard.D = true;
      if (world && world.character && typeof world.character.tryStartKunaiThrow === "function") {
        world.character.tryStartKunaiThrow();
      }
    };
    const endThrow = (e) => {
      if (e && e.cancelable) e.preventDefault();
      keyboard.D = false;
    };

    ["touchstart", "pointerdown", "mousedown"].forEach((evt) =>
      throwBtn.addEventListener(evt, startThrow)
    );
    ["touchend", "touchcancel", "pointerup", "pointercancel", "mouseup", "mouseleave"].forEach(
      (evt) => throwBtn.addEventListener(evt, endThrow)
    );
  }

  // Joystick
  joystickBase = document.getElementById("joystick-base");
  joystickThumb = document.getElementById("joystick-thumb");

  if (joystickBase && joystickThumb) {
    ["touchstart", "pointerdown", "mousedown"].forEach((evt) =>
      joystickBase.addEventListener(evt, onJoystickStart)
    );
    ["touchmove", "pointermove", "mousemove"].forEach((evt) =>
      joystickBase.addEventListener(evt, onJoystickMove)
    );
    ["touchend", "touchcancel", "pointerup", "pointercancel", "mouseup", "mouseleave"].forEach(
      (evt) => joystickBase.addEventListener(evt, onJoystickEnd)
    );
  }

  touchControlsInitialized = true;
}

// Orientation-Events + Fullscreen-Button-Update
window.addEventListener("resize", () => {
  handleOrientation();
  updateFullscreenButtonVisibility();
});

window.addEventListener("orientationchange", () => {
  handleOrientation();
  updateFullscreenButtonVisibility();
});

window.addEventListener("load", () => {
  handleOrientation();
  updateFullscreenButtonVisibility();
});

document.addEventListener("DOMContentLoaded", () => {
  handleOrientation();
  updateFullscreenButtonVisibility();
});

/* ========= Keyboard ========= */

window.addEventListener("keydown", (e) => {
  if (e.key === "w" || e.key === "ArrowUp") {
    keyboard.UP = true;
  }

  if (e.key === "a" || e.key === "ArrowLeft") {
    keyboard.LEFT = true;
  }

  if (e.key === "s" || e.key === "ArrowDown") {
    keyboard.DOWN = true;
  }

  if (e.key === "d" || e.key === "ArrowRight") {
    keyboard.RIGHT = true;
  }

  if (e.key === " ") {
    keyboard.SPACE = true;
  }

  // Nahkampfangriff per B
  if (e.key === "b" || e.key === "B") {
    keyboard.ATTACK = true;
    if (world && world.character && typeof world.character.tryStartAttack === "function") {
      world.character.tryStartAttack();
    }
  }

  // Kunai-Wurf per V
  if (e.key === "v" || e.key === "V") {
    keyboard.D = true;
    if (world && world.character && typeof world.character.tryStartKunaiThrow === "function") {
      world.character.tryStartKunaiThrow();
    }
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "w" || e.key === "ArrowUp") {
    keyboard.UP = false;
  }

  if (e.key === "a" || e.key === "ArrowLeft") {
    keyboard.LEFT = false;
  }

  if (e.key === "s" || e.key === "ArrowDown") {
    keyboard.DOWN = false;
  }

  if (e.key === "d" || e.key === "ArrowRight") {
    keyboard.RIGHT = false;
  }

  if (e.key === " ") {
    keyboard.SPACE = false;
  }

  if (e.key === "b" || e.key === "B") {
    keyboard.ATTACK = false;
  }

  if (e.key === "v" || e.key === "V") {
    keyboard.D = false;
  }
});
