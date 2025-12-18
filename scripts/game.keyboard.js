/**
 * Global keyboard event mapping to the shared Keyboard instance.
 */

/**
 * Updates directional movement flags based on a key event.
 *
 * @param {string} key - Event key value
 * @param {boolean} isDown - Whether the key is pressed
 * @returns {void}
 */
function updateDirectionalKeys(key, isDown) {
  const lower = key.toLowerCase();

  if (lower === 'w' || key === 'ArrowUp') keyboard.UP = isDown;
  if (lower === 'a' || key === 'ArrowLeft') keyboard.LEFT = isDown;
  if (lower === 's' || key === 'ArrowDown') keyboard.DOWN = isDown;
  if (lower === 'd' || key === 'ArrowRight') keyboard.RIGHT = isDown;
}

/**
 * Updates jump flag based on a key event.
 *
 * @param {string} key - Event key value
 * @param {boolean} isDown - Whether the key is pressed
 * @returns {void}
 */
function updateJumpKey(key, isDown) {
  if (key === ' ') {
    keyboard.SPACE = isDown;
  }
}

/**
 * Updates attack flag and triggers an attack on key press.
 *
 * @param {string} key - Event key value
 * @param {boolean} isDown - Whether the key is pressed
 * @returns {void}
 */
function updateAttackKey(key, isDown) {
  const lower = key.toLowerCase();
  if (lower !== 'b') return;

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
 * Updates throw flag and triggers a kunai throw on key press.
 *
 * @param {string} key - Event key value
 * @param {boolean} isDown - Whether the key is pressed
 * @returns {void}
 */
function updateThrowKey(key, isDown) {
  const lower = key.toLowerCase();
  if (lower !== 'v') return;

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
 * Applies a key event to the Keyboard state.
 *
 * @param {string} key - Event key value
 * @param {boolean} isDown - Whether the key is pressed
 * @returns {void}
 */
function updateKeyboardFromKey(key, isDown) {
  updateDirectionalKeys(key, isDown);
  updateJumpKey(key, isDown);
  updateAttackKey(key, isDown);
  updateThrowKey(key, isDown);
}

/**
 * Handles global keydown events.
 * @param {KeyboardEvent} e - Keyboard event
 * @returns {void}
 */
function onKeyDown(e) {
  updateKeyboardFromKey(e.key, true);
}

/**
 * Handles global keyup events.
 * @param {KeyboardEvent} e - Keyboard event
 * @returns {void}
 */
function onKeyUp(e) {
  updateKeyboardFromKey(e.key, false);
}

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
