import * as THREE from "../vendor/three.module.min.js";
import { Sky } from "./objects/Sky.js";
import { Water } from "./objects/Water.js";

const INK = 0x173d32;
const GREEN = 0x49896f;
const MOSS = 0x3e7a62;
const DEEP = 0x2f6b54;

const MOVES = [
  "left", "up", "forward", "right", "down",
  "orbit", "rise", "descend", "strafe", "sweep",
  "back", "crane", "arc", "sink", "lift"
];

const PLACES = [
  { x: 0, z: 0 },
  { x: -22, z: -6 },
  { x: -16, z: -28 },
  { x: 8, z: -38 },
  { x: 32, z: -30 },
  { x: 36, z: -4 },
  { x: 16, z: 18 },
  { x: -12, z: 26 },
  { x: -36, z: 16 },
  { x: -44, z: -10 },
  { x: -28, z: -34 },
  { x: -2, z: -48 },
  { x: 26, z: -46 },
  { x: 46, z: -22 },
  { x: 30, z: 6 },
  { x: 6, z: 24 }
];

const ATMOS = [
  { color: 0xe7f0ea, near: 28, far: 160 },
  { color: 0xd7e6dc, near: 18, far: 90 },
  { color: 0xe4eef0, near: 22, far: 130 },
  { color: 0xe6ece7, near: 12, far: 70 },
  { color: 0xeef3ee, near: 36, far: 190 },
  { color: 0xdceadf, near: 20, far: 110 },
  { color: 0xe7eee8, near: 16, far: 100 },
  { color: 0xe8f2ec, near: 24, far: 140 },
  { color: 0xdfeae4, near: 14, far: 80 },
  { color: 0xe7f0ea, near: 22, far: 120 },
  { color: 0xd3e3da, near: 12, far: 72 },
  { color: 0xe9e6dc, near: 16, far: 95 },
  { color: 0xe7f1ea, near: 30, far: 170 },
  { color: 0xeef3ee, near: 24, far: 140 },
  { color: 0xe3eee6, near: 18, far: 110 },
  { color: 0xf2f6f1, near: 32, far: 180 }
];

const ANGLES = [
  { cam: [0.4, 2.4, 8.2], look: [0.2, 1.5, -1.2] },
  { cam: [-7.2, 1.7, 2.2], look: [1.2, 1.6, -0.4] },
  { cam: [1.2, 5.8, 7.4], look: [-0.4, 1.1, -1.6] },
  { cam: [0.2, 1.9, 8.4], look: [0.6, 1.4, -2.2] },
  { cam: [7.2, 2.6, 1.4], look: [-0.8, 1.7, 0.4] },
  { cam: [1.4, 4.8, 6.2], look: [-0.2, 1.0, -0.8] },
  { cam: [0.2, 1.45, 7.6], look: [1.4, 1.3, -0.6] },
  { cam: [-5.4, 3.6, 5.6], look: [0.8, 1.6, -0.2] },
  { cam: [1.1, 6.2, 3.4], look: [-0.2, 1.2, -1.4] },
  { cam: [-6.2, 2.2, 4.4], look: [1.0, 1.45, 0.2] },
  { cam: [5.4, 1.6, 5.2], look: [-0.4, 1.25, -1.2] },
  { cam: [0.4, 2.7, -7.4], look: [0.8, 1.4, 0.6] },
  { cam: [2.6, 6.4, 6.8], look: [-0.6, 1.3, -1.0] },
  { cam: [6.4, 2.5, 2.4], look: [-0.8, 1.5, 0.2] },
  { cam: [-5.2, 2.9, 5.8], look: [0.6, 1.4, -0.4] },
  { cam: [0.6, 2.3, 9.0], look: [0.2, 1.45, -1.6] }
];

const FOCUS = {
  1: ["q1", "q2", "q3"],
  4: ["s1", "s2", "s3"],
  5: ["social", "tech"],
  6: ["y1980", "grow", "adult"],
  7: ["h1", "h2"],
  9: ["total", "ratio", "invent"],
  10: ["total", "ratio", "invent"],
  11: ["psm", "did", "swap"],
  12: ["total2", "ratio2", "invent2"],
  13: ["find", "theory", "practice"],
  14: ["bound", "ask", "take"]
};

