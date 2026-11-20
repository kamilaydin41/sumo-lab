import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Swords, Bot, Cpu, Code2, Play, Pause, RotateCcw, Gauge, Radio, Settings2,
  Layers3, Wifi, TerminalSquare, Zap, Target, Download, Copy, Check, ChevronRight,
  CircleHelp, BatteryCharging, Ruler, Weight, Activity, CircleDot, Save, BookOpen,
  SlidersHorizontal, Trophy, Keyboard, ShieldCheck, Package
} from 'lucide-react';
import Arena from './components/Arena.jsx';

const jsStarter = `// PARS SUMOLAB v0.20.0 | JavaScript sumo kontrol algoritması
// Simülatörün beş çizgi sensörü ve 2–7 fiziksel rakip sensöründen türetilen sol/ön/sağ algı bölgelerine göre örnek davranış.

function decide(sensor) {
  // Ön çizgi sensörlerinden biri dohyo dışını görürse geri kaç.
  if (sensor.edgeFrontLeft || sensor.edgeFrontCenter || sensor.edgeFrontRight) {
    return { left: -85, right: -85, action: "EDGE_ESCAPE" };
  }

  // Arka sensörler sınırı görürse ileri kaç.
  if (sensor.edgeRearLeft || sensor.edgeRearRight) {
    return { left: 75, right: 75, action: "EDGE_ESCAPE" };
  }

  // Rakip sensörlerinin yönüne göre saldırı.
  if (sensor.opponentFront) return { left: 100, right: 100, action: "ATTACK" };
  if (sensor.opponentLeft) return { left: 45, right: 95, action: "TRACK_LEFT" };
  if (sensor.opponentRight) return { left: 95, right: 45, action: "TRACK_RIGHT" };

  // Rakip bulunamadı: kontrollü tarama.
  return { left: 55, right: -55, action: "SEARCH" };
}

// Örnek: const motorCommand = decide(sensorData);`;

const cppStarter = `// PARS SUMOLAB v0.20.0 | Arduino C++ örnek sumo algoritması
// Örnek kart: Arduino UNO + TB6612FNG
// QTR/çizgi sensörleri: ön-sol A0, ön-orta A1, ön-sağ A2, arka-sol A3, arka-sağ A4
// Rakip IR algı bölgeleri: sol D2, ön D3, sağ D11 (2–7 sensörün bölgesel özeti)

const int PWMA=5, AIN1=7, AIN2=8;
const int PWMB=6, BIN1=9, BIN2=10, STBY=4;
const int OPP_LEFT=2, OPP_FRONT=3, OPP_RIGHT=11;
const int DIP_1=12, DIP_2=13, DIP_3=A5; // 3'lü taktik anahtarı
const int EDGE_FL=A0, EDGE_FC=A1, EDGE_FR=A2, EDGE_RL=A3, EDGE_RR=A4;
const int EDGE_THRESHOLD=600; // Sensör ve dohyo rengine göre kalibre et

void motor(int left, int right) {
  digitalWrite(STBY, HIGH);
  digitalWrite(AIN1, left >= 0); digitalWrite(AIN2, left < 0);
  digitalWrite(BIN1, right >= 0); digitalWrite(BIN2, right < 0);
  analogWrite(PWMA, constrain(abs(left),0,255));
  analogWrite(PWMB, constrain(abs(right),0,255));
}

void setup() {
  pinMode(PWMA,OUTPUT); pinMode(PWMB,OUTPUT);
  pinMode(AIN1,OUTPUT); pinMode(AIN2,OUTPUT);
  pinMode(BIN1,OUTPUT); pinMode(BIN2,OUTPUT); pinMode(STBY,OUTPUT);
  pinMode(OPP_LEFT,INPUT); pinMode(OPP_FRONT,INPUT); pinMode(OPP_RIGHT,INPUT);
  pinMode(DIP_1,INPUT); pinMode(DIP_2,INPUT); pinMode(DIP_3,INPUT);
  motor(0,0);
}

void loop() {
  bool fl=analogRead(EDGE_FL)>EDGE_THRESHOLD;
  bool fc=analogRead(EDGE_FC)>EDGE_THRESHOLD;
  bool fr=analogRead(EDGE_FR)>EDGE_THRESHOLD;
  bool rl=analogRead(EDGE_RL)>EDGE_THRESHOLD;
  bool rr=analogRead(EDGE_RR)>EDGE_THRESHOLD;
  bool oppL=digitalRead(OPP_LEFT), oppF=digitalRead(OPP_FRONT), oppR=digitalRead(OPP_RIGHT);
  // SW1 en düşük bit olacak şekilde 000-111 arasında 8 taktik.
  int tactic=(digitalRead(DIP_1)?1:0) | (digitalRead(DIP_2)?2:0) | (digitalRead(DIP_3)?4:0);
  int searchPower=115, attackPower=220, turnPower=190;
  switch(tactic) {
    case 0: searchPower=115; attackPower=210; turnPower=170; break; // Dengeli
    case 1: searchPower=175; attackPower=245; turnPower=205; break; // Agresif
    case 2: searchPower=145; attackPower=220; turnPower=245; break; // Hızlı tarama
    case 3: searchPower=190; attackPower=255; turnPower=225; break; // Tam hücum
    case 4: searchPower=95;  attackPower=185; turnPower=155; break; // Kenar güvenliği
    case 5: searchPower=165; attackPower=225; turnPower=235; break; // Çevresel tarama
    case 6: searchPower=120; attackPower=205; turnPower=180; break; // Kontrollü hücum
    case 7: searchPower=210; attackPower=255; turnPower=255; break; // Maksimum saldırı
  }

  // Çizgi güvenliği saldırıdan önce gelir.
  if(fl || fc || fr) {
    motor(-190,-190); delay(150);
    motor(fl ? 185 : -185, fr ? -185 : 185); delay(170);
  } else if(rl || rr) {
    motor(170,170); delay(120);
  } else if(oppF || (oppL && oppR)) {
    motor(attackPower,attackPower);
  } else if(oppL) {
    motor(attackPower-turnPower/2,attackPower);
  } else if(oppR) {
    motor(attackPower,attackPower-turnPower/2);
  } else {
    motor(searchPower,-searchPower); // Rakip ara
  }
}`;

