import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

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

function makeRobot(color, accent, bladeType, scale = 1, isRival = false, dimensions = { width: .92, length: 1.02, height: .25 }, opponentSensorCount = 3, wheelDiameterMm = 30) {
  const root = new THREE.Group();
  root.scale.setScalar(scale);
  const bodyMat = new THREE.MeshStandardMaterial({ color: '#171b22', metalness: .72, roughness: .31 });
  const steelMat = new THREE.MeshStandardMaterial({ color: '#c7cdd3', metalness: .96, roughness: .23 });
  const redMat = new THREE.MeshStandardMaterial({ color: '#d71920', metalness: .48, roughness: .32 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: '#080a0d', metalness: .04, roughness: .96 });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#111827', metalness: .25, roughness: .65 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: .18, metalness: .3 });
  // Gerçek mini-sumo görünümü: dar ve alçak üst şasi, dışarı taşan tahrik tekerlekleri.
  const bodyWidth = dimensions.width * .78;
  const bodyLength = dimensions.length * .82;
  const bodyBottom = .105;
  const bodyTop = bodyBottom + dimensions.height;
  const bodyRadius = Math.min(bodyWidth, dimensions.height, bodyLength) * .055;
  const body = new THREE.Mesh(new RoundedBoxGeometry(bodyWidth, dimensions.height, bodyLength, 5, bodyRadius), bodyMat);
  body.position.y = bodyBottom + dimensions.height / 2; body.castShadow = true; body.receiveShadow = true; root.add(body);
  // Yan kapaklar: referans PARS robotundaki siyah, köşeli metal yan gövde.
  for (const side of [-1,1]) {
    const cheek = new THREE.Mesh(new RoundedBoxGeometry(dimensions.width*.075, dimensions.height*.78, bodyLength*.78, 3, dimensions.width*.012), darkMat);
    cheek.position.set(side*bodyWidth*.49, bodyBottom+dimensions.height*.43, -dimensions.length*.015); cheek.castShadow=true; root.add(cheek);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(dimensions.width*.008, dimensions.height*.035, bodyLength*.68), redMat);
    trim.position.set(side*bodyWidth*.535, bodyBottom+dimensions.height*.79, -dimensions.length*.015); root.add(trim);
  }
  // Alçak elektronik kapak; robotun üstünü büyük bir kutu gibi kaplamaz.
  const deck = new THREE.Mesh(new RoundedBoxGeometry(bodyWidth*.72, Math.max(.009, dimensions.height*.075), bodyLength*.66, 3, bodyRadius*.35), darkMat);
  deck.position.set(0, bodyTop-dimensions.height*.075, -.015); deck.castShadow=true; root.add(deck);
  // PARS referansındaki açıkta duran siyah PCB, kırmızı baskı çizgileri ve güç modülleri.
  const pcbMat = new THREE.MeshStandardMaterial({color:'#090d13',metalness:.58,roughness:.38});
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth*.88, Math.max(.009,dimensions.height*.055), bodyLength*.78), pcbMat);
  pcb.position.set(0,bodyTop+dimensions.height*.012,-dimensions.length*.045); pcb.castShadow=true; root.add(pcb);
  const pcbY=bodyTop+dimensions.height*.043;
  for (const side of [-1,1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth*.39,dimensions.height*.012,dimensions.length*.012),redMat);
    rail.position.set(side*bodyWidth*.245,pcbY,-dimensions.length*.055); root.add(rail);
    const driver = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth*.19,dimensions.height*.055,bodyLength*.22),new THREE.MeshStandardMaterial({color:'#171d26',metalness:.65,roughness:.35}));
    driver.position.set(side*bodyWidth*.29,pcbY+dimensions.height*.025,-dimensions.length*.09); root.add(driver);
    const inductor = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth*.12,dimensions.height*.075,bodyLength*.13),new THREE.MeshStandardMaterial({color:'#20252b',metalness:.35,roughness:.55}));
    inductor.position.set(side*bodyWidth*.12,pcbY+dimensions.height*.035,-dimensions.length*.10); root.add(inductor);
    const terminal = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth*.13,dimensions.height*.13,dimensions.length*.10),new THREE.MeshStandardMaterial({color:'#218b42',metalness:.18,roughness:.5}));
    terminal.position.set(side*bodyWidth*.39,pcbY+dimensions.height*.07,dimensions.length*.13); root.add(terminal);
    for(let pin=0;pin<3;pin++){const screw=new THREE.Mesh(new THREE.CylinderGeometry(dimensions.width*.009,dimensions.width*.009,dimensions.height*.018,10),steelMat);screw.position.set(side*bodyWidth*.39+(pin-1)*bodyWidth*.035,pcbY+dimensions.height*.145,dimensions.length*.13);root.add(screw);}
  }
  const mcu = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth*.22,dimensions.height*.075,bodyLength*.19),new THREE.MeshStandardMaterial({color:'#202832',metalness:.45,roughness:.4}));
  mcu.position.set(0,pcbY+dimensions.height*.045,-dimensions.length*.02); root.add(mcu);
  for(let i=0;i<4;i++){const pin=new THREE.Mesh(new THREE.BoxGeometry(bodyWidth*.012,dimensions.height*.025,bodyLength*.025),steelMat);pin.position.set(-bodyWidth*.13+i*bodyWidth*.087,pcbY+dimensions.height*.065,-dimensions.length*.02);root.add(pin);}
  const led = new THREE.Mesh(new THREE.SphereGeometry(dimensions.width*.018,12,10),new THREE.MeshBasicMaterial({color:'#168cff'})); led.position.set(bodyWidth*.20,pcbY+dimensions.height*.075,dimensions.length*.03);root.add(led);
  // Üst kart üzerinde referans görseldeki PARS marka plakası.
  const logoCanvas=document.createElement('canvas'); logoCanvas.width=512; logoCanvas.height=160; const logoCtx=logoCanvas.getContext('2d');
  logoCtx.clearRect(0,0,512,160); logoCtx.fillStyle='#f4f6f8'; logoCtx.font='900 104px Arial'; logoCtx.textAlign='center'; logoCtx.fillText('PARS',256,112); logoCtx.fillStyle='#e21b2b'; logoCtx.fillRect(72,128,368,9);
  const logoTexture=new THREE.CanvasTexture(logoCanvas); const logo=new THREE.Mesh(new THREE.PlaneGeometry(bodyWidth*.38,bodyLength*.12),new THREE.MeshBasicMaterial({map:logoTexture,transparent:true,side:THREE.DoubleSide}));
  logo.rotation.x=-Math.PI/2; logo.position.set(0,pcbY+dimensions.height*.078,-dimensions.length*.055); root.add(logo);
  // XT60 güç konnektörü ve kırmızı/siyah kablo demeti.
  const plug = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth*.20,dimensions.height*.13,dimensions.length*.13),new THREE.MeshStandardMaterial({color:'#e7a51b',metalness:.18,roughness:.5})); plug.position.set(bodyWidth*.24,pcbY+dimensions.height*.075,-dimensions.length*.29);root.add(plug);
  for(const [i,c] of [[0,'#d51d25'],[1,'#111111']]){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3((i?-.06:.06)*bodyWidth,bodyTop+dimensions.height*.10,-dimensions.length*.31),new THREE.Vector3((i?-.20:.20)*bodyWidth,bodyTop+dimensions.height*.18,-dimensions.length*.37),new THREE.Vector3((i?-.32:.32)*bodyWidth,bodyTop+dimensions.height*.08,-dimensions.length*.28)]);const cable=new THREE.Mesh(new THREE.TubeGeometry(curve,16,dimensions.width*.012,8,false),new THREE.MeshStandardMaterial({color:c,roughness:.45}));root.add(cable);}
  for (const x of [-1,1]) for (const z of [-1,1]) {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(dimensions.width*.012,dimensions.width*.012,dimensions.height*.018,10),new THREE.MeshStandardMaterial({color:'#d5dce5',metalness:.95,roughness:.2}));
    bolt.position.set(x*bodyWidth*.40,bodyTop-dimensions.height*.025,z*bodyLength*.40); root.add(bolt);
  }

  // Tek parça, üçgen planlı sumo bıçağı: geniş kök, tam sivri burun ve zemine sıfır alt yüzey.
  const blade = new THREE.Group();
  const bladeWidth = (bladeType === 'Geniş kama' ? 1.08 : bladeType === 'Dar hassas kama' ? .72 : bladeType === 'Çift kademeli' ? .96 : .94) * dimensions.width / .92;
  const bladeLength = (bladeType === 'Uzun alçak kama' ? .98 : .76) * dimensions.length / 1.02;
  const rearZ = dimensions.length * .16, tipZ = rearZ + bladeLength;
  const half = bladeWidth*.5;
  const floorY = .0955; // Dohyo üst yüzeyi: 0.0565 + 0.039 = 0.0955; bıçak altı tam temas düzleminde.
  const rearTopY = bodyBottom + dimensions.height*.54;
  const tipTopY = floorY + .0010; // Kesici ağızda yaklaşık 0.2 mm metal kalınlığı; alt yüzey zeminle sıfır boşlukta.
  const verts = [
    -half,floorY,rearZ,   half,floorY,rearZ,   0,floorY,tipZ,
    -half,rearTopY,rearZ, half,rearTopY,rearZ, 0,tipTopY,tipZ
  ];
  const indices = [
    3,4,5,                 // üstte sivri üçgen rampa
    0,2,1,                 // tamamen düz alt yüzey
    0,3,5, 0,5,2,          // sol yan
    1,2,5, 1,5,4,          // sağ yan
    0,1,4, 0,4,3           // gövdeye bağlanan arka yüz
  ];
  const bladeGeo = new THREE.BufferGeometry();
  bladeGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  bladeGeo.setIndex(indices); bladeGeo.computeVertexNormals();
  const bladeMetal = new THREE.MeshStandardMaterial({color:'#c4cbd1',metalness:.98,roughness:.22,side:THREE.DoubleSide});
  const wedge = new THREE.Mesh(bladeGeo,bladeMetal); wedge.castShadow=true; wedge.receiveShadow=true; blade.add(wedge);
  // Üst rampadaki PARS tipi üç siyah sensör penceresi ve ince kesici ağız çizgisi.
  for(const x of [-half*.48,0,half*.48]){const windowMesh=new THREE.Mesh(new THREE.BoxGeometry(bladeWidth*.19,dimensions.height*.012,dimensions.length*.065),new THREE.MeshStandardMaterial({color:'#080b10',metalness:.18,roughness:.42}));windowMesh.position.set(x,floorY+(rearTopY-floorY)*.38,rearZ+bladeLength*.40);windowMesh.rotation.x=-Math.atan2(rearTopY-tipTopY,bladeLength);blade.add(windowMesh);}
  // Ön uç tek bir geometrik noktada birleşir; geniş veya düz bir tampon yoktur.
  // Düşük montaj kulakları ve bağlantı vidaları.
  for (const x of [-half*.72,half*.72]) {
    const mount = new THREE.Mesh(new THREE.BoxGeometry(dimensions.width*.055,dimensions.height*.10,dimensions.length*.09),accentMat);
    mount.position.set(x,bodyBottom+dimensions.height*.53,dimensions.length*.19); blade.add(mount);
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(dimensions.width*.012,dimensions.width*.012,dimensions.width*.009,12),darkMat);
    screw.rotation.x=Math.PI/2; screw.position.set(x,bodyBottom+dimensions.height*.57,dimensions.length*.23); blade.add(screw);
  }
  root.add(blade);

  // İki yanda belirgin lastik tahrik tekerlekleri ve kompakt motor muhafazaları.
  const wheelRadius=clamp(wheelDiameterMm,15,60)/400, wheelWidth=dimensions.width*.13;
  for (const side of [-1,1]) {
    const x=side*dimensions.width*.455;
    const motorPod = new THREE.Mesh(new RoundedBoxGeometry(dimensions.width*.19,dimensions.height*.40,dimensions.length*.34,4,dimensions.width*.035),darkMat);
    motorPod.position.set(side*dimensions.width*.36,bodyBottom+dimensions.height*.34,-dimensions.length*.105); root.add(motorPod);
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius,wheelRadius,wheelWidth,36),rubberMat);
    wheel.rotation.z=Math.PI/2; wheel.position.set(x,.0955+wheelRadius,-dimensions.length*.105); wheel.castShadow=true; root.add(wheel);
    // Lastik sırt kanalları ve metal göbek.
    for(let tread=0;tread<12;tread++){
      const a=tread*Math.PI/6;
      const rib=new THREE.Mesh(new THREE.BoxGeometry(wheelWidth*1.02,wheelRadius*.13,wheelRadius*.10),darkMat);
      rib.position.set(x,.0955+wheelRadius+Math.sin(a)*wheelRadius*.91,-dimensions.length*.105+Math.cos(a)*wheelRadius*.91);
      rib.rotation.x=-a; root.add(rib);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius*.43,wheelRadius*.43,wheelWidth*1.04,24),accentMat); hub.rotation.z=Math.PI/2; hub.position.copy(wheel.position); root.add(hub);
    const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius*.18,wheelRadius*.18,wheelWidth*1.08,18),new THREE.MeshStandardMaterial({color:'#d7e0e9',metalness:.96,roughness:.18})); hubCap.rotation.z=Math.PI/2; hubCap.position.copy(wheel.position); root.add(hubCap);
  }
  // Five visible line sensors: three front, two rear. Their state is updated from the dohyo surface.
  const sensors = [];
  for (const [x,z] of [[-dimensions.width*.34,dimensions.length*.49],[0,dimensions.length*.54],[dimensions.width*.34,dimensions.length*.49],[-dimensions.width*.32,-dimensions.length*.42],[dimensions.width*.32,-dimensions.length*.42]]) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(dimensions.width*.045,12,10),new THREE.MeshBasicMaterial({color:'#35d7f4'}));
    mesh.position.set(x,.0925+dimensions.width*.045,z); root.add(mesh); sensors.push({mesh,x,z});
  }
  // Rakip IR sensörleri ön yarım daireye 2–7 adet yerleştirilir.
  const opponentSensors = [];
  const sensorAngles = opponentSensorCount === 2 ? [-32, 32] : Array.from({length:opponentSensorCount}, (_,i)=>-70 + i*(140/(opponentSensorCount-1)));
  for (const deg of sensorAngles) {
    const a=deg*Math.PI/180, x=Math.sin(a)*dimensions.width*.57, z=Math.cos(a)*dimensions.length*.57;
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(dimensions.width*.035,12,10),new THREE.MeshBasicMaterial({color:'#38bdf8'}));
    mesh.position.set(x,.105+dimensions.height*.72,z); root.add(mesh); opponentSensors.push({mesh,angle:a,detected:false});
  }
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(dimensions.width*.07,dimensions.width*.07,dimensions.width*.025,24),accentMat); beacon.position.set(0,.105+dimensions.height+dimensions.width*.055,-.02); root.add(beacon);
  root.userData = { sensors, opponentSensors, bladeType, label: isRival ? 'RAKİP' : 'OYUNCU', dimensions };
  return root;
}

