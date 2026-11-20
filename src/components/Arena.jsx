import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const angleDelta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

function makeRobot(color, accent, label, bladeType = 'Standart kama') {
  const root = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: .42, roughness: .38 });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#111827', metalness: .25, roughness: .65 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: .22, metalness: .25 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(.92, .25, 1.02), bodyMat);
  body.position.y = .34; body.castShadow = true; root.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(.58, .07, .56), darkMat);
  top.position.set(0, .5, -.02); top.castShadow = true; root.add(top);

  // The robot's forward direction is +Z. The low wedge is deliberately mounted
  // at the front (not behind the chassis), with a sloped upper face and a thin lip.
  const bladeWidth = bladeType === 'Geniş kama' ? 1.04 : bladeType === 'Dar hassas kama' ? .78 : .96;
  const half = bladeWidth / 2;
  const rearZ = .18;
  const tipZ = bladeType === 'Çift kademeli' ? 1.02 : .96;
  const rearBottomY = .12;
  const rearTopY = .31;
  const tipBottomY = .092;
  const tipTopY = bladeType === 'Çift kademeli' ? .17 : .145;
  const bladeAssembly = new THREE.Group();
  const verts = [
    -half, rearBottomY, rearZ,   half, rearBottomY, rearZ,
    -half, rearTopY, rearZ,      half, rearTopY, rearZ,
    -half, tipBottomY, tipZ,     half, tipBottomY, tipZ,
    -half, tipTopY, tipZ,        half, tipTopY, tipZ,
  ];
  const indices = [];
  const quad = (a,b,c,d) => indices.push(a,b,c, a,c,d);
  // bottom, sloped top, left side, right side, rear wall, sharpened front lip
  quad(0,1,5,4); quad(2,3,7,6); quad(0,2,6,4);
  quad(1,5,7,3); quad(0,1,3,2); quad(4,6,7,5);
  const bladeGeometry = new THREE.BufferGeometry();
  bladeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  bladeGeometry.setIndex(indices);
  bladeGeometry.computeVertexNormals();
  const bladeMat = new THREE.MeshStandardMaterial({ color: '#9aa7b5', metalness: .88, roughness: .24, side: THREE.DoubleSide });
  const blade = new THREE.Mesh(bladeGeometry, bladeMat);
  blade.castShadow = true; blade.receiveShadow = true; bladeAssembly.add(blade);

  const lip = new THREE.Mesh(
    new THREE.BoxGeometry(bladeWidth, .025, .035),
    new THREE.MeshStandardMaterial({ color: '#dce5ee', metalness: .95, roughness: .18 })
  );
  lip.position.set(0, tipTopY - .005, tipZ - .012); lip.castShadow = true; bladeAssembly.add(lip);

  // Colored mounting brackets and visible fasteners make the blade assembly legible.
  for (const x of [-half * .68, half * .68]) {
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(.095, .055, .22), accentMat);
    bracket.position.set(x, .235, .27); bracket.castShadow = true; bladeAssembly.add(bracket);
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .012, 12), darkMat);
    bolt.rotation.x = Math.PI / 2; bolt.position.set(x, .27, .31); bladeAssembly.add(bolt);
  }

  root.add(bladeAssembly);
  root.userData.bladeAssembly = bladeAssembly;
  root.userData.lastBladeType = bladeType;

  for (const x of [-.49, .49]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .12, 24), darkMat);
    wheel.rotation.z = Math.PI / 2; wheel.position.set(x, .25, -.12); wheel.castShadow = true; root.add(wheel);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.065, .065, .125, 16), accentMat);
    hub.rotation.z = Math.PI / 2; hub.position.copy(wheel.position); root.add(hub);
  }
  // Front opponent/edge sensors sit immediately behind the blade line.
  for (const x of [-.28, 0, .28]) {
    const sensor = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 10), new THREE.MeshBasicMaterial({ color: '#62e6ff' }));
    sensor.position.set(x, .19, .56); root.add(sensor);
  }
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .035, 24), accentMat);
  beacon.position.set(0, .55, -.02); root.add(beacon);
  root.userData.label = label;
  root.userData.bladeType = bladeType;
  return root;
}

