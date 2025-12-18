/**
 * Touch controls for mobile devices (joystick + action buttons).
 * Maps touch/pointer input to the shared Keyboard instance.
 */

/** @type {number} */
const MOBILE_MAX_SIDE = 1100;

/** @type {boolean} */
let touchControlsInitialized = false;

/** @type {HTMLElement|null} */
let joystickBase = null;

/** @type {HTMLElement|null} */
let joystickThumb = null;

/** @type {boolean} */
let joystickActive = false;

/** @type {DOMRect|null} */
let joystickRect = null;

/** @type {number} */
let joystickCenterX = 0;

/** @type {number} */
let joystickCenterY = 0;

/** @type {boolean} */
let joystickJumpTriggered = false;

/**
 * Returns whether the current device supports touch input.
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
 * Returns whether the current setup should be treated as mobile-like.
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
 * @param {TouchEvent|MouseEvent|PointerEvent} e - Input event
 * @returns {Touch|MouseEvent|PointerEvent}
 */
function getPointerPosition(e) {
  if (e.touches && e.touches.length > 0) return e.touches[0];
  if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0];
  return e;
}

/**
 * Computes joystick deltas and derived values.
 *
 * @param {TouchEvent|MouseEvent|PointerEvent} e - Input event
 * @returns {{dx:number, dy:number, dist:number, angle:number, maxRadius:number, deadZone:number}}
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
 *
 * @param {number} dist - Distance from joystick center
 * @param {number} angle - Angle in radians
 * @param {number} maxRadius - Maximum thumb radius
 * @returns {void}
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
 *
 * @param {number} dx - Horizontal delta from joystick center
 * @param {number} deadZone - Dead zone threshold
 * @returns {void}
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
 * Triggers a jump when joystick input crosses the jump threshold.
 *
 * @param {number} dy - Vertical delta from joystick center
 * @returns {void}
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
 * @param {TouchEvent|MouseEvent|PointerEvent} e - Input event
 * @returns {void}
 */
function processJoystickMove(e) {
  if (!joystickRect) return;

  const { dx, dy, dist, angle, maxRadius, deadZone } = computeJoystickData(e);
  updateJoystickThumb(dist, angle, maxRadius);
  updateJoystickHorizontal(dx, deadZone);
  handleJoystickJump(dy);
}

/**
 * Starts a joystick interaction.
 * @param {Event} e - Input event
 * @returns {void}
 */
function onJoystickStart(e) {
  if (!joystickBase || !joystickThumb) return;

  joystickActive = true;
  joystickRect = joystickBase.getBoundingClientRect();
  joystickCenterX = joystickRect.left + joystickRect.width / 2;
  joystickCenterY = joystickRect.top + joystickRect.height / 2;

  if (e.cancelable) e.preventDefault();
  processJoystickMove(e);
}

/**
 * Updates the joystick while active.
 * @param {Event} e - Input event
 * @returns {void}
 */
function onJoystickMove(e) {
  if (!joystickActive) return;

  if (e.cancelable) e.preventDefault();
  processJoystickMove(e);
}

/**
 * Ends a joystick interaction and resets movement state.
 * @param {Event} e - Input event
 * @returns {void}
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
 * Registers press/release listeners for a button element.
 *
 * @param {HTMLElement} button - Button element
 * @param {(e: Event) => void} onStart - Press handler
 * @param {(e: Event) => void} onEnd - Release handler
 * @returns {void}
 */
function addButtonPressListeners(button, onStart, onEnd) {
  ['touchstart', 'pointerdown', 'mousedown'].forEach((evt) => {
    button.addEventListener(evt, onStart);
  });

  ['touchend', 'touchcancel', 'pointerup', 'pointercancel', 'mouseup', 'mouseleave'].forEach(
    (evt) => button.addEventListener(evt, onEnd)
  );
}

/**
 * Registers the attack button and maps it to keyboard/character logic.
 * @returns {void}
 */
function setupAttackButton() {
  const attackBtn = document.getElementById('btn-attack');
  if (!attackBtn) return;

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
 * Registers the throw button and maps it to keyboard/character logic.
 * @returns {void}
 */
function setupThrowButton() {
  const throwBtn = document.getElementById('btn-throw');
  if (!throwBtn) return;

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
 * Initializes joystick DOM references and registers joystick event handlers.
 * @returns {void}
 */
function setupJoystick() {
  joystickBase = document.getElementById('joystick-base');
  joystickThumb = document.getElementById('joystick-thumb');

  if (!joystickBase || !joystickThumb) return;

  ['touchstart', 'pointerdown', 'mousedown'].forEach((evt) => {
    joystickBase.addEventListener(evt, onJoystickStart);
  });

  ['touchmove', 'pointermove', 'mousemove'].forEach((evt) => {
    joystickBase.addEventListener(evt, onJoystickMove);
  });

  ['touchend', 'touchcancel', 'pointerup', 'pointercancel', 'mouseup', 'mouseleave'].forEach(
    (evt) => joystickBase.addEventListener(evt, onJoystickEnd)
  );
}

/**
 * Initializes touch controls once on mobile-like devices.
 * @returns {void}
 */
function setupTouchControls() {
  if (!isMobileLike() || touchControlsInitialized) return;

  setupAttackButton();
  setupThrowButton();
  setupJoystick();

  touchControlsInitialized = true;
}
