import * as THREE from "../vendor/three.module.min.js";

const PAPER = 0xf3f0e8;
const INK = 0x173d32;
const GREEN = 0x49896f;
const MOSS = 0x3e7a62;

const PHOTOS = [
  "assets/img/g1-1.jpg",
  "assets/img/g1-2.jpg",
  "assets/img/g1-3.jpg",
  "assets/img/g2-1.jpg",
  "assets/img/g2-2.jpg",
  "assets/img/g2-3.jpg",
  "assets/img/g3-1.jpg",
  "assets/img/g3-2.jpg",
  "assets/img/g3-3.jpg",
  "assets/img/g4-1.jpg",
  "assets/img/g4-2.jpg",
  "assets/img/g4-3.jpg",
  "assets/img/g5-1.jpg",
  "assets/img/g5-2.jpg",
  "assets/img/g5-3.jpg",
  "assets/img/g6-1.jpg"
];

// One move per hop. Neighbors never share a move.
const MOVES = [
  "left",
  "up",
  "forward",
  "right",
  "down",
  "orbit",
  "rise",
  "descend",
  "strafe",
  "sweep",
  "back",
  "crane",
  "arc",
  "sink",
  "lift"
];

const PLACES = [
  { x: 0, z: 0, y: 0 },
  { x: -22, z: -5, y: -0.35 },
  { x: -18, z: -28, y: 1.7 },
  { x: 6, z: -36, y: 1.15 },
  { x: 30, z: -30, y: 3.5 },
  { x: 34, z: -6, y: 0.25 },
  { x: 14, z: 16, y: -0.85 },
  { x: -10, z: 24, y: 2.5 },
  { x: -34, z: 14, y: 0.55 },
  { x: -42, z: -12, y: 0 },
  { x: -30, z: -36, y: -1.35 },
  { x: -4, z: -50, y: 0.4 },
  { x: 24, z: -48, y: 3.1 },
  { x: 44, z: -26, y: 1.05 },
  { x: 30, z: 2, y: 0.15 },
  { x: 8, z: 22, y: -0.15 }
];

const ATMOS = [
  { color: 0xf4f1ea, near: 16, far: 72 },
  { color: 0xe3efe7, near: 10, far: 40 },
  { color: 0xf3f0e8, near: 14, far: 52 },
  { color: 0xe6ece7, near: 7, far: 30 },
  { color: 0xf7f4ee, near: 20, far: 80 },
  { color: 0xe2eee6, near: 12, far: 46 },
  { color: 0xf1eee6, near: 12, far: 48 },
  { color: 0xeef4ef, near: 16, far: 58 },
  { color: 0xe5eeea, near: 9, far: 34 },
  { color: 0xf4f1ea, near: 13, far: 50 },
  { color: 0xd3e4da, near: 7, far: 32 },
  { color: 0xebe4d8, near: 9, far: 36 },
  { color: 0xeaf3ee, near: 18, far: 66 },
  { color: 0xf6f3ec, near: 14, far: 56 },
  { color: 0xe7efe9, near: 11, far: 42 },
  { color: 0xf7f4ee, near: 18, far: 74 }
];

// Camera offset from each place, so the arrival angle changes with the room.
const ANGLES = [
  { cam: [0.2, 2.25, 7.4], look: [1.7, 1.25, 0.2] },
  { cam: [-6.2, 1.55, 2.4], look: [0.8, 1.35, -0.2] },
  { cam: [0.4, 6.4, 5.2], look: [1.2, 1.2, 0] },
  { cam: [0.1, 1.85, 7.6], look: [1.5, 1.55, -0.4] },
  { cam: [6.4, 2.15, 1.6], look: [0.4, 1.45, 0.2] },
  { cam: [1.2, 4.6, 5.5], look: [1.1, 0.9, 0] },
  { cam: [0.3, 1.25, 6.8], look: [1.6, 1.15, 0.1] },
  { cam: [-4.2, 3.8, 5.4], look: [0.9, 1.5, 0] },
  { cam: [0.6, 5.4, 3.2], look: [1.4, 1.05, 0] },
  { cam: [-5.5, 2.05, 4.2], look: [1.1, 1.35, 0.2] },
  { cam: [4.8, 1.45, 4.6], look: [0.6, 1.2, -0.6] },
  { cam: [0.2, 2.5, -6.6], look: [1.3, 1.35, 0.2] },
  { cam: [2.2, 5.8, 6.2], look: [0.8, 1.2, 0] },
  { cam: [5.6, 2.3, 2.8], look: [0.5, 1.4, 0.1] },
  { cam: [-4.6, 2.7, 5.2], look: [0.7, 1.25, 0] },
  { cam: [0.4, 2.05, 8.2], look: [2.1, 1.3, 0.1] }
];

