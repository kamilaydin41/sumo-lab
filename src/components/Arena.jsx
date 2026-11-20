import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function Arena({ running, speed, mode, resetKey, onTelemetry }) {
  const host = useRef(null);
  const api = useRef(null);
  const propsRef = useRef({ running, speed, mode, onTelemetry });
  useEffect(() => { propsRef.current = { running, speed, mode, onTelemetry }; }, [running, speed, mode, onTelemetry]);
  useEffect(() => {
    const el = host.current;
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#101a2b');
    const camera = new THREE.PerspectiveCamera(42, el.clientWidth / el.clientHeight, .1, 100);
    camera.position.set(7.5, 8.5, 10);
    const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(el.clientWidth, el.clientHeight); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace; el.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.target.set(0, 0, 0); controls.maxPolarAngle = Math.PI * .48;
    scene.add(new THREE.HemisphereLight(0xdceaff, 0x263044, 2.1));
    const light = new THREE.DirectionalLight(0xffffff, 2.4); light.position.set(-4, 9, 5); light.castShadow = true; scene.add(light);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: '#182438', roughness: .95 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -.16; floor.receiveShadow = true; scene.add(floor);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.0, .22, 96), new THREE.MeshStandardMaterial({ color: '#252b34', roughness: .88 })); ring.position.y = -.02; ring.receiveShadow = true; scene.add(ring);
    const dohyo = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, .08, 96), new THREE.MeshStandardMaterial({ color: '#e7e8e5', roughness: .92 })); dohyo.position.y = .13; dohyo.receiveShadow = true; scene.add(dohyo);
    const border = new THREE.Mesh(new THREE.TorusGeometry(4.27, .12, 12, 96), new THREE.MeshStandardMaterial({ color: '#e34842', roughness: .7 })); border.rotation.x = Math.PI/2; border.position.y = .19; scene.add(border);
    const startMat = new THREE.MeshStandardMaterial({ color: '#8c929c' });
    [-.42,.42].forEach(z => { const line = new THREE.Mesh(new THREE.BoxGeometry(.9,.012,.045), startMat); line.position.set(0,.18,z); scene.add(line); });
    const makeRobot = (color, accent) => { const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.BoxGeometry(1.05,.32,.9), new THREE.MeshStandardMaterial({ color, metalness:.28, roughness:.42 })); body.position.y=.43; body.castShadow=true; g.add(body); const wedge = new THREE.Mesh(new THREE.BoxGeometry(.96,.12,.34), new THREE.MeshStandardMaterial({ color:accent, metalness:.15, roughness:.5 })); wedge.position.set(0,.27,-.53); wedge.rotation.x=-.12; wedge.castShadow=true; g.add(wedge); const dome = new THREE.Mesh(new THREE.CylinderGeometry(.19,.22,.1,24), new THREE.MeshStandardMaterial({ color:'#141a24', metalness:.5 })); dome.position.set(0,.65,.08); g.add(dome); for (const x of [-.56,.56]) { const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.12,24), new THREE.MeshStandardMaterial({ color:'#090d13', roughness:.8 })); wheel.rotation.z=Math.PI/2; wheel.position.set(x,.32,.18); g.add(wheel); } const eye = new THREE.Mesh(new THREE.BoxGeometry(.23,.055,.035), new THREE.MeshBasicMaterial({ color:accent })); eye.position.set(0,.49,-.47); g.add(eye); scene.add(g); return g; };
    const player = makeRobot('#3978ed','#9ed3ff'); const rival = makeRobot('#e34f4f','#ffd0a1'); player.position.set(-1.35,.2,1.0); rival.position.set(1.35,.2,-1.0); rival.rotation.y=Math.PI;
    const grid = new THREE.GridHelper(40,40,'#26364c','#1e2b3e'); grid.position.y=-.15; scene.add(grid);
    let lastTelemetry=0;
    const state = { x:-1.35,z:1,angle:0,rx:1.35,rz:-1,ra:Math.PI, last:performance.now(), telemetry:{distance:0,speed:0,mode:'MANUEL'} };
    api.current = { state, player, rival };
    const resize = () => { const w=el.clientWidth,h=el.clientHeight; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h); }; const ro = new ResizeObserver(resize); ro.observe(el);
    let frame; const tick = (now) => { frame=requestAnimationFrame(tick); const dt=Math.min((now-state.last)/1000,.04); state.last=now;
      const props = propsRef.current;
      if (props.running) { const s=props.speed/100; if (props.mode==='AUTO') { const dx=state.rx-state.x,dz=state.rz-state.z; const target=Math.atan2(dx,dz); let d=((target-state.angle+Math.PI*3)%(Math.PI*2))-Math.PI; state.angle+=Math.max(-2.2*dt,Math.min(2.2*dt,d)); state.x+=Math.sin(state.angle)*s*2.2*dt; state.z+=Math.cos(state.angle)*s*2.2*dt; } else { if(keys.forward) {state.x+=Math.sin(state.angle)*s*2.8*dt;state.z+=Math.cos(state.angle)*s*2.8*dt;} if(keys.back){state.x-=Math.sin(state.angle)*s*1.8*dt;state.z-=Math.cos(state.angle)*s*1.8*dt;} if(keys.left)state.angle+=2.6*dt;if(keys.right)state.angle-=2.6*dt; }
        const dx=state.rx-state.x,dz=state.rz-state.z,dist=Math.hypot(dx,dz); if(dist<.88){state.x-=Math.sin(state.angle)*s*2.1*dt;state.z-=Math.cos(state.angle)*s*2.1*dt;state.rx+=Math.sin(state.ra)*.7*dt;state.rz+=Math.cos(state.ra)*.7*dt;} else {const a=Math.atan2(state.x-state.rx,state.z-state.rz);state.ra+=Math.sin(a-state.ra)*.9*dt;state.rx+=Math.sin(state.ra)*.45*dt;state.rz+=Math.cos(state.ra)*.45*dt;}
        const r=Math.hypot(state.x,state.z); if(r>3.95){state.x*=.985;state.z*=.985;} const rr=Math.hypot(state.rx,state.rz);if(rr>3.95){state.rx*=.985;state.rz*=.985;}
      }
      player.position.set(state.x,.2,state.z); player.rotation.y=state.angle; rival.position.set(state.rx,.2,state.rz); rival.rotation.y=state.ra;
      state.telemetry={distance:Math.max(0,Math.hypot(state.rx-state.x,state.rz-state.z)).toFixed(1),speed:props.running?Math.round(props.speed):0,mode:props.mode}; if(now-lastTelemetry>180){props.onTelemetry?.(state.telemetry);lastTelemetry=now;} controls.update(); renderer.render(scene,camera);
    }; const keys={forward:false,back:false,left:false,right:false};
    const keyMap={KeyW:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
    const down=e=>{if(keyMap[e.code]){keys[keyMap[e.code]]=true;e.preventDefault();}}; const up=e=>{if(keyMap[e.code])keys[keyMap[e.code]]=false;}; window.addEventListener('keydown',down);window.addEventListener('keyup',up);
    tick(performance.now());
    return ()=>{cancelAnimationFrame(frame);ro.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);controls.dispose();renderer.dispose();el.removeChild(renderer.domElement);scene.traverse(o=>{o.geometry?.dispose?.(); if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose?.();});};
  }, []);
  useEffect(()=>{if(api.current){Object.assign(api.current.state,{x:-1.35,z:1,angle:0,rx:1.35,rz:-1,ra:Math.PI});}},[resetKey]);
  return <div className="arena-canvas" ref={host}><div className="arena-hud"><span className="live-dot"/>{running?'SİMÜLASYON ÇALIŞIYOR':'SİMÜLASYON DURAKLATILDI'}<span className="hud-sep">·</span>3B DÖVÜŞ ARENASI</div><div className="arena-help">W A S D / Ok tuşları ile kontrol et <span>·</span> Fare ile kamerayı döndür</div></div>;
}
