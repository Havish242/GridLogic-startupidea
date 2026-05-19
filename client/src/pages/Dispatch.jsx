import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const INCIDENTS_DATA = [
  { id: 'INC-001', severity: 'CRITICAL', title: 'Dam Gate Hydraulic Failure', type: 'Hydroelectric Dam', loc: 'Bhakra Dam, HP', lat: '31.4126 N', lng: '76.4304 E', time: '2m ago' },
  { id: 'INC-002', severity: 'HIGH', title: 'Transformer Overload — Zone 4', type: 'Power Substation', loc: 'Chennai Substation, TN', lat: '13.0827 N', lng: '80.2707 E', time: '14m ago' },
  { id: 'INC-003', severity: 'MEDIUM', title: 'Wind Turbine Gearbox Fault', type: 'Wind Turbine', loc: 'Tamil Nadu Wind Farm', lat: '8.1667 N', lng: '77.5667 E', time: '28m ago' },
];

const ENGINEERS_DATA = [
  { id: 'ENG-001', name: 'Arjun Mehta', spec: 'Hydroelectric Dam', dist: '8.2 km', eta: '12 min', certs: ['CEIG', 'CBIP'], status: 'AVAILABLE' },
  { id: 'ENG-003', name: 'Rahul Sharma', spec: 'Wind Turbine', dist: '34.7 km', eta: '45 min', certs: ['CWET', 'IEC'], status: 'AVAILABLE' },
  { id: 'ENG-005', name: 'Kiran Reddy', spec: 'Power Grid', dist: '56.3 km', eta: '1h 10m', certs: ['PGCIL', 'CE'], status: 'AVAILABLE' },
];

