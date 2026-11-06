import * as THREE from "../vendor/three.module.min.js";
import { CSS3DObject, CSS3DRenderer } from "./objects/CSS3DRenderer.js";

const DIST = 13.35;
const DESIGN_H = 1080;
const SHEET_W = 1140;
const MAX_SHEET_H = 960;
const TRAVEL_MS = 1180;
const PHOTO_MAX_W = 440;
const PHOTO_MAX_H = 680;
const PHOTO_PAD = 14;

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

const BANDS = [
  [0xf0c078, 0xc9efe4, 0xf6d0d6],
  [0xc5dff5, 0xf7e2c0, 0xd5efd8],
  [0xf0a878, 0xd4f0e4, 0xf8d8c8],
  [0xbfe8d8, 0xf6e0c4, 0xf3d4dc],
  [0xe8b86a, 0xc8eee4, 0xf6d4dc],
  [0xc5d4f0, 0xf6e4c8, 0xd4eee0],
  [0xcfe0c8, 0xf4d8c8, 0xd5e4f2],
  [0xf0e0c0, 0xcfe8dc, 0xf6d6de],
  [0xc8e4d4, 0xf6e2c4, 0xe4d8f0],
  [0xf6e4b8, 0xd0eee6, 0xf8d6d4],
  [0xc8daf0, 0xf4e0c4, 0xd4eadc],
  [0xdce4d4, 0xf6dcc8, 0xd8e2f2],
  [0xc8e2f4, 0xf6e4c8, 0xf0d4de],
  [0xf0cc98, 0xcfead8, 0xf8d8cc],
  [0xe8c898, 0xd4eee4, 0xf6d4d8],
  [0xf0d4a8, 0xd8eee6, 0xf4d6de]
];

const BLUR_VS = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const BLUR_FS = `
precision highp float;
uniform sampler2D tDiffuse;
uniform vec2 uDirection;
uniform vec2 uResolution;
uniform float uRadius;
varying vec2 vUv;
void main() {
  vec2 off = uDirection * uRadius / uResolution;
  vec3 c = texture2D(tDiffuse, vUv).rgb * 0.227027;
  c += texture2D(tDiffuse, vUv + off * 1.384615).rgb * 0.316216;
  c += texture2D(tDiffuse, vUv - off * 1.384615).rgb * 0.316216;
  c += texture2D(tDiffuse, vUv + off * 3.230769).rgb * 0.070270;
  c += texture2D(tDiffuse, vUv - off * 3.230769).rgb * 0.070270;
  gl_FragColor = vec4(c, 1.0);
}
`;

const GLASS_VS = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const GLASS_FS = `
precision highp float;
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform vec3 uTint;
uniform float uFill;
uniform float uFade;
varying vec2 vUv;
void main() {
  vec2 screenUV = gl_FragCoord.xy / uResolution;
  vec3 blurred = texture2D(tDiffuse, screenUV).rgb;
  float luma = dot(blurred, vec3(0.299, 0.587, 0.114));
  blurred = mix(vec3(luma), blurred, 1.22);
  vec3 frost = mix(blurred, uTint, uFill);
  float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
  float rim = 1.0 - smoothstep(0.0, 0.014, edge);
  frost = mix(frost, vec3(1.0), rim * 0.82);
  gl_FragColor = vec4(frost, uFade);
  #include <colorspace_fragment>
}
`;

