import * as THREE from "../vendor/three.module.min.js";

const PAPER = 0xf3f0e8;
const INK = 0x173d32;
const GREEN = 0x49896f;
const MOSS = 0x3e7a62;
const PALE = 0xe7f2eb;

function smoother(u) {
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

function stoneMat(color, rough) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: rough == null ? 0.46 : rough,
    metalness: 0.14,
    emissive: color,
    emissiveIntensity: 0.035
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
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PAPER);
  scene.fog = new THREE.Fog(PAPER, 16, 58);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 180);

  scene.add(new THREE.HemisphereLight(0xf7f4ee, 0xa9cbb8, 0.92));
  const sun = new THREE.DirectionalLight(0xfff8ee, 1.28);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 48;
  sun.shadow.camera.left = -16;
  sun.shadow.camera.right = 16;
  sun.shadow.camera.top = 16;
  sun.shadow.camera.bottom = -16;
  sun.shadow.bias = -0.0008;
  if ("radius" in sun.shadow) sun.shadow.radius = 2.5;
  scene.add(sun);
  scene.add(sun.target);
  const fill = new THREE.DirectionalLight(0xd7ebe2, 0.28);
  fill.position.set(-6, 3, -4);
  scene.add(fill);

  const stations = [];
  for (let i = 0; i < 16; i += 1) {
    stations.push(new THREE.Vector3(Math.sin(i * 0.58) * 2.15, 0, 6 - i * 6.55));
  }
  const curve = new THREE.CatmullRomCurve3(stations);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(96, 72),
    new THREE.MeshStandardMaterial({ color: 0xdde8e1, roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.02, -46);
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(130, 65, 0xb7cdc0, 0xc9dbd1);
  grid.position.set(0, 0.012, -46);
  const gridMats = Array.isArray(grid.material) ? grid.material : [grid.material];
  gridMats.forEach((m) => {
    m.transparent = true;
    m.opacity = 0.55;
  });
  scene.add(grid);

  const ribbon = buildRibbon(curve);
  ribbon.receiveShadow = true;
  scene.add(ribbon);

  const clearTex = clearingTexture();
  const clearing = new THREE.Mesh(
    new THREE.CircleGeometry(8.5, 48),
    new THREE.MeshBasicMaterial({ map: clearTex, transparent: true, depthWrite: false })
  );
  clearing.rotation.x = -Math.PI / 2;
  clearing.position.y = 0.03;
  scene.add(clearing);

  const hills = new THREE.Group();
  const hillMat = new THREE.MeshStandardMaterial({ color: 0xc9ddd2, roughness: 1, metalness: 0 });
  for (let i = 0; i < 6; i += 1) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(14 + (i % 3) * 4, 28, 16), hillMat);
    hill.scale.y = 0.28 + (i % 3) * 0.05;
    hill.position.set(-34 + i * 14, -8.5, -18 - i * 7);
    hills.add(hill);
  }
  scene.add(hills);

  const { trunks, crowns } = buildTrees(curve);
  scene.add(trunks);
  scene.add(crowns);

  const stones = [];
  const stoneMaterial = stoneMat(0xf4f1ea, 0.86);
  const stoneActive = stoneMat(GREEN, 0.42);
  for (let i = 0; i < 16; i += 1) {
    const t = clampT(i / 15);
    const p = curve.getPointAt(t);
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.07, 18), i === 0 ? stoneActive : stoneMaterial);
    stone.position.set(p.x, 0.045, p.z);
    stone.receiveShadow = true;
    stone.castShadow = true;
    scene.add(stone);
    stones.push(stone);
  }

  const focusables = [];
  const groups = stations.map((_, i) => {
    const group = buildSculpture(i, focusables);
    const t = clampT(i / 15);
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    group.position.set(p.x + side.x * 1.2, 0, p.z + side.z * 1.2);
    group.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    scene.add(group);
    return group;
  });

  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 180;
  const particlePos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    particlePos[i * 3] = (Math.random() - 0.5) * 14;
    particlePos[i * 3 + 1] = Math.random() * 4.2 + 0.2;
    particlePos[i * 3 + 2] = -Math.random() * 16 - 1;
  }
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({
      color: GREEN,
      size: 0.055,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    })
  );
  scene.add(particles);

  let intro = 0;
  let camT = 0;
  let travel = null;
  let focusKey = "";
  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };
  const look = new THREE.Vector3();
  let reduced = false;

  function frameAt(t) {
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    return { p, tan, side };
  }

  function pose(indexFloat) {
    const t = clampT(indexFloat / 15);
    const { p, tan, side } = frameAt(t);
    const pos = p.clone().addScaledVector(tan, -5.1).addScaledVector(side, -0.55);
    pos.y = 2.25;
    const look = p.clone().addScaledVector(side, 1.15);
    look.y = 1.2;
    return { pos, look };
  }

  function introPose() {
    const p = curve.getPointAt(0.001);
    return {
      pos: new THREE.Vector3(p.x + 0.4, 13.5, p.z + 11),
      look: new THREE.Vector3(p.x, 0.4, p.z - 8)
    };
  }

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
    if (travel) {
      const u = Math.min(1, (now - travel.t0) / travel.dur);
      camT = travel.from + (travel.to - travel.from) * smoother(u);
      if (u >= 1) {
        camT = travel.to;
        travel = null;
      }
    }

    const settled = pose(camT);
    const high = introPose();
    const k = smoother(Math.min(1, Math.max(0, intro)));
    const pos = high.pos.clone().lerp(settled.pos, k);
    look.copy(high.look).lerp(settled.look, k);

    pointer.x += (pointerTarget.x - pointer.x) * 0.06;
    pointer.y += (pointerTarget.y - pointer.y) * 0.06;
    pos.x += pointer.x * 0.32;
    pos.y += pointer.y * 0.14;
    look.x += pointer.x * 0.18;
    look.y += pointer.y * 0.08;

    camera.position.copy(pos);
    camera.lookAt(look);

    const depth = camT / 15;
    const open = Math.max(0, camT - 14);
    scene.fog.near = THREE.MathUtils.lerp(18, 9, depth);
    scene.fog.far = THREE.MathUtils.lerp(64, 36, depth) + open * 18;

    sun.position.set(pos.x + 7, pos.y + 11, pos.z + 5);
    sun.target.position.set(look.x, 0.4, look.z);
    sun.target.updateMatrixWorld();

    clearing.position.x = pos.x;
    clearing.position.z = pos.z - 1.2;

    const time = now * 0.001;
    groups.forEach((group, i) => {
      const dist = Math.abs(i - camT);
      const presence = THREE.MathUtils.clamp(1.2 - dist * 1.05, 0, 1);
      const introScale = i === 0 ? Math.max(0.001, smoother(intro)) : 1;
      group.visible = presence > 0.03;
      group.scale.setScalar(Math.max(0.001, presence * introScale));
      group.rotation.y = time * 0.11 + i * 0.4;
      group.position.y = Math.sin(time * 0.55 + i) * 0.045 * presence;
    });

    stones.forEach((stone, i) => {
      const d = Math.abs(i - camT);
      const s = 1 + Math.max(0, 1 - d) * 0.55;
      stone.scale.set(s, 1, s);
      stone.material = d < 0.55 ? stoneActive : stoneMaterial;
    });

    focusables.forEach((mesh) => {
      const on = focusKey && mesh.userData.key === focusKey;
      const target = on ? 0.55 : 0.035;
      mesh.material.emissiveIntensity += (target - mesh.material.emissiveIntensity) * 0.12;
    });

    const arr = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i += 1) {
      arr[i * 3 + 1] += 0.004;
      if (arr[i * 3 + 1] > 4.6) arr[i * 3 + 1] = 0.2;
    }
    particleGeo.attributes.position.needsUpdate = true;
    particles.position.x = pos.x;
    particles.position.z = pos.z;

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
      if (reduced || snap) {
        camT = dest;
        travel = null;
        return;
      }
      const from = travel ? camT : camT;
      const dist = Math.abs(dest - from);
      travel = {
        from,
        to: dest,
        t0: performance.now(),
        dur: Math.min(2200, 880 + dist * 340)
      };
    },
    setFocus(key) {
      focusKey = key || "";
    },
    setPointer(x, y) {
      pointerTarget.x = x;
      pointerTarget.y = y;
    }
  };
}

