import React from 'react';
import Layout from '../components/Layout';

const INCIDENTS_DATA = [
  { id: 'INC-001', severity: 'CRITICAL', title: 'Dam Gate Hydraulic Failure', type: 'Hydroelectric Dam', loc: 'Bhakra Dam, HP', ai: 'Gate Seal Rupture', conf: 96, eng: 'Arjun Mehta', status: 'EN ROUTE', time: '2m ago' },
  { id: 'INC-002', severity: 'HIGH', title: 'Transformer Overload — Zone 4', type: 'Power Substation', loc: 'Chennai Substation, TN', ai: 'Thermal Overload', conf: 89, eng: 'Priya Nair', status: 'ON-SITE', time: '14m ago' },
  { id: 'INC-003', severity: 'MEDIUM', title: 'Wind Turbine Gearbox Fault', type: 'Wind Turbine', loc: 'Tamil Nadu Wind Farm', ai: 'Gearbox Bearing Failure', conf: 82, eng: 'Rahul Sharma', status: 'DISPATCHED', time: '28m ago' },
  { id: 'INC-004', severity: 'HIGH', title: 'Power Line Break — Sector 7', type: 'Power Grid', loc: 'Hyderabad Grid, TS', ai: 'Conductor Snap', conf: 91, eng: 'Kiran Reddy', status: 'EN ROUTE', time: '45m ago' },
  { id: 'INC-005', severity: 'CRITICAL', title: 'Structural Seepage Detected', type: 'Hydroelectric Dam', loc: 'Tehri Dam, UK', ai: 'Piping Effect — Stage 2', conf: 97, eng: 'Unassigned', status: 'PENDING', time: '1h ago' },
  { id: 'INC-006', severity: 'MEDIUM', title: 'Relay Fault — Feeder 3', type: 'Power Substation', loc: 'Bengaluru Substation, KA', ai: 'Relay Malfunction', conf: 78, eng: 'Suresh Kumar', status: 'DISPATCHED', time: '2h ago' },
];

