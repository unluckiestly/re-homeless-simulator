import { pad2 } from "../core/utils.js";
import { EN } from "../core/lang.js";

const T = EN;


export function createUI() {
  document.getElementById("startTitle").textContent = T.game.startTitle;
  document.getElementById("startText1").textContent = T.game.startText1;
  document.getElementById("startText2").textContent = T.game.startText2;

  const lblHealth = document.getElementById("lblHealth");
  const lblDamage = document.getElementById("lblDamage");

  if (lblHealth) lblHealth.textContent = T.stats.health;
  if (lblDamage) lblDamage.textContent = T.stats.damage;

  const hpFill = document.getElementById("hpFill");
  const dmgFill = document.getElementById("dmgFill");

  const timeLine = document.getElementById("timeLine");
  const roomLine = document.getElementById("roomLine");
  const clearLine = document.getElementById("clearLine");

  const startOverlay = document.getElementById("startOverlay");
  const endOverlay = document.getElementById("endOverlay");
  const endTitle = document.getElementById("endTitle");
  const endText = document.getElementById("endText");

  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");

  function updateHUD(game) {
    const st = game.state;
    const meta = game.meta;

    if (hpFill) {
      hpFill.style.width = `${Math.max(0, (st.hp / st.maxHp) * 100)}%`;
      const hpDanger = st.hp < st.maxHp * 0.3;
      hpFill.style.background = hpDanger ? "rgba(255,90,90,0.95)" : "rgba(255,255,255,0.85)";
    }
    if (dmgFill) {
      dmgFill.style.width = `${Math.min(100, (game.playerDamage / 30) * 100)}%`;
    }

    const t = Math.max(0, Math.floor(meta.elapsed));
    const mm = pad2(Math.floor(t / 60));
    const ss = pad2(t % 60);

    timeLine.textContent = `${T.hud.time}: ${mm}:${ss}`;
    const room = game.roomsById.get(meta.currentRoomId);
    if (room) {
      roomLine.textContent = `${T.hud.room}: ${room.row + 1}-${room.col + 1}`;
      clearLine.textContent = `${T.hud.cleared}: ${meta.clearedRooms}/${meta.totalRooms}`;
    }

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
      endTitle.textContent = T.game.winTitle;
      endText.textContent = T.game.winText(`${mm}:${ss}`);
    } else {
      endTitle.textContent = T.game.loseTitle;
      endText.textContent = T.game.loseText(`${mm}:${ss}`);
    }
  }

  return {
    updateHUD,
    showStart,
    showEnd,
    showEndScreen,
    startBtn,
    restartBtn,
  };
}
