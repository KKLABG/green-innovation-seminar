/* Animated motifs for the sixteen scenes, plus the opening rift.
   Each motif is built around the origin and must stay inside its span
   for the whole loop, so placement can keep it off the text and photos. */

import * as THREE from "../vendor/three.module.min.js";

export const MOTIF_SPECS = [
  { w: 220, h: 250, bias: "lowleft" },
  { w: 340, h: 210, bias: "top" },
  { w: 900, h: 96, bias: "top" },
  { w: 680, h: 84, bias: "top" },
  { w: 400, h: 300, bias: "lowleft" },
  { w: 380, h: 190, bias: "top" },
  { w: 280, h: 170, bias: "top" },
  { w: 760, h: 84, bias: "top" },
  { w: 320, h: 170, bias: "top" },
  { w: 108, h: 460, bias: "left" },
  { w: 170, h: 400, bias: "mid" },
  { w: 280, h: 180, bias: "top" },
  { w: 180, h: 280, bias: "mid" },
  { w: 150, h: 340, bias: "right" },
  { w: 360, h: 150, bias: "top" },
  { w: 150, h: 300, bias: "right" }
];

function mat(color, opacity) {
  const transparent = opacity != null && opacity < 1;
  return new THREE.MeshBasicMaterial({
    color,
    transparent,
    opacity: transparent ? opacity : 1,
    depthWrite: !transparent,
    toneMapped: false
  });
}

function mesh(geo, material, x, y, z) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x || 0, y || 0, z || 0);
  return m;
}

function motif(span, build) {
  const group = new THREE.Group();
  group.visible = false;
  group.frustumCulled = false;
  const tick = build(group);
  return { group, span, tick };
}

function vine() {
  return motif({ w: 0.72, h: 1.25 }, (group) => {
    const stem = mesh(new THREE.CylinderGeometry(0.02, 0.035, 0.9, 6), mat(0x24543a), 0, -0.12, 0);
    group.add(stem);
    const leaves = [];
    for (let i = 0; i < 5; i += 1) {
      const leaf = mesh(new THREE.CircleGeometry(0.09, 8), mat(i % 2 ? 0x7dba6a : 0x2f6b45));
      leaf.position.set(i % 2 ? 0.12 : -0.12, -0.38 + i * 0.16, 0.02);
      group.add(leaf);
      leaves.push(leaf);
    }
    const spores = [];
    const dot = new THREE.SphereGeometry(0.035, 8, 6);
    for (let i = 0; i < 6; i += 1) {
      const s = mesh(dot, mat(0xf2d48a));
      group.add(s);
      spores.push(s);
    }
    return (t) => {
      leaves.forEach((leaf, i) => {
        const open = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.3 + i));
        leaf.scale.set(open, 0.55 + open * 0.5, 1);
        leaf.rotation.z = Math.sin(t * 0.8 + i) * 0.4;
      });
      spores.forEach((s, i) => {
        const u = (t * 0.18 + i / 6) % 1;
        s.position.set(Math.sin(u * 6 + i) * 0.16, -0.55 + u * 1.1, 0.04);
        s.scale.setScalar(0.4 + u);
      });
    };
  });
}

function windmill() {
  return motif({ w: 1.15, h: 1.2 }, (group) => {
    group.add(mesh(new THREE.CylinderGeometry(0.045, 0.07, 0.62, 8), mat(0x6b4a32), 0, -0.28, 0));
    group.add(mesh(new THREE.ConeGeometry(0.1, 0.12, 8), mat(0x8d3d32), 0, 0.08, 0));
    const rotor = new THREE.Group();
    rotor.position.y = 0.16;
    const bladeGeo = new THREE.BoxGeometry(0.07, 0.48, 0.02);
    const bladeMat = mat(0xf4efe4);
    for (let i = 0; i < 4; i += 1) {
      const pivot = new THREE.Group();
      pivot.rotation.z = (i / 4) * Math.PI * 2;
      const blade = mesh(bladeGeo, bladeMat, 0, 0.28, 0);
      pivot.add(blade);
      rotor.add(pivot);
    }
    const hub = mesh(new THREE.SphereGeometry(0.07, 12, 8), mat(0xe2b15a), 0, 0, 0.03);
    rotor.add(hub);
    group.add(rotor);
    return (t) => {
      rotor.rotation.z = t * 1.15;
    };
  });
}

