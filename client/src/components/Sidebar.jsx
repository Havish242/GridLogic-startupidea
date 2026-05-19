import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const NavItem = ({ icon, label, badge, to, active }) => (
  <Link 
    to={to}
    className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-all border-l-[3px] ${active ? 'border-[var(--amber)] bg-[var(--amber-glow)]' : 'border-transparent hover:bg-white/5'}`}
  >
    <div className="flex items-center gap-3">
      <span className="text-lg opacity-80">{icon}</span>
      <span className={`font-['Share_Tech_Mono'] uppercase tracking-wider text-sm ${active ? 'text-[var(--amber)] font-bold' : 'text-[var(--text-secondary)]'}`}>{label}</span>
    </div>
    {badge !== undefined && (
      <span className="bg-[var(--red)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm font-['Share_Tech_Mono']">
        {String(badge).padStart(2, '0')}
      </span>
    )}
  </Link>
);

const Sidebar = ({ incidentCount = 0 }) => {
  const location = useLocation();

  return (
    <aside className="w-[220px] h-full bg-[var(--bg-base)] border-r border-[var(--border)] flex flex-col shrink-0 relative z-20">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-[var(--amber)] shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
      
      <div className="p-6 pt-8">
        <div className="font-['Share_Tech_Mono'] text-[var(--amber)] text-xs tracking-widest mb-1">GRIDPULSE SUITE</div>
        <div className="font-['Barlow_Condensed'] font-extrabold text-[28px] leading-none mb-1 text-[var(--text-primary)] uppercase tracking-wider">COMMAND</div>
        <div className="font-['Share_Tech_Mono'] text-[var(--text-muted)] text-[10px] tracking-tighter uppercase">// AI DISPATCH NETWORK V2.1</div>
      </div>

      <nav className="mt-4 flex-1">
        <NavItem icon="📊" label="Dashboard" to="/control" active={location.pathname === '/control'} />
        <NavItem icon="🚨" label="Incidents" to="/incidents" badge={incidentCount} active={location.pathname === '/incidents'} />
        <NavItem icon="👥" label="Engineers" to="/engineers" active={location.pathname === '/engineers'} />
        <NavItem icon="📈" label="Analytics" to="/analytics" active={location.pathname === '/analytics'} />
        <NavItem icon="📡" label="SCADA Feed" to="/scada" active={location.pathname === '/scada'} />
      </nav>

      <div className="p-4 mt-auto border-t border-[var(--border)]">
        <div className="bg-[var(--bg-raised)] p-3 border border-[var(--border)]">
          <div className="font-['Share_Tech_Mono'] text-[var(--text-muted)] text-[10px] uppercase tracking-wider mb-2">TELEMETRY</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span className="font-['Share_Tech_Mono'] text-[10px] text-[var(--text-primary)] uppercase tracking-wider">LIVE LINK ACTIVE</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
