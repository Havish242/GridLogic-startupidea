import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ eyebrow, title, topbarContent, children }) => {
  return (
    <div className="flex h-screen w-full bg-[var(--bg-void)] text-[var(--text-primary)] font-['Rajdhani'] overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Topbar eyebrow={eyebrow} title={title}>
          {topbarContent}
        </Topbar>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-custom">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
