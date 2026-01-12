import { CONFIG } from "../core/config.js";
import { rand, randi } from "../core/utils.js";
import { EN } from "../core/lang.js";

const T = EN;


export const itemDefs = {
  food: { name: T.items.food, icon: "🍞", stack: 3, use: (st, toast) => { st.hunger = Math.min(100, st.hunger + 28); toast("Съел еду"); } },
  water:{ name: T.items.water, icon: "🥤", stack: 3, use: (st, toast) => { st.hunger = Math.min(100, st.hunger + 10); st.hp = Math.min(100, st.hp + 6); toast("Выпил воду"); } },
  jacket:{ name: T.items.jacket, icon: "🧥", stack: 1, use: (st, toast) => { st.insulation = Math.max(st.insulation, 0.35); toast("Надел куртку (теплее)"); } },
  cardboard:{ name: T.items.cardboard, icon: "📦", stack: 2, use: (st, toast) => { st.insulation = Math.max(st.insulation, 0.18); toast("Утеплился картоном"); } },
  medkit:{ name: T.items.medkit, icon: "🩹", stack: 2, use: (st, toast) => { st.hp = Math.min(100, st.hp + 35); toast("Подлечился"); } },
};

export function spawnItem(type) {
  const pad = 120;
  return {
    id: Math.random().toString(16).slice(2),
    type,
    x: rand(pad, CONFIG.WORLD.w - pad),
    y: rand(pad, CONFIG.WORLD.h - pad),
    r: randi(14, 18),
  };
}

export function makeItems() {
  const arr = [];
  const pool = ["food","food","water","water","cardboard","medkit","jacket"];
  for (let i = 0; i < 52; i++) arr.push(spawnItem(pool[randi(0, pool.length - 1)]));
  return arr;
}

export function makeShelters() {
  const s = [];
  for (let i = 0; i < 11; i++) {
    const w = randi(180, 340);
    const h = randi(140, 260);
    const x = randi(120, CONFIG.WORLD.w - 120 - w);
    const y = randi(120, CONFIG.WORLD.h - 120 - h);
    s.push({ x, y, w, h });
  }
  return s;
}