function smoother(u) {
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

function clamp01(u) {
  return Math.min(1, Math.max(0, u));
}

function anchorOf(i) {
  const a = i * 0.78 + 0.4;
  return new THREE.Vector3(Math.cos(a) * 42, (i - 7.5) * 2.4, Math.sin(a) * 42);
}

function fitPhoto(w, h) {
  const aspect = w / h;
  let dw = PHOTO_MAX_W;
  let dh = dw / aspect;
  if (dh > PHOTO_MAX_H) {
    dh = PHOTO_MAX_H;
    dw = dh * aspect;
  }
  return { w: Math.round(dw), h: Math.round(dh) };
}

function makeTarget(w, h, depth) {
  const rt = new THREE.WebGLRenderTarget(w, h, {
    depthBuffer: depth,
    stencilBuffer: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat
  });
  rt.texture.colorSpace = THREE.LinearSRGBColorSpace;
  return rt;
}

function driftOf(move) {
  if (move === "left" || move === "strafe" || move === "arc") return -1;
  if (move === "right" || move === "orbit" || move === "sweep") return 1;
  if (move === "up" || move === "rise" || move === "crane" || move === "lift") return 0.15;
  return 0.45;
}

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(ROOMS[0].fog, 18, 48);
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
  document.body.classList.add("is-spatial");

  const sandbox = document.createElement("div");
  sandbox.style.cssText = "position:fixed;left:0;top:0;width:max-content;visibility:hidden;pointer-events:none;z-index:-1;";
  document.body.appendChild(sandbox);

  const sheets = Array.from(document.querySelectorAll(".sheet"));
  const plates = Array.from(document.querySelectorAll(".plate"));
  sheets.forEach((sheet) => sandbox.appendChild(sheet));

  function measureSheet(sheet) {
    sheet.style.width = SHEET_W + "px";
    sheet.style.height = "auto";
    sheet.style.maxHeight = "none";
    sheet.style.overflow = "visible";
    sheet.style.boxSizing = "border-box";
    sheet.style.background = "transparent";
    sheet.style.backdropFilter = "none";
    sheet.style.webkitBackdropFilter = "none";
    const natural = sheet.offsetHeight;
    const h = Math.min(MAX_SHEET_H, Math.max(natural, 360));
    sheet.style.height = h + "px";
    sheet.style.overflow = natural > MAX_SHEET_H + 2 ? "auto" : "hidden";
    return h;
  }

  const blurMat = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      uDirection: { value: new THREE.Vector2(1, 0) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uRadius: { value: 1 }
    },
    vertexShader: BLUR_VS,
    fragmentShader: BLUR_FS,
    depthTest: false,
    depthWrite: false,
    toneMapped: false
  });
  const blurScene = new THREE.Scene();
  const blurCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
  const blurQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blurMat);
  blurQuad.position.z = -1;
  blurScene.add(blurQuad);

  let sceneRT = null;
  let blurA = null;
  let blurB = null;
  let metrics = { textScale: 0.01, photoScale: 0.01, gap: 0.7 };

  const cards = sheets.map((sheet, i) => {
    const fit = fitPhoto(PHOTO_PX[i][0], PHOTO_PX[i][1]);
    const plate = plates[i];
    const img = plate.querySelector("img");
    const frameW = fit.w + PHOTO_PAD * 2;
    const frameH = fit.h + PHOTO_PAD * 2;
    plate.style.width = frameW + "px";
    plate.style.height = frameH + "px";
    plate.style.boxSizing = "border-box";
    plate.style.position = "relative";
    plate.style.margin = "0";
    plate.style.top = "0";
    plate.style.left = "0";
    plate.style.flex = "none";
    plate.style.background = "transparent";
    img.style.display = "block";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";
    img.style.objectPosition = "center center";
    img.style.maxWidth = "none";
    img.style.maxHeight = "none";

    const pixelH = measureSheet(sheet);
    const sheetObj = new CSS3DObject(sheet);
    const plateObj = new CSS3DObject(plate);
    const rig = new THREE.Group();
    rig.add(sheetObj, plateObj);
    rig.position.copy(anchorOf(i));
    cssScene.add(rig);

    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: null },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uTint: { value: new THREE.Color(0xfffcf7) },
          uFill: { value: 0.32 },
          uFade: { value: 1 }
        },
        vertexShader: GLASS_VS,
        fragmentShader: GLASS_FS,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        toneMapped: false
      })
    );
    glass.frustumCulled = false;
    glass.renderOrder = 4;
    glass.visible = false;
    scene.add(glass);

    sheet.classList.add("is-spatial-card");
    plate.classList.add("is-spatial-plate");
    return {
      sheet,
      plate,
      sheetObj,
      plateObj,
      rig,
      glass,
      anchor: anchorOf(i),
      pixelW: SHEET_W,
      pixelH,
      plateW: frameW,
      plateH: frameH,
      fade: i === 0 ? 1 : 0
    };
  });

  const hemi = new THREE.HemisphereLight(ROOMS[0].hemi, ROOMS[0].ground, 0.92);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(ROOMS[0].sun, 1.45);
  scene.add(sun);
  scene.add(sun.target);
  const fill = new THREE.DirectionalLight(0xfff4e8, 0.42);
  scene.add(fill);

  const rooms = ROOMS.map((_, i) => {
    const group = buildRoom(i);
    group.position.copy(anchorOf(i));
    return group;
  });
  cards.forEach((card, i) => {
    card.pedestal = rooms[i].userData.pedestal || null;
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
  const sunA = new THREE.Vector3();
  const sunB = new THREE.Vector3();
  const glassPos = new THREE.Vector3();
  const glassQuat = new THREE.Quaternion();
  const glassScale = new THREE.Vector3();
  const drawSize = new THREE.Vector2();
  let poseNow = poseFor(0);

  function computeMetrics(viewW, viewH) {
    const tan = Math.tan((42 * Math.PI) / 360);
    const visH = 2 * DIST * tan;
    const visW = visH * (viewW / Math.max(1, viewH));
    const textScale = visH / DESIGN_H;
    let photoScale = textScale;
    const gap = Math.max(0.58, 72 * textScale);
    const maxPlate = PHOTO_MAX_W + PHOTO_PAD * 2;
    const limit = visW * 0.92;
    let guard = 0;
    while (SHEET_W * textScale + gap + maxPlate * photoScale > limit && photoScale > textScale * 0.42 && guard < 14) {
      photoScale *= 0.9;
      guard += 1;
    }
    return { textScale, photoScale, gap };
  }

  function layoutCards() {
    const { textScale, photoScale, gap } = metrics;
    cards.forEach((card) => {
      const sheetWorldW = card.pixelW * textScale;
      const plateWorldW = card.plateW * photoScale;
      const total = sheetWorldW + gap + plateWorldW;
      const left = -total / 2;
      const sheetX = left + sheetWorldW / 2;
      const plateX = left + sheetWorldW + gap + plateWorldW / 2;
      card.sheetObj.position.set(sheetX, 0.02, 0);
      card.plateObj.position.set(plateX, 0.02, 0.05);
      card.sheetObj.scale.setScalar(textScale);
      card.plateObj.scale.setScalar(photoScale);
      if (card.pedestal) card.pedestal.position.x = plateX;
    });
  }

  function remeasure() {
    cards.forEach((card) => {
      card.pixelH = measureSheet(card.sheet);
    });
  }

  function mount(i) {
    if (!rooms[i].parent) scene.add(rooms[i]);
  }
  function unmountExcept(keep) {
    rooms.forEach((group, i) => {
      if (!keep.includes(i) && group.parent) scene.remove(group);
    });
  }
  mount(shown);

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w, h, false);
    cssRenderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    metrics = computeMetrics(w, h);
    layoutCards();
    renderer.getDrawingBufferSize(drawSize);
    const bw = Math.max(2, drawSize.x);
    const bh = Math.max(2, drawSize.y);
    if (!sceneRT || sceneRT.width !== bw || sceneRT.height !== bh) {
      if (sceneRT) sceneRT.dispose();
      if (blurA) blurA.dispose();
      if (blurB) blurB.dispose();
      sceneRT = makeTarget(bw, bh, true);
      blurA = makeTarget(Math.max(2, bw >> 1), Math.max(2, bh >> 1), false);
      blurB = makeTarget(Math.max(2, bw >> 1), Math.max(2, bh >> 1), false);
    }
  }

  function applyAtmosphere(from, to, u) {
    const a = ROOMS[from];
    const b = ROOMS[to];
    fogColor.setHex(a.fog).lerp(fogTmp.setHex(b.fog), u);
    bgColor.setHex(a.sky).lerp(new THREE.Color(b.sky), u);
    scene.fog.color.copy(fogColor);
    scene.background.copy(bgColor);
    scene.fog.near = 18;
    scene.fog.far = 48;
    hemi.color.setHex(a.hemi).lerp(new THREE.Color(b.hemi), u);
    hemi.groundColor.setHex(a.ground).lerp(new THREE.Color(b.ground), u);
    sun.color.setHex(a.sun).lerp(new THREE.Color(b.sun), u);
    sunA.set(a.sunPos[0], a.sunPos[1], a.sunPos[2]);
    sunB.set(b.sunPos[0], b.sunPos[1], b.sunPos[2]);
    sunA.lerp(sunB, u);
    sun.position.copy(look).add(sunA);
    sun.target.position.copy(look);
    sun.target.updateMatrixWorld();
    fill.position.set(look.x - sunA.x, look.y + 2, look.z + 4);
  }

  function present(now) {
    const kIntro = smoother(clamp01(intro));
    cards.forEach((card, i) => {
      let ox = 0;
      let oy = 0;
      let oz = 0;
      let sc = 1;
      let fade = 0;
      if (travel && i === travel.from) {
        const e = smoother(clamp01((now - travel.t0) / travel.dur));
        ox = driftOf(travel.move) * 1.15 * e;
        oy = 0.4 * e;
        oz = -2.6 * e;
        sc = 1 - 0.06 * e;
        fade = 1 - 0.62 * e;
      } else if (travel && i === travel.to) {
        const e = smoother(clamp01((now - travel.t0) / travel.dur));
        const w = 1 - e;
        ox = -driftOf(travel.move) * 0.9 * w;
        oy = -0.32 * w;
        oz = -3 * w;
        sc = 0.93 + 0.07 * e;
        fade = 0.22 + 0.78 * e;
      } else if (i === shown) {
        fade = 1;
        if (intro < 0.999) {
          const w = 1 - kIntro;
          oz = -2.2 * w;
          oy = 0.26 * w;
          sc = 0.95 + 0.05 * kIntro;
          fade = 0.2 + 0.8 * kIntro;
        }
      }
      card.fade = fade;
      card.rig.position.set(card.anchor.x + ox, card.anchor.y + oy, card.anchor.z + oz);
      card.sheetObj.scale.setScalar(metrics.textScale * sc);
      card.plateObj.scale.setScalar(metrics.photoScale * sc);
      const on = fade > 0.03;
      card.sheet.style.visibility = on ? "visible" : "hidden";
      card.plate.style.visibility = on ? "visible" : "hidden";
      card.sheet.style.opacity = String(fade);
      card.plate.style.opacity = String(fade);
      card.sheet.style.pointerEvents = !travel && i === shown && intro > 0.92 ? "auto" : "none";
    });
  }

  function blurFrom(source) {
    const steps = [
      [1, 0, 0.85, blurA],
      [0, 1, 0.85, blurB],
      [1, 0, 1.7, blurA],
      [0, 1, 1.7, blurB],
      [1, 0, 1.45, blurA],
      [0, 1, 1.45, blurB]
    ];
    let src = source;
    let latest = blurB;
    steps.forEach((step) => {
      const dst = step[3];
      blurMat.uniforms.tDiffuse.value = src.texture;
      blurMat.uniforms.uDirection.value.set(step[0], step[1]);
      blurMat.uniforms.uRadius.value = step[2];
      blurMat.uniforms.uResolution.value.set(dst.width, dst.height);
      renderer.setRenderTarget(dst);
      renderer.render(blurScene, blurCam);
      src = dst;
      latest = dst;
    });
    return latest;
  }

  function syncGlass(buffer) {
    cssScene.updateMatrixWorld(true);
    const size = renderer.getDrawingBufferSize(drawSize);
    cards.forEach((card) => {
      card.sheetObj.getWorldPosition(glassPos);
      card.sheetObj.getWorldQuaternion(glassQuat);
      card.sheetObj.getWorldScale(glassScale);
      card.glass.position.copy(glassPos);
      card.glass.position.z -= 0.04;
      card.glass.quaternion.copy(glassQuat);
      card.glass.scale.set(
        Math.max(0.01, card.pixelW * glassScale.x),
        Math.max(0.01, card.pixelH * glassScale.y),
        1
      );
      card.glass.material.uniforms.tDiffuse.value = buffer.texture;
      card.glass.material.uniforms.uResolution.value.set(size.x, size.y);
      card.glass.material.uniforms.uFade.value = card.fade;
      card.glass.visible = card.fade > 0.03;
    });
  }

  function frame(now) {
    let logical;
    let mix = 1;
    let fromI = shown;
    let toI = shown;
    if (travel) {
      const raw = clamp01((now - travel.t0) / travel.dur);
      logical = sampleTravel(travel.fromPose, travel.to, raw, travel.move);
      mix = smoother(raw);
      fromI = travel.from;
      toI = travel.to;
      mount(travel.from);
      mount(travel.to);
      if (raw >= 1) {
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
    const k = smoother(clamp01(intro));
    const pos = high.pos.clone().lerp(logical.pos, k);
    look.copy(high.look).lerp(logical.look, k);

    pointer.x += (pointerTarget.x - pointer.x) * 0.05;
    pointer.y += (pointerTarget.y - pointer.y) * 0.05;
    const idle = reduced ? 0 : now * 0.00022;
    const side = new THREE.Vector3().subVectors(look, pos).cross(new THREE.Vector3(0, 1, 0));
    if (side.lengthSq() > 0.0001) side.normalize();
    const up = new THREE.Vector3(0, 1, 0);
    pos.addScaledVector(side, pointer.x * 0.42 + Math.sin(idle) * 0.06);
    pos.addScaledVector(up, pointer.y * 0.22 + Math.cos(idle * 0.8) * 0.04);
    look.addScaledVector(side, pointer.x * 0.16);
    look.y += pointer.y * 0.06;

    camera.position.copy(pos);
    camera.lookAt(look);
    poseNow = { pos: pos.clone(), look: look.clone() };

    applyAtmosphere(fromI, toI, mix);
    present(now);

    if (!sceneRT) resize();
    cards.forEach((card) => { card.glass.visible = false; });
    renderer.setRenderTarget(sceneRT);
    renderer.clear(true, true, true);
    renderer.render(scene, camera);
    const blurred = blurFrom(sceneRT);
    syncGlass(blurred);
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    cssRenderer.render(cssScene, camera);
  }

  document.fonts.ready.then(() => {
    remeasure();
    layoutCards();
  });

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
        dur: TRAVEL_MS
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
  const yaw = (i % 5 - 2) * 0.03;
  const lift = ((i % 3) - 1) * 0.1;
  const offset = new THREE.Vector3(Math.sin(yaw) * DIST, 0.18 + lift, Math.cos(yaw) * DIST);
  return {
    pos: base.clone().add(offset),
    look: base.clone()
  };
}

function introPose() {
  const settled = poseFor(0);
  return {
    pos: settled.pos.clone().add(new THREE.Vector3(0.7, 2.15, 4.4)),
    look: settled.look.clone().add(new THREE.Vector3(0, 0.35, 0))
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
  if (move === "left") pos.addScaledVector(side, bow * 2.8);
  else if (move === "up") pos.addScaledVector(up, bow * 2.1);
  else if (move === "forward") pos.addScaledVector(up, -bow * 0.35);
  else if (move === "right") pos.addScaledVector(side, -bow * 2.8);
  else if (move === "down") pos.addScaledVector(up, -bow * 1.9);
  else if (move === "orbit") {
    pos.addScaledVector(side, bow * 3.3);
    pos.addScaledVector(up, bow * 1.05);
  } else if (move === "rise") {
    pos.addScaledVector(up, bow * 2.5);
    pos.addScaledVector(side, bow * 0.9);
  } else if (move === "descend") pos.addScaledVector(up, bow * 2.2);
  else if (move === "strafe") pos.addScaledVector(side, -bow * 2.4);
  else if (move === "sweep") {
    pos.addScaledVector(side, bow * 2.2);
    pos.addScaledVector(up, bow * 1.5);
  } else if (move === "back") pos.addScaledVector(dir, -bow * 2.3);
  else if (move === "crane") {
    pos.addScaledVector(up, bow * 2.7);
    pos.addScaledVector(dir, -bow * 1.1);
  } else if (move === "arc") {
    pos.addScaledVector(side, -bow * 2.7);
    pos.addScaledVector(up, bow * 0.8);
  } else if (move === "sink") pos.addScaledVector(up, -bow * 2.3);
  else if (move === "lift") {
    pos.addScaledVector(up, bow * 1.7);
    pos.addScaledVector(side, -bow * 1.5);
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
  backdrop(g, i);
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.18, 1.05), mat(0xf7f3ec, 0.48));
  add(g, pedestal, 5.6, -3.46, 0.85);
  g.userData.pedestal = pedestal;

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
  dress(g, i, r);
  return g;
}

function column(g, x, z, h, color, rough) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, h, 10), mat(color, rough == null ? 0.55 : rough));
  add(g, m, x, -3.5 + h / 2, z);
  return m;
}

