/**
 * Global game state and infrastructure helpers.
 * Stores shared references, tracks intervals, and provides low-level reset utilities.
 */

/** @type {HTMLCanvasElement|undefined} */
let canvas;

/** @type {World|null|undefined} */
let world;

/** @type {Keyboard} */
let keyboard = new Keyboard();

/** @type {number[]} */
let intervalIds = [];

/** @type {typeof window.setInterval} */
const _originalSetInterval = window.setInterval;

/**
 * Wraps setInterval to track all created interval ids.
 *
 * @param {Function} fn - Callback to execute
 * @param {number} delay - Interval delay in milliseconds
 * @returns {number} Interval id
 */
window.setInterval = function (fn, delay) {
  const id = _originalSetInterval(fn, delay);
  intervalIds.push(id);
  return id;
};

/**
 * Clears all tracked intervals created via the wrapped setInterval.
 * @returns {void}
 */
function clearAllIntervals() {
  intervalIds.forEach((id) => clearInterval(id));
  intervalIds = [];
}

/**
 * Resets static orc audio state if available.
 * @returns {void}
 */
function resetOrcAudioState() {
  if (typeof Orc !== 'undefined' && typeof Orc.resetAudioState === 'function') {
    Orc.resetAudioState();
  }
}
