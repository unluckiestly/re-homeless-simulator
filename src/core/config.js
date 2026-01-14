export const CONFIG = Object.freeze({
  MAP: {
    rows: 3,
    cols: 3,
    rooms: 7,
  },
  ROOM: {
    w: 980,
    h: 640,
    wall: 48,
    door: 140,
  },
  PLAYER: {
    speed: 300,
    maxHp: 100,
    fireCooldown: 0.18,
    bulletSpeed: 620,
    bulletDamage: 16,
  },
  ENEMY: {
    speed: 120,
    hp: 40,
    radius: 16,
    damage: 18,
  },
  PICKUP: {
    heartHeal: 22,
  },
  CAM: {
    followLerp: 0.18,
  },
});