function sensorWorld(robot, x, z, playableRadius) {
  const c = Math.cos(robot.a), s = Math.sin(robot.a);
  const wx = robot.x + x*c + z*s;
  const wz = robot.z - x*s + z*c;
  // Sensörler siyah dohyo yüzeyinden beyaz sınır bandına geçişte tetiklenir.
  return { x: wx, z: wz, edge: Math.hypot(wx,wz) >= playableRadius };
}

function readOpponentSensors(robot, self, target, range=1.75) {
  const dx=target.x-self.x, dz=target.z-self.z, distance=Math.hypot(dx,dz);
  const bearing=wrapAngle(Math.atan2(dx,dz)-self.a);
  const readings=robot.userData.opponentSensors.map(sensor=>{
    const relative=wrapAngle(bearing-sensor.angle);
    const detected=distance<=range && Math.abs(relative)<=Math.PI/5;
    sensor.detected=detected; sensor.mesh.material.color.set(detected?'#fbbf24':'#38bdf8');
    return {detected,angle:sensor.angle};
  });
  const active=readings.filter(x=>x.detected);
  const left=active.some(x=>x.angle<-.12), right=active.some(x=>x.angle>.12);
  return { any:active.length>0, left, right, front:active.length>0 && (Math.abs(bearing)<=.25 || (left&&right)), readings, distance, bearing };
}

