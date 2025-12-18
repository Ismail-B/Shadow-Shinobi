/**
 * Adds a global voice loop system to the Orc class.
 */
(function () {
  /**
   * Starts (or restarts) the global orc voice loop interval.
   * @returns {void}
   */
  Orc.startVoiceLoop = function () {
    if (Orc.voiceLoopId) {
      clearInterval(Orc.voiceLoopId);
      Orc.voiceLoopId = null;
    }

    Orc.voiceLoopId = setInterval(() => {
      Orc.checkAndPlayVoice();
    }, 400);
  };

  /**
   * Evaluates whether an orc voice clip should be played at the current time.
   * @returns {void}
   */
  Orc.checkAndPlayVoice = function () {
    const now = Date.now();
    const visibleCount = Orc.getVisibleOrcCount();

    if (!visibleCount) return;
    if (!Orc.shouldPlayVoice(now, visibleCount)) return;

    Orc.playNextVoiceClip(now);
  };

  /**
   * Counts orcs that are eligible for voice playback (visible, chasing, alive).
   * @returns {number} Number of eligible orcs
   */
  Orc.getVisibleOrcCount = function () {
    let count = 0;

    for (const orc of Orc.instances) {
      if (orc && !orc.isDying && orc.isVisibleAndChasing()) {
        count++;
      }
    }
    return count;
  };

  /**
   * Determines whether enough time has passed since the last voice clip.
   * Delay decreases with more visible orcs, but is capped by a minimum.
   *
   * @param {number} now - Current timestamp in milliseconds
   * @param {number} visibleCount - Number of eligible orcs
   * @returns {boolean} True if a voice clip may be played
   */
  Orc.shouldPlayVoice = function (now, visibleCount) {
    const baseDelayMs = 4500;
    const minDelayMs = 1200;
    const neededDelayMs = Math.max(minDelayMs, baseDelayMs / visibleCount);

    return now - Orc.lastVoiceTime >= neededDelayMs;
  };

  /**
   * Plays the next voice clip using round-robin selection and updates timestamps.
   * @param {number} now - Current timestamp in milliseconds
   * @returns {void}
   */
  Orc.playNextVoiceClip = function (now) {
    if (Orc.isGameMuted()) return;

    Orc.lastVoiceIndex = (Orc.lastVoiceIndex + 1) % Orc.voiceClips.length;

    const clip = Orc.voiceClips[Orc.lastVoiceIndex];
    Orc.setVolumeSafe(clip, 0.25);
    Orc.setPlaybackRateSafe(clip, 0.9 + Math.random() * 0.2);
    Orc.resetAudioSafe(clip);

    Orc.playAudioSafe(clip);
    Orc.lastVoiceTime = now;
  };

  /**
   * Resets global voice loop and tracking state (e.g., on restart).
   * @returns {void}
   */
  Orc.resetAudioState = function () {
    if (Orc.voiceLoopId) {
      clearInterval(Orc.voiceLoopId);
      Orc.voiceLoopId = null;
    }

    Orc.instances = [];
    Orc.lastVoiceTime = 0;
    Orc.lastVoiceIndex = -1;
  };
})();
