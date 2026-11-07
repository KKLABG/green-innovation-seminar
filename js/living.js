/* Living rooms: a moving sky, breathing surfaces, and a large themed
   field around the text. Bright pieces stay in the sky, the sides, and
   the foreground so the writing keeps a calm ground behind it. */

import * as THREE from "../vendor/three.module.min.js";

const SKY = [
  { low: 0xf6ead8, high: 0xf3e2c8, accent: 0x7dba6a, style: 0 },
  { low: 0xd5e2ec, high: 0xeef6fb, accent: 0x9ec4de, style: 1 },
  { low: 0xf0c7a4, high: 0xc4623e, accent: 0xffd2a0, style: 2 },
  { low: 0xf4ecdf, high: 0xe7f0ea, accent: 0xc6a36a, style: 3 },
  { low: 0xe6d3b4, high: 0xd9c2a2, accent: 0xe8b86a, style: 4 },
  { low: 0xe4e0d8, high: 0xd5d8de, accent: 0x5f8f92, style: 5 },
  { low: 0xd5d8d2, high: 0xc5ccc6, accent: 0xe7eee8, style: 6 },
  { low: 0xe8eef0, high: 0xd5e4e8, accent: 0xb08a4f, style: 7 },
  { low: 0xe7eee6, high: 0xdfe8df, accent: 0x6f8f84, style: 8 },
  { low: 0xf7f1e4, high: 0xf3e6cf, accent: 0xd8c29a, style: 9 },
  { low: 0xd5dee6, high: 0xc5d2de, accent: 0x8aa0b4, style: 10 },
  { low: 0xe6e2d8, high: 0xd9d4c8, accent: 0x6e8f86, style: 11 },
  { low: 0xf3efe4, high: 0xe4eef2, accent: 0xd0b48a, style: 12 },
  { low: 0xf6f0e2, high: 0xf3e8d4, accent: 0xecd9b0, style: 13 },
  { low: 0xeadcc6, high: 0xe2d0b4, accent: 0xf0c48a, style: 14 },
  { low: 0x3a444c, high: 0x161d24, accent: 0xf0d2a4, style: 15 }
];

const FIELD = [0, 1, 6, 2, 2, 3, 8, 9, 4, 0, 2, 2, 5, 7, 2, 6];

const SKY_VS = `
varying vec3 vPos;
void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SKY_FS = `
precision highp float;
uniform vec3 uLow;
uniform vec3 uHigh;
uniform vec3 uAccent;
uniform float uTime;
uniform float uStyle;
uniform float uVeil;
varying vec3 vPos;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
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

float pattern(float style, vec3 dir, float t) {
  if (style < 0.5) return 0.5 + 0.5 * sin(dir.y * 5.0 + t * 0.55);
  if (style < 1.5) return noise(vec2(dir.x * 2.4 - t * 0.85, dir.y * 3.2));
  if (style < 2.5) {
    float s = noise(vec2(dir.x * 7.0 + dir.y * 16.0 - t * 2.4, dir.y * 2.0));
    return smoothstep(0.58, 0.9, s);
  }
  if (style < 3.5) {
    float a = noise(vec2(dir.x * 1.8 + t * 0.25, dir.y * 2.0));
    float b = noise(vec2(dir.x * 1.8 - t * 0.25, dir.y * 2.4 + 4.0));
    return abs(a - b);
  }
  if (style < 4.5) return pow(max(sin(dir.x * 9.0 + t * 0.45), 0.0), 5.0);
  if (style < 5.5) {
    float flow = 0.5 + 0.5 * sin(dir.y * 5.0 + sign(dir.x) * t * 0.6);
    return mix(flow, 1.0 - flow, step(0.0, dir.x));
  }
  if (style < 6.5) {
    float sweep = mix(-0.85, 0.85, fract(t * 0.07));
    return smoothstep(0.16, 0.0, abs(dir.x - sweep));
  }
  if (style < 7.5) {
    float a = smoothstep(0.07, 0.0, abs(dir.y - 0.32 - dir.x * 0.35));
    float b = smoothstep(0.07, 0.0, abs(dir.y - 0.32 + dir.x * 0.35));
    return max(a, b);
  }
  if (style < 8.5) return smoothstep(0.74, 0.95, noise(dir.xy * 16.0 + vec2(t * 0.04, 0.0)));
  if (style < 9.5) {
    float bars = step(0.78, 0.5 + 0.5 * sin(dir.x * 18.0));
    float rise = fract(dir.y * 1.6 - t * 0.18);
    return bars * rise;
  }
  if (style < 10.5) return 0.5 + 0.5 * sin(length(dir.xy) * 16.0 - t * 1.5);
  if (style < 11.5) return 0.5 + 0.5 * sin(atan(dir.y, dir.x) * 2.0 + t * 0.28);
  if (style < 12.5) return 0.5 + 0.5 * sin(dir.y * 11.0 + t * (0.35 + dir.x));
  if (style < 13.5) return 0.5 + 0.5 * sin(atan(dir.y, dir.x) * 3.0 - length(dir.xy) * 9.0 + t * 0.7);
  if (style < 14.5) {
    float a = atan(dir.y, dir.x);
    float head = mod(t * 0.45, 6.28318) - 3.14159;
    return smoothstep(0.35, 0.0, abs(a - head));
  }
  return smoothstep(0.78, 0.97, noise(dir.xy * 22.0 + vec2(0.0, t * 0.02)));
}

