import { CONFIG } from "./config.js";

export function createState() {
  return {
    x: CONFIG.WORLD.w / 2,
    y: CONFIG.WORLD.h / 2,
    speed: CONFIG.MOVE_SPEED,

    hp: 100,
    hunger: 100,
    warm: 100,
    insulation: 0,

    inv: Array.from({ length: CONFIG.INVENTORY_SLOTS }, () => null),
  };
}

export function createGameMeta() {
  return {
    running: false,
    t0: 0,
    last: 0,

    camera: { x: 0, y: 0 },

    dayNight: {
      daySec: CONFIG.CYCLE.daySec,
      nightSec: CONFIG.CYCLE.nightSec,
      t: 0,
    },

    winSeconds: CONFIG.WIN_SECONDS,

    flags: {
      inShelter: false,
      isNight: false,
      cyclePos: 0,
      cycleLen: CONFIG.CYCLE.daySec + CONFIG.CYCLE.nightSec,
    },
  };
}