function meteors() {
  return motif({ w: 3.3, h: 0.42 }, (group) => {
    const streaks = [];
    const geo = new THREE.BoxGeometry(0.42, 0.018, 0.01);
    const headGeo = new THREE.SphereGeometry(0.028, 8, 6);
    const body = mat(0xfff1d4);
    const head = mat(0xffe08a);
    for (let i = 0; i < 16; i += 1) {
      const s = mesh(geo, body);
      const h = mesh(headGeo, head);
      s.rotation.z = -0.35;
      group.add(s);
      group.add(h);
      streaks.push({ s, h, lane: (i / 16) * 0.34 - 0.17, off: i / 16, speed: 0.28 + (i % 4) * 0.05 });
    }
    return (t) => {
      streaks.forEach((item) => {
        const u = (t * item.speed + item.off) % 1;
        const x = -1.55 + u * 3.1;
        const y = item.lane + (1 - u) * 0.12;
        item.s.position.set(x, y, 0);
        item.s.scale.x = 0.35 + u * 1.3;
        item.h.position.set(x + 0.18, y + 0.05, 0.01);
      });
    };
  });
}

function balance() {
  return motif({ w: 2.2, h: 0.28 }, (group) => {
    const beam = mesh(new THREE.BoxGeometry(1.5, 0.03, 0.02), mat(0x243f36), 0, 0.05, 0);
    group.add(beam);
    const left = mesh(new THREE.SphereGeometry(0.055, 12, 8), mat(0x2f6b45), -0.62, -0.02, 0);
    const right = mesh(new THREE.SphereGeometry(0.055, 12, 8), mat(0xc4844a), 0.62, -0.02, 0);
    group.add(left, right);
    const stand = mesh(new THREE.BoxGeometry(0.03, 0.1, 0.02), mat(0x6b4a32), 0, 0.0, 0);
    group.add(stand);
    return (t) => {
      const tip = Math.sin(t * 0.9) * 0.07;
      beam.rotation.z = tip;
      left.position.y = -0.03 - tip * 0.45;
      right.position.y = -0.03 + tip * 0.45;
    };
  });
}

function seal() {
  return motif({ w: 1.15, h: 1.05 }, (group) => {
    const disc = mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 24), mat(0xf4efe4), 0, -0.28, 0);
    disc.rotation.x = Math.PI / 2;
    group.add(disc);
    const ring = mesh(new THREE.TorusGeometry(0.22, 0.012, 8, 28), mat(0xe2b15a), 0, -0.25, 0.02);
    group.add(ring);
    const press = mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.1, 16), mat(0x8d3d32), 0, 0.15, 0);
    press.rotation.x = Math.PI / 2;
    group.add(press);
    const ripple = mesh(new THREE.TorusGeometry(0.18, 0.01, 6, 28), mat(0x2f6b45, 0.85), 0, -0.24, 0.03);
    group.add(ripple);
    return (t) => {
      const cycle = (t * 0.32) % 1;
      const down = cycle < 0.35 ? cycle / 0.35 : cycle < 0.5 ? 1 : Math.max(0, 1 - (cycle - 0.5) / 0.5);
      press.position.y = 0.22 - down * 0.32;
      const rip = cycle < 0.45 ? 0 : (cycle - 0.45) / 0.55;
      ripple.scale.setScalar(0.4 + rip * 2.1);
      ripple.material.opacity = (1 - rip) * 0.85;
    };
  });
}