function smoother(u) {
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

function hash(ix, iz) {
  const n = Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function noise(x, z) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const fx = x - x0;
  const fz = z - z0;
  const sx = fx * fx * (3 - 2 * fx);
  const sz = fz * fz * (3 - 2 * fz);
  const n00 = hash(x0, z0);
  const n10 = hash(x0 + 1, z0);
  const n01 = hash(x0, z0 + 1);
  const n11 = hash(x0 + 1, z0 + 1);
  return n00 * (1 - sx) * (1 - sz) + n10 * sx * (1 - sz) + n01 * (1 - sx) * sz + n11 * sx * sz;
}

function fbm(x, z) {
  return noise(x, z) * 0.58 + noise(x * 2.1, z * 2.1) * 0.28 + noise(x * 4.3, z * 4.3) * 0.14;
}

function terrainHeight(x, z) {
  const n = fbm(x * 0.02, z * 0.02);
  let h = Math.pow(n, 1.35) * 8.4 - 1.4;
  const wx = x - PLACES[2].x;
  const wz = z - PLACES[2].z;
  h -= Math.exp(-(wx * wx + wz * wz) / 70) * 2.4;
  const rx = x - PLACES[4].x;
  const rz = z - PLACES[4].z;
  h += Math.exp(-(rx * rx + rz * rz) / 220) * 3.2;
  return h;
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
  renderer.toneMappingExposure = 0.58;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe7f0ea, 28, 150);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.15, 20000);

  const sky = new Sky();
  sky.scale.setScalar(8000);
  const sunDir = new THREE.Vector3();
  const phi = THREE.MathUtils.degToRad(62);
  const theta = THREE.MathUtils.degToRad(196);
  sunDir.setFromSphericalCoords(1, phi, theta);
  const uniforms = sky.material.uniforms;
  uniforms.turbidity.value = 2.3;
  uniforms.rayleigh.value = 1.7;
  uniforms.mieCoefficient.value = 0.003;
  uniforms.mieDirectionalG.value = 0.72;
  uniforms.sunPosition.value.copy(sunDir);
  scene.add(sky);

  const hemi = new THREE.HemisphereLight(0xf4f7f2, 0x3e7a62, 0.72);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4e4, 1.55);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = -28;
  sun.shadow.camera.right = 28;
  sun.shadow.camera.top = 28;
  sun.shadow.camera.bottom = -28;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  scene.add(sun.target);

  const terrain = buildTerrain();
  terrain.receiveShadow = true;
  scene.add(terrain);

  const trees = buildForest();
  scene.add(trees.trunks);
  scene.add(trees.crowns);
  scene.add(trees.shades);

  const pond = buildPond(renderer);
  scene.add(pond);

  const focusables = [];
  buildMarkers(scene, focusables);

  const pollen = buildPollen();
  scene.add(pollen);

  let intro = 0;
  let shownIndex = 0;
  let travel = null;
  let reduced = false;
  let focusKey = "";
  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };
  const look = new THREE.Vector3();
  const fogColor = new THREE.Color();
  const fogB = new THREE.Color();
  let poseNow = clonePose(viewFor(0));

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function frame(now) {
    let logical;
    let fogU = 1;
    let fogFrom = shownIndex;
    let fogTo = shownIndex;
    if (travel) {
      const u = Math.min(1, (now - travel.t0) / travel.dur);
      logical = sampleTravel(travel.fromPose, travel.toIndex, u, travel.move);
      fogU = smoother(u);
      fogFrom = travel.fromIndex;
      fogTo = travel.toIndex;
      if (u >= 1) {
        shownIndex = travel.toIndex;
        travel = null;
        logical = viewFor(shownIndex);
        fogU = 1;
        fogFrom = shownIndex;
        fogTo = shownIndex;
      }
    } else {
      logical = viewFor(shownIndex);
    }

    const high = introPose();
    const k = smoother(Math.min(1, Math.max(0, intro)));
    const pos = high.pos.clone().lerp(logical.pos, k);
    look.copy(high.look).lerp(logical.look, k);
    const floor = terrainHeight(pos.x, pos.z) + 1.45;
    if (pos.y < floor) pos.y = floor;
    poseNow = { pos: pos.clone(), look: look.clone() };

    pointer.x += (pointerTarget.x - pointer.x) * 0.06;
    pointer.y += (pointerTarget.y - pointer.y) * 0.06;
    pos.x += pointer.x * 0.35;
    pos.y += pointer.y * 0.14;
    look.x += pointer.x * 0.2;

    camera.position.copy(pos);
    camera.lookAt(look);

    const a = ATMOS[fogFrom];
    const b = ATMOS[fogTo];
    fogColor.setHex(a.color).lerp(fogB.setHex(b.color), fogU);
    scene.fog.color.copy(fogColor);
    scene.fog.near = THREE.MathUtils.lerp(a.near, b.near, fogU);
    scene.fog.far = THREE.MathUtils.lerp(a.far, b.far, fogU);

    sun.position.copy(look).addScaledVector(sunDir, 36);
    sun.target.position.copy(look);
    sun.target.updateMatrixWorld();

    focusables.forEach((mesh) => {
      const on = focusKey && mesh.userData.key === focusKey;
      const target = on ? 0.45 : 0.02;
      mesh.material.emissiveIntensity += (target - mesh.material.emissiveIntensity) * 0.12;
    });

    const time = now * 0.001;
    const arr = pollen.geometry.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] += 0.006;
      if (arr[i + 1] > 5) arr[i + 1] = 0.2;
    }
    pollen.geometry.attributes.position.needsUpdate = true;
    pollen.position.copy(pos);

    renderer.render(scene, camera);
  }

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
      const origin = travel ? travel.toIndex : shownIndex;
      if (reduced || snap) {
        shownIndex = dest;
        travel = null;
        poseNow = clonePose(viewFor(dest));
        return;
      }
      if (dest === origin) return;
      const move = MOVES[Math.min(14, Math.max(0, Math.max(origin, dest) - 1))];
      const dist = poseNow.pos.distanceTo(viewFor(dest).pos);
      travel = {
        fromPose: clonePose(poseNow),
        fromIndex: origin,
        toIndex: dest,
        move,
        t0: performance.now(),
        dur: Math.min(2300, 1100 + Math.max(0, dist - 18) * 16)
      };
    },
    setFocus(key) { focusKey = key || ""; },
    setPointer(x, y) { pointerTarget.x = x; pointerTarget.y = y; },
    pose() {
      return { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    }
  };
}

