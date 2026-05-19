import React from 'react';
import Layout from '../components/Layout';

const ENGINEERS_DATA = [
  { id: 'ENG-001', name: 'Arjun Mehta', spec: 'Hydroelectric Dam', certs: ['CEIG', 'CBIP'], loc: 'Shimla, HP', status: 'AVAILABLE', dist: '8.2 km' },
  { id: 'ENG-002', name: 'Priya Nair', spec: 'Power Substation', certs: ['IEC', 'CPRI'], loc: 'Chennai, TN', status: 'ON-SITE', dist: '2.1 km' },
  { id: 'ENG-003', name: 'Rahul Sharma', spec: 'Wind Turbine', certs: ['CWET', 'IEC'], loc: 'Coimbatore, TN', status: 'AVAILABLE', dist: '34.7 km' },
  { id: 'ENG-004', name: 'Sneha Patel', spec: 'Hydroelectric Dam', certs: ['CEIG', 'CEA'], loc: 'Vadodara, GJ', status: 'OFFLINE', dist: '180 km' },
  { id: 'ENG-005', name: 'Kiran Reddy', spec: 'Power Grid', certs: ['PGCIL', 'CE'], loc: 'Hyderabad, TS', status: 'AVAILABLE', dist: '56.3 km' },
  { id: 'ENG-006', name: 'Meera Joshi', spec: 'Wind Turbine', certs: ['CWET', 'BEE'], loc: 'Jaisalmer, RJ', status: 'ON-SITE', dist: '12.0 km' },
  { id: 'ENG-007', name: 'Suresh Kumar', spec: 'Power Substation', certs: ['CPRI', 'IEC'], loc: 'Bengaluru, KA', status: 'AVAILABLE', dist: '23.8 km' },
  { id: 'ENG-008', name: 'Divya Menon', spec: 'Hydroelectric Dam', certs: ['CBIP', 'CEA'], loc: 'Thrissur, KL', status: 'OFFLINE', dist: '210 km' },
];