function plaza(g, r) {
  for (let n = 0; n < 4; n += 1) {
    column(g, -10.05, -2.2 + n * 1.45, 3.15, r.accent, 0.4);
    column(g, 10.05, -2.2 + n * 1.45, 3.15, 0xf4efe4, 0.45);
  }
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 1.4), mat(0xf7f3ec, 0.5));
  add(g, plinth, -10.1, -3.05, 2.2);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 14), mat(0xe8d7b0, 0.35, 0.25));
  add(g, orb, -10.1, -2.2, 2.2);
}

function gallery(g, r) {
  const side = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, 14), mat(r.wall, 0.92));
  add(g, side, -10.5, 0.2, 0);
  add(g, side.clone(), 10.5, 0.2, 0);
  for (let n = 0; n < 4; n += 1) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.7, 1.35), mat(0x2c3338, 0.45, 0.2));
    add(g, frame, -10.25, 0.55, -2.6 + n * 1.5);
    const paint = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.35, 1.05), mat(n % 2 ? 0xc9d7e4 : 0xe7d3b4, 0.6));
    add(g, paint, -10.18, 0.55, -2.6 + n * 1.5);
  }
}

function terrace(g, r) {
  const rail = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 0.1), mat(0xf4f1ea, 0.3, 0.4));
  add(g, rail, -10.2, -2.7, 2.4);
  add(g, rail.clone(), 10.2, -2.7, 2.4);
  for (let n = 0; n < 4; n += 1) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.6 + n * 0.45, 1.15), mat(0x6a5348, 0.8));
    add(g, block, -10.2, -2.7, -3.4 + n * 1.15);
  }
}

