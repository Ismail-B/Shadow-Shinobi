/**
 * =====================================================
 * Game Layout / Responsive / Overlays / Fullscreen
 * =====================================================
 * Handles UI layout changes for game mode, overlays,
 * fullscreen, orientation and screen-size constraints.
 */

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
 * Shows the fullscreen button only on non-mobile setups.
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
 * Controls the "screen too small" overlay for
 * non-touch devices with width <= 800px.
 */
function handleScreenTooSmallOverlay() {
  const overlay = document.getElementById('screen-too-small-overlay');
  if (!overlay) return;

  const hasTouch = typeof isTouchDevice === 'function' ? isTouchDevice() : false;
  const tooSmall = window.innerWidth <= 800;

  if (!hasTouch && tooSmall) {
    overlay.style.display = 'flex';
  } else {
    overlay.style.display = 'none';
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
