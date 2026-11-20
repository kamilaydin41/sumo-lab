import { useEffect, useMemo, useState } from 'react';
import {
  Swords, Bot, Cpu, Code2, Play, Pause, RotateCcw, Gauge, Radio, Settings2,
  Layers3, Wifi, TerminalSquare, Zap, Target, Download, Copy, Check, ChevronRight,
  CircleHelp, BatteryCharging, Ruler, Weight, Activity, CircleDot, Save, BookOpen,
  SlidersHorizontal, Trophy, Keyboard, ShieldCheck, Package
} from 'lucide-react';
import Arena from './components/Arena.jsx';

const jsStarter = `// SUMO LAB v0.3.0 | JavaScript sumo kontrol algoritması
// Simülatörün beş çizgi sensörüne ve iki rakip sensörüne göre örnek davranış.

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

const cppStarter = `// SUMO LAB v0.3.0 | Arduino C++ örnek sumo algoritması
// Örnek kart: Arduino UNO + TB6612FNG
// QTR/çizgi sensörleri: ön-sol A0, ön-orta A1, ön-sağ A2, arka-sol A3, arka-sağ A4
// Rakip IR sensörleri: sol D2, ön D3, sağ D11

const int PWMA=5, AIN1=7, AIN2=8;
const int PWMB=6, BIN1=9, BIN2=10, STBY=4;
const int OPP_LEFT=2, OPP_FRONT=3, OPP_RIGHT=11;
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
  motor(0,0);
}

