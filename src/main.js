import { CONFIG } from "./core/config.js";
import { clamp, lerp, insideRect } from "./core/utils.js";
import { createState, createGameMeta } from "./core/state.js";
import { createInput } from "./game/input.js";
import { makeItems, makeShelters } from "./game/world.js";
import { createUI } from "./game/ui.js";
import { createRenderer } from "./game/render.js";
import { handlePickupClick, useInventorySlot } from "./game/inventory.js";

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
  return {
    state: createState(),
    meta: createGameMeta(),
    shelters: makeShelters(),
    items: makeItems(),
  };
}

let autoPickupCooldown = 0;

let game = createGame();

function rebuildInv() {
  ui.rebuildInventory(game, (idx) => useInventorySlot(game, ui, idx));
}

function reset() {
  game = createGame();
  game.meta.running = false;
  ui.showEnd(false);
  ui.showStart(true);
  rebuildInv();
}

function start() {
  game.meta.running = true;
  game.meta.t0 = performance.now();
  game.meta.last = game.meta.t0;
  ui.showStart(false);
  rebuildInv();
}

function end(victory) {
  game.meta.running = false;
  const survived = Math.max(0, Math.floor(game.meta.dayNight.t));
  ui.showEndScreen(victory, survived);
}

function screenToWorld(sx, sy) {
  return { x: sx / DPR() + game.meta.camera.x, y: sy / DPR() + game.meta.camera.y };
}

canvas.addEventListener("mousedown", () => {
  if (!game.meta.running) return;
  const wp = screenToWorld(input.mouse.x, input.mouse.y);
  handlePickupClick(game, ui, wp);
});

window.addEventListener("keydown", (e) => {
  if (e.code.startsWith("Digit")) {
    const n = Number(e.code.replace("Digit",""));
    if (n >= 1 && n <= 9) useInventorySlot(game, ui, n - 1);
  }
});

function update(dt) {
  const st = game.state;
  const meta = game.meta;
  const dn = meta.dayNight;

  dn.t += dt;
  const cycleLen = dn.daySec + dn.nightSec;
  const cyclePos = dn.t % cycleLen;
  const isNight = cyclePos > dn.daySec;

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

  st.x = clamp(st.x, 50, CONFIG.WORLD.w - 50);
  st.y = clamp(st.y, 50, CONFIG.WORLD.h - 50);

  if (isMobile) {
    autoPickupCooldown -= dt;

    if (autoPickupCooldown <= 0) {
      let nearestIndex = -1;
      let best = Infinity;

      for (let i = 0; i < game.items.length; i++) {
        const it = game.items[i];
        const dx = st.x - it.x;
        const dy = st.y - it.y;
        const d = dx * dx + dy * dy;
        if (d < best) {
          best = d;
          nearestIndex = i;
        }
      }

      const R = CONFIG.INTERACT_RADIUS;
      if (nearestIndex !== -1 && best <= R * R) {
        const picked = handlePickupClick(game, ui, null);
        if (picked) autoPickupCooldown = 0.18;
      }
    }
  }

  let inShelter = false;
  for (const sh of game.shelters) {
    if (insideRect(st.x, st.y, sh)) { inShelter = true; break; }
  }

  const hungerRate = (CONFIG.DRAIN.hungerPerMin / 60);
  st.hunger = clamp(st.hunger - hungerRate * dt, 0, 100);

  let warmRate = ((isNight ? CONFIG.DRAIN.warmNightPerMin : CONFIG.DRAIN.warmDayPerMin) / 60);

  warmRate *= inShelter ? CONFIG.SHELTER_WARM_MULT : 1.0;

  const insulationMult = 1 - clamp(st.insulation, 0, CONFIG.INSULATION_CAP);
  warmRate *= insulationMult;

  st.warm = clamp(st.warm - warmRate * dt, 0, 100);

  const starving = st.hunger <= 0.01;
  const freezing = st.warm <= 0.01;

  if (starving || freezing) {
    const dmgPerMin = (starving ? CONFIG.DRAIN.hpStarvePerMin : 0) + (freezing ? CONFIG.DRAIN.hpFreezePerMin : 0);
    st.hp = clamp(st.hp - (dmgPerMin / 60) * dt, 0, 100);
  } else {
    st.hp = clamp(st.hp + (CONFIG.DRAIN.hpRegenPerMin / 60) * dt, 0, 100);
  }

  if (st.hp <= 0.001) end(false);
  if (dn.t >= meta.winSeconds) end(true);

  const viewW = canvas.width / DPR();
  const viewH = canvas.height / DPR();

  const targetCamX = st.x - viewW / 2;
  const targetCamY = st.y - viewH / 2;

  meta.camera.x = clamp(lerp(meta.camera.x, targetCamX, 0.12), 0, CONFIG.WORLD.w - viewW);
  meta.camera.y = clamp(lerp(meta.camera.y, targetCamY, 0.12), 0, CONFIG.WORLD.h - viewH);

  meta.flags.inShelter = inShelter;
  meta.flags.isNight = isNight;
  meta.flags.cyclePos = cyclePos;
  meta.flags.cycleLen = cycleLen;
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
