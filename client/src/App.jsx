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
    <div className="min-h-screen bg-[#050b14] pb-6">
      <ToastHost />
      <div className="mx-auto mt-4 flex w-[96%] max-w-[1500px] gap-4 lg:mt-5 lg:gap-5">
        <aside className="hidden w-64 shrink-0 flex-col rounded-2xl border border-mission-grid bg-mission-panel/90 p-4 shadow-panel lg:flex lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <div>
            <p className="mono-data text-xs uppercase text-mission-cyan">GridPulse Suite</p>
            <h1 className="font-header text-3xl uppercase tracking-[0.08em] text-mission-text">Command</h1>
          </div>
          <nav className="mt-6 space-y-2">
            <Link
              className="block rounded-xl border border-mission-cyan/40 bg-[#0A1B2E] px-3 py-2 text-sm uppercase tracking-[0.09em] text-mission-cyan transition hover:border-mission-cyan hover:bg-[#0e233d]"
              to="/control"
            >
              Dashboard
            </Link>
            <a
              className="block rounded-xl border border-mission-grid bg-[#091221] px-3 py-2 text-sm uppercase tracking-[0.09em] text-mission-muted transition hover:border-mission-accent hover:text-mission-accent"
              href="/control#incidents"
            >
              Incidents
            </a>
            <a
              className="block rounded-xl border border-mission-grid bg-[#091221] px-3 py-2 text-sm uppercase tracking-[0.09em] text-mission-muted transition hover:border-mission-accent hover:text-mission-accent"
              href="/control#engineers"
            >
              Engineers
            </a>
          </nav>
          <div className="mt-auto rounded-xl border border-mission-accent/30 bg-mission-accent/10 p-3">
            <p className="mono-data text-xs uppercase text-mission-accent">Telemetry</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="status-dot animate-pulse bg-mission-accent" />
              <p className="mono-data text-xs uppercase text-mission-text">Live Link Active</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="rounded-2xl border border-mission-grid bg-mission-panel/80 px-4 py-3 shadow-glow backdrop-blur lg:sticky lg:top-4 lg:z-10 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mono-data text-xs uppercase text-mission-cyan">AI Dispatch Network v2.1</p>
                <h2 className="font-header text-3xl uppercase tracking-[0.1em] text-mission-text md:text-4xl">GridPulse Command Center</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="status-dot animate-pulse bg-mission-accent" />
                <p className="mono-data text-xs uppercase text-mission-accent">Live Telemetry Link</p>
              </div>
            </div>

            <nav className="mt-4 flex flex-wrap gap-2 lg:hidden">
              <Link
                className="rounded-full border border-mission-cyan/50 bg-[#071527] px-4 py-2 text-xs uppercase tracking-[0.1em] text-mission-cyan transition hover:border-mission-cyan hover:bg-[#0A1E34]"
                to="/control"
              >
                Dashboard
              </Link>
              <a
                className="rounded-full border border-mission-grid bg-[#091221] px-4 py-2 text-xs uppercase tracking-[0.1em] text-mission-muted transition hover:border-mission-accent hover:text-mission-accent"
                href="/control#incidents"
              >
                Incidents
              </a>
              <a
                className="rounded-full border border-mission-grid bg-[#091221] px-4 py-2 text-xs uppercase tracking-[0.1em] text-mission-muted transition hover:border-mission-accent hover:text-mission-accent"
                href="/control#engineers"
              >
                Engineers
              </a>
              <Link
                className="rounded-full border border-mission-grid bg-[#091221] px-4 py-2 text-xs uppercase tracking-[0.1em] text-mission-muted transition hover:border-mission-accent hover:text-mission-accent"
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
      </div>
    </div>
  );
}

export default App;