void main() {
  vec3 dir = normalize(vPos);
  float h = smoothstep(-0.25, 0.72, dir.y);
  vec3 base = mix(uLow, uHigh, h);
  float pat = pattern(uStyle, dir, uTime);
  vec3 lively = base + uAccent * pat * 0.55;
  vec3 soft = base + uAccent * pat * 0.07;
  float calm = smoothstep(0.62, 0.04, dir.y) * smoothstep(0.78, 0.22, abs(dir.x));
  vec3 col = mix(lively, soft, calm);
  vec3 sunDir = normalize(vec3(sin(uTime * 0.13), 0.42, cos(uTime * 0.13)));
  float sun = pow(max(dot(dir, sunDir), 0.0), 48.0);
  col += vec3(1.0, 0.86, 0.62) * sun * (1.0 - calm) * (uStyle > 14.5 ? 0.15 : 0.9);
  col = mix(col, vec3(0.07, 0.05, 0.047), uVeil);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

const WASH_VS = `
varying vec3 vP;
void main() {
  vP = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const WASH_FS = `
precision highp float;
uniform vec3 uColor;
uniform float uTime;
uniform float uSpeed;
varying vec3 vP;
void main() {
  float flow = sin(vP.x * 0.42 + vP.y * 0.22 + uTime * uSpeed);
  float flow2 = sin(vP.z * 0.5 - vP.x * 0.18 + uTime * uSpeed * 0.67);
  float wave = 0.5 + 0.5 * flow * 0.7 + 0.25 * flow2;
  vec3 cool = uColor * vec3(0.92, 0.95, 0.98);
  vec3 warm = uColor * vec3(1.06, 1.02, 0.94);
  gl_FragColor = vec4(mix(cool, warm, wave), 1.0);
  #include <colorspace_fragment>
}
`;

const POINT_VS = `
attribute float aSeed;
uniform float uTime;
uniform float uLimit;
uniform float uMode;
uniform float uSize;
varying float vA;
void main() {
  if (aSeed > uLimit) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    vA = 0.0;
    return;
  }
  float t = uTime;
  vec3 p = position;
  vA = 1.0;
  if (uMode < 0.5) {
    float u = fract(t * 0.07 + aSeed);
    p.y = -1.6 + u * 7.4;
    p.x += sin(t * 1.4 + aSeed * 12.0) * 0.28;
    vA = sin(u * 3.14159);
  } else if (uMode < 1.5) {
    float u = fract(t * 0.11 + aSeed);
    p.x = mix(-12.0, 12.0, u);
    p.y += sin(t * 2.2 + aSeed * 9.0) * 0.18;
    vA = sin(u * 3.14159);
  } else if (uMode < 2.5) {
    p.x += sin(t * 0.6 + aSeed * 8.0) * 0.35;
    p.y += cos(t * 0.45 + aSeed * 6.0) * 0.28;
    vA = 0.45 + 0.55 * (0.5 + 0.5 * sin(t * 1.5 + aSeed * 14.0));
  } else if (uMode < 3.5) {
    float u = fract(aSeed * 2.0 + t * 0.1);
    float side = aSeed > 0.5 ? 8.7 : -8.7;
    float ang = u * 6.28318 + t * (aSeed > 0.5 ? -1.0 : 1.0);
    p = vec3(side + cos(ang) * 1.15, -2.2 + u * 6.8, -0.8 + sin(ang) * 1.15);
    vA = 0.85;
  } else if (uMode < 4.5) {
    p.x += sin(t * 0.22 + aSeed * 10.0) * 0.35;
    p.y += cos(t * 0.18 + aSeed * 7.0) * 0.22;
    vA = 0.35 + 0.65 * (0.5 + 0.5 * sin(t * 2.6 + aSeed * 20.0));
  } else if (uMode < 5.5) {
    float u = fract(t * 0.06 + aSeed);
    p.y = 5.4 - u * 8.2;
    p.x += sin(t + aSeed * 9.0) * 0.45;
    vA = sin(u * 3.14159);
  } else if (uMode < 6.5) {
    float u = fract(t * 0.09 + aSeed);
    p.y = -2.4 + u * 5.5;
    p.x += sin(t * 1.8 + aSeed * 11.0) * 0.22;
    vA = sin(u * 3.14159);
  } else if (uMode < 7.5) {
    float u = fract(t * 0.05 + aSeed);
    float side = aSeed > 0.5 ? 8.3 : -8.3;
    float ang = aSeed * 14.0 + u * 6.28318;
    float rad = mix(2.6, 0.15, u);
    p = vec3(side + cos(ang) * rad, 0.4 + sin(aSeed * 9.0) * 2.4, -0.6 + sin(ang) * rad * 0.35);
    vA = 0.4 + 0.6 * (1.0 - u);
  } else if (uMode < 8.5) {
    float sweep = mix(-11.0, 11.0, fract(t * 0.08));
    vA *= smoothstep(2.4, 0.15, abs(p.x - sweep));
    p.y += sin(t + aSeed * 8.0) * 0.12;
  } else {
    float u = fract(t * 0.09 + aSeed);
    float dir = aSeed > 0.5 ? 1.0 : -1.0;
    p.x = dir * (1.2 + u * 10.5);
    p.y = 4.35 + u * 1.35 + sin(aSeed * 18.0) * 0.25;
    p.z = -3.4 + sin(aSeed * 9.0) * 0.6;
    vA = sin(u * 3.14159);
  }
  if (abs(p.x) < 5.7 && p.y > -2.0 && p.y < 3.7 && p.z > -2.7 && p.z < 1.7) vA = 0.0;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float att = clamp(14.0 / max(1.0, -mvPosition.z), 0.35, 1.6);
  gl_PointSize = uSize * vA * att;
}
`;

const POINT_FS = `
precision highp float;
uniform vec3 uColor;
varying float vA;
void main() {
  if (vA < 0.03) discard;
  float r = length(gl_PointCoord - vec2(0.5));
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.1, r) * vA;
  gl_FragColor = vec4(uColor, a);
  #include <colorspace_fragment>
}
`;

const STREAK_VS = `
attribute float aSeed;
uniform float uTime;
uniform float uLimit;
varying float vA;
varying vec3 vLocal;
void main() {
  if (aSeed > uLimit) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    vA = 0.0;
    return;
  }
  float u = fract(uTime * 0.16 + aSeed);
  vec3 p = position;
  p.y += (u - 0.5) * 7.5;
  vA = sin(u * 3.14159);
  vec4 local = instanceMatrix * vec4(p, 1.0);
  vLocal = local.xyz;
  vec4 mvPosition = modelViewMatrix * local;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const STREAK_FS = `
precision highp float;
uniform vec3 uColor;
varying float vA;
varying vec3 vLocal;
void main() {
  if (vA < 0.04) discard;
  if (abs(vLocal.x) < 5.5 && vLocal.y > -1.5 && vLocal.y < 3.55 && vLocal.z > -2.4 && vLocal.z < 1.5) discard;
  gl_FragColor = vec4(uColor, vA * 0.9);
  #include <colorspace_fragment>
}
`;

