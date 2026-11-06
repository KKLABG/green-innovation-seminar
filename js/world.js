import * as THREE from "../vendor/three.module.min.js";
import { CSS3DObject, CSS3DRenderer } from "./objects/CSS3DRenderer.js";

const SCALE = 0.01;
const MOVES = [
  "left", "up", "forward", "right", "down",
  "orbit", "rise", "descend", "strafe", "sweep",
  "back", "crane", "arc", "sink", "lift"
];

const PHOTO_PX = [
  [864, 1152], [1280, 720], [864, 1152], [864, 1152],
  [1152, 864], [1280, 720], [1280, 720], [864, 1152],
  [1280, 720], [864, 1152], [864, 1152], [1280, 720],
  [864, 1152], [864, 1152], [1152, 864], [864, 1152]
];

const ROOMS = [
  { fog: 0xf6ead8, sky: 0xf3e2c8, floor: 0xe7dccb, wall: 0xf7f1e8, sun: 0xffd7a8, hemi: 0xfff3e4, ground: 0xcbb89a, accent: 0xc6a36a, sunPos: [12, 7, 6] },
  { fog: 0xe7eef3, sky: 0xd5e2ec, floor: 0xc5ccd2, wall: 0xf4f7f8, sun: 0xe7f1f8, hemi: 0xf5f8fb, ground: 0x9aa7b2, accent: 0x8ea0ad, sunPos: [-6, 10, 8] },
  { fog: 0xf0c7a4, sky: 0xe7a98a, floor: 0xc4a48c, wall: 0xf2d2b8, sun: 0xffb07a, hemi: 0xffe0c4, ground: 0x8d5e48, accent: 0xd9845a, sunPos: [4, 3, 10] },
  { fog: 0xf4ecdf, sky: 0xe7f0ea, floor: 0xc9b59a, wall: 0xf6f1e8, sun: 0xfff0d8, hemi: 0xf8f4ec, ground: 0xa89074, accent: 0x8eae9a, sunPos: [10, 8, 2] },
  { fog: 0xe6d3b4, sky: 0xd9c2a2, floor: 0x8d6a45, wall: 0xc4a27a, sun: 0xffc98a, hemi: 0xf0ddc4, ground: 0x5c4030, accent: 0xe8b86a, sunPos: [-2, 6, 8] },
  { fog: 0xe4e0d8, sky: 0xd5d8de, floor: 0xb7aea2, wall: 0xefeae2, sun: 0xf0f2f4, hemi: 0xf6f3ee, ground: 0x8d8680, accent: 0x7f9a9e, sunPos: [8, 9, 4] },
  { fog: 0xd5d8d2, sky: 0xc5ccc6, floor: 0x9aa198, wall: 0xe4e6e1, sun: 0xe7eee8, hemi: 0xe8ebe6, ground: 0x6d736c, accent: 0x8a8174, sunPos: [0, 8, 10] },
  { fog: 0xe8eef0, sky: 0xd5e4e8, floor: 0xd8d2c8, wall: 0xf7f6f3, sun: 0xf4f0e4, hemi: 0xf7f5f1, ground: 0xb7b1a6, accent: 0xb08a4f, sunPos: [6, 11, 5] },
  { fog: 0xe7eee6, sky: 0xdfe8df, floor: 0xd2cdc2, wall: 0xf3f4f0, sun: 0xf7f4ea, hemi: 0xf4f6f2, ground: 0x9aa396, accent: 0x6f8f84, sunPos: [-8, 9, 6] },
  { fog: 0xf7f1e4, sky: 0xf3e6cf, floor: 0xe4d9c8, wall: 0xfbf7f0, sun: 0xfff6e4, hemi: 0xfff8ef, ground: 0xc9b89a, accent: 0xd8c29a, sunPos: [0, 14, 2] },
  { fog: 0xd5dee6, sky: 0xc5d2de, floor: 0x9aa3ab, wall: 0xd5dbe1, sun: 0xd5e4f0, hemi: 0xe4eaf0, ground: 0x66707a, accent: 0x8aa0b4, sunPos: [9, 8, -2] },
  { fog: 0xe6e2d8, sky: 0xd9d4c8, floor: 0xcfc6b6, wall: 0xe8e4da, sun: 0xf0e6d2, hemi: 0xf3efe6, ground: 0x9a907f, accent: 0x6e8f86, sunPos: [5, 10, 6] },
  { fog: 0xf3efe4, sky: 0xe4eef2, floor: 0xe7e0d2, wall: 0xf7f4ee, sun: 0xfff0d4, hemi: 0xf8f6f0, ground: 0xc2b49a, accent: 0xd0b48a, sunPos: [12, 6, 8] },
  { fog: 0xf6f0e2, sky: 0xf3e8d4, floor: 0xd7c4a4, wall: 0xf8f1e4, sun: 0xffe6c2, hemi: 0xfbf6ec, ground: 0xb89a74, accent: 0xecd9b0, sunPos: [3, 7, 9] },
  { fog: 0xeadcc6, sky: 0xe2d0b4, floor: 0x8a6248, wall: 0xd8c4a8, sun: 0xffcc8a, hemi: 0xf0dcc0, ground: 0x5a3e30, accent: 0xf0c48a, sunPos: [-3, 4, 7] },
  { fog: 0xc9c4b8, sky: 0x2a3138, floor: 0x3a4044, wall: 0x4a5258, sun: 0xf0d2a4, hemi: 0xb7c0c6, ground: 0x23282c, accent: 0xd4b483, sunPos: [0, 2, 8] }
];