function study(g, r) {
  for (let n = 0; n < 7; n += 1) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, 6.2, 0.08), mat(0xf7f4ee, 0.4));
    add(g, mullion, -6.5 + n * 0.55, 0.4, -4.9);
  }
  const desk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.05), mat(r.floor, 0.55));
  add(g, desk, -10.05, -3.05, 1.6);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), new THREE.MeshStandardMaterial({
    color: 0xffe7c2, emissive: 0xffc56a, emissiveIntensity: 0.9, roughness: 0.35
  }));
  add(g, lamp, -9.7, -2.55, 1.5);
}

function library(g, r) {
  for (let n = 0; n < 5; n += 1) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.4, 1.5), mat(0x6b4630, 0.7));
    add(g, shelf, -10.15, -1.3, -3.2 + n * 1.05);
    const books = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.5, 1.05), mat(n % 2 ? 0x8d3d32 : 0x2f4a3c, 0.6));
    add(g, books, -9.9, -0.45, -3.2 + n * 1.05);
  }
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), new THREE.MeshStandardMaterial({
    color: 0xffe1b0, emissive: 0xffc56a, emissiveIntensity: 0.8, roughness: 0.4
  }));
  add(g, lamp, 10.05, 1.5, -1.4);
}

function split(g, r) {
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.08, 6.5, 12), new THREE.MeshStandardMaterial({
    color: 0xd5e6ea, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.35
  }));
  add(g, glass, -10.15, 0.2, 0);
  const warm = new THREE.Mesh(new THREE.BoxGeometry(6, 6.2, 0.18), mat(0xd7b48a, 0.8));
  add(g, warm, -4.2, 0.3, -4.9);
  const cool = new THREE.Mesh(new THREE.BoxGeometry(5, 6.2, 0.18), mat(0xd5dbe2, 0.7));
  add(g, cool, 4.6, 0.3, -4.9);
}