function twinHelix() {
  return motif({ w: 1.5, h: 0.85 }, (group) => {
    const warmGeo = new THREE.SphereGeometry(0.035, 8, 6);
    const coolGeo = new THREE.SphereGeometry(0.035, 8, 6);
    const warm = [];
    const cool = [];
    for (let i = 0; i < 16; i += 1) {
      const a = mesh(warmGeo, mat(0xe2b15a));
      const b = mesh(coolGeo, mat(0x3d7f8a));
      group.add(a, b);
      warm.push(a);
      cool.push(b);
    }
    return (t) => {
      warm.forEach((p, i) => {
        const a = t * 1.1 + i * 0.42;
        const y = (i / 15 - 0.5) * 0.7;
        p.position.set(Math.cos(a) * 0.28 - 0.32, y, Math.sin(a) * 0.08);
      });
      cool.forEach((p, i) => {
        const a = -t * 0.95 + i * 0.42;
        const y = (i / 15 - 0.5) * 0.7;
        p.position.set(Math.cos(a) * 0.28 + 0.32, y, Math.sin(a) * 0.08);
      });
    };
  });
}

function aperture() {
  return motif({ w: 1, h: 1 }, (group) => {
    const blades = [];
    const geo = new THREE.BoxGeometry(0.22, 0.045, 0.02);
    for (let i = 0; i < 8; i += 1) {
      const b = mesh(geo, mat(0x243f36));
      group.add(b);
      blades.push(b);
    }
    const sweep = mesh(new THREE.BoxGeometry(0.32, 0.015, 0.01), mat(0xe2b15a), 0.12, 0, 0.03);
    group.add(sweep);
    const core = mesh(new THREE.CircleGeometry(0.08, 16), mat(0xf4efe4), 0, 0, 0.01);
    group.add(core);
    return (t) => {
      const open = 0.12 + (0.5 + 0.5 * Math.sin(t * 0.8)) * 0.12;
      blades.forEach((b, i) => {
        const a = (i / 8) * Math.PI * 2 + t * 0.25;
        b.position.set(Math.cos(a) * open, Math.sin(a) * open, 0);
        b.rotation.z = a + 0.7;
      });
      sweep.rotation.z = t * 1.4;
      core.scale.setScalar(0.7 + (0.5 + 0.5 * Math.sin(t * 0.8)) * 0.5);
    };
  });
}

function fork() {
  return motif({ w: 2.15, h: 0.26 }, (group) => {
    const trunk = mesh(new THREE.BoxGeometry(0.55, 0.018, 0.02), mat(0x243f36), -0.55, 0, 0);
    const up = mesh(new THREE.BoxGeometry(0.5, 0.016, 0.02), mat(0x2f6b45), 0.05, 0.05, 0);
    const down = mesh(new THREE.BoxGeometry(0.5, 0.016, 0.02), mat(0xc4844a), 0.05, -0.05, 0);
    up.rotation.z = 0.18;
    down.rotation.z = -0.18;
    group.add(trunk, up, down);
    const pulseA = mesh(new THREE.SphereGeometry(0.03, 10, 8), mat(0xf2d48a));
    const pulseB = mesh(new THREE.SphereGeometry(0.03, 10, 8), mat(0xf2d48a));
    group.add(pulseA, pulseB);
    return (t) => {
      const u = (t * 0.4) % 1;
      if (u < 0.45) {
        const k = u / 0.45;
        pulseA.position.set(-0.8 + k * 0.5, 0, 0.02);
        pulseB.position.copy(pulseA.position);
      } else {
        const k = (u - 0.45) / 0.55;
        pulseA.position.set(-0.3 + k * 0.7, k * 0.08, 0.02);
        pulseB.position.set(-0.3 + k * 0.7, -k * 0.08, 0.02);
      }
    };
  });
}

