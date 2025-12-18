/**
 * Central game world controller.
 * Owns the level state, player, enemies, HUD, audio, render loop, and logic loop.
 */
class World {
  /** @type {Character} */
  character = new Character();

  /** @type {Object} */
  level = createLevel1();

  /** @type {HTMLCanvasElement} */
  canvas;

  /** @type {CanvasRenderingContext2D} */
  ctx;

  /** @type {Keyboard} */
  keyboard;

  /** @type {number} */
  camera_x = 0;

  /** @type {StatusBarLife} */
  statusBarLife = new StatusBarLife();

  /** @type {StatusBarCoin} */
  statusBarCoin = new StatusBarCoin();

  /** @type {StatusBarKunai} */
  statusBarKunai = new StatusBarKunai();

  /** @type {StatusBarEndboss} */
  statusBarEndboss = new StatusBarEndboss();

  /** @type {ThrowableObject[]} */
  throwableObjects = [];

  /** @type {HTMLAudioElement} */
  background_sound = new Audio('audio/forest-background.mp3');

  /** @type {HTMLAudioElement} */
  music = new Audio('audio/music.mp3');

  /** @type {HTMLAudioElement} */
  win_sound = new Audio('audio/win.mp3');

  /** @type {HTMLAudioElement} */
  bossIntroSound = new Audio('audio/endboss-alert.mp3');

  /** @type {HTMLAudioElement[]} */
  coinCollectSounds = [
    new Audio('audio/coin-collect.mp3'),
    new Audio('audio/coin-collect.mp3'),
    new Audio('audio/coin-collect.mp3'),
    new Audio('audio/coin-collect.mp3')
  ];

  /** @type {number} */
  nextCoinSoundIndex = 0;

  /** @type {boolean} */
  bossIntroActive = false;

  /** @type {boolean} */
  isMuted = false;

  /** @type {number} */
  ninjaCoinsCollected = 0;

  /** @type {number} */
  kunaiCoinsCollected = 0;

  /** @type {number} */
  kunaiAmmo = 0;

  /** @type {number} */
  maxKunaiSegments = 5;

  /** @type {number} */
  kunaiPerSegment = 2;

  /** @type {number} */
  nextThrowAt = 0;

  /** @type {number} */
  throwCooldownMs = 150;

  /** @type {number|null} */
  animationFrameId = null;

  /** @type {number|null} */
  gameLoopIntervalId = null;

  /** @type {boolean} */
  gameEnded = false;

  /** @type {boolean} */
  gameEnding = false;

  /** @type {boolean} */
  endSequenceStarted = false;

  /** @type {number} */
  characterDeathFreezeDelayMs = 1300;

  /** @type {number} */
  endbossDeathFreezeDelayMs = 1800;

  /**
   * Creates a new World instance.
   * @param {HTMLCanvasElement} canvas - Rendering canvas
   * @param {Keyboard} keyboard - Keyboard input instance
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
