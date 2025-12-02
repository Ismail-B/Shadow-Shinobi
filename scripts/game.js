let canvas;
let world;
let keyboard = new Keyboard();
let intervalIds = [];

const MOBILE_MAX_SIDE = 1100;
let touchControlsInitialized = false;

let joystickBase = null;
let joystickThumb = null;
let joystickActive = false;
let joystickRect = null;
let joystickCenterX = 0;
let joystickCenterY = 0;
let joystickJumpTriggered = false;

// Mute nur für aktuelle Session
let isMutedGlobal = false;

/**
 * Prüft, ob Gerät / Fenster "mobil" wirkt.
 * @returns {boolean}
 */
function isMobileLike() {
  const uaMobile = /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry/i.test(
    navigator.userAgent
  );

  const minSide = Math.min(window.innerWidth, window.innerHeight);
  const smallScreen = minSide <= MOBILE_MAX_SIDE;
  const touch = isTouchDevice();

  // → Nur Geräte, die wirklich "mobil" wirken: Touch + klein ODER typischer Mobile-UserAgent
  return (touch && smallScreen) || (uaMobile && smallScreen);
}

function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Aktiviert Layout für laufendes Spiel.
 */
function enterGameMode() {                         // NEU
  document.body.classList.add('game-running');     // NEU
}

/**
 * Deaktiviert Layout für laufendes Spiel und verlässt ggf. Fullscreen.
 */
function exitGameMode() {                          // NEU
  document.body.classList.remove('game-running');  // NEU

  // Vollbild verlassen, falls noch aktiv              // NEU
  try {                                             // NEU
    if (isFullscreenActive()) {                     // NEU
      exitFullscreen();                             // NEU
    }                                               // NEU
  } catch (e) {                                     // NEU
    // bewusst ignoriert                             // NEU
  }

  // Scrollposition zurücksetzen (verhindert grauen Balken im Menü) // NEU
  window.scrollTo(0, 0);                            // NEU
}

/**
 * Blendet den Fullscreen-Button je nach Gerät ein/aus.
 */
function updateFullscreenButtonVisibility() {
  const fsBtn = document.querySelector('.fullscreen-button');
  if (!fsBtn) return;

  // Button nur ausblenden, wenn Gerät "mobil" ist
  if (isMobileLike()) {
    fsBtn.style.display = 'none';
  } else {
    fsBtn.style.display = 'block';
  }
}

/**
 * Wendet globalen Mute-Status auf die aktuelle Welt an.
 */
function applyMuteStateToWorld() {
  if (!world) {
    return;
  }
  if (isMutedGlobal) {
    muteMusic();
  } else {
    world.isMuted = false;
  }
}

/**
 * Wrap für setInterval: IDs sammeln.
 */
const _originalSetInterval = window.setInterval;
window.setInterval = function (fn, delay) {
  const id = _originalSetInterval(fn, delay);
  intervalIds.push(id);
  return id;
};

/**
 * Beendet alle laufenden Intervalle.
 */
function clearAllIntervals() {
  intervalIds.forEach((id) => clearInterval(id));
  intervalIds = [];
}

/**
 * Setzt Orc-Audio-Status zurück, falls verfügbar.
 */
function resetOrcAudioState() {
  if (typeof Orc !== 'undefined' && typeof Orc.resetAudioState === 'function') {
    Orc.resetAudioState();
  }
}

/**
 * Initialisiert Canvas, World und Mobile-Setup
 * und schaltet vom Menü ins Spiel.
 */
function init() {
  // Spielzustand aktiv
  enterGameMode(); // GEÄNDERT

  const startOverlay = document.getElementById('startoverlay');
  const canvasEl = document.getElementById('canvas');

  if (startOverlay) {
    startOverlay.style.display = 'none';
  }
  if (canvasEl) {
    canvasEl.style.display = 'block';
  }

  canvas = canvasEl;
  resetOrcAudioState();
  world = new World(canvas, keyboard);

  applyMuteStateToWorld();
  setupTouchControls();
  handleOrientation();
  updateFullscreenButtonVisibility();
  handleScreenTooSmallOverlay(); // NEU: beim Start prüfen

  if (isMobileLike()) {
    enterFullscreenSafe();
  }
}

