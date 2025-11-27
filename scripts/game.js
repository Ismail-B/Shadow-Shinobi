let canvas;
let world;
let keyboard = new Keyboard();
let intervalIds = [];

/** Alle setInterval-Aufrufe einsammeln */
const _originalSetInterval = window.setInterval;
window.setInterval = function (fn, delay) {
  const id = _originalSetInterval(fn, delay);
  intervalIds.push(id);
  return id;
};

function clearAllIntervals() {
  intervalIds.forEach(id => clearInterval(id));
  intervalIds = [];
}

function init() {
  canvas = document.getElementById("canvas");

  // Orc-Sound-Statics sauber resetten (auch beim allerersten Start unkritisch)
  if (typeof Orc !== 'undefined' && typeof Orc.resetAudioState === 'function') {
    Orc.resetAudioState();
  }

  world = new World(canvas, keyboard);
}

function toggle(canvasId) {
  let canvas = document.getElementById(canvasId);
  let startOverlay = document.getElementById("startoverlay");

  if (canvas.style.display === "none" || canvas.style.display === "") {
    canvas.style.display = "block";
    startOverlay.style.display = "none";
  } else {
    canvas.style.display = "none";
    startOverlay.style.display = "block";
  }
}

/** Richtiger Restart ohne Reload */
function restartGame() {
  clearAllIntervals();

  if (world && typeof world.stop === 'function') {
    world.stop();
  }

  // Orc-Statics zurücksetzen, damit der globale Sound-Loop neu sauber startet
  if (typeof Orc !== 'undefined' && typeof Orc.resetAudioState === 'function') {
    Orc.resetAudioState();
  }

  const go = document.getElementById('game-over-overlay');
  const win = document.getElementById('win-overlay');
  if (go) go.style.display = 'none';
  if (win) win.style.display = 'none';

  const canvasEl = document.getElementById('canvas');
  canvasEl.style.display = 'block';

  world = new World(canvasEl, keyboard);
}

/** Zurück ins Menü, auch ohne Reload */
function backToMenu() {
  clearAllIntervals();

  if (world && typeof world.stop === 'function') {
    world.stop();
  }

  // Auch beim Zurück ins Menü aufräumen
  if (typeof Orc !== 'undefined' && typeof Orc.resetAudioState === 'function') {
    Orc.resetAudioState();
  }

  const go = document.getElementById('game-over-overlay');
  const win = document.getElementById('win-overlay');
  if (go) go.style.display = 'none';
  if (win) win.style.display = 'none';

  const canvasEl = document.getElementById('canvas');
  canvasEl.style.display = 'none';

  const startOverlay = document.getElementById('startoverlay');
  startOverlay.style.display = 'flex';

  world = null;
}

/* Sound + Fullscreen */

function toggleMusic(id) {
  let loud = document.getElementById(id);
  let mute = document.getElementById('mute-btn');

  if (getComputedStyle(loud).display === "none") {
    loud.style.display = "block";
    mute.style.display = "none";
  } else {
    loud.style.display = "none";
    mute.style.display = "block";
  }
}

function muteMusic() {
  if (!world) return;
  world.music.muted = true;
  world.background_sound.muted = true;
  world.character.walking_sound.muted = true;
}

function turnOnMusic() {
  if (!world) return;
  world.music.muted = false;
  world.background_sound.muted = false;
  world.character.walking_sound.muted = false;
}

function fullscreen() {
  let fullscreen = document.getElementById('canvas');
  enterFullscreen(fullscreen);
}

function enterFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

/* Keyboard */

window.addEventListener("keydown", (e) => {
  if (e.key == "w" || "ArrowUp") {
    keyboard.UP = true;
  }
  if (e.key == "ArrowUp") {
    keyboard.UP = true;
  }

  if (e.key == "a") {
    keyboard.LEFT = true;
  }
  if (e.key == "ArrowLeft") {
    keyboard.LEFT = true;
  }
  if (e.key == "s") {
    keyboard.DOWN = true;
  }
  if (e.key == "ArrowDown") {
    keyboard.DOWN = true;
  }
  if (e.key == "d") {
    keyboard.RIGHT = true;
  }
  if (e.key == "ArrowRight") {
    keyboard.RIGHT = true;
  }
  if (e.key == " ") {
    keyboard.SPACE = true;
  }
  if (e.key == "v") {
    keyboard.D = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key == "w" || "ArrowUp") {
    keyboard.UP = false;
  }
  if (e.key == "ArrowUp") {
    keyboard.UP = false;
  }

  if (e.key == "a") {
    keyboard.LEFT = false;
  }
  if (e.key == "ArrowLeft") {
    keyboard.LEFT = false;
  }
  if (e.key == "s") {
    keyboard.DOWN = false;
  }
  if (e.key == "ArrowDown") {
    keyboard.DOWN = false;
  }
  if (e.key == "d") {
    keyboard.RIGHT = false;
  }
  if (e.key == "ArrowRight") {
    keyboard.RIGHT = false;
  }
  if (e.key == " ") {
    keyboard.SPACE = false;
  }
  if (e.key == "v") {
    keyboard.D = false;
  }
});