function smoother(u) {
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

function stoneMat(color, rough) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: rough == null ? 0.5 : rough,
    metalness: 0.08,
    emissive: color,
    emissiveIntensity: 0.03
  });
}

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setClearColor(PAPER, 1);
  if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PAPER);
  scene.fog = new THREE.Fog(PAPER, 16, 70);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 220);
  scene.add(new THREE.HemisphereLight(0xf7f4ee, 0xa9cbb8, 0.95));
  const sun = new THREE.DirectionalLight(0xfff8ee, 1.22);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 40;
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  sun.shadow.bias = -0.001;
  scene.add(sun);
  scene.add(sun.target);
  scene.add(new THREE.DirectionalLight(0xd7ebe2, 0.32));

  const loader = new THREE.TextureLoader();
  const focusables = [];
  const spinners = [];
  const places = PLACES.map((place, i) => buildPlace(i, place, loader, focusables, spinners, scene));

  const particles = buildParticles();
  scene.add(particles);

  let intro = 0;
  let shownIndex = 0;
  let travel = null;
  let reduced = false;
  let focusKey = "";
  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };
  const look = new THREE.Vector3();
  const fogColor = new THREE.Color();
  let poseNow = clonePose(viewFor(0));

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
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
    poseNow = { pos: pos.clone(), look: look.clone() };

    pointer.x += (pointerTarget.x - pointer.x) * 0.06;
    pointer.y += (pointerTarget.y - pointer.y) * 0.06;
    pos.x += pointer.x * 0.28;
    pos.y += pointer.y * 0.12;
    look.x += pointer.x * 0.16;

    camera.position.copy(pos);
    camera.lookAt(look);

    const a = ATMOS[fogFrom];
    const b = ATMOS[fogTo];
    fogColor.setHex(a.color).lerp(new THREE.Color(b.color), fogU);
    scene.fog.color.copy(fogColor);
    scene.background.copy(fogColor);
    scene.fog.near = THREE.MathUtils.lerp(a.near, b.near, fogU);
    scene.fog.far = THREE.MathUtils.lerp(a.far, b.far, fogU);
    renderer.setClearColor(fogColor, 1);

    sun.position.set(pos.x + 8, pos.y + 12, pos.z + 4);
    sun.target.position.set(look.x, look.y, look.z);
    sun.target.updateMatrixWorld();

    const time = now * 0.001;
    spinners.forEach((mesh) => {
      mesh.rotation.y = time * mesh.userData.spin;
    });
    focusables.forEach((mesh) => {
      const on = focusKey && mesh.userData.key === focusKey;
      const target = on ? 0.5 : 0.03;
      mesh.material.emissiveIntensity += (target - mesh.material.emissiveIntensity) * 0.12;
    });
    places.forEach((group, i) => {
      const here = travel ? travel.toIndex : shownIndex;
      const prev = travel ? travel.fromIndex : shownIndex;
      group.visible = i === here || (travel && i === prev) || (intro < 1 && i === 0);
    });

    const arr = particles.geometry.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] += 0.004;
      if (arr[i + 1] > 4.8) arr[i + 1] = 0.15;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    particles.position.copy(pos);

    renderer.render(scene, camera);
  }

  return {
    resize,
    start() {
      resize();
      renderer.setAnimationLoop(frame);
    },
    setIntro(u) {
      intro = u;
    },
    setReduced(flag) {
      reduced = !!flag;
    },
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
        dur: Math.min(2300, 1080 + Math.max(0, dist - 18) * 18)
      };
    },
    setFocus(key) {
      focusKey = key || "";
    },
    setPointer(x, y) {
      pointerTarget.x = x;
      pointerTarget.y = y;
    },
    pose() {
      return {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
      };
    }
  };
}

function viewFor(i) {
  const place = PLACES[i];
  const angle = ANGLES[i];
  return {
    pos: new THREE.Vector3(place.x + angle.cam[0], place.y + angle.cam[1], place.z + angle.cam[2]),
    look: new THREE.Vector3(place.x + angle.look[0], place.y + angle.look[1], place.z + angle.look[2])
  };
}