const Dispatch = () => {
  const [selectedInc, setSelectedInc] = useState(INCIDENTS_DATA[0]);
  const [assignedEng, setAssignedEng] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mttrTime, setMttrTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setMttrTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const topbarContent = (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3">
        <span className="font-['Share_Tech_Mono'] text-[var(--text-muted)] text-[10px] uppercase tracking-widest">MTTR COUNTER</span>
        <span className="font-['Share_Tech_Mono'] text-2xl text-[var(--amber)] tracking-widest">{formatTime(mttrTime)}</span>
      </div>
      <button className="bg-[var(--red)] text-white px-6 py-2 font-['Barlow_Condensed'] font-bold uppercase tracking-widest hover:bg-red-600 transition-all animate-pulse shadow-[0_0_15px_var(--red-glow)]">EMERGENCY DISPATCH</button>
    </div>
  );

  return (
    <Layout 
      eyebrow="CONTROL CENTER PORTAL / DISPATCH CONTROL" 
      title="ENGINEER DISPATCH CENTER"
      topbarContent={topbarContent}
    >
      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-160px)]">
        
        {/* COLUMN 1: INCIDENT SELECTOR */}
        <div className="flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-base)]">
            <h3 className="text-sm font-bold font-['Barlow_Condensed'] uppercase tracking-widest">SELECT INCIDENT</h3>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-custom">
            {INCIDENTS_DATA.map(inc => (
              <div 
                key={inc.id} 
                onClick={() => { setSelectedInc(inc); setAssignedEng(null); }}
                className={`p-4 border-b border-[var(--border)] cursor-pointer transition-all border-l-4 ${selectedInc?.id === inc.id ? 'bg-[var(--amber-glow)] border-l-[var(--amber)]' : 'hover:bg-white/5 border-l-transparent'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tighter rounded-sm ${inc.severity === 'CRITICAL' ? 'bg-[var(--red)] text-white' : 'bg-[var(--amber)] text-black'}`}>
                    {inc.severity}
                  </span>
                  <span className="font-['Share_Tech_Mono'] text-[var(--text-muted)] text-[9px] uppercase tracking-widest">{inc.time}</span>
                </div>
                <h4 className="font-['Barlow_Condensed'] text-base font-bold uppercase leading-tight mb-1">{inc.title}</h4>
                <div className="text-[10px] text-[var(--text-muted)] font-['Rajdhani'] uppercase tracking-wider">📍 {inc.loc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: INCIDENT DETAIL + AI ANALYSIS */}
        <div className="flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-base)]">
            <h3 className="text-sm font-bold font-['Barlow_Condensed'] uppercase tracking-widest">INCIDENT ANALYSIS</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-custom">
            {selectedInc && (
              <>
                <div>
                  <h2 className="font-['Barlow_Condensed'] text-2xl font-bold uppercase leading-none mb-3 text-[var(--text-primary)]">{selectedInc.title}</h2>
                  <div className="flex gap-4">
                    <span className="bg-[var(--bg-raised)] border border-[var(--border-strong)] px-2 py-1 text-[10px] font-bold text-[var(--cyan)] uppercase tracking-widest">{selectedInc.type}</span>
                    <span className="font-['Share_Tech_Mono'] text-[var(--text-muted)] text-[10px] uppercase flex items-center gap-1">📍 {selectedInc.lat} / {selectedInc.lng}</span>
                  </div>
                </div>

                <div className="bg-[var(--bg-base)] border-l-4 border-[var(--cyan)] p-4 space-y-4">
                  <div className="font-['Share_Tech_Mono'] text-[10px] text-[var(--cyan)] uppercase tracking-[0.2em] font-bold">AI CLASSIFICATION ENGINE</div>
                  <div>
                    <div className="text-xs text-[var(--text-muted)] font-['Share_Tech_Mono'] uppercase mb-1">DAMAGE TYPE</div>
                    <div className="text-lg font-bold text-[var(--amber)] font-['Barlow_Condensed'] uppercase tracking-wider">Hydraulic Seal Fatigue — Phase 3 Failure</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-['Share_Tech_Mono'] text-[18px] text-[var(--text-primary)]">94% <span className="text-[10px] text-[var(--text-muted)] uppercase">Confidence</span></span>
                      <span className="text-[10px] text-[var(--text-muted)] font-['Share_Tech_Mono'] uppercase">EST. REPAIR: 3.5 HOURS</span>
                    </div>
                    <div className="w-full h-1 bg-[var(--bg-raised)]">
                      <div className="h-full bg-[var(--amber)] shadow-[0_0_10px_var(--amber-glow)] w-[94%]"></div>
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] font-['Rajdhani'] leading-relaxed">
                    <span className="text-[var(--amber)] font-bold">RECOMMENDED:</span> Remote gateway bypass + immediate manual pressure release. Structural integrity at risk if unaddressed within 4 hours.
                  </div>
                </div>

                <div className="space-y-4">
                  <SeverityBar label="STRUCTURAL RISK" val={88} />
                  <SeverityBar label="FAILURE PROBABILITY" val={92} />
                  <SeverityBar label="PUBLIC IMPACT" val={45} />
                </div>

                <div className="bg-[var(--green)]/5 border border-[var(--green)]/30 p-4">
                  <div className="text-[10px] text-[var(--green)] font-['Share_Tech_Mono'] uppercase tracking-widest font-bold mb-2">DISPATCH RECOMMENDATION</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-bold font-['Barlow_Condensed'] uppercase tracking-wider text-[var(--text-primary)]">Arjun Mehta</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-['Rajdhani'] uppercase tracking-widest">CLOSEST + CERTIFIED (CBIP) + AVAILABLE</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[var(--text-muted)] font-['Share_Tech_Mono'] uppercase">ETA</div>
                      <div className="text-xl font-bold text-[var(--amber)] font-['Share_Tech_Mono'] uppercase leading-none">12 MIN</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* COLUMN 3: ENGINEER ASSIGNMENT */}
        <div className="flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-base)]">
            <h3 className="text-sm font-bold font-['Barlow_Condensed'] uppercase tracking-widest">ASSIGN ENGINEER</h3>
          </div>
          <div className="p-4 bg-[var(--bg-raised)]">
            <input 
              type="text" 
              placeholder="FILTER BY SPEC OR CERT..." 
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 font-['Share_Tech_Mono'] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--amber)]"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
            {ENGINEERS_DATA.map(eng => (
              <div 
                key={eng.id}
                className={`bg-[var(--bg-base)] border p-4 transition-all ${assignedEng?.id === eng.id ? 'border-[var(--green)] bg-[var(--green)]/5' : 'border-[var(--border-strong)]'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-['Barlow_Condensed'] text-xl font-bold uppercase tracking-wider">{eng.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse"></span>
                    <span className="font-['Share_Tech_Mono'] text-[9px] text-[var(--green)] uppercase font-bold tracking-widest">AVAILABLE</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  <span className="bg-[var(--bg-raised)] border border-[var(--cyan)]/30 px-2 py-0.5 text-[9px] font-bold text-[var(--cyan)] uppercase tracking-tighter rounded-full">{eng.spec}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[9px] text-[var(--text-muted)] font-['Share_Tech_Mono'] uppercase tracking-widest leading-none">DISTANCE</div>
                    <div className="text-sm font-bold text-[var(--amber)] font-['Share_Tech_Mono']">{eng.dist}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-[var(--text-muted)] font-['Share_Tech_Mono'] uppercase tracking-widest leading-none">ETA</div>
                    <div className="text-sm font-bold text-[var(--text-primary)] font-['Share_Tech_Mono']">{eng.eta}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setAssignedEng(eng)}
                  className={`w-full py-2 font-['Barlow_Condensed'] font-extrabold tracking-[0.2em] transition-all uppercase ${assignedEng?.id === eng.id ? 'bg-[var(--green)] text-[var(--bg-void)]' : 'bg-[var(--amber)] text-[var(--bg-void)] hover:bg-[#ffb020]'}`}
                >
                  {assignedEng?.id === eng.id ? 'ASSIGNED ✓' : 'ASSIGN ENGINEER'}
                </button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-base)]">
            <button 
              disabled={!assignedEng}
              onClick={() => setShowModal(true)}
              className={`w-full py-4 font-['Barlow_Condensed'] font-extrabold tracking-[0.2em] transition-all uppercase text-lg ${assignedEng ? 'bg-[var(--amber)] text-[var(--bg-void)] shadow-[0_0_20px_var(--amber-glow)] hover:scale-[1.02] active:scale-[0.98]' : 'bg-[var(--text-muted)] text-[var(--bg-surface)] cursor-not-allowed opacity-50'}`}
            >
              CONFIRM DISPATCH
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-[var(--bg-void)]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-[var(--bg-surface)] border border-[var(--amber)] p-8 w-full max-w-md relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--amber)]"></div>
            <div className="text-center mb-8">
              <div className="text-[var(--amber)] text-5xl mb-4 animate-bounce">⚡</div>
              <h2 className="font-['Barlow_Condensed'] text-3xl font-extrabold uppercase tracking-widest text-[var(--text-primary)] mb-2">DISPATCH CONFIRMED</h2>
              <div className="font-['Share_Tech_Mono'] text-[var(--text-muted)] text-xs tracking-tighter">NETWORK DISPATCH PROTOCOL ALPHA-7 EXECUTED</div>
            </div>
            
            <div className="space-y-4 mb-8">
              <ModalRow label="ENGINEER" value={assignedEng?.name} />
              <ModalRow label="INCIDENT" value={selectedInc?.id} />
              <ModalRow label="ETA" value={assignedEng?.eta} />
            </div>

            <div className="flex items-center gap-3 mb-8 bg-[var(--bg-base)] p-3 border border-[var(--border)]">
              <input type="checkbox" id="sms" defaultChecked className="w-4 h-4 accent-[var(--amber)]" />
              <label htmlFor="sms" className="text-xs font-['Share_Tech_Mono'] text-[var(--text-secondary)] uppercase cursor-pointer">NOTIFY ENGINEER VIA SMS (TWILIO)</label>
            </div>

            <button 
              onClick={() => { setShowModal(false); setAssignedEng(null); }}
              className="w-full bg-[var(--amber)] text-[var(--bg-void)] py-3 font-['Barlow_Condensed'] font-extrabold tracking-[0.2em] uppercase transition-all hover:bg-[#ffb020]"
            >
              CLOSE COMMAND
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

const SeverityBar = ({ label, val }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="font-['Share_Tech_Mono'] text-[9px] text-[var(--text-muted)] uppercase tracking-widest">{label}</span>
      <span className="font-['Share_Tech_Mono'] text-[9px] text-[var(--amber)] uppercase">{val}%</span>
    </div>
    <div className="w-full h-1 bg-[var(--bg-raised)]">
      <div className="h-full bg-[var(--amber)] shadow-[0_0_8px_var(--amber-glow)]" style={{ width: `${val}%` }}></div>
    </div>
  </div>
);

const ModalRow = ({ label, value }) => (
  <div className="flex justify-between border-b border-[var(--border)] pb-2">
    <span className="font-['Share_Tech_Mono'] text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{label}</span>
    <span className="font-['Barlow_Condensed'] text-base font-bold text-[var(--text-primary)] uppercase">{value}</span>
  </div>
);

export default Dispatch;