function archive(g, r) {
  for (let n = 0; n < 8; n += 1) {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.4, 0.7), mat(n % 2 ? 0x8d9290 : 0xb7b2a6, 0.65));
    add(g, cab, -10.2, -2.3, -3.6 + n * 0.9);
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
    column(g, -10.05, -2.4 + n * 1.35, 3.3, 0xf4f1ea, 0.45);
    column(g, 10.05, -2.4 + n * 1.35, 3.3, 0xf4f1ea, 0.45);
  }
}

function studio(g, r) {
  for (let n = 0; n < 3; n += 1) {
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.1), mat(0xd8d2c8, 0.55));
    add(g, table, -10.15, -3.05, -1.2 + n * 1.35);
  }
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 0.08), mat(0x2f4a3c, 0.8));
  add(g, board, 10.15, 0.15, -2.2);
  const easel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.7), mat(0xc4a574, 0.6));
  add(g, easel, 9.85, -2.2, -2.2);
}

function hall(g, r) {
  column(g, -10.1, -1.6, 5.2, 0xf7f3ec, 0.4);
  column(g, -10.1, 1.4, 5.2, 0xf7f3ec, 0.4);
  column(g, 10.1, -1.2, 5.2, 0xf7f3ec, 0.4);
  column(g, 10.1, 1.6, 5.2, 0xf7f3ec, 0.4);
  for (let n = 0; n < 2; n += 1) {
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.55, 5.4, 0.55), new THREE.MeshBasicMaterial({
      color: 0xfff6e4, transparent: true, opacity: 0.2, depthWrite: false
    }));
    add(g, shaft, n === 0 ? -9.4 : 9.5, 1.3, -2.4);
  }
}