const SURF_VS = `
uniform float uTime;
uniform float uAmp;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  p.z += sin(p.x * 0.7 + uTime * 0.75) * uAmp + sin(p.y * 1.15 + uTime * 0.48) * uAmp * 0.55;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const SURF_FS = `
precision highp float;
uniform vec3 uColor;
uniform float uTime;
uniform float uAlpha;
varying vec2 vUv;
void main() {
  float n = 0.5 + 0.5 * sin(vUv.x * 16.0 + uTime * 1.5) * sin(vUv.y * 12.0 - uTime * 1.1);
  gl_FragColor = vec4(uColor * (0.82 + n * 0.28), uAlpha);
  #include <colorspace_fragment>
}
`;

function skyMaterial(index) {
  const look = SKY[index];
  return new THREE.ShaderMaterial({
    uniforms: {
      uLow: { value: new THREE.Color(look.low) },
      uHigh: { value: new THREE.Color(look.high) },
      uAccent: { value: new THREE.Color(look.accent) },
      uTime: { value: 0 },
      uStyle: { value: look.style },
      uVeil: { value: 0 }
    },
    vertexShader: SKY_VS,
    fragmentShader: SKY_FS,
    side: THREE.BackSide,
    fog: false,
    toneMapped: false
  });
}

function washMaterial(color, speed) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: color.clone() },
      uTime: { value: 0 },
      uSpeed: { value: speed }
    },
    vertexShader: WASH_VS,
    fragmentShader: WASH_FS,
    toneMapped: false
  });
}

function applyWash(mesh, speed) {
  const color = mesh.material && mesh.material.color ? mesh.material.color.clone() : new THREE.Color(0xf4efe6);
  const next = washMaterial(color, speed);
  if (mesh.material && mesh.material.dispose) mesh.material.dispose();
  mesh.material = next;
  return next;
}

function standard(color, rough, metal) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: rough == null ? 0.62 : rough,
    metalness: metal || 0
  });
}

function fieldMesh(index) {
  const mode = FIELD[index];
  const count = 460;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    seeds[i] = Math.random();
    const side = Math.random() < 0.5 ? -1 : 1;
    const edge = Math.random() < 0.55;
    const x = edge ? side * (6.4 + Math.random() * 5.2) : (Math.random() - 0.5) * 16;
    const y = mode === 1 ? (Math.random() < 0.5 ? 4.2 + Math.random() * 2.2 : -2.7 - Math.random() * 0.4) : -1 + Math.random() * 7;
    const z = -4.2 + Math.random() * 8;
    positions.set([x, y, z], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  const accent = new THREE.Color(SKY[index].accent);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLimit: { value: 1 },
      uMode: { value: mode },
      uSize: { value: mode === 4 ? 16 : mode === 2 ? 22 : 26 },
      uColor: { value: accent }
    },
    vertexShader: POINT_VS,
    fragmentShader: POINT_FS,
    transparent: true,
    depthWrite: false,
    toneMapped: false
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return points;
}

function meteorField() {
  const count = 150;
  const geo = new THREE.PlaneGeometry(0.07, 1.45);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i += 1) seeds[i] = Math.random();
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLimit: { value: 1 },
      uColor: { value: new THREE.Color(0xffe0b0) }
    },
    vertexShader: STREAK_VS,
    fragmentShader: STREAK_FS,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false
  });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i += 1) {
    const high = i < 110;
    const x = high ? (Math.random() - 0.5) * 16 : (Math.random() < 0.5 ? -1 : 1) * (8.2 + Math.random() * 2.4);
    const y = high ? 4.3 + Math.random() * 3.2 : -0.4 + Math.random() * 4.2;
    dummy.position.set(x, y, -4 + Math.random() * 6);
    dummy.rotation.z = high ? -0.7 - Math.random() * 0.25 : -1.15;
    dummy.scale.setScalar(0.75 + Math.random() * 0.7);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  return mesh;
}

function grassField(tint) {
  const count = 280;
  const geo = new THREE.PlaneGeometry(0.08, 0.62, 1, 3);
  geo.translate(0, 0.31, 0);
  const phases = new Float32Array(count);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAmp: { value: 0.55 },
      uColor: { value: new THREE.Color(tint) },
      uAlpha: { value: 1 }
    },
    vertexShader: `
      attribute float aPhase;
      uniform float uTime;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 1.7 + aPhase) * p.y * 0.85;
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform vec3 uColor;
      void main() {
        gl_FragColor = vec4(uColor, 1.0);
        #include <colorspace_fragment>
      }
    `,
    side: THREE.DoubleSide,
    toneMapped: false
  });
  for (let i = 0; i < count; i += 1) phases[i] = Math.random() * 6.28;
  geo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i += 1) {
    const x = -10.5 + (i % 28) * 0.78;
    const z = 3.1 + Math.floor(i / 28) * 0.42;
    dummy.position.set(x, -3.5, z);
    dummy.rotation.y = phases[i];
    dummy.scale.setScalar(0.85 + (i % 5) * 0.08);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  return mesh;
}

function surface(color, amp, alpha) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAmp: { value: amp },
      uColor: { value: new THREE.Color(color) },
      uAlpha: { value: alpha }
    },
    vertexShader: SURF_VS,
    fragmentShader: SURF_FS,
    transparent: alpha < 1,
    depthWrite: alpha >= 1,
    side: THREE.DoubleSide,
    toneMapped: false
  });
  return mat;
}

function mill(group, x, y, z, scale, headOnly) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.scale.setScalar(scale);
  if (!headOnly) {
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.18, 3.6, 6),
      standard(0x8d6a45, 0.72)
    );
    tower.position.y = 1.8;
    g.add(tower);
  }
  const rotor = new THREE.Group();
  rotor.position.y = headOnly ? 0 : 3.5;
  const geo = new THREE.BoxGeometry(0.14, 1.45, 0.045);
  geo.translate(0, 0.84, 0);
  const bladeMat = standard(0xf7f3ea, 0.5);
  for (let i = 0; i < 4; i += 1) {
    const blade = new THREE.Mesh(geo, bladeMat);
    blade.rotation.z = (i / 4) * Math.PI * 2;
    rotor.add(blade);
  }
  rotor.add(new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), standard(0xc6a36a, 0.4, 0.25)));
  g.add(rotor);
  group.add(g);
  return rotor;
}

function addClouds(group, index) {
  const color = new THREE.Color(SKY[index].low).lerp(new THREE.Color(0xffffff), 0.35);
  const puffs = [];
  for (let i = 0; i < 6; i += 1) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 12, 8),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: index === 15 ? 0.08 : 0.16, depthWrite: false })
    );
    puff.scale.set(2.1, 0.62, 1);
    group.add(puff);
    puffs.push(puff);
  }
  return puffs;
}

function addShafts(group, index) {
  const color = SKY[index].accent;
  const shafts = [];
  [[-10.2, 0.4, -2.4, -0.12], [10.2, 0.6, -2.8, 0.12]].forEach((p) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 5.2),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.07,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      })
    );
    mesh.position.set(p[0], p[1], p[2]);
    mesh.rotation.z = p[3];
    mesh.userData.baseZ = p[3];
    group.add(mesh);
    shafts.push(mesh);
  });
  return shafts;
}

function addHero(group, index) {
  if (index === 0) return vines(group);
  if (index === 1) return mills(group);
  if (index === 2) return meteors(group);
  if (index === 3) return balance(group);
  if (index === 4) return ripple(group);
  if (index === 6) return iris(group);
  if (index === 7) return ribbons(group);
  if (index === 8) return constellation(group);
  if (index === 9) return bars(group, 0xd8c29a, 0x8d6a45);
  if (index === 10) return rings(group);
  if (index === 11) return gimbal(group);
  if (index === 12) return terrain(group);
  if (index === 14) return perimeter(group);
  if (index === 15) return lanterns(group);
  return null;
}

function vines(group) {
  const grass = grassField(0x3e6b45);
  group.add(grass);
  const leaves = [];
  [-9.2, -8.3, 8.5, 9.4].forEach((x, n) => {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.06, 2.6, 5), standard(0x24543a, 0.8));
    stem.position.set(x, -2.1, -1.2 + n * 0.35);
    group.add(stem);
    for (let i = 0; i < 4; i += 1) {
      const leaf = new THREE.Mesh(
        new THREE.CircleGeometry(0.24, 7),
        standard(i % 2 ? 0x7dba6a : 0x2f6b45, 0.7)
      );
      leaf.position.set(x + (i % 2 ? 0.22 : -0.22), -3.05 + i * 0.62, stem.position.z + 0.04);
      group.add(leaf);
      leaves.push(leaf);
    }
  });
  return (t) => {
    grass.material.uniforms.uTime.value = t;
    leaves.forEach((leaf, i) => {
      const open = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 1.2 + i));
      leaf.scale.set(open, 0.7 + open * 0.35, 1);
      leaf.rotation.z = Math.sin(t * 0.8 + i) * 0.5;
    });
  };
}

function mills(group) {
  const grass = grassField(0x7f9a78);
  group.add(grass);
  const rotors = [];
  [[-9.5, -3.5, -2.2], [-9.15, -3.5, 0.1], [-9.6, -3.5, 2.2], [9.45, -3.5, -1.6], [9.2, -3.5, 0.8], [9.6, -3.5, 2.6]].forEach((p) => {
    rotors.push(mill(group, p[0], p[1], p[2], 1, false));
  });
  for (let i = 0; i < 4; i += 1) rotors.push(mill(group, -7.2 + i * 3.2, 6.55, -4.2, 0.42, true));
  return (t) => {
    grass.material.uniforms.uTime.value = t;
    rotors.forEach((rotor, i) => { rotor.rotation.z = t * (0.9 + (i % 5) * 0.22); });
  };
}

function meteors(group) {
  const mesh = meteorField();
  group.add(mesh);
  return (t, quality) => {
    mesh.material.uniforms.uTime.value = t;
    mesh.material.uniforms.uLimit.value = quality;
  };
}

function balance(group) {
  const rig = new THREE.Group();
  rig.position.set(0, 6.7, -4.2);
  rig.add(new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.06, 0.06), standard(0xc6a36a, 0.4, 0.3)));
  [-1.5, 1.5].forEach((x) => {
    const bob = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), standard(0xf7f1e6, 0.35));
    bob.position.set(x, -0.22, 0);
    rig.add(bob);
  });
  group.add(rig);
  return (t) => { rig.rotation.z = Math.sin(t * 0.65) * 0.24; };
}

function ripple(group) {
  const rings = [0, 1].map((n) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.02, 8, 28),
      new THREE.MeshBasicMaterial({ color: n ? 0xf0d2a0 : 0xc45a3a, transparent: true, opacity: 0.8, depthWrite: false })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(n ? 8.6 : -8.6, -3.48, 2.4);
    group.add(ring);
    return ring;
  });
  return (t) => {
    rings.forEach((ring, n) => {
      const u = (t * 0.22 + n * 0.45) % 1;
      const s = 0.5 + u * 5.2;
      ring.scale.set(s, s, 1);
      ring.material.opacity = (1 - u) * 0.8;
    });
  };
}

function iris(group) {
  const rig = new THREE.Group();
  rig.position.set(-8.6, 1.5, -0.8);
  const blades = [];
  for (let i = 0; i < 8; i += 1) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.95, 0.03), standard(0xe7ece6, 0.4, 0.2));
    blade.position.y = 0.55;
    const pivot = new THREE.Group();
    pivot.rotation.z = (i / 8) * Math.PI * 2;
    pivot.add(blade);
    rig.add(pivot);
    blades.push(blade);
  }
  group.add(rig);
  return (t) => {
    rig.rotation.z = t * 0.3;
    const open = 0.4 + Math.sin(t * 0.9) * 0.22;
    blades.forEach((blade) => { blade.position.y = 0.4 + open; });
  };
}

function ribbons(group) {
  const mats = [];
  [-1, 1].forEach((side) => {
    const mat = surface(side < 0 ? 0xb08a4f : 0x7ea0a8, 0.05, 0.78);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 0.85, 24, 1), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(side * 6.2, -3.5, 2.6);
    mesh.rotation.z = side * 0.35;
    group.add(mesh);
    mats.push(mat);
  });
  return (t) => mats.forEach((mat) => { mat.uniforms.uTime.value = t; });
}

function constellation(group) {
  const positions = new Float32Array(16 * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const line = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
    color: 0x2f6844, transparent: true, opacity: 0.75
  }));
  group.add(line);
  return (t) => {
    for (let i = 0; i < 8; i += 1) {
      const a = t * 0.18 + i * 0.7;
      positions.set([
        Math.sin(a) * 6.2, 4.55 + Math.cos(a * 1.4) * 0.7, -3.3,
        Math.sin(a + 0.55) * 6.4, 4.7 + Math.cos(a * 1.4 + 1.1) * 0.65, -3.3
      ], i * 6);
    }
    geo.attributes.position.needsUpdate = true;
  };
}

function bars(group, a, b) {
  const items = [];
  for (let i = 0; i < 10; i += 1) {
    const geo = new THREE.BoxGeometry(0.28, 1, 0.28);
    geo.translate(0, 0.5, 0);
    const mesh = new THREE.Mesh(geo, standard(i % 2 ? a : b, 0.55));
    const side = i < 5 ? -8.8 : 8.8;
    mesh.position.set(side, -3.5, -2.2 + (i % 5) * 1.05);
    group.add(mesh);
    items.push(mesh);
  }
  return (t) => {
    items.forEach((mesh, i) => {
      mesh.scale.y = 0.45 + (0.5 + 0.5 * Math.sin(t * 1.1 + i * 0.7)) * 2.4;
    });
  };
}

function rings(group) {
  const items = [];
  for (let i = 0; i < 6; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.018, 8, 36),
      new THREE.MeshBasicMaterial({ color: i % 2 ? 0xf0d7a4 : 0x8aa0b4, transparent: true, opacity: 0.8, depthWrite: false })
    );
    ring.position.set(i % 2 ? 8.5 : -8.5, -0.6 + (i % 3) * 1.5, -1.2);
    group.add(ring);
    items.push(ring);
  }
  return (t) => {
    items.forEach((ring, i) => {
      const u = (t * 0.22 + i / 6) % 1;
      const s = 0.6 + u * 2.8;
      ring.scale.setScalar(s);
      ring.material.opacity = (1 - u) * 0.85;
      ring.rotation.x = t * 0.2 + i;
    });
  };
}

function gimbal(group) {
  const rings = [0, 1, 2].map((i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.55 + i * 0.32, 0.035, 10, 40),
      standard(i === 1 ? 0xd7b48a : 0xe7e4da, 0.35, 0.45)
    );
    ring.position.set(i === 2 ? -8.6 : 8.7, 0.6, -0.4);
    group.add(ring);
    return ring;
  });
  const mat = surface(0x6e8f86, 0.06, 0.8);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(3.4, 32), mat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(0, -3.5, 4.3);
  group.add(pool);
  return (t) => {
    rings[0].rotation.x = t * 0.45;
    rings[1].rotation.y = t * 0.35;
    rings[2].rotation.z = t * 0.28;
    mat.uniforms.uTime.value = t;
  };
}

function terrain(group) {
  const mat = surface(0xd7c4a4, 0.32, 1);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(18, 7, 28, 14), mat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -3.42, 3.4);
  group.add(ground);
  const tickBars = bars(group, 0xc47a4a, 0x3e6b6a);
  return (t, quality) => {
    mat.uniforms.uTime.value = t;
    tickBars(t, quality);
  };
}

function perimeter(group) {
  const heads = [0, 1].map((n) => {
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 10),
      new THREE.MeshBasicMaterial({ color: n ? 0xfff1d2 : 0xe8b86a })
    );
    group.add(head);
    return head;
  });
  return (t) => {
    const u = (t * 0.07) % 1;
    const edge = u * 4;
    const along = edge % 1;
    const x = edge < 1 ? -8 + along * 16 : edge < 2 ? 8 : edge < 3 ? 8 - along * 16 : -8;
    const z = edge < 1 ? -2.2 : edge < 2 ? -2.2 + along * 6 : edge < 3 ? 3.8 : 3.8 - along * 6;
    heads[0].position.set(x, -3.35, z);
    heads[1].position.set(Math.sin(t * 0.35) * 7.2, 5.05, -3.6);
  };
}

function lanterns(group) {
  const lamps = [];
  for (let i = 0; i < 12; i += 1) {
    const rig = new THREE.Group();
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), new THREE.MeshStandardMaterial({
      color: 0xffe2b0, emissive: 0xffb45a, emissiveIntensity: 0.95, roughness: 0.35
    }));
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.22, 6), standard(0xf0d2a4, 0.5));
    cap.position.y = 0.18;
    rig.add(glow, cap);
    group.add(rig);
    lamps.push(rig);
  }
  return (t) => {
    lamps.forEach((rig, i) => {
      const u = (t * 0.06 + i / 12) % 1;
      const side = i % 2 ? 1 : -1;
      rig.position.set(
        side * (7.1 + (i % 3) * 0.7) + Math.sin(t * 0.8 + i) * 0.18,
        -2.6 + u * 8.2,
        -2.2 + (i % 5) * 0.7
      );
    });
  };
}

function swayLife(room, t) {
  room.traverse((obj) => {
    const life = obj.userData && obj.userData.life;
    if (life === "sway") {
      const s = 1 + Math.sin(t * 1.25 + obj.position.x * 1.4) * 0.08;
      obj.scale.setScalar(s);
    } else if (life === "glow") {
      const base = obj.userData.baseY != null ? obj.userData.baseY : obj.position.y;
      obj.userData.baseY = base;
      obj.position.y = base + Math.sin(t * 1.5 + obj.position.x * 2) * 0.07;
      if (obj.material && obj.material.emissiveIntensity != null) {
        obj.material.emissiveIntensity = 0.5 + Math.sin(t * 2.3 + obj.position.x) * 0.4;
      }
    }
  });
}

export function createHabitats(rooms) {
  return rooms.map((room, index) => {
    const shell = room.getObjectByName("shell");
    const timed = [];
    let sky = null;
    if (shell) {
      sky = skyMaterial(index);
      if (shell.material && shell.material.dispose) shell.material.dispose();
      shell.material = sky;
      shell.frustumCulled = false;
      timed.push(sky);
    }
    ["floor", "wall"].forEach((name, n) => {
      const mesh = room.getObjectByName(name);
      if (mesh) timed.push(applyWash(mesh, 0.26 + n * 0.14));
    });
    room.traverse((obj) => {
      if (obj.userData && obj.userData.band && obj.material) timed.push(applyWash(obj, 0.48 + Math.abs(obj.position.x) * 0.02));
    });
    const group = new THREE.Group();
    group.name = "habitat";
    room.add(group);
    const clouds = addClouds(group, index);
    const shafts = addShafts(group, index);
    const field = fieldMesh(index);
    group.add(field);
    const hero = addHero(group, index);
    return {
      setVeil(amount) {
        if (sky) sky.uniforms.uVeil.value = amount;
      },
      tick(t, quality) {
        const q = quality == null ? 1 : quality;
        timed.forEach((mat) => { mat.uniforms.uTime.value = t; });
        field.material.uniforms.uTime.value = t;
        field.material.uniforms.uLimit.value = q;
        shafts.forEach((shaft, i) => {
          shaft.rotation.z = shaft.userData.baseZ + Math.sin(t * 0.32 + i) * 0.16;
          shaft.material.opacity = 0.03 + (0.5 + 0.5 * Math.sin(t * 0.7 + i)) * 0.04;
        });
        clouds.forEach((puff, i) => {
          const speed = 0.02 + (index % 4) * 0.006;
          const u = (t * speed + i / clouds.length) % 1;
          puff.position.set(-9.5 + u * 19, 6.15 + Math.sin(t * 0.35 + i) * 0.18, -4.1);
        });
        if (hero) hero(t, q);
        swayLife(room, t);
      }
    };
  });
}

export function createFlight() {
  const group = new THREE.Group();
  const streaks = [];
  for (let i = 0; i < 20; i += 1) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.015, 0.55),
      new THREE.MeshBasicMaterial({
        color: 0xfff4e4,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    mesh.position.set((Math.random() - 0.5) * 3.4, (Math.random() - 0.5) * 1.8, -1.8 - Math.random() * 3.2);
    group.add(mesh);
    streaks.push(mesh);
  }
  group.visible = false;
  return {
    group,
    tick(t) {
      streaks.forEach((mesh, i) => {
        mesh.position.z += 0.09;
        if (mesh.position.z > -0.8) {
          mesh.position.z = -5.2;
          mesh.position.x = (Math.random() - 0.5) * 3.4;
          mesh.position.y = (Math.random() - 0.5) * 1.8;
        }
        mesh.material.opacity = 0.12 + 0.22 * (0.5 + 0.5 * Math.sin(t * 5 + i));
      });
    }
  };
}
