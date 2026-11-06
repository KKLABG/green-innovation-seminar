(function () {
  var scenes = Array.prototype.slice.call(document.querySelectorAll(".scene"));
  var N = scenes.length;
  if (!N) return;

  var stage = document.getElementById("stage");
  var persp = document.getElementById("persp");
  var tilt = document.getElementById("tilt");
  var veil = document.getElementById("veil");
  var chapter = document.getElementById("chapter");
  var live = document.getElementById("live");
  var countEl = document.getElementById("count");
  var hint = document.getElementById("hint");
  var fullBtn = document.getElementById("full");
  var path = document.getElementById("path");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var progress = reduced ? 0 : -1.42;
  var target = 0;
  var mode = reduced ? "live" : "intro";
  var introStart = 0;
  var last = 0;
  var announced = -1;
  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  var nearest = 0;
  var hintTimer = 0;

  var params = new URLSearchParams(window.location.search);
  var direct = parseInt(params.get("direct") || "", 10);

  scenes.forEach(function (el, i) {
    var btn = document.createElement("button");
    btn.type = "button";
    var heading = el.querySelector("h1, h2");
    var title = heading ? heading.textContent.replace(/\s+/g, "") : "";
    btn.setAttribute("aria-label", "第" + (i + 1) + "幕 " + title);
    btn.dataset.go = String(i);
    btn.innerHTML = "<i></i><span>" + String(i + 1).padStart(2, "0") + "</span>";
    path.appendChild(btn);
  });

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function headingOf(index) {
    var h = scenes[index].querySelector("h1, h2");
    return h ? h.textContent.replace(/\s+/g, " ").trim() : "";
  }

  function finishIntro() {
    mode = "live";
    document.documentElement.classList.add("is-live");
    if (veil) veil.style.opacity = "0";
    if (chapter) chapter.style.opacity = "0";
    hintTimer = performance.now() + 9000;
    var hash = parseInt((location.hash || "").replace("#", ""), 10);
    var jump = 0;
    if (!isNaN(direct) && direct >= 1 && direct <= N) jump = direct - 1;
    else if (!isNaN(hash) && hash >= 1 && hash <= N) jump = hash - 1;
    target = jump;
    if (reduced) progress = jump;
  }

  function skipIntro() {
    if (mode !== "intro") return;
    progress = Math.max(progress, -0.35);
    finishIntro();
  }

  function go(index) {
    if (mode === "intro") {
      skipIntro();
      return;
    }
    target = clamp(index, 0, N - 1);
    if (hint) hint.classList.add("is-gone");
    if (reduced) progress = target;
    try {
      history.replaceState(null, "", "#" + (target + 1));
    } catch (err) { /* file:// may reject */ }
  }

  function layout() {
    var wide = window.innerWidth >= 860;
    if (persp) persp.style.perspective = wide ? "1480px" : "2100px";
    scenes.forEach(function (el, i) {
      var depth = i - progress;
      var abs = Math.abs(depth);
      var leaving = depth < 0;
      var z = leaving ? -30 : -depth * 1040;
      var y = leaving ? depth * (wide ? 860 : 640) : depth * 22;
      var x = leaving ? depth * -18 : depth * (wide ? 12 : 6);
      var rot = leaving ? clamp(depth * 1.4, -4, 0) : clamp(depth * 1.1, 0, 3.5);
      var opacity = leaving ? 1 : Math.max(0, 1 - depth * 0.72);
      if (leaving && depth < -0.72) opacity = Math.max(0, (depth + 0.94) / 0.22);
      if (depth < -0.94 || depth > 1.2) opacity = 0;
      if (opacity > 1) opacity = 1;
      if (opacity < 0.02) opacity = 0;
      var blur = !reduced && !leaving && depth > 0.45 ? Math.min(3, (depth - 0.45) * 2.2) : 0;
      el.style.transform = "translate(-50%, -50%) translate3d(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px, " + z.toFixed(2) + "px) rotateX(" + rot.toFixed(2) + "deg)";
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = blur > 0.3 ? "blur(" + blur.toFixed(2) + "px)" : "none";
      el.style.visibility = opacity <= 0 ? "hidden" : "visible";
      el.style.zIndex = leaving ? String(260 + Math.round((depth + 2) * 8)) : String(140 - Math.round(depth * 10));
      el.style.pointerEvents = abs < 0.45 ? "auto" : "none";
      el.classList.toggle("is-near", abs < 0.38);
      el.setAttribute("aria-hidden", abs < 0.55 ? "false" : "true");
      var img = el.querySelector("img");
      if (img && abs < 0.7 && !reduced) {
        img.style.transform = "scale(1.08) translate(" + (pointer.x * -16).toFixed(1) + "px, " + (pointer.y * -11).toFixed(1) + "px)";
      }
    });
    if (tilt && !reduced) {
      tilt.style.transform = "rotateY(" + (pointer.x * 3.1).toFixed(3) + "deg) rotateX(" + (pointer.y * -2.15).toFixed(3) + "deg)";
    } else if (tilt) {
      tilt.style.transform = "none";
    }
  }

  function updateChrome() {
    var shown = clamp(Math.round(progress), 0, N - 1);
    if (progress < -0.45) shown = 0;
    nearest = shown;
    if (countEl) countEl.textContent = String(shown + 1).padStart(2, "0");
    var buttons = path.querySelectorAll("button");
    buttons.forEach(function (btn, i) {
      btn.classList.toggle("is-current", i === shown);
      btn.classList.toggle("is-past", i < shown);
      btn.tabIndex = mode === "live" ? 0 : -1;
    });
    var prev = document.querySelector(".edge.prev");
    var next = document.querySelector(".edge.next");
    if (prev) prev.disabled = mode === "live" && shown <= 0 && Math.abs(progress - target) < 0.05;
    if (next) next.disabled = mode === "live" && shown >= N - 1 && Math.abs(progress - target) < 0.05;
    if (mode === "live" && Math.abs(progress - target) < 0.02 && announced !== target) {
      announced = target;
      if (live) live.textContent = "第" + (target + 1) + "幕，共" + N + "幕。" + headingOf(target);
    }
    if (hint && mode === "live" && performance.now() > hintTimer && hintTimer) {
      hint.classList.add("is-gone");
    }
  }

  function introAt(t) {
    var veilOpacity = Math.max(0, 1 - t / 1.2);
    if (veil) veil.style.opacity = String(veilOpacity);
    var c = 0;
    if (t < 0.55) c = t / 0.55;
    else if (t < 2.25) c = 1;
    else c = Math.max(0, 1 - (t - 2.25) / 0.75);
    if (chapter) chapter.style.opacity = String(c);
    var travel = clamp((t - 1.85) / 3.45, 0, 1);
    var e = travel < 0.5 ? 2 * travel * travel : 1 - Math.pow(-2 * travel + 2, 2) / 2;
    progress = -1.42 + e * 1.42;
    return clamp(t / 2.1, 0, 1);
  }

  function frame(now) {
    if (!last) last = now;
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var intro = 1;

    if (!introStart) introStart = now;

    if (mode === "intro") {
      var t = (now - introStart) / 1000;
      intro = introAt(t);
      if (t > 5.55) finishIntro();
    } else {
      var k = reduced ? 1 : 1 - Math.exp(-dt * 1.45);
      progress += (target - progress) * k;
      if (Math.abs(progress - target) < 0.0006) progress = target;
      intro = 1;
    }

    if (!reduced) {
      pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 3.2));
      pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 3.2));
    } else {
      pointer.x = 0;
      pointer.y = 0;
    }

    layout();
    updateChrome();
    if (window.ImprintWorld && window.ImprintWorld.enabled) {
      window.ImprintWorld.update({
        progress: progress,
        intro: intro,
        time: now / 1000,
        pointerX: pointer.x,
        pointerY: pointer.y,
        reduced: reduced
      });
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("keydown", function (e) {
    var key = e.key;
    var navKey = key === "ArrowRight" || key === "ArrowDown" || key === "PageDown" || key === " " || key === "ArrowLeft" || key === "ArrowUp" || key === "PageUp" || key === "Backspace" || key === "Home" || key === "End";
    if (navKey) {
      var nowKey = performance.now();
      if (nowKey < keyLock) {
        e.preventDefault();
        return;
      }
      keyLock = nowKey + 520;
    }
    if (key === "ArrowRight" || key === "ArrowDown" || key === "PageDown" || key === " ") {
      e.preventDefault();
      go(Math.round(target) + 1);
    } else if (key === "ArrowLeft" || key === "ArrowUp" || key === "PageUp" || key === "Backspace") {
      e.preventDefault();
      go(Math.round(target) - 1);
    } else if (key === "Home") {
      e.preventDefault();
      if (mode === "intro") skipIntro();
      else go(0);
    } else if (key === "End") {
      e.preventDefault();
      if (mode === "intro") skipIntro();
      else go(N - 1);
    } else if (key === "f" || key === "F") {
      e.preventDefault();
      toggleFull();
    } else if (key === "Escape") {
      /* browser leaves fullscreen */
    } else if (mode === "intro") {
      skipIntro();
    }
  });

  var downX = 0;
  var downY = 0;
  var downId = null;
  window.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    downX = e.clientX;
    downY = e.clientY;
    downId = e.pointerId;
  });
  window.addEventListener("pointerup", function (e) {
    if (e.button !== 0) return;
    if (downId !== e.pointerId && downId !== null) return;
    var dx = e.clientX - downX;
    var dy = e.clientY - downY;
    var node = e.target && e.target.nodeType === 1 ? e.target : (e.target && e.target.parentElement);
    if (node && node.closest && node.closest("button, a, .path")) return;
    if (mode === "intro") {
      if (Math.hypot(dx, dy) < 14) skipIntro();
      return;
    }
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      go(Math.round(target) + (dx < 0 ? 1 : -1));
      return;
    }
    if (Math.hypot(dx, dy) > 12) return;
    var sel = window.getSelection && window.getSelection();
    if (sel && String(sel).length) return;
    var x = e.clientX / window.innerWidth;
    go(Math.round(target) + (x < 0.2 ? -1 : 1));
  });

  var wheelLock = 0;
  var keyLock = 0;
  window.addEventListener("wheel", function (e) {
    var scroller = e.target.closest && e.target.closest(".copy, .stack-body");
    if (scroller && scroller.scrollHeight > scroller.clientHeight + 8) {
      var atTop = scroller.scrollTop <= 0;
      var atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
      if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) return;
    }
    e.preventDefault();
    if (mode === "intro") return;
    var now = performance.now();
    if (now < wheelLock) return;
    if (Math.abs(e.deltaY) < 16) return;
    wheelLock = now + 780;
    go(Math.round(target) + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  window.addEventListener("pointermove", function (e) {
    if (reduced) return;
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    document.documentElement.style.setProperty("--mx", (e.clientX / window.innerWidth * 100).toFixed(2) + "%");
    document.documentElement.style.setProperty("--my", (e.clientY / window.innerHeight * 100).toFixed(2) + "%");
  });

  path.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    var index = parseInt(btn.dataset.go, 10);
    if (mode === "intro") skipIntro();
    go(index);
  });

  document.querySelectorAll(".edge").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var dir = btn.classList.contains("next") ? 1 : -1;
      go(Math.round(target) + dir);
    });
  });

  var skip = document.getElementById("skip");
  if (skip) skip.addEventListener("click", function () { skipIntro(); });

  function toggleFull() {
    if (!document.fullscreenElement) {
      var node = document.documentElement;
      if (node.requestFullscreen) node.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
  if (fullBtn) fullBtn.addEventListener("click", toggleFull);
  document.addEventListener("fullscreenchange", function () {
    if (!fullBtn) return;
    fullBtn.textContent = document.fullscreenElement ? "退出全屏" : "全屏";
  });

  window.addEventListener("resize", function () {
    if (window.ImprintWorld) window.ImprintWorld.resize();
  });

  if (window.ImprintWorld) window.ImprintWorld.init();

  var directValid = !isNaN(direct) && direct >= 1 && direct <= N;
  if (reduced || directValid) {
    document.documentElement.classList.add("is-live");
    if (veil) veil.style.opacity = "0";
    if (chapter) chapter.style.opacity = "0";
    mode = "live";
    var jump = 0;
    if (directValid) jump = direct - 1;
    else {
      var hashNow = parseInt((location.hash || "").replace("#", ""), 10);
      if (!isNaN(hashNow) && hashNow >= 1 && hashNow <= N) jump = hashNow - 1;
    }
    target = jump;
    progress = jump;
    hintTimer = performance.now() + 9000;
  }

  requestAnimationFrame(frame);
})();
