import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const INITIAL_SENSORS = [
  { id: 1, name: 'WATER PRESSURE', loc: 'Bhakra Dam', unit: 'MPa', min: 3.8, max: 4.5, base: 4.2 },
  { id: 2, name: 'SEEPAGE RATE', loc: 'Bhakra Dam', unit: 'L/min', min: 0.1, max: 1.2, base: 0.8 },
  { id: 3, name: 'TURBINE RPM', loc: 'Tehri Dam', unit: 'RPM', min: 400, max: 450, base: 428 },
  { id: 4, name: 'GRID VOLTAGE', loc: 'Chennai Sub', unit: 'kV', min: 10.8, max: 11.5, base: 11.2 },
  { id: 5, name: 'WIND SPEED', loc: 'TN Wind Farm', unit: 'km/h', min: 40, max: 80, base: 67 },
  { id: 6, name: 'TRANSFORMER TEMP', loc: 'Chennai Sub', unit: '°C', min: 40, max: 95, base: 84 },
];

const ScadaFeed = () => {
  const [sensors, setSensors] = useState(INITIAL_SENSORS.map(s => ({ 
    ...s, 
    value: s.base, 
    history: Array.from({ length: 10 }, () => ({ val: s.base + (Math.random() - 0.5) * 0.1 }))
  })));
  const [logs, setLogs] = useState([
    { id: Date.now(), time: new Date().toLocaleTimeString('en-US', { hour12: false }), level: 'OK', msg: 'System initialized. Secure link established.' }
  ]);

  useEffect(() => {
    const sensorInterval = setInterval(() => {
      setSensors(prev => prev.map(s => {
        const newVal = s.value + (Math.random() - 0.5) * (s.max - s.min) * 0.1;
        const clampedVal = Math.max(s.min, Math.min(s.max, newVal));
        const newHistory = [...s.history.slice(1), { val: clampedVal }];
        return { ...s, value: clampedVal, history: newHistory };
      }));
    }, 5000);

    const logMessages = [
      { level: 'INFO', msg: 'Sensor WATER_PRESSURE_BHK reading optimized' },
      { level: 'WARN', msg: 'SEEPAGE_RATE_BHK threshold near 0.9 L/min' },
      { level: 'ERROR', msg: 'TRANSFORMER_TEMP_CHN critical: cooling system check recommended' },
      { level: 'OK', msg: 'Engineer ENG-001 location heartbeat received' },
      { level: 'INFO', msg: 'Packet integrity check completed: 100%' },
    ];

    const logInterval = setInterval(() => {
      const randomMsg = logMessages[Math.floor(Math.random() * logMessages.length)];
      setLogs(prev => [{
        id: Date.now(),
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        ...randomMsg
      }, ...prev.slice(0, 49)]);
    }, 3000);

    return () => {
      clearInterval(sensorInterval);
      clearInterval(logInterval);
    };
  }, []);

  const topbarContent = (
    <div className="flex items-center gap-6">
      <div className="border border-[var(--amber)] text-[var(--amber)] px-3 py-1 font-['Share_Tech_Mono'] text-[10px] tracking-widest uppercase rounded-sm bg-[var(--amber-glow)]">SIMULATED DATA</div>
      <div className="flex items-center gap-4 bg-[var(--bg-surface)] p-1 border border-[var(--border)] rounded-sm">
        <Tab label="1s" />
        <Tab label="5s" active />
        <Tab label="10s" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse"></span>
        <span className="font-['Share_Tech_Mono'] text-[10px] text-[var(--text-muted)] uppercase tracking-widest">LIVE PULSE</span>
      </div>
    </div>
  );

  return (
    <Layout 
      eyebrow="CONTROL CENTER PORTAL / IOT TELEMETRY" 
      title="SCADA LIVE FEED"
      topbarContent={topbarContent}
    >
      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-160px)]">
        
        {/* LEFT: SENSOR READINGS GRID */}
        <div className="col-span-2 flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-['Share_Tech_Mono'] text-xs font-bold text-[var(--cyan)] uppercase tracking-[0.3em]">LIVE SENSOR TELEMETRY</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {sensors.map(s => (
              <SensorCard key={s.id} sensor={s} />
            ))}
          </div>

          <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] p-5 relative overflow-hidden flex flex-col justify-center items-center opacity-30 pointer-events-none">
            <div className="font-['Share_Tech_Mono'] text-xs uppercase tracking-widest text-[var(--text-muted)]">GEOSPATIAL SENSOR OVERLAY — MODULE LOCKED</div>
            <div className="text-[10px] uppercase font-bold mt-2">Requires Level 4 Authorization</div>
          </div>
        </div>

        {/* RIGHT: EVENT LOG */}
        <div className="flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-base)] flex items-center justify-between">
            <h3 className="text-sm font-bold font-['Barlow_Condensed'] uppercase tracking-widest">SYSTEM EVENT LOG</h3>
            <span className="flex items-center gap-2 bg-[var(--green)]/10 border border-[var(--green)]/30 px-2 py-0.5 rounded-sm">
              <span className="w-1 h-1 bg-[var(--green)] animate-pulse"></span>
              <span className="font-['Share_Tech_Mono'] text-[9px] text-[var(--green)] uppercase font-bold tracking-widest">LIVE STREAM</span>
            </span>
          </div>
          <div className="flex-1 bg-[#05070C] font-['Share_Tech_Mono'] text-[11px] p-4 overflow-y-auto scrollbar-custom space-y-1">
            {logs.map(log => (
              <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-[var(--text-muted)] shrink-0">[{log.time}]</span>
                <span className={`shrink-0 font-bold ${
                  log.level === 'ERROR' ? 'text-[var(--red)]' : 
                  log.level === 'WARN' ? 'text-[var(--amber)]' : 
                  log.level === 'INFO' ? 'text-[var(--cyan)]' : 'text-[var(--green)]'
                }`}>[{log.level}]</span>
                <span className="text-[var(--text-secondary)]">{log.msg}</span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-base)]">
            <button 
              onClick={() => setLogs([])}
              className="text-[9px] font-['Share_Tech_Mono'] text-[var(--red)] border border-[var(--red)]/30 px-3 py-1 uppercase tracking-widest hover:bg-[var(--red)] hover:text-white transition-all"
            >
              CLEAR LOG
            </button>
          </div>
        </div>

      </div>
    </Layout>
  );
};