export default function Arena({ running, speed, mode, resetKey, onTelemetry, robotColor = '#3978ed', arenaSize = 'standard', bladeType = 'Standart kama' }) {
  const host = useRef(null);
  const api = useRef(null);
  const propsRef = useRef({ running, speed, mode, onTelemetry, robotColor, arenaSize, bladeType });
  useEffect(() => { propsRef.current = { running, speed, mode, onTelemetry, robotColor, arenaSize, bladeType }; }, [running, speed, mode, onTelemetry, robotColor, arenaSize, bladeType]);

  useEffect(() => {
    const el = host.current;
    if (!el) return undefined;
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#0c1422');
    scene.fog = new THREE.Fog('#0c1422', 13, 28);
    const camera = new THREE.PerspectiveCamera(42, el.clientWidth / Math.max(1, el.clientHeight), .1, 100);
    camera.position.set(6.7, 7.3, 8.5);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
    el.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = .07; controls.target.set(0, .15, 0);
    controls.minDistance = 5; controls.maxDistance = 15; controls.maxPolarAngle = Math.PI * .48;

    scene.add(new THREE.HemisphereLight(0xddeaff, 0x1d293b, 2.0));
    const key = new THREE.DirectionalLight(0xffffff, 2.8); key.position.set(-4, 9, 5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key);
    const rim = new THREE.PointLight(0x3b82f6, 22, 14); rim.position.set(5, 3, -4); scene.add(rim);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: '#111c2d', roughness: .96 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -.22; floor.receiveShadow = true; scene.add(floor);
    const grid = new THREE.GridHelper(40, 40, '#243650', '#1a293e'); grid.position.y = -.21; scene.add(grid);

    const radius = 2.5;
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.88, 2.88, .22, 96), new THREE.MeshStandardMaterial({ color: '#252f40', metalness: .25, roughness: .72 }));
    plinth.position.y = -.09; plinth.receiveShadow = true; plinth.castShadow = true; scene.add(plinth);
    const dohyo = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, .075, 96), new THREE.MeshStandardMaterial({ color: '#e6e8e8', roughness: .9 }));
    dohyo.position.y = .055; dohyo.receiveShadow = true; scene.add(dohyo);
    const edge = new THREE.Mesh(new THREE.TorusGeometry(radius - .14, .075, 12, 96), new THREE.MeshStandardMaterial({ color: '#e44c4c', roughness: .52, emissive: '#5c1111', emissiveIntensity: .12 }));
    edge.rotation.x = Math.PI / 2; edge.position.y = .105; scene.add(edge);
    const startMat = new THREE.MeshStandardMaterial({ color: '#a7adb6', roughness: .75 });
    [-.45, .45].forEach(z => { const line = new THREE.Mesh(new THREE.BoxGeometry(.72, .012, .045), startMat); line.position.set(0, .1, z); scene.add(line); });
    const ringLights = new THREE.Mesh(new THREE.TorusGeometry(2.92, .018, 8, 100), new THREE.MeshBasicMaterial({ color: '#3b82f6', transparent: true, opacity: .55 }));
    ringLights.rotation.x = Math.PI / 2; ringLights.position.y = -.02; scene.add(ringLights);

    const player = makeRobot('#3978ed', propsRef.current.robotColor, 'PLAYER', propsRef.current.bladeType);
    const rival = makeRobot('#d84b4b', '#ffb36b', 'RIVAL', 'Geniş kama');
    scene.add(player, rival);
    const shadowCircle = new THREE.Mesh(new THREE.CircleGeometry(.64, 32), new THREE.MeshBasicMaterial({ color: '#3b82f6', transparent: true, opacity: .13, depthWrite: false }));
    shadowCircle.rotation.x = -Math.PI / 2; shadowCircle.position.y = .105; scene.add(shadowCircle);
    const rivalShadow = new THREE.Mesh(new THREE.CircleGeometry(.64, 32), new THREE.MeshBasicMaterial({ color: '#ef4444', transparent: true, opacity: .11, depthWrite: false }));
    rivalShadow.rotation.x = -Math.PI / 2; rivalShadow.position.y = .105; scene.add(rivalShadow);

    const state = { x: -1.05, z: -.8, angle: 0.92, rx: 1.05, rz: .8, ra: -2.22, last: performance.now(), collisions: 0, edgeWarnings: 0 };
    const keys = { forward: false, back: false, left: false, right: false };
    const keyMap = { KeyW: 'forward', ArrowUp: 'forward', KeyS: 'back', ArrowDown: 'back', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right' };
    const down = e => { if (keyMap[e.code] && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) { keys[keyMap[e.code]] = true; e.preventDefault(); } };
    const up = e => { if (keyMap[e.code]) keys[keyMap[e.code]] = false; };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);

    api.current = { state, player, rival };
    const resize = () => { const w = el.clientWidth, h = Math.max(1, el.clientHeight); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); };
    const ro = new ResizeObserver(resize); ro.observe(el);
    let frame, lastTelemetry = 0;
    const tick = now => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min((now - state.last) / 1000, .04); state.last = now;
      const p = propsRef.current;
      if (p.robotColor) player.children[0].material.color.set(p.robotColor);
      if (p.bladeType !== player.userData.lastBladeType) {
        const bladeScale = p.bladeType === 'Geniş kama' ? [1.083, 1, 1] : p.bladeType === 'Dar hassas kama' ? [.8125, 1, 1] : p.bladeType === 'Çift kademeli' ? [1, 1.12, 1.06] : [1, 1, 1];
        player.userData.bladeAssembly.scale.set(...bladeScale);
        player.userData.lastBladeType = p.bladeType;
      }
      if (p.running) {
        const power = p.speed / 100;
        if (p.mode === 'AUTO') {
          const desired = Math.atan2(state.rx - state.x, state.rz - state.z);
          state.angle += clamp(angleDelta(state.angle, desired), -2.7 * dt, 2.7 * dt);
          state.x += Math.sin(state.angle) * power * 2.05 * dt;
          state.z += Math.cos(state.angle) * power * 2.05 * dt;
        } else {
          if (keys.forward) { state.x += Math.sin(state.angle) * power * 2.5 * dt; state.z += Math.cos(state.angle) * power * 2.5 * dt; }
          if (keys.back) { state.x -= Math.sin(state.angle) * power * 1.7 * dt; state.z -= Math.cos(state.angle) * power * 1.7 * dt; }
          if (keys.left) state.angle += 2.65 * dt;
          if (keys.right) state.angle -= 2.65 * dt;
        }
        const toPlayer = Math.atan2(state.x - state.rx, state.z - state.rz);
        state.ra += clamp(angleDelta(state.ra, toPlayer), -1.8 * dt, 1.8 * dt);
        state.rx += Math.sin(state.ra) * .75 * dt;
        state.rz += Math.cos(state.ra) * .75 * dt;

        const dx = state.rx - state.x, dz = state.rz - state.z, dist = Math.hypot(dx, dz);
        if (dist < .82) {
          state.collisions++;
          const push = ( .82 - dist ) * .55;
          state.rx += (dx / Math.max(dist, .001)) * push;
          state.rz += (dz / Math.max(dist, .001)) * push;
          state.x -= (dx / Math.max(dist, .001)) * push * .32;
          state.z -= (dz / Math.max(dist, .001)) * push * .32;
        }
        const pr = Math.hypot(state.x, state.z), rr = Math.hypot(state.rx, state.rz);
        if (pr > radius - .42) { state.edgeWarnings++; state.x = Math.cos(Math.atan2(state.z, state.x)) * (radius - .42); state.z = Math.sin(Math.atan2(state.z, state.x)) * (radius - .42); }
        if (rr > radius - .42) { state.rx = Math.cos(Math.atan2(state.rz, state.rx)) * (radius - .42); state.rz = Math.sin(Math.atan2(state.rz, state.rx)) * (radius - .42); }
      }
      player.position.set(state.x, 0, state.z); player.rotation.y = state.angle;
      rival.position.set(state.rx, 0, state.rz); rival.rotation.y = state.ra;
      shadowCircle.position.set(state.x, .105, state.z); rivalShadow.position.set(state.rx, .105, state.rz);
      const distance = Math.hypot(state.rx - state.x, state.rz - state.z);
      if (now - lastTelemetry > 160) {
        p.onTelemetry?.({ distance: distance.toFixed(2), speed: p.running ? p.speed : 0, mode: p.mode, collisions: state.collisions, edge: Math.hypot(state.x, state.z) > 1.85 ? 'UYARI' : 'GÜVENLİ' });
        lastTelemetry = now;
      }
      controls.update(); renderer.render(scene, camera);
    };
    tick(performance.now());
    return () => {
      cancelAnimationFrame(frame); ro.disconnect(); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up);
      controls.dispose(); renderer.dispose();
      scene.traverse(o => { o.geometry?.dispose?.(); if (Array.isArray(o.material)) o.material.forEach(m => m.dispose()); else o.material?.dispose?.(); });
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (api.current) Object.assign(api.current.state, { x: -1.05, z: -.8, angle: 0.92, rx: 1.05, rz: .8, ra: -2.22, collisions: 0, edgeWarnings: 0 });
  }, [resetKey]);

  return <div className="arena-canvas" ref={host}>
    <div className="arena-hud"><span className={`live-dot ${running ? 'active' : ''}`} />{running ? 'SİMÜLASYON ÇALIŞIYOR' : 'SİMÜLASYON HAZIR'}<span className="hud-sep">·</span>3B DOHYO / ÖN KAMA MONTAJI</div>
    <div className="arena-help"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> veya ok tuşlarıyla sür <span>·</span> Fareyle kamerayı döndür / yakınlaştır</div>
  </div>;
}