function clampT(t) {
  return Math.min(0.999, Math.max(0.001, t));
}

function buildRibbon(curve) {
  const segments = 140;
  const positions = [];
  const indices = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = clampT(i / segments);
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const half = 0.2;
    const y = 0.04;
    const left = p.clone().addScaledVector(side, -half);
    const right = p.clone().addScaledVector(side, half);
    positions.push(left.x, y, left.z, right.x, y, right.z);
  }
  for (let i = 0; i < segments; i += 1) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, stoneMat(GREEN, 0.72));
}

function buildTrees(curve) {
  const count = 86;
  const trunkGeo = new THREE.CylinderGeometry(0.045, 0.07, 0.62, 6);
  const crownGeo = new THREE.ConeGeometry(0.42, 1.35, 7);
  const trunks = new THREE.InstancedMesh(trunkGeo, stoneMat(0x5d6f66, 0.9), count);
  const crownMat = stoneMat(0xffffff, 0.78);
  crownMat.emissive.setHex(0x000000);
  const crowns = new THREE.InstancedMesh(crownGeo, crownMat, count);
  trunks.castShadow = true;
  crowns.castShadow = true;
  trunks.receiveShadow = true;
  crowns.receiveShadow = true;
  const dummy = new THREE.Object3D();
  let n = 0;
  for (let i = 0; i < count; i += 1) {
    const t = clampT((i + 0.5) / count);
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const side = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    const hand = i % 2 === 0 ? 1 : -1;
    const dist = 2.15 + (i % 5) * 0.48;
    const yScale = 0.75 + (i % 4) * 0.16;
    dummy.position.copy(p).addScaledVector(side, hand * dist);
    dummy.position.y = 0;
    dummy.rotation.y = i * 0.7;
    dummy.scale.set(1, yScale, 1);
    dummy.updateMatrix();
    trunks.setMatrixAt(n, dummy.matrix);
    dummy.position.y = 0.985 * yScale;
    dummy.scale.set(1, yScale, 1);
    dummy.updateMatrix();
    crowns.setMatrixAt(n, dummy.matrix);
    const tint = new THREE.Color(i % 3 === 0 ? MOSS : GREEN);
    crowns.setColorAt(n, tint);
    n += 1;
  }
  trunks.instanceMatrix.needsUpdate = true;
  crowns.instanceMatrix.needsUpdate = true;
  if (crowns.instanceColor) crowns.instanceColor.needsUpdate = true;
  return { trunks, crowns };
}