const Engineers = () => {
  const topbarContent = (
    <div className="flex items-center gap-4">
      <div className="relative">
        <input 
          type="text" 
          placeholder="SEARCH ENGINEERS..." 
          className="bg-[var(--bg-surface)] border border-[var(--border)] px-4 py-2 font-['Share_Tech_Mono'] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--amber)] w-[240px]"
        />
      </div>
      <select className="bg-[var(--bg-surface)] border border-[var(--border)] px-3 py-2 font-['Share_Tech_Mono'] text-xs focus:outline-none uppercase">
        <option>ALL ENGINEERS</option>
        <option>AVAILABLE</option>
        <option>ON-SITE</option>
        <option>OFFLINE</option>
      </select>
      <button className="btn-amber px-6 py-2">ADD ENGINEER</button>
    </div>
  );

  return (
    <Layout 
      eyebrow="CONTROL CENTER PORTAL / ENGINEER REGISTRY" 
      title="FIELD ENGINEER COMMAND"
      topbarContent={topbarContent}
    >
      {/* STATS ROW */}
      <div className="grid grid-cols-3 gap-6">
        <StatCard label="TOTAL ENGINEERS" value="08" color="var(--cyan)" />
        <StatCard label="AVAILABLE NOW" value="04" color="var(--green)" pulse />
        <StatCard label="ON ACTIVE DUTY" value="02" color="var(--amber)" />
      </div>

      {/* ENGINEER TABLE */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--amber)] bg-[var(--bg-base)]">
              <Th>ID</Th>
              <Th>NAME</Th>
              <Th>SPECIALIZATION</Th>
              <Th>CERTIFICATIONS</Th>
              <Th>LOCATION</Th>
              <Th>STATUS</Th>
              <Th>DISTANCE</Th>
              <Th>ACTION</Th>
            </tr>
          </thead>
          <tbody className="font-['Rajdhani']">
            {ENGINEERS_DATA.map((eng, idx) => (
              <tr key={eng.id} className={`${idx % 2 === 0 ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-raised)]'} hover:bg-[var(--bg-hover)] border-l-2 border-transparent hover:border-[var(--amber)] transition-all group`}>
                <td className="px-6 py-4 font-['Share_Tech_Mono'] text-[var(--text-muted)] text-xs">{eng.id}</td>
                <td className="px-6 py-4 font-['Barlow_Condensed'] font-semibold text-base text-[var(--text-primary)] uppercase">{eng.name}</td>
                <td className="px-6 py-4">
                  <SpecBadge spec={eng.spec} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {eng.certs.map(c => <span key={c} className="bg-[var(--bg-base)] border border-[var(--border-strong)] px-1.5 py-0.5 rounded text-[10px] text-[var(--text-secondary)] font-bold">{c}</span>)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--text-muted)] flex items-center gap-1">
                  <span>📍</span> {eng.loc}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={eng.status} />
                </td>
                <td className="px-6 py-4 font-['Share_Tech_Mono'] text-[var(--amber)] text-xs">{eng.dist}</td>
                <td className="px-6 py-4">
                  <button className="border border-[var(--amber)] text-[var(--amber)] px-3 py-1 text-[10px] font-bold font-['Barlow_Condensed'] tracking-widest hover:bg-[var(--amber)] hover:text-[var(--bg-void)] transition-all uppercase">DISPATCH</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

const Th = ({ children }) => (
  <th className="px-6 py-4 font-['Share_Tech_Mono'] text-[9px] tracking-[0.2em] text-[var(--text-muted)] uppercase">{children}</th>
);

const StatCard = ({ label, value, color, pulse }) => (
  <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-5 relative overflow-hidden flex flex-col">
    <div className="flex items-center gap-2 mb-2">
      <span className={`w-1.5 h-1.5 rounded-full ${pulse ? 'animate-pulse' : ''}`} style={{ backgroundColor: color }}></span>
      <span className="font-['Share_Tech_Mono'] text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
    </div>
    <div className="font-['Share_Tech_Mono'] text-[48px] leading-none mb-1" style={{ color }}>{value}</div>
  </div>
);

const SpecBadge = ({ spec }) => {
  const colors = {
    'Hydroelectric Dam': 'text-[var(--cyan)] border-[var(--cyan)]/30 bg-[var(--cyan)]/10',
    'Wind Turbine': 'text-[var(--green)] border-[var(--green)]/30 bg-[var(--green)]/10',
    'Power Substation': 'text-[var(--amber)] border-[var(--amber)]/30 bg-[var(--amber)]/10',
    'Power Grid': 'text-[var(--red)] border-[var(--red)]/30 bg-[var(--red)]/10',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${colors[spec]}`}>{spec}</span>
  );
};

const StatusBadge = ({ status }) => {
  if (status === 'AVAILABLE') return (
    <span className="flex items-center gap-1.5 bg-[var(--green)]/10 border border-[var(--green)]/30 px-2 py-0.5 rounded-full text-[10px] font-bold text-[var(--green)] uppercase tracking-tighter">
      <span className="w-1 h-1 rounded-full bg-[var(--green)] animate-pulse"></span>
      AVAILABLE
    </span>
  );
  if (status === 'ON-SITE') return (
    <span className="flex items-center gap-1.5 bg-[var(--amber)]/10 border border-[var(--amber)]/30 px-2 py-0.5 rounded-full text-[10px] font-bold text-[var(--amber)] uppercase tracking-tighter">
      <span className="w-1 h-1 rounded-full bg-[var(--amber)] animate-pulse"></span>
      ON-SITE
    </span>
  );
  return (
    <span className="bg-[var(--text-muted)]/10 border border-[var(--text-muted)]/30 px-2 py-0.5 rounded-full text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
      OFFLINE
    </span>
  );
};

export default Engineers;