function introPose() {
  const v = viewFor(0);
  return {
    pos: v.pos.clone().add(new THREE.Vector3(2.4, 12.5, 7)),
    look: v.look.clone().add(new THREE.Vector3(-1.2, -0.8, -1))
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

function buildParticles() {
  const count = 140;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = Math.random() * 4.2;
    positions[i * 3 + 2] = -Math.random() * 14;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    color: GREEN,
    size: 0.05,
    transparent: true,
    opacity: 0.38,
    depthWrite: false
  }));
}

function buildPlace(i, place, loader, focusables, spinners, scene) {
  const group = new THREE.Group();
  group.position.set(place.x, place.y, place.z);
  scene.add(group);

  const floors = [0xe7f0ea, 0xd5e6dc, 0xe9efe8, 0xddd8cc, 0xf0ebe3, 0xd7e7de, 0xe7e2d6, 0xe4eee8, 0xdfe8e4, 0xe8efe9, 0xc9ddd2, 0xe6dccb, 0xe5f0e8, 0xeef3ee, 0xe3ebe6, 0xf3f0e8];
  platform(group, i === 4 || i === 12 ? 11 : 8.5, floors[i]);
  if (i === 3 || i === 11) platform(group, 5.2, 0xe4ddd0);

  if (i === 0) terrace(group, spinners);
  else if (i === 1) grove(group, focusables);
  else if (i === 2) courtyard(group);
  else if (i === 3) archive(group);
  else if (i === 4) gallery(group);
  else if (i === 5) splitGarden(group);
  else if (i === 6) timelineCourt(group, focusables);
  else if (i === 7) arches(group, focusables, spinners);
  else if (i === 8) lab(group);
  else if (i === 9) colonnade(group, focusables);
  else if (i === 10) duskGarden(group, spinners);
  else if (i === 11) cloister(group, focusables);
  else if (i === 12) regional(group);
  else if (i === 13) conclusion(group, focusables);
  else if (i === 14) pavilion(group, focusables, spinners);
  else thanksClearing(group, spinners);

  const view = viewFor(i);
  const portrait = makePortrait(loader, PHOTOS[i]);
  portrait.position.set(3.5, 1.35, -1.6);
  group.add(portrait);
  group.updateMatrixWorld(true);
  portrait.lookAt(view.pos);
  return group;
}

function platform(group, radius, color) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 48),
    new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0 })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  group.add(mesh);
}

function tree(group, x, z, s, color) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.62, 5), stoneMat(0x5e6f66, 0.95));
  trunk.position.y = 0.31;
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.46, 1.28, 6), stoneMat(color || GREEN, 0.84));
  crown.position.y = 1.15;
  g.add(trunk, crown);
  group.add(g);
}

function scatterTrees(group, count, radius, color) {
  for (let n = 0; n < count; n += 1) {
    const a = (n / count) * Math.PI * 2 + 0.4;
    const r = radius * (0.72 + (n % 3) * 0.12);
    tree(group, Math.cos(a) * r, Math.sin(a) * r, 0.75 + (n % 4) * 0.12, color || (n % 2 ? MOSS : GREEN));
  }
}

function column(group, x, z, h, color, key, bucket) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, h, 8), stoneMat(color || INK, 0.45));
  mesh.position.set(x, h / 2, z);
  if (key && bucket) {
    mesh.userData.key = key;
    bucket.push(mesh);
  }
  group.add(mesh);
  return mesh;
}

function ring(group, r, tube, y, color, spin, spinners) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 12, 48), stoneMat(color, 0.4));
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = y;
  if (spin) {
    mesh.userData.spin = spin;
    spinners.push(mesh);
  }
  group.add(mesh);
  return mesh;
}

function terrace(group, spinners) {
  scatterTrees(group, 7, 6.2, GREEN);
  ring(group, 1.15, 0.035, 0.08, GREEN, 0.15, spinners);
  ring(group, 0.72, 0.028, 0.1, INK, -0.1, spinners);
}

function grove(group, focusables) {
  scatterTrees(group, 12, 5.4, MOSS);
  ["q1", "q2", "q3"].forEach((key, n) => {
    const h = 0.9 + n * 0.35;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, h, 0.28), stoneMat(n === 2 ? INK : GREEN, 0.45));
    mesh.position.set(-1.1 + n * 0.7, h / 2, -1.2);
    mesh.userData.key = key;
    focusables.push(mesh);
    group.add(mesh);
  });
}

