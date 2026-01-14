import { CONFIG } from "./core/config.js";
import { clamp, lerp } from "./core/utils.js";
import { createState, createGameMeta } from "./core/state.js";
import { createInput } from "./game/input.js";
import { makeRooms, spawnEnemies, spawnPickup } from "./game/world.js";
import { createUI } from "./game/ui.js";
import { createRenderer } from "./game/render.js";

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const isMobile = matchMedia("(pointer: coarse)").matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const dprState = { value: 1 };
const DPR = () => dprState.value;

function updateDPR() {
  const raw = window.devicePixelRatio || 1;
  const cap = isMobile ? 1.25 : 2;
  dprState.value = Math.max(1, Math.min(cap, raw));
}

function resize() {
  updateDPR();
  canvas.width = Math.floor(innerWidth * DPR());
  canvas.height = Math.floor(innerHeight * DPR());
}

window.addEventListener("resize", resize);
resize();

const input = createInput(canvas, DPR, { isMobile });

const mobileControls = document.getElementById("mobileControls");
const stickEl = document.getElementById("stick");
const stickKnob = document.getElementById("stickKnob");

if (isMobile) {
  mobileControls?.classList.add("on");
  input.attachMobile(stickEl, stickKnob);

  window.addEventListener("contextmenu", (e) => e.preventDefault());
}

const ui = createUI();
const renderer = createRenderer(canvas, ctx, DPR);

function createGame() {
  const { rooms, startId } = makeRooms();
  const roomsById = new Map(rooms.map((room) => [room.id, room]));

  for (const room of rooms) {
    if (room.id === startId) continue;
    room.enemies = spawnEnemies(3 + Math.floor(Math.random() * 4));
  }

  return {
    state: createState(),
    meta: createGameMeta(),
    rooms,
    roomsById,
    bullets: [],
    playerDamage: CONFIG.PLAYER.bulletDamage,
    startRoomId: startId,
  };
}

let game = createGame();

function reset() {
  game = createGame();
  game.meta.running = false;
  game.meta.currentRoomId = game.startRoomId;
  game.meta.totalRooms = game.rooms.length;
  ui.showEnd(false);
  ui.showStart(true);
}

function start() {
  game.meta.running = true;
  game.meta.t0 = performance.now();
  game.meta.last = game.meta.t0;
  game.meta.elapsed = 0;
  game.meta.currentRoomId = game.startRoomId;
  game.meta.totalRooms = game.rooms.length;
  const startRoom = game.roomsById.get(game.startRoomId);
  startRoom.cleared = startRoom.enemies.length === 0;
  game.meta.clearedRooms = startRoom.cleared ? 1 : 0;
  game.state.x = CONFIG.ROOM.w / 2;
  game.state.y = CONFIG.ROOM.h / 2;
  ui.showStart(false);
}

function end(victory) {
  game.meta.running = false;
  const survived = Math.max(0, Math.floor(game.meta.elapsed));
  ui.showEndScreen(victory, survived);
}

function roomId(row, col) {
  return `${row}:${col}`;
}

function enterRoom(nextId, fromDir) {
  const room = game.roomsById.get(nextId);
  if (!room) return;
  game.meta.currentRoomId = nextId;
  game.bullets = [];
  const radius = 18;
  if (fromDir === "up") {
    game.state.y = CONFIG.ROOM.h - radius - 6;
    game.state.x = CONFIG.ROOM.w / 2;
  }
  if (fromDir === "down") {
    game.state.y = radius + 6;
    game.state.x = CONFIG.ROOM.w / 2;
  }
  if (fromDir === "left") {
    game.state.x = CONFIG.ROOM.w - radius - 6;
    game.state.y = CONFIG.ROOM.h / 2;
  }
  if (fromDir === "right") {
    game.state.x = radius + 6;
    game.state.y = CONFIG.ROOM.h / 2;
  }
}

function spawnBullet(dirX, dirY) {
  const st = game.state;
  const len = Math.hypot(dirX, dirY) || 1;
  const nx = dirX / len;
  const ny = dirY / len;
  game.bullets.push({
    x: st.x,
    y: st.y,
    vx: nx * CONFIG.PLAYER.bulletSpeed,
    vy: ny * CONFIG.PLAYER.bulletSpeed,
    r: 5,
  });
  game.meta.fireCooldown = CONFIG.PLAYER.fireCooldown;
}

function handleShooting(dt, moveDir) {
  game.meta.fireCooldown = Math.max(0, game.meta.fireCooldown - dt);
  if (game.meta.fireCooldown > 0) return;

  let aimX = 0;
  let aimY = 0;

  if (!isMobile && input.mouse.down) {
    const worldX = input.mouse.x / DPR() + game.meta.camera.x;
    const worldY = input.mouse.y / DPR() + game.meta.camera.y;
    aimX = worldX - game.state.x;
    aimY = worldY - game.state.y;
  } else {
    if (input.keys.has("ArrowUp")) aimY -= 1;
    if (input.keys.has("ArrowDown")) aimY += 1;
    if (input.keys.has("ArrowLeft")) aimX -= 1;
    if (input.keys.has("ArrowRight")) aimX += 1;
  }

  if (isMobile && input.touchMove.active) {
    aimX = moveDir.x;
    aimY = moveDir.y;
  }

  if (Math.hypot(aimX, aimY) < 0.1) return;
  spawnBullet(aimX, aimY);
}