const partCatalog = [
  { category: 'Kontrol kartı', name: 'Arduino UNO R3', detail: 'ATmega328P · 5V', weight: 25, icon: Cpu },
  { category: 'Kontrol kartı', name: 'ESP32 DevKit', detail: 'Wi-Fi + Bluetooth · 3.3V', weight: 18, icon: Cpu },
  { category: 'Kontrol kartı', name: 'Arduino Nano', detail: 'ATmega328P · kompakt kart', weight: 7, icon: Cpu },
  { category: 'Kontrol kartı', name: 'Seeed XIAO RP2040', detail: 'Kompakt RP2040 kartı', weight: 4, icon: Cpu },
  { category: 'Motor sürücü', name: 'TB6612FNG', detail: 'Çift DC motor sürücü', weight: 3, icon: Zap },
  { category: 'Motor sürücü', name: 'Cytron çift motor sürücü', detail: 'Yüksek akım sınıfı', weight: 25, icon: Zap },
  { category: 'Motor', name: 'N20 metal redüktörlü motor', detail: '6V · 300–1000 RPM', weight: 18, icon: Gauge },
  { category: 'Motor', name: '6 mm mikro motor', detail: 'Mikro sumo için', weight: 8, icon: Gauge },
  { category: 'Motor', name: '12V yüksek tork motor çifti', detail: 'Mega sınıfı tahrik', weight: 180, icon: Gauge },
  { category: 'Rakip sensörü', name: 'Dijital IR mesafe sensörü', detail: 'Ön / yan algılama', weight: 4, icon: Radio },
  { category: 'Rakip sensörü', name: 'Mini IR sensör', detail: 'Mikro robot için', weight: 2, icon: Radio },
  { category: 'Çizgi sensörü', name: 'QTR-1A yansıtıcı sensör', detail: 'Analog zemin algılama', weight: 2, icon: Target },
  { category: 'Çizgi sensörü', name: 'Mikro çizgi sensörü', detail: 'Mini yansıtıcı modül', weight: 1, icon: Target },
  { category: 'Çizgi sensörü', name: 'QTR-8A sensör dizisi', detail: '8 kanallı analog dizi', weight: 10, icon: Target },
  { category: 'Güç kaynağı', name: '2S LiPo batarya', detail: '7.4V · kapasite seçilebilir', weight: 42, icon: BatteryCharging },
  { category: 'Güç kaynağı', name: '1S mikro LiPo', detail: '3.7V · mikro robot', weight: 12, icon: BatteryCharging },
  { category: 'Güç kaynağı', name: '3S LiPo batarya', detail: '11.1V · yüksek güç', weight: 220, icon: BatteryCharging },
  { category: 'Mekanik', name: 'Alüminyum kama', detail: 'Ön itici parça', weight: 28, icon: SlidersHorizontal },
  { category: 'Mekanik', name: 'Polimer mini kama', detail: 'Mikro sınıf hafif kama', weight: 5, icon: SlidersHorizontal },
  { category: 'Mekanik', name: 'Çelik geniş kama', detail: 'Mega sınıf ön bıçak', weight: 180, icon: SlidersHorizontal },
];

const defaultParts = ['Arduino UNO R3', 'TB6612FNG', 'N20 metal redüktörlü motor', 'Dijital IR mesafe sensörü', 'QTR-1A yansıtıcı sensör', '2S LiPo batarya', 'Alüminyum kama'];
const ROBOT_PROFILES = {
  'Pico Sumo (50 g)': { limit:50, body:12, parts:['Seeed XIAO RP2040','TB6612FNG','6 mm mikro motor','Mini IR sensör','Mikro çizgi sensörü','1S mikro LiPo','Polimer mini kama'], arena:'micro', diameter:38, blade:'Dar hassas kama', dims:'40 × 40 × 20 mm' },
  'Micro Sumo (100 g)': { limit:100, body:25, parts:['Arduino Nano','TB6612FNG','6 mm mikro motor','Mini IR sensör','Mikro çizgi sensörü','1S mikro LiPo','Polimer mini kama'], arena:'micro', diameter:38, blade:'Dar hassas kama', dims:'50 × 50 × 22 mm' },
  'Mini Sumo (500 g)': { limit:500, body:95, parts:defaultParts, arena:'mini', diameter:80, blade:'Standart kama', dims:'100 × 100 × 30 mm' },
  '1 Kg Sumo': { limit:1000, body:180, parts:defaultParts, arena:'mini', diameter:100, blade:'Geniş kama', dims:'150 × 150 × 40 mm' },
  'Klasik 1 Kg Sumo': { limit:1000, body:180, parts:defaultParts, arena:'mini', diameter:100, blade:'Geniş kama', dims:'150 × 150 × 40 mm' },
  'Mega Sumo (3 Kg)': { limit:3000, body:650, parts:['ESP32 DevKit','Cytron çift motor sürücü','12V yüksek tork motor çifti','Dijital IR mesafe sensörü','QTR-8A sensör dizisi','3S LiPo batarya','Çelik geniş kama'], arena:'mega', diameter:154, blade:'Geniş kama', dims:'200 × 200 × 50 mm' },
  'Açık Sınıf (5 Kg)': { limit:5000, body:1200, parts:['ESP32 DevKit','Cytron çift motor sürücü','12V yüksek tork motor çifti','Dijital IR mesafe sensörü','QTR-8A sensör dizisi','3S LiPo batarya','Çelik geniş kama'], arena:'mega', diameter:200, blade:'Geniş kama', dims:'250 × 250 × 60 mm' },
  'LEGO Sumo (1 Kg)': { limit:1000, body:220, parts:['Arduino Nano','TB6612FNG','N20 metal redüktörlü motor','Mini IR sensör','Mikro çizgi sensörü','2S LiPo batarya','Polimer mini kama'], arena:'mini', diameter:80, blade:'Standart kama', dims:'150 × 150 × 45 mm' },
  'RC Sumo (500 g)': { limit:500, body:110, parts:['ESP32 DevKit','TB6612FNG','N20 metal redüktörlü motor','Dijital IR mesafe sensörü','QTR-1A yansıtıcı sensör','2S LiPo batarya','Alüminyum kama'], arena:'mini', diameter:80, blade:'Standart kama', dims:'100 × 100 × 30 mm' },
};


const TACTIC_PRESETS = [
  { name: 'Dengeli başlangıç', description: 'Orta hızda ara, güvenli şekilde saldır.', bits: [false,false,false] },
  { name: 'Agresif saldırı', description: 'Rakibi hızlı bul ve doğrudan hücum et.', bits: [true,false,false] },
  { name: 'Hızlı tarama', description: 'Rakibi bulmak için hızlı dönüşlerle tara.', bits: [false,true,false] },
  { name: 'Tam hücum', description: 'Yüksek motor gücüyle öncelikli saldırı.', bits: [true,true,false] },
  { name: 'Kenar güvenliği', description: 'Dohyo çizgisinden kaçışa öncelik ver.', bits: [false,false,true] },
  { name: 'Çevresel tarama', description: 'Geniş tarama ve kontrollü yaklaşma.', bits: [true,false,true] },
  { name: 'Kontrollü hücum', description: 'Rakibe yaklaşırken kenar güvenliğini koru.', bits: [false,true,true] },
  { name: 'Maksimum saldırı', description: 'En yüksek arama ve saldırı profili.', bits: [true,true,true] },
];
const dipValue = (bits) => bits.reduce((n, bit, i) => n + (bit ? (1 << i) : 0), 0);

function VirtualStick({ title, axis, value, onChange }) {
  const [knob, setKnob] = useState({ x: 50, y: 50 });
  const active = useRef(false);
  const update = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const radius = Math.min(rect.width, rect.height) * 0.38;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const nx = Math.max(-1, Math.min(1, (event.clientX - cx) / radius));
    const ny = Math.max(-1, Math.min(1, (event.clientY - cy) / radius));
    setKnob({ x: 50 + nx * 36, y: 50 + ny * 36 });
    onChange(axis === 'throttle' ? -ny : nx, true);
  };
  const release = () => {
    active.current = false;
    setKnob({ x: 50, y: 50 });
    onChange(0, false);
  };
  return <div className="rc-stick-wrap">
    <div className="rc-stick-title">{title}</div>
    <div className="rc-stick" role="application" aria-label={title}
      onPointerDown={e => { active.current = true; e.currentTarget.setPointerCapture(e.pointerId); update(e); }}
      onPointerMove={e => { if (active.current) update(e); }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
      <span className="stick-cross horizontal"/><span className="stick-cross vertical"/>
      <span className="stick-knob" style={{ left: `${knob.x}%`, top: `${knob.y}%` }}/>
    </div>
    <div className="rc-stick-caption">{axis === 'throttle' ? 'İleri / Geri' : 'Sol / Sağ dönüş'}</div>
  </div>;
}

