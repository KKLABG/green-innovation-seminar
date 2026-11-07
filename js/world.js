import * as THREE from "../vendor/three.module.min.js";
import { CSS3DObject, CSS3DRenderer } from "./objects/CSS3DRenderer.js";
import { arrangePlanes, buildPlanes } from "./compose.js";
import { MOTIF_SPECS, createMotifs, createRift } from "./effects.js";
import { createHabitats, createFlight } from "./living.js";

const DIST = 13.35;
const DESIGN_H = 1080;
const TRAVEL_MS = 1600;
const PHOTO_PAD = 14;
const PHOTO_SIDE = [1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1, 1, -1];

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

const BLOOM_FS = `
precision highp float;
uniform sampler2D tDiffuse;
uniform float uStrength;
varying vec2 vUv;
void main() {
  vec2 d = (vUv - 0.5) * vec2(0.004, 0.003);
  float r = texture2D(tDiffuse, vUv + d).r;
  float g = texture2D(tDiffuse, vUv).g;
  float b = texture2D(tDiffuse, vUv - d).b;
  vec3 c = vec3(r, g, b);
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  float m = smoothstep(0.7, 1.05, l) * uStrength;
  gl_FragColor = vec4(c, m);
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
  const portrait = h > w;
  let dw;
  let dh;
  if (portrait) {
    dh = 840;
    dw = Math.round(dh * w / h);
  } else if (w / h > 1.45) {
    dw = 760;
    dh = Math.round(dw * h / w);
  } else {
    dw = 680;
    dh = Math.round(dw * h / w);
  }
  return { w: dw, h: dh, portrait };
}

function makeGlass() {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTint: { value: new THREE.Color(0xfffcf7) },
        uFill: { value: 0.34 },
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
  mesh.frustumCulled = false;
  mesh.renderOrder = 4;
  mesh.visible = false;
  return mesh;
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

  function measurePlane(p) {
    p.el.style.position = "relative";
    p.el.style.width = p.width + "px";
    p.el.style.height = "auto";
    p.el.style.maxHeight = "none";
    p.el.style.overflow = "visible";
    p.el.style.boxSizing = "border-box";
    p.el.style.background = "transparent";
    const natural = Math.max(p.el.scrollHeight, p.el.offsetHeight, 1);
    if (p.scroll && p.maxH && natural > p.maxH) {
      p.el.style.height = p.maxH + "px";
      p.el.style.overflowY = "auto";
      p.pixelH = p.maxH;
    } else {
      p.el.style.height = natural + "px";
      p.el.style.overflow = "hidden";
      p.pixelH = natural;
    }
    p.pixelW = p.width;
    p.el.style.position = "absolute";
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
  const bloomMat = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      uStrength: { value: 0.28 }
    },
    vertexShader: BLUR_VS,
    fragmentShader: BLOOM_FS,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });
  const bloomScene = new THREE.Scene();
  const bloomQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bloomMat);
  bloomQuad.position.z = -1;
  bloomScene.add(bloomQuad);

  let sceneRT = null;
  let blurA = null;
  let blurB = null;
  let metrics = { textScale: 0.01, visW: 16, visH: 10 };

  const cards = sheets.map((sheet, i) => {
    const fit = fitPhoto(PHOTO_PX[i][0], PHOTO_PX[i][1]);
    const plate = plates[i];
    const img = plate.querySelector("img");
    const frameW = fit.w + PHOTO_PAD * 2;
    const frameH = fit.h + PHOTO_PAD * 2;
    plate.dataset.scene = String(i);
    plate.style.width = frameW + "px";
    plate.style.height = frameH + "px";
    plate.style.boxSizing = "border-box";
    plate.style.padding = PHOTO_PAD + "px";
    plate.style.position = "relative";
    plate.style.margin = "0";
    plate.style.top = "0";
    plate.style.left = "0";
    plate.style.flex = "none";
    plate.style.background = "transparent";
    plate.style.overflow = "hidden";
    img.style.display = "block";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";
    img.style.objectPosition = "center center";
    img.style.maxWidth = "none";
    img.style.maxHeight = "none";

    const planes = buildPlanes(sheet, i);
    planes.forEach((p) => {
      p.el.dataset.scene = String(i);
      sandbox.appendChild(p.el);
      measurePlane(p);
      p.obj = new CSS3DObject(p.el);
      if (p.glass) {
        p.glassMesh = makeGlass();
        scene.add(p.glassMesh);
      }
    });
    sheet.style.display = "none";

    let scrollProxy = null;
    const scrollPlane = planes.find((p) => p.scroll);
    if (scrollPlane) {
      scrollProxy = document.createElement("div");
      scrollProxy.className = "scroll-proxy";
      scrollProxy.dataset.scene = String(i);
      scrollProxy.setAttribute("aria-hidden", "true");
      const inner = document.createElement("div");
      inner.className = "scroll-proxy-inner";
      scrollProxy.appendChild(inner);
      scrollPlane.el.dataset.scene = String(i);
      scrollProxy.addEventListener("scroll", () => {
        const maxProxy = scrollProxy.scrollHeight - scrollProxy.clientHeight;
        const maxPlane = scrollPlane.el.scrollHeight - scrollPlane.el.clientHeight;
        const next = maxProxy > 1 ? (scrollProxy.scrollTop / maxProxy) * maxPlane : 0;
        scrollPlane.el.scrollTop = next;
      }, { passive: true });
      document.body.appendChild(scrollProxy);
    }

    const plateObj = new CSS3DObject(plate);
    const rig = new THREE.Group();
    planes.forEach((p) => rig.add(p.obj));
    rig.add(plateObj);
    rig.position.copy(anchorOf(i));
    cssScene.add(rig);
    plate.classList.add("is-spatial-plate");
    return {
      planes,
      plate,
      plateObj,
      rig,
      anchor: anchorOf(i),
      plateW: frameW,
      plateH: frameH,
      portrait: fit.portrait,
      side: PHOTO_SIDE[i],
      scrollProxy,
      scrollPlane: scrollPlane ? scrollPlane.el : null,
      fit: 1,
      layoutScale: 0.01,
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

  const motifs = createMotifs();
  const rift = createRift();
  const rooms = ROOMS.map((_, i) => {
    const group = buildRoom(i);
    group.add(motifs[i].group);
    group.position.copy(anchorOf(i));
    return group;
  });
  const habitats = createHabitats(rooms);
  const flight = createFlight();
  camera.add(flight.group);
  rooms[0].add(rift.group);
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
  const glassBack = new THREE.Vector3();
  const drawSize = new THREE.Vector2();
  let poseNow = poseFor(0);
  let placedKey = "";
  let quality = 1;
  let frameEma = 16;
  let lastFrame = 0;
  const chaosColor = new THREE.Color(0x120d0c);
  const driftSide = new THREE.Vector3();
  const driftUp = new THREE.Vector3();
  const driftFwd = new THREE.Vector3();
  const ndc = new THREE.Vector3();
  const rayDir = new THREE.Vector3();

  function computeMetrics(viewW, viewH) {
    const tan = Math.tan((42 * Math.PI) / 360);
    const visH = 2 * DIST * tan;
    const visW = visH * (viewW / Math.max(1, viewH));
    const textScale = visH / DESIGN_H;
    return { textScale, visW, visH };
  }

  function clusterBounds(planes) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    planes.forEach((p) => {
      minX = Math.min(minX, p.cx - p.pixelW / 2);
      maxX = Math.max(maxX, p.cx + p.pixelW / 2);
      minY = Math.min(minY, p.cy - p.pixelH / 2);
      maxY = Math.max(maxY, p.cy + p.pixelH / 2);
    });
    return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
  }

  function layoutCards() {
    const { textScale, visW, visH } = metrics;
    cards.forEach((card, i) => {
      arrangePlanes(i, card.planes);
      const bounds = clusterBounds(card.planes);
      const gapPx = 96;
      const needW = bounds.w + gapPx + card.plateW;
      const needH = Math.max(bounds.h, card.plateH);
      const fitW = (visW * 0.9) / (needW * textScale);
      const fitH = (visH * 0.8) / (needH * textScale);
      const fit = Math.min(1, fitW, fitH);
      card.fit = fit;
      const s = textScale * fit;
      card.layoutScale = s;
      card.planes.forEach((p) => {
        p.obj.position.set((p.cx - bounds.cx) * s, -(p.cy - bounds.cy) * s, p.z);
        p.obj.scale.setScalar(s);
      });
      const clusterHalf = bounds.w * s / 2;
      const photoW = card.plateW * s;
      const gapW = gapPx * s;
      let photoX = card.side > 0
        ? clusterHalf + gapW + photoW / 2
        : -clusterHalf - gapW - photoW / 2;
      const photoZ = card.portrait ? -0.36 : -0.18;
      const photoY = card.portrait ? 0.22 : 0.04;
      const left = Math.min(-clusterHalf, photoX - photoW / 2);
      const right = Math.max(clusterHalf, photoX + photoW / 2);
      const shift = -(left + right) / 2;
      card.planes.forEach((p) => { p.obj.position.x += shift; });
      photoX += shift;
      card.plateObj.position.set(photoX, photoY, photoZ);
      card.plateObj.scale.setScalar(s);
      if (card.pedestal) {
        card.pedestal.position.x = photoX;
        card.pedestal.position.z = photoZ + 0.45;
        card.pedestal.scale.set(Math.max(1.15, photoW / 1.7 * 0.58), 1, 1.2);
      }
    });
  }

  function remeasure() {
    cards.forEach((card) => {
      card.planes.forEach(measurePlane);
    });
    layoutCards();
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
    placedKey = "";
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
          const reveal = smoother(clamp01((intro - 0.72) / 0.28));
          oz = -4.8 * (1 - reveal);
          oy = 0.9 * (1 - reveal);
          sc = 0.86 + 0.14 * reveal;
          fade = reveal;
        }
      }
      card.fade = fade;
      card.rig.position.set(card.anchor.x + ox, card.anchor.y + oy, card.anchor.z + oz);
      card.rig.scale.setScalar(sc);
      const on = fade > 0.03;
      const interactive = !travel && i === shown && intro > 0.92;
      card.planes.forEach((p) => {
        p.el.style.visibility = on ? "visible" : "hidden";
        p.el.style.opacity = String(fade);
        p.el.style.pointerEvents = interactive ? "auto" : "none";
      });
      card.plate.style.visibility = on ? "visible" : "hidden";
      card.plate.style.opacity = String(fade);
      card.plate.style.pointerEvents = "none";
      if (card.scrollProxy) placeScrollProxy(card.scrollProxy, card.scrollPlane, on && interactive && i === shown);
    });
  }

  function placeScrollProxy(proxy, planeEl, show) {
    if (!show) {
      proxy.style.display = "none";
      return;
    }
    const box = planeEl.getBoundingClientRect();
    if (box.width < 8 || box.height < 8) {
      proxy.style.display = "none";
      return;
    }
    proxy.style.display = "block";
    proxy.style.left = box.left + "px";
    proxy.style.top = box.top + "px";
    proxy.style.width = box.width + "px";
    proxy.style.height = box.height + "px";
    const inner = proxy.firstElementChild;
    const scale = box.height / Math.max(1, planeEl.clientHeight);
    const innerH = Math.round(Math.max(box.height + 1, planeEl.scrollHeight * scale));
    if (inner.dataset.h !== String(innerH)) {
      inner.dataset.h = String(innerH);
      inner.style.height = innerH + "px";
    }
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
      card.planes.forEach((p) => {
        if (!p.glassMesh) return;
        p.obj.getWorldPosition(glassPos);
        p.obj.getWorldQuaternion(glassQuat);
        p.obj.getWorldScale(glassScale);
        p.glassMesh.position.copy(glassPos);
        p.glassMesh.quaternion.copy(glassQuat);
        glassBack.set(0, 0, -1).applyQuaternion(glassQuat);
        p.glassMesh.position.addScaledVector(glassBack, 0.035);
        p.glassMesh.scale.set(
          Math.max(0.01, p.pixelW * Math.abs(glassScale.x)),
          Math.max(0.01, p.pixelH * Math.abs(glassScale.y)),
          1
        );
        p.glassMesh.material.uniforms.tDiffuse.value = buffer.texture;
        p.glassMesh.material.uniforms.uResolution.value.set(size.x, size.y);
        p.glassMesh.material.uniforms.uFade.value = card.fade;
        p.glassMesh.visible = card.fade > 0.03;
      });
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

    const pos = new THREE.Vector3();
    let roll = 0;
    let travelBow = 0;
    if (intro < 0.999) {
      const opening = introFlight(clamp01(intro));
      pos.copy(opening.pos);
      look.copy(opening.look);
      roll = opening.roll;
    } else {
      pos.copy(logical.pos);
      look.copy(logical.look);
      pointer.x += (pointerTarget.x - pointer.x) * 0.05;
      pointer.y += (pointerTarget.y - pointer.y) * 0.05;
      const idle = reduced ? 0 : now * 0.00018;
      driftSide.subVectors(look, pos).cross(driftUp.set(0, 1, 0));
      if (driftSide.lengthSq() > 0.0001) driftSide.normalize();
      pos.addScaledVector(driftSide, pointer.x * 0.42 + Math.sin(idle) * 0.34 + Math.sin(idle * 0.43) * 0.12);
      pos.addScaledVector(driftUp, pointer.y * 0.22 + Math.cos(idle * 0.72) * 0.2);
      driftFwd.subVectors(look, pos);
      if (driftFwd.lengthSq() > 0.0001) {
        driftFwd.normalize();
        pos.addScaledVector(driftFwd, Math.sin(idle * 0.51) * 0.24);
      }
      look.addScaledVector(driftSide, pointer.x * 0.16 + Math.sin(idle * 0.63) * 0.06);
      look.y += pointer.y * 0.06 + Math.cos(idle * 0.47) * 0.04;
      if (travel) {
        travelBow = Math.sin(Math.PI * clamp01((now - travel.t0) / travel.dur));
        roll = driftOf(travel.move) * travelBow * 0.07;
      }
    }

    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.position.copy(pos);
    camera.lookAt(look);
    const fov = intro < 0.999
      ? 48 - smoother(clamp01((intro - 0.4) / 0.45)) * 6
      : 42 + travelBow * 4 + (reduced ? 0 : Math.sin(now * 0.00032) * 0.5);
    if (Math.abs(camera.fov - fov) > 0.05) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    camera.updateMatrixWorld(true);
    poseNow = { pos: pos.clone(), look: look.clone() };

    applyAtmosphere(fromI, toI, mix);
    if (intro < 0.999) {
      const u = clamp01(intro);
      const clear = smoother(clamp01((u - 0.28) / 0.55));
      scene.background.copy(chaosColor).lerp(bgColor, clear);
      scene.fog.color.copy(chaosColor).lerp(fogColor, clear);
      scene.fog.near = 6 + clear * 12;
      scene.fog.far = 26 + clear * 26;
      rift.update(u, now * 0.001);
      habitats[0].setVeil(1 - clear);
    } else if (travel) {
      habitats[fromI].setVeil(0);
      habitats[toI].setVeil(0);
      scene.fog.near = 16;
      scene.fog.far = 78;
      if (rift.group.visible) rift.group.visible = false;
    } else {
      scene.fog.near = 18;
      scene.fog.far = 56;
      if (rift.group.visible) rift.group.visible = false;
      habitats[shown].setVeil(0);
    }
    if (!reduced) {
      const clock = now * 0.001;
      const live = travel ? [fromI, toI] : [shown];
      live.forEach((i) => {
        habitats[i].tick(clock, quality);
        if (intro > 0.97) motifs[i].tick(clock);
      });
      const flying = !!travel && intro > 0.97;
      flight.group.visible = flying;
      if (flying) flight.tick(clock);
      sun.position.x += Math.sin(clock * 0.17) * 2.4;
      sun.position.y += Math.cos(clock * 0.11) * 0.7;
    } else if (flight.group.visible) {
      flight.group.visible = false;
    }
    present(now);

    if (!sceneRT) resize();
    cards.forEach((card) => {
      card.planes.forEach((p) => {
        if (p.glassMesh) p.glassMesh.visible = false;
      });
    });
    renderer.setRenderTarget(sceneRT);
    renderer.clear(true, true, true);
    renderer.render(scene, camera);
    const blurred = blurFrom(sceneRT);
    syncGlass(blurred);
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    if (quality > 0.75 && !reduced && blurB) {
      bloomMat.uniforms.tDiffuse.value = blurB.texture;
      bloomMat.uniforms.uStrength.value = 0.26;
      renderer.autoClear = false;
      renderer.render(bloomScene, blurCam);
      renderer.autoClear = true;
    }
    cssRenderer.render(cssScene, camera);
    const frameDt = lastFrame ? Math.min(80, now - lastFrame) : 16;
    lastFrame = now;
    frameEma = frameEma * 0.96 + frameDt * 0.04;
    if (frameEma > 36) quality = 0.62;
    else if (frameEma < 20) quality = 1;
    if (intro > 0.97 && !travel) {
      const viewW = canvas.clientWidth || window.innerWidth;
      const viewH = canvas.clientHeight || window.innerHeight;
      const key = shown + "@" + Math.round(viewW) + "x" + Math.round(viewH);
      if (placedKey !== key && viewW > 0 && viewH > 0) {
        positionMotif(shown, viewW, viewH);
        placedKey = key;
      }
    }
  }

  function contentRects(card) {
    const rects = [];
    card.planes.forEach((p) => {
      if (p.el.style.visibility === "hidden") return;
      const r = p.el.getBoundingClientRect();
      if (r.width > 8 && r.height > 8) rects.push(r);
    });
    const plate = card.plate.getBoundingClientRect();
    if (plate.width > 8 && plate.height > 8 && card.plate.style.visibility !== "hidden") rects.push(plate);
    return rects;
  }

  function screenToLocal(px, py, viewW, viewH, anchor) {
    ndc.set((px / viewW) * 2 - 1, -(py / viewH) * 2 + 1, 0.5);
    ndc.unproject(camera);
    rayDir.copy(ndc).sub(camera.position);
    const planeZ = anchor.z - 0.75;
    const t = (planeZ - camera.position.z) / (rayDir.z || -0.0001);
    return camera.position.clone().addScaledVector(rayDir, t).sub(anchor);
  }

  function findPocket(rects, spec, viewW, viewH) {
    const top = document.querySelector(".topbar");
    const dock = document.querySelector(".dock");
    const meter = document.querySelector(".meter");
    const y0 = (top ? top.getBoundingClientRect().bottom : 56) + 8;
    const y1 = (dock ? dock.getBoundingClientRect().top : viewH - 72) - 8;
    const x1 = (meter ? meter.getBoundingClientRect().left : viewW - 28) - 8;
    const sx = viewW / 1920;
    const sy = viewH / 1080;
    let best = null;
    for (let shrink = 1; shrink >= 0.62; shrink -= 0.08) {
      const ww = spec.w * sx * shrink;
      const hh = spec.h * sy * shrink;
      const step = Math.max(12, 18 * sx);
      for (let y = y0; y + hh <= y1; y += step) {
        for (let x = 10; x + ww <= x1; x += step) {
          if (pocketHits(rects, x, y, ww, hh)) continue;
          const score = pocketScore(spec.bias, x, y, ww, hh, viewW, viewH);
          if (!best || score > best.score) best = { x, y, w: ww, h: hh, score };
        }
      }
      if (best) return best;
    }
    return null;
  }

  function pocketHits(rects, x, y, w, h) {
    const pad = 18;
    for (let i = 0; i < rects.length; i += 1) {
      const b = rects[i];
      if (x < b.right + pad && x + w > b.left - pad && y < b.bottom + pad && y + h > b.top - pad) return true;
    }
    return false;
  }

  function pocketScore(bias, x, y, w, h, viewW, viewH) {
    const cx = (x + w / 2) / viewW;
    const cy = (y + h / 2) / viewH;
    if (bias === "top") return (1 - cy) * 4 + (1 - cx) * 0.2;
    if (bias === "left") return (1 - cx) * 4 + (1 - Math.abs(cy - 0.45));
    if (bias === "right") return cx * 3 + (1 - Math.abs(cy - 0.5));
    if (bias === "lowleft") return cy * 2.2 + (1 - cx) * 1.6;
    if (bias === "mid") return 2 - Math.abs(cx - 0.52) * 2 - Math.abs(cy - 0.48);
    return 1 - cy;
  }

  function positionMotif(i, viewW, viewH) {
    const group = motifs[i].group;
    const rects = contentRects(cards[i]);
    if (rects.length < 2) {
      group.visible = false;
      return;
    }
    const pocket = findPocket(rects, MOTIF_SPECS[i], viewW, viewH);
    if (!pocket) {
      group.visible = false;
      return;
    }
    const anchor = cards[i].anchor;
    const center = screenToLocal(pocket.x + pocket.w / 2, pocket.y + pocket.h / 2, viewW, viewH, anchor);
    const right = screenToLocal(pocket.x + pocket.w, pocket.y + pocket.h / 2, viewW, viewH, anchor);
    const down = screenToLocal(pocket.x + pocket.w / 2, pocket.y + pocket.h, viewW, viewH, anchor);
    const span = motifs[i].span;
    const fit = Math.min(Math.abs(right.x - center.x) * 2 / span.w, Math.abs(down.y - center.y) * 2 / span.h) * 0.78;
    group.position.set(center.x, center.y, -0.75);
    group.scale.setScalar(Math.max(0.02, fit));
    group.visible = true;
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

function introFlight(u) {
  const anchor = anchorOf(0);
  const end = poseFor(0).pos.clone().sub(anchor);
  const keys = [
    { u: 0, p: new THREE.Vector3(1.6, 4.6, 32), l: new THREE.Vector3(0, 1.5, 16), roll: 0.24 },
    { u: 0.2, p: new THREE.Vector3(-2.1, 2.8, 25), l: new THREE.Vector3(0.15, 0.9, 9), roll: -0.16 },
    { u: 0.46, p: new THREE.Vector3(0.7, 1.45, 19.2), l: new THREE.Vector3(0, 0.4, 2), roll: 0.09 },
    { u: 0.68, p: new THREE.Vector3(-0.2, 0.62, 15.4), l: new THREE.Vector3(0, 0.14, 0), roll: -0.03 },
    { u: 1, p: end, l: new THREE.Vector3(0, 0, 0), roll: 0 }
  ];
  let i = 0;
  while (i < keys.length - 2 && u > keys[i + 1].u) i += 1;
  const a = keys[i];
  const b = keys[i + 1];
  const t = smoother(clamp01((u - a.u) / Math.max(0.0001, b.u - a.u)));
  return {
    pos: anchor.clone().add(a.p.clone().lerp(b.p, t)),
    look: anchor.clone().add(a.l.clone().lerp(b.l, t)),
    roll: a.roll + (b.roll - a.roll) * t
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
  pos.addScaledVector(up, bow * 1.5);
  pos.addScaledVector(dir, -bow * 1.35);
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
  floor.name = "floor";
  add(g, floor, 0, -3.7, 0);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(22, 9, 0.4), mat(r.wall, 0.9));
  wall.name = "wall";
  add(g, wall, 0, 0.4, -5.2);
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(16, 32, 20),
    new THREE.MeshBasicMaterial({ color: r.sky, side: THREE.BackSide })
  );
  shell.name = "shell";
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
    add(g, beam, 0, 6.15, -3.4 + n * 1.15);
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
    panel.userData.band = true;
    add(g, panel, x, 0.2, -1.55);
  });
  const ear = new THREE.Mesh(new THREE.BoxGeometry(2.05, 5.1, 0.1), mat(colors[0], 0.78));
  ear.userData.band = true;
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
  hanging.userData.life = "glow";
  hanging.userData.baseY = 4.45;
  add(g, hanging, 3.15, 4.45, -0.35);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 4), mat(0x2c2a28, 0.5));
  add(g, cord, 3.15, 4.9, -0.35);
}

function plant(g, x, z, h, color) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, h * 0.42, 6), mat(0x6b4a32, 0.8));
  add(g, trunk, x, -3.5 + h * 0.2, z);
  const crown = new THREE.Mesh(new THREE.SphereGeometry(h * 0.28, 12, 10), mat(color, 0.86));
  crown.userData.life = "sway";
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
  glow.userData.life = "glow";
  glow.userData.baseY = y;
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