function viewFor(i) {
  const place = PLACES[i];
  const gy = terrainHeight(place.x, place.z);
  const angle = ANGLES[i];
  return {
    pos: new THREE.Vector3(place.x + angle.cam[0], gy + angle.cam[1], place.z + angle.cam[2]),
    look: new THREE.Vector3(place.x + angle.look[0], gy + angle.look[1], place.z + angle.look[2])
  };
}

function introPose() {
  const v = viewFor(0);
  return {
    pos: v.pos.clone().add(new THREE.Vector3(6, 18, 14)),
    look: v.look.clone().add(new THREE.Vector3(-2, -2, -6))
  };
}

function clonePose(pose) {
  return { pos: pose.pos.clone(), look: pose.look.clone() };
}

function sampleTravel(fromPose, toIndex, u, move) {
  const to = viewFor(toIndex);
  const e = smoother(u);
  const pos = fromPose.pos.clone().lerp(to.pos, e);
  const look = fromPose.look.clone().lerp(to.look, e);
  const dir = to.pos.clone().sub(fromPose.pos);
  if (dir.lengthSq() < 0.001) dir.set(0, 0, -1);
  dir.normalize();
  const side = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
  const bow = Math.sin(Math.PI * u);
  const up = new THREE.Vector3(0, 1, 0);
  if (move === "left") pos.addScaledVector(side, bow * 9);
  else if (move === "up") pos.addScaledVector(up, bow * 8);
  else if (move === "forward") pos.addScaledVector(up, -bow * 0.8);
  else if (move === "right") pos.addScaledVector(side, -bow * 9);
  else if (move === "down") pos.addScaledVector(up, -bow * 6);
  else if (move === "orbit") {
    pos.addScaledVector(side, bow * 12);
    pos.addScaledVector(up, bow * 2.4);
    look.addScaledVector(side, bow * 3);
  } else if (move === "rise") {
    pos.addScaledVector(up, bow * 10);
    pos.addScaledVector(side, bow * 2.5);
  } else if (move === "descend") pos.addScaledVector(up, bow * 7);
  else if (move === "strafe") pos.addScaledVector(side, -bow * 7);
  else if (move === "sweep") {
    pos.addScaledVector(side, bow * 6);
    pos.addScaledVector(up, bow * 6);
  } else if (move === "back") pos.addScaledVector(dir, -bow * 8);
  else if (move === "crane") {
    pos.addScaledVector(up, bow * 11);
    pos.addScaledVector(dir, -bow * 3);
  } else if (move === "arc") {
    pos.addScaledVector(side, -bow * 8);
    pos.addScaledVector(up, bow * 2);
    look.addScaledVector(side, -bow * 2);
  } else if (move === "sink") pos.addScaledVector(up, -bow * 8);
  else if (move === "lift") {
    pos.addScaledVector(up, bow * 5);
    pos.addScaledVector(side, -bow * 4);
  }
  return { pos, look };
}

