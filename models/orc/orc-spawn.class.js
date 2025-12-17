/**
 * Orc spawn logic.
 * Requires Orc class to be defined.
 */
(function () {
  /**
   * Finds a spawn position while keeping a minimum distance to other orcs.
   * @returns {number}
   */
  Orc.prototype.getSpawnXWithMinDistance = function () {
    const minX = Orc.MIN_SPAWN_X;
    const maxX = Orc.MAX_SPAWN_X;
    const minDist = Orc.MIN_SPAWN_DISTANCE;

    for (let tries = 0; tries < 50; tries++) {
      const candidate = minX + Math.random() * (maxX - minX);
      if (this.isSpawnPositionValid(candidate, minDist)) {
        return candidate;
      }
    }
    return minX + Math.random() * (maxX - minX);
  };

  /**
   * Checks if a candidate spawn position keeps a minimum distance to existing orcs.
   * @param {number} candidate
   * @param {number} minDist
   * @returns {boolean}
   */
  Orc.prototype.isSpawnPositionValid = function (candidate, minDist) {
    for (const o of Orc.instances) {
      if (!o) continue;
      if (Math.abs(candidate - o.x) < minDist) return false;
    }
    return true;
  };
})();
