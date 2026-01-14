import { CONFIG } from "../core/config.js";
import { rand, randi } from "../core/utils.js";
import { EN } from "../core/lang.js";

const T = EN;

export const pickupDefs = {
  heart: { name: T.pickups.heart, icon: "❤" },
};

function roomKey(row, col) {
  return `${row}:${col}`;
}

export function makeRooms() {
  const { rows, cols, rooms } = CONFIG.MAP;
  const startRow = Math.floor(rows / 2);
  const startCol = Math.floor(cols / 2);
  const open = new Set([roomKey(startRow, startCol)]);
  let row = startRow;
  let col = startCol;

  for (let i = 0; i < rooms * 4 && open.size < rooms; i++) {
    const dir = randi(0, 3);
    if (dir === 0) row = Math.max(0, row - 1);
    if (dir === 1) row = Math.min(rows - 1, row + 1);
    if (dir === 2) col = Math.max(0, col - 1);
    if (dir === 3) col = Math.min(cols - 1, col + 1);
    open.add(roomKey(row, col));
  }

  const roomList = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!open.has(roomKey(r, c))) continue;
      const exits = {
        up: open.has(roomKey(r - 1, c)),
        down: open.has(roomKey(r + 1, c)),
        left: open.has(roomKey(r, c - 1)),
        right: open.has(roomKey(r, c + 1)),
      };
      roomList.push({
        id: roomKey(r, c),
        row: r,
        col: c,
        exits,
        cleared: false,
        enemies: [],
        pickups: [],
      });
    }
  }

  return {
    rooms: roomList,
    startId: roomKey(startRow, startCol),
  };
}

export function spawnEnemies(count) {
  const enemies = [];
  const pad = CONFIG.ROOM.wall + 60;
  for (let i = 0; i < count; i++) {
    enemies.push({
      id: Math.random().toString(16).slice(2),
      x: rand(pad, CONFIG.ROOM.w - pad),
      y: rand(pad, CONFIG.ROOM.h - pad),
      hp: CONFIG.ENEMY.hp,
      r: CONFIG.ENEMY.radius,
    });
  }
  return enemies;
}

export function spawnPickup(type, x, y) {
  return {
    id: Math.random().toString(16).slice(2),
    type,
    x,
    y,
    r: 14,
  };
}
