import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const CLASS_PRESETS = {
  'Pico Sumo (50 g)': { radius: 1.45, robotScale: .56, maxSpeed: 1.55, mass: .05 },
  'Micro Sumo (100 g)': { radius: 1.75, robotScale: .67, maxSpeed: 1.85, mass: .10 },
  'Mini Sumo (500 g)': { radius: 2.5, robotScale: 1, maxSpeed: 2.15, mass: .50 },
  '1 Kg Sumo': { radius: 2.8, robotScale: 1.12, maxSpeed: 2.05, mass: 1 },
  'Mega Sumo (3 Kg)': { radius: 3.35, robotScale: 1.34, maxSpeed: 1.9, mass: 3 },
  'Açık Sınıf (5 Kg)': { radius: 3.7, robotScale: 1.48, maxSpeed: 1.75, mass: 5 },
  'LEGO Sumo (1 Kg)': { radius: 2.8, robotScale: 1.08, maxSpeed: 1.75, mass: 1 },
  'RC Sumo (500 g)': { radius: 2.5, robotScale: 1, maxSpeed: 2.2, mass: .5 },
};

function makeRobot(color, accent, bladeType, scale = 1, isRival = false) {
  const root = new THREE.Group();
  root.scale.setScalar(scale);
  const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: .42, roughness: .38 });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#111827', metalness: .25, roughness: .65 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: .18, metalness: .3 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(.92, .25, 1.02), bodyMat);
  body.position.y = .34; body.castShadow = true; root.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(.58, .07, .56), darkMat);
  top.position.set(0, .5, -.02); top.castShadow = true; root.add(top);

  const blade = new THREE.Group();
  const width = bladeType === 'Geniş kama' ? 1.08 : bladeType === 'Dar hassas kama' ? .72 : bladeType === 'Çift kademeli' ? .96 : .94;
  const length = bladeType === 'Uzun alçak kama' ? .98 : .76;
  const rearZ = .18, tipZ = rearZ + length;
  const y0 = .105, yRear = .30, yTip = bladeType === 'Çift kademeli' ? .18 : .145;
  const h = width / 2;
  const verts = [-h,y0,rearZ, h,y0,rearZ, -h,yRear,rearZ, h,yRear,rearZ, -h,.085,tipZ, h,.085,tipZ, -h,yTip,tipZ, h,yTip,tipZ];
  const idx = [];
  const face = (a,b,c,d) => idx.push(a,b,c,a,c,d);
  face(0,1,5,4); face(2,3,7,6); face(0,2,6,4); face(1,5,7,3); face(0,1,3,2); face(4,6,7,5);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(verts,3)); geo.setIndex(idx); geo.computeVertexNormals();
  const metal = new THREE.MeshStandardMaterial({ color: '#aeb9c5', metalness: .92, roughness: .22, side: THREE.DoubleSide });
  const wedge = new THREE.Mesh(geo, metal); wedge.castShadow = true; wedge.receiveShadow = true; blade.add(wedge);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(width,.022,.028), new THREE.MeshStandardMaterial({color:'#e5edf5',metalness:1,roughness:.16}));
  lip.position.set(0,yTip-.012,tipZ-.008); blade.add(lip);
  for (const x of [-h*.68,h*.68]) {
    const mount = new THREE.Mesh(new THREE.BoxGeometry(.09,.055,.22),accentMat); mount.position.set(x,.235,.28); blade.add(mount);
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.014,12),darkMat); screw.rotation.x=Math.PI/2; screw.position.set(x,.27,.31); blade.add(screw);
  }
  root.add(blade);
  for (const x of [-.49,.49]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.12,24),darkMat); wheel.rotation.z=Math.PI/2; wheel.position.set(x,.25,-.12); wheel.castShadow=true; root.add(wheel);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.125,16),accentMat); hub.rotation.z=Math.PI/2; hub.position.copy(wheel.position); root.add(hub);
  }
  // Five visible line sensors: three front, two rear. Their state is updated from the dohyo surface.
  const sensors = [];
  for (const [x,z] of [[-.31,.53],[0,.59],[.31,.53],[-.29,-.43],[.29,-.43]]) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(.043,12,10),new THREE.MeshBasicMaterial({color:'#35d7f4'}));
    mesh.position.set(x,.17,z); root.add(mesh); sensors.push({mesh,x,z});
  }
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.035,24),accentMat); beacon.position.set(0,.55,-.02); root.add(beacon);
  root.userData = { sensors, bladeType, label: isRival ? 'RAKİP' : 'OYUNCU' };
  return root;
}

