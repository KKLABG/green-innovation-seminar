import { createWorld } from "./world.js";

const scenes = Array.from(document.querySelectorAll(".scene"));
const live = document.getElementById("live");
const counter = document.getElementById("counter");
const progress = document.getElementById("progress");
const dots = document.getElementById("dots");
const overture = document.getElementById("overture");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let index = 0;
let phase = document.documentElement.classList.contains("is-overture") ? "overture" : "live";
let skipGuard = false;
let introTimer = 0;
const INTRO_MS = 12000;

const canvas = document.getElementById("gl");
let world = null;

try {
  world = createWorld(canvas);
  world.setReduced(reduced);
  world.start();
} catch (err) {
  console.error(err && err.stack ? err.stack : err);
  document.body.classList.add("no-webgl");
}

scenes.forEach((scene, i) => {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", "第" + String(i + 1) + "幕");
  button.addEventListener("click", () => {
    if (phase === "overture") finishIntro();
    go(i);
  });
  const item = document.createElement("li");
  item.appendChild(button);
  dots.appendChild(item);
});

document.getElementById("prev").addEventListener("click", () => {
  if (phase === "overture") finishIntro();
  go(index - 1);
});
document.getElementById("next").addEventListener("click", () => {
  if (phase === "overture") finishIntro();
  go(index + 1);
});
document.getElementById("skip").addEventListener("click", () => finishIntro());
document.getElementById("full").addEventListener("click", () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
  else document.exitFullscreen().catch(() => {});
});

document.querySelectorAll("[data-focus]").forEach((el) => {
  el.addEventListener("pointerenter", () => world && world.setFocus(el.dataset.focus));
  el.addEventListener("pointerleave", () => world && world.setFocus(""));
});

window.addEventListener("resize", () => world && world.resize());
window.addEventListener("pointermove", (event) => {
  if (!world) return;
  world.setPointer((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
});

canvas.addEventListener("click", (event) => {
  if (phase === "overture" || skipGuard) return;
  const x = event.clientX / window.innerWidth;
  if (x > 0.72) go(index + 1);
  else if (x < 0.08) go(index - 1);
});

document.addEventListener("pointerdown", (event) => {
  if (phase !== "overture") return;
  if (event.target.closest("#skip")) return;
  finishIntro();
});

let touch = null;
document.addEventListener("touchstart", (event) => {
  const t = event.changedTouches[0];
  touch = { x: t.clientX, y: t.clientY };
}, { passive: true });
document.addEventListener("touchend", (event) => {
  if (!touch) return;
  const t = event.changedTouches[0];
  const dx = t.clientX - touch.x;
  const dy = t.clientY - touch.y;
  touch = null;
  if (phase === "overture") return;
  if (Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy)) return;
  go(index + (dx < 0 ? 1 : -1));
}, { passive: true });

function wheelPixels(event, view) {
  if (event.deltaMode === 1) return event.deltaY * 16;
  if (event.deltaMode === 2) return event.deltaY * view;
  return event.deltaY;
}

function canScroll(el, deltaY) {
  if (!el || el.scrollHeight <= el.clientHeight + 8) return false;
  const atTop = el.scrollTop <= 0;
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
  if (deltaY < 0) return !atTop;
  if (deltaY > 0) return !atBottom;
  return false;
}

function planeUnderPointer(x, y) {
  const nodes = document.querySelectorAll(".plane.is-scroll");
  for (let i = 0; i < nodes.length; i += 1) {
    const el = nodes[i];
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.pointerEvents === "none" || parseFloat(cs.opacity) < 0.04) continue;
    const box = el.getBoundingClientRect();
    if (box.height < 8 || box.width < 8) continue;
    if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return el;
  }
  return null;
}

