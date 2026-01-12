import { CONFIG } from "../core/config.js";
import { itemDefs } from "./world.js";

export function createRenderer(canvas, ctx, DPR) {
  function draw(game) {
    const w = canvas.width, h = canvas.height;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,w,h);

    ctx.save();
    ctx.scale(DPR(), DPR());
    ctx.translate(-game.meta.camera.x, -game.meta.camera.y);

    ctx.fillStyle = "#0f1520";
    ctx.fillRect(0, 0, CONFIG.WORLD.w, CONFIG.WORLD.h);

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    const step = 80;
    for (let x = 0; x <= CONFIG.WORLD.w; x += step) ctx.fillRect(x, 0, 1, CONFIG.WORLD.h);
    for (let y = 0; y <= CONFIG.WORLD.h; y += step) ctx.fillRect(0, y, CONFIG.WORLD.w, 1);

    for (const sh of game.shelters) {
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(sh.x, sh.y, sh.w, sh.h);
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 2;
      ctx.strokeRect(sh.x, sh.y, sh.w, sh.h);

      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "14px system-ui, sans-serif";
      ctx.fillText("укрытие", sh.x + 10, sh.y + 22);
    }

    for (const it of game.items) {
      const def = itemDefs[it.type];
      ctx.beginPath();
      ctx.arc(it.x, it.y, it.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillText(def?.icon ?? "❓", it.x, it.y + 1);
    }

    const st = game.state;
    ctx.beginPath();
    ctx.arc(st.x, st.y, 18, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(st.x, st.y, 42, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    const nightStrength = game.meta.flags.isNight ? 0.55 : 0.20;
    ctx.fillStyle = `rgba(10,16,26,${nightStrength})`;
    ctx.fillRect(0, 0, w, h);

    const vign = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.15, w/2, h/2, Math.min(w,h)*0.75);
    vign.addColorStop(0, "rgba(0,0,0,0.0)");
    vign.addColorStop(1, `rgba(0,0,0,${game.meta.flags.isNight ? 0.55 : 0.35})`);
    ctx.fillStyle = vign;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(0.5, 0.5);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, w - 1, h - 1);
    ctx.restore();
  }

  return { draw };
}