function constellation() {
  return motif({ w: 1.35, h: 0.85 }, (group) => {
    const nodes = [
      [-0.5, 0.15], [0, 0.28], [0.48, 0.05], [-0.15, -0.22], [0.32, -0.2]
    ];
    const dots = nodes.map(([x, y]) => {
      const d = mesh(new THREE.SphereGeometry(0.045, 10, 8), mat(0x243f36), x, y, 0);
      group.add(d);
      return d;
    });
    const links = [[0, 1], [1, 2], [0, 3], [3, 4], [1, 4]];
    links.forEach(([a, b]) => {
      const dx = nodes[b][0] - nodes[a][0];
      const dy = nodes[b][1] - nodes[a][1];
      const len = Math.hypot(dx, dy);
      const line = mesh(new THREE.BoxGeometry(len, 0.012, 0.01), mat(0x8d3d32, 0.9));
      line.position.set((nodes[a][0] + nodes[b][0]) / 2, (nodes[a][1] + nodes[b][1]) / 2, -0.01);
      line.rotation.z = Math.atan2(dy, dx);
      group.add(line);
    });
    const pulse = mesh(new THREE.SphereGeometry(0.04, 8, 6), mat(0xf2d48a), nodes[0][0], nodes[0][1], 0.03);
    group.add(pulse);
    return (t) => {
      const travel = (t * 0.28) % links.length;
      const i = Math.floor(travel);
      const k = travel - i;
      const [a, b] = links[i];
      pulse.position.set(
        nodes[a][0] + (nodes[b][0] - nodes[a][0]) * k,
        nodes[a][1] + (nodes[b][1] - nodes[a][1]) * k,
        0.03
      );
      dots.forEach((d, n) => {
        const s = 0.85 + 0.25 * Math.sin(t * 1.6 + n);
        d.scale.setScalar(s);
      });
    };
  });
}

function columns() {
  return motif({ w: 0.42, h: 1.25 }, (group) => {
    const bars = [];
    const geo = new THREE.BoxGeometry(0.28, 0.08, 0.03);
    for (let i = 0; i < 5; i += 1) {
      const bar = mesh(geo, mat(i % 2 ? 0x2f6b45 : 0xe2b15a), 0, 0.42 - i * 0.2, 0);
      group.add(bar);
      bars.push(bar);
    }
    return (t) => {
      bars.forEach((bar, i) => {
        const w = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.15 + i * 0.7));
        bar.scale.x = w;
        bar.position.x = -0.16 + w * 0.14;
      });
    };
  });
}

function amplify() {
  return motif({ w: 0.7, h: 1.45 }, (group) => {
    const rings = [];
    for (let i = 0; i < 4; i += 1) {
      const ring = mesh(new THREE.TorusGeometry(0.12, 0.012, 8, 24), mat(i % 2 ? 0xe2b15a : 0x2f6b45, 0.9));
      group.add(ring);
      rings.push(ring);
    }
    return (t) => {
      rings.forEach((ring, i) => {
        const u = (t * 0.35 + i / 4) % 1;
        ring.position.y = 0.55 - u * 1.15;
        const s = 0.35 + u * 1.7;
        ring.scale.set(s, s * 0.55, 1);
        ring.material.opacity = 0.95 * (1 - u);
      });
    };
  });
}

function gyro() {
  return motif({ w: 1, h: 1 }, (group) => {
    const a = mesh(new THREE.TorusGeometry(0.38, 0.018, 8, 36), mat(0x243f36));
    const b = mesh(new THREE.TorusGeometry(0.28, 0.016, 8, 32), mat(0x2f6b45));
    const c = mesh(new THREE.TorusGeometry(0.18, 0.016, 8, 28), mat(0xe2b15a));
    const hub = mesh(new THREE.SphereGeometry(0.05, 10, 8), mat(0xf4efe4));
    group.add(a, b, c, hub);
    return (t) => {
      a.rotation.z = t * 0.6;
      b.rotation.x = t * 0.85;
      c.rotation.y = t * 1.1;
    };
  });
}

function regions() {
  return motif({ w: 0.7, h: 1.15 }, (group) => {
    const bars = [];
    for (let i = 0; i < 4; i += 1) {
      const bar = mesh(new THREE.BoxGeometry(0.12, 0.7, 0.03), mat(i % 2 ? 0xc4844a : 0x3d7f8a), 0, 0, 0);
      group.add(bar);
      bars.push(bar);
    }
    return (t) => {
      bars.forEach((bar, i) => {
        const wave = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.9 - i * 0.9));
        bar.scale.y = wave;
        bar.position.set(-0.24 + i * 0.16, -0.45 + wave * 0.35, 0);
      });
    };
  });
}

