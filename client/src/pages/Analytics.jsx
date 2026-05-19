import React from 'react';
import Layout from '../components/Layout';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const MTTR_TREND_DATA = [
  { day: '01', actual: 240, target: 45 },
  { day: '05', actual: 180, target: 45 },
  { day: '10', actual: 120, target: 45 },
  { day: '15', actual: 95, target: 45 },
  { day: '20', actual: 65, target: 45 },
  { day: '25', actual: 42, target: 45 },
  { day: '30', actual: 38, target: 45 },
];

const INCIDENT_TYPE_DATA = [
  { name: 'Hydroelectric Dam', value: 35, color: 'var(--cyan)' },
  { name: 'Wind Turbine', value: 28, color: 'var(--green)' },
  { name: 'Power Substation', value: 22, color: 'var(--amber)' },
  { name: 'Power Grid', value: 15, color: 'var(--red)' },
];

const RESPONSE_TIME_DATA = [
  { name: 'Arjun', time: 12 },
  { name: 'Priya', time: 18 },
  { name: 'Rahul', time: 45 },
  { name: 'Sneha', time: 32 },
  { name: 'Kiran', time: 24 },
  { name: 'Meera', time: 15 },
  { name: 'Suresh', time: 28 },
  { name: 'Divya', time: 35 },
];

const WEEKLY_SEVERITY_DATA = [
  { week: 'W1', critical: 4, high: 8, medium: 12 },
  { week: 'W2', critical: 2, high: 10, medium: 8 },
  { week: 'W3', critical: 6, high: 5, medium: 15 },
  { week: 'W4', critical: 3, high: 12, medium: 10 },
  { week: 'W5', critical: 1, high: 6, medium: 18 },
];

const RECENT_RESOLVED = [
  { id: 'INC-942', type: 'Wind Turbine', loc: 'RJ Wind Farm', mttr: '14:20', eng: 'Meera Joshi', res: 'Sensor Recalibrated' },
  { id: 'INC-938', type: 'Substation', loc: 'Delhi Zone A', mttr: '28:45', eng: 'Suresh Kumar', res: 'Fuse Replaced' },
  { id: 'INC-935', type: 'Power Grid', loc: 'Mumbai Outer', mttr: '1h 12m', eng: 'Kiran Reddy', res: 'Cable Re-spliced' },
  { id: 'INC-931', type: 'Hydro Dam', loc: 'Hirakud Dam', mttr: '42:10', eng: 'Arjun Mehta', res: 'Valve Cleared' },
  { id: 'INC-928', type: 'Substation', loc: 'Pune Metro', mttr: '12:05', eng: 'Priya Nair', res: 'Software Reset' },
];