/**
 * Blendet Canvas/Startscreen um (für Story/Controls/Impressum).
 * @param {string} canvasId
 */
function toggle(canvasId) {
  const canvasEl = document.getElementById(canvasId);
  const startOverlay = document.getElementById('startoverlay');

  const isHidden =
    canvasEl.style.display === 'none' || canvasEl.style.display === '';
  canvasEl.style.display = isHidden ? 'flex' : 'none';
  startOverlay.style.display = isHidden ? 'none' : 'flex';
}

/**
 * Stoppt Welt + Intervalle + Orc-Sounds.
 */
function stopWorldAndIntervals() {
  clearAllIntervals();
  if (world && typeof world.stop === 'function') {
    world.stop();
  }
  resetOrcAudioState();
}

/**
 * Blendet Game-Over- und Win-Overlay aus.
 */
function hideEndOverlays() {
  const go = document.getElementById('game-over-overlay');
  const win = document.getElementById('win-overlay');
  if (go) go.style.display = 'none';
  if (win) win.style.display = 'none';
}

/**
 * Startet das Spiel neu, ohne Reload.
 */
function restartGame() {
  stopWorldAndIntervals();
  hideEndOverlays();

  const canvasEl = document.getElementById('canvas');
  if (canvasEl) {
    canvasEl.style.display = 'block';
  }

  // Sicherstellen, dass wir im "Spiel läuft"-Zustand sind
  enterGameMode(); // GEÄNDERT

  world = new World(canvasEl, keyboard);
  applyMuteStateToWorld();

  handleOrientation();
  updateFullscreenButtonVisibility();
  handleScreenTooSmallOverlay(); // NEU: auch beim Restart prüfen

  if (isMobileLike()) {
    enterFullscreenSafe();
  }
}

/**
 * Geht zurück ins Menü, ohne Reload.
 */
function backToMenu() {
  stopWorldAndIntervals();
  hideEndOverlays();

  const canvasEl = document.getElementById('canvas');
  if (canvasEl) {
    canvasEl.style.display = 'none';
  }

  const startOverlay = document.getElementById('startoverlay');
  if (startOverlay) {
    startOverlay.style.display = 'flex';
  }

  world = null;

  // Spielzustand beenden → Header/Footer wieder sichtbar & Fullscreen verlassen
  exitGameMode(); // GEÄNDERT

  handleOrientation();
  updateFullscreenButtonVisibility();
  handleScreenTooSmallOverlay(); // NEU
}

/**
 * Schaltet das Musik-Icon um.
 * @param {string} id - ID des Laut-Icons.
 */
function toggleMusic(id) {
  const loud = document.getElementById(id);
  const mute = document.getElementById('mute-btn');

  const loudVisible = getComputedStyle(loud).display !== 'none';
  loud.style.display = loudVisible ? 'none' : 'block';
  mute.style.display = loudVisible ? 'block' : 'none';
}

/**
 * Baut eine Liste aller relevanten Audios im Spiel.
 * @returns {HTMLAudioElement[]}
 */
function collectGameAudios() {
  if (!world) {
    return [];
  }

  const baseAudios = [
    world.music,
    world.background_sound,
    world.win_sound,
    world.character && world.character.walking_sound,
    world.character && world.character.kunai_throw_sound,
    world.character && world.character.hit_sound,
    world.character && world.character.jump_sound,
    world.character && world.character.hurt_sound,
    world.character && world.character.death_sound,
    world.bossIntroSound,
    world.endbossAlertSound
  ];

  const list = baseAudios.filter((a) => a instanceof Audio);

  if (world.endboss) {
    const boss = world.endboss;
    if (boss.attack_sound) list.push(boss.attack_sound);
    if (boss.dying_sound) list.push(boss.dying_sound);
    if (Array.isArray(boss.hurt_sounds)) {
      boss.hurt_sounds.forEach((s) => {
        if (s instanceof Audio) list.push(s);
      });
    }
  }

  return list;
}

/**
 * Aktualisiert Mute-Status für alle Orc-Sounds.
 * @param {boolean} muted
 */