function smoother(u) {
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

function anchorOf(i) {
  const a = i * 0.78 + 0.4;
  return new THREE.Vector3(Math.cos(a) * 42, (i - 7.5) * 2.4, Math.sin(a) * 42);
}

function fitPhoto(w, h) {
  const maxW = 460;
  const maxH = 620;
  const aspect = w / h;
  let dw = maxW;
  let dh = dw / aspect;
  if (dh > maxH) {
    dh = maxH;
    dw = dh * aspect;
  }
  return { w: Math.round(dw), h: Math.round(dh) };
}

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(ROOMS[0].fog, 12, 36);
  scene.background = new THREE.Color(ROOMS[0].sky);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.08, 400);

  const cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  const cssDom = cssRenderer.domElement;
  cssDom.id = "css3d";
  cssDom.style.position = "fixed";
  cssDom.style.inset = "0";
  cssDom.style.zIndex = "2";
  cssDom.style.pointerEvents = "none";
  document.body.appendChild(cssDom);

  const cssScene = new THREE.Scene();
  const sheets = Array.from(document.querySelectorAll(".sheet"));
  const plates = Array.from(document.querySelectorAll(".plate"));
  const cards = sheets.map((sheet, i) => {
    const fit = fitPhoto(PHOTO_PX[i][0], PHOTO_PX[i][1]);
    const plate = plates[i];
    const img = plate.querySelector("img");
    const pad = 12;
    const frameW = fit.w + pad * 2;
    const frameH = fit.h + pad * 2;
    // Fixed pixel size before CSS3D so translate(-50%,-50%) uses real dimensions, not vh/grid.
    plate.style.width = frameW + "px";
    plate.style.height = frameH + "px";
    plate.style.boxSizing = "border-box";
    plate.style.position = "relative";
    plate.style.margin = "0";
    plate.style.top = "0";
    plate.style.left = "0";
    plate.style.flex = "none";
    img.style.display = "block";
    img.style.width = "100%";
    img.style.height = "auto";
    img.style.objectFit = "contain";
    img.style.objectPosition = "center center";
    img.style.maxWidth = "none";
    img.style.maxHeight = "none";

    const sheetObj = new CSS3DObject(sheet);
    sheetObj.position.set(-2.55, 0.15, 0);
    sheetObj.scale.setScalar(SCALE);

    const plateObj = new CSS3DObject(plate);
    plateObj.position.set(3.15, 0.05, 0.35);
    plateObj.scale.setScalar(SCALE);

    const rig = new THREE.Group();
    rig.add(sheetObj, plateObj);
    rig.position.copy(anchorOf(i));
    cssScene.add(rig);
    sheet.classList.add("is-spatial-card");
    plate.classList.add("is-spatial-plate");
    return { sheet, plate, rig };
  });

  const hemi = new THREE.HemisphereLight(ROOMS[0].hemi, ROOMS[0].ground, 0.85);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(ROOMS[0].sun, 1.35);
  scene.add(sun);
  scene.add(sun.target);
  const fill = new THREE.DirectionalLight(0xffffff, 0.28);
  scene.add(fill);

  const rooms = ROOMS.map((_, i) => {
    const group = buildRoom(i);
    group.position.copy(anchorOf(i));
    return group;
  });

  let intro = document.documentElement.classList.contains("is-overture") ? 0 : 1;
  let shown = 0;
  let travel = null;
  let reduced = false;
  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };
  const look = new THREE.Vector3();
  const fogColor = new THREE.Color();
  const fogTmp = new THREE.Color();
  const bgColor = new THREE.Color();
  let poseNow = poseFor(0);
  mount(shown);

  function mount(i) {
    if (!rooms[i].parent) scene.add(rooms[i]);
  }
  function unmountExcept(keep) {
    rooms.forEach((group, i) => {
      if (!keep.includes(i) && group.parent) scene.remove(group);
    });
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w, h, false);
    cssRenderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function applyAtmosphere(from, to, u) {
    const a = ROOMS[from];
    const b = ROOMS[to];
    fogColor.setHex(a.fog).lerp(fogTmp.setHex(b.fog), u);
    bgColor.setHex(a.sky).lerp(new THREE.Color(b.sky), u);
    scene.fog.color.copy(fogColor);
    scene.background.copy(bgColor);
    scene.fog.near = THREE.MathUtils.lerp(8, 8, u);
    scene.fog.far = THREE.MathUtils.lerp(28, 34, u);
    hemi.color.setHex(a.hemi).lerp(new THREE.Color(b.hemi), u);
    hemi.groundColor.setHex(a.ground).lerp(new THREE.Color(b.ground), u);
    sun.color.setHex(a.sun).lerp(new THREE.Color(b.sun), u);
    const sp = new THREE.Vector3(...a.sunPos).lerp(new THREE.Vector3(...b.sunPos), u);
    sun.position.copy(look).add(sp);
    sun.target.position.copy(look);
    sun.target.updateMatrixWorld();
    fill.position.set(look.x - sp.x, look.y + 2, look.z + 4);
  }

  function showCards(active, also) {
    cards.forEach((card, i) => {
      const on = i === active || i === also;
      const vis = on ? "visible" : "hidden";
      card.sheet.style.visibility = vis;
      card.plate.style.visibility = vis;
      card.sheet.style.pointerEvents = i === active ? "auto" : "none";
    });
  }

  function frame(now) {
    let logical;
    let mix = 1;
    let fromI = shown;
    let toI = shown;
    if (travel) {
      const u = Math.min(1, (now - travel.t0) / travel.dur);
      logical = sampleTravel(travel.fromPose, travel.to, u, travel.move);
      mix = smoother(u);
      fromI = travel.from;
      toI = travel.to;
      mount(travel.from);
      mount(travel.to);
      if (u >= 1) {
        shown = travel.to;
        travel = null;
        logical = poseFor(shown);
        mix = 1;
        fromI = shown;
        toI = shown;
        unmountExcept([shown]);
      }
    } else {
      logical = poseFor(shown);
      mount(shown);
    }

    const high = introPose();
    const k = smoother(Math.min(1, Math.max(0, intro)));
    const pos = high.pos.clone().lerp(logical.pos, k);
    look.copy(high.look).lerp(logical.look, k);

    pointer.x += (pointerTarget.x - pointer.x) * 0.05;
    pointer.y += (pointerTarget.y - pointer.y) * 0.05;
    const idle = reduced ? 0 : now * 0.00025;
    const side = new THREE.Vector3().subVectors(look, pos).cross(new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    pos.addScaledVector(side, pointer.x * 0.55 + Math.sin(idle) * 0.08);
    pos.addScaledVector(up, pointer.y * 0.28 + Math.cos(idle * 0.8) * 0.05);
    look.addScaledVector(side, pointer.x * 0.22);
    look.y += pointer.y * 0.08;

    camera.position.copy(pos);
    camera.lookAt(look);
    poseNow = { pos: pos.clone(), look: look.clone() };

    applyAtmosphere(fromI, toI, mix);
    showCards(toI, travel ? fromI : -1);

    renderer.render(scene, camera);
    cssRenderer.render(cssScene, camera);
  }

  document.body.classList.add("is-spatial");

  return {
    resize,
    start() {
      resize();
      renderer.setAnimationLoop(frame);
    },
    setIntro(u) { intro = u; },
    setReduced(flag) { reduced = !!flag; },
    goTo(index, snap) {
      const dest = Math.max(0, Math.min(15, index));
      const origin = travel ? travel.to : shown;
      if (reduced || snap) {
        shown = dest;
        travel = null;
        poseNow = poseFor(dest);
        unmountExcept([dest]);
        mount(dest);
        return;
      }
      if (dest === origin) return;
      const move = MOVES[Math.min(14, Math.max(0, Math.max(origin, dest) - 1))];
      mount(origin);
      mount(dest);
      travel = {
        fromPose: { pos: poseNow.pos.clone(), look: poseNow.look.clone() },
        from: origin,
        to: dest,
        move,
        t0: performance.now(),
        dur: reduced ? 0 : 1600
      };
    },
    setFocus() {},
    setPointer(x, y) {
      pointerTarget.x = x;
      pointerTarget.y = y;
    },
    pose() {
      return { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    }
  };
}

function poseFor(i) {
  const base = anchorOf(i);
  const yaw = (i % 4 - 1.5) * 0.05;
  const lift = (i % 3) * 0.15;
  const dist = 13.2 + (i % 3) * 0.25;
  const offset = new THREE.Vector3(Math.sin(yaw) * dist, 0.35 + lift, Math.cos(yaw) * dist);
  return {
    pos: base.clone().add(offset),
    look: base.clone().add(new THREE.Vector3(0.15, 0.05, 0))
  };
}

function introPose() {
  const settled = poseFor(0);
  return {
    pos: settled.pos.clone().add(new THREE.Vector3(1.2, 6.5, 10)),
    look: settled.look.clone()
  };
}

function sampleTravel(fromPose, toIndex, u, move) {
  const to = poseFor(toIndex);
  const e = smoother(u);
  const pos = fromPose.pos.clone().lerp(to.pos, e);
  const look = fromPose.look.clone().lerp(to.look, e);
  const dir = to.pos.clone().sub(fromPose.pos);
  if (dir.lengthSq() < 0.0001) dir.set(0, 0, -1);
  dir.normalize();
  const side = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
  const bow = Math.sin(Math.PI * u);
  const up = new THREE.Vector3(0, 1, 0);
  if (move === "left") pos.addScaledVector(side, bow * 6);
  else if (move === "up") pos.addScaledVector(up, bow * 5);
  else if (move === "forward") pos.addScaledVector(up, -bow * 0.6);
  else if (move === "right") pos.addScaledVector(side, -bow * 6);
  else if (move === "down") pos.addScaledVector(up, -bow * 4.5);
  else if (move === "orbit") {
    pos.addScaledVector(side, bow * 8);
    pos.addScaledVector(up, bow * 1.6);
  } else if (move === "rise") {
    pos.addScaledVector(up, bow * 7);
    pos.addScaledVector(side, bow * 1.4);
  } else if (move === "descend") pos.addScaledVector(up, bow * 5.5);
  else if (move === "strafe") pos.addScaledVector(side, -bow * 5);
  else if (move === "sweep") {
    pos.addScaledVector(side, bow * 4);
    pos.addScaledVector(up, bow * 4);
  } else if (move === "back") pos.addScaledVector(dir, -bow * 5);
  else if (move === "crane") {
    pos.addScaledVector(up, bow * 8);
    pos.addScaledVector(dir, -bow * 2);
  } else if (move === "arc") {
    pos.addScaledVector(side, -bow * 6);
    pos.addScaledVector(up, bow * 1.2);
  } else if (move === "sink") pos.addScaledVector(up, -bow * 6);
  else if (move === "lift") {
    pos.addScaledVector(up, bow * 3.5);
    pos.addScaledVector(side, -bow * 3);
  }
  return { pos, look };
}

function mat(color, rough, metal) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: rough == null ? 0.72 : rough,
    metalness: metal || 0
  });
}

