import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const CLASS_PRESETS = {
  // Boyutlar mm'den Three.js birimine çevrilir: 1 birim = 200 mm.
  'Pico Sumo (50 g)': { robotScale:1, maxSpeed:1.45, mass:.05, width:.20, length:.20, height:.10 }, // 40x40x20 mm
  'Micro Sumo (100 g)': { robotScale:1, maxSpeed:1.65, mass:.10, width:.25, length:.25, height:.11 }, // 50x50x22 mm
  'Mini Sumo (500 g)': { robotScale:1, maxSpeed:2.05, mass:.50, width:.50, length:.50, height:.15 }, // 100x100x30 mm
  '1 Kg Sumo': { robotScale:1, maxSpeed:1.95, mass:1, width:.75, length:.75, height:.20 }, // 150x150x40 mm
  'Klasik 1 Kg Sumo': { robotScale:1, maxSpeed:1.95, mass:1, width:.75, length:.75, height:.20 },
  'Mega Sumo (3 Kg)': { robotScale:1, maxSpeed:1.8, mass:3, width:1, length:1, height:.25 }, // 200x200x50 mm
  'Açık Sınıf (5 Kg)': { robotScale:1, maxSpeed:1.65, mass:5, width:1.25, length:1.25, height:.30 }, // 250x250x60 mm
  'LEGO Sumo (1 Kg)': { robotScale:1, maxSpeed:1.7, mass:1, width:.75, length:.75, height:.225 }, // 150x150x45 mm
  'RC Sumo (500 g)': { robotScale:1, maxSpeed:2.05, mass:.5, width:.50, length:.50, height:.175 }, // 100x100x35 mm
};

function makeRobot(color, accent, bladeType, scale = 1, isRival = false, dimensions = { width: .92, length: 1.02, height: .25 }) {
  const root = new THREE.Group();
  root.scale.setScalar(scale);
  const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: .42, roughness: .38 });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#111827', metalness: .25, roughness: .65 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: .18, metalness: .3 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.length), bodyMat);
  body.position.y = .105 + dimensions.height / 2; body.castShadow = true; root.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(dimensions.width * .62, dimensions.width * .07, dimensions.length * .55), darkMat);
  top.position.set(0, .105 + dimensions.height + dimensions.width * .035, -.02); top.castShadow = true; root.add(top);

  const blade = new THREE.Group();
  const width = (bladeType === 'Geniş kama' ? 1.08 : bladeType === 'Dar hassas kama' ? .72 : bladeType === 'Çift kademeli' ? .96 : .94) * dimensions.width / .92;
  const length = (bladeType === 'Uzun alçak kama' ? .98 : .76) * dimensions.length / 1.02;
  const rearZ = dimensions.length * .18, tipZ = rearZ + length;
  const y0 = .105 + dimensions.width * .10, yRear = .105 + dimensions.width * .30, yTip = .105 + (bladeType === 'Çift kademeli' ? dimensions.width * .18 : dimensions.width * .145);
  const h = width / 2;
  const verts = [-h,y0,rearZ, h,y0,rearZ, -h,yRear,rearZ, h,yRear,rearZ, -h,.105+dimensions.width*.02,tipZ, h,.105+dimensions.width*.02,tipZ, -h,yTip,tipZ, h,yTip,tipZ];
  const idx = [];
  const face = (a,b,c,d) => idx.push(a,b,c,a,c,d);
  face(0,1,5,4); face(2,3,7,6); face(0,2,6,4); face(1,5,7,3); face(0,1,3,2); face(4,6,7,5);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(verts,3)); geo.setIndex(idx); geo.computeVertexNormals();
  const metal = new THREE.MeshStandardMaterial({ color: '#aeb9c5', metalness: .92, roughness: .22, side: THREE.DoubleSide });
  const wedge = new THREE.Mesh(geo, metal); wedge.castShadow = true; wedge.receiveShadow = true; blade.add(wedge);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(width,dimensions.width*.022,dimensions.width*.028), new THREE.MeshStandardMaterial({color:'#e5edf5',metalness:1,roughness:.16}));
  lip.position.set(0,yTip-dimensions.width*.012,tipZ-dimensions.width*.008); blade.add(lip);
  for (const x of [-h*.68,h*.68]) {
    const mount = new THREE.Mesh(new THREE.BoxGeometry(dimensions.width*.09,dimensions.width*.055,dimensions.length*.22),accentMat); mount.position.set(x,.105+dimensions.height*.78,dimensions.length*.28); blade.add(mount);
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(dimensions.width*.022,dimensions.width*.022,dimensions.width*.014,12),darkMat); screw.rotation.x=Math.PI/2; screw.position.set(x,.105+dimensions.height*.9,dimensions.length*.31); blade.add(screw);
  }
  root.add(blade);
  for (const x of [-dimensions.width*.53,dimensions.width*.53]) {
    const wheelRadius=dimensions.width*.17, wheelWidth=dimensions.width*.13;
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius,wheelRadius,wheelWidth,24),darkMat); wheel.rotation.z=Math.PI/2; wheel.position.set(x,.0925+wheelRadius,-dimensions.length*.12); wheel.castShadow=true; root.add(wheel);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius*.42,wheelRadius*.42,wheelWidth*1.04,16),accentMat); hub.rotation.z=Math.PI/2; hub.position.copy(wheel.position); root.add(hub);
  }
  // Five visible line sensors: three front, two rear. Their state is updated from the dohyo surface.
  const sensors = [];
  for (const [x,z] of [[-dimensions.width*.34,dimensions.length*.49],[0,dimensions.length*.54],[dimensions.width*.34,dimensions.length*.49],[-dimensions.width*.32,-dimensions.length*.42],[dimensions.width*.32,-dimensions.length*.42]]) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(dimensions.width*.045,12,10),new THREE.MeshBasicMaterial({color:'#35d7f4'}));
    mesh.position.set(x,.0925+dimensions.width*.045,z); root.add(mesh); sensors.push({mesh,x,z});
  }
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(dimensions.width*.07,dimensions.width*.07,dimensions.width*.025,24),accentMat); beacon.position.set(0,.105+dimensions.height+dimensions.width*.055,-.02); root.add(beacon);
  root.userData = { sensors, bladeType, label: isRival ? 'RAKİP' : 'OYUNCU', dimensions };
  return root;
}