function settle() {
  return motif({ w: 0.85, h: 1.15 }, (group) => {
    const motes = [];
    const geo = new THREE.SphereGeometry(0.03, 8, 6);
    for (let i = 0; i < 12; i += 1) {
      const m = mesh(geo, mat(i % 2 ? 0xe2b15a : 0x2f6b45));
      group.add(m);
      motes.push(m);
    }
    const ring = mesh(new THREE.TorusGeometry(0.16, 0.012, 8, 24), mat(0x243f36), 0, 0, 0);
    group.add(ring);
    return (t) => {
      motes.forEach((m, i) => {
        const u = (t * 0.16 + i / 12) % 1;
        const ang = i * 0.9 + u * Math.PI * 2;
        const rad = 0.42 * (1 - u) + 0.16;
        m.position.set(Math.cos(ang) * rad * 0.7, 0.4 - u * 0.85, Math.sin(ang) * 0.05);
      });
      ring.rotation.z = t * 0.2;
    };
  });
}

function boundary() {
  return motif({ w: 1.7, h: 0.7 }, (group) => {
    const w = 1.45;
    const h = 0.48;
    const thick = 0.016;
    const frame = mat(0x243f36);
    group.add(mesh(new THREE.BoxGeometry(w, thick, 0.01), frame, 0, h / 2, 0));
    group.add(mesh(new THREE.BoxGeometry(w, thick, 0.01), frame, 0, -h / 2, 0));
    group.add(mesh(new THREE.BoxGeometry(thick, h, 0.01), frame, -w / 2, 0, 0));
    group.add(mesh(new THREE.BoxGeometry(thick, h, 0.01), frame, w / 2, 0, 0));
    const marker = mesh(new THREE.SphereGeometry(0.035, 8, 6), mat(0xe2b15a), -w / 2, h / 2, 0.02);
    group.add(marker);
    return (t) => {
      const u = (t * 0.18) % 1;
      const per = 2 * (w + h);
      let d = u * per;
      if (d < w) marker.position.set(-w / 2 + d, h / 2, 0.02);
      else if (d < w + h) marker.position.set(w / 2, h / 2 - (d - w), 0.02);
      else if (d < 2 * w + h) marker.position.set(w / 2 - (d - w - h), -h / 2, 0.02);
      else marker.position.set(-w / 2, -h / 2 + (d - 2 * w - h), 0.02);
    };
  });
}

function lanterns() {
  return motif({ w: 0.7, h: 1.2 }, (group) => {
    const lamps = [];
    for (let i = 0; i < 4; i += 1) {
      const lamp = mesh(new THREE.SphereGeometry(0.055, 10, 8), mat(0xffe2b0));
      const cord = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 4), mat(0xf4efe4));
      group.add(lamp, cord);
      lamps.push({ lamp, cord, x: -0.24 + (i % 2) * 0.32, off: i / 4 });
    }
    return (t) => {
      lamps.forEach((item) => {
        const u = (t * 0.14 + item.off) % 1;
        const y = -0.5 + u * 1.05;
        const x = item.x + Math.sin(t * 0.8 + item.off * 6) * 0.04;
        item.lamp.position.set(x, y, 0);
        item.cord.position.set(x, y + 0.1, 0);
        item.lamp.scale.setScalar(0.7 + u * 0.5);
      });
    };
  });
}

const BUILDERS = [
  vine, windmill, meteors, balance, seal, twinHelix, aperture, fork,
  constellation, columns, amplify, gyro, regions, settle, boundary, lanterns
];

export function createMotifs() {
  return BUILDERS.map((build) => build());
}