void loop() {
  bool fl=analogRead(EDGE_FL)>EDGE_THRESHOLD;
  bool fc=analogRead(EDGE_FC)>EDGE_THRESHOLD;
  bool fr=analogRead(EDGE_FR)>EDGE_THRESHOLD;
  bool rl=analogRead(EDGE_RL)>EDGE_THRESHOLD;
  bool rr=analogRead(EDGE_RR)>EDGE_THRESHOLD;
  bool oppL=digitalRead(OPP_LEFT), oppF=digitalRead(OPP_FRONT), oppR=digitalRead(OPP_RIGHT);

  // Çizgi güvenliği saldırıdan önce gelir.
  if(fl || fc || fr) {
    motor(-190,-190); delay(150);
    motor(fl ? 185 : -185, fr ? -185 : 185); delay(170);
  } else if(rl || rr) {
    motor(170,170); delay(120);
  } else if(oppF || (oppL && oppR)) {
    motor(255,255);
  } else if(oppL) {
    motor(105,230);
  } else if(oppR) {
    motor(230,105);
  } else {
    motor(115,-115); // Rakip ara
  }
}`;

const partCatalog = [
  { category: 'Kontrol kartı', name: 'Arduino UNO R3', detail: 'ATmega328P · 5V', weight: 25, icon: Cpu },
  { category: 'Kontrol kartı', name: 'ESP32 DevKit', detail: 'Wi-Fi + Bluetooth · 3.3V', weight: 18, icon: Cpu },
  { category: 'Motor sürücü', name: 'TB6612FNG', detail: 'Çift DC motor sürücü', weight: 3, icon: Zap },
  { category: 'Motor', name: 'N20 metal redüktörlü motor', detail: '6V · 300–1000 RPM', weight: 18, icon: Gauge },
  { category: 'Rakip sensörü', name: 'Dijital IR mesafe sensörü', detail: 'Ön / yan algılama', weight: 4, icon: Radio },
  { category: 'Çizgi sensörü', name: 'QTR-1A yansıtıcı sensör', detail: 'Analog zemin algılama', weight: 2, icon: Target },
  { category: 'Güç kaynağı', name: '2S LiPo batarya', detail: '7.4V · kapasite seçilebilir', weight: 42, icon: BatteryCharging },
  { category: 'Mekanik', name: 'Alüminyum kama', detail: 'Ön itici parça', weight: 28, icon: SlidersHorizontal },
];

const defaultParts = ['Arduino UNO R3', 'TB6612FNG', 'N20 metal redüktörlü motor', 'Dijital IR mesafe sensörü', 'QTR-1A yansıtıcı sensör', '2S LiPo batarya', 'Alüminyum kama'];

export default function App() {
  const [tab, setTab] = useState('sim');
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(75);
  const [mode, setMode] = useState('MANUEL');
  const [resetKey, setResetKey] = useState(0);
  const [language, setLanguage] = useState('JavaScript');
  const [code, setCode] = useState(jsStarter);
  const [robotName, setRobotName] = useState('PARS-01');
  const [robotClass, setRobotClass] = useState('Mini Sumo (500 g)');
  const [robotColor, setRobotColor] = useState('#3978ed');
  const [arenaSize, setArenaSize] = useState('standard');
  const [bladeType, setBladeType] = useState('Standart kama');
  const [selectedParts, setSelectedParts] = useState(defaultParts);
  const [telemetry, setTelemetry] = useState({ distance: '—', speed: 0, mode: 'MANUEL', collisions: 0, edge: 'GÜVENLİ' });
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const savedConfig = JSON.parse(localStorage.getItem('sumo-lab-project') || 'null');
      if (savedConfig) {
        setRobotName(savedConfig.robotName || 'PARS-01');
        setRobotClass(savedConfig.robotClass === 'Mini Sumo' ? 'Mini Sumo (500 g)' : (savedConfig.robotClass || 'Mini Sumo (500 g)'));
        setRobotColor(savedConfig.robotColor || '#3978ed');
        setBladeType(savedConfig.bladeType || 'Standart kama');
        setSelectedParts(savedConfig.selectedParts || defaultParts);
      }
    } catch { /* ignore invalid local project data */ }
  }, []);

  useEffect(() => { setCode(language === 'JavaScript' ? jsStarter : cppStarter); }, [language]);

  const totalWeight = useMemo(() => selectedParts.reduce((sum, name) => sum + (partCatalog.find(p => p.name === name)?.weight || 0), 0) + 95, [selectedParts]);
  const weightLimit = robotClass.startsWith('Pico') ? 50 : robotClass.startsWith('Micro') ? 100 : robotClass.startsWith('1 Kg') || robotClass.startsWith('LEGO') ? 1000 : robotClass.startsWith('Mega') ? 3000 : robotClass.startsWith('Açık') ? 5000 : 500;
  const weightOk = totalWeight <= weightLimit;

  const saveProject = () => {
    localStorage.setItem('sumo-lab-project', JSON.stringify({ robotName, robotClass, robotColor, bladeType, selectedParts }));
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
      <div className="brand"><div className="brand-mark"><Swords size={21}/></div><div><div className="brand-name">SUMO<span>LAB</span></div><div className="brand-sub">ROBOTİK SİMÜLASYON ATÖLYESİ</div></div></div>
      <nav className="topnav">
        <button className={tab === 'sim' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('sim')}><Layers3 size={16}/> Simülatör</button>
        <button className={tab === 'design' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('design')}><Bot size={16}/> Robot tasarımı</button>
        <button className={tab === 'code' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('code')}><Code2 size={16}/> Kod laboratuvarı</button>
        <button className={tab === 'parts' ? 'nav-item active' : 'nav-item'} onClick={() => setTab('parts')}><Cpu size={16}/> Bileşenler</button>
      </nav>
      <div className="top-actions"><span className="save-state"><span/> Tarayıcıda çalışıyor</span><button className="icon-btn" title="Projeyi kaydet" onClick={saveProject}><Save size={17}/></button><div className="avatar">SL</div></div>
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
        <div className="profile-row"><span>Ağırlık tahmini</span><strong>{totalWeight} g</strong></div>
        <div className="profile-row"><span>Kontrol kartı</span><strong>{selectedParts.some(x => x.includes('ESP32')) ? 'ESP32' : 'Arduino UNO'}</strong></div>
        <div className="side-divider"/>
        <div className="side-label">SENSÖR DURUMU</div>
        <div className="sensor-chip"><span className="sensor-dot blue"/> Rakip algılama <b>Simüle</b></div>
        <div className="sensor-chip"><span className="sensor-dot orange"/> Çizgi algılama <b>Simüle</b></div>
        <div className="sidebar-bottom"><div className="help-card"><CircleHelp size={17}/><div><strong>SUMO LAB rehberi</strong><span>Robot tasarla, programla, test et.</span></div></div><div className="version">SUMO LAB <span>v0.3.0 · PHYSICS BETA</span></div></div>
      </aside>

      <section className="main-content">
        <div className="page-heading"><div><div className="eyebrow">ROBOT GELİŞTİRME ORTAMI <span>/</span> {robotName.toUpperCase()}</div><h1>{tab === 'sim' ? '3B Sumo simülatörü' : tab === 'design' ? 'Robot tasarım laboratuvarı' : tab === 'code' ? 'Kod laboratuvarı' : 'Bileşen kütüphanesi'}</h1><p>{tab === 'sim' ? 'Robotunu sanal dohyo üzerinde sür, rakibe karşı dene ve telemetriyi izle.' : tab === 'design' ? 'Robot sınıfını, rengini ve donanım bileşenlerini yapılandır.' : tab === 'code' ? 'JavaScript algoritması veya Arduino C++ programı hazırla.' : 'Robotuna ekleyeceğin elektronik ve mekanik parçaları seç.'}</p></div>
          <div className="heading-actions"><button className="outline-btn" onClick={saveProject}><Save size={15}/> {saved ? 'Kaydedildi' : 'Projeyi kaydet'}</button><button className="primary-btn" onClick={() => { setRunning(v => !v); setTab('sim'); }}>{running ? <Pause size={16}/> : <Play size={16} fill="currentColor"/>}{running ? 'Simülasyonu duraklat' : 'Simülasyonu başlat'}</button></div>
        </div>

        {tab === 'sim' && <>
          <div className="sim-toolbar"><div className="toolbar-left"><div className="section-icon"><Swords size={17}/></div><div><strong>{robotClass} Dohyo</strong><span>Sınıfa göre ölçeklenen arena · itme fiziği</span></div><span className={`status-pill ${running ? 'status-running' : ''}`}><i/> {running ? 'CANLI' : 'HAZIR'}</span></div><div className="toolbar-right"><button className="tool-btn" onClick={() => { setResetKey(v => v + 1); setRunning(false); }}><RotateCcw size={15}/> Sıfırla</button><button className="tool-btn" onClick={() => setRunning(false)}><Pause size={15}/> Durdur</button><button className="tool-btn active-tool" onClick={() => setRunning(true)}><Play size={14}/> Başlat</button></div></div>
          <div className="arena-wrap"><Arena running={running} speed={speed} mode={mode} resetKey={resetKey} onTelemetry={setTelemetry} robotColor={robotColor} arenaSize={arenaSize} bladeType={bladeType} robotClass={robotClass}/></div>
          <div className="bottom-panels">
            <div className="panel control-panel"><div className="panel-title"><div><Gauge size={17}/><strong>Robot kontrolü</strong></div><span className="muted-tag">OYUNCU 1</span></div><div className="mode-switch"><button className={mode === 'MANUEL' ? 'mode-active' : ''} onClick={() => setMode('MANUEL')}>Manuel / RC sürüş</button><button className={mode === 'AUTO' ? 'mode-active' : ''} onClick={() => setMode('AUTO')}>Otonom takip</button></div><div className="speed-row"><label>Motor gücü</label><strong>{speed}%</strong></div><input className="range" type="range" min="10" max="100" step="5" value={speed} onChange={e => setSpeed(+e.target.value)}/><div className="range-labels"><span>Hassas</span><span>Maksimum</span></div><div className="keyboard-hint"><Keyboard size={15}/><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>ok tuşları / gamepad</span></div></div>
            <div className="panel telemetry-panel"><div className="panel-title"><div><Radio size={17}/><strong>Canlı telemetri</strong></div><span className="live-label"><i/> SİMÜLASYON</span></div><div className="metrics"><div className="metric"><span>Rakibe mesafe</span><strong>{telemetry.distance}<small> m</small></strong></div><div className="metric"><span>Motor gücü</span><strong>{telemetry.speed}<small> %</small></strong></div><div className="metric"><span>Temas sayısı</span><strong>{telemetry.collisions || 0}</strong></div><div className="metric"><span>İtme teması</span><strong>{telemetry.pushes || 0}</strong></div></div><div className="telemetry-foot"><span className={`sensor-dot ${telemetry.edge === 'UYARI' ? 'orange' : 'blue'}`}/> Ring sınırı <b>{telemetry.edge || 'GÜVENLİ'}</b><span className="sensor-dot orange"/> Rakip sensörü <b>Aktif</b><span className="sensor-dot blue"/> Çizgi sensörü <b>{telemetry.lineSensors || 'Hazır'}</b></div></div>
          </div>
          {telemetry.winner && <div className="result-banner"><Trophy size={20}/><div><strong>{telemetry.winner}</strong><span>{telemetry.finishReason}</span></div><button className="outline-btn" onClick={() => { setResetKey(v => v + 1); setRunning(false); }}>Yeni maç</button></div>}<div className="notice-line"><ShieldCheck size={15}/> Fizik modeli eğitim amaçlıdır. Sınıf ağırlıkları ve dohyo ölçüleri organizasyonun güncel teknik şartnamesine göre doğrulanmalıdır.</div>
        </>}

        {tab === 'design' && <div className="design-grid">
          <div className="panel design-panel"><div className="panel-title"><div><Bot size={18}/><strong>Robot kimliği</strong></div><span className="muted-tag">ÖZELLEŞTİR</span></div>
            <label className="field-label">Robot adı</label><input className="text-input" value={robotName} maxLength={24} onChange={e => setRobotName(e.target.value)}/>
            <label className="field-label">Robot sınıfı</label><select className="select-input" value={robotClass} onChange={e => setRobotClass(e.target.value)}><option>Pico Sumo (50 g)</option><option>Micro Sumo (100 g)</option><option>Mini Sumo (500 g)</option><option>1 Kg Sumo</option><option>Mega Sumo (3 Kg)</option><option>Açık Sınıf (5 Kg)</option><option>LEGO Sumo (1 Kg)</option><option>RC Sumo (500 g)</option></select>
            <label className="field-label">Gövde rengi</label><div className="color-options">{['#3978ed', '#16a085', '#e34f4f', '#8b5cf6', '#e59b27', '#e5e7eb'].map(c => <button key={c} aria-label={`Renk ${c}`} className={`color-swatch ${robotColor === c ? 'chosen' : ''}`} style={{ background: c }} onClick={() => setRobotColor(c)}/>)}</div>
            <label className="field-label">Ön bıçak / kama tipi</label><select className="select-input" value={bladeType} onChange={e => setBladeType(e.target.value)}><option>Standart kama</option><option>Geniş kama</option><option>Dar hassas kama</option><option>Çift kademeli</option></select><p className="muted-copy">Robotun önündeki alçak metal kama rakibin altına girerek itme avantajı sağlar. 3B modelde +Z yönü robotun önüdür.</p>
            <label className="field-label">Arena profili</label><select className="select-input" value={arenaSize} onChange={e => setArenaSize(e.target.value)}><option value="standard">Standart dohyo</option><option value="training">Antrenman modu</option></select>
            <button className="primary-btn full-btn" onClick={saveProject}><Save size={15}/>{saved ? 'Proje kaydedildi' : 'Robot ayarlarını kaydet'}</button>
          </div>
          <div className="panel weight-panel"><div className="panel-title"><div><Weight size={18}/><strong>Ağırlık kontrolü</strong></div><span className={`weight-status ${weightOk ? 'ok' : 'over'}`}>{weightOk ? 'LİMİT İÇİNDE' : 'LİMİT AŞILDI'}</span></div><div className="weight-number">{totalWeight}<small> / {weightLimit} g</small></div><div className="weight-track"><span style={{ width: `${Math.min(100, totalWeight / weightLimit * 100)}%` , background: weightOk ? '#22c58b' : '#ef6464' }}/></div><p className="muted-copy">Pico 50 g, Micro 100 g, Mini 500 g, 1 kg, Mega 3 kg, açık sınıf, LEGO ve RC formatları desteklenir. Sınıf adları ve limitler organizasyonun teknik şartnamesine göre değişebilir.</p><div className="weight-list">{selectedParts.map(name => <div key={name}><span>{name}</span><b>{partCatalog.find(p => p.name === name)?.weight || 0} g</b></div>)}<div><span>Şasi ve bağlantı elemanları (tahmini)</span><b>95 g</b></div></div><button className="outline-btn full-btn" onClick={() => setTab('parts')}>Bileşenleri düzenle <ChevronRight size={15}/></button></div>
        </div>}

        {tab === 'code' && <div className="panel code-workspace"><div className="code-toolbar"><div><TerminalSquare size={18}/><strong>Robot programı</strong><span className="muted-tag">KOD ŞABLONU</span></div><select value={language} onChange={e => setLanguage(e.target.value)}><option>JavaScript</option><option>Arduino C++</option></select></div><div className="code-note"><Zap size={16}/> Kodunu düzenleyebilir, panoya kopyalayabilir veya dosya olarak indirebilirsin. Simülatör içinde özel kod çalıştırma motoru henüz etkin değildir.</div><textarea className="code-editor" spellCheck="false" value={code} onChange={e => setCode(e.target.value)} aria-label="Robot kod editörü"/><div className="code-footer"><span>UTF-8 · {language} · {code.split('\n').length} satır</span><div className="code-actions"><button className="outline-btn" onClick={copyCode}>{copied ? <Check size={15}/> : <Copy size={15}/>} {copied ? 'Kopyalandı' : 'Kopyala'}</button><button className="primary-btn" onClick={downloadCode}><Download size={15}/> Dosyayı indir</button></div></div></div>}

        {tab === 'parts' && <div className="panel parts-workspace"><div className="panel-title"><div><Package size={18}/><strong>Donanım bileşenleri</strong></div><span className="muted-tag">{selectedParts.length} PARÇA SEÇİLİ</span></div><p className="parts-intro">Robotunda kullanacağın parçaları seç. Seçimler ağırlık hesabına ve robot profiline yansır.</p><div className="parts-grid">{partCatalog.map(part => { const Icon = part.icon; const active = selectedParts.includes(part.name); return <button key={part.name} className={`part-card ${active ? 'part-selected' : ''}`} onClick={() => togglePart(part.name)}><div className="part-icon"><Icon size={20}/></div><div className="part-copy"><strong>{part.name}</strong><span>{part.category} · {part.detail}</span></div><div className="part-weight">{part.weight} g</div><div className={`part-check ${active ? 'checked' : ''}`}>{active ? <Check size={13}/> : '+'}</div></button>; })}</div><div className="parts-summary"><div><span>Seçili bileşen ağırlığı</span><strong>{totalWeight} g</strong></div><div><span>İzin verilen ağırlık</span><strong>{weightLimit} g</strong></div><button className="primary-btn" onClick={() => { saveProject(); setTab('design'); }}><Save size={15}/> Seçimleri kaydet</button></div></div>}

        <footer className="main-footer"><span>SUMO LAB · Eğitim ve prototipleme simülatörü</span><span>v0.3.0 · Aşama 3 / 6</span></footer>
      </section>
    </main>
  </div>;
}
