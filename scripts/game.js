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

// mute state is only for the current session
let isMutedGlobal = false;

/**
 * Checks if the current device/window should be treated as "mobile".
 * @returns {boolean}
 */
function isMobileLike() {
  const uaMobile = /Android|iPhone|iPad|iPod|Windows Phone|webOS|BlackBerry/i.test(
    navigator.userAgent
  );
  const minSide = Math.min(window.innerWidth, window.innerHeight);
  const smallScreen = minSide <= MOBILE_MAX_SIDE;
  const touch = isTouchDevice();
  return (touch && smallScreen) || (uaMobile && smallScreen);
}

/**
 * Checks if the current device supports touch input.
 * @returns {boolean}
 */
function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Activates layout for a running game (hides header/footer via CSS).
 */
function enterGameMode() {
  document.body.classList.add('game-running');
}

/**
 * Deactivates layout for a running game and leaves fullscreen if needed.
 */
function exitGameMode() {
  document.body.classList.remove('game-running');

  try {
    if (isFullscreenActive()) {
      exitFullscreen();
    }
  } catch (e) {
    // intentionally ignored
  }

  window.scrollTo(0, 0);
}

/**
 * Shows the fullscreen button only on non-mobile setups.
 */
function updateFullscreenButtonVisibility() {
  const fsBtn = document.querySelector('.fullscreen-button');
  if (!fsBtn) return;

  if (isMobileLike()) {
    fsBtn.style.display = 'none';
  } else {
    fsBtn.style.display = 'block';
  }
}

/**
 * Applies the global mute state to the current world.
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
 * Original setInterval reference for wrapping.
 * @type {typeof window.setInterval}
 */
const _originalSetInterval = window.setInterval;

/**
 * Wrapper for setInterval that stores interval IDs.
 * @param {Function} fn
 * @param {number} delay
 * @returns {number}
 */
window.setInterval = function (fn, delay) {
  const id = _originalSetInterval(fn, delay);
  intervalIds.push(id);
  return id;
};

/**
 * Clears all running intervals created via wrapped setInterval.
 */
function clearAllIntervals() {
  intervalIds.forEach((id) => clearInterval(id));
  intervalIds = [];
}

/**
 * Resets stored Orc audio state if available.
 */
function resetOrcAudioState() {
  if (typeof Orc !== 'undefined' && typeof Orc.resetAudioState === 'function') {
    Orc.resetAudioState();
  }
}

/**
 * Hides the start overlay and shows the canvas.
 * @returns {HTMLCanvasElement|null}
 */
function showCanvasAndHideStartOverlay() {
  const startOverlay = document.getElementById('startoverlay');
  const canvasEl = document.getElementById('canvas');

  if (startOverlay) {
    startOverlay.style.display = 'none';
  }
  if (canvasEl) {
    canvasEl.style.display = 'block';
  }

  return canvasEl;
}

/**
 * Hides the canvas and shows the main menu overlay.
 */
function hideCanvasAndShowMenu() {
  const canvasEl = document.getElementById('canvas');
  const startOverlay = document.getElementById('startoverlay');

  if (canvasEl) {
    canvasEl.style.display = 'none';
  }
  if (startOverlay) {
    startOverlay.style.display = 'flex';
  }
}

/**
 * Updates orientation-related UI and responsive controls.
 */
function refreshResponsiveLayout() {
  handleOrientation();
  updateFullscreenButtonVisibility();
  handleScreenTooSmallOverlay();
}

/**
 * Initializes canvas, world and touch controls
 * and switches from menu into the game.
 */
function init() {
  enterGameMode();

  const canvasEl = showCanvasAndHideStartOverlay();
  canvas = canvasEl;

  resetOrcAudioState();
  world = new World(canvas, keyboard);

  applyMuteStateToWorld();
  setupTouchControls();
  refreshResponsiveLayout();

  if (isMobileLike()) {
    enterFullscreenSafe();
  }
}

/**
 * Toggles overlays (controls/story/impressum) against the start overlay.
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
 * Stops world loop, clears intervals and resets Orc audio.
 */
function stopWorldAndIntervals() {
  clearAllIntervals();
  if (world && typeof world.stop === 'function') {
    world.stop();
  }
  resetOrcAudioState();
}

/**
 * Hides both game over and win overlays if present.
 */
function hideEndOverlays() {
  const go = document.getElementById('game-over-overlay');
  const win = document.getElementById('win-overlay');
  if (go) go.style.display = 'none';
  if (win) win.style.display = 'none';
}

/**
 * Restarts the game without reloading the page.
 */
function restartGame() {
  stopWorldAndIntervals();
  hideEndOverlays();

  const canvasEl = showCanvasAndHideStartOverlay();
  enterGameMode();

  canvas = canvasEl;
  world = new World(canvas, keyboard);

  applyMuteStateToWorld();
  refreshResponsiveLayout();

  if (isMobileLike()) {
    enterFullscreenSafe();
  }
}

