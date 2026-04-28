import { Link, Navigate, Route, Routes } from 'react-router-dom';

import ControlDashboard from './pages/control/ControlDashboard';
import EngineerPortal from './pages/engineer/EngineerPortal';
import { useEffect, useState } from 'react';
import ConnectionBanner from './components/ConnectionBanner';
import ToastHost from './components/ToastHost';
import { subscribeConnectionStatus } from './services/api';
import { getSocket, subscribeSocketConnection } from './services/socket';

function App() {
  const [backendReachable, setBackendReachable] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    getSocket();
    const unSubApi = subscribeConnectionStatus((value) => setBackendReachable(value));
    const unSubSocket = subscribeSocketConnection((value) => setSocketConnected(value));
    return () => {
      unSubApi();
      unSubSocket();
    };
  }, []);

  return (
    <div className="min-h-screen pb-8">
      <ToastHost />
      <header className="mx-auto mt-5 w-[96%] max-w-[1500px] rounded-2xl border border-mission-grid bg-mission-panel/80 px-4 py-3 shadow-glow md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mono-data text-xs uppercase text-mission-cyan">AI Dispatch Network v2.1</p>
            <h1 className="font-header text-4xl uppercase tracking-[0.1em] text-mission-text md:text-5xl">GridPulse Command</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-dot animate-pulse bg-mission-accent" />
            <p className="mono-data text-xs uppercase text-mission-accent">Live Telemetry Link</p>
          </div>
        </div>
        <nav className="mt-4 flex flex-wrap gap-2">
          <Link
            className="rounded-full border border-mission-cyan/50 bg-[#071527] px-4 py-2 text-sm uppercase tracking-[0.1em] text-mission-cyan transition hover:border-mission-cyan hover:bg-[#0A1E34]"
            to="/control"
          >
            Control Center
          </Link>
          <Link
            className="rounded-full border border-mission-grid bg-[#091221] px-4 py-2 text-sm uppercase tracking-[0.1em] text-mission-muted transition hover:border-mission-accent hover:text-mission-accent"
            to="/engineer"
          >
            Engineer Portal
          </Link>
        </nav>
      </header>
      <ConnectionBanner backendReachable={backendReachable} socketConnected={socketConnected} />
      <Routes>
        <Route path="/control" element={<ControlDashboard />} />
        <Route path="/engineer" element={<EngineerPortal />} />
        <Route path="*" element={<Navigate to="/control" replace />} />
      </Routes>
    </div>
  );
}

export default App;
