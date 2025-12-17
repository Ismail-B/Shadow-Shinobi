/**
 * Manages player, enemies, level, sounds, HUD, game loop and rendering.
 */
class World {
  character = new Character();
  level = createLevel1();

  canvas;
  ctx;
  keyboard;

  camera_x = 0;

  statusBarLife = new StatusBarLife();
  statusBarCoin = new StatusBarCoin();
  statusBarKunai = new StatusBarKunai();
  statusBarEndboss = new StatusBarEndboss();

  throwableObjects = [];

  background_sound = new Audio('audio/forest-background.mp3');
  music = new Audio('audio/music.mp3');
  win_sound = new Audio('audio/win.mp3');
  bossIntroSound = new Audio('audio/endboss-alert.mp3');

  coinCollectSounds = [
    new Audio('audio/coin-collect.mp3'),
    new Audio('audio/coin-collect.mp3'),
    new Audio('audio/coin-collect.mp3'),
    new Audio('audio/coin-collect.mp3')
  ];
  nextCoinSoundIndex = 0;

  bossIntroActive = false;
  isMuted = false;

  ninjaCoinsCollected = 0;
  kunaiCoinsCollected = 0;

  kunaiAmmo = 0;
  maxKunaiSegments = 5;
  kunaiPerSegment = 2;
  nextThrowAt = 0;
  throwCooldownMs = 150;

  animationFrameId = null;
  gameLoopIntervalId = null;

  gameEnded = false;
  gameEnding = false;
  endSequenceStarted = false;

  characterDeathFreezeDelayMs = 1300;
  endbossDeathFreezeDelayMs = 1800;

  /**
   * Creates a new game world instance.
   * @param {HTMLCanvasElement} canvas - Rendering canvas.
   * @param {Keyboard} keyboard - Keyboard input instance.
   */
  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.keyboard = keyboard;

    this.registerBossIntroEndHandler();
    this.setWorld();
    this.draw();
    this.run();
    this.registerKeyListeners();
  }
}