function updateOrcAudioMuted(muted) {
  if (typeof Orc !== 'undefined' && Array.isArray(Orc.voiceClips)) {
    Orc.voiceClips.forEach((clip) => {
      if (clip instanceof Audio) {
        clip.muted = muted;
      }
    });
  }

  if (typeof Orc !== 'undefined' && Array.isArray(Orc.instances)) {
    Orc.instances.forEach((o) => {
      if (o && o.walking_sound instanceof Audio) {
        o.walking_sound.muted = muted;
      }
    });
  }
}

/**
 * Setzt den Mute-Status auf alle Spiel-Sounds.
 * @param {boolean} muted
 */
function setMuteOnAllAudios(muted) {
  if (!world) {
    return;
  }

  world.isMuted = muted;

  const gameAudios = collectGameAudios();
  gameAudios.forEach((a) => {
    a.muted = muted;
  });

  updateOrcAudioMuted(muted);
}

/**
 * Alles stummschalten.
 */
function muteMusic() {
  isMutedGlobal = true;
  if (!world) {
    return;
  }
  setMuteOnAllAudios(true);
}

/**
 * Alle Sounds wieder aktivieren.
 */
function turnOnMusic() {
  isMutedGlobal = false;
  if (!world) {
    return;
  }
  setMuteOnAllAudios(false);
}

/**
 * Prüft, ob gerade Fullscreen aktiv ist.
 * @returns {boolean}
 */
function isFullscreenActive() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
}

/**
 * Toggle Fullscreen für das gesamte Dokument.
 */
function fullscreen() {
  if (isFullscreenActive()) {
    exitFullscreen();
  } else {
    enterFullscreen(document.documentElement);
  }
}

/**
 * Betritt den Fullscreen-Modus für ein Element.
 * @param {HTMLElement} element
 */
function enterFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
}

/**
 * Verlässt den Fullscreen-Modus.
 */
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

/**
 * Versucht Fullscreen zu aktivieren, ohne Fehler zu werfen.
 */
function enterFullscreenSafe() {
  try {
    if (!isFullscreenActive()) {
      enterFullscreen(document.documentElement);
    }
  } catch (e) {
    // bewusst ignoriert
  }
}

/**
 * Prüft, ob Landscape-Orientierung aktiv ist.
 * @returns {boolean}
 */
function isLandscapeOrientation() {
  if (window.matchMedia) {
    const mqLandscape = window.matchMedia('(orientation: landscape)');
    const mqPortrait = window.matchMedia('(orientation: portrait)');
    if (mqLandscape.matches) return true;
    if (mqPortrait.matches) return false;
  }
  return window.innerWidth > window.innerHeight;
}

/**
 * Steuert Rotate-Hinweis und Touch-Controls nach Orientierung.
 */
function handleOrientation() {
  const rotateOverlay = document.getElementById('rotate-overlay');
  const touchControls = document.getElementById('touch-controls');

  if (!rotateOverlay && !touchControls) {
    return;
  }
  if (!isMobileLike()) {
    if (rotateOverlay) rotateOverlay.style.display = 'none';
    if (touchControls) touchControls.style.display = 'none';
    return;
  }

  const landscape = isLandscapeOrientation();
  const gameStarted = !!world;

  if (!landscape) {
    if (rotateOverlay) rotateOverlay.style.display = 'flex';
    if (touchControls) touchControls.style.display = 'none';
  } else {
    if (rotateOverlay) rotateOverlay.style.display = 'none';
    if (touchControls) {
      touchControls.style.display = gameStarted ? 'block' : 'none';
    }
  }
}

/**
 * Steuert das "Screen too small"-Overlay
 * für Nicht-Touch-Geräte mit Breite <= 800px.
 */
function handleScreenTooSmallOverlay() {          // NEU
  const overlay = document.getElementById('screen-too-small-overlay');
  if (!overlay) return;

  const hasTouch = isTouchDevice();
  const tooSmall = window.innerWidth <= 800;

  if (!hasTouch && tooSmall) {
    overlay.style.display = 'flex';
  } else {
    overlay.style.display = 'none';
  }
}

