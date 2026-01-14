import { CONFIG } from "./config.js";

export function createState() {
  return {
    x: CONFIG.ROOM.w / 2,
    y: CONFIG.ROOM.h / 2,
    speed: CONFIG.PLAYER.speed,
    hp: CONFIG.PLAYER.maxHp,
    maxHp: CONFIG.PLAYER.maxHp,
    invincible: 0,
  };
}

export function createGameMeta() {
  return {
    running: false,
    t0: 0,
    last: 0,

    camera: { x: 0, y: 0 },
    fireCooldown: 0,
    elapsed: 0,
    currentRoomId: null,
    clearedRooms: 0,
    totalRooms: 0,
  };
}
