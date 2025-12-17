/**
 * =====================================================
 * Game Keyboard Input
 * =====================================================
 * Maps global keyboard events to the shared Keyboard instance.
 */

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