const Incidents = () => {
  const topbarContent = (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-4 border-b border-[var(--border)] pb-1">
        <FilterTab label="ALL" active />
        <FilterTab label="CRITICAL" />
        <FilterTab label="HIGH" />
        <FilterTab label="MEDIUM" />
        <FilterTab label="RESOLVED" />
      </div>
      <button className="bg-[var(--red)] text-white px-6 py-2 font-['Barlow_Condensed'] font-bold uppercase tracking-widest hover:bg-red-600 transition-all">REPORT INCIDENT</button>
    </div>
  );

  return (
    <Layout 
      eyebrow="CONTROL CENTER PORTAL / INCIDENT TRACKER" 
      title="ACTIVE INCIDENT LOG"
      topbarContent={topbarContent}
    >
      {/* STATS ROW */}
      <div className="grid grid-cols-4 gap-6">
        <KPICard label="TOTAL INCIDENTS" value="06" color="var(--text-primary)" />
        <KPICard label="CRITICAL" value="02" color="var(--red)" pulse />
        <KPICard label="RESOLVED TODAY" value="14" color="var(--green)" />
        <KPICard label="AVG MTTR" value="38:24" color="var(--amber)" />
      </div>

      {/* INCIDENT CARDS GRID */}
      <div className="grid grid-cols-2 gap-6">
        {INCIDENTS_DATA.map(inc => (
          <div key={inc.id} className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden flex flex-col relative group">
            <div className={`h-1 w-full ${inc.severity === 'CRITICAL' ? 'bg-[var(--red)]' : inc.severity === 'HIGH' ? 'bg-[var(--amber)]' : 'bg-[var(--cyan)]'}`}></div>
            
            <div className="p-5 flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-['Share_Tech_Mono'] text-[var(--text-muted)] text-[10px] tracking-widest uppercase">{inc.id}</span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-tighter rounded-sm ${inc.severity === 'CRITICAL' ? 'bg-[var(--red)]/20 text-[var(--red)] border border-[var(--red)]/40' : inc.severity === 'HIGH' ? 'bg-[var(--amber)]/20 text-[var(--amber)] border border-[var(--amber)]/40' : 'bg-[var(--cyan)]/20 text-[var(--cyan)] border border-[var(--cyan)]/40'}`}>
                    {inc.severity}
                  </span>
                </div>
                <span className="font-['Share_Tech_Mono'] text-[var(--text-muted)] text-[10px] uppercase tracking-tighter">{inc.time}</span>
              </div>

              <div>
                <h3 className="font-['Barlow_Condensed'] text-xl font-bold uppercase leading-none mb-2 group-hover:text-[var(--amber)] transition-colors">{inc.title}</h3>
                <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-muted)] font-['Rajdhani'] uppercase tracking-wider">
                  <span className="flex items-center gap-1">🛠️ {inc.type}</span>
                  <span className="flex items-center gap-1">📍 {inc.loc}</span>
                </div>
              </div>

              <div className="bg-[var(--bg-base)] border border-[var(--border)] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-['Share_Tech_Mono'] text-[10px] text-[var(--amber)] uppercase tracking-widest">AI CLASSIFIED: {inc.ai}</span>
                  <span className="font-['Share_Tech_Mono'] text-[10px] text-[var(--text-secondary)] uppercase">{inc.conf}% CONFIDENCE</span>
                </div>
                <div className="w-full h-1 bg-[var(--bg-raised)] overflow-hidden">
                  <div className="h-full bg-[var(--amber)] shadow-[0_0_10px_var(--amber-glow)]" style={{ width: `${inc.conf}%` }}></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-raised)] border border-[var(--border-strong)] flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)]">
                    {inc.eng !== 'Unassigned' ? inc.eng.split(' ').map(n => n[0]).join('') : '?'}
                  </div>
                  <div>
                    <div className="text-[9px] text-[var(--text-muted)] font-['Share_Tech_Mono'] uppercase tracking-widest">ASSIGNED ENGINEER</div>
                    <div className="text-sm font-semibold font-['Barlow_Condensed'] uppercase tracking-wider">{inc.eng}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-base)] border-t border-[var(--border)] px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${inc.status === 'PENDING' ? 'bg-[var(--red)]' : 'bg-[var(--green)] animate-pulse shadow-[0_0_8px_var(--green-glow)]'}`}></span>
                <span className="font-['Share_Tech_Mono'] text-[10px] text-[var(--text-primary)] uppercase tracking-wider font-bold">{inc.status}</span>
              </div>
              <div className="flex items-center gap-4">
                <button className="font-['Share_Tech_Mono'] text-[10px] text-[var(--cyan)] uppercase tracking-widest hover:underline">VIEW DETAILS</button>
                <button className="border border-[var(--green)] text-[var(--green)] px-4 py-1 text-[10px] font-bold font-['Barlow_Condensed'] tracking-widest hover:bg-[var(--green)] hover:text-[var(--bg-void)] transition-all uppercase">RESOLVE</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

const FilterTab = ({ label, active }) => (
  <button className={`font-['Share_Tech_Mono'] text-[10px] tracking-widest uppercase pb-2 px-1 transition-all border-b-2 ${active ? 'border-[var(--amber)] text-[var(--amber)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
    {label}
  </button>
);

const KPICard = ({ label, value, color, pulse }) => (
  <div className={`bg-[var(--bg-surface)] border border-[var(--border)] p-5 relative overflow-hidden flex flex-col ${pulse ? 'animate-pulse-red' : ''}`}>
    <div className="flex items-center gap-2 mb-2">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
      <span className="font-['Share_Tech_Mono'] text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
    </div>
    <div className="font-['Share_Tech_Mono'] text-[36px] leading-none mb-1 font-bold" style={{ color }}>{value}</div>
  </div>
);

export default Incidents;