function add(group, mesh, x, y, z) {
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

function buildRoom(i) {
  const r = ROOMS[i];
  const g = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.BoxGeometry(22, 0.35, 16), mat(r.floor, 0.86));
  add(g, floor, 0, -3.7, 0);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(22, 9, 0.4), mat(r.wall, 0.9));
  add(g, wall, 0, 0.4, -5.2);
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(16, 24, 16),
    new THREE.MeshBasicMaterial({ color: r.sky, side: THREE.BackSide })
  );
  g.add(shell);

  if (i === 0) plaza(g, r);
  else if (i === 1) gallery(g, r);
  else if (i === 2) terrace(g, r);
  else if (i === 3) study(g, r);
  else if (i === 4) library(g, r);
  else if (i === 5) split(g, r);
  else if (i === 6) archive(g, r);
  else if (i === 7) twin(g, r);
  else if (i === 8) studio(g, r);
  else if (i === 9) hall(g, r);
  else if (i === 10) loft(g, r);
  else if (i === 11) cloister(g, r);
  else if (i === 12) panorama(g, r);
  else if (i === 13) pavilion(g, r);
  else if (i === 14) reading(g, r);
  else court(g, r);
  return g;
}

function column(g, x, z, h, color, rough) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, h, 10), mat(color, rough == null ? 0.55 : rough));
  add(g, m, x, -3.5 + h / 2, z);
  return m;
}