export default function Arena({ running, speed, mode, driveInput={ throttle: 0, steer: 0, throttleActive: false, steerActive: false }, arduinoCommand={left:0,right:0,enabled:false}, dipSwitches=[false,false,false], resetKey, onTelemetry, robotColor='#3978ed', arenaSize='mini', bladeType='Standart kama', robotClass='Mini Sumo (500 g)', totalWeight=595, rivalRobotClass='Mini Sumo (500 g)', rivalTotalWeight=595, rivalColor='#d84b4b', rivalBladeType='Geniş kama', playerOpponentSensorCount=3, rivalOpponentSensorCount=3, driveSpec={motorTorque:12,gearRatio:50,motorRpm:10000,wheelDiameter:30,tireMu:.9}, rivalDriveSpec={motorTorque:12,gearRatio:50,motorRpm:10000,wheelDiameter:30,tireMu:.9}, arenaDiameterCm=80, playerHeading=90, rivalHeading=270, playerPosition={x:-.52,z:0}, rivalPosition={x:.52,z:0}, onPlacementChange }) {
  const host = useRef(null);
  const api = useRef(null);
  const props = useRef({running,speed,mode,driveInput,arduinoCommand,dipSwitches,onTelemetry,robotColor,arenaSize,bladeType,robotClass,totalWeight,rivalRobotClass,rivalTotalWeight,rivalColor,rivalBladeType,playerOpponentSensorCount,rivalOpponentSensorCount,driveSpec,rivalDriveSpec,arenaDiameterCm,playerHeading,rivalHeading,playerPosition,rivalPosition,onPlacementChange});
  useEffect(()=>{props.current={running,speed,mode,driveInput,arduinoCommand,dipSwitches,onTelemetry,robotColor,arenaSize,bladeType,robotClass,totalWeight,rivalRobotClass,rivalTotalWeight,rivalColor,rivalBladeType,playerOpponentSensorCount,rivalOpponentSensorCount,driveSpec,rivalDriveSpec,arenaDiameterCm,playerHeading,rivalHeading,playerPosition,rivalPosition,onPlacementChange};},[running,speed,mode,driveInput,arduinoCommand,dipSwitches,onTelemetry,robotColor,arenaSize,bladeType,robotClass,totalWeight,rivalRobotClass,rivalTotalWeight,rivalColor,rivalBladeType,playerOpponentSensorCount,rivalOpponentSensorCount,driveSpec,rivalDriveSpec,arenaDiameterCm,playerHeading,rivalHeading,playerPosition,rivalPosition,onPlacementChange]);

  useEffect(()=>{
    const el=host.current; if(!el) return;
    const scene=new THREE.Scene(); scene.background=new THREE.Color('#0c1422'); scene.fog=new THREE.Fog('#0c1422',14,32);
    const camera=new THREE.PerspectiveCamera(42,el.clientWidth/Math.max(1,el.clientHeight),.1,100); camera.position.set(7.4,8.2,9.2);
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false}); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); renderer.setSize(el.clientWidth,el.clientHeight); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1; el.appendChild(renderer.domElement);
    const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.dampingFactor=.07; controls.target.set(0,.1,0); controls.minDistance=2.8; controls.maxDistance=28; controls.maxPolarAngle=Math.PI*.48;
    scene.add(new THREE.HemisphereLight(0xddeaff,0x1d293b,2)); const key=new THREE.DirectionalLight(0xffffff,2.8); key.position.set(-4,10,6); key.castShadow=true; key.shadow.mapSize.set(2048,2048); scene.add(key); const rim=new THREE.PointLight(0x3b82f6,24,18); rim.position.set(5,3,-4); scene.add(rim);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(50,50),new THREE.MeshStandardMaterial({color:'#111c2d',roughness:.96})); floor.rotation.x=-Math.PI/2; floor.position.y=-.22; floor.receiveShadow=true; scene.add(floor); const grid=new THREE.GridHelper(50,50,'#243650','#1a293e'); grid.position.y=-.21; scene.add(grid);
    const preset=CLASS_PRESETS[props.current.robotClass]||CLASS_PRESETS['Mini Sumo (500 g)'];
    const rivalPreset=CLASS_PRESETS[props.current.rivalRobotClass]||CLASS_PRESETS['Mini Sumo (500 g)'];
    // 1 Three.js birimi = 20 cm; varsayılan Mini Sumo dohyo çapı 80 cm'dir.
    const maxRadius=Math.max(.75, (props.current.arenaDiameterCm || 80) / 40);
    camera.position.set(maxRadius * 3.0, maxRadius * 3.25, maxRadius * 3.7);
    // Gerçek dohyo görünümü: siyah mücadele yüzeyi ve çevresinde beyaz sınır bandı.
    // 1 Three.js birimi = 20 cm; beyaz bandın genişliği çapın yaklaşık %3,1'idir.
    const boundaryWidth=maxRadius*.0625;
    const playableRadius=maxRadius-boundaryWidth;
    const platformMargin=boundaryWidth*1.65;
    const platformThickness=Math.max(.055,maxRadius*.06);
    const plinth=new THREE.Mesh(new THREE.CylinderGeometry(maxRadius+platformMargin,maxRadius+platformMargin,platformThickness,128),new THREE.MeshStandardMaterial({color:'#343b45',metalness:.08,roughness:.82}));
    plinth.position.y=-platformThickness/2; plinth.receiveShadow=true; plinth.castShadow=true; scene.add(plinth);
    // Beyaz üst tabla; siyah iç disk beyaz kenarı kapatmayacak şekilde daha küçük tutulur.
    const dohyoBase=new THREE.Mesh(new THREE.CylinderGeometry(maxRadius,maxRadius,.075,128),new THREE.MeshStandardMaterial({color:'#f4f4f1',roughness:.92}));
    dohyoBase.position.y=.055; dohyoBase.receiveShadow=true; dohyoBase.castShadow=true; scene.add(dohyoBase);
    const blackSurface=new THREE.Mesh(new THREE.CylinderGeometry(playableRadius,playableRadius,.078,128),new THREE.MeshStandardMaterial({color:'#090b0e',roughness:.96,metalness:0}));
    blackSurface.position.y=.0565; blackSurface.receiveShadow=true; blackSurface.castShadow=false; scene.add(blackSurface);
    // Başlangıç çizgileri de dohyo ve robot boyutuna göre ölçeklenir; robotlar merkeze bakacak şekilde yerleşir.
    const startLineLength=Math.max(preset.width,rivalPreset.width)*1.35>maxRadius*.2?Math.max(preset.width,rivalPreset.width)*1.35:maxRadius*.20;
    const startLineOffset=maxRadius*.28;
    const startMat=new THREE.MeshStandardMaterial({color:'#f7f7f4',roughness:.88});
    [-startLineOffset,startLineOffset].forEach(x=>{const line=new THREE.Mesh(new THREE.BoxGeometry(.018,.006,startLineLength),startMat);line.position.set(x,.097,0);scene.add(line);});

    const player=makeRobot(props.current.robotColor,'#8fc2ff',props.current.bladeType,preset.robotScale,false,preset,props.current.playerOpponentSensorCount||3,props.current.driveSpec?.wheelDiameter||30);
    const rival=makeRobot(props.current.rivalColor,'#ffb36b',props.current.rivalBladeType,rivalPreset.robotScale,true,rivalPreset,props.current.rivalOpponentSensorCount||3,props.current.rivalDriveSpec?.wheelDiameter||30); scene.add(player,rival);
    const shadows=[]; for(const [color,op,profile] of [['#3b82f6',.14,preset],['#ef4444',.12,rivalPreset]]){const m=new THREE.Mesh(new THREE.CircleGeometry(Math.max(profile.width,profile.length)*.72,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:op,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.105;scene.add(m);shadows.push(m);}
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
    const pointerDown=(event)=>{if(props.current.running)return;const point=worldPoint(event);if(!point)return;const dp=Math.hypot(point.x-state.x,point.z-state.z),dr=Math.hypot(point.x-state.rx,point.z-state.rz);const selectRadius=Math.max(.42,Math.hypot(Math.max(preset.width,rivalPreset.width),Math.max(preset.length,rivalPreset.length))*.72);if(Math.min(dp,dr)>selectRadius)return;dragging=dp<=dr?'player':'rival';controls.enabled=false;renderer.domElement.style.cursor='grabbing';renderer.domElement.setPointerCapture?.(event.pointerId);event.preventDefault();};
    const pointerMove=(event)=>{if(!dragging||props.current.running)return;const point=worldPoint(event);if(!point)return;const limit=Math.max(.12,maxRadius-Math.hypot(Math.max(preset.width,rivalPreset.width),Math.max(preset.length,rivalPreset.length))*.5-.09);const len=Math.hypot(point.x,point.z);if(len>limit){point.x*=limit/len;point.z*=limit/len;}if(dragging==='player'){state.x=point.x;state.z=point.z;state.vx=0;state.vz=0;}else{state.rx=point.x;state.rz=point.z;state.rvx=0;state.rvz=0;}publishPlacement();};
    const wheelRotate=(event)=>{if(!dragging||props.current.running)return;event.preventDefault();event.stopPropagation();rotateDragged(event.deltaY>0?1:-1);};
    const rotateKey=(event)=>{if(!dragging||props.current.running)return;if(event.code==='KeyQ'||event.code==='KeyE'){event.preventDefault();rotateDragged(event.code==='KeyQ'?-1:1);}};
    const pointerUp=(event)=>{if(!dragging)return;dragging=null;controls.enabled=true;renderer.domElement.style.cursor='grab';try{renderer.domElement.releasePointerCapture?.(event.pointerId);}catch{}};
    renderer.domElement.style.cursor='grab';renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointercancel',pointerUp);renderer.domElement.addEventListener('wheel',wheelRotate,{passive:false,capture:true});window.addEventListener('keydown',rotateKey);
    const resize=()=>{const w=el.clientWidth,h=Math.max(1,el.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}; const ro=new ResizeObserver(resize);ro.observe(el);
    let frame,lastTelemetry=0,last=performance.now();
    // Motor/şanzıman/tekerlek/lastik modeli. Simülasyonda 1 birim = 0.2 m.
    // motorTorque: motor milindeki tork (mNm); iki tahrik motoru varsayılır.
    const drive=(r,forward,turn,dt,classMaxSpeed,massKg,spec={})=>{
      const mass=Math.max(.03,massKg||.5);
      const motorTorqueNm=Math.max(1,Number(spec.motorTorque)||12)/1000;
      const gearRatio=clamp(Number(spec.gearRatio)||50,1,150);
      const motorRpm=clamp(Number(spec.motorRpm)||10000,500,30000);
      const wheelDiameterM=clamp(Number(spec.wheelDiameter)||30,10,100)/1000;
      const wheelRadiusM=wheelDiameterM/2;
      const mu=clamp(Number(spec.tireMu)||.9,.2,2);
      const drivetrainEfficiency=.72;
      const wheelTorquePerMotor=motorTorqueNm*gearRatio*drivetrainEfficiency;
      const motorForceN=(2*wheelTorquePerMotor)/Math.max(.004,wheelRadiusM);
      const tractionForceN=mu*mass*9.81;
      const usableForceN=Math.min(motorForceN,tractionForceN);
      const accelerationSim=(usableForceN/mass)*5; // m/s² -> simülasyon birimi/s²
      const wheelRpm=motorRpm/gearRatio;
      const wheelSpeedMps=(wheelRpm/60)*Math.PI*wheelDiameterM;
      const motorSpeedSim=wheelSpeedMps*5;
      const targetSpeed=Math.min(classMaxSpeed,motorSpeedSim);
      r.turn=turn;
      const turnGrip=clamp(Math.sqrt(mu/.9),.55,1.28);
      r.a=wrapAngle(r.a+turn*2.45*dt*turnGrip);
      const fx=Math.sin(r.a),fz=Math.cos(r.a),targetV=forward*targetSpeed;
      let dvx=fx*targetV-r.vx,dvz=fz*targetV-r.vz;
      const dv=Math.hypot(dvx,dvz),maxDv=accelerationSim*dt;
      if(dv>maxDv&&dv>0){dvx*=maxDv/dv;dvz*=maxDv/dv;}
      r.vx+=dvx;r.vz+=dvz;
      const speed=Math.hypot(r.vx,r.vz);
      if(speed>motorSpeedSim&&speed>0){r.vx*=motorSpeedSim/speed;r.vz*=motorSpeedSim/speed;}
      r.x+=r.vx*dt;r.z+=r.vz*dt;
      return {mass,mu,motorForceN,tractionForceN,usableForceN,accelerationSim,motorSpeedSim,wheelTorquePerMotor};
    };
    const tick=now=>{
      frame=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.035);last=now;const p=props.current;
      if(player.children[0]?.material?.color)player.children[0].material.color.set(p.robotColor);
      const cls=CLASS_PRESETS[p.robotClass]||CLASS_PRESETS['Mini Sumo (500 g)'];
      const rivalCls=CLASS_PRESETS[p.rivalRobotClass]||CLASS_PRESETS['Mini Sumo (500 g)'];
      if(p.running&&!state.winner){
        state.elapsed+=dt;
        const playerMassKg=Math.max(.03,(p.totalWeight||cls.mass*1000)/1000);
        const rivalMassKg=Math.max(.03,(p.rivalTotalWeight||rivalCls.mass*1000)/1000);
        const maxSpeed=cls.maxSpeed*(p.speed/100);
        // Edge sensors read the actual white dohyo boundary at five physical sensor positions.
        const playerSensors=player.userData.sensors.map(s=>sensorWorld(state,s.x,s.z,playableRadius));
        const rivalProxy={x:state.rx,z:state.rz,a:state.ra};
        const rivalSensors=rival.userData.sensors.map(s=>sensorWorld(rivalProxy,s.x,s.z,playableRadius));
        const pFront=playerSensors.slice(0,3).some(s=>s.edge),pRear=playerSensors.slice(3).some(s=>s.edge);
        const rFront=rivalSensors.slice(0,3).some(s=>s.edge),rRear=rivalSensors.slice(3).some(s=>s.edge);
        state.playerEdge=pFront||pRear;state.rivalEdge=rFront||rRear;
        const playerTarget=readOpponentSensors(player,state,{x:state.rx,z:state.rz},1.85);
        const rivalTarget=readOpponentSensors(rival,{x:state.rx,z:state.rz,a:state.ra},{x:state.x,z:state.z},1.85);
        let pF=0,pT=0;
        if(state.playerTipped){pF=0;pT=0;} else if(p.mode==='AUTO'||p.mode==='OTONOM'){
          const tactic=(p.dipSwitches||[]).reduce((n,on,i)=>n+(on?(1<<i):0),0);
          const aggressive=[1,3,5,7].includes(tactic), fastScan=[2,5,7].includes(tactic), cautious=[4,6].includes(tactic);
          const dist=playerTarget.distance, err=playerTarget.bearing;
          if(pFront){pF=cautious?-.98:-.88;pT=err>=0?-.95:.95;} else if(pRear){pF=.48;pT=err>=0?.75:-.75;} else if(playerTarget.any){if(playerTarget.front){pF=aggressive?1:.88;pT=clamp(err*1.2,-.45,.45);}else{pF=.18;pT=playerTarget.left?-.9:.9;}} else {pF=fastScan?.28:(cautious?.22:.35);pT=fastScan?.9:.72;}
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
          const sensors={edge:playerSensors.map(v=>v.edge),opponent:[playerTarget.left,playerTarget.front,playerTarget.right]};
          window.parent.postMessage({type:'SUMO_SENSOR_DATA',sensors},'*'); state.lastArduinoSensor=now;
        }
        // Opponent controller: edge avoidance has priority over target seeking and attack.
        const err=rivalTarget.bearing;
        let rF=0,rT=0;
        if(state.rivalTipped){rF=0;rT=0;}else if(rFront){rF=-.92;rT=err>=0?-.9:.9;}else if(rRear){rF=.5;rT=err>=0?.7:-.7;}else if(rivalTarget.any){if(rivalTarget.front){rF=1;rT=clamp(err*1.2,-.45,.45);}else{rF=.18;rT=rivalTarget.left?-.9:.9;}}else{rF=.35;rT=.78;}
        const autoTactic=(p.dipSwitches||[]).reduce((n,on,i)=>n+(on?(1<<i):0),0);
        const playerSpeedScale=(p.mode==='AUTO'||p.mode==='OTONOM')?([1,3,5,7].includes(autoTactic)?1.08:([4,6].includes(autoTactic)?.88:1)):1;
        const playerDrive=drive(state,pF,pT,dt,maxSpeed*playerSpeedScale,playerMassKg,p.driveSpec);
        const rivalDrive=drive({get x(){return state.rx},set x(v){state.rx=v},get z(){return state.rz},set z(v){state.rz=v},get a(){return state.ra},set a(v){state.ra=v},get vx(){return state.rvx},set vx(v){state.rvx=v},get vz(){return state.rvz},set vz(v){state.rvz=v},set turn(v){state.rturn=v}},rF,rT,dt,rivalCls.maxSpeed*.88,rivalMassKg,p.rivalDriveSpec);

        // Fiziksel temas: görünür gövde, iki lastik ve gerçek sivri üçgen bıçak için ayrı çokgenler.
        // Sensör menzili veya yaklaşık büyük dikdörtgenler çarpışma sayılmaz.
        const toWorldPolygon=(x,z,a,local)=>{
          const c=Math.cos(a),sn=Math.sin(a);
          return local.map(([lx,lz])=>({x:x+lx*c+lz*sn,z:z-lx*sn+lz*c}));
        };
        const circlePolygon=(cx,cz,r,n=12)=>Array.from({length:n},(_,i)=>[cx+Math.cos(i*2*Math.PI/n)*r,cz+Math.sin(i*2*Math.PI/n)*r]);
        const makeCollisionPolygons=(x,z,a,profile,bladeType,driveSpec)=>{
          const bw=profile.width*.78, bl=profile.length*.82;
          const bladeW=(bladeType==='Geniş kama'?1.08:bladeType==='Dar hassas kama'?.72:bladeType==='Çift kademeli'?.96:.94)*profile.width/.92;
          const bladeL=(bladeType==='Uzun alçak kama'?.98:.76)*profile.length/1.02;
          const rear=profile.length*.16, tip=rear+bladeL, half=bladeW*.5;
          const local=[
            [[-bw/2,-bl/2],[bw/2,-bl/2],[bw/2,bl/2],[-bw/2,bl/2]],
            [[-half,rear],[half,rear],[0,tip]]
          ];
          const wheelR=clamp(Number(driveSpec?.wheelDiameter)||30,15,60)/400, wheelZ=-profile.length*.105;
          for(const side of [-1,1]) local.push(circlePolygon(side*profile.width*.455,wheelZ,wheelR,14));
          return local.map(poly=>toWorldPolygon(x,z,a,poly));
        };
        const pShapes=makeCollisionPolygons(state.x,state.z,state.a,preset,p.bladeType,p.driveSpec);
        const rShapes=makeCollisionPolygons(state.rx,state.rz,state.ra,rivalPreset,p.rivalBladeType,p.rivalDriveSpec);
        let maxOverlap=0, collisionNormal=null;
        const polygonContact=(A,B)=>{
          let minOverlap=Infinity, normal=null;
          for(const poly of [A,B]) for(let i=0;i<poly.length;i++){
            const p1=poly[i],p2=poly[(i+1)%poly.length];
            const edgeX=p2.x-p1.x,edgeZ=p2.z-p1.z;
            const len=Math.hypot(edgeX,edgeZ)||1,axis={x:-edgeZ/len,z:edgeX/len};
            let minA=Infinity,maxA=-Infinity,minB=Infinity,maxB=-Infinity;
            for(const v of A){const d=v.x*axis.x+v.z*axis.z;minA=Math.min(minA,d);maxA=Math.max(maxA,d);}
            for(const v of B){const d=v.x*axis.x+v.z*axis.z;minB=Math.min(minB,d);maxB=Math.max(maxB,d);}
            const overlap=Math.min(maxA,maxB)-Math.max(minA,minB);
            if(overlap<=0)return null;
            if(overlap<minOverlap){minOverlap=overlap;normal={...axis};}
          }
          const ac=A.reduce((v,q)=>({x:v.x+q.x/A.length,z:v.z+q.z/A.length}),{x:0,z:0});
          const bc=B.reduce((v,q)=>({x:v.x+q.x/B.length,z:v.z+q.z/B.length}),{x:0,z:0});
          if(normal&&((bc.x-ac.x)*normal.x+(bc.z-ac.z)*normal.z)<0){normal.x*=-1;normal.z*=-1;}
          return {overlap:minOverlap,normal};
        };
        for(const ps of pShapes) for(const rs of rShapes){
          const contact=polygonContact(ps,rs);
          if(contact&&contact.overlap>maxOverlap){maxOverlap=contact.overlap;collisionNormal=contact.normal;}
        }
        // Çok küçük örtüşmeler sayısal titreşim kabul edilir. Kuvvet ancak görünür geometriler
        // temas ettikten sonra oluşur; böylece algılama menzili itme kuvveti üretemez.
        const CONTACT_SKIN=0.003; // 0.6 mm simülasyon toleransı
        if(maxOverlap>CONTACT_SKIN&&collisionNormal){
          const nx=collisionNormal.x,nz=collisionNormal.z;
          // Yalnızca doğrulanmış fiziksel temas sonrası gövdeleri ayır.
          const separation=maxOverlap+.002;
          state.x-=nx*separation*.5;state.z-=nz*separation*.5;
          state.rx+=nx*separation*.5;state.rz+=nz*separation*.5;
          const pForward=state.vx*nx+state.vz*nz;
          const rForward=-(state.rvx*nx+state.rvz*nz);
          const pNose=Math.sin(state.a)*nx+Math.cos(state.a)*nz;
          const rNose=-(Math.sin(state.ra)*nx+Math.cos(state.ra)*nz);
          const pMass=playerMassKg;
          const rMass=rivalMassKg;
          const relative=(state.vx-state.rvx)*nx+(state.vz-state.rvz)*nz;
          const closingSpeed=Math.max(0,relative);
          // Sumo dohyo'sunda darbeler çoğunlukla elastik sekme değil, lastik tutuşuyla itiş üretir.
          if(closingSpeed>0){
            const restitution=.035;
            const impulse=(1+restitution)*closingSpeed/(1/pMass+1/rMass);
            state.vx-=impulse*nx/pMass;state.vz-=impulse*nz/pMass;
            state.rvx+=impulse*nx/rMass;state.rvz+=impulse*nz/rMass;
          }
          // Sürekli itiş kuvveti yalnızca SAT çarpışması doğrulandıktan sonra uygulanır.
          // Motor torku ve lastik tutuşu iki robot için ayrı ayrı sınırlandırılır.
          const pushPlayer=pNose>.48&&pF>.05?playerDrive.usableForceN*clamp(pF,0,1)*clamp(pNose,0,1):0;
          const pushRival=rNose>.48&&rF>.05?rivalDrive.usableForceN*clamp(rF,0,1)*clamp(rNose,0,1):0;
          const pushImpulse=(pushPlayer+pushRival)*dt*5; // N·s / kg -> simülasyon hız birimi
          if(pushImpulse!==0){
            state.vx-=pushImpulse*nx/pMass;state.vz-=pushImpulse*nz/pMass;
            state.rvx+=pushImpulse*nx/rMass;state.rvz+=pushImpulse*nz/rMass;
          }
          // Kama ancak robot gerçekten öne bakıyor ve rakibe doğru ilerliyorsa altına girmiş sayılır.
          // Yalnızca kafa kafaya temas etmek takla oluşturmaz.
          const pBladeFactor=p.bladeType==='Uzun alçak kama'?1.18:p.bladeType==='Geniş kama'?1.08:p.bladeType==='Çift kademeli'?1.0:p.bladeType==='Dar hassas kama'?.62:.88;
          const rBladeFactor=p.rivalBladeType==='Geniş kama'?1.08:p.rivalBladeType==='Dar hassas kama'?.62:p.rivalBladeType==='Çift kademeli'?1.0:.88;
          const pWedge=pNose>.82&&pForward>.42&&p.bladeType!=='Dar hassas kama';
          const rWedge=rNose>.82&&rForward>.42&&p.rivalBladeType!=='Dar hassas kama';
          // Devrilme eşiği: düşük ağırlık merkezi ve geniş tekerlek izi dengeyi artırır.
          // 1 simülasyon birimi = 20 cm; CoM gövde yüksekliğinin yaklaşık %38'i kabul edilir.
          const comHeightM=preset.height*.20*.38;
          const supportHalfM=preset.length*.20*.34;
          const vulnerability=clamp(comHeightM/Math.max(.001,supportHalfM*.72),.22,.82);
          // Kütle oranı kaldırma etkisini belirler: ağır hedefi kaldırmak daha zordur;
          // daha ağır ve hızlı gelen saldırganın kama etkisi ise nispeten artar.
          const pLiftMassFactor=clamp(Math.sqrt(pMass/rMass),.38,1.65);
          const rLiftMassFactor=clamp(Math.sqrt(rMass/pMass),.38,1.65);
          const liftDriveP=pWedge?clamp((pForward-.42)*2.0,0,1.8)*pBladeFactor*pLiftMassFactor:0;
          const liftDriveR=rWedge?clamp((rForward-.42)*2.0,0,1.8)*rBladeFactor*rLiftMassFactor:0;
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
            const pSideResistance=clamp(Math.sqrt(preset.mass/pMass),.55,1.45);
            const rSideResistance=clamp(Math.sqrt(rivalPreset.mass/rMass),.55,1.45);
            const sideLoadP=clamp((lateralSpeed-1.45)*.65,0,1.0)*vulnerability/pSideResistance;
            const sideLoadR=clamp((lateralSpeed-1.45)*.65,0,1.0)*vulnerability/rSideResistance;
            if(!state.playerTipped)state.playerRollRate+=sideSign*sideLoadP*dt;
            if(!state.rivalTipped)state.rivalRollRate-=sideSign*sideLoadR*dt;
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
        const playerSurfaceDamping=Math.max(0,1-dt*(.16+playerDrive.mu*.42));
        const rivalSurfaceDamping=Math.max(0,1-dt*(.16+rivalDrive.mu*.42));
        state.vx*=playerSurfaceDamping;state.vz*=playerSurfaceDamping;state.rvx*=rivalSurfaceDamping;state.rvz*=rivalSurfaceDamping;
        // Ring-out yalnızca robotun merkezi dohyonun fiziksel dış kenarını geçtiğinde oluşur.
        // Gövde/kama boyutunu merkeze eklemek robot kenara yaklaşır yaklaşmaz hatalı galibiyet veriyordu.
        // Beyaz sınır bandı ring-out değildir; gerçek platform dış kenarı maxRadius'tır.
        const ringOutMargin = 0.04; // 8 mm güvenlik payı (1 birim = 20 cm)
        const playerCenterRadius = Math.hypot(state.x, state.z);
        const rivalCenterRadius = Math.hypot(state.rx, state.rz);
        const outP = playerCenterRadius > maxRadius + ringOutMargin;
        const outR = rivalCenterRadius > maxRadius + ringOutMargin;
        if (outP && outR) {
          state.winner = 'BERABERE';
          state.finishReason = 'İki robot da dohyo dışına çıktı';
        } else if (outP) {
          state.winner = 'RAKİP KAZANDI';
          state.finishReason = 'Oyuncu robot dohyonun dışına çıktı';
        } else if (outR) {
          state.winner = 'SEN KAZANDIN';
          state.finishReason = 'Rakip robot dohyonun dışına çıktı';
        }
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
  },[robotClass,rivalRobotClass,arenaDiameterCm,bladeType,rivalBladeType,rivalColor,playerOpponentSensorCount,rivalOpponentSensorCount]);

  useEffect(()=>{if(api.current){Object.assign(api.current.state,api.current.startState());}},[resetKey,robotClass,rivalRobotClass]);
  useEffect(()=>{if(api.current&&!running){const s=api.current.state;const radius=Math.max(.75,(arenaDiameterCm||80)/40);s.a=(playerHeading*Math.PI)/180;s.ra=(rivalHeading*Math.PI)/180;s.x=(playerPosition?.x??-.52)*radius;s.z=(playerPosition?.z??0)*radius;s.rx=(rivalPosition?.x??.52)*radius;s.rz=(rivalPosition?.z??0)*radius;s.vx=0;s.vz=0;s.rvx=0;s.rvz=0;}},[playerHeading,rivalHeading,playerPosition,rivalPosition,running,arenaDiameterCm]);
  return <div className="arena-canvas" ref={host}>
    <div className="arena-hud"><span className={`live-dot ${running?'active':''}`}/>{running?'SİMÜLASYON ÇALIŞIYOR':'SİMÜLASYON HAZIR'}<span className="hud-sep">·</span> PARS SUMOLAB · RC / OTONOM / ARDUINO C++</div>
    <div className="arena-help"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> sürüş <span>·</span> Duraklat: robotu sürükle <span>·</span> Boş alan: kamera</div>
  </div>;
}
