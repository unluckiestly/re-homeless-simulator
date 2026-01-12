import { CONFIG } from "../core/config.js";
import { itemDefs, spawnItem } from "./world.js";

export function tryAddItem(inv, type) {
  const def = itemDefs[type];
  if (!def) return false;

  for (let i = 0; i < inv.length; i++) {
    const it = inv[i];
    if (it && it.type === type && it.qty < def.stack) {
      it.qty++;
      return true;
    }
  }
  for (let i = 0; i < inv.length; i++) {
    if (!inv[i]) {
      inv[i] = { type, qty: 1 };
      return true;
    }
  }
  return false;
}

export function useInventorySlot(game, ui, idx) {
  if (!game.meta.running) return;
  const it = game.state.inv[idx];
  if (!it) return;
  const def = itemDefs[it.type];
  if (!def) return;

  def.use(game.state, ui.toast);
  it.qty--;
  if (it.qty <= 0) game.state.inv[idx] = null;
  ui.rebuildInventory(game);
}

export function handlePickupClick(game, ui, worldPoint) {
  if (!game.meta.running) return false;

  const st = game.state;
  let nearest = null;
  let best = Infinity;

  for (const it of game.items) {
    const dx = st.x - it.x;
    const dy = st.y - it.y;
    const d = dx * dx + dy * dy;
    if (d < best) { best = d; nearest = it; }
  }

  if (!nearest) {
    ui.toast("Рядом нечего взять");
    return true;
  }

  const R = CONFIG.INTERACT_RADIUS;
  if (best > R * R) {
    ui.toast("Рядом нечего взять");
    return true;
  }

  const ok = tryAddItem(st.inv, nearest.type);
  if (!ok) {
    ui.toast("Инвентарь забит");
    return true;
  }

  ui.toast(`Подобрал: ${itemDefs[nearest.type]?.name ?? nearest.type}`);
  game.items = game.items.filter(x => x.id !== nearest.id);
  ui.rebuildInventory(game);

  if (game.items.length < 40 && Math.random() < 0.35) {
    const pool = ["food","water","cardboard","medkit","jacket"];
    game.items.push(spawnItem(pool[Math.floor(Math.random()*pool.length)]));
  }

  return true;
}
