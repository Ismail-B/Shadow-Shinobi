/**
 * Layout and overlay helpers for responsive gameplay UI.
 * Manages game mode styles, overlays, fullscreen, and orientation constraints.
 */

/**
 * Enables game layout mode (e.g., hides header/footer via CSS).
 * @returns {void}
 */
function enterGameMode() {
  document.body.classList.add('game-running');
}

/**
 * Disables game layout mode and exits fullscreen if active.
 * @returns {void}
 */
function exitGameMode() {
  document.body.classList.remove('game-running');

  try {
    if (isFullscreenActive()) {
      exitFullscreen();
    }
  } catch (e) {}

  window.scrollTo(0, 0);
}

/**
 * Hides the start overlay and shows the canvas.
 * @returns {HTMLCanvasElement|null}
 */
function showCanvasAndHideStartOverlay() {
  const startOverlay = document.getElementById('startoverlay');
  const canvasEl = document.getElementById('canvas');

  if (startOverlay) startOverlay.style.display = 'none';
  if (canvasEl) canvasEl.style.display = 'block';

  return canvasEl;
}

/**
 * Hides the canvas and shows the main menu overlay.
 * @returns {void}
 */
function hideCanvasAndShowMenu() {
  const canvasEl = document.getElementById('canvas');
  const startOverlay = document.getElementById('startoverlay');

  if (canvasEl) canvasEl.style.display = 'none';
  if (startOverlay) startOverlay.style.display = 'flex';
}

/**
 * Toggles a secondary overlay (controls/story/imprint) against the start overlay.
 * @param {string} canvasId - Element id of the overlay to toggle
 * @returns {void}
 */
function toggle(canvasId) {
  const canvasEl = document.getElementById(canvasId);
  const startOverlay = document.getElementById('startoverlay');

  const isHidden = canvasEl.style.display === 'none' || canvasEl.style.display === '';
  canvasEl.style.display = isHidden ? 'flex' : 'none';
  startOverlay.style.display = isHidden ? 'none' : 'flex';
}

/**
 * Updates fullscreen button visibility based on device type.
 * @returns {void}
 */
function updateFullscreenButtonVisibility() {
  const fsBtn = document.querySelector('.fullscreen-button');
  if (!fsBtn) return;

  if (typeof isMobileLike === 'function' && isMobileLike()) {
    fsBtn.style.display = 'none';
  } else {
    fsBtn.style.display = 'block';
  }
}

/**
 * Returns whether fullscreen is currently active.
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
 * Toggles fullscreen for the document.
 * @returns {void}
 */
function fullscreen() {
  if (isFullscreenActive()) {
    exitFullscreen();
  } else {
    enterFullscreen(document.documentElement);
  }
}

/**
 * Requests fullscreen for a given element.
 * @param {HTMLElement} element - Element to display in fullscreen
 * @returns {void}
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
 * Exits fullscreen mode if supported.
 * @returns {void}
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
 * Attempts to enter fullscreen and suppresses errors.
 * @returns {void}
 */
function enterFullscreenSafe() {
  try {
    if (!isFullscreenActive()) {
      enterFullscreen(document.documentElement);
    }
  } catch (e) {}
}

/**
 * Returns whether the current orientation is landscape.
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
 * Updates rotate overlay and touch controls based on orientation and device type.
 * @returns {void}
 */
function handleOrientation() {
  const rotateOverlay = document.getElementById('rotate-overlay');
  const touchControls = document.getElementById('touch-controls');

  if (!rotateOverlay && !touchControls) return;

  if (!(typeof isMobileLike === 'function' && isMobileLike())) {
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
 * Controls the "screen too small" overlay for non-touch devices.
 * @returns {void}
 */
function handleScreenTooSmallOverlay() {
  const overlay = document.getElementById('screen-too-small-overlay');
  if (!overlay) return;

  const hasTouch = typeof isTouchDevice === 'function' ? isTouchDevice() : false;
  const tooSmall = window.innerWidth <= 800;

  overlay.style.display = !hasTouch && tooSmall ? 'flex' : 'none';
}

/**
 * Refreshes responsive UI state (orientation, overlays, fullscreen button).
 * @returns {void}
 */
function refreshResponsiveLayout() {
  handleOrientation();
  updateFullscreenButtonVisibility();
  handleScreenTooSmallOverlay();
}

/**
 * Unified handler for resize and orientation changes.
 * @returns {void}
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
