import React, { useState, useEffect } from 'react';

const Topbar = ({ eyebrow, title, children }) => {
  const [utcTime, setUtcTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setUtcTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = utcTime.toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' });

  return (
    <header className="h-[64px] border-b border-[var(--border)] bg-[var(--bg-base)] flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex flex-col">
        <span className="font-['Share_Tech_Mono'] text-[var(--cyan)] text-[10px] tracking-widest leading-none mb-1 uppercase">{eyebrow}</span>
        <h1 className="text-[22px] font-extrabold text-[var(--text-primary)] leading-none uppercase tracking-[0.12em] font-['Barlow_Condensed']">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        {children}
        
        <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-surface)] border border-[var(--border)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)] animate-pulse shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span>
          <span className="font-['Share_Tech_Mono'] text-[10px] text-[var(--amber)] uppercase tracking-wider">LIVE TELEMETRY</span>
        </div>

        <div className="font-['Share_Tech_Mono'] text-2xl text-[var(--amber)] tracking-wider">
          {timeString}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