const RIFT_VS = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const RIFT_FS = `
precision highp float;
uniform float uTime;
uniform float uSide;
uniform float uFade;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
void main() {
  vec2 p = vUv * vec2(3.2, 2.4) + vec2(uTime * 0.12, uTime * 0.05);
  float n = noise(p) * 0.55 + noise(p * 2.2 + 3.0) * 0.3 + noise(p * 4.3) * 0.15;
  float edge = uSide < 0.0 ? (1.0 - vUv.x) : vUv.x;
  float tear = noise(vec2(vUv.y * 7.0, uTime * 0.35));
  float ragged = edge + (tear - 0.5) * 0.28;
  float alpha = smoothstep(0.0, 0.14, ragged) * uFade;
  vec3 deep = vec3(0.05, 0.035, 0.04);
  vec3 ember = vec3(0.72, 0.28, 0.1);
  vec3 col = mix(deep, ember, n);
  float seam = smoothstep(0.22, 0.0, ragged);
  col += vec3(1.0, 0.78, 0.48) * seam * 0.85;
  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}
`;

function riftMaterial(side) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSide: { value: side },
      uFade: { value: 1 }
    },
    vertexShader: RIFT_VS,
    fragmentShader: RIFT_FS,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false
  });
}

export function createRift() {
  const group = new THREE.Group();
  group.visible = false;
  const width = 15;
  const height = 18;
  const leftMat = riftMaterial(-1);
  const rightMat = riftMaterial(1);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 1, 1), leftMat);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 1, 1), rightMat);
  left.position.set(-width / 2, 0.2, 16);
  right.position.set(width / 2, 0.2, 16);
  left.frustumCulled = false;
  right.frustumCulled = false;
  group.add(left, right);

  const seam = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 13),
    new THREE.MeshBasicMaterial({
      color: 0xfff3d8,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    })
  );
  seam.position.set(0, 0.2, 16.2);
  seam.frustumCulled = false;
  group.add(seam);

  const count = 64;
  const shards = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.55, 0.1, 0.025),
    new THREE.MeshBasicMaterial({ color: 0xf0c9a0, transparent: true, opacity: 1, toneMapped: false }),
    count
  );
  shards.frustumCulled = false;
  group.add(shards);
  const bases = [];
  for (let i = 0; i < count; i += 1) {
    bases.push({
      ang: (i / count) * Math.PI * 2,
      rad: 0.3 + (i % 7) * 0.28,
      y: ((i * 17) % 50) / 50 * 6 - 3,
      z: 17 + (i % 5) * 1.3,
      spin: 0.4 + (i % 5) * 0.35,
      size: 0.45 + (i % 4) * 0.35
    });
  }
  const dummy = new THREE.Object3D();
  const light = new THREE.PointLight(0xffc48a, 0, 36);
  light.position.set(0, 0.4, 16.6);
  group.add(light);

  function update(u, time) {
    const open = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    const split = Math.max(0, (open - 0.08) / 0.92);
    const fade = u < 0.58 ? 1 : Math.max(0, 1 - (u - 0.58) / 0.22);
    group.visible = fade > 0.03 && u < 0.97;
    left.position.x = -width / 2 - split * 7.2;
    right.position.x = width / 2 + split * 7.2;
    left.rotation.y = split * 0.28;
    right.rotation.y = -split * 0.28;
    left.rotation.z = split * 0.05;
    right.rotation.z = -split * 0.04;
    leftMat.uniforms.uTime.value = time;
    rightMat.uniforms.uTime.value = time;
    leftMat.uniforms.uFade.value = fade;
    rightMat.uniforms.uFade.value = fade;
    seam.scale.x = 0.08 + split * 5.5;
    seam.material.opacity = fade * (0.15 + split * 0.75);
    light.intensity = fade * split * 6;
    shards.material.opacity = fade;
    for (let i = 0; i < count; i += 1) {
      const b = bases[i];
      const spread = b.rad + split * (2.5 + (i % 3));
      dummy.position.set(
        Math.cos(b.ang + time * b.spin) * spread,
        b.y + Math.sin(time * 0.6 + b.ang) * 0.35,
        b.z - split * 3.5
      );
      dummy.rotation.set(time * b.spin, time * 0.5, b.ang);
      dummy.scale.setScalar(b.size);
      dummy.updateMatrix();
      shards.setMatrixAt(i, dummy.matrix);
    }
    shards.instanceMatrix.needsUpdate = true;
  }

  return { group, update };
}
