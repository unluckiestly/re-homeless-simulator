export function createInput(canvas, DPR) {
  const keys = new Set();
  const mouse = { x: 0, y: 0, down: false };

  window.addEventListener("keydown", (e) => keys.add(e.code));
  window.addEventListener("keyup", (e) => keys.delete(e.code));

  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * DPR();
    mouse.y = (e.clientY - r.top) * DPR();
  });

  canvas.addEventListener("mousedown", () => (mouse.down = true));
  window.addEventListener("mouseup", () => (mouse.down = false));

  return { keys, mouse };
}