function plaza(g, r) {
  for (let n = 0; n < 6; n += 1) {
    const a = (n / 6) * Math.PI * 2;
    column(g, Math.cos(a) * 7.2, Math.sin(a) * 4.2 - 1, 3.2, r.accent, 0.4);
  }
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 1.4), mat(0xf7f3ec, 0.5));
  add(g, plinth, -7, -3.35, 1.5);
}

function gallery(g, r) {
  const side = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, 14), mat(r.wall, 0.92));
  add(g, side, -10.5, 0.2, 0);
  add(g, side.clone(), 10.5, 0.2, 0);
  for (let n = 0; n < 4; n += 1) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.1, 0.08), mat(0x2c3338, 0.45, 0.2));
    add(g, frame, -6.2 + n * 1.9, 0.6, -4.85);
  }
}

function terrace(g, r) {
  const rail = new THREE.Mesh(new THREE.BoxGeometry(16, 0.12, 0.12), mat(0xf4f1ea, 0.3, 0.4));
  add(g, rail, 0, -1.4, 4.6);
  for (let n = 0; n < 4; n += 1) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2 + n * 0.7, 1.4), mat(0x6a5348, 0.8));
    add(g, block, -8 + n * 2.2, -2.2, -3.2);
  }
}

function study(g, r) {
  for (let n = 0; n < 7; n += 1) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, 6.2, 0.08), mat(0xf7f4ee, 0.4));
    add(g, mullion, -6.5 + n * 0.55, 0.4, -4.9);
  }
  const desk = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 1.2), mat(r.floor, 0.55));
  add(g, desk, -7.2, -2.4, 1.2);
}