/**
 * Ermittelt Pointer-Position aus verschiedenen Events.
 * @param {TouchEvent|MouseEvent|PointerEvent} e
 * @returns {Touch|MouseEvent|PointerEvent}
 */
function getPointerPosition(e) {
  if (e.touches && e.touches.length > 0) return e.touches[0];
  if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0];
  return e;
}

/**
 * Berechnet Joystick-Offsets.
 * @param {TouchEvent|MouseEvent|PointerEvent} e
 * @returns {{dx:number,dy:number,dist:number,angle:number,maxRadius:number,deadZone:number}}
 */
function computeJoystickData(e) {
  const p = getPointerPosition(e);
  const dx = p.clientX - joystickCenterX;
  const dy = p.clientY - joystickCenterY;
  const maxRadius = joystickRect.width / 2 - 10;
  const deadZone = 10;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  return { dx, dy, dist, angle, maxRadius, deadZone };
}

/**
 * Aktualisiert Position des Thumb im Joystick.
 * @param {number} dist
 * @param {number} angle
 * @param {number} maxRadius
 */
function updateJoystickThumb(dist, angle, maxRadius) {
  const clamped = Math.min(maxRadius, dist);
  const offsetX = Math.cos(angle) * clamped;
  const offsetY = Math.sin(angle) * clamped;
  const localX = joystickRect.width / 2 + offsetX;
  const localY = joystickRect.height / 2 + offsetY;
  joystickThumb.style.left = `${localX}px`;
  joystickThumb.style.top = `${localY}px`;
}

/**
 * Setzt horizontale Bewegung anhand Joystick.
 * @param {number} dx
 * @param {number} deadZone
 */
function updateJoystickHorizontal(dx, deadZone) {
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
}

/**
 * Behandelt Sprung-Aktion im Joystick.
 * @param {number} dy
 */