function buildTerrain() {
  const size = 240;
  const segs = 140;
  const geo = new THREE.PlaneGeometry(size, size, segs, segs);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const low = new THREE.Color(0x3f7d64);
  const mid = new THREE.Color(0x49896f);
  const high = new THREE.Color(0xd5e3d8);
  const pale = new THREE.Color(0xe7f0ea);
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = terrainHeight(x, z);
    pos.setY(i, h);
    const t = THREE.MathUtils.clamp((h + 1.5) / 7.2, 0, 1);
    const color = low.clone().lerp(mid, Math.min(1, t * 1.4)).lerp(high, Math.pow(t, 2.2));
    let nearClearing = 0;
    for (let p = 0; p < PLACES.length; p += 1) {
      const dx = x - PLACES[p].x;
      const dz = z - PLACES[p].z;
      nearClearing = Math.max(nearClearing, Math.exp(-(dx * dx + dz * dz) / 28));
    }
    color.lerp(pale, nearClearing * 0.55);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.96,
    metalness: 0
  }));
  mesh.castShadow = false;
  return mesh;
}

function paint(geo, color) {
  const n = geo.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 1) {
    const j = 0.9 + Math.random() * 0.14;
    arr[i * 3] = color.r * j;
    arr[i * 3 + 1] = color.g * j;
    arr[i * 3 + 2] = color.b * j;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  return geo;
}

