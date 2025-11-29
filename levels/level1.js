/**
 * Erstellt Level 1 mit Gegnern, Fireflies, Hintergrund, Coins und Kunai-Coins.
 * @returns {Level}
 */
function createLevel1() {
  return new Level(
    createLevel1Enemies(),
    createLevel1Fireflies(),
    createLevel1BackgroundObjects(),
    createLevel1Coins(),
    createLevel1KunaiCoins()
  );
}

/**
 * Gegner für Level 1.
 * @returns {(OrcGreen|OrcRed)[]}
 */
function createLevel1Enemies() {
  const enemies = [];
  for (let i = 0; i < 9; i++) {
    enemies.push(new OrcGreen());
  }
  for (let i = 0; i < 9; i++) {
    enemies.push(new OrcRed());
  }
  return enemies;
}

/**
 * Fireflies für Level 1.
 * @returns {Firefly[]}
 */
function createLevel1Fireflies() {
  return [
    new Firefly(-680), new Firefly(20),   new Firefly(720),  new Firefly(1420),
    new Firefly(2120), new Firefly(2820), new Firefly(3520), new Firefly(4220),
    new Firefly(4920), new Firefly(5620), new Firefly(6220), new Firefly(6920),
    new Firefly(7620), new Firefly(7320), new Firefly(7920), new Firefly(8620)
  ];
}

const BACKGROUND_SEGMENT_WIDTH = 720;

/**
 * Erzeugt einen Hintergrund-Segmentblock an Position x.
 * @param {number} x
 * @param {boolean} includeFirstLayer1
 * @returns {BackgroundObject[]}
 */
function createBackgroundSegment(x, includeFirstLayer1 = true) {
  const objects = [
    new BackgroundObject('img/5_background/layers/sky.png', x),
    new BackgroundObject('img/5_background/layers/3_third_layer/2.png', x),
    new BackgroundObject('img/5_background/layers/3_third_layer/1.png', x),
    new BackgroundObject('img/5_background/layers/2_second_layer/2.png', x),
    new BackgroundObject('img/5_background/layers/2_second_layer/1.png', x),
    new BackgroundObject('img/5_background/layers/1_first_layer/2.png', x)
  ];

  if (includeFirstLayer1) {
    objects.push(new BackgroundObject('img/5_background/layers/1_first_layer/1.png', x));
  }

  return objects;
}

/**
 * Hintergrundobjekte für Level 1 (Parallax).
 * @returns {BackgroundObject[]}
 */
function createLevel1BackgroundObjects() {
  const w = BACKGROUND_SEGMENT_WIDTH;
  const bg = [];

  bg.push(...createBackgroundSegment(-w));
  bg.push(...createBackgroundSegment(0));
  bg.push(...createBackgroundSegment(1 * w));
  bg.push(...createBackgroundSegment(2 * w));
  bg.push(...createBackgroundSegment(3 * w));
  bg.push(...createBackgroundSegment(4 * w));
  bg.push(...createBackgroundSegment(5 * w, false));

  return bg;
}

/**
 * Ninja-Coins für Level 1.
 * @returns {Coin[]}
 */
function createLevel1Coins() {
  return [
    new Coin(-600, 50), new Coin(-550, 0),   new Coin(-500, 50),
    new Coin(450, 50),  new Coin(550, 50),   new Coin(1100, 50),
    new Coin(1200, 50), new Coin(1750, 50),  new Coin(1850, 50),
    new Coin(2400, 50), new Coin(2500, 50),  new Coin(2950, 50),
    new Coin(3000, 0),  new Coin(3050, 50)
  ];
}

/**
 * Kunai-Coins für Level 1.
 * @returns {KunaiCoin[]}
 */
function createLevel1KunaiCoins() {
  return [
    new KunaiCoin(-500, 120), new KunaiCoin(-550, 170), new KunaiCoin(-600, 120),
    new KunaiCoin(500, 0),    new KunaiCoin(1800, 0),   new KunaiCoin(3000, 0)
  ];
}