function handleJoystickJump(dy) {
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

/**
 * Verarbeitet Joystick-Bewegung.
 * @param {TouchEvent|MouseEvent|PointerEvent} e
 */
function processJoystickMove(e) {
  if (!joystickRect) {
    return;
  }

  const { dx, dy, dist, angle, maxRadius, deadZone } = computeJoystickData(e);
  updateJoystickThumb(dist, angle, maxRadius);
  updateJoystickHorizontal(dx, deadZone);
  handleJoystickJump(dy);
}

/**
 * Startet Joystick-Interaktion.
 * @param {Event} e
 */
function onJoystickStart(e) {
  if (!joystickBase || !joystickThumb) {
    return;
  }

  joystickActive = true;
  joystickRect = joystickBase.getBoundingClientRect();
  joystickCenterX = joystickRect.left + joystickRect.width / 2;
  joystickCenterY = joystickRect.top + joystickRect.height / 2;

  if (e.cancelable) e.preventDefault();
  processJoystickMove(e);
}

/**
 * Bewegt den Joystick während Interaktion.
 * @param {Event} e
 */
function onJoystickMove(e) {
  if (!joystickActive) {
    return;
  }
  if (e.cancelable) e.preventDefault();
  processJoystickMove(e);
}

/**
 * Beendet Joystick-Interaktion.
 * @param {Event} e
 */
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

/**
 * Verbindet Attack-Button mit Steuerung.
 */
function setupAttackButton() {
  const attackBtn = document.getElementById('btn-attack');
  if (!attackBtn) {
    return;
  }

  const startAttack = (e) => {
    if (e && e.cancelable) e.preventDefault();
    keyboard.ATTACK = true;
    if (world && world.character && typeof world.character.tryStartAttack === 'function') {
      world.character.tryStartAttack();
    }
  };

  const endAttack = (e) => {
    if (e && e.cancelable) e.preventDefault();
    keyboard.ATTACK = false;
  };

  ['touchstart', 'pointerdown', 'mousedown'].forEach((evt) =>
    attackBtn.addEventListener(evt, startAttack)
  );
  ['touchend', 'touchcancel', 'pointerup', 'pointercancel', 'mouseup', 'mouseleave'].forEach(
    (evt) => attackBtn.addEventListener(evt, endAttack)
  );
}

/**
 * Verbindet Wurf-Button mit Steuerung.
 */
function setupThrowButton() {
  const throwBtn = document.getElementById('btn-throw');
  if (!throwBtn) {
    return;
  }

  const startThrow = (e) => {
    if (e && e.cancelable) e.preventDefault();
    keyboard.D = true;
    if (world && world.character && typeof world.character.tryStartKunaiThrow === 'function') {
      world.character.tryStartKunaiThrow();
    }
  };

  const endThrow = (e) => {
    if (e && e.cancelable) e.preventDefault();
    keyboard.D = false;
  };

  ['touchstart', 'pointerdown', 'mousedown'].forEach((evt) =>
    throwBtn.addEventListener(evt, startThrow)
  );
  ['touchend', 'touchcancel', 'pointerup', 'pointercancel', 'mouseup', 'mouseleave'].forEach(
    (evt) => throwBtn.addEventListener(evt, endThrow)
  );
}

/**
 * Initialisiert Joystick-Elemente und Events.
 */
function setupJoystick() {
  joystickBase = document.getElementById('joystick-base');
  joystickThumb = document.getElementById('joystick-thumb');

  if (!joystickBase || !joystickThumb) {
    return;
  }

  ['touchstart', 'pointerdown', 'mousedown'].forEach((evt) =>
    joystickBase.addEventListener(evt, onJoystickStart)
  );
  ['touchmove', 'pointermove', 'mousemove'].forEach((evt) =>
    joystickBase.addEventListener(evt, onJoystickMove)
  );
  ['touchend', 'touchcancel', 'pointerup', 'pointercancel', 'mouseup', 'mouseleave'].forEach(
    (evt) => joystickBase.addEventListener(evt, onJoystickEnd)
  );
}

/**
 * Initialisiert Touch-Controls (nur einmal auf Mobile).
 */
function setupTouchControls() {
  if (!isMobileLike() || touchControlsInitialized) {
    return;
  }

  setupAttackButton();
  setupThrowButton();
  setupJoystick();

  touchControlsInitialized = true;
}

/**
 * Gemeinsamer Handler für Resize/Orientierungs-Änderungen.
 */
function handleLayoutChange() {
  handleOrientation();
  updateFullscreenButtonVisibility();
  handleScreenTooSmallOverlay(); // NEU: bei jedem Layout-Change prüfen
}

window.addEventListener('resize', handleLayoutChange);
window.addEventListener('orientationchange', handleLayoutChange);
window.addEventListener('load', handleLayoutChange);
document.addEventListener('DOMContentLoaded', handleLayoutChange);

/**
 * Aktualisiert Keyboard-State + ggf. Aktionen.
 * @param {string} key
 * @param {boolean} isDown
 */
function updateKeyboardFromKey(key, isDown) {
  const lower = key.toLowerCase();

  if (lower === 'w' || key === 'ArrowUp') keyboard.UP = isDown;
  if (lower === 'a' || key === 'ArrowLeft') keyboard.LEFT = isDown;
  if (lower === 's' || key === 'ArrowDown') keyboard.DOWN = isDown;
  if (lower === 'd' || key === 'ArrowRight') keyboard.RIGHT = isDown;
  if (key === ' ') keyboard.SPACE = isDown;

  if (lower === 'b') {
    keyboard.ATTACK = isDown;
    if (
      isDown &&
      world &&
      world.character &&
      typeof world.character.tryStartAttack === 'function'
    ) {
      world.character.tryStartAttack();
    }
  }

  if (lower === 'v') {
    keyboard.D = isDown;
    if (
      isDown &&
      world &&
      world.character &&
      typeof world.character.tryStartKunaiThrow === 'function'
    ) {
      world.character.tryStartKunaiThrow();
    }
  }
}

/**
 * Keydown-Handler für globale Tastatur.
 * @param {KeyboardEvent} e
 */
function onKeyDown(e) {
  updateKeyboardFromKey(e.key, true);
}

/**
 * Keyup-Handler für globale Tastatur.
 * @param {KeyboardEvent} e
 */
function onKeyUp(e) {
  updateKeyboardFromKey(e.key, false);
}

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