/**
 * Returns back to the main menu without reloading.
 */
function backToMenu() {
  stopWorldAndIntervals();
  hideEndOverlays();
  hideCanvasAndShowMenu();

  world = null;
  exitGameMode();
  refreshResponsiveLayout();
}

/**
 * Toggles the music icon (loud/mute).
 * @param {string} id - ID of the loud icon.
 */
function toggleMusic(id) {
  const loud = document.getElementById(id);
  const mute = document.getElementById('mute-btn');

  const loudVisible = getComputedStyle(loud).display !== 'none';
  loud.style.display = loudVisible ? 'none' : 'block';
  mute.style.display = loudVisible ? 'block' : 'none';
}

/**
 * Collects base audio references from the world and character.
 * @returns {HTMLAudioElement[]}
 */
function collectBaseAudios() {
  if (!world) {
    return [];
  }

  const baseAudios = [
    world.music,
    world.background_sound,
    world.win_sound,

    ...(Array.isArray(world.coinCollectSounds) ? world.coinCollectSounds : []),

    world.character && world.character.walking_sound,
    world.character && world.character.kunai_throw_sound,
    world.character && world.character.hit_sound,
    world.character && world.character.jump_sound,
    world.character && world.character.hurt_sound,
    world.character && world.character.death_sound,
    world.bossIntroSound,
    world.endbossAlertSound
  ];

  return baseAudios.filter((audio) => audio instanceof Audio);
}

/**
 * Adds boss-related audios to the given list.
 * @param {HTMLAudioElement[]} list
 */
function addBossAudios(list) {
  if (!world || !world.endboss) {
    return;
  }

  const boss = world.endboss;

  if (boss.attack_sound) {
    list.push(boss.attack_sound);
  }
  if (boss.dying_sound) {
    list.push(boss.dying_sound);
  }

  if (Array.isArray(boss.hurt_sounds)) {
    boss.hurt_sounds.forEach((sound) => {
      if (sound instanceof Audio) {
        list.push(sound);
      }
    });
  }
}

/**
 * Builds a list of all relevant game audio elements.
 * @returns {HTMLAudioElement[]}
 */
function collectGameAudios() {
  if (!world) {
    return [];
  }

  const list = collectBaseAudios();
  addBossAudios(list);
  return list;
}

/**
 * Updates the muted state for all Orc sounds.
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
    Orc.instances.forEach((orc) => {
      if (orc && orc.walking_sound instanceof Audio) {
        orc.walking_sound.muted = muted;
      }
    });
  }
}

/**
 * Applies the mute state to all game sounds.
 * @param {boolean} muted
 */
function setMuteOnAllAudios(muted) {
  if (!world) {
    return;
  }

  world.isMuted = muted;

  const gameAudios = collectGameAudios();
  gameAudios.forEach((audio) => {
    audio.muted = muted;
  });

  updateOrcAudioMuted(muted);
}

/**
 * Mutes all game audio.
 */
function muteMusic() {
  isMutedGlobal = true;
  if (!world) {
    return;
  }
  setMuteOnAllAudios(true);
}

/**
 * Unmutes all game audio.
 */
function turnOnMusic() {
  isMutedGlobal = false;
  if (!world) {
    return;
  }
  setMuteOnAllAudios(false);
}

/**
 * Checks if fullscreen is currently active.
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
 * Toggles fullscreen for the whole document.
 */
function fullscreen() {
  if (isFullscreenActive()) {
    exitFullscreen();
  } else {
    enterFullscreen(document.documentElement);
  }
}

/**
 * Enters fullscreen mode for a specific element.
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
 * Exits fullscreen mode if active.
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
 * Tries to enter fullscreen without throwing errors.
 */
function enterFullscreenSafe() {
  try {
    if (!isFullscreenActive()) {
      enterFullscreen(document.documentElement);
    }
  } catch (e) {
    // intentionally ignored
  }
}

/**
 * Checks if the current orientation is landscape.
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
 * Controls rotate overlay and touch controls based on orientation.
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
 * Controls the "screen too small" overlay for
 * non-touch devices with width <= 800px.
 */
function handleScreenTooSmallOverlay() {
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
 * Returns the primary pointer position for touch/mouse/pointer events.
 * @param {TouchEvent|MouseEvent|PointerEvent} e
 * @returns {Touch|MouseEvent|PointerEvent}
 */
function getPointerPosition(e) {
  if (e.touches && e.touches.length > 0) return e.touches[0];
  if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0];
  return e;
}

