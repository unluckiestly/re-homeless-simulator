export function createInput(canvas, DPR, opts) {
  const keys = new Set();
  const mouse = { x: 0, y: 0, down: false };

  const touchMove = { x: 0, y: 0, active: false }; // -1..1
  const isMobile = !!opts?.isMobile;

  window.addEventListener("keydown", (e) => keys.add(e.code));
  window.addEventListener("keyup", (e) => keys.delete(e.code));

  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * DPR();
    mouse.y = (e.clientY - r.top) * DPR();
  });

  canvas.addEventListener("mousedown", () => (mouse.down = true));
  window.addEventListener("mouseup", () => (mouse.down = false));

  function attachMobile(stickEl, knobEl) {
    if (!isMobile) return;

    let pointerId = null;
    const max = 46;

    const center = () => {
      const r = stickEl.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    };

    const setKnob = (dx, dy) => {
      knobEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    };

    const reset = () => {
      pointerId = null;
      touchMove.x = 0;
      touchMove.y = 0;
      touchMove.active = false;
      setKnob(0, 0);
    };

    stickEl.addEventListener("pointerdown", (e) => {
      pointerId = e.pointerId;
      stickEl.setPointerCapture(pointerId);
      touchMove.active = true;
      const { cx, cy } = center();
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const len = Math.hypot(dx, dy) || 1;
      const cl = Math.min(max, len);
      const nx = (dx / len) * cl;
      const ny = (dy / len) * cl;
      setKnob(nx, ny);
      touchMove.x = nx / max;
      touchMove.y = ny / max;
    });

    stickEl.addEventListener("pointermove", (e) => {
      if (e.pointerId !== pointerId) return;
      const { cx, cy } = center();
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const len = Math.hypot(dx, dy) || 1;
      const cl = Math.min(max, len);
      const nx = (dx / len) * cl;
      const ny = (dy / len) * cl;
      setKnob(nx, ny);
      touchMove.x = nx / max;
      touchMove.y = ny / max;
    });

    stickEl.addEventListener("pointerup", (e) => {
      if (e.pointerId !== pointerId) return;
      reset();
    });

    stickEl.addEventListener("pointercancel", (e) => {
      if (e.pointerId !== pointerId) return;
      reset();
    });
  }

  return { keys, mouse, touchMove, attachMobile, isMobile };
}
