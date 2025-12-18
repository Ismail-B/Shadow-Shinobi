/**
 * Game bootstrap and flow helpers.
 * Provides entry points for starting, restarting, and leaving the game.
 */

/**
 * Stops the current world instance, clears tracked intervals, and resets orc audio state.
 * @returns {void}
 */
function stopWorldAndIntervals() {
  clearAllIntervals();

  if (world && typeof world.stop === 'function') {
    world.stop();
  }

  resetOrcAudioState();
}

/**
 * Hides the game-over and win overlays.
 * @returns {void}
 */
function hideEndOverlays() {
  const gameOverOverlay = document.getElementById('game-over-overlay');
  const winOverlay = document.getElementById('win-overlay');

  if (gameOverOverlay) gameOverOverlay.style.display = 'none';
  if (winOverlay) winOverlay.style.display = 'none';
}

/**
 * Initializes the canvas and world and transitions from menu into gameplay.
 * @returns {void}
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
 * Restarts the game without reloading the page.
 * @returns {void}
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
 * Returns to the main menu without reloading the page.
 * @returns {void}
 */
function backToMenu() {
  stopWorldAndIntervals();
  hideEndOverlays();
  hideCanvasAndShowMenu();

  world = null;

  exitGameMode();
  refreshResponsiveLayout();
}