/**
 * Computes joystick deltas and derived values.
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
 * Updates joystick thumb position based on distance and angle.
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
 * Updates horizontal movement flags based on joystick offset.
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
 * Handles jump action based on joystick vertical offset.
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
 * Processes joystick movement input.
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
 * Starts a joystick interaction.
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
 * Moves the joystick while active.
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
 * Ends a joystick interaction and resets state.
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
 * Adds pointer/mouse press listeners to a button.
 * @param {HTMLElement} button
 * @param {(e: Event) => void} onStart
 * @param {(e: Event) => void} onEnd
 */
function addButtonPressListeners(button, onStart, onEnd) {
  ['touchstart', 'pointerdown', 'mousedown'].forEach((evt) =>
    button.addEventListener(evt, onStart)
  );
  ['touchend', 'touchcancel', 'pointerup', 'pointercancel', 'mouseup', 'mouseleave'].forEach(
    (evt) => button.addEventListener(evt, onEnd)
  );
}

/**
 * Wires the attack button to keyboard and character logic.
 */
function setupAttackButton() {
  const attackBtn = document.getElementById('btn-attack');
  if (!attackBtn) {
    return;
  }

  const startAttack = (e) => {
    if (e && e.cancelable) e.preventDefault();
    keyboard.ATTACK = true;

    if (
      world &&
      world.character &&
      typeof world.character.tryStartAttack === 'function'
    ) {
      world.character.tryStartAttack();
    }
  };

  const endAttack = (e) => {
    if (e && e.cancelable) e.preventDefault();
    keyboard.ATTACK = false;
  };

  addButtonPressListeners(attackBtn, startAttack, endAttack);
}

/**
 * Wires the throw button to keyboard and character logic.
 */
function setupThrowButton() {
  const throwBtn = document.getElementById('btn-throw');
  if (!throwBtn) {
    return;
  }

  const startThrow = (e) => {
    if (e && e.cancelable) e.preventDefault();
    keyboard.D = true;

    if (
      world &&
      world.character &&
      typeof world.character.tryStartKunaiThrow === 'function'
    ) {
      world.character.tryStartKunaiThrow();
    }
  };

  const endThrow = (e) => {
    if (e && e.cancelable) e.preventDefault();
    keyboard.D = false;
  };

  addButtonPressListeners(throwBtn, startThrow, endThrow);
}

/**
 * Initializes joystick DOM elements and their events.
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
 * Initializes touch controls on mobile devices (once).
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
 * Handles layout changes (resize/orientation) in one place.
 */
function handleLayoutChange() {
  handleOrientation();
  updateFullscreenButtonVisibility();
  handleScreenTooSmallOverlay();
}

window.addEventListener('resize', handleLayoutChange);
window.addEventListener('orientationchange', handleLayoutChange);
window.addEventListener('load', handleLayoutChange);
document.addEventListener('DOMContentLoaded', handleLayoutChange);

/**
 * Updates directional keys based on keyboard input.
 * @param {string} key
 * @param {boolean} isDown
 */
function updateDirectionalKeys(key, isDown) {
  const lower = key.toLowerCase();

  if (lower === 'w' || key === 'ArrowUp') keyboard.UP = isDown;
  if (lower === 'a' || key === 'ArrowLeft') keyboard.LEFT = isDown;
  if (lower === 's' || key === 'ArrowDown') keyboard.DOWN = isDown;
  if (lower === 'd' || key === 'ArrowRight') keyboard.RIGHT = isDown;
}

/**
 * Updates jump key based on keyboard input.
 * @param {string} key
 * @param {boolean} isDown
 */
function updateJumpKey(key, isDown) {
  if (key === ' ') {
    keyboard.SPACE = isDown;
  }
}

/**
 * Updates attack key and triggers attack if necessary.
 * @param {string} key
 * @param {boolean} isDown
 */
function updateAttackKey(key, isDown) {
  const lower = key.toLowerCase();
  if (lower !== 'b') {
    return;
  }

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

/**
 * Updates throw key and triggers kunai throw if necessary.
 * @param {string} key
 * @param {boolean} isDown
 */
function updateThrowKey(key, isDown) {
  const lower = key.toLowerCase();
  if (lower !== 'v') {
    return;
  }

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

/**
 * Updates keyboard state from a given key and pressed state.
 * @param {string} key
 * @param {boolean} isDown
 */
function updateKeyboardFromKey(key, isDown) {
  updateDirectionalKeys(key, isDown);
  updateJumpKey(key, isDown);
  updateAttackKey(key, isDown);
  updateThrowKey(key, isDown);
}

/**
 * Global keydown handler.
 * @param {KeyboardEvent} e
 */
function onKeyDown(e) {
  updateKeyboardFromKey(e.key, true);
}

/**
 * Global keyup handler.
 * @param {KeyboardEvent} e
 */
function onKeyUp(e) {
  updateKeyboardFromKey(e.key, false);
}

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
