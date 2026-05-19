import { useCallback, useEffect, useMemo, useState } from 'react';

import EngineerDirectory from '../../components/EngineerDirectory';
import IncidentFeed from '../../components/IncidentFeed';
import MapPanel from '../../components/MapPanel';
import useAsyncAction from '../../hooks/useAsyncAction';
import useSocketEvents from '../../hooks/useSocketEvents';
import { createDispatch, getEngineers, getIncidents, getMatches, login, setToken } from '../../services/api';

function severityWeight(level) {
  if (level === 'critical') return 1.5;
  if (level === 'high') return 1.2;
  if (level === 'medium') return 1;
  return 0.85;
}

export default function ControlDashboard() {
  const [tokenReady, setTokenReady] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [matches, setMatches] = useState([]);
  const [activeRoute, setActiveRoute] = useState([]);
  const [error, setError] = useState('');
  const [now, setNow] = useState(new Date());
  const { runAction, isLoading } = useAsyncAction();

  const bootstrap = useCallback(async () => {
    try {
      const auth = await login({ email: 'operator@gridpulse.ai', password: 'GridPulse@123' });
      setToken(auth.token);
      setTokenReady(true);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!tokenReady) return;
    setInitialLoading(true);
    try {
      const [i, e] = await Promise.all([
        getIncidents({ status: 'open' }),
        getEngineers(),
      ]);
      setIncidents(i);
      setEngineers(e);
    } catch (err) {
      setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  }, [tokenReady]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useSocketEvents({
    'incident:new': (payload) => setIncidents((prev) => [payload, ...prev]),
    'dispatch:update': () => loadData(),
    'engineer:location': (payload) =>
      setEngineers((prev) => prev.map((eng) => (eng.id === payload.id ? payload : eng))),
  });

  async function handleSelectIncident(incident) {
    setSelectedIncident(incident);
    try {
      const result = await runAction(
        'load-matches',
        () => getMatches(incident),
        {
          errorMessage: 'Failed to fetch engineer matches',
        }
      );
      if (result) {
        setMatches(result);
      }
    } catch {
      setMatches([]);
    }
  }

  async function handleDispatch(engineerId) {
    if (!selectedIncident) return;
    try {
      const dispatch = await runAction(
        `dispatch-${engineerId}`,
        () => createDispatch(selectedIncident.id, engineerId),
        {
          successMessage: 'Engineer dispatched successfully',
          errorMessage: 'Dispatch failed',
        }
      );
      if (dispatch) {
        setActiveRoute(dispatch.route || []);
        await loadData();
      }
    } catch {
      // Toast is already emitted by useAsyncAction.
    }
  }

  const metrics = useMemo(() => {
    const critical = incidents.filter((i) => i.severity === 'critical').length;
    const available = engineers.filter((e) => e.status === 'available').length;
    const weightedLoad = incidents.reduce((sum, item) => sum + severityWeight(item.severity), 0);
    const queuePressure = available ? weightedLoad / available : weightedLoad;

    const baselineMttr = incidents.length
      ? Math.round(20 + incidents.reduce((sum, i) => sum + 12 * severityWeight(i.severity), 0) / incidents.length)
      : 0;

    const matchEta = matches.length
      ? Math.round(matches.reduce((sum, m) => sum + Number(m.eta_minutes || 0), 0) / matches.length)
      : 0;

    const predictedMttr = Math.max(0, Math.round((baselineMttr * 0.7) + (matchEta * 0.3)));

    return {
      open: incidents.length,
      critical,
      available,
      queuePressure,
      predictedMttr,
    };
  }, [incidents, engineers]);

  const liveClock = useMemo(() => now.toLocaleTimeString('en-US', { hour12: false }), [now]);
  const liveDate = useMemo(() => now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), [now]);

  const infraMix = useMemo(() => {
    const totals = incidents.reduce(
      (acc, incident) => {
        const key = incident.infra_type || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {}
    );
    return ['dam', 'wind', 'substation', 'grid'].map((key) => ({
      key,
      count: totals[key] || 0,
    }));
  }, [incidents]);

  return (
    <div className="mt-4 grid gap-5 pb-10 lg:grid-cols-12">
      <section className="panel p-5 lg:col-span-12 scanline">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mono-data text-xs uppercase text-mission-cyan">Control Center Portal</p>
            <h2 className="font-header text-3xl uppercase tracking-[0.08em] text-mission-text md:text-4xl">Live Map Dashboard</h2>
          </div>
          <div className="text-right">
            <p className="mono-data text-xs uppercase text-mission-muted">UTC Sync</p>
            <p className="mono-data text-2xl text-mission-accent">{liveClock}</p>
            <p className="mono-data text-xs uppercase text-mission-cyan">{liveDate}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-mission-grid bg-mission-panel p-4">
            <p className="mono-data text-xs uppercase text-mission-muted">Open Incidents</p>
            <p className="kpi-value">{metrics.open}</p>
          </div>
          <div className="rounded-md border border-mission-danger/40 bg-[#EF4444]/10 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-mission-danger animate-pulse-danger" />
            <p className="mono-data text-xs uppercase text-mission-danger">Critical Alerts</p>
            <p className="font-mono text-4xl font-bold text-mission-danger">{metrics.critical}</p>
          </div>
          <div className="rounded-md border border-mission-grid bg-mission-panel p-4">
            <p className="mono-data text-xs uppercase text-mission-text">Available Engineers</p>
            <p className="font-mono text-4xl font-bold text-mission-success">{metrics.available}</p>
          </div>
          <div className="rounded-md border border-mission-grid bg-mission-panel p-4">
            <p className="mono-data text-xs uppercase text-mission-accent">Predicted MTTR</p>
            <p className={`font-mono text-4xl font-bold ${metrics.predictedMttr < 10 ? 'text-mission-danger animate-pulse-fast' : 'text-mission-accent'}`}>{metrics.predictedMttr}:00</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 lg:col-span-8">
        <MapPanel incidents={incidents} engineers={engineers} activeRoute={activeRoute} />

        <div className="panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="panel-title text-xl">Operational Load</h3>
            <span className="mono-data text-xs uppercase text-mission-muted">pressure {metrics.queuePressure.toFixed(2)}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {infraMix.map((item) => (
              <div key={item.key} className="rounded-md border border-mission-grid bg-mission-panel p-3">
                <p className="mono-data text-xs uppercase text-mission-muted">{item.key}</p>
                <p className="font-mono text-2xl text-mission-text">{item.count}</p>
                <div className="mt-2 h-1.5 rounded-sm bg-mission-bg">
                  <div
                    className="h-1.5 rounded-sm bg-mission-accent"
                    style={{ width: `${Math.min(100, item.count * 15)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="incidents" className="space-y-4 lg:col-span-4">
        <IncidentFeed incidents={incidents} onSelect={handleSelectIncident} loading={initialLoading} />
        {selectedIncident && (
          <div className="panel p-4 scanline">
            <div className="flex items-center justify-between">
              <h3 className="panel-title text-xl">Dispatch Console</h3>
              <span className="mono-data rounded-full border border-mission-cyan/50 px-2 py-1 text-xs uppercase text-mission-cyan">
                Live Match
              </span>
            </div>
            <p className="mt-2 text-sm text-mission-text/90">{selectedIncident.fault_type} at {selectedIncident.location?.address}</p>
            <div className="mt-3 space-y-2 max-h-[260px] overflow-auto pr-1">
              {matches.map((m) => (
                <div key={m.engineer_id} className="rounded-md border border-mission-grid bg-mission-panel p-4 mb-2 flex flex-col gap-3">
                  <div>
                    <p className="mono-data text-sm uppercase text-mission-text font-bold">
                      Engineer {m.engineer_id.slice(-6)}
                    </p>
                    <p className="mono-data text-xs uppercase text-mission-muted">Match Score: {m.match_score} | ETA: {m.eta_minutes}m</p>
                  </div>
                  <button
                    className="w-full rounded-md bg-mission-accent py-3 px-4 text-center font-header text-xl font-bold uppercase tracking-wider text-mission-bg transition hover:bg-[#D97706] hover:shadow-glow disabled:opacity-50 flex justify-center items-center gap-2"
                    onClick={() => handleDispatch(m.engineer_id)}
                    disabled={isLoading(`dispatch-${m.engineer_id}`)}
                  >
                    DISPATCH NOW
                    {isLoading(`dispatch-${m.engineer_id}`) && <span className="h-4 w-4 animate-spin rounded-full border-2 border-mission-bg border-t-transparent" />}
                  </button>
                </div>
              ))}
              {!matches.length && (
                <p className="mono-data text-xs uppercase text-mission-muted">
                  {isLoading('load-matches') ? 'Calculating optimal responders...' : 'Select an incident to run matching'}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="panel p-4">
          <h3 className="panel-title text-xl">MTTR Analytics</h3>
          <div className="mt-3 space-y-2">
            <div className="rounded-md border border-mission-grid bg-mission-panel p-3 flex justify-between items-center">
              <p className="mono-data text-xs uppercase text-mission-muted">Dispatch Readiness</p>
              <p className="font-mono text-xl font-bold text-mission-success">{metrics.available > 0 ? 'NOMINAL' : 'DEGRADED'}</p>
            </div>
            <div className="rounded-md border border-mission-grid bg-mission-panel p-3 flex justify-between items-center">
              <p className="mono-data text-xs uppercase text-mission-muted">Current SLA Risk</p>
              <p className={`font-mono text-xl font-bold ${metrics.critical > 2 ? 'text-mission-danger animate-pulse-danger' : 'text-mission-accent'}`}>
                {metrics.critical > 2 ? 'HIGH' : 'CONTROLLED'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="engineers" className="lg:col-span-12">
        <EngineerDirectory engineers={engineers} loading={initialLoading} />
      </section>

      {error && <p className="lg:col-span-12 rounded-xl border border-mission-danger/60 bg-mission-danger/10 p-3 text-sm text-mission-danger">{error}</p>}
    </div>
  );
}
