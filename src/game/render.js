import { CONFIG } from "../core/config.js";
import { pickupDefs } from "./world.js";

export function createRenderer(canvas, ctx, DPR) {
  function drawRoomFrame(room, locked) {
    const { w, h, wall, door } = CONFIG.ROOM;
    ctx.fillStyle = "#111621";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#151b28";
    ctx.fillRect(wall, wall, w - wall * 2, h - wall * 2);

    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 2;
    ctx.strokeRect(wall + 8, wall + 8, w - (wall + 8) * 2, h - (wall + 8) * 2);

    const drawDoor = (x, y, horizontal, open) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = open ? "rgba(120,220,255,0.3)" : "rgba(255,120,120,0.35)";
      if (horizontal) {
        ctx.fillRect(-door / 2, -wall / 2, door, wall);
      } else {
        ctx.fillRect(-wall / 2, -door / 2, wall, door);
      }
      ctx.restore();
    };

    const open = !locked;
    if (room.exits.up) drawDoor(w / 2, wall / 2, true, open);
    if (room.exits.down) drawDoor(w / 2, h - wall / 2, true, open);
    if (room.exits.left) drawDoor(wall / 2, h / 2, false, open);
    if (room.exits.right) drawDoor(w - wall / 2, h / 2, false, open);
  }

  function draw(game) {
    const w = canvas.width, h = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const dpr = DPR();

    ctx.save();
    const view = game.meta.view ?? { scale: 1, offsetX: 0, offsetY: 0 };
    ctx.scale(dpr, dpr);
    ctx.translate(view.offsetX, view.offsetY);
    ctx.scale(view.scale, view.scale);
    ctx.translate(-game.meta.camera.x, -game.meta.camera.y);

    const room = game.roomsById.get(game.meta.currentRoomId);
    if (!room) {
      ctx.restore();
      return;
    }
    drawRoomFrame(room, !room.cleared);

    for (const pickup of room.pickups) {
      const def = pickupDefs[pickup.type];
      ctx.beginPath();
      ctx.arc(pickup.x, pickup.y, pickup.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(def?.icon ?? "?", pickup.x, pickup.y + 1);
    }

    for (const bullet of game.bullets) {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(170,230,255,0.9)";
      ctx.fill();
    }

    for (const enemy of room.enemies) {
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,120,120,0.85)";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const st = game.state;
    ctx.beginPath();
    ctx.arc(st.x, st.y, 18, 0, Math.PI * 2);
    ctx.fillStyle = st.invincible > 0 ? "rgba(120,220,255,0.9)" : "rgba(255,255,255,0.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();

    ctx.save();
    ctx.translate(0.5, 0.5);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w - 1, h - 1);
    ctx.restore();
  }

  return { draw };
}