function courtyard(group) {
  [[-3.2, 0], [3.2, 0], [0, -3.2], [0, 3.2]].forEach(([x, z], n) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(n < 2 ? 0.18 : 5.6, 0.7, n < 2 ? 5.6 : 0.18), stoneMat(0xf6f3ec, 0.9));
    wall.position.set(x, 0.35, z);
    group.add(wall);
  });
  const mound = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 12), stoneMat(GREEN, 0.8));
  mound.scale.y = 0.45;
  mound.position.set(-1.4, 0.25, 0.4);
  const mound2 = mound.clone();
  mound2.position.set(1.5, 0.25, -0.6);
  mound2.material = stoneMat(MOSS, 0.8);
  group.add(mound, mound2);
  tree(group, -4.2, 4.2, 1.1, GREEN);
  tree(group, 4.4, -4, 0.9, MOSS);
}

function archive(group) {
  for (let n = 0; n < 5; n += 1) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.4, 0.9), stoneMat(n % 2 ? 0x173d32 : 0x2f6b54, 0.62));
    shelf.position.set(-2.4, 1.2, -2 + n * 1.05);
    const shelf2 = shelf.clone();
    shelf2.position.x = 0.2;
    shelf2.material = stoneMat(0x6d5a45, 0.7);
    group.add(shelf, shelf2);
  }
}

function gallery(group) {
  const deck = new THREE.Mesh(new THREE.BoxGeometry(9, 0.12, 2.2), stoneMat(0xf6f3ec, 0.86));
  deck.position.set(0, 0.2, -1.2);
  group.add(deck);
  for (let n = 0; n < 6; n += 1) column(group, -4.2 + n * 1.7, -4.6, 2.4, n % 2 ? GREEN : INK);
  scatterTrees(group, 5, 8.5, GREEN);
}

function splitGarden(group) {
  const left = new THREE.Mesh(new THREE.CircleGeometry(2.4, 28), new THREE.MeshStandardMaterial({ color: 0x49896f, roughness: 1 }));
  left.rotation.x = -Math.PI / 2;
  left.position.set(-1.6, 0.03, 0);
  const right = new THREE.Mesh(new THREE.CircleGeometry(2.4, 28), new THREE.MeshStandardMaterial({ color: 0x173d32, roughness: 1 }));
  right.rotation.x = -Math.PI / 2;
  right.position.set(1.7, 0.03, 0.2);
  group.add(left, right);
  for (let n = 0; n < 6; n += 1) {
    const hedge = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.35), stoneMat(MOSS, 0.8));
    hedge.position.set(0.05, 0.25, -1.6 + n * 0.62);
    group.add(hedge);
  }
  scatterTrees(group, 8, 6.4, GREEN);
}

function timelineCourt(group, focusables) {
  ["y1980", "grow", "adult"].forEach((key, n) => {
    column(group, -1.4 + n * 1.3, -0.4, 0.35 + n * 0.25, n === 1 ? INK : GREEN, key, focusables);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), stoneMat(0xf6f3ec, 0.5));
    orb.position.set(-1.4 + n * 1.3, 0.7 + n * 0.25, -0.4);
    group.add(orb);
  });
  scatterTrees(group, 6, 6, MOSS);
}

function arches(group, focusables, spinners) {
  ["h1", "h2"].forEach((key, n) => {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 12, 28, Math.PI), stoneMat(n ? INK : GREEN, 0.4));
    arch.rotation.z = Math.PI;
    arch.position.set(n ? 1.15 : -1.15, 0.7, 0);
    arch.userData.key = key;
    focusables.push(arch);
    group.add(arch);
  });
  ring(group, 2.2, 0.03, 0.06, GREEN, 0.08, spinners);
}

function lab(group) {
  const table = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 1.6), stoneMat(0xf6f3ec, 0.75));
  table.position.set(-0.4, 0.7, -0.2);
  group.add(table);
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), stoneMat((r + c) % 2 ? GREEN : INK, 0.4));
      cube.position.set(-1.5 + c * 0.55, 0.88 + ((r + c) % 3) * 0.08, -0.55 + r * 0.4);
      group.add(cube);
    }
  }
  column(group, -3.2, 2.2, 1.6, GREEN);
  column(group, 2.4, 2.4, 2.1, INK);
}