const SensorCard = ({ sensor }) => {
  const getSeverity = () => {
    const range = sensor.max - sensor.min;
    const pos = (sensor.value - sensor.min) / range;
    if (pos > 0.8) return 'CRITICAL';
    if (pos > 0.6) return 'WARNING';
    return 'NORMAL';
  };

  const severity = getSeverity();
  const color = severity === 'CRITICAL' ? 'var(--red)' : severity === 'WARNING' ? 'var(--amber)' : 'var(--green)';

  return (
    <div className={`bg-[var(--bg-surface)] border border-[var(--border)] p-4 flex flex-col relative transition-all duration-500 ${severity === 'CRITICAL' ? 'animate-pulse-red border-[var(--red)]' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-['Share_Tech_Mono'] text-[10px] text-[var(--cyan)] uppercase tracking-widest leading-none">{sensor.name}</span>
        <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-tighter ${
          severity === 'CRITICAL' ? 'bg-[var(--red)]/20 text-[var(--red)] border border-[var(--red)]/40' : 
          severity === 'WARNING' ? 'bg-[var(--amber)]/20 text-[var(--amber)] border border-[var(--amber)]/40' : 
          'bg-[var(--green)]/10 text-[var(--green)] border border-[var(--green)]/20'
        }`}>{severity}</span>
      </div>
      <div className="text-[9px] text-[var(--text-muted)] font-['Rajdhani'] uppercase tracking-widest mb-3 leading-none italic">{sensor.loc}</div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="font-['Share_Tech_Mono'] text-3xl font-bold text-[var(--amber)] tracking-tighter">{sensor.value.toFixed(2)}</span>
        <span className="font-['Share_Tech_Mono'] text-[10px] text-[var(--text-muted)] uppercase">{sensor.unit}</span>
      </div>
      <div className="w-full h-1 bg-[var(--bg-raised)] mb-4">
        <div className={`h-full transition-all duration-1000`} style={{ width: `${((sensor.value - sensor.min) / (sensor.max - sensor.min) * 100)}%`, backgroundColor: color }}></div>
      </div>
      <div className="h-8 -mx-4 -mb-4 bg-[var(--bg-void)]/30">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sensor.history}>
            <Line type="monotone" dataKey="val" stroke={color} strokeWidth={1} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Tab = ({ label, active }) => (
  <button className={`px-3 py-1 font-['Share_Tech_Mono'] text-[10px] tracking-widest uppercase transition-all ${active ? 'bg-[var(--amber)] text-[var(--bg-void)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
    {label}
  </button>
);

export default ScadaFeed;
