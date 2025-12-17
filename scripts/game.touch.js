/**
 * =====================================================
 * Game Touch Controls (Mobile + Joystick + Buttons)
 * =====================================================
 * Provides mobile detection, touch controls initialization
 * and joystick/button mappings to the global keyboard state.
 */

const MOBILE_MAX_SIDE = 1100;

let touchControlsInitialized = false;

let joystickBase = null;
let joystickThumb = null;
let joystickActive = false;
let joystickRect = null;
let joystickCenterX = 0;
let joystickCenterY = 0;
let joystickJumpTriggered = false;

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