function library(g, r) {
  for (let n = 0; n < 5; n += 1) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.4, 1.5), mat(0x6b4630, 0.7));
    add(g, shelf, -8.2, -1.3, -3.2 + n * 1.15);
    const books = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.6, 1.2), mat(n % 2 ? 0x8d3d32 : 0x2f4a3c, 0.6));
    add(g, books, -7.9, -0.4, -3.2 + n * 1.15);
  }
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), new THREE.MeshStandardMaterial({
    color: 0xffe1b0, emissive: 0xffc56a, emissiveIntensity: 0.8, roughness: 0.4
  }));
  add(g, lamp, 6.5, 1.2, 1);
}

function split(g, r) {
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.08, 6.5, 12), new THREE.MeshStandardMaterial({
    color: 0xd5e6ea, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.35
  }));
  add(g, glass, 1.2, 0, 0);
  const warm = new THREE.Mesh(new THREE.BoxGeometry(8, 7, 0.3), mat(0xd7b48a, 0.8));
  add(g, warm, -6, 0, -4.9);
  const cool = new THREE.Mesh(new THREE.BoxGeometry(6, 7, 0.3), mat(0xd5dbe2, 0.7));
  add(g, cool, 6.2, 0, -4.9);
}

function archive(g, r) {
  for (let n = 0; n < 8; n += 1) {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.4, 0.7), mat(n % 2 ? 0x8d9290 : 0xb7b2a6, 0.65));
    add(g, cab, -8.4, -2.3, -3.4 + n * 0.95);
  }
  const runner = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 12), mat(0x6e2430, 0.8));
  add(g, runner, -5.5, -3.5, 0);
}

