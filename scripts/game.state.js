/**
 * =====================================================
 * Game State & Infrastructure
 * =====================================================
 * Holds global game state, interval tracking and
 * low-level helpers shared across all game modules.
 */

// -----------------------------------------------------
// Global game references
// -----------------------------------------------------

let canvas;
let world;
let keyboard = new Keyboard();

// -----------------------------------------------------
// Interval tracking
// -----------------------------------------------------

let intervalIds = [];

/**
 * Original setInterval reference.
 * @type {typeof window.setInterval}
 */
const _originalSetInterval = window.setInterval;

/**
 * Wrapped setInterval that tracks all created intervals.
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
 * Clears all tracked intervals.
 */
function clearAllIntervals() {
  intervalIds.forEach((id) => clearInterval(id));
  intervalIds = [];
}

// -----------------------------------------------------
// Audio state helpers
// -----------------------------------------------------

/**
 * Resets static Orc audio state if available.
 */
function resetOrcAudioState() {
  if (typeof Orc !== 'undefined' && typeof Orc.resetAudioState === 'function') {
    Orc.resetAudioState();
  }
}