function colonnade(group, focusables) {
  for (let n = 0; n < 6; n += 1) column(group, -2.5 + n * 1.05, -2.4, 2.2 + (n % 2) * 0.4, n % 2 ? GREEN : 0xf4f1ea);
  ["total", "ratio", "invent"].forEach((key, n) => {
    column(group, -0.9 + n * 0.8, 0.4, 1.3, n === 1 ? INK : GREEN, key, focusables);
  });
}

function duskGarden(group, spinners) {
  scatterTrees(group, 10, 5.8, 0x2f6b54);
  const axes = [[0, Math.PI / 2, 0], [Math.PI / 2, 0, 0], [0.4, 0.2, Math.PI / 2]];
  axes.forEach((rot, n) => {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 12, 36), stoneMat(n === 1 ? INK : GREEN, 0.35));
    mesh.rotation.set(rot[0], rot[1], rot[2]);
    mesh.position.y = 1.2;
    mesh.userData.spin = 0.12 + n * 0.04;
    spinners.push(mesh);
    group.add(mesh);
  });
}

function cloister(group, focusables) {
  for (let n = 0; n < 8; n += 1) {
    const a = (n / 8) * Math.PI * 2;
    column(group, Math.cos(a) * 3.1, Math.sin(a) * 3.1, 1.8, n % 2 ? 0xf6f3ec : GREEN);
  }
  ["psm", "did", "swap"].forEach((key, n) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.9, 0.08), stoneMat(n === 1 ? INK : GREEN, 0.5));
    frame.position.set(-1 + n * 0.9, 0.7, 0.4);
    frame.userData.key = key;
    focusables.push(frame);
    group.add(frame);
  });
}

function regional(group) {
  const hill = new THREE.Mesh(new THREE.SphereGeometry(3.2, 20, 12), stoneMat(0xc9ddd2, 1));
  hill.scale.y = 0.28;
  hill.position.set(-6, -0.4, -5);
  const hill2 = hill.clone();
  hill2.position.set(6.5, -0.5, -6);
  group.add(hill, hill2);
  scatterTrees(group, 6, 7.5, GREEN);
  const halfL = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24, 0, Math.PI), new THREE.MeshStandardMaterial({ color: GREEN, roughness: 1 }));
  const halfR = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24, Math.PI, Math.PI), new THREE.MeshStandardMaterial({ color: INK, roughness: 1 }));
  halfL.rotation.x = halfR.rotation.x = -Math.PI / 2;
  halfL.position.y = halfR.position.y = 0.04;
  group.add(halfL, halfR);
}

function conclusion(group, focusables) {
  ["find", "theory", "practice"].forEach((key, n) => {
    column(group, -1.2 + n * 1.15, 0.2, 0.8 + n * 0.35, n === 2 ? INK : GREEN, key, focusables);
  });
  scatterTrees(group, 5, 6.6, MOSS);
}

function pavilion(group, focusables, spinners) {
  ["bound", "ask", "take"].forEach((key, n) => {
    const mesh = ring(group, 0.55 + n * 0.38, 0.028, 0.9, n === 2 ? INK : GREEN, 0.05 + n * 0.03, spinners);
    mesh.userData.key = key;
    focusables.push(mesh);
  });
  for (let n = 0; n < 4; n += 1) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 1.6), stoneMat(0xf6f3ec, 0.9));
    const a = n * Math.PI / 2 + 0.4;
    wall.position.set(Math.cos(a) * 3.3, 0.7, Math.sin(a) * 3.3);
    wall.lookAt(0, 0.7, 0);
    group.add(wall);
  }
}

function thanksClearing(group, spinners) {
  scatterTrees(group, 5, 7.2, GREEN);
  ring(group, 1.35, 0.04, 0.08, GREEN, 0.08, spinners);
}

function makePortrait(loader, url) {
  const tex = loader.load(url);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  const frame = new THREE.Group();
  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(1.55, 2.15),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.86, metalness: 0 })
  );
  const mat = new THREE.Mesh(
    new THREE.BoxGeometry(1.75, 2.35, 0.08),
    stoneMat(0xf6f3ec, 0.9)
  );
  mat.position.z = -0.06;
  photo.position.z = 0.02;
  frame.add(mat, photo);
  return frame;
}