export default function App() {
  const [tab, setTab] = useState('sim');
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(75);
  const [mode, setMode] = useState('RC');
  const [rcInput, setRcInput] = useState({ throttle: 0, steer: 0, throttleActive: false, steerActive: false });
  const [gamepadName, setGamepadName] = useState('Gamepad aranıyor');
  const [resetKey, setResetKey] = useState(0);
  const [playerHeading, setPlayerHeading] = useState(90);
  const [rivalHeading, setRivalHeading] = useState(270);
  const [playerPosition, setPlayerPosition] = useState({ x: -0.52, z: 0 });
  const [rivalPosition, setRivalPosition] = useState({ x: 0.52, z: 0 });
  const [language, setLanguage] = useState('JavaScript');
  const [code, setCode] = useState(jsStarter);
  const [robotName, setRobotName] = useState('PARS-01');
  const [robotClass, setRobotClass] = useState('Mini Sumo (500 g)');
  const [robotColor, setRobotColor] = useState('#3978ed');
  const [arenaSize, setArenaSize] = useState('mini');
  const [arenaDiameterCm, setArenaDiameterCm] = useState(80);
  const [bladeType, setBladeType] = useState('Standart kama');
  const [playerOpponentSensorCount, setPlayerOpponentSensorCount] = useState(3);
  const [selectedParts, setSelectedParts] = useState(defaultParts);
  const [bodyWeight, setBodyWeight] = useState(ROBOT_PROFILES['Mini Sumo (500 g)'].body);
  const [driveSpec, setDriveSpec] = useState({ motorTorque: 12, gearRatio: 50, motorRpm: 10000, wheelDiameter: 30, tireMu: 0.9 });
  const [rivalName, setRivalName] = useState('RAKİP-01');
  const [rivalClass, setRivalClass] = useState('Mini Sumo (500 g)');
  const [rivalColor, setRivalColor] = useState('#d84b4b');
  const [rivalBladeType, setRivalBladeType] = useState('Geniş kama');
  const [rivalOpponentSensorCount, setRivalOpponentSensorCount] = useState(3);
  const [rivalSelectedParts, setRivalSelectedParts] = useState(defaultParts);
  const [rivalBodyWeight, setRivalBodyWeight] = useState(ROBOT_PROFILES['Mini Sumo (500 g)'].body);
  const [rivalDriveSpec, setRivalDriveSpec] = useState({ motorTorque: 12, gearRatio: 50, motorRpm: 10000, wheelDiameter: 30, tireMu: 0.9 });
  const [telemetry, setTelemetry] = useState({ distance: '—', speed: 0, mode: 'RC', collisions: 0, edge: 'GÜVENLİ' });
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dipSwitches, setDipSwitches] = useState([false, false, false]);
  const [arduinoRunning, setArduinoRunning] = useState(false);
  const [arduinoStatus, setArduinoStatus] = useState('Arduino kodu bekleniyor');
  const [arduinoCommand, setArduinoCommand] = useState({ left: 0, right: 0, enabled: false });
  const [runtimeDoc, setRuntimeDoc] = useState('');
  const runtimeFrame = useRef(null);

  useEffect(() => {
    try {
      const savedConfig = JSON.parse((localStorage.getItem('pars-sumo-lab-project') || localStorage.getItem('sumo-lab-project')) || 'null');
      if (savedConfig) {
        setRobotName(savedConfig.robotName || 'PARS-01');
        setRobotClass(savedConfig.robotClass === 'Mini Sumo' ? 'Mini Sumo (500 g)' : (savedConfig.robotClass || 'Mini Sumo (500 g)'));
        setRobotColor(savedConfig.robotColor || '#3978ed');
        setRivalName(savedConfig.rivalName || 'RAKİP-01');
        setRivalClass(savedConfig.rivalClass || 'Mini Sumo (500 g)');
        setRivalColor(savedConfig.rivalColor || '#d84b4b');
        setRivalBladeType(savedConfig.rivalBladeType || 'Geniş kama');
        setPlayerOpponentSensorCount(Math.max(2,Math.min(7,Number(savedConfig.playerOpponentSensorCount)||3)));
        setRivalOpponentSensorCount(Math.max(2,Math.min(7,Number(savedConfig.rivalOpponentSensorCount)||3)));
        setRivalSelectedParts(savedConfig.rivalSelectedParts || defaultParts);
        setRivalBodyWeight(Number.isFinite(savedConfig.rivalBodyWeight) ? savedConfig.rivalBodyWeight : ROBOT_PROFILES['Mini Sumo (500 g)'].body);
        setBladeType(savedConfig.bladeType || 'Standart kama');
        setSelectedParts(savedConfig.selectedParts || defaultParts);
        setBodyWeight(Number.isFinite(savedConfig.bodyWeight) ? savedConfig.bodyWeight : 95);
        setDriveSpec({ motorTorque:12, gearRatio:50, motorRpm:10000, wheelDiameter:30, tireMu:.9, ...(savedConfig.driveSpec||{}) });
        setRivalDriveSpec({ motorTorque:12, gearRatio:50, motorRpm:10000, wheelDiameter:30, tireMu:.9, ...(savedConfig.rivalDriveSpec||{}) });
        setArenaSize(['micro', 'mini', 'mega'].includes(savedConfig.arenaSize) ? savedConfig.arenaSize : 'mini');
        setArenaDiameterCm(Number.isFinite(savedConfig.arenaDiameterCm) ? savedConfig.arenaDiameterCm : 80);
        setDipSwitches(Array.isArray(savedConfig.dipSwitches) && savedConfig.dipSwitches.length === 3 ? savedConfig.dipSwitches.map(Boolean) : [false,false,false]);
        setPlayerHeading(Number.isFinite(savedConfig.playerHeading) ? savedConfig.playerHeading : 90);
        setRivalHeading(Number.isFinite(savedConfig.rivalHeading) ? savedConfig.rivalHeading : 270);
        if (savedConfig.playerPosition && Number.isFinite(savedConfig.playerPosition.x) && Number.isFinite(savedConfig.playerPosition.z)) setPlayerPosition(savedConfig.playerPosition);
        if (savedConfig.rivalPosition && Number.isFinite(savedConfig.rivalPosition.x) && Number.isFinite(savedConfig.rivalPosition.z)) setRivalPosition(savedConfig.rivalPosition);
      }
    } catch { /* ignore invalid local project data */ }
  }, []);

  useEffect(() => { setCode(language === 'JavaScript' ? jsStarter : cppStarter); }, [language]);

  useEffect(() => {
    const check = () => { const pads = navigator.getGamepads?.() || []; const pad = Array.from(pads).find(Boolean); const nextName = pad ? (pad.id || 'Gamepad bağlı') : 'Gamepad bağlı değil'; setGamepadName(prev => prev === nextName ? prev : nextName); };
    check(); window.addEventListener('gamepadconnected', check); window.addEventListener('gamepaddisconnected', check);
    const timer = window.setInterval(check, 700);
    return () => { window.clearInterval(timer); window.removeEventListener('gamepadconnected', check); window.removeEventListener('gamepaddisconnected', check); };
  }, []);

  useEffect(() => {
    const receive = (event) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'SUMO_ARDUINO_MOTOR') setArduinoCommand({ left: data.left || 0, right: data.right || 0, enabled: true });
      if (data.type === 'SUMO_ARDUINO_LOG') setArduinoStatus(data.message || 'Arduino kodu çalışıyor');
      if (data.type === 'SUMO_ARDUINO_ERROR') { setArduinoStatus(`Kod hatası: ${data.message}`); setArduinoRunning(false); setArduinoCommand({ left: 0, right: 0, enabled: false }); }
      if (data.type === 'SUMO_SENSOR_DATA' && runtimeFrame.current?.contentWindow) {
        runtimeFrame.current.contentWindow.postMessage({ type: 'SUMO_SENSOR_DATA', sensors: data.sensors, dipSwitches }, '*');
      }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [dipSwitches]);

  const makeArduinoRuntime = (sketch) => {
    const safeSketch = JSON.stringify(sketch).replace(/</g, '\\u003c');
    return `<!doctype html><html><body><script>
      const sketchSource=${safeSketch};
      const pins={}, modes={}, sensors={edge:[false,false,false,false,false],opponent:[false,false,false],dip:[false,false,false]};
      const HIGH=1,LOW=0,OUTPUT=1,INPUT=0,INPUT_PULLUP=2,A0='A0',A1='A1',A2='A2',A3='A3',A4='A4',A5='A5';
      const send=(type,extra={})=>parent.postMessage({type,...extra},'*');
      const api={HIGH,LOW,OUTPUT,INPUT,INPUT_PULLUP,A0,A1,A2,A3,A4,A5,
        pinMode:(p,m)=>modes[p]=m, digitalWrite:(p,v)=>pins[p]=v?1:0,
        analogWrite:(p,v)=>pins[p]=Math.max(0,Math.min(255,Number(v)||0)),
        digitalRead:(p)=>{if(p===2||p==='2')return sensors.opponent[0]?1:0;if(p===3||p==='3')return sensors.opponent[1]?1:0;if(p===11||p==='11')return sensors.opponent[2]?1:0;if(p===12||p==='12')return sensors.dip[0]?1:0;if(p===13||p==='13')return sensors.dip[1]?1:0;if(p===A5||p==='A5')return sensors.dip[2]?1:0;return pins[p]||0;},
        analogRead:(p)=>{const i=[A0,A1,A2,A3,A4].indexOf(p);return i>=0?(sensors.edge[i]?850:120):0;},
        delay:()=>{},delayMicroseconds:()=>{},millis:()=>performance.now()|0,micros:()=>Math.floor(performance.now()*1000),
        constrain:(v,a,b)=>Math.max(a,Math.min(b,v)),map:(v,a,b,c,d)=>(v-a)*(d-c)/(b-a)+c,abs:Math.abs,min:Math.min,max:Math.max,sqrt:Math.sqrt,pow:Math.pow,
        Serial:{begin:()=>{},print:(v)=>send('SUMO_ARDUINO_LOG',{message:String(v)}),println:(v)=>send('SUMO_ARDUINO_LOG',{message:String(v??'Seri port hazır')}),available:()=>0,read:()=>-1}
      };
      const transformed=sketchSource.replace(/^\\s*#include[^\\n]*$/gm,'').replace(/^\\s*#define\\s+(\\w+)\\s+(.+)$/gm,'const $1 = $2;')
        .replace(/\\bvoid\\s+(setup|loop)\\s*\\(/g,'function $1(')
        .replace(/\\b(?:void|int|bool|boolean|byte|float|double|long|String)\\s+([A-Za-z_$][\\w$]*)\\s*\\(/g,'function $1(')
        .replace(/\\b(?:unsigned\\s+long|unsigned\\s+int|int|bool|boolean|byte|float|double|long|String|char)\\s+([A-Za-z_$][\\w$]*)(?=\\s*[,\\)])/g,'$1')
        .replace(/\\bconst\\s+(?:unsigned\\s+long|unsigned\\s+int|long|int|bool|boolean|byte|float|double|String|char)\\s+/g,'const ')
        .replace(/\\b(?:unsigned\\s+long|unsigned\\s+int|long|int|bool|boolean|byte|float|double|String|char)\\s+/g,'let ');
      let setupFn,loopFn;
      try { const factory=new Function('A','with(A){'+transformed+';return {setup:typeof setup===\"function\"?setup:()=>{},loop:typeof loop===\"function\"?loop:()=>{}}}');const f=factory(api);setupFn=f.setup;loopFn=f.loop;setupFn();send('SUMO_ARDUINO_LOG',{message:'setup() çalıştı · loop() başlatıldı'}); }
      catch(e){send('SUMO_ARDUINO_ERROR',{message:e.message});}
      let latest=null, runtimeActive=true;
      addEventListener('message',e=>{if(e.data?.type==='SUMO_STOP_SKETCH'){runtimeActive=false;send('SUMO_ARDUINO_MOTOR',{left:0,right:0});} if(e.data?.type==='SUMO_SENSOR_DATA'){latest=e.data.sensors;sensors.edge=latest.edge;sensors.opponent=latest.opponent;sensors.dip=e.data.dipSwitches||[false,false,false];}});
      function motorValue(pwm,a,b){const power=Number(pins[pwm]||0)/255;return ((pins[a]||0)?1:0)===((pins[b]||0)?1:0)?0:((pins[a]||0)?1:-1)*power;}
      setInterval(()=>{if(!loopFn||!runtimeActive)return;try{loopFn();const left=motorValue(5,7,8),right=motorValue(6,9,10);send('SUMO_ARDUINO_MOTOR',{left,right});}catch(e){send('SUMO_ARDUINO_ERROR',{message:e.message});loopFn=null;}},20);
    <\/script></body></html>`;
  };

  const startArduino = () => {
    if (language !== 'Arduino C++') { setArduinoStatus('Arduino C++ dilini seçmelisin.'); return; }
    setArduinoCommand({ left: 0, right: 0, enabled: false });
    setRuntimeDoc(makeArduinoRuntime(code)); setArduinoRunning(true); setArduinoStatus('Arduino kodu başlatılıyor…');
    setMode('ARDUINO'); setRunning(true); setTab('sim');
  };
  const stopArduino = () => { runtimeFrame.current?.contentWindow?.postMessage({ type: 'SUMO_STOP_SKETCH' }, '*'); setArduinoRunning(false); setArduinoCommand({ left: 0, right: 0, enabled: false }); setArduinoStatus('Arduino kodu durduruldu'); };

  const partsWeight = useMemo(() => selectedParts.reduce((sum, name) => sum + (partCatalog.find(p => p.name === name)?.weight || 0), 0), [selectedParts]);
  const totalWeight = partsWeight + bodyWeight;
  const weightLimit = ROBOT_PROFILES[robotClass]?.limit || 500;
  const rivalPartsWeight = rivalSelectedParts.reduce((sum, name) => sum + (partCatalog.find(p => p.name === name)?.weight || 0), 0);
  const rivalTotalWeight = rivalPartsWeight + rivalBodyWeight;
  const rivalWeightLimit = ROBOT_PROFILES[rivalClass]?.limit || 500;
  const selectedTactic = dipValue(dipSwitches);
  const applyTactic = (value) => setDipSwitches(TACTIC_PRESETS[Number(value)]?.bits || [false,false,false]);
  const applyRobotProfile = (nextClass) => { const profile=ROBOT_PROFILES[nextClass] || ROBOT_PROFILES['Mini Sumo (500 g)']; setRobotClass(nextClass); setBodyWeight(profile.body); setSelectedParts(profile.parts); setArenaSize(profile.arena); setArenaDiameterCm(profile.diameter); setBladeType(profile.blade || 'Standart kama'); setResetKey(v=>v+1); setRunning(false); };
  const applyRivalProfile = (nextClass) => { const profile=ROBOT_PROFILES[nextClass] || ROBOT_PROFILES['Mini Sumo (500 g)']; setRivalClass(nextClass); setRivalBodyWeight(profile.body); setRivalSelectedParts(profile.parts); setRivalBladeType(profile.blade || 'Standart kama'); setResetKey(v=>v+1); setRunning(false); };
  const weightOk = totalWeight <= weightLimit;

  const saveProject = () => {
    localStorage.setItem('pars-sumo-lab-project', JSON.stringify({ robotName, robotClass, robotColor, bladeType, selectedParts, bodyWeight, arenaSize, arenaDiameterCm, dipSwitches, playerHeading, rivalHeading, playerPosition, rivalPosition, rivalName, rivalClass, rivalColor, rivalBladeType, rivalSelectedParts, rivalBodyWeight, playerOpponentSensorCount, rivalOpponentSensorCount, driveSpec, rivalDriveSpec }));
    setSaved(true); window.setTimeout(() => setSaved(false), 1800);
  };
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
    catch { const area = document.querySelector('.code-editor'); area?.select(); }
  };
  const downloadCode = () => {
    const ext = language === 'JavaScript' ? 'js' : 'ino';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `${robotName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.${ext}`; a.click(); URL.revokeObjectURL(url);
  };
  const togglePart = name => setSelectedParts(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Swords size={21}/></div><div><div className="brand-name">PARS<span> SUMOLAB</span></div><div className="brand-sub">ROBOTİK SİMÜLASYON ATÖLYESİ</div></div></div>
      <nav className="topnav">
        <button className={tab === 'sim' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('sim')}><Layers3 size={16}/> Simülatör</button>
        <button className={tab === 'design' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('design')}><Bot size={16}/> Robot tasarımı</button>
        <button className={tab === 'code' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('code')}><Code2 size={16}/> Kod laboratuvarı</button>
        <button className={tab === 'parts' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('parts')}><Cpu size={16}/> Bileşenler</button>
      </nav>
      <div className="top-actions"><span className="save-state"><span/> Tarayıcıda çalışıyor</span><button className="icon-btn" title="Projeyi kaydet" onClick={saveProject}><Save size={17}/></button><div className="avatar">PS</div></div>
    </header>

    <main className="workspace">
      <aside className="sidebar">
        <div className="side-label">AKTİF PROJE</div>
        <div className="project-card"><div className="project-icon"><Bot size={20}/></div><div className="project-info"><strong>{robotName}</strong><span>{robotClass} · Yerel proje</span></div><ChevronRight size={15}/></div>
        <div className="side-label section-label">ÇALIŞMA ALANI</div>
        <button onClick={() => setTab('sim')} className={`side-link ${tab === 'sim' ? 'selected' : ''}`}><Target size={17}/> 3B simülatör</button>
        <button onClick={() => setTab('design')} className={`side-link ${tab === 'design' ? 'selected' : ''}`}><Bot size={17}/> Robot tasarımı</button>
        <button onClick={() => setTab('parts')} className={`side-link ${tab === 'parts' ? 'selected' : ''}`}><Cpu size={17}/> Bileşen kütüphanesi</button>
        <button onClick={() => setTab('code')} className={`side-link ${tab === 'code' ? 'selected' : ''}`}><Code2 size={17}/> Kod editörü <span className="soon">JS / C++</span></button>
        <div className="side-label section-label">ROBOT ÖZETİ</div>
        <div className="profile-row"><span>Robot sınıfı</span><strong>{robotClass}</strong></div>
        <div className="profile-row"><span>Referans boyut</span><strong>{ROBOT_PROFILES[robotClass]?.dims}</strong></div><div className="profile-row"><span>Ağırlık tahmini</span><strong>{totalWeight} g</strong></div>
        <div className="profile-row"><span>Kontrol kartı</span><strong>{selectedParts.some(x => x.includes('ESP32')) ? 'ESP32' : selectedParts.includes('Seeed XIAO RP2040') ? 'XIAO RP2040' : selectedParts.includes('Arduino Nano') ? 'Arduino Nano' : 'Arduino UNO'}</strong></div>
        <div className="side-divider"/>
        <div className="side-label">SENSÖR DURUMU</div>
        <div className="sensor-chip"><span className="sensor-dot blue"/> Rakip algılama <b>Simüle</b></div>
        <div className="sensor-chip"><span className="sensor-dot orange"/> Çizgi algılama <b>Simüle</b></div>
        <div className="sidebar-bottom"><div className="help-card"><CircleHelp size={17}/><div><strong>PARS SUMOLAB rehberi</strong><span>Robot tasarla, programla, test et.</span></div></div><div className="version">PARS SUMOLAB <span>v0.20.0 · MOTOR + LASTİK FİZİĞİ</span></div></div>
      </aside>

      <section className="main-content">
        <div className="page-heading"><div><div className="eyebrow">ROBOT GELİŞTİRME ORTAMI <span>/</span> {robotName.toUpperCase()}</div><h1>{tab === 'sim' ? '3B Sumo simülatörü' : tab === 'design' ? 'Robot tasarım laboratuvarı' : tab === 'code' ? 'Kod laboratuvarı' : 'Bileşen kütüphanesi'}</h1><p>{tab === 'sim' ? 'Robotunu sanal dohyo üzerinde sür, rakibe karşı dene ve telemetriyi izle.' : tab === 'design' ? 'Robot sınıfını, rengini ve donanım bileşenlerini yapılandır.' : tab === 'code' ? 'JavaScript algoritması veya Arduino C++ programı hazırla.' : 'Robotuna ekleyeceğin elektronik ve mekanik parçaları seç.'}</p></div>
          <div className="heading-actions"><button className="outline-btn" onClick={saveProject}><Save size={15}/> {saved ? 'Kaydedildi' : 'Projeyi kaydet'}</button><button className="primary-btn" onClick={() => { setRunning(v => !v); setTab('sim'); }}>{running ? <Pause size={16}/> : <Play size={16} fill="currentColor"/>}{running ? 'Simülasyonu duraklat' : 'Simülasyonu başlat'}</button></div>
        </div>

        {tab === 'sim' && <>
          <div className="sim-toolbar"><div className="toolbar-left"><div className="section-icon"><Swords size={17}/></div><div><strong>{robotClass} Dohyo</strong><span>{arenaDiameterCm} cm çap · {arenaSize === 'micro' ? 'Micro' : arenaSize === 'mega' ? 'Mega' : 'Mini'} Sumo arena profili</span></div><span className={`status-pill ${running ? 'status-running' : ''}`}><i/> {running ? 'CANLI' : 'HAZIR'}</span></div><div className="toolbar-right"><button className="tool-btn" onClick={() => { setResetKey(v => v + 1); setRunning(false); setTelemetry({distance:'—',speed:0,mode,collisions:0,edge:'GÜVENLİ'}); }}><RotateCcw size={15}/> Sıfırla</button><button className="tool-btn" onClick={() => setRunning(false)}><Pause size={15}/> Durdur</button><button className="tool-btn active-tool" onClick={() => setRunning(true)}><Play size={14}/> Başlat</button></div></div>
          <div className="arena-wrap">{telemetry.winner && <div className={`arena-winner-overlay ${telemetry.winner === 'BERABERE' ? 'draw-winner' : telemetry.winner === 'SEN KAZANDIN' ? 'player-winner' : 'rival-winner'}`}><Trophy size={18}/><div><small>{telemetry.winner === 'BERABERE' ? 'MAÇ SONUCU' : 'KAZANAN ROBOT'}</small><strong>{telemetry.winner === 'BERABERE' ? 'BERABERE' : telemetry.winner === 'SEN KAZANDIN' ? robotName : rivalName}</strong><span>{telemetry.finishReason}</span></div><button className="winner-new-match" onClick={()=>{setRunning(false);setResetKey(v=>v+1);setTelemetry({distance:'—',speed:0,mode,collisions:0,edge:'GÜVENLİ'});}}>Yeni maç</button></div>}<Arena running={running} speed={speed} mode={mode} driveInput={rcInput} arduinoCommand={arduinoCommand} dipSwitches={dipSwitches} resetKey={resetKey} onTelemetry={setTelemetry} robotColor={robotColor} arenaSize={arenaSize} arenaDiameterCm={arenaDiameterCm} bladeType={bladeType} robotClass={robotClass} totalWeight={totalWeight} rivalRobotClass={rivalClass} rivalTotalWeight={rivalTotalWeight} rivalColor={rivalColor} rivalBladeType={rivalBladeType} playerOpponentSensorCount={playerOpponentSensorCount} rivalOpponentSensorCount={rivalOpponentSensorCount} driveSpec={driveSpec} rivalDriveSpec={rivalDriveSpec} playerHeading={playerHeading} rivalHeading={rivalHeading} playerPosition={playerPosition} rivalPosition={rivalPosition} onPlacementChange={({player,rival,playerHeading:ph,rivalHeading:rh})=>{setPlayerPosition(player);setRivalPosition(rival);if(Number.isFinite(ph))setPlayerHeading(Math.round(ph));if(Number.isFinite(rh))setRivalHeading(Math.round(rh));}}/></div>
          <div className="panel placement-panel"><div className="placement-heading"><div><Target size={17}/><strong>Robot yerleşimi ve yönü</strong></div><span>{running ? 'Yerleşim için simülasyonu durdur' : 'Dohyo üzerinde sürükle veya açı ayarla'}</span></div><div className="placement-grid"><div className="heading-control"><div className="heading-label"><b>OYUNCU ROBOTU</b><strong>{playerHeading}°</strong></div><input aria-label="Oyuncu robotu yönü" className="range" type="range" min="0" max="359" step="1" value={playerHeading} disabled={running} onChange={e=>setPlayerHeading(Number(e.target.value))}/><div className="heading-presets">{[[0,'↑'],[90,'→'],[180,'↓'],[270,'←']].map(([v,l])=><button key={v} disabled={running} className={playerHeading===v?'chosen':''} onClick={()=>setPlayerHeading(v)}>{l} {v}°</button>)}</div></div><div className="heading-control rival-heading"><div className="heading-label"><b>RAKİP ROBOTU</b><strong>{rivalHeading}°</strong></div><input aria-label="Rakip robotu yönü" className="range" type="range" min="0" max="359" step="1" value={rivalHeading} disabled={running} onChange={e=>setRivalHeading(Number(e.target.value))}/><div className="heading-presets">{[[0,'↑'],[90,'→'],[180,'↓'],[270,'←']].map(([v,l])=><button key={v} disabled={running} className={rivalHeading===v?'chosen':''} onClick={()=>setRivalHeading(v)}>{l} {v}°</button>)}</div></div></div><div className="placement-drag-help"><Target size={15}/><span>Simülasyon duruyken robotu sol tuşla sürükle; sürüklemeyi bırakmadan fare tekerleğini çevirerek aynı anda döndür. Q / E tuşları da seçili robotu döndürür. Dokunmatik ekranda açı kaydırıcısını kullan.</span></div><div className="placement-actions"><button className="outline-btn" disabled={running} onClick={()=>{setPlayerPosition({x:-0.52,z:0});setRivalPosition({x:0.52,z:0});setPlayerHeading(90);setRivalHeading(270);setResetKey(v=>v+1);}}>Başlangıç yerleşimini sıfırla</button><small>Robotlar dohyo sınırları içinde tutulur. Konum değişiklikleri simülasyon duruyorken yapılır.</small></div></div>
          <div className="bottom-panels">
            <div className="panel control-panel"><div className="panel-title"><div><Gauge size={17}/><strong>Robot kontrolü</strong></div><span className="muted-tag">OYUNCU 1</span></div>{mode === 'ARDUINO' && <div className="arduino-live-strip"><span className="sensor-dot blue"/> Arduino kodu aktif <div className="dip-live">{dipSwitches.map((on,i)=><button key={i} className={on?'on':''} onClick={()=>setDipSwitches(prev=>prev.map((v,j)=>j===i?!v:v))}>SW{i+1}: {on?'ON':'OFF'}</button>)}</div><button onClick={stopArduino}>Kodu durdur</button></div>}<div className="mode-switch"><button className={mode === 'RC' ? 'mode-active' : ''} onClick={() => { stopArduino(); setMode('RC'); }}>RC / Manuel</button><button className={mode === 'AUTO' ? 'mode-active' : ''} onClick={() => { stopArduino(); setMode('AUTO'); setRcInput({ throttle: 0, steer: 0, throttleActive: false, steerActive: false }); }}>Otonom</button></div><div className="tactic-quick"><label>3'lü DIP taktiği <em>Otonom / Arduino modunda</em></label><select className="select-input" value={selectedTactic} onChange={e => applyTactic(e.target.value)}>{TACTIC_PRESETS.map((t,i)=><option key={i} value={i}>{i.toString(2).padStart(3,'0')} · {t.name}</option>)}</select><small>{TACTIC_PRESETS[selectedTactic].description}</small><div className="tactic-mini-switches">{dipSwitches.map((on,i)=><button key={i} className={on?'on':''} onClick={()=>setDipSwitches(prev=>prev.map((v,j)=>j===i?!v:v))}>SW{i+1} {on?'ON':'OFF'}</button>)}</div></div><div className="speed-row"><label>Motor gücü</label><strong>{speed}%</strong></div><input className="range" type="range" min="10" max="100" step="5" value={speed} onChange={e => setSpeed(+e.target.value)}/><div className="range-labels"><span>Hassas</span><span>Maksimum</span></div>{mode === 'RC' ? <><div className="rc-console"><VirtualStick title="SOL STICK" axis="throttle" onChange={(v, active) => setRcInput(prev => ({ ...prev, throttle: v, throttleActive: active }))}/><VirtualStick title="SAĞ STICK" axis="steer" onChange={(v, active) => setRcInput(prev => ({ ...prev, steer: v, steerActive: active }))}/></div><div className="keyboard-hint"><Keyboard size={15}/><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>klavye veya sanal kumanda</span></div><div className="gamepad-status"><span className={`sensor-dot ${gamepadName === 'Gamepad bağlı değil' ? 'orange' : 'blue'}`}/><span>{gamepadName}</span><small>USB / Bluetooth gamepad</small></div></> : <div className="auto-status"><span className="sensor-dot blue"/> Otonom sürüş aktif: çizgi sensörü öncelikli, rakip arama ve saldırı otomatik.</div>}</div>
            <div className="panel telemetry-panel"><div className="panel-title"><div><Radio size={17}/><strong>Canlı telemetri</strong></div><span className="live-label"><i/> SİMÜLASYON</span></div><div className="metrics"><div className="metric"><span>Rakibe mesafe</span><strong>{telemetry.distance}<small> m</small></strong></div><div className="metric"><span>Motor gücü</span><strong>{telemetry.speed}<small> %</small></strong></div><div className="metric"><span>Temas sayısı</span><strong>{telemetry.collisions || 0}</strong></div><div className="metric"><span>İtme teması</span><strong>{telemetry.pushes || 0}</strong></div></div><div className="telemetry-foot"><span className={`sensor-dot ${telemetry.edge === 'UYARI' ? 'orange' : 'blue'}`}/> Ring sınırı <b>{telemetry.edge || 'GÜVENLİ'}</b><span className="sensor-dot orange"/> Rakip sensörü <b>Aktif</b><span className="sensor-dot blue"/> Çizgi sensörü <b>{telemetry.lineSensors || 'Hazır'}</b>{(telemetry.playerTipped||telemetry.rivalTipped)&&<><span className="sensor-dot orange"/><b>TAKLA / DEVRİLME</b></>}</div></div>
          </div>
          <div className="notice-line"><ShieldCheck size={15}/> Fizik modeli eğitim amaçlıdır. Sınıf ağırlıkları ve dohyo ölçüleri organizasyonun güncel teknik şartnamesine göre doğrulanmalıdır.</div>
        </>}

        {tab === 'design' && <div className="design-grid">
          <div className="panel design-panel"><div className="panel-title"><div><Bot size={18}/><strong>Robot kimliği</strong></div><span className="muted-tag">ÖZELLEŞTİR</span></div>
            <label className="field-label">Robot adı</label><input className="text-input" value={robotName} maxLength={24} onChange={e => setRobotName(e.target.value)}/>
            <label className="field-label">Robot sınıfı</label><select className="select-input" value={robotClass} onChange={e => applyRobotProfile(e.target.value)}><option>Pico Sumo (50 g)</option><option>Micro Sumo (100 g)</option><option>Mini Sumo (500 g)</option><option>1 Kg Sumo</option><option>Klasik 1 Kg Sumo</option><option>Mega Sumo (3 Kg)</option><option>Açık Sınıf (5 Kg)</option><option>LEGO Sumo (1 Kg)</option><option>RC Sumo (500 g)</option></select>
            <label className="field-label">Gövde ağırlığı <strong>{bodyWeight} g</strong></label><input className="range" type="range" min="5" max={Math.max(20,Math.min(2000,weightLimit-partsWeight))} step="5" value={bodyWeight} onChange={e => setBodyWeight(Number(e.target.value))}/><div className="range-labels"><span>Hafif gövde · 5 g</span><span>Azami gövde · {Math.max(20,Math.min(2000,weightLimit-partsWeight))} g</span></div><p className="muted-copy">Bu değer şasi, üst kapak ve bağlantı elemanlarının toplam ağırlığını temsil eder. Seçili sınıf referans gövde ölçüsü: {ROBOT_PROFILES[robotClass]?.dims}; azami toplam kütle {weightLimit} g.</p>
            <label className="field-label">Gövde rengi</label><div className="color-options">{['#3978ed', '#16a085', '#e34f4f', '#8b5cf6', '#e59b27', '#e5e7eb'].map(c => <button key={c} aria-label={`Renk ${c}`} className={`color-swatch ${robotColor === c ? 'chosen' : ''}`} style={{ background: c }} onClick={() => setRobotColor(c)}/>)}</div>
            <label className="field-label">Ön bıçak / kama tipi</label><select className="select-input" value={bladeType} onChange={e => setBladeType(e.target.value)}><option>Standart kama</option><option>Geniş kama</option><option>Dar hassas kama</option><option>Çift kademeli</option></select><p className="muted-copy">Robotun önündeki alçak metal kama rakibin altına girerek itme avantajı sağlar. 3B modelde +Z yönü robotun önüdür.</p><label className="field-label">Rakip sensörü sayısı <strong>{playerOpponentSensorCount} adet</strong></label><select className="select-input" value={playerOpponentSensorCount} onChange={e=>setPlayerOpponentSensorCount(Number(e.target.value))}>{[2,3,4,5,6,7].map(n=><option key={n} value={n}>{n} adet IR rakip sensörü</option>)}</select><p className="muted-copy">Sensörler ön yarım daireye dağıtılır; yan görüş alanı arttıkça rakibi farklı açılardan yakalama olasılığı yükselir.</p>
            <div className="panel-title"><div><Gauge size={17}/><strong>Motor ve yürüyüş sistemi</strong></div><span className="muted-tag">FİZİK PARAMETRELERİ</span></div>
            <label className="field-label">Motor torku <strong>{driveSpec.motorTorque} mNm / motor</strong></label><input className="range" type="range" min="2" max="40" step="1" value={driveSpec.motorTorque} onChange={e=>setDriveSpec(v=>({...v,motorTorque:Number(e.target.value)}))}/>
            <label className="field-label">Redüksiyon oranı <strong>{driveSpec.gearRatio}:1</strong></label><input className="range" type="range" min="10" max="100" step="5" value={driveSpec.gearRatio} onChange={e=>setDriveSpec(v=>({...v,gearRatio:Number(e.target.value)}))}/>
            <label className="field-label">Motor devri <strong>{driveSpec.motorRpm} RPM</strong></label><input className="range" type="range" min="3000" max="20000" step="500" value={driveSpec.motorRpm} onChange={e=>setDriveSpec(v=>({...v,motorRpm:Number(e.target.value)}))}/>
            <label className="field-label">Tahrik tekerleği çapı <strong>{driveSpec.wheelDiameter} mm</strong></label><input className="range" type="range" min="15" max="60" step="1" value={driveSpec.wheelDiameter} onChange={e=>setDriveSpec(v=>({...v,wheelDiameter:Number(e.target.value)}))}/>
            <label className="field-label">Lastik-dohyo sürtünme katsayısı <strong>{driveSpec.tireMu.toFixed(2)}</strong></label><input className="range" type="range" min="0.3" max="1.5" step="0.05" value={driveSpec.tireMu} onChange={e=>setDriveSpec(v=>({...v,tireMu:Number(e.target.value)}))}/>
            <p className="muted-copy">İki tahrik motorunun toplam çekişi; motor torku, redüksiyon, tekerlek yarıçapı ve lastik tutuşuna göre hesaplanır.</p>
            <label className="field-label">Dohyo sınıfı</label><select className="select-input" value={arenaSize} onChange={e => { const type = e.target.value; setArenaSize(type); setArenaDiameterCm(type === 'micro' ? 38 : type === 'mega' ? 154 : 80); }}><option value="micro">Micro Sumo dohyo</option><option value="mini">Mini Sumo dohyo</option><option value="mega">Mega Sumo dohyo</option></select><label className="field-label">Dohyo genişliği / çapı <strong>{arenaDiameterCm} cm</strong></label><input className="range" type="range" min="30" max="200" step="1" value={arenaDiameterCm} onChange={e => setArenaDiameterCm(Number(e.target.value))}/><div className="range-labels"><span>30 cm</span><span>200 cm</span></div><p className="muted-copy">Dohyo dairesel olarak modellenir. Seçilen sınıf başlangıç ölçüsünü belirler; kaydırıcıyla çapı değiştirebilirsin.</p>
            <button className="primary-btn full-btn" onClick={saveProject}><Save size={15}/>{saved ? 'Proje kaydedildi' : 'Robot ayarlarını kaydet'}</button>
          </div>
          <div className="panel design-panel rival-config-panel"><div className="panel-title"><div><Bot size={18}/><strong>Rakip robot ayarları</strong></div><span className="muted-tag">OYUNCU 2</span></div>
            <label className="field-label">Rakip robot adı</label><input className="text-input" value={rivalName} maxLength={24} onChange={e=>setRivalName(e.target.value)}/>
            <label className="field-label">Robot sınıfı</label><select className="select-input" value={rivalClass} onChange={e=>applyRivalProfile(e.target.value)}>{Object.keys(ROBOT_PROFILES).map(name=><option key={name}>{name}</option>)}</select>
            <label className="field-label">Gövde / şasi ağırlığı <strong>{rivalBodyWeight} g</strong></label><input className="range" type="range" min="5" max={Math.max(20,Math.min(2000,rivalWeightLimit-rivalPartsWeight))} step="5" value={rivalBodyWeight} onChange={e=>setRivalBodyWeight(Number(e.target.value))}/>
            <div className="rival-weight-summary">Toplam tahmini ağırlık: <b>{rivalTotalWeight} / {rivalWeightLimit} g</b> {rivalTotalWeight>rivalWeightLimit?'· Limit aşıldı':'· Limit içinde'}</div>
            <label className="field-label">Gövde rengi</label><div className="color-options">{['#d84b4b','#3978ed','#16a085','#8b5cf6','#e59b27','#e5e7eb'].map(c=><button key={c} aria-label={`Rakip rengi ${c}`} className={`color-swatch ${rivalColor===c?'chosen':''}`} style={{background:c}} onClick={()=>setRivalColor(c)}/>)}</div>
            <label className="field-label">Ön bıçak / kama tipi</label><select className="select-input" value={rivalBladeType} onChange={e=>setRivalBladeType(e.target.value)}><option>Standart kama</option><option>Geniş kama</option><option>Dar hassas kama</option><option>Çift kademeli</option><option>Uzun alçak kama</option></select>
            <label className="field-label">Rakip sensörü sayısı <strong>{rivalOpponentSensorCount} adet</strong></label><select className="select-input" value={rivalOpponentSensorCount} onChange={e=>setRivalOpponentSensorCount(Number(e.target.value))}>{[2,3,4,5,6,7].map(n=><option key={n} value={n}>{n} adet IR rakip sensörü</option>)}</select><p className="muted-copy">Sensörler rakip robotun ön ve yan görüş alanını belirler.</p><label className="field-label">Donanım bileşenleri</label><div className="rival-parts-list">{partCatalog.map(part=><label key={part.name}><input type="checkbox" checked={rivalSelectedParts.includes(part.name)} onChange={()=>setRivalSelectedParts(prev=>prev.includes(part.name)?prev.filter(x=>x!==part.name):[...prev,part.name])}/><span>{part.name}</span><b>{part.weight} g</b></label>)}</div>
            <button className="primary-btn full-btn" onClick={()=>{setResetKey(v=>v+1);setRunning(false);saveProject();}}>Rakip ayarlarını uygula</button>
          </div>
          <div className="panel weight-panel"><div className="panel-title"><div><Weight size={18}/><strong>Ağırlık kontrolü</strong></div><span className={`weight-status ${weightOk ? 'ok' : 'over'}`}>{weightOk ? 'LİMİT İÇİNDE' : 'LİMİT AŞILDI'}</span></div><div className="weight-number">{totalWeight}<small> / {weightLimit} g</small></div><div className="weight-track"><span style={{ width: `${Math.min(100, totalWeight / weightLimit * 100)}%` , background: weightOk ? '#22c58b' : '#ef6464' }}/></div><p className="muted-copy">Pico 50 g, Micro 100 g, Mini 500 g, 1 kg, Mega 3 kg, açık sınıf, LEGO ve RC formatları desteklenir. Sınıf adları ve limitler organizasyonun teknik şartnamesine göre değişebilir.</p><div className="weight-list">{selectedParts.map(name => <div key={name}><span>{name}</span><b>{partCatalog.find(p => p.name === name)?.weight || 0} g</b></div>)}<div><span>Gövde / şasi ağırlığı</span><b>{bodyWeight} g</b></div><div><span>Elektronik ve mekanik bileşenler</span><b>{partsWeight} g</b></div></div><button className="outline-btn full-btn" onClick={() => setTab('parts')}>Bileşenleri düzenle <ChevronRight size={15}/></button></div>
        </div>}

        {tab === 'code' && <div className="panel code-workspace"><div className="code-toolbar"><div><TerminalSquare size={18}/><strong>Robot programı</strong><span className="muted-tag">KOD ŞABLONU</span></div><select value={language} onChange={e => setLanguage(e.target.value)}><option>JavaScript</option><option>Arduino C++</option></select></div><div className="code-note"><Zap size={16}/> Arduino C++ için temel Arduino API uyumluluk katmanı aktiftir. Yaygın pinMode, digitalRead, analogRead, digitalWrite, analogWrite, setup() ve loop() yapıları desteklenir; tüm Arduino kütüphaneleri ve donanım sürücüleri desteklenmez.</div><textarea className="code-editor" spellCheck="false" value={code} onChange={e => setCode(e.target.value)} aria-label="Robot kod editörü"/><div className="code-footer"><span>UTF-8 · {language} · {code.split('\n').length} satır</span><div className="code-actions"><button className="outline-btn" onClick={copyCode}>{copied ? <Check size={15}/> : <Copy size={15}/>} {copied ? 'Kopyalandı' : 'Kopyala'}</button><button className="outline-btn" onClick={downloadCode}><Download size={15}/> Dosyayı indir</button><button className="primary-btn" onClick={startArduino}><Play size={15}/> Arduino kodunu çalıştır</button></div></div><div className="arduino-lab"><div className="arduino-head"><strong><Cpu size={16}/> 3'LÜ DIP-SWITCH TAKTİK SEÇİCİ</strong><span>Arduino pinleri: D12 · D13 · A5</span></div><div className="tactic-select-row"><label>Hazır taktik profili</label><select className="select-input" value={selectedTactic} onChange={e=>applyTactic(e.target.value)}>{TACTIC_PRESETS.map((t,i)=><option key={i} value={i}>{i.toString(2).padStart(3,'0')} · {t.name}</option>)}</select><small>{TACTIC_PRESETS[selectedTactic].description}</small></div><div className="dip-switches">{dipSwitches.map((on,i)=><button key={i} className={`dip-switch ${on?'dip-on':''}`} onClick={()=>setDipSwitches(prev=>prev.map((v,j)=>j===i?!v:v))}><span className="dip-track"><i/></span><b>SW{i+1}</b><small>{on?'ON':'OFF'}</small></button>)}</div><div className="dip-binary">Taktik kodu (SW3-SW2-SW1): <b>{dipSwitches.slice().reverse().map(v=>v?'1':'0').join('')}</b> · Decimal: <b>{selectedTactic}</b><span>Örnek: digitalRead(12), digitalRead(13), digitalRead(A5)</span></div><div className="arduino-run-row"><div><b>{arduinoStatus}</b><small>3 DIP anahtarı kod tarafından dijital giriş olarak okunur.</small></div><button className="outline-btn" onClick={stopArduino}><Pause size={14}/> Kodu durdur</button></div></div></div>}

        {tab === 'parts' && <div className="panel parts-workspace"><div className="panel-title"><div><Package size={18}/><strong>Donanım bileşenleri</strong></div><span className="muted-tag">{selectedParts.length} PARÇA SEÇİLİ</span></div><p className="parts-intro">Robotunda kullanacağın parçaları seç. Seçimler ağırlık hesabına ve robot profiline yansır.</p><div className="parts-grid">{partCatalog.map(part => { const Icon = part.icon; const active = selectedParts.includes(part.name); return <button key={part.name} className={`part-card ${active ? 'part-selected' : ''}`} onClick={() => togglePart(part.name)}><div className="part-icon"><Icon size={20}/></div><div className="part-copy"><strong>{part.name}</strong><span>{part.category} · {part.detail}</span></div><div className="part-weight">{part.weight} g</div><div className={`part-check ${active ? 'checked' : ''}`}>{active ? <Check size={13}/> : '+'}</div></button>; })}</div><div className="parts-summary"><div><span>Toplam robot ağırlığı</span><strong>{totalWeight} g</strong></div><div><span>İzin verilen ağırlık</span><strong>{weightLimit} g</strong></div><button className="primary-btn" onClick={() => { saveProject(); setTab('design'); }}><Save size={15}/> Seçimleri kaydet</button></div></div>}

        <footer className="main-footer"><span>PARS SUMOLAB · Robot sumo eğitim ve simülasyon platformu</span><span>v0.20.0 · Motor, redüksiyon ve lastik fiziği</span></footer>
      </section>
    </main>
    <iframe ref={runtimeFrame} title="Arduino kod çalışma alanı" sandbox="allow-scripts" srcDoc={runtimeDoc} className="arduino-runtime-frame"/>
  </div>;
}