function loft(g, r) {
  for (let n = 0; n < 5; n += 1) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(16, 0.16, 0.16), mat(0x8aa0b0, 0.35, 0.7));
    add(g, beam, 0, 4.55, -3.4 + n * 1.15);
  }
  const pier = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.6, 0.45), mat(0x66727c, 0.6, 0.2));
  add(g, pier, -10.2, -1.2, 1.4);
  add(g, pier.clone(), 10.2, -1.2, 1.4);
}

function cloister(g, r) {
  for (let n = 0; n < 4; n += 1) {
    column(g, -9.85, -2.3 + n * 1.45, 3.05, 0xe8e4da, 0.7);
    column(g, 9.85, -2.3 + n * 1.45, 3.05, 0xe8e4da, 0.7);
  }
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.5, 28), new THREE.MeshStandardMaterial({
    color: 0x6e8f86, roughness: 0.08, metalness: 0.85
  }));
  pool.rotation.x = -Math.PI / 2;
  add(g, pool, 9.6, -3.48, 1.2);
}

function panorama(g, r) {
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.45, 0.28), mat(0xe7e0d2, 0.8));
  add(g, parapet, -10.1, -3.15, 2.6);
  add(g, parapet.clone(), 10.1, -3.15, 2.6);
  const band = new THREE.Mesh(new THREE.BoxGeometry(20, 1.4, 0.2), mat(0xd7e3ea, 0.9));
  add(g, band, 0, -0.4, -4.9);
}

