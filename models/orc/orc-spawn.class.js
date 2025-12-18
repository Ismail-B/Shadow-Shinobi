/**
 * Adds spawn position helper methods to the Orc prototype.
 */
(function () {
  /**
   * Returns a random spawn X position that maintains a minimum distance
   * to all existing orcs.
   *
   * @returns {number} Valid spawn X coordinate
   */
  Orc.prototype.getSpawnXWithMinDistance = function () {
    const minX = Orc.MIN_SPAWN_X;
    const maxX = Orc.MAX_SPAWN_X;
    const minDist = Orc.MIN_SPAWN_DISTANCE;

    for (let i = 0; i < 50; i++) {
      const candidate = minX + Math.random() * (maxX - minX);
      if (this.isSpawnPositionValid(candidate, minDist)) {
        return candidate;
      }
    }

    return minX + Math.random() * (maxX - minX);
  };

  /**
   * Checks whether a spawn X position keeps the required distance
   * to all existing orcs.
   *
   * @param {number} candidate - X position to validate
   * @param {number} minDist - Minimum allowed distance
   * @returns {boolean} True if the position is valid
   */
  Orc.prototype.isSpawnPositionValid = function (candidate, minDist) {
    for (const orc of Orc.instances) {
      if (!orc) continue;
      if (Math.abs(candidate - orc.x) < minDist) return false;
    }
    return true;
  };
})();