function mergeGeometries(geos) {
  let vcount = 0;
  let icount = 0;
  geos.forEach((g) => {
    vcount += g.attributes.position.count;
    icount += g.index ? g.index.count : g.attributes.position.count;
  });
  const pos = new Float32Array(vcount * 3);
  const nor = new Float32Array(vcount * 3);
  const col = new Float32Array(vcount * 3);
  const idx = new Uint32Array(icount);
  let voff = 0;
  let ioff = 0;
  geos.forEach((g) => {
    if (!g.attributes.normal) g.computeVertexNormals();
    pos.set(g.attributes.position.array, voff * 3);
    nor.set(g.attributes.normal.array, voff * 3);
    col.set(g.attributes.color.array, voff * 3);
    if (g.index) {
      const src = g.index.array;
      for (let i = 0; i < src.length; i += 1) idx[ioff + i] = src[i] + voff;
      ioff += src.length;
    } else {
      const n = g.attributes.position.count;
      for (let i = 0; i < n; i += 1) idx[ioff + i] = i + voff;
      ioff += n;
    }
    voff += g.attributes.position.count;
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  return geo;
}

function makeCanopy() {
  const greens = [0x3e7a62, 0x49896f, 0x2f6b54, 0x5d9478, 0x3a705c];
  const blobs = [
    [0, 2.35, 0, 1.05, 0],
    [0.55, 2.05, 0.15, 0.78, 1],
    [-0.5, 2.1, -0.1, 0.74, 2],
    [0.12, 2.85, -0.08, 0.66, 3],
    [-0.18, 1.7, 0.42, 0.58, 4],
    [0.28, 1.72, -0.38, 0.52, 1]
  ];
  const parts = blobs.map(([x, y, z, s, ci]) => {
    const g = new THREE.SphereGeometry(s, 8, 6);
    g.translate(x, y, z);
    return paint(g, new THREE.Color(greens[ci]));
  });
  return mergeGeometries(parts);
}

function makeTrunk() {
  const g = new THREE.CylinderGeometry(0.07, 0.16, 1.55, 7);
  g.translate(0, 0.78, 0);
  return paint(g, new THREE.Color(0x5a6a60));
}

function buildForest() {
  const canopy = makeCanopy();
  const trunk = makeTrunk();
  const spots = [];
  let guard = 0;
  while (spots.length < 78 && guard < 4000) {
    guard += 1;
    const x = (Math.random() - 0.5) * 190;
    const z = (Math.random() - 0.5) * 190;
    let blocked = false;
    for (let i = 0; i < PLACES.length; i += 1) {
      const dx = x - PLACES[i].x;
      const dz = z - PLACES[i].z;
      if (dx * dx + dz * dz < 20) blocked = true;
    }
    const wx = x - PLACES[2].x;
    const wz = z - PLACES[2].z;
    if (wx * wx + wz * wz < 42) blocked = true;
    if (!blocked) spots.push({ x, z, s: 0.75 + Math.random() * 0.95, ry: Math.random() * Math.PI * 2 });
  }
  const count = spots.length;
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0 });
  const trunks = new THREE.InstancedMesh(trunk, mat, count);
  const crowns = new THREE.InstancedMesh(canopy, mat.clone(), count);
  const shadeGeo = new THREE.CircleGeometry(1.15, 12);
  shadeGeo.rotateX(-Math.PI / 2);
  const shades = new THREE.InstancedMesh(shadeGeo, new THREE.MeshBasicMaterial({
    color: 0x173d32,
    transparent: true,
    opacity: 0.16,
    depthWrite: false
  }), count);
  trunks.castShadow = true;
  crowns.castShadow = true;
  crowns.receiveShadow = true;
  const dummy = new THREE.Object3D();
  spots.forEach((spot, i) => {
    const y = terrainHeight(spot.x, spot.z);
    dummy.position.set(spot.x, y, spot.z);
    dummy.rotation.set(0, spot.ry, 0);
    dummy.scale.setScalar(spot.s);
    dummy.updateMatrix();
    trunks.setMatrixAt(i, dummy.matrix);
    crowns.setMatrixAt(i, dummy.matrix);
    dummy.position.y = y + 0.04;
    dummy.rotation.set(-0.02, 0, 0);
    dummy.scale.set(spot.s * 1.35, 1, spot.s * 1.35);
    dummy.updateMatrix();
    shades.setMatrixAt(i, dummy.matrix);
  });
  return { trunks, crowns, shades };
}

function buildPond(renderer) {
  const geo = new THREE.CircleGeometry(6.4, 48);
  const water = new Water(geo, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: rippleTexture(),
    sunDirection: new THREE.Vector3(0.35, 0.8, 0.2),
    sunColor: 0xfff6e8,
    waterColor: 0x3e7a62,
    distortionScale: 1.6,
    fog: true
  });
  water.rotation.x = -Math.PI / 2;
  const x = PLACES[2].x;
  const z = PLACES[2].z;
  water.position.set(x, terrainHeight(x, z) + 0.22, z);
  water.receiveShadow = true;
  return water;
}

function rippleTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "rgb(128,128,255)";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1800; i += 1) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const v = 100 + Math.random() * 80;
    g.fillStyle = `rgb(${v},${v},${200 + Math.random() * 55})`;
    g.fillRect(x, y, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function buildMarkers(scene, focusables) {
  PLACES.forEach((place, i) => {
    const keys = FOCUS[i];
    if (!keys) return;
    const y = terrainHeight(place.x, place.z);
    const n = keys.length;
    for (let k = 0; k < n; k += 1) {
      const stone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.22, 0.1, 8),
        new THREE.MeshStandardMaterial({
          color: 0xe7f0ea,
          roughness: 0.75,
          metalness: 0.04,
          emissive: GREEN,
          emissiveIntensity: 0.02
        })
      );
      const ang = (k / n) * Math.PI * 2;
      stone.position.set(place.x + Math.cos(ang) * 1.4, y + 0.08, place.z + Math.sin(ang) * 1.4);
      stone.castShadow = true;
      stone.receiveShadow = true;
      if (keys) {
        stone.userData.key = keys[k];
        focusables.push(stone);
      }
      scene.add(stone);
    }
  });
}

function buildPollen() {
  const count = 90;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = Math.random() * 4.5;
    positions[i * 3 + 2] = -Math.random() * 16;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xe7f0ea,
    size: 0.045,
    transparent: true,
    opacity: 0.45,
    depthWrite: false
  }));
}
