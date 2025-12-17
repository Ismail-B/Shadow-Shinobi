/**
 * Orc global voice loop (static system).
 * Requires Orc class to be defined.
 */
(function () {
  /**
   * Starts the global orc voice loop.
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
   * Decides whether a voice clip should be played.
   */
  Orc.checkAndPlayVoice = function () {
    const now = Date.now();
    const visible = Orc.getVisibleOrcCount();

    if (!visible) return;
    if (!Orc.shouldPlayVoice(now, visible)) return;

    Orc.playNextVoiceClip(now);
  };

  /**
   * Counts orcs that are visible and actively chasing.
   * @returns {number}
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
   * Checks whether enough time passed since the last voice clip.
   * @param {number} now
   * @param {number} visibleCount
   * @returns {boolean}
   */
  Orc.shouldPlayVoice = function (now, visibleCount) {
    const baseDelay = 4500;
    const minDelay = 1200;
    const neededDelay = Math.max(minDelay, baseDelay / visibleCount);

    return now - Orc.lastVoiceTime >= neededDelay;
  };

  /**
   * Plays the next voice clip in a round-robin manner.
   * @param {number} now
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
   * Resets global audio state (e.g., on restart).
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
