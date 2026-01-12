import { itemDefs } from "./world.js";
import { pad2 } from "../core/utils.js";
import { CONFIG } from "../core/config.js";

export function createUI() {
  const hpFill = document.getElementById("hpFill");
  const hungerFill = document.getElementById("hungerFill");
  const warmFill = document.getElementById("warmFill");

  const timeLine = document.getElementById("timeLine");
  const cycleLine = document.getElementById("cycleLine");
  const shelterLine = document.getElementById("shelterLine");

  const invEl = document.getElementById("inv");
  const toastEl = document.getElementById("toast");

  const startOverlay = document.getElementById("startOverlay");
  const endOverlay = document.getElementById("endOverlay");
  const endTitle = document.getElementById("endTitle");
  const endText = document.getElementById("endText");

  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1300);
  }

  let useSlotHandler = null;

  function rebuildInventory(game, onUseSlot) {
    if (typeof onUseSlot === "function") useSlotHandler = onUseSlot;
    const handler = useSlotHandler;

    invEl.innerHTML = "";

    for (let i = 0; i < CONFIG.INVENTORY_SLOTS; i++) {
      const slot = document.createElement("div");
      slot.className = "slot";

      const k = document.createElement("div");
      k.className = "k";
      k.textContent = String(i + 1);
      slot.appendChild(k);

      const it = game.state.inv[i];
      if (it) {
        const def = itemDefs[it.type];
        const icon = document.createElement("div");
        icon.textContent = def?.icon ?? "❓";
        icon.style.fontSize = "22px";
        slot.appendChild(icon);

        const q = document.createElement("div");
        q.className = "q";
        q.textContent = String(it.qty);
        slot.appendChild(q);

        slot.title = `${def?.name ?? it.type}. Tap — use.`;
      } else {
        slot.title = "Empty";
      }

      const fire = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handler?.(i);
      };

      slot.addEventListener("touchstart", fire, { passive: false });
      slot.addEventListener("pointerdown", fire);
      slot.addEventListener("click", fire);

      invEl.appendChild(slot);
    }
  }

  function updateHUD(game) {
    const st = game.state;
    const meta = game.meta;

    hpFill.style.Qgs = "";
    hpFill.style.width = `${st.hp}%`;
    hungerFill.style.width = `${st.hunger}%`;
    warmFill.style.width = `${st.warm}%`;

    const hpDanger = st.hp < 30;
    const hungerDanger = st.hunger < 25;
    const warmDanger = st.warm < 25;

    hpFill.style.background = hpDanger ? "rgba(255,90,90,0.95)" : "rgba(255,255,255,0.85)";
    hungerFill.style.background = hungerDanger ? "rgba(255,180,90,0.95)" : "rgba(255,255,255,0.85)";
    warmFill.style.background = warmDanger ? "rgba(120,190,255,0.95)" : "rgba(255,255,255,0.85)";

    const t = Math.max(0, Math.floor(meta.dayNight.t));
    const mm = pad2(Math.floor(t / 60));
    const ss = pad2(t % 60);

    const left = Math.max(0, Math.ceil(meta.winSeconds - meta.dayNight.t));
    const lm = pad2(Math.floor(left / 60));
    const ls = pad2(left % 60);

    timeLine.textContent = `Время: ${mm}:${ss} | До победы: ${lm}:${ls}`;
    cycleLine.textContent = `${meta.flags.isNight ? "Ночь" : "День"} | Цикл: ${Math.floor((meta.flags.cyclePos / meta.flags.cycleLen) * 100)}%`;
    shelterLine.textContent = meta.flags.inShelter ? "Ты в укрытии: тепло тратится медленнее" : "Ты на улице";
  }

  function showStart(show) {
    startOverlay.classList.toggle("show", show);
  }
  function showEnd(show) {
    endOverlay.classList.toggle("show", show);
  }

  function showEndScreen(victory, survivedSeconds) {
    showEnd(true);
    const mm = pad2(Math.floor(survivedSeconds / 60));
    const ss = pad2(survivedSeconds % 60);
    if (victory) {
      endTitle.textContent = "Победа";
      endText.textContent = `Ты выжил ${mm}:${ss}.`;
    } else {
      endTitle.textContent = "Ты не выжил";
      endText.textContent = `Время: ${mm}:${ss}. Голод и холод тут реально убивают.`;
    }
  }

  return {
    toast,
    rebuildInventory: (game, onUseSlot) => rebuildInventory(game, onUseSlot),
    updateHUD,
    showStart,
    showEnd,
    showEndScreen,
    startBtn,
    restartBtn,
  };
}