const Analytics = () => {
  const topbarContent = (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-4 bg-[var(--bg-surface)] p-1 border border-[var(--border)] rounded-sm">
        <DateRangeTab label="TODAY" />
        <DateRangeTab label="7D" active />
        <DateRangeTab label="30D" />
        <DateRangeTab label="90D" />
      </div>
      <button className="border border-[var(--amber)] text-[var(--amber)] px-6 py-2 font-['Barlow_Condensed'] font-bold uppercase tracking-widest hover:bg-[var(--amber)] hover:text-[var(--bg-void)] transition-all">EXPORT REPORT</button>
    </div>
  );

  return (
    <Layout 
      eyebrow="CONTROL CENTER PORTAL / PERFORMANCE ANALYTICS" 
      title="SYSTEM ANALYTICS"
      topbarContent={topbarContent}
    >
      {/* STATS ROW */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard label="INCIDENTS RESOLVED" value="142" color="var(--green)" />
        <StatCard label="AVG MTTR" value="38:24" color="var(--amber)" />
        <StatCard label="MTTR IMPROVEMENT" value="↓ 12%" color="var(--green)" />
        <StatCard label="ENGINEERS DEPLOYED" value="28" color="var(--cyan)" />
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-2 gap-6">
        <ChartBox title="MEAN TIME TO REPAIR — 30 DAY TREND">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={MTTR_TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" stroke="#7A8899" fontSize={10} tickLine={false} axisLine={false} fontFamily="Share Tech Mono" />
              <YAxis stroke="#7A8899" fontSize={10} tickLine={false} axisLine={false} fontFamily="Share Tech Mono" unit="m" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="actual" stroke="var(--amber)" strokeWidth={2} dot={{ r: 4, fill: 'var(--amber)' }} />
              <Line type="monotone" dataKey="target" stroke="var(--red)" strokeDasharray="5 5" strokeWidth={1} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="INCIDENT DISTRIBUTION BY TYPE">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={INCIDENT_TYPE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {INCIDENT_TYPE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', fontFamily: 'Share Tech Mono', color: '#7A8899', paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="ENGINEER DISPATCH RESPONSE TIME">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={RESPONSE_TIME_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#7A8899" fontSize={10} tickLine={false} axisLine={false} fontFamily="Share Tech Mono" />
              <YAxis stroke="#7A8899" fontSize={10} tickLine={false} axisLine={false} fontFamily="Share Tech Mono" unit="m" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="time" fill="var(--amber)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title="INCIDENT SEVERITY — WEEKLY">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={WEEKLY_SEVERITY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="week" stroke="#7A8899" fontSize={10} tickLine={false} axisLine={false} fontFamily="Share Tech Mono" />
              <YAxis stroke="#7A8899" fontSize={10} tickLine={false} axisLine={false} fontFamily="Share Tech Mono" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="critical" stackId="a" fill="var(--red)" />
              <Bar dataKey="high" stackId="a" fill="var(--amber)" />
              <Bar dataKey="medium" stackId="a" fill="var(--cyan)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>

      {/* RECENT RESOLVED TABLE */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
        <div className="p-4 bg-[var(--bg-base)] border-b border-[var(--border)]">
          <h3 className="text-xs font-bold font-['Barlow_Condensed'] uppercase tracking-[0.2em]">RECENT RESOLVED INCIDENTS</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-base)]/50 border-b border-[var(--border-strong)]">
              <Th>INC-ID</Th>
              <Th>TYPE</Th>
              <Th>LOCATION</Th>
              <Th>MTTR</Th>
              <Th>ENGINEER</Th>
              <Th>RESOLUTION</Th>
            </tr>
          </thead>
          <tbody className="font-['Rajdhani']">
            {RECENT_RESOLVED.map((inc, idx) => (
              <tr key={inc.id} className={`${idx % 2 === 0 ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-raised)]'} hover:bg-[var(--bg-hover)] transition-all`}>
                <td className="px-6 py-4 font-['Share_Tech_Mono'] text-[var(--text-muted)] text-xs">{inc.id}</td>
                <td className="px-6 py-4 text-xs font-bold text-[var(--cyan)] uppercase tracking-tighter">{inc.type}</td>
                <td className="px-6 py-4 text-xs text-[var(--text-primary)] uppercase">{inc.loc}</td>
                <td className="px-6 py-4 font-['Share_Tech_Mono'] text-[var(--amber)] text-xs">{inc.mttr}</td>
                <td className="px-6 py-4 font-semibold text-sm font-['Barlow_Condensed'] uppercase tracking-wider">{inc.eng}</td>
                <td className="px-6 py-4 text-xs text-[var(--text-muted)] font-medium uppercase italic">{inc.res}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

const Th = ({ children }) => (
  <th className="px-6 py-3 font-['Share_Tech_Mono'] text-[9px] tracking-[0.2em] text-[var(--text-muted)] uppercase">{children}</th>
);

const DateRangeTab = ({ label, active }) => (
  <button className={`px-3 py-1 font-['Share_Tech_Mono'] text-[10px] tracking-widest uppercase transition-all ${active ? 'bg-[var(--amber)] text-[var(--bg-void)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
    {label}
  </button>
);

const StatCard = ({ label, value, color }) => (
  <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-5 relative overflow-hidden flex flex-col">
    <div className="flex items-center gap-2 mb-2">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
      <span className="font-['Share_Tech_Mono'] text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
    </div>
    <div className="font-['Share_Tech_Mono'] text-[32px] leading-none mb-1 font-bold" style={{ color }}>{value}</div>
  </div>
);

const ChartBox = ({ title, children }) => (
  <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-5 flex flex-col">
    <h3 className="font-['Share_Tech_Mono'] text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em] mb-6 border-b border-[var(--border)] pb-2">{title}</h3>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--amber)] p-3 shadow-2xl">
        <p className="font-['Share_Tech_Mono'] text-[10px] text-[var(--text-muted)] uppercase mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-['Rajdhani'] text-xs font-bold" style={{ color: p.color }}>
            {p.name.toUpperCase()}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default Analytics;
