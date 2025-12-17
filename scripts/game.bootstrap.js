/**
 * =====================================================
 * Game Bootstrap / Flow
 * =====================================================
 * Entry points used by UI (onclick) and internal restart/menu logic.
 */

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
