let canvas;
let world;
let keyboard = new Keyboard();

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