function sensorWorld(robot, x, z, radius) {
  const c = Math.cos(robot.a), s = Math.sin(robot.a);
  const wx = robot.x + x*c + z*s;
  const wz = robot.z - x*s + z*c;
  return { x: wx, z: wz, edge: Math.hypot(wx,wz) > radius - .10 };
}

export default function Arena({ running, speed, mode, driveInput={ throttle: 0, steer: 0, throttleActive: false, steerActive: false }, resetKey, onTelemetry, robotColor='#3978ed', arenaSize='standard', bladeType='Standart kama', robotClass='Mini Sumo (500 g)' }) {
  const host = useRef(null);
  const api = useRef(null);
  const props = useRef({running,speed,mode,driveInput,onTelemetry,robotColor,arenaSize,bladeType,robotClass});
  useEffect(()=>{props.current={running,speed,mode,driveInput,onTelemetry,robotColor,arenaSize,bladeType,robotClass};},[running,speed,mode,driveInput,onTelemetry,robotColor,arenaSize,bladeType,robotClass]);

  useEffect(()=>{
    const el=host.current; if(!el) return;
    const scene=new THREE.Scene(); scene.background=new THREE.Color('#0c1422'); scene.fog=new THREE.Fog('#0c1422',14,32);
    const camera=new THREE.PerspectiveCamera(42,el.clientWidth/Math.max(1,el.clientHeight),.1,100); camera.position.set(7.4,8.2,9.2);
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false}); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); renderer.setSize(el.clientWidth,el.clientHeight); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1; el.appendChild(renderer.domElement);
    const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.dampingFactor=.07; controls.target.set(0,.1,0); controls.minDistance=4.5; controls.maxDistance=20; controls.maxPolarAngle=Math.PI*.48;
    scene.add(new THREE.HemisphereLight(0xddeaff,0x1d293b,2)); const key=new THREE.DirectionalLight(0xffffff,2.8); key.position.set(-4,10,6); key.castShadow=true; key.shadow.mapSize.set(2048,2048); scene.add(key); const rim=new THREE.PointLight(0x3b82f6,24,18); rim.position.set(5,3,-4); scene.add(rim);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(50,50),new THREE.MeshStandardMaterial({color:'#111c2d',roughness:.96})); floor.rotation.x=-Math.PI/2; floor.position.y=-.22; floor.receiveShadow=true; scene.add(floor); const grid=new THREE.GridHelper(50,50,'#243650','#1a293e'); grid.position.y=-.21; scene.add(grid);
    const preset=CLASS_PRESETS[props.current.robotClass]||CLASS_PRESETS['Mini Sumo (500 g)'];
    const maxRadius=preset.radius;
    const plinth=new THREE.Mesh(new THREE.CylinderGeometry(maxRadius+.22,maxRadius+.22,.22,112),new THREE.MeshStandardMaterial({color:'#252f40',metalness:.25,roughness:.72})); plinth.position.y=-.09; plinth.receiveShadow=true; plinth.castShadow=true; scene.add(plinth);
    const dohyo=new THREE.Mesh(new THREE.CylinderGeometry(maxRadius,maxRadius,.075,112),new THREE.MeshStandardMaterial({color:'#e6e8e8',roughness:.9})); dohyo.position.y=.055; dohyo.receiveShadow=true; scene.add(dohyo);
    const edge=new THREE.Mesh(new THREE.TorusGeometry(maxRadius-.14,.075,12,112),new THREE.MeshStandardMaterial({color:'#e44c4c',roughness:.52,emissive:'#5c1111',emissiveIntensity:.12})); edge.rotation.x=Math.PI/2; edge.position.y=.105; scene.add(edge);
    const startMat=new THREE.MeshStandardMaterial({color:'#a7adb6',roughness:.75}); [-.5,.5].forEach(z=>{const line=new THREE.Mesh(new THREE.BoxGeometry(.85,.012,.045),startMat);line.position.set(0,.1,z);scene.add(line);});
    const ringLights=new THREE.Mesh(new THREE.TorusGeometry(maxRadius+.25,.018,8,112),new THREE.MeshBasicMaterial({color:'#3b82f6',transparent:true,opacity:.5})); ringLights.rotation.x=Math.PI/2;ringLights.position.y=-.02;scene.add(ringLights);

    const player=makeRobot(props.current.robotColor,'#8fc2ff',props.current.bladeType,preset.robotScale,false);
    const rival=makeRobot('#d84b4b','#ffb36b','Geniş kama',preset.robotScale,true); scene.add(player,rival);
    const shadows=[]; for(const [color,op] of [['#3b82f6',.14],['#ef4444',.12]]){const m=new THREE.Mesh(new THREE.CircleGeometry(.68*preset.robotScale,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:op,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.105;scene.add(m);shadows.push(m);}
    const startState=()=>({x:-preset.radius*.34,z:-preset.radius*.29,a:.72,vx:0,vz:0,turn:0,rx:preset.radius*.34,rz:preset.radius*.29,ra:-2.42,rvx:0,rvz:0,rturn:0,collisions:0,pushes:0,playerEdge:false,rivalEdge:false,winner:null,finishReason:'',lastHit:0,elapsed:0});
    const state=startState(); const keys={forward:false,back:false,left:false,right:false};
    const keyMap={KeyW:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
    const down=e=>{if(keyMap[e.code]&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){keys[keyMap[e.code]]=true;e.preventDefault();}};
    const up=e=>{if(keyMap[e.code])keys[keyMap[e.code]]=false;}; window.addEventListener('keydown',down);window.addEventListener('keyup',up);
    const resize=()=>{const w=el.clientWidth,h=Math.max(1,el.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}; const ro=new ResizeObserver(resize);ro.observe(el);
    let frame,lastTelemetry=0,last=performance.now();
    const drive=(r,forward,turn,dt,maxSpeed)=>{r.turn=turn;r.a=wrapAngle(r.a+turn*2.45*dt);const fx=Math.sin(r.a),fz=Math.cos(r.a);const targetV=forward*maxSpeed;r.vx+=(fx*targetV-r.vx)*Math.min(1,dt*7);r.vz+=(fz*targetV-r.vz)*Math.min(1,dt*7);r.x+=r.vx*dt;r.z+=r.vz*dt;};
    const tick=now=>{
      frame=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.035);last=now;const p=props.current;
      if(player.children[0]?.material?.color)player.children[0].material.color.set(p.robotColor);
      const cls=CLASS_PRESETS[p.robotClass]||CLASS_PRESETS['Mini Sumo (500 g)'];
      if(p.running&&!state.winner){
        state.elapsed+=dt;const maxSpeed=cls.maxSpeed*(p.speed/100);
        // Edge sensors read the actual white dohyo boundary at five physical sensor positions.
        const playerSensors=player.userData.sensors.map(s=>sensorWorld(state,s.x*cls.robotScale,s.z*cls.robotScale,cls.radius));
        const rivalProxy={x:state.rx,z:state.rz,a:state.ra};
        const rivalSensors=rival.userData.sensors.map(s=>sensorWorld(rivalProxy,s.x*cls.robotScale,s.z*cls.robotScale,cls.radius));
        const pFront=playerSensors.slice(0,3).some(s=>s.edge),pRear=playerSensors.slice(3).some(s=>s.edge);
        const rFront=rivalSensors.slice(0,3).some(s=>s.edge),rRear=rivalSensors.slice(3).some(s=>s.edge);
        state.playerEdge=pFront||pRear;state.rivalEdge=rFront||rRear;
        let pF=0,pT=0;
        if(p.mode==='AUTO'||p.mode==='OTONOM'){
          const dx=state.rx-state.x,dz=state.rz-state.z,dist=Math.hypot(dx,dz);const desired=Math.atan2(dx,dz);const err=wrapAngle(desired-state.a);
          if(pFront){pF=-.88;pT=err>=0?-.95:.95;} else if(pRear){pF=.45;pT=err>=0?.7:-.7;} else if(dist<1.55){pF=1;pT=clamp(err*1.5,-1,1);} else {pF=.35;pT=err>.12?1:err<-.12?-1:.18;}
        } else {
          pF=(keys.forward?1:0)-(keys.back?1:0);pT=(keys.left?1:0)-(keys.right?1:0);
          // Browser virtual RC transmitter: independent throttle and steering sticks.
          if(p.driveInput?.throttleActive) pF=clamp(p.driveInput.throttle,-1,1);
          if(p.driveInput?.steerActive) pT=clamp(p.driveInput.steer,-1,1);
          // Standard USB/Bluetooth gamepad: left stick Y drives, left stick X steers.
          const pads=navigator.getGamepads?.()||[];const pad=Array.from(pads).find(Boolean);
          if(pad){const axisY=Math.abs(pad.axes?.[1]||0)>.12?-(pad.axes[1]):0;const axisX=Math.abs(pad.axes?.[0]||0)>.12?pad.axes[0]:0;if(Math.abs(axisY)>.12||Math.abs(axisX)>.12){pF=clamp(axisY,-1,1);pT=clamp(axisX,-1,1);}if(pad.buttons?.[7]?.pressed)pF=1;if(pad.buttons?.[6]?.pressed)pF=-1;}
        }
        // Opponent controller: edge avoidance has priority over target seeking and attack.
        const dx=state.x-state.rx,dz=state.z-state.rz,dist=Math.hypot(dx,dz),targetAngle=Math.atan2(dx,dz),err=wrapAngle(targetAngle-state.ra);
        let rF=0,rT=0;
        if(rFront){rF=-.92;rT=err>=0?-.9:.9;}else if(rRear){rF=.5;rT=err>=0?.7:-.7;}else if(dist>1.25){rF=.9;rT=clamp(err*1.65,-1,1);}else{rF=1;rT=clamp(err*1.2,-.55,.55);}
        drive(state,pF,pT,dt,maxSpeed);drive({get x(){return state.rx},set x(v){state.rx=v},get z(){return state.rz},set z(v){state.rz=v},get a(){return state.ra},set a(v){state.ra=v},get vx(){return state.rvx},set vx(v){state.rvx=v},get vz(){return state.rvz},set vz(v){state.rvz=v},set turn(v){state.rturn=v}},rF,rT,dt,cls.maxSpeed*.88);

        // Body-to-body contact. Front-facing wedge contact transfers more traction to the pushed robot.
        const cx=state.rx-state.x,cz=state.rz-state.z,centerDist=Math.hypot(cx,cz),contactDist=.78*cls.robotScale;
        if(centerDist<contactDist&&centerDist>.0001){
          const nx=cx/centerDist,nz=cz/centerDist,overlap=contactDist-centerDist;
          state.x-=nx*overlap*.52;state.z-=nz*overlap*.52;state.rx+=nx*overlap*.48;state.rz+=nz*overlap*.48;
          const pForward=state.vx*nx+state.vz*nz;const rForward=-(state.rvx*nx+state.rvz*nz);
          const pNose=Math.sin(state.a)*nx+Math.cos(state.a)*nz;
          const rNose=-(Math.sin(state.ra)*nx+Math.cos(state.ra)*nz);
          const pBlade=pNose>.48;const rBlade=rNose>.48;
          const pForce=Math.max(0,pForward)*(pBlade?1.8:1.08);const rForce=Math.max(0,rForward)*(rBlade?1.8:1.08);
          const total=cls.mass*2;
          const impulse=(pForce-rForce)*dt*2.6;
          state.rvx+=nx*impulse/Math.max(.15,cls.mass*.75);state.rvz+=nz*impulse/Math.max(.15,cls.mass*.75);
          state.vx-=nx*impulse/Math.max(.15,cls.mass*.75);state.vz-=nz*impulse/Math.max(.15,cls.mass*.75);
          // Blade-on-body alignment gives a short extra shove, rather than allowing meshes to pass through.
          if((pBlade&&pForward>.05)||(rBlade&&rForward>.05)){state.pushes++;}
          if(now-state.lastHit>280){state.collisions++;state.lastHit=now;}
          state.vx*=.985;state.vz*=.985;state.rvx*=.985;state.rvz*=.985;
        }
        // Surface friction and natural deceleration.
        const friction=Math.max(0,1-dt*.55);state.vx*=friction;state.vz*=friction;state.rvx*=friction;state.rvz*=friction;
        // A robot loses only after its chassis center leaves the dohyo; no artificial edge teleport/clamp.
        const outP=Math.hypot(state.x,state.z)>cls.radius+.06,outR=Math.hypot(state.rx,state.rz)>cls.radius+.06;
        if(outP||outR){state.winner=outP?'RAKİP KAZANDI':'SEN KAZANDIN';state.finishReason=outP?'Oyuncu robot dohyo dışına çıktı':'Rakip robot dohyo dışına çıktı';}
        // Update sensor lamps with the live readings.
        player.userData.sensors.forEach((s,i)=>s.mesh.material.color.set(playerSensors[i].edge?'#ff4d4d':'#35d7f4'));
        rival.userData.sensors.forEach((s,i)=>s.mesh.material.color.set(rivalSensors[i].edge?'#ff4d4d':'#35d7f4'));
      }
      player.position.set(state.x,0,state.z);player.rotation.y=state.a;rival.position.set(state.rx,0,state.rz);rival.rotation.y=state.ra;
      shadows[0].position.set(state.x,.105,state.z);shadows[1].position.set(state.rx,.105,state.rz);
      const distance=Math.hypot(state.rx-state.x,state.rz-state.z);
      if(now-lastTelemetry>140){p.onTelemetry?.({distance:distance.toFixed(2),speed:p.running&&!state.winner?p.speed:0,mode:p.mode,collisions:state.collisions,pushes:state.pushes,edge:state.playerEdge?'UYARI':'GÜVENLİ',lineSensors:state.playerEdge?'SINIR ALGILANDI':'ZEMİN',winner:state.winner,finishReason:state.finishReason,elapsed:state.elapsed.toFixed(1)});lastTelemetry=now;}
      controls.update();renderer.render(scene,camera);
    };
    api.current={state,startState};frame=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(frame);ro.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);controls.dispose();renderer.dispose();scene.traverse(o=>{o.geometry?.dispose?.();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose?.();});if(renderer.domElement.parentNode===el)el.removeChild(renderer.domElement);};
  },[robotClass]);

  useEffect(()=>{if(api.current){Object.assign(api.current.state,api.current.startState());}},[resetKey,robotClass]);
  return <div className="arena-canvas" ref={host}>
    <div className="arena-hud"><span className={`live-dot ${running?'active':''}`}/>{running?'SİMÜLASYON ÇALIŞIYOR':'SİMÜLASYON HAZIR'}<span className="hud-sep">·</span> RC KUMANDA / OTONOM / ÇİZGİ SENSÖRLERİ</div>
    <div className="arena-help"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> sürüş <span>·</span> Sensörler dohyo dışını algılar <span>·</span> Fare: kamera</div>
  </div>;
}
