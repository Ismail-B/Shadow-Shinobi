/**
 * Global mute state management.
 * Persists mute preference, updates UI, and applies muting to all relevant audio instances.
 */

/** @type {boolean} */
let isMutedGlobal = false;

/** @type {string} */
const MUTE_STORAGE_KEY = 'shadow_shinobi_muted';

/**
 * Loads the persisted mute state from localStorage.
 * @returns {boolean}
 */
function loadMuteFromStorage() {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

/**
 * Persists the mute state to localStorage.
 * @param {boolean} muted - Whether audio should be muted
 * @returns {void}
 */
function saveMuteToStorage(muted) {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, muted ? 'true' : 'false');
  } catch (e) {}
}

/**
 * Updates the mute button UI to reflect the current mute state.
 * @param {boolean} muted - Whether audio is muted
 * @returns {void}
 */
function applyMuteUi(muted) {
  const soundBtn = document.getElementById('sound-btn');
  const muteBtn = document.getElementById('mute-btn');
  if (!soundBtn || !muteBtn) return;

  soundBtn.style.display = muted ? 'block' : 'none';
  muteBtn.style.display = muted ? 'none' : 'block';
}

/**
 * Sets the mute state and applies it to UI, persistence, and the current world.
 *
 * @param {boolean} muted - Whether audio should be muted
 * @param {{persist?: boolean}} [options] - Optional behavior flags
 * @returns {void}
 */
function setMuteState(muted, options = {}) {
  const { persist = true } = options;

  isMutedGlobal = muted;
  applyMuteUi(muted);

  if (persist) {
    saveMuteToStorage(muted);
  }

  if (world) {
    setMuteOnAllAudios(muted);
  }
}

/**
 * Initializes mute state from storage and updates UI without re-persisting.
 * @returns {void}
 */
function initMuteState() {
  const muted = loadMuteFromStorage();
  setMuteState(muted, { persist: false });
}

/**
 * Applies the current global mute state to the active world instance.
 * @returns {void}
 */
function applyMuteStateToWorld() {
  if (!world) return;
  setMuteOnAllAudios(isMutedGlobal);
}

/**
 * Collects core audio elements from the world and character.
 * @returns {HTMLAudioElement[]}
 */
function collectBaseAudios() {
  if (!world) return [];

  const baseAudios = [
    world.music,
    world.background_sound,
    world.win_sound,
    ...(Array.isArray(world.coinCollectSounds) ? world.coinCollectSounds : []),
    world.character && world.character.walking_sound,
    world.character && world.character.kunai_throw_sound,
    world.character && world.character.hit_sound,
    world.character && world.character.jump_sound,
    world.character && world.character.hurt_sound,
    world.character && world.character.death_sound,
    world.bossIntroSound,
    world.endbossAlertSound
  ];

  return baseAudios.filter((audio) => audio instanceof Audio);
}

/**
 * Adds end boss audio elements to the provided list, if available.
 * @param {HTMLAudioElement[]} list - Target list to append to
 * @returns {void}
 */
function addBossAudios(list) {
  if (!world || !world.endboss) return;

  const boss = world.endboss;

  if (boss.attack_sound) list.push(boss.attack_sound);
  if (boss.dying_sound) list.push(boss.dying_sound);

  if (Array.isArray(boss.hurt_sounds)) {
    boss.hurt_sounds.forEach((sound) => {
      if (sound instanceof Audio) {
        list.push(sound);
      }
    });
  }
}

/**
 * Collects all relevant game audio elements.
 * @returns {HTMLAudioElement[]}
 */
function collectGameAudios() {
  if (!world) return [];

  const list = collectBaseAudios();
  addBossAudios(list);
  return list;
}

/**
 * Applies muting to all orc-related audio sources.
 * @param {boolean} muted - Whether audio should be muted
 * @returns {void}
 */
function updateOrcAudioMuted(muted) {
  if (typeof Orc !== 'undefined' && Array.isArray(Orc.voiceClips)) {
    Orc.voiceClips.forEach((clip) => {
      if (clip instanceof Audio) {
        clip.muted = muted;
      }
    });
  }

  if (typeof Orc !== 'undefined' && Array.isArray(Orc.instances)) {
    Orc.instances.forEach((orc) => {
      if (orc && orc.walking_sound instanceof Audio) {
        orc.walking_sound.muted = muted;
      }
    });
  }
}

/**
 * Applies mute state to all known game audio elements.
 * @param {boolean} muted - Whether audio should be muted
 * @returns {void}
 */
function setMuteOnAllAudios(muted) {
  if (!world) return;

  world.isMuted = muted;

  const gameAudios = collectGameAudios();
  gameAudios.forEach((audio) => {
    audio.muted = muted;
  });

  updateOrcAudioMuted(muted);
}

/**
 * Mutes all game audio.
 * @returns {void}
 */
function muteMusic() {
  setMuteState(true);
}

/**
 * Unmutes all game audio.
 * @returns {void}
 */
function turnOnMusic() {
  setMuteState(false);
}

document.addEventListener('DOMContentLoaded', () => {
  initMuteState();
});