function update(dt) {
  const st = game.state;
  const meta = game.meta;
  meta.elapsed += dt;
  const room = game.roomsById.get(meta.currentRoomId);

  let mvx = 0, mvy = 0;

  if (isMobile && input.touchMove.active) {
    mvx = input.touchMove.x;
    mvy = input.touchMove.y;
  } else {
    if (input.keys.has("KeyW")) mvy -= 1;
    if (input.keys.has("KeyS")) mvy += 1;
    if (input.keys.has("KeyA")) mvx -= 1;
    if (input.keys.has("KeyD")) mvx += 1;
  }

  const mag = Math.hypot(mvx, mvy) || 1;
  mvx /= mag;
  mvy /= mag;

  st.x += mvx * st.speed * dt;
  st.y += mvy * st.speed * dt;

  const radius = 18;
  const roomW = CONFIG.ROOM.w;
  const roomH = CONFIG.ROOM.h;
  st.x = clamp(st.x, radius, roomW - radius);
  st.y = clamp(st.y, radius, roomH - radius);

  handleShooting(dt, { x: mvx, y: mvy });

  for (const bullet of game.bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
  }

  game.bullets = game.bullets.filter((bullet) =>
    bullet.x > -20 && bullet.x < roomW + 20 && bullet.y > -20 && bullet.y < roomH + 20
  );

  const enemies = room.enemies;
  for (const enemy of enemies) {
    const dx = st.x - enemy.x;
    const dy = st.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;
    enemy.x += (dx / dist) * CONFIG.ENEMY.speed * dt;
    enemy.y += (dy / dist) * CONFIG.ENEMY.speed * dt;

    if (dist < enemy.r + radius && st.invincible <= 0) {
      st.hp = clamp(st.hp - CONFIG.ENEMY.damage, 0, st.maxHp);
      st.invincible = 0.8;
    }
  }

  for (const bullet of game.bullets) {
    for (const enemy of enemies) {
      const dx = bullet.x - enemy.x;
      const dy = bullet.y - enemy.y;
      if (dx * dx + dy * dy <= (enemy.r + bullet.r) ** 2) {
        enemy.hp -= game.playerDamage;
        bullet.hit = true;
      }
    }
  }

  game.bullets = game.bullets.filter((bullet) => !bullet.hit);
  room.enemies = enemies.filter((enemy) => enemy.hp > 0);

  if (!room.cleared && room.enemies.length === 0) {
    room.cleared = true;
    meta.clearedRooms += 1;
    if (Math.random() < 0.5) {
      room.pickups.push(spawnPickup("heart", roomW / 2, roomH / 2));
    }
  }

  if (st.invincible > 0) {
    st.invincible = Math.max(0, st.invincible - dt);
  }

  for (const pickup of room.pickups) {
    const dx = st.x - pickup.x;
    const dy = st.y - pickup.y;
    if (dx * dx + dy * dy <= (pickup.r + radius) ** 2) {
      st.hp = Math.min(st.maxHp, st.hp + CONFIG.PICKUP.heartHeal);
      pickup.taken = true;
    }
  }
  room.pickups = room.pickups.filter((pickup) => !pickup.taken);

  if (st.hp <= 0.001) end(false);
  if (meta.clearedRooms >= meta.totalRooms) end(true);

  if (room.cleared) {
    const doorHalf = CONFIG.ROOM.door / 2;
    if (room.exits.up && st.y <= radius && Math.abs(st.x - roomW / 2) < doorHalf) {
      enterRoom(roomId(room.row - 1, room.col), "up");
    }
    if (room.exits.down && st.y >= roomH - radius && Math.abs(st.x - roomW / 2) < doorHalf) {
      enterRoom(roomId(room.row + 1, room.col), "down");
    }
    if (room.exits.left && st.x <= radius && Math.abs(st.y - roomH / 2) < doorHalf) {
      enterRoom(roomId(room.row, room.col - 1), "left");
    }
    if (room.exits.right && st.x >= roomW - radius && Math.abs(st.y - roomH / 2) < doorHalf) {
      enterRoom(roomId(room.row, room.col + 1), "right");
    }
  }

  const viewW = canvas.width / DPR();
  const viewH = canvas.height / DPR();

  const targetCamX = st.x - viewW / 2;
  const targetCamY = st.y - viewH / 2;

  const maxCamX = Math.max(0, CONFIG.ROOM.w - viewW);
  const maxCamY = Math.max(0, CONFIG.ROOM.h - viewH);
  meta.camera.x = clamp(lerp(meta.camera.x, targetCamX, CONFIG.CAM.followLerp), 0, maxCamX);
  meta.camera.y = clamp(lerp(meta.camera.y, targetCamY, CONFIG.CAM.followLerp), 0, maxCamY);
}

function loop(now) {
  requestAnimationFrame(loop);

  renderer.draw(game);
  ui.updateHUD(game);

  if (!game.meta.running) return;

  const dt = Math.min(0.05, (now - game.meta.last) / 1000);
  game.meta.last = now;
  update(dt);
}

ui.startBtn.addEventListener("click", start);
ui.restartBtn.addEventListener("click", reset);

reset();
requestAnimationFrame(loop);