function track(mesh, key, bucket) {
  if (key) {
    mesh.userData.key = key;
    bucket.push(mesh);
  }
  return mesh;
}

function buildSculpture(index, bucket) {
  const g = new THREE.Group();
  const green = () => stoneMat(GREEN);
  const ink = () => stoneMat(INK, 0.4);
  const pale = () => stoneMat(PALE, 0.8);

  if (index === 0 || index === 15) {
    [1.05, 0.68, 0.34].forEach((r, i) => {
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, index === 15 ? 0.045 : 0.034, 14, 72), i === 1 ? ink() : green());
      mesh.rotation.x = Math.PI / 2;
      mesh.position.y = 1.2;
      g.add(mesh);
    });
    return g;
  }

  if (index === 1) {
    ["q1", "q2", "q3"].forEach((key, i) => {
      const h = 0.85 + i * 0.38;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, h, 0.24), i === 2 ? ink() : green());
      mesh.position.set((i - 1) * 0.62, h / 2, 0);
      g.add(track(mesh, key, bucket));
      const cap = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 8, 24), pale());
      cap.rotation.x = Math.PI / 2;
      cap.position.set((i - 1) * 0.62, h + 0.08, 0);
      g.add(cap);
    });
    return g;
  }

  if (index === 2) {
    const a = new THREE.Mesh(new THREE.SphereGeometry(0.36, 28, 18), green());
    a.scale.y = 0.7;
    a.position.set(-0.58, 0.62, 0);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.36, 28, 18), ink());
    b.scale.y = 0.7;
    b.position.set(0.58, 0.62, 0);
    const link = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.028, 10, 40), pale());
    link.rotation.y = Math.PI / 2;
    link.position.y = 0.7;
    g.add(a, b, link);
    return g;
  }

  if (index === 3) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8), ink());
    stem.position.y = 0.35;
    g.add(stem);
    [-1, 1].forEach((dir, i) => {
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.72, 8), green());
      branch.position.set(dir * 0.28, 0.95, 0);
      branch.rotation.z = dir * -0.7;
      g.add(branch);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), i === 0 ? green() : ink());
      tip.position.set(dir * 0.55, 1.28, 0);
      g.add(track(tip, i === 0 ? "risk" : "join", bucket));
    });
    return g;
  }

  if (index === 4) {
    ["s1", "s2", "s3"].forEach((key, i) => {
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.46 - i * 0.06, 0.03, 12, 40), i === 1 ? ink() : green());
      mesh.rotation.x = Math.PI / 2;
      mesh.position.set(0, 1.15, -i * 0.42);
      g.add(track(mesh, key, bucket));
    });
    return g;
  }

  if (index === 5) {
    for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18 + i * 0.1, 0.022, 10, 28), green());
      ring.rotation.x = Math.PI / 2;
      ring.position.set(-0.55, 0.7 + i * 0.02, 0);
      g.add(track(ring, "social", bucket));
    }
    for (let i = 0; i < 4; i += 1) {
      const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.08, 16), i % 2 ? ink() : pale());
      disk.position.set(0.55, 0.2 + i * 0.16, 0);
      g.add(track(disk, "tech", bucket));
    }
    return g;
  }

  if (index === 6) {
    ["y1980", "grow", "adult"].forEach((key, i) => {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.08, 16), pale());
      base.position.set((i - 1) * 0.7, 0.08, 0);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 18, 14), i === 1 ? ink() : green());
      orb.position.set((i - 1) * 0.7, 0.42 + i * 0.08, 0);
      g.add(base, track(orb, key, bucket));
    });
    return g;
  }

  if (index === 7) {
    ["h1", "h2"].forEach((key, i) => {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.034, 12, 28, Math.PI), i === 0 ? green() : ink());
      arch.rotation.x = Math.PI;
      arch.position.set(i === 0 ? -0.58 : 0.58, 0.42, 0);
      g.add(track(arch, key, bucket));
    });
    return g;
  }

  if (index === 8) {
    const box = new THREE.BoxGeometry(0.13, 0.13, 0.13);
    for (let r = 0; r < 4; r += 1) {
      for (let c = 0; c < 4; c += 1) {
        const mesh = new THREE.Mesh(box, (r + c) % 2 ? green() : ink());
        mesh.position.set((c - 1.5) * 0.26, 0.35 + ((r + c) % 3) * 0.08, (r - 1.5) * 0.26);
        g.add(mesh);
      }
    }
    return g;
  }

  if (index === 9 || index === 12) {
    const keys = index === 9 ? ["total", "ratio", "invent"] : ["total2", "ratio2", "invent2"];
    keys.forEach((key, i) => {
      const h = 1.15;
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.22, h, 0.22), i === 1 ? ink() : green());
      pillar.position.set((i - 1) * 0.58, h / 2, 0);
      g.add(track(pillar, key, bucket));
    });
    return g;
  }

  if (index === 10) {
    const rings = [
      [0, Math.PI / 2, 0],
      [Math.PI / 2, 0, 0],
      [Math.PI / 3, Math.PI / 2, Math.PI / 2]
    ];
    ["total", "ratio", "invent"].forEach((key, i) => {
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.045, 14, 40), i === 1 ? ink() : green());
      mesh.rotation.set(rings[i][0], rings[i][1], rings[i][2]);
      mesh.position.y = 1.05;
      g.add(track(mesh, key, bucket));
    });
    return g;
  }

  if (index === 11) {
    ["psm", "did", "swap"].forEach((key, i) => {
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(0.46, 0.72, 0.46)),
        new THREE.LineBasicMaterial({ color: i === 1 ? INK : GREEN })
      );
      edges.position.set((i - 1) * 0.7, 0.55, 0);
      g.add(edges);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), pale());
      foot.position.set((i - 1) * 0.7, 0.16, 0);
      g.add(track(foot, key, bucket));
    });
    return g;
  }

  if (index === 13) {
    ["find", "theory", "practice"].forEach((key, i) => {
      const h = 0.7 + i * 0.22;
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, h, 12), i === 2 ? ink() : green());
      mesh.position.set((i - 1) * 0.62, h / 2, 0);
      g.add(track(mesh, key, bucket));
    });
    return g;
  }

  ["bound", "ask", "take"].forEach((key, i) => {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.32 + i * 0.22, 0.025, 10, 40), i === 2 ? ink() : green());
    mesh.rotation.x = Math.PI / 2;
    mesh.position.y = 1.05;
    g.add(track(mesh, key, bucket));
  });
  return g;
}

function clearingTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  const rg = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  rg.addColorStop(0, "rgba(255,252,246,0.72)");
  rg.addColorStop(0.45, "rgba(246,243,236,0.28)");
  rg.addColorStop(1, "rgba(246,243,236,0)");
  g.fillStyle = rg;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}
