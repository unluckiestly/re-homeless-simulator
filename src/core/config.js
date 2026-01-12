export const CONFIG = Object.freeze({
  WIN_SECONDS: 5 * 60,
  INVENTORY_SLOTS: 9,
  WORLD: { w: 4200, h: 3000 },

  MOVE_SPEED: 260,
  INTERACT_RADIUS: 78,

  CYCLE: { daySec: 90, nightSec: 90 },

  DRAIN: {
    hungerPerMin: 30.0,      // было 2.2  -> ~3.6x
    warmDayPerMin: 30.5,     // было 2.6  -> ~3.65x
    warmNightPerMin: 45.0,  // было 6.5  -> ~3.7x
    hpRegenPerMin: 1.2,
    hpStarvePerMin: 8,
    hpFreezePerMin: 12,
  },

  INSULATION_CAP: 0.5,
  SHELTER_WARM_MULT: 0.25,
});
