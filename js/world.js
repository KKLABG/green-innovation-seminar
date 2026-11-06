/* Forest corridor: fog, lamps, and slow light. The paper slides live in the DOM. */
(function () {
  var world = {
    enabled: false,
    init: function () {},
    update: function () {},
    resize: function () {}
  };

  function boot() {
    if (!window.THREE) return;
    var canvas = document.getElementById("gl");
    if (!canvas) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      });
    } catch (err) {
      return;
    }

    var scene = new THREE.Scene();
    var fogColor = new THREE.Color(0x0d1f1a);
    scene.background = fogColor;
    scene.fog = new THREE.FogExp2(0x0d1f1a, 0.055);

    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 220);
    scene.add(camera);

    var rig = new THREE.Group();
    camera.add(rig);

    function beamTexture() {
      var c = document.createElement("canvas");
      c.width = 256;
      c.height = 640;
      var g = c.getContext("2d");
      g.clearRect(0, 0, 256, 640);
      var rg = g.createLinearGradient(128, 0, 128, 640);
      rg.addColorStop(0, "rgba(236,246,238,0.95)");
      rg.addColorStop(0.18, "rgba(214,232,220,0.35)");
      rg.addColorStop(1, "rgba(214,232,220,0)");
      g.fillStyle = rg;
      g.beginPath();
      g.moveTo(118, 0);
      g.lineTo(138, 0);
      g.lineTo(228, 640);
      g.lineTo(28, 640);
      g.closePath();
      g.fill();
      var mask = g.createLinearGradient(0, 0, 256, 0);
      mask.addColorStop(0, "rgba(0,0,0,0)");
      mask.addColorStop(0.5, "rgba(0,0,0,1)");
      mask.addColorStop(1, "rgba(0,0,0,0)");
      g.globalCompositeOperation = "destination-in";
      g.fillStyle = mask;
      g.fillRect(0, 0, 256, 640);
      var tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    function discTexture() {
      var c = document.createElement("canvas");
      c.width = 128;
      c.height = 128;
      var g = c.getContext("2d");
      var rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      rg.addColorStop(0, "rgba(255,255,255,1)");
      rg.addColorStop(0.35, "rgba(255,255,255,0.55)");
      rg.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = rg;
      g.fillRect(0, 0, 128, 128);
      var tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    var beamMap = beamTexture();
    var disc = discTexture();

    var shafts = [];
    var shaftSpots = [
      { x: 0.95, y: 1.15, z: -3.2, s: 1.7, rz: 0.18, op: 0.2 },
      { x: 1.45, y: 1.25, z: -3.6, s: 1.15, rz: -0.08, op: 0.12 },
      { x: -1.35, y: 1.05, z: -4.1, s: 1.35, rz: -0.22, op: 0.09 }
    ];
    shaftSpots.forEach(function (sp) {
      var mat = new THREE.MeshBasicMaterial({
        map: beamMap,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        opacity: sp.op,
        fog: false,
        side: THREE.DoubleSide
      });
      var mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 3.6), mat);
      mesh.position.set(sp.x, sp.y, sp.z);
      mesh.rotation.z = sp.rz;
      mesh.scale.set(sp.s, sp.s * 1.15, 1);
      rig.add(mesh);
      shafts.push({ mesh: mesh, base: sp.op, rz: sp.rz });
    });

    var pool = new THREE.Sprite(new THREE.SpriteMaterial({
      map: disc,
      color: 0xd7ebe0,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false
    }));
    pool.position.set(0, -0.05, -4.2);
    pool.scale.set(7.2, 4.6, 1);
    rig.add(pool);

    var floor = new THREE.Mesh(
      new THREE.PlaneGeometry(48, 180),
      new THREE.MeshBasicMaterial({ color: 0x081612 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -1.35, -50);
    scene.add(floor);

    var mist = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 160),
      new THREE.MeshBasicMaterial({
        color: 0xc9ddd2,
        transparent: true,
        opacity: 0.05,
        depthWrite: false
      })
    );
    mist.rotation.x = -Math.PI / 2;
    mist.position.set(0, -1.18, -46);
    scene.add(mist);

    var columnMat = new THREE.MeshBasicMaterial({
      map: disc,
      color: 0x9eb8aa,
      transparent: true,
      opacity: 0.045,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    var columnGeo = new THREE.PlaneGeometry(1.1, 4.2);
    for (var c = 0; c < 22; c++) {
      var side = c % 2 === 0 ? -1 : 1;
      var col = new THREE.Mesh(columnGeo, columnMat);
      col.position.set(side * (3.15 + (c % 3) * 0.28), 0.55, 8 - c * 4.1);
      col.rotation.y = side * 0.42;
      scene.add(col);
    }

    var spacing = 4.85;
    var lampGeo = new THREE.SphereGeometry(0.045, 14, 14);
    var haloMatShared = disc;
    var lamps = [];
    for (var i = 0; i < 20; i++) {
      [-1, 1].forEach(function (side, idx) {
        var mat = new THREE.MeshBasicMaterial({
          color: 0xe7f3ea,
          transparent: true,
          opacity: 0.35,
          fog: true
        });
        var lamp = new THREE.Mesh(lampGeo, mat);
        var z = 6 - i * spacing;
        lamp.position.set(side * 3.15, -0.95, z);
        scene.add(lamp);
        var halo = new THREE.Sprite(new THREE.SpriteMaterial({
          map: haloMatShared,
          color: 0xd5ecdf,
          transparent: true,
          opacity: 0.18,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          fog: true
        }));
        halo.position.copy(lamp.position);
        halo.scale.set(0.55, 0.55, 1);
        scene.add(halo);
        lamps.push({
          mesh: lamp,
          halo: halo,
          mat: mat,
          hmat: halo.material,
          index: i + idx * 0.15
        });
      });
    }

    function makeDust(count, size, color, opacity) {
      var positions = new Float32Array(count * 3);
      var seeds = new Float32Array(count);
      for (var n = 0; n < count; n++) {
        positions[n * 3] = (Math.random() - 0.5) * 14;
        positions[n * 3 + 1] = -1.1 + Math.random() * 5.4;
        positions[n * 3 + 2] = 12 - Math.random() * 92;
        seeds[n] = Math.random() * Math.PI * 2;
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      var mat = new THREE.PointsMaterial({
        map: disc,
        color: color,
        size: size,
        transparent: true,
        opacity: opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        fog: true
      });
      var points = new THREE.Points(geo, mat);
      scene.add(points);
      return { points: points, seeds: seeds, base: positions };
    }

    var dust = makeDust(280, 0.07, 0xf3f6f1, 0.55);
    var bokeh = makeDust(42, 0.28, 0xe4f0e6, 0.28);

    function resize() {
      var w = window.innerWidth;
      var h = window.innerHeight;
      var pr = Math.min(window.devicePixelRatio || 1, 1.6);
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    }

    world.enabled = true;
    world.resize = resize;
    world.update = function (state) {
      var progress = state.progress || 0;
      var intro = state.intro == null ? 1 : state.intro;
      var reduced = !!state.reduced;
      var t = state.time || 0;
      var px = state.pointerX || 0;
      var py = state.pointerY || 0;

      var camZ = 7.6 - progress * spacing;
      camera.position.set(px * 0.42, 0.48 + py * -0.18, camZ);
      camera.lookAt(px * 0.12, -0.05, camZ - 12);

      scene.fog.density = 0.046 + (1 - intro) * 0.055;

      shafts.forEach(function (sh, idx) {
        var sway = reduced ? 0 : Math.sin(t * 0.17 + idx) * 0.03;
        sh.mesh.rotation.z = sh.rz + sway;
        sh.mesh.material.opacity = sh.base * (0.25 + intro * 0.75);
      });
      pool.material.opacity = 0.05 + intro * 0.12;
      pool.position.x = px * 0.25;

      lamps.forEach(function (lamp) {
        var along = (7.6 - lamp.mesh.position.z) / spacing;
        var d = Math.abs(along - (progress + 0.15));
        var glow = Math.max(0, 1 - d * 0.55);
        lamp.mat.opacity = 0.12 + glow * 0.85;
        lamp.hmat.opacity = 0.05 + glow * 0.42;
        var s = 0.42 + glow * 1.15;
        lamp.halo.scale.set(s, s, 1);
      });

      if (!reduced) {
        drift(dust, t, 0.18);
        drift(bokeh, t, 0.1);
      }
      dust.points.material.opacity = 0.12 + intro * 0.48;
      bokeh.points.material.opacity = 0.06 + intro * 0.26;

      renderer.render(scene, camera);
    };

    resize();
    world.update({ progress: -1.4, intro: 0, time: 0, pointerX: 0, pointerY: 0 });
  }

  function drift(cloud, t, amp) {
    var attr = cloud.points.geometry.attributes.position;
    var arr = attr.array;
    var base = cloud.base;
    var seeds = cloud.seeds;
    for (var n = 0; n < seeds.length; n++) {
      arr[n * 3] = base[n * 3] + Math.sin(t * 0.15 + seeds[n]) * amp;
      arr[n * 3 + 1] = base[n * 3 + 1] + Math.sin(t * 0.22 + seeds[n] * 1.7) * amp * 0.65;
    }
    attr.needsUpdate = true;
  }

  world.init = boot;
  window.ImprintWorld = world;
})();