function twin(g, r) {
  const brass = mat(r.accent, 0.35, 0.65);
  const stripA = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 12), brass);
  const stripB = stripA.clone();
  add(g, stripA, -5.2, -3.5, 0);
  add(g, stripB, 5.4, -3.5, 0);
  for (let n = 0; n < 5; n += 1) {
    column(g, -6.4, -3 + n * 1.6, 3.4, 0xf4f1ea, 0.45);
    column(g, 6.6, -3 + n * 1.6, 3.4, 0xf4f1ea, 0.45);
  }
}

function studio(g, r) {
  for (let n = 0; n < 3; n += 1) {
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.1), mat(0xd8d2c8, 0.55));
    add(g, table, -7.4, -2.5, -1 + n * 1.6);
  }
  const board = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.4, 0.08), mat(0x2f4a3c, 0.8));
  add(g, board, 7.2, 0.2, -4.8);
}

function hall(g, r) {
  for (let n = 0; n < 4; n += 1) column(g, -7.5 + n * 2.1, -2.2, 5.6, 0xf7f3ec, 0.4);
  for (let n = 0; n < 3; n += 1) {
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.7, 6, 0.7), new THREE.MeshBasicMaterial({
      color: 0xfff6e4, transparent: true, opacity: 0.18, depthWrite: false
    }));
    add(g, shaft, -4 + n * 2.4, 1.2, -1);
  }
}

function loft(g, r) {
  for (let n = 0; n < 5; n += 1) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(16, 0.16, 0.16), mat(0x8aa0b0, 0.35, 0.7));
    add(g, beam, 0, 3.2, -3 + n * 1.3);
  }
  const pier = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5, 0.5), mat(0x66727c, 0.6, 0.2));
  add(g, pier, -8, -1, 2);
  add(g, pier.clone(), 8, -1, 2);
}

function cloister(g, r) {
  for (let n = 0; n < 8; n += 1) {
    const a = (n / 8) * Math.PI * 2;
    column(g, Math.cos(a) * 6.5, Math.sin(a) * 3.2, 3.1, 0xe8e4da, 0.7);
  }
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.5, 28), new THREE.MeshStandardMaterial({
    color: 0x6e8f86, roughness: 0.08, metalness: 0.85
  }));
  pool.rotation.x = -Math.PI / 2;
  add(g, pool, 6.2, -3.48, 0.4);
}

function panorama(g, r) {
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(18, 0.7, 0.3), mat(0xe7e0d2, 0.8));
  add(g, parapet, 0, -2.8, 5);
  const band = new THREE.Mesh(new THREE.BoxGeometry(20, 1.4, 0.2), mat(0xd7e3ea, 0.9));
  add(g, band, 0, -0.4, -4.9);
}

function pavilion(g, r) {
  for (let n = 0; n < 4; n += 1) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.2, 0.18), mat(0x8d6244, 0.6));
    add(g, post, -6.5 + (n % 2) * 13, -1.4, -2 + Math.floor(n / 2) * 4);
  }
  const screen = new THREE.Mesh(new THREE.BoxGeometry(5, 3.2, 0.05), new THREE.MeshStandardMaterial({
    color: 0xf8f1e2, roughness: 0.95, transparent: true, opacity: 0.78
  }));
  add(g, screen, 6.4, -0.2, -2);
}

function reading(g, r) {
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.4, 0.4), mat(0x6b4630, 0.7));
  add(g, shelf, -7.2, -2.4, -4.6);
  for (let n = 0; n < 2; n += 1) {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshStandardMaterial({
      color: 0xffe2b8, emissive: 0xffb45a, emissiveIntensity: 1, roughness: 0.35
    }));
    add(g, lamp, -6 + n * 2.2, -1.4, -4.2);
  }
  const rug = new THREE.Mesh(new THREE.BoxGeometry(6, 0.04, 3.2), mat(0x7a2e2a, 0.9));
  add(g, rug, -1, -3.5, 1);
}

function court(g, r) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.05, 12, 48), mat(r.accent, 0.35, 0.8));
  ring.rotation.x = Math.PI / 2;
  add(g, ring, 5.5, -3.45, 0);
  for (let n = 0; n < 6; n += 1) {
    const a = (n / 6) * Math.PI * 2;
    const up = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.8, 8), new THREE.MeshStandardMaterial({
      color: 0xf0d2a4, emissive: 0xc48a4a, emissiveIntensity: 0.7, roughness: 0.4
    }));
    add(g, up, 5.5 + Math.cos(a) * 3.1, -3.2, Math.sin(a) * 2.2);
  }
}
