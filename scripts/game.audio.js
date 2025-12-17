/**
 * =====================================================
 * Game Audio & Mute Management
 * =====================================================
 * Handles global mute state (UI + storage) and applies
 * muting to all relevant game audio instances.
 */

// -----------------------------------------------------
// Mute state (persisted)
// -----------------------------------------------------

// mute state is persisted across sessions
let isMutedGlobal = false;

const MUTE_STORAGE_KEY = 'shadow_shinobi_muted';

/**
 * Loads mute state from localStorage.
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
 * Saves mute state to localStorage.
 * @param {boolean} muted
 */
function saveMuteToStorage(muted) {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, muted ? 'true' : 'false');
  } catch (e) {
    // intentionally ignored
  }
}

/**
 * Sets the sound button UI based on mute state.
 * @param {boolean} muted
 */
function applyMuteUi(muted) {
  const soundBtn = document.getElementById('sound-btn'); // icon to enable sound
  const muteBtn = document.getElementById('mute-btn'); // icon to mute sound
  if (!soundBtn || !muteBtn) return;

  soundBtn.style.display = muted ? 'block' : 'none';
  muteBtn.style.display = muted ? 'none' : 'block';
}

/**
 * Central mute state setter: updates global flag, UI, storage, and world audio.
 * @param {boolean} muted
 * @param {{persist?: boolean}} options
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
 * Initializes mute state (storage -> UI + global flag).
 */
function initMuteState() {
  const muted = loadMuteFromStorage();
  setMuteState(muted, { persist: false });
}

/**
 * Applies the global mute state to the current world.
 */
function applyMuteStateToWorld() {
  if (!world) return;
  setMuteOnAllAudios(isMutedGlobal);
}

// -----------------------------------------------------
// Audio collection & muting
// -----------------------------------------------------

/**
 * Collects base audio references from the world and character.
 * @returns {HTMLAudioElement[]}
 */
function collectBaseAudios() {
  if (!world) {
    return [];
  }

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
 * Adds boss-related audios to the given list.
 * @param {HTMLAudioElement[]} list
 */
function addBossAudios(list) {
  if (!world || !world.endboss) {
    return;
  }

  const boss = world.endboss;

  if (boss.attack_sound) {
    list.push(boss.attack_sound);
  }
  if (boss.dying_sound) {
    list.push(boss.dying_sound);
  }

  if (Array.isArray(boss.hurt_sounds)) {
    boss.hurt_sounds.forEach((sound) => {
      if (sound instanceof Audio) {
        list.push(sound);
      }
    });
  }
}

/**
 * Builds a list of all relevant game audio elements.
 * @returns {HTMLAudioElement[]}
 */
function collectGameAudios() {
  if (!world) {
    return [];
  }

  const list = collectBaseAudios();
  addBossAudios(list);
  return list;
}

/**
 * Updates the muted state for all Orc sounds.
 * @param {boolean} muted
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
 * Applies the mute state to all game sounds.
 * @param {boolean} muted
 */
function setMuteOnAllAudios(muted) {
  if (!world) {
    return;
  }

  world.isMuted = muted;

  const gameAudios = collectGameAudios();
  gameAudios.forEach((audio) => {
    audio.muted = muted;
  });

  updateOrcAudioMuted(muted);
}

/**
 * Mutes all game audio.
 */
function muteMusic() {
  setMuteState(true);
}

/**
 * Unmutes all game audio.
 */
function turnOnMusic() {
  setMuteState(false);
}

// -----------------------------------------------------
// Init hook (mute state needs to be set early)
// -----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  initMuteState();
});
