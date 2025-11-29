let canvas;
let world;
let keyboard = new Keyboard();
let intervalIds = [];

/* ========= GLOBALER MUTE-STATUS NUR FÜR DIE AKTUELLE SESSION ========= */

// Wird NICHT mehr in localStorage gespeichert.
// Geht also beim Neuladen der Seite verloren (zurück auf false).
let isMutedGlobal = false;

/**
 * Falls ein neuer World erstellt wird (init / restart),
 * den aktuellen Mute-Status auf die Sounds anwenden.
 * → wirkt bei Restart / Menü-Neustart, aber NICHT nach Seiten-Reload.
 */
function applyMuteStateToWorld() {
  if (!world) return;
  if (isMutedGlobal) {
    // sorgt dafür, dass world.isMuted = true ist und alle Sounds gemutet werden
    muteMusic();
  } else {
    world.isMuted = false;
  }
}

/* ========= setInterval-Sammlung ========= */

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

/* ========= SPIELSTEUERUNG ========= */

function init() {
  canvas = document.getElementById("canvas");

  // Orc-Sound-Statics sauber resetten (auch beim allerersten Start unkritisch)
  if (typeof Orc !== 'undefined' && typeof Orc.resetAudioState === 'function') {
    Orc.resetAudioState();
  }

  world = new World(canvas, keyboard);

  // aktuellen Mute-Status auf den neuen World anwenden
  applyMuteStateToWorld();
}

function toggle(canvasId) {
  let canvas = document.getElementById(canvasId);
  let startOverlay = document.getElementById("startoverlay");

  if (canvas.style.display === "none" || canvas.style.display === "") {
    canvas.style.display = "block";
    startOverlay.style.display = "none";
  } else {
    canvas.style.display = "none";
    startOverlay.style.display = "flex";
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

  // Mute-Status auf neuen World anwenden
  applyMuteStateToWorld();
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

/* ========= Sound + Fullscreen ========= */

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

/**
 * ALLES stummschalten:
 * - Musik, Hintergrund, Win-Sound
 * - alle Character-Sounds
 * - alle Orc-Sounds (voiceClips + Footsteps)
 * - alle Endboss-Sounds + Boss-Intro
 */
function muteMusic() {
  // globalen Status setzen (Session-weit, aber nicht über Reload hinaus)
  isMutedGlobal = true;

  if (!world) return;

  // Flag, das vom Endboss benutzt wird
  world.isMuted = true;

  // zentrale Liste der bekannten Sounds im World/Character
  const gameAudios = [
    world.music,
    world.background_sound,
    world.win_sound,
    world.character && world.character.walking_sound,
    world.character && world.character.kunai_throw_sound,
    world.character && world.character.hit_sound,
    world.character && world.character.jump_sound,
    world.character && world.character.hurt_sound,
    world.character && world.character.death_sound,
    // Boss-Intro / Alert-Sound (falls vorhanden)
    world.endbossAlertSound
  ];

  // Endboss-Sounds einsammeln (falls es einen gibt)
  if (world.endboss) {
    const boss = world.endboss;
    if (boss.attack_sound) gameAudios.push(boss.attack_sound);
    if (boss.dying_sound) gameAudios.push(boss.dying_sound);
    if (Array.isArray(boss.hurt_sounds)) {
      boss.hurt_sounds.forEach(s => gameAudios.push(s));
    }
  }

  gameAudios.forEach(a => {
    if (a instanceof Audio) {
      a.muted = true;
    }
  });

  // Orc-Voiceclips global muten
  if (typeof Orc !== 'undefined' && Array.isArray(Orc.voiceClips)) {
    Orc.voiceClips.forEach(clip => {
      if (clip instanceof Audio) {
        clip.muted = true;
      }
    });
  }

  // Lauf-Sound je Orc (falls verwendet) ebenfalls muten
  if (typeof Orc !== 'undefined' && Array.isArray(Orc.instances)) {
    Orc.instances.forEach(o => {
      if (o && o.walking_sound instanceof Audio) {
        o.walking_sound.muted = true;
      }
    });
  }
}

/**
 * ALLE Sounds wieder aktivieren
 */
function turnOnMusic() {
  // globalen Status setzen (Session-weit, aber nicht über Reload hinaus)
  isMutedGlobal = false;

  if (!world) return;

  // Flag für Endboss-Sound-Logik
  world.isMuted = false;

  const gameAudios = [
    world.music,
    world.background_sound,
    world.win_sound,
    world.character && world.character.walking_sound,
    world.character && world.character.kunai_throw_sound,
    world.character && world.character.hit_sound,
    world.character && world.character.jump_sound,
    world.character && world.character.hurt_sound,
    world.character && world.character.death_sound,
    // Boss-Intro / Alert-Sound
    world.bossIntroSound 
  ];

  if (world.endboss) {
    const boss = world.endboss;
    if (boss.attack_sound) gameAudios.push(boss.attack_sound);
    if (boss.dying_sound) gameAudios.push(boss.dying_sound);
    if (Array.isArray(boss.hurt_sounds)) {
      boss.hurt_sounds.forEach(s => gameAudios.push(s));
    }
  }

  gameAudios.forEach(a => {
    if (a instanceof Audio) {
      a.muted = false;
    }
  });

  if (typeof Orc !== 'undefined' && Array.isArray(Orc.voiceClips)) {
    Orc.voiceClips.forEach(clip => {
      if (clip instanceof Audio) {
        clip.muted = false;
      }
    });
  }

  if (typeof Orc !== 'undefined' && Array.isArray(Orc.instances)) {
    Orc.instances.forEach(o => {
      if (o && o.walking_sound instanceof Audio) {
        o.walking_sound.muted = false;
      }
    });
  }
}

function fullscreen() {
  // Prüfen, ob wir bereits im Vollbildmodus sind
  if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
    // → Vollbild verlassen
    exitFullscreen();
  } else {
    // → Vollbild aktivieren
    const elem = document.documentElement; // <html>
    enterFullscreen(elem);
  }
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
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}


/* ========= Keyboard ========= */

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
