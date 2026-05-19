import React, { useState, useEffect } from 'react';

const JOBS_DATA = [
  { id: 'INC-001', severity: 'CRITICAL', title: 'Dam Gate Hydraulic Failure', type: 'Hydroelectric Dam', loc: 'Bhakra Dam, HP', dist: '8.2 km', time: '2m ago', est: '3.5h' },
  { id: 'INC-002', severity: 'HIGH', title: 'Transformer Overload — Zone 4', type: 'Power Substation', loc: 'Chennai Substation, TN', dist: '2.1 km', time: '14m ago', est: '1.2h' },
  { id: 'INC-003', severity: 'MEDIUM', title: 'Wind Turbine Gearbox Fault', type: 'Wind Turbine', loc: 'Tamil Nadu Wind Farm', dist: '34.7 km', time: '28m ago', est: '4.0h' },
];

const EngineerPortal = () => {
  const [activeJob, setActiveJob] = useState(JOBS_DATA[0]);
  const [availability, setAvailability] = useState(true);
  const [eta, setEta] = useState(720); // 12 mins in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setEta(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatEta = (seconds) => {
    const hh = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mm = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const ss = (seconds % 60).toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] font-['Rajdhani'] flex flex-col items-center">
      <div className="w-full max-w-[480px] flex-1 flex flex-col pb-20 relative">
        
        {/* TOP NAV BAR */}
        <nav className="bg-[var(--bg-base)] border-b border-[var(--border)] px-6 py-4 sticky top-0 z-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-['Barlow_Condensed'] font-extrabold text-xl tracking-tighter text-[var(--amber)]">GRIDPULSE</span>
              <span className="font-['Share_Tech_Mono'] text-[9px] text-[var(--text-muted)] uppercase tracking-widest mt-1">ENGINEER PORTAL</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--red)] border-2 border-[var(--bg-base)] rounded-full animate-pulse"></span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[var(--amber)] border border-[var(--bg-raised)] flex items-center justify-center font-bold text-[var(--bg-void)] text-xs">AM</div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
            <div>
              <div className="text-[10px] text-[var(--text-muted)] font-['Share_Tech_Mono'] uppercase tracking-widest">FIELD ENGINEER</div>
              <div className="font-['Barlow_Condensed'] font-bold text-lg leading-none uppercase tracking-wide">ARJUN MEHTA</div>
            </div>
            <button 
              onClick={() => setAvailability(!availability)}
              className={`px-4 py-1.5 rounded-full font-['Share_Tech_Mono'] text-[10px] font-bold uppercase tracking-widest transition-all ${availability ? 'bg-[var(--green)]/20 text-[var(--green)] border border-[var(--green)]/40 shadow-[0_0_10px_var(--green-glow)]' : 'bg-[var(--text-muted)]/20 text-[var(--text-muted)] border border-[var(--text-muted)]/40'}`}
            >
              {availability ? '● ACTIVE' : '○ OFFLINE'}
            </button>
          </div>
        </nav>

        <div className="p-4 space-y-6">
          {/* SECTION 1: ACTIVE JOB BANNER */}
          {activeJob && (
            <div className={`border-l-4 p-5 relative overflow-hidden flex flex-col shadow-2xl ${activeJob.severity === 'CRITICAL' ? 'bg-[var(--red)]/5 border-[var(--red)]' : 'bg-[var(--amber)]/5 border-[var(--amber)]'}`}>
              <div className="absolute top-0 right-0 p-3 opacity-10 text-6xl">🚨</div>
              <div className="font-['Share_Tech_Mono'] text-[10px] text-[var(--amber)] uppercase tracking-[0.2em] font-bold mb-2">ACTIVE DISPATCH</div>
              <h2 className="font-['Barlow_Condensed'] text-2xl font-extrabold uppercase leading-tight mb-2 pr-12">{activeJob.title}</h2>
              <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-6">
                <span>📍 {activeJob.loc}</span>
                <span>📏 {activeJob.dist}</span>
              </div>
              <div className="text-center mb-6">
                <div className="text-[10px] text-[var(--text-muted)] font-['Share_Tech_Mono'] uppercase tracking-widest mb-1">ESTIMATED TIME TO ARRIVAL</div>
                <div className="text-4xl font-bold text-[var(--amber)] font-['Share_Tech_Mono'] tracking-[0.1em]">{formatEta(eta)}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <StatusBtn label="EN ROUTE" active />
                <StatusBtn label="ON SITE" />
                <StatusBtn label="RESOLVED" />
              </div>
            </div>
          )}

          {/* SECTION 2: JOB FEED */}
          <section>
            <h3 className="font-['Share_Tech_Mono'] text-[10px] text-[var(--text-muted)] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              AVAILABLE INCIDENTS
              <span className="w-1 h-1 rounded-full bg-[var(--amber)] animate-ping"></span>
            </h3>
            <div className="space-y-4">
              {JOBS_DATA.filter(j => j.id !== activeJob?.id).map(job => (
                <div key={job.id} className="bg-[var(--bg-surface)] border-l-4 p-4 border border-[var(--border)] flex flex-col group active:scale-[0.98] transition-all" style={{ borderLeftColor: job.severity === 'CRITICAL' ? 'var(--red)' : 'var(--amber)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-tighter ${job.severity === 'CRITICAL' ? 'bg-[var(--red)]/20 text-[var(--red)] border border-[var(--red)]/40' : 'bg-[var(--amber)]/20 text-[var(--amber)] border border-[var(--amber)]/40'}`}>
                      {job.severity}
                    </span>
                    <span className="font-['Share_Tech_Mono'] text-[var(--text-muted)] text-[10px]">{job.time}</span>
                  </div>
                  <h4 className="font-['Barlow_Condensed'] text-xl font-bold uppercase leading-tight mb-2 group-active:text-[var(--amber)] transition-colors">{job.title}</h4>
                  <div className="flex items-center justify-between text-xs font-['Rajdhani'] uppercase tracking-wider mb-4">
                    <div className="flex flex-col">
                      <span className="text-[var(--text-muted)] text-[10px] font-['Share_Tech_Mono'] leading-none mb-1">LOCATION / DISTANCE</span>
                      <span>📍 {job.loc} / {job.dist}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[var(--text-muted)] text-[10px] font-['Share_Tech_Mono'] leading-none mb-1">EST. REPAIR</span>
                      <span className="text-[var(--amber)] font-bold">{job.est}</span>
                    </div>
                  </div>
                  <button className="w-full bg-[var(--amber)] text-[var(--bg-void)] py-3 font-['Barlow_Condensed'] font-extrabold tracking-[0.2em] uppercase text-sm">ACCEPT JOB</button>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: MY PROFILE (PREVIEW) */}
          <section className="bg-[var(--bg-surface)] border border-[var(--border)] p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[var(--amber)] flex items-center justify-center font-['Barlow_Condensed'] font-extrabold text-3xl text-[var(--bg-void)] shadow-[0_0_20px_var(--amber-glow)]">AM</div>
              <div>
                <h3 className="font-['Barlow_Condensed'] text-2xl font-extrabold uppercase leading-none mb-1 tracking-wider">ARJUN MEHTA</h3>
                <div className="font-['Share_Tech_Mono'] text-[10px] text-[var(--text-muted)] uppercase tracking-widest">ENG-ID: GPT-4-5001</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-6">
              <MiniStat label="COMPLETED" val="142" />
              <MiniStat label="RATING" val="4.9" color="var(--green)" />
              <MiniStat label="AVG RESP" val="12m" color="var(--cyan)" />
            </div>
            <div className="space-y-4">
              <div className="text-[10px] text-[var(--text-muted)] font-['Share_Tech_Mono'] uppercase tracking-widest border-b border-[var(--border)] pb-2">CREDENTIALS</div>
              <div className="flex flex-wrap gap-2">
                <CredBadge label="CEIG CERTIFIED" valid />
                <CredBadge label="CBIP CLASS 1" valid />
                <CredBadge label="HV SUBSTATION" valid />
                <CredBadge label="GRID ARCH" expired />
              </div>
            </div>
          </section>

          {/* SECTION 4: NOTIFICATION CENTER */}
          <section className="space-y-4">
            <h3 className="font-['Share_Tech_Mono'] text-[10px] text-[var(--text-muted)] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">ALERTS</h3>
            <div className="bg-[var(--bg-surface)] border-l-4 border-[var(--red)] p-4 relative">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[var(--red)]"></div>
              <div className="font-['Share_Tech_Mono'] text-[9px] text-[var(--text-muted)] uppercase mb-1">22:45:10</div>
              <p className="font-['Rajdhani'] text-sm font-medium leading-tight">CRITICAL ALERT: SEEPAGE RATE BHK threshold exceeded. Remote bypass recommended.</p>
            </div>
            <div className="bg-[var(--bg-surface)] border-l-4 border-[var(--amber)] p-4">
              <div className="font-['Share_Tech_Mono'] text-[9px] text-[var(--text-muted)] uppercase mb-1">21:12:04</div>
              <p className="font-['Rajdhani'] text-sm font-medium leading-tight">System update scheduled for 02:00 UTC. Network intermittent availability.</p>
            </div>
          </section>

        </div>

        {/* BOTTOM NAV BAR */}
        <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-20 bg-[var(--bg-base)] border-t border-[var(--border-strong)] grid grid-cols-4 px-2 z-50">
          <NavTab icon="🏠" label="HOME" active />
          <NavTab icon="💼" label="JOBS" />
          <NavTab icon="👤" label="PROFILE" />
          <NavTab icon="🔔" label="ALERTS" />
        </footer>

      </div>
    </div>
  );
};

const StatusBtn = ({ label, active }) => (
  <button className={`h-12 flex items-center justify-center text-[10px] font-bold font-['Share_Tech_Mono'] uppercase tracking-widest border transition-all ${active ? 'bg-[var(--amber)] text-[var(--bg-void)] border-[var(--amber)]' : 'bg-[var(--bg-raised)] text-[var(--text-muted)] border-[var(--border-strong)] active:bg-[var(--bg-hover)]'}`}>
    {label}
  </button>
);

const MiniStat = ({ label, val, color = 'var(--amber)' }) => (
  <div className="bg-[var(--bg-base)] border border-[var(--border)] p-2 text-center">
    <div className="text-[8px] text-[var(--text-muted)] font-['Share_Tech_Mono'] uppercase leading-none mb-1">{label}</div>
    <div className="text-xl font-bold font-['Share_Tech_Mono'] leading-none" style={{ color }}>{val}</div>
  </div>
);

const CredBadge = ({ label, valid, expired }) => (
  <div className={`px-2 py-1 flex items-center gap-2 border rounded-sm ${valid ? 'border-[var(--green)]/30 bg-[var(--green)]/5' : 'border-[var(--red)]/30 bg-[var(--red)]/5'}`}>
    <span className="font-['Share_Tech_Mono'] text-[9px] font-bold uppercase tracking-tighter" style={{ color: valid ? 'var(--green)' : 'var(--red)' }}>{label}</span>
    <span className={`text-[8px] uppercase font-bold ${valid ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>{valid ? '✓' : '!'}</span>
  </div>
);

const NavTab = ({ icon, label, active }) => (
  <button className={`flex flex-col items-center justify-center gap-1 transition-all ${active ? 'text-[var(--amber)] scale-110' : 'text-[var(--text-muted)]'}`}>
    <span className="text-xl opacity-80">{icon}</span>
    <span className="text-[9px] font-bold font-['Share_Tech_Mono'] uppercase tracking-widest">{label}</span>
  </button>
);

export default EngineerPortal;
