/**
 * Global sprite path registry for the Character.
 * Load this file before any module/class that consumes these assets.
 *
 * @global
 * @type {{
 *   initial: string,
 *   walking: string[],
 *   idle: string[],
 *   attack: string[],
 *   jumping: string[],
 *   dead: string[],
 *   hurt: string[]
 * }}
 */
window.CHARACTER_ASSETS = {
  initial: 'img/2_character_shinobi/1_idle/idle/Idle_1.png',

  walking: [
    'img/2_character_shinobi/2_walk/Run_1.png',
    'img/2_character_shinobi/2_walk/Run_2.png',
    'img/2_character_shinobi/2_walk/Run_3.png',
    'img/2_character_shinobi/2_walk/Run_4.png',
    'img/2_character_shinobi/2_walk/Run_5.png',
    'img/2_character_shinobi/2_walk/Run_6.png',
    'img/2_character_shinobi/2_walk/Run_7.png',
    'img/2_character_shinobi/2_walk/Run_8.png',
  ],

  idle: [
    'img/2_character_shinobi/1_idle/idle/Idle_1.png',
    'img/2_character_shinobi/1_idle/idle/Idle_2.png',
    'img/2_character_shinobi/1_idle/idle/Idle_3.png',
    'img/2_character_shinobi/1_idle/idle/Idle_4.png',
    'img/2_character_shinobi/1_idle/idle/Idle_5.png',
    'img/2_character_shinobi/1_idle/idle/Idle_6.png',
  ],

  attack: [
    'img/2_character_shinobi/6_attack/Attack_1.png',
    'img/2_character_shinobi/6_attack/Attack_2.png',
    'img/2_character_shinobi/6_attack/Attack_3.png',
    'img/2_character_shinobi/6_attack/Attack_4.png',
    'img/2_character_shinobi/6_attack/Attack_5.png',
  ],

  jumping: [
    'img/2_character_shinobi/3_jump/Jump_1.png',
    'img/2_character_shinobi/3_jump/Jump_2.png',
    'img/2_character_shinobi/3_jump/Jump_3.png',
    'img/2_character_shinobi/3_jump/Jump_4.png',
    'img/2_character_shinobi/3_jump/Jump_5.png',
    'img/2_character_shinobi/3_jump/Jump_6.png',
    'img/2_character_shinobi/3_jump/Jump_7.png',
    'img/2_character_shinobi/3_jump/Jump_8.png',
    'img/2_character_shinobi/3_jump/Jump_9.png',
    'img/2_character_shinobi/3_jump/Jump_10.png',
    'img/2_character_shinobi/3_jump/Jump_11.png',
    'img/2_character_shinobi/3_jump/Jump_12.png',
  ],

  dead: [
    'img/2_character_shinobi/5_dead/Dead_1.png',
    'img/2_character_shinobi/5_dead/Dead_2.png',
    'img/2_character_shinobi/5_dead/Dead_3.png',
    'img/2_character_shinobi/5_dead/Dead_4.png',
  ],

  hurt: [
    'img/2_character_shinobi/4_hurt/Hurt_1.png',
    'img/2_character_shinobi/4_hurt/Hurt_2.png',
  ],
};