function pavilion(g, r) {
  for (let n = 0; n < 4; n += 1) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.2, 0.18), mat(0x8d6244, 0.6));
    add(g, post, (n % 2 === 0 ? -10.2 : 10.2), -1.3, -2.2 + Math.floor(n / 2) * 3.2);
  }
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.8, 2.4), new THREE.MeshStandardMaterial({
    color: 0xf8f1e2, roughness: 0.95, transparent: true, opacity: 0.78
  }));
  add(g, screen, 10.05, -0.4, -1.2);
}

function reading(g, r) {
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.4, 0.4), mat(0x6b4630, 0.7));
  add(g, shelf, -10.1, -2.55, -3.6);
  for (let n = 0; n < 2; n += 1) {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), new THREE.MeshStandardMaterial({
      color: 0xffe2b8, emissive: 0xffb45a, emissiveIntensity: 1, roughness: 0.35
    }));
    add(g, lamp, -9.8 + n * 0.7, -1.7, -3.4);
  }
  const chair = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), mat(0x8d3d32, 0.75));
  add(g, chair, -9.9, -3.15, 2.2);
}

function court(g, r) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.05, 12, 48), mat(r.accent, 0.35, 0.8));
  ring.rotation.x = Math.PI / 2;
  add(g, ring, 9.7, -3.45, 0.4);
  for (let n = 0; n < 6; n += 1) {
    const a = (n / 6) * Math.PI * 2;
    const up = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, 0.7, 8), new THREE.MeshStandardMaterial({
      color: 0xf0d2a4, emissive: 0xc48a4a, emissiveIntensity: 0.7, roughness: 0.4
    }));
    add(g, up, 9.7 + Math.cos(a) * 1.35, -3.2, 0.4 + Math.sin(a) * 1.35);
  }
  const cypressL = new THREE.Mesh(new THREE.ConeGeometry(0.38, 2.8, 8), mat(0x1e3a32, 0.8));
  add(g, cypressL, -10.2, -2.1, 0.4);
  const cypressR = cypressL.clone();
  add(g, cypressR, 10.3, -2.1, -1.6);
}

