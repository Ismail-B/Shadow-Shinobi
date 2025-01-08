let canvas;
let world;
let keyboard = new Keyboard();
let intervalIds = [];


function init() {
  canvas = document.getElementById("canvas");
  world = new World(canvas, keyboard);

  // console.log('My Character is ', world.character);
  // console.log('My Chicken is ', world.enemies);
  // console.log('My Firefly is ', world.background);
  // console.log(keyboard);
}

function toggle(canvasId) {
  let canvas = document.getElementById(canvasId); // Holen des Canvas-Elements über den Parameter
  let startOverlay = document.getElementById("startoverlay"); // Holen des Start-Overlays

  // Überprüfen, ob das Canvas derzeit verborgen ist (display: none)
  if (canvas.style.display === "none" || canvas.style.display === "") {
    canvas.style.display = "block"; // Setze das Canvas auf sichtbar
    startOverlay.style.display = "none"; // Verberge das Start-Overlay
  } else {
    canvas.style.display = "none"; // Setze das Canvas auf unsichtbar
    startOverlay.style.display = "block"; // Zeige das Start-Overlay
  }
}

function toggleMusic(id) {
    let loud = document.getElementById(id);
    let mute = document.getElementById('mute-btn');

    // Zustand des Elements prüfen
    if (getComputedStyle(loud).display === "none") {
        loud.style.display = "block";
        mute.style.display = "none";
    } else {
        loud.style.display = "none";
        mute.style.display = "block";
    }
}

function muteMusic() {
    world.music.muted = true;
    world.background_sound.muted = true;
    world.character.walking_sound.muted = true;
}

function turnOnMusic() {
    world.music.muted = false;
    world.background_sound.muted = false;
    world.character.walking_sound.muted = false;
}

function fullscreen() {
    let fullscreen = document.getElementById('canvas');
    enterFullscreen(fullscreen);
}

function enterFullscreen(element) {
    if(element.requestFullscreen) {
      element.requestFullscreen();
    } else if(element.msRequestFullscreen) {      // for IE11 (remove June 15, 2022)
      element.msRequestFullscreen();
    } else if(element.webkitRequestFullscreen) {  // iOS Safari
      element.webkitRequestFullscreen();
    }
}

function exitFullscreen() {
    if(document.exitFullscreen) {
      document.exitFullscreen();
    } else if(document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
}




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
  if (e.key == "d") {
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
  if (e.key == "d") {
    keyboard.D = false;
  }
});