let wheelLock = 0;
window.addEventListener("wheel", (event) => {
  const proxy = event.target.closest && event.target.closest(".scroll-proxy");
  if (proxy && canScroll(proxy, event.deltaY)) return;
  const sheet = planeUnderPointer(event.clientX, event.clientY)
    || (event.target.closest && event.target.closest(".plane.is-scroll, .sheet"));
  if (canScroll(sheet, event.deltaY)) {
    const box = sheet.getBoundingClientRect();
    const scale = box.height > 1 ? box.height / sheet.clientHeight : 1;
    sheet.scrollTop += wheelPixels(event, sheet.clientHeight) / Math.max(0.05, scale);
    const twin = document.querySelector('.scroll-proxy[data-scene="' + sheet.dataset.scene + '"]');
    if (twin) {
      const maxPlane = sheet.scrollHeight - sheet.clientHeight;
      const maxProxy = twin.scrollHeight - twin.clientHeight;
      if (maxPlane > 0 && maxProxy > 0) twin.scrollTop = (sheet.scrollTop / maxPlane) * maxProxy;
    }
    event.preventDefault();
    return;
  }
  if (Math.abs(event.deltaY) < 12) return;
  event.preventDefault();
  if (phase === "overture") {
    finishIntro();
    return;
  }
  if (performance.now() < wheelLock) return;
  wheelLock = performance.now() + 750;
  go(index + (event.deltaY > 0 ? 1 : -1));
}, { passive: false });

window.addEventListener("keydown", (event) => {
  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", " ", "PageDown", "PageUp", "Home", "End"];
  if (!keys.includes(event.key)) return;
  event.preventDefault();
  if (phase === "overture") {
    finishIntro();
    return;
  }
  if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === " " || event.key === "PageDown") go(index + 1);
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "PageUp") go(index - 1);
  else if (event.key === "Home") go(0);
  else if (event.key === "End") go(scenes.length - 1);
});

function finishIntro() {
  const wasOverture = phase === "overture";
  phase = "live";
  if (wasOverture) {
    skipGuard = true;
    window.setTimeout(() => {
      skipGuard = false;
    }, 380);
  }
  window.clearTimeout(introTimer);
  document.documentElement.classList.remove("is-overture");
  document.body.classList.remove("is-overture");
  document.body.classList.add("is-live");
  if (overture) overture.hidden = true;
  if (world) world.setIntro(1);
  apply(index, true);
}

function go(next) {
  if (skipGuard) return;
  const dest = Math.max(0, Math.min(scenes.length - 1, next));
  if (dest === index && document.body.classList.contains("is-live")) {
    apply(index);
    return;
  }
  scenes[index].classList.remove("is-active");
  scenes[index].classList.add("is-exit");
  const leaving = scenes[index];
  window.setTimeout(() => leaving.classList.remove("is-exit"), 800);
  index = dest;
  scenes.forEach((scene) => scene.classList.remove("is-active"));
  scenes[index].classList.remove("is-exit");
  scenes[index].classList.add("is-active");
  document.querySelectorAll(".plane.is-scroll, .sheet, .scroll-proxy").forEach((sheet) => {
    sheet.scrollTop = 0;
  });
  document.body.classList.add("is-moving");
  window.setTimeout(() => document.body.classList.remove("is-moving"), 900);
  apply(index, false);
}

function apply(i, snap) {
  scenes.forEach((scene, n) => {
    scene.setAttribute("aria-hidden", n === i ? "false" : "true");
  });
  const buttons = dots.querySelectorAll("button");
  buttons.forEach((button, n) => {
    if (n === i) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });
  counter.textContent = String(i + 1).padStart(2, "0") + " / 16";
  progress.style.setProperty("--p", String((i + 1) / 16));
  const depth = document.getElementById("depth");
  if (depth) depth.style.setProperty("--depth", (i / 15) * 100 + "%");
  const heading = document.getElementById("t" + (i + 1));
  if (live && heading) live.textContent = heading.textContent.replace(/\s+/g, "");
  if (world) world.goTo(i, snap);
}

function boot() {
  const params = new URLSearchParams(location.search);
  const at = Number(params.get("at"));
  if (reduced || (Number.isInteger(at) && at >= 1 && at <= 16)) {
    if (Number.isInteger(at) && at >= 1 && at <= 16) index = at - 1;
    scenes.forEach((scene) => scene.classList.remove("is-active"));
    scenes[index].classList.add("is-active");
    finishIntro();
    return;
  }
  document.body.classList.add("is-overture");
  scenes[0].classList.add("is-active");
  apply(0);
  const started = performance.now();
  const step = (now) => {
    if (phase !== "overture") return;
    const u = Math.min(1, (now - started) / INTRO_MS);
    if (world) world.setIntro(u);
    if (u < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  introTimer = window.setTimeout(finishIntro, INTRO_MS);
}

boot();