function backdrop(g, i) {
  const colors = BANDS[i];
  [-6.2, -2.15, 1.55].forEach((x, n) => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.35, 6.2, 0.1), mat(colors[n], 0.92));
    add(g, panel, x, 0.2, -1.55);
  });
  const ear = new THREE.Mesh(new THREE.BoxGeometry(2.05, 5.1, 0.1), mat(colors[0], 0.78));
  add(g, ear, -8.55, 0.35, -1.55);
  const rug = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.025, 3.4), mat(colors[2], 0.95));
  add(g, rug, -1.2, -3.5, 0.15);
}

function dress(g, i, r) {
  const leaf = [0x3e6b45, 0x2f6a62, 0x6a8f4a, 0x3f7a55, 0x2f5a32, 0x4e7a6a, 0x5a6b48, 0x3d6e58, 0x2f6844, 0x6a8a78, 0x4a7568, 0x3e6a52, 0x5e8a72, 0x6b7a45, 0x8a5a32, 0x1e3a32][i];
  const clay = r.accent;
  plant(g, -10.35, 1.35, 2.15 + (i % 3) * 0.28, leaf);
  plant(g, 10.4, -1.15, 1.9 + (i % 2) * 0.35, leaf);
  if (i % 2 === 0) bench(g, -10.05, 3.15, 2.1, 0xf4efe6);
  else bench(g, 10.15, 2.9, 1.9, 0xf7f3ec);
  vase(g, i % 2 === 0 ? 9.95 : -9.95, 2.35, clay);
  lantern(g, -10.15, 3.35, -1.8, 0xffe2b0);
  lantern(g, 10.2, 3.2, -1.35, 0xfff1d4);
  bookStack(g, i % 2 ? -9.85 : 9.9, -3.22, -1.5, 4 + (i % 3));
  const hanging = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), new THREE.MeshStandardMaterial({
    color: 0xfff0d2, emissive: i === 15 ? 0xf0d2a4 : 0xffc56a, emissiveIntensity: 0.75, roughness: 0.4
  }));
  add(g, hanging, 3.15, 4.45, -0.35);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 4), mat(0x2c2a28, 0.5));
  add(g, cord, 3.15, 4.9, -0.35);
}

function plant(g, x, z, h, color) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, h * 0.42, 6), mat(0x6b4a32, 0.8));
  add(g, trunk, x, -3.5 + h * 0.2, z);
  const crown = new THREE.Mesh(new THREE.SphereGeometry(h * 0.28, 12, 10), mat(color, 0.86));
  add(g, crown, x, -3.5 + h * 0.62, z);
}

function bench(g, x, z, len, color) {
  const seat = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, 0.38), mat(color, 0.6));
  add(g, seat, x, -3.18, z);
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.32), mat(color, 0.7));
  add(g, leg, x - len * 0.36, -3.36, z);
  add(g, leg.clone(), x + len * 0.36, -3.36, z);
}

function vase(g, x, z, color) {
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.42, 10), mat(color, 0.32, 0.18));
  add(g, body, x, -3.22, z);
  const neck = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), mat(0x3e6b45, 0.8));
  add(g, neck, x, -2.92, z);
}

function lantern(g, x, y, z, color) {
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 0.8, roughness: 0.4
  }));
  add(g, glow, x, y, z);
}

function bookStack(g, x, y, z, n) {
  for (let i = 0; i < n; i += 1) {
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.07, 0.42),
      mat(i % 2 ? 0x8d3d32 : 0x243f36, 0.62)
    );
    add(g, book, x, y + i * 0.075, z);
  }
}