function sensorWorld(robot, x, z, radius) {
  const c = Math.cos(robot.a), s = Math.sin(robot.a);
  const wx = robot.x + x*c + z*s;
  const wz = robot.z - x*s + z*c;
  return { x: wx, z: wz, edge: Math.hypot(wx,wz) > radius - .10 };
}

export default function Arena({ running, speed, mode, driveInput={ throttle: 0, steer: 0, throttleActive: false, steerActive: false }, arduinoCommand={left:0,right:0,enabled:false}, dipSwitches=[false,false,false], resetKey, onTelemetry, robotColor='#3978ed', arenaSize='mini', bladeType='Standart kama', robotClass='Mini Sumo (500 g)', totalWeight=595, arenaDiameterCm=80, playerHeading=90, rivalHeading=270, playerPosition={x:-.52,z:0}, rivalPosition={x:.52,z:0}, onPlacementChange }) {
  const host = useRef(null);
  const api = useRef(null);
  const props = useRef({running,speed,mode,driveInput,arduinoCommand,dipSwitches,onTelemetry,robotColor,arenaSize,bladeType,robotClass,totalWeight,arenaDiameterCm,playerHeading,rivalHeading,playerPosition,rivalPosition,onPlacementChange});
  useEffect(()=>{props.current={running,speed,mode,driveInput,arduinoCommand,dipSwitches,onTelemetry,robotColor,arenaSize,bladeType,robotClass,totalWeight,arenaDiameterCm,playerHeading,rivalHeading,playerPosition,rivalPosition,onPlacementChange};},[running,speed,mode,driveInput,arduinoCommand,dipSwitches,onTelemetry,robotColor,arenaSize,bladeType,robotClass,totalWeight,arenaDiameterCm,playerHeading,rivalHeading,playerPosition,rivalPosition,onPlacementChange]);

  useEffect(()=>{
    const el=host.current; if(!el) return;
    const scene=new THREE.Scene(); scene.background=new THREE.Color('#0c1422'); scene.fog=new THREE.Fog('#0c1422',14,32);
    const camera=new THREE.PerspectiveCamera(42,el.clientWidth/Math.max(1,el.clientHeight),.1,100); camera.position.set(7.4,8.2,9.2);
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false}); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); renderer.setSize(el.clientWidth,el.clientHeight); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1; el.appendChild(renderer.domElement);
    const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.dampingFactor=.07; controls.target.set(0,.1,0); controls.minDistance=2.8; controls.maxDistance=28; controls.maxPolarAngle=Math.PI*.48;
    scene.add(new THREE.HemisphereLight(0xddeaff,0x1d293b,2)); const key=new THREE.DirectionalLight(0xffffff,2.8); key.position.set(-4,10,6); key.castShadow=true; key.shadow.mapSize.set(2048,2048); scene.add(key); const rim=new THREE.PointLight(0x3b82f6,24,18); rim.position.set(5,3,-4); scene.add(rim);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(50,50),new THREE.MeshStandardMaterial({color:'#111c2d',roughness:.96})); floor.rotation.x=-Math.PI/2; floor.position.y=-.22; floor.receiveShadow=true; scene.add(floor); const grid=new THREE.GridHelper(50,50,'#243650','#1a293e'); grid.position.y=-.21; scene.add(grid);
    const preset=CLASS_PRESETS[props.current.robotClass]||CLASS_PRESETS['Mini Sumo (500 g)'];
    // 1 Three.js birimi = 20 cm; varsayılan Mini Sumo dohyo çapı 80 cm'dir.
    const maxRadius=Math.max(.75, (props.current.arenaDiameterCm || 80) / 40);
    camera.position.set(maxRadius * 3.0, maxRadius * 3.25, maxRadius * 3.7);
    const plinth=new THREE.Mesh(new THREE.CylinderGeometry(maxRadius+.22,maxRadius+.22,.22,112),new THREE.MeshStandardMaterial({color:'#252f40',metalness:.25,roughness:.72})); plinth.position.y=-.09; plinth.receiveShadow=true; plinth.castShadow=true; scene.add(plinth);
    const dohyo=new THREE.Mesh(new THREE.CylinderGeometry(maxRadius,maxRadius,.075,112),new THREE.MeshStandardMaterial({color:'#e6e8e8',roughness:.9})); dohyo.position.y=.055; dohyo.receiveShadow=true; scene.add(dohyo);
    const edge=new THREE.Mesh(new THREE.TorusGeometry(maxRadius-.14,.075,12,112),new THREE.MeshStandardMaterial({color:'#e44c4c',roughness:.52,emissive:'#5c1111',emissiveIntensity:.12})); edge.rotation.x=Math.PI/2; edge.position.y=.105; scene.add(edge);
    const startMat=new THREE.MeshStandardMaterial({color:'#a7adb6',roughness:.75}); [-.5,.5].forEach(z=>{const line=new THREE.Mesh(new THREE.BoxGeometry(.85,.012,.045),startMat);line.position.set(0,.1,z);scene.add(line);});
    const ringLights=new THREE.Mesh(new THREE.TorusGeometry(maxRadius+.25,.018,8,112),new THREE.MeshBasicMaterial({color:'#3b82f6',transparent:true,opacity:.5})); ringLights.rotation.x=Math.PI/2;ringLights.position.y=-.02;scene.add(ringLights);

    const player=makeRobot(props.current.robotColor,'#8fc2ff',props.current.bladeType,preset.robotScale,false,preset);
    const rival=makeRobot('#d84b4b','#ffb36b','Geniş kama',preset.robotScale,true,preset); scene.add(player,rival);
    const shadows=[]; for(const [color,op] of [['#3b82f6',.14],['#ef4444',.12]]){const m=new THREE.Mesh(new THREE.CircleGeometry(Math.max(preset.width,preset.length)*.72,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:op,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.105;scene.add(m);shadows.push(m);}
    const startState=()=>({x:(props.current.playerPosition?.x??-.52)*maxRadius,z:(props.current.playerPosition?.z??0)*maxRadius,a:(props.current.playerHeading??90)*Math.PI/180,vx:0,vz:0,turn:0,rx:(props.current.rivalPosition?.x??.52)*maxRadius,rz:(props.current.rivalPosition?.z??0)*maxRadius,ra:(props.current.rivalHeading??270)*Math.PI/180,rvx:0,rvz:0,rturn:0,collisions:0,pushes:0,playerRoll:0,playerPitch:0,rivalRoll:0,rivalPitch:0,playerRollRate:0,playerPitchRate:0,rivalRollRate:0,rivalPitchRate:0,lastPush:0,playerTipped:false,rivalTipped:false,playerEdge:false,rivalEdge:false,winner:null,finishReason:'',lastHit:0,elapsed:0});
    const state=startState(); const keys={forward:false,back:false,left:false,right:false};
    const keyMap={KeyW:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
    const down=e=>{if(keyMap[e.code]&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){keys[keyMap[e.code]]=true;e.preventDefault();}};
    const up=e=>{if(keyMap[e.code])keys[keyMap[e.code]]=false;}; window.addEventListener('keydown',down);window.addEventListener('keyup',up);
    // Sürükle-bırak yerleşimi: kamera düzlemine ışın gönderip dohyo düzlemindeki konumu bul.
    const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2(), dragPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-.105), hit=new THREE.Vector3();
    let dragging=null;
    const rotationStep=THREE.MathUtils.degToRad(6);
    const publishPlacement=()=>props.current.onPlacementChange?.({player:{x:state.x/maxRadius,z:state.z/maxRadius},rival:{x:state.rx/maxRadius,z:state.rz/maxRadius},playerHeading:((state.a*180/Math.PI)%360+360)%360,rivalHeading:((state.ra*180/Math.PI)%360+360)%360});
    const rotateDragged=(direction)=>{if(!dragging||props.current.running)return;const key=dragging==='player'?'a':'ra';state[key]=wrapAngle(state[key]+direction*rotationStep);publishPlacement();};
    const worldPoint=(event)=>{const rect=renderer.domElement.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);return raycaster.ray.intersectPlane(dragPlane,hit)?hit.clone():null;};
    const pointerDown=(event)=>{if(props.current.running)return;const point=worldPoint(event);if(!point)return;const dp=Math.hypot(point.x-state.x,point.z-state.z),dr=Math.hypot(point.x-state.rx,point.z-state.rz);const selectRadius=Math.max(.42,Math.hypot(preset.width,preset.length)*.72);if(Math.min(dp,dr)>selectRadius)return;dragging=dp<=dr?'player':'rival';controls.enabled=false;renderer.domElement.style.cursor='grabbing';renderer.domElement.setPointerCapture?.(event.pointerId);event.preventDefault();};
    const pointerMove=(event)=>{if(!dragging||props.current.running)return;const point=worldPoint(event);if(!point)return;const limit=Math.max(.12,maxRadius-Math.hypot(preset.width,preset.length)*.5-.09);const len=Math.hypot(point.x,point.z);if(len>limit){point.x*=limit/len;point.z*=limit/len;}if(dragging==='player'){state.x=point.x;state.z=point.z;state.vx=0;state.vz=0;}else{state.rx=point.x;state.rz=point.z;state.rvx=0;state.rvz=0;}publishPlacement();};
    const wheelRotate=(event)=>{if(!dragging||props.current.running)return;event.preventDefault();event.stopPropagation();rotateDragged(event.deltaY>0?1:-1);};
    const rotateKey=(event)=>{if(!dragging||props.current.running)return;if(event.code==='KeyQ'||event.code==='KeyE'){event.preventDefault();rotateDragged(event.code==='KeyQ'?-1:1);}};
    const pointerUp=(event)=>{if(!dragging)return;dragging=null;controls.enabled=true;renderer.domElement.style.cursor='grab';try{renderer.domElement.releasePointerCapture?.(event.pointerId);}catch{}};
    renderer.domElement.style.cursor='grab';renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointercancel',pointerUp);renderer.domElement.addEventListener('wheel',wheelRotate,{passive:false,capture:true});window.addEventListener('keydown',rotateKey);
    const resize=()=>{const w=el.clientWidth,h=Math.max(1,el.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}; const ro=new ResizeObserver(resize);ro.observe(el);
    let frame,lastTelemetry=0,last=performance.now();
    const drive=(r,forward,turn,dt,maxSpeed)=>{r.turn=turn;r.a=wrapAngle(r.a+turn*2.45*dt);const fx=Math.sin(r.a),fz=Math.cos(r.a);const targetV=forward*maxSpeed;r.vx+=(fx*targetV-r.vx)*Math.min(1,dt*7);r.vz+=(fz*targetV-r.vz)*Math.min(1,dt*7);r.x+=r.vx*dt;r.z+=r.vz*dt;};
    const tick=now=>{
      frame=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.035);last=now;const p=props.current;
      if(player.children[0]?.material?.color)player.children[0].material.color.set(p.robotColor);
      const cls=CLASS_PRESETS[p.robotClass]||CLASS_PRESETS['Mini Sumo (500 g)'];
      if(p.running&&!state.winner){
        state.elapsed+=dt;const configuredMass=Math.max(.03,(p.totalWeight||cls.mass*1000)/1000);const maxSpeed=cls.maxSpeed*(p.speed/100)*clamp(Math.sqrt(cls.mass/configuredMass),.72,1.12);
        // Edge sensors read the actual white dohyo boundary at five physical sensor positions.
        const playerSensors=player.userData.sensors.map(s=>sensorWorld(state,s.x,s.z,maxRadius));
        const rivalProxy={x:state.rx,z:state.rz,a:state.ra};
        const rivalSensors=rival.userData.sensors.map(s=>sensorWorld(rivalProxy,s.x,s.z,maxRadius));
        const pFront=playerSensors.slice(0,3).some(s=>s.edge),pRear=playerSensors.slice(3).some(s=>s.edge);
        const rFront=rivalSensors.slice(0,3).some(s=>s.edge),rRear=rivalSensors.slice(3).some(s=>s.edge);
        state.playerEdge=pFront||pRear;state.rivalEdge=rFront||rRear;
        let pF=0,pT=0;
        if(state.playerTipped){pF=0;pT=0;} else if(p.mode==='AUTO'||p.mode==='OTONOM'){
          const tactic=(p.dipSwitches||[]).reduce((n,on,i)=>n+(on?(1<<i):0),0);
          const aggressive=[1,3,5,7].includes(tactic), fastScan=[2,5,7].includes(tactic), cautious=[4,6].includes(tactic);
          const dx=state.rx-state.x,dz=state.rz-state.z,dist=Math.hypot(dx,dz);const desired=Math.atan2(dx,dz);const err=wrapAngle(desired-state.a);
          if(pFront){pF=cautious?-.98:-.88;pT=err>=0?-.95:.95;} else if(pRear){pF=.48;pT=err>=0?.75:-.75;} else if(dist<1.55){pF=aggressive?1:.88;pT=clamp(err*(aggressive?1.7:1.35),-1,1);} else {pF=fastScan?.28:(cautious?.22:.35);pT=err>.12?(fastScan?1:.78):err<-.12?(fastScan?-1:-.78):(fastScan?.42:.18);}
        } else if(p.mode==='ARDUINO') {
          const left=clamp(p.arduinoCommand?.left||0,-1,1), right=clamp(p.arduinoCommand?.right||0,-1,1);
          pF=(left+right)/2; pT=(right-left);
        } else {
          pF=(keys.forward?1:0)-(keys.back?1:0);pT=(keys.left?1:0)-(keys.right?1:0);
          // Browser virtual RC transmitter: independent throttle and steering sticks.
          if(p.driveInput?.throttleActive) pF=clamp(p.driveInput.throttle,-1,1);
          if(p.driveInput?.steerActive) pT=clamp(p.driveInput.steer,-1,1);
          // Standard USB/Bluetooth gamepad: left stick Y drives, left stick X steers.
          const pads=navigator.getGamepads?.()||[];const pad=Array.from(pads).find(Boolean);
          if(pad){const axisY=Math.abs(pad.axes?.[1]||0)>.12?-(pad.axes[1]):0;const axisX=Math.abs(pad.axes?.[0]||0)>.12?pad.axes[0]:0;if(Math.abs(axisY)>.12||Math.abs(axisX)>.12){pF=clamp(axisY,-1,1);pT=clamp(axisX,-1,1);}if(pad.buttons?.[7]?.pressed)pF=1;if(pad.buttons?.[6]?.pressed)pF=-1;}
        }
        // Arduino sketch sensor bridge: A0-A4 edge, D2/D3/D11 opponent, D12/D13/A5 DIP.
        if(p.mode==='ARDUINO' && now-(state.lastArduinoSensor||0)>35){
          const rel=wrapAngle(Math.atan2(state.rx-state.x,state.rz-state.z)-state.a);
          const opponentVisible=Math.hypot(state.rx-state.x,state.rz-state.z)<1.9;
          const sensors={edge:playerSensors.map(v=>v.edge),opponent:[opponentVisible&&rel<-.22,opponentVisible&&Math.abs(rel)<=.42,opponentVisible&&rel>.22]};
          window.parent.postMessage({type:'SUMO_SENSOR_DATA',sensors},'*'); state.lastArduinoSensor=now;
        }
        // Opponent controller: edge avoidance has priority over target seeking and attack.
        const dx=state.x-state.rx,dz=state.z-state.rz,dist=Math.hypot(dx,dz),targetAngle=Math.atan2(dx,dz),err=wrapAngle(targetAngle-state.ra);
        let rF=0,rT=0;
        if(state.rivalTipped){rF=0;rT=0;}else if(rFront){rF=-.92;rT=err>=0?-.9:.9;}else if(rRear){rF=.5;rT=err>=0?.7:-.7;}else if(dist>1.25){rF=.9;rT=clamp(err*1.65,-1,1);}else{rF=1;rT=clamp(err*1.2,-.55,.55);}
        const autoTactic=(p.dipSwitches||[]).reduce((n,on,i)=>n+(on?(1<<i):0),0);
        const playerSpeedScale=(p.mode==='AUTO'||p.mode==='OTONOM')?([1,3,5,7].includes(autoTactic)?1.08:([4,6].includes(autoTactic)?.88:1)):1;
        drive(state,pF,pT,dt,maxSpeed*playerSpeedScale);drive({get x(){return state.rx},set x(v){state.rx=v},get z(){return state.rz},set z(v){state.rz=v},get a(){return state.ra},set a(v){state.ra=v},get vx(){return state.rvx},set vx(v){state.rvx=v},get vz(){return state.rvz},set vz(v){state.rvz=v},set turn(v){state.rturn=v}},rF,rT,dt,cls.maxSpeed*.88);

        // Yönelimli dikdörtgen gövde çarpışması (OBB/SAT): robotlar birbirinin içinden geçemez.
        const axes = (angle) => [{x:Math.cos(angle),z:-Math.sin(angle)},{x:Math.sin(angle),z:Math.cos(angle)}];
        const projectRadius = (axis, angle, halfW, halfL) => {
          const right={x:Math.cos(angle),z:-Math.sin(angle)}, forward={x:Math.sin(angle),z:Math.cos(angle)};
          return Math.abs(axis.x*right.x+axis.z*right.z)*halfW + Math.abs(axis.x*forward.x+axis.z*forward.z)*halfL;
        };
        // Çarpışma hacmi şasi + öne uzanan kama alanını kapsar; kama rakibin gövdesinin içinden görsel olarak geçmez.
        const pBladeExt=.43*(preset.length/1.02)*preset.robotScale;
        const rBladeExt=pBladeExt;
        const pForwardX=Math.sin(state.a),pForwardZ=Math.cos(state.a);
        const rForwardX=Math.sin(state.ra),rForwardZ=Math.cos(state.ra);
        const pCenterX=state.x+pForwardX*pBladeExt*.5,pCenterZ=state.z+pForwardZ*pBladeExt*.5;
        const rCenterX=state.rx+rForwardX*rBladeExt*.5,rCenterZ=state.rz+rForwardZ*rBladeExt*.5;
        const dxBody=rCenterX-pCenterX,dzBody=rCenterZ-pCenterZ;
        const pHalfW=preset.width*preset.robotScale*.5, pHalfL=(preset.length*preset.robotScale+pBladeExt)*.5;
        const rHalfW=pHalfW, rHalfL=(preset.length*preset.robotScale+rBladeExt)*.5;
        const candidates=[...axes(state.a),...axes(state.ra)];
        let minOverlap=Infinity, collisionNormal=null;
        for(const axis of candidates){
          const distance=Math.abs(dxBody*axis.x+dzBody*axis.z);
          const overlap=projectRadius(axis,state.a,pHalfW,pHalfL)+projectRadius(axis,state.ra,rHalfW,rHalfL)-distance;
          if(overlap<=0){minOverlap=-1;break;}
          if(overlap<minOverlap){minOverlap=overlap;collisionNormal={...axis};if(dxBody*axis.x+dzBody*axis.z<0){collisionNormal.x*=-1;collisionNormal.z*=-1;}}
        }
        if(minOverlap>0&&collisionNormal){
          const nx=collisionNormal.x,nz=collisionNormal.z;
          // Temas düzeltmesi: iki OBB gövde birbirinin içine geçmez; düzeltme kontrollüdür.
          const separation=Math.max(.001,minOverlap+.003);
          state.x-=nx*separation*.5;state.z-=nz*separation*.5;
          state.rx+=nx*separation*.5;state.rz+=nz*separation*.5;
          const pForward=state.vx*nx+state.vz*nz;
          const rForward=-(state.rvx*nx+state.rvz*nz);
          const pNose=Math.sin(state.a)*nx+Math.cos(state.a)*nz;
          const rNose=-(Math.sin(state.ra)*nx+Math.cos(state.ra)*nz);
          const pMass=Math.max(.05,(p.totalWeight||preset.mass*1000)/1000);
          const rMass=preset.mass;
          const relative=(state.vx-state.rvx)*nx+(state.vz-state.rvz)*nz;
          const closingSpeed=Math.max(0,relative);
          // Sumo dohyo'sunda darbeler çoğunlukla elastik sekme değil, lastik tutuşuyla itiş üretir.
          if(closingSpeed>0){
            const restitution=.035;
            const impulse=(1+restitution)*closingSpeed/(1/pMass+1/rMass);
            state.vx-=impulse*nx/pMass;state.vz-=impulse*nz/pMass;
            state.rvx+=impulse*nx/rMass;state.rvz+=impulse*nz/rMass;
          }
          // Kama ancak robot gerçekten öne bakıyor ve rakibe doğru ilerliyorsa altına girmiş sayılır.
          // Yalnızca kafa kafaya temas etmek takla oluşturmaz.
          const pBladeFactor=p.bladeType==='Uzun alçak kama'?1.18:p.bladeType==='Geniş kama'?1.08:p.bladeType==='Çift kademeli'?1.0:p.bladeType==='Dar hassas kama'?.62:.88;
          const rBladeFactor=1.05;
          const pWedge=pNose>.82&&pForward>.42&&p.bladeType!=='Dar hassas kama';
          const rWedge=rNose>.82&&rForward>.42;
          // Devrilme eşiği: düşük ağırlık merkezi ve geniş tekerlek izi dengeyi artırır.
          // 1 simülasyon birimi = 20 cm; CoM gövde yüksekliğinin yaklaşık %38'i kabul edilir.
          const comHeightM=preset.height*.20*.38;
          const supportHalfM=preset.length*.20*.34;
          const vulnerability=clamp(comHeightM/Math.max(.001,supportHalfM*.72),.22,.82);
          const liftDriveP=pWedge?clamp((pForward-.42)*2.0,0,1.8)*pBladeFactor:0;
          const liftDriveR=rWedge?clamp((rForward-.42)*2.0,0,1.8)*rBladeFactor:0;
          // Kama altına girdikçe hedefin ön desteği boşalır; eğim kademeli birikir.
          // Düşük hızlı sürtünme/temas veya düz çarpışma tek başına takla attırmaz.
          if(liftDriveP>0&&!state.rivalTipped){
            state.rivalPitchRate+=liftDriveP*vulnerability*2.15*dt;
            state.playerPitchRate-=liftDriveP*.035*dt;
          }
          if(liftDriveR>0&&!state.playerTipped){
            state.playerPitchRate-=liftDriveR*vulnerability*2.15*dt;
            state.rivalPitchRate+=liftDriveR*.035*dt;
          }
          // Yandan çarpışma: yalnızca yüksek bağıl hızda ve dengesiz yanal yükte küçük roll üretir.
          const lateralSpeed=Math.abs((state.vx-state.rvx)*(-nz)+(state.vz-state.rvz)*nx);
          const sideContact=Math.abs(pNose)<.48||Math.abs(rNose)<.48;
          if(sideContact&&lateralSpeed>1.45){
            const sideSign=Math.sign((state.vx-state.rvx)*(-nz)+(state.vz-state.rvz)*nx)||1;
            const sideLoad=clamp((lateralSpeed-1.45)*.65,0,1.0)*vulnerability;
            if(!state.playerTipped)state.playerRollRate+=sideSign*sideLoad*dt;
            if(!state.rivalTipped)state.rivalRollRate-=sideSign*sideLoad*dt;
          }
          if((liftDriveP>0||liftDriveR>0)&&now-state.lastPush>350){state.pushes++;state.lastPush=now;}
          if(now-state.lastHit>260){state.collisions++;state.lastHit=now;}
        }
        // Açısal hareket sönümlenir. Küçük yalpalamalar yay etkisiyle toparlanır;
        // devrilme ancak kama kaldırması/kuvvetli yanal yük birikerek eşiği aşarsa olur.
        const angularDamping=Math.exp(-2.4*dt),selfRighting=2.8;
        const integrateTilt=(angle,rate,axis)=>{
          if(Math.abs(angle)<.72)rate-=angle*selfRighting*dt;
          rate*=angularDamping;angle+=rate*dt;
          return {angle:clamp(angle,-1.58,1.58),rate};
        };
        if(!state.playerTipped){
          let q=integrateTilt(state.playerPitch,state.playerPitchRate,'pitch');state.playerPitch=q.angle;state.playerPitchRate=q.rate;
          q=integrateTilt(state.playerRoll,state.playerRollRate,'roll');state.playerRoll=q.angle;state.playerRollRate=q.rate;
          state.playerTipped=Math.abs(state.playerRoll)>1.34||Math.abs(state.playerPitch)>1.38;
        }
        if(!state.rivalTipped){
          let q=integrateTilt(state.rivalPitch,state.rivalPitchRate,'pitch');state.rivalPitch=q.angle;state.rivalPitchRate=q.rate;
          q=integrateTilt(state.rivalRoll,state.rivalRollRate,'roll');state.rivalRoll=q.angle;state.rivalRollRate=q.rate;
          state.rivalTipped=Math.abs(state.rivalRoll)>1.34||Math.abs(state.rivalPitch)>1.38;
        }
        // Surface friction and natural deceleration.
        const friction=Math.max(0,1-dt*.55);state.vx*=friction;state.vz*=friction;state.rvx*=friction;state.rvz*=friction;
        // Resmi sumo yaklaşımı: gövdenin herhangi bir bölümü dohyo dışına temas ederse ring-out.
        const footprintRadius=Math.hypot(preset.width*.5,(preset.length*.5+.43*(preset.length/1.02)));
        const outP=Math.hypot(state.x,state.z)+footprintRadius>maxRadius+.015;
        const outR=Math.hypot(state.rx,state.rz)+footprintRadius>maxRadius+.015;
        if(outP||outR){state.winner=outP?'RAKİP KAZANDI':'SEN KAZANDIN';state.finishReason=outP?'Oyuncu robot dohyo dışına çıktı':'Rakip robot dohyo dışına çıktı';}
        // Update sensor lamps with the live readings.
        player.userData.sensors.forEach((s,i)=>s.mesh.material.color.set(playerSensors[i].edge?'#ff4d4d':'#35d7f4'));
        rival.userData.sensors.forEach((s,i)=>s.mesh.material.color.set(rivalSensors[i].edge?'#ff4d4d':'#35d7f4'));
      }
      player.position.set(state.x,0,state.z);player.rotation.set(state.playerPitch,state.a,state.playerRoll,'YXZ');rival.position.set(state.rx,0,state.rz);rival.rotation.set(state.rivalPitch,state.ra,state.rivalRoll,'YXZ');
      shadows[0].position.set(state.x,.105,state.z);shadows[1].position.set(state.rx,.105,state.rz);
      const distance=Math.hypot(state.rx-state.x,state.rz-state.z);
      if(now-lastTelemetry>140){p.onTelemetry?.({distance:distance.toFixed(2),speed:p.running&&!state.winner?p.speed:0,mode:p.mode,collisions:state.collisions,pushes:state.pushes,edge:state.playerEdge?'UYARI':'GÜVENLİ',lineSensors:state.playerEdge?'SINIR ALGILANDI':'ZEMİN',winner:state.winner,finishReason:state.finishReason,elapsed:state.elapsed.toFixed(1),playerTipped:state.playerTipped,rivalTipped:state.rivalTipped});lastTelemetry=now;}
      controls.update();renderer.render(scene,camera);
    };
    api.current={state,startState};frame=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(frame);ro.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointermove',pointerMove);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.domElement.removeEventListener('pointercancel',pointerUp);renderer.domElement.removeEventListener('wheel',wheelRotate,true);window.removeEventListener('keydown',rotateKey);controls.dispose();renderer.dispose();scene.traverse(o=>{o.geometry?.dispose?.();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose?.();});if(renderer.domElement.parentNode===el)el.removeChild(renderer.domElement);};
  },[robotClass,arenaDiameterCm,bladeType]);

  useEffect(()=>{if(api.current){Object.assign(api.current.state,api.current.startState());}},[resetKey,robotClass]);
  useEffect(()=>{if(api.current&&!running){const s=api.current.state;const radius=Math.max(.75,(arenaDiameterCm||80)/40);s.a=(playerHeading*Math.PI)/180;s.ra=(rivalHeading*Math.PI)/180;s.x=(playerPosition?.x??-.52)*radius;s.z=(playerPosition?.z??0)*radius;s.rx=(rivalPosition?.x??.52)*radius;s.rz=(rivalPosition?.z??0)*radius;s.vx=0;s.vz=0;s.rvx=0;s.rvz=0;}},[playerHeading,rivalHeading,playerPosition,rivalPosition,running,arenaDiameterCm]);
  return <div className="arena-canvas" ref={host}>
    <div className="arena-hud"><span className={`live-dot ${running?'active':''}`}/>{running?'SİMÜLASYON ÇALIŞIYOR':'SİMÜLASYON HAZIR'}<span className="hud-sep">·</span> PARS SUMOLAB · RC / OTONOM / ARDUINO C++</div>
    <div className="arena-help"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> sürüş <span>·</span> Duraklat: robotu sürükle <span>·</span> Boş alan: kamera</div>
  </div>;
}
