function severityStyles(level) {
  if (level === 'critical') return 'border-l-mission-danger bg-mission-danger/10';
  if (level === 'high') return 'border-l-orange-400 bg-orange-400/10';
  if (level === 'medium') return 'border-l-yellow-400 bg-yellow-400/10';
  return 'border-l-mission-success bg-mission-success/10';
}

function severityBadgeText(level) {
  if (level === 'critical') return 'text-mission-danger';
  if (level === 'high') return 'text-orange-400';
  if (level === 'medium') return 'text-yellow-400';
  return 'text-mission-success';
}

export default function IncidentFeed({ incidents, onSelect, loading = false }) {
  return (
    <div className="panel p-4 scanline">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="panel-title text-xl mb-3">Incident Queue</h3>
        <span className="mono-data rounded-sm border border-mission-accent/40 bg-mission-accent/10 px-2 py-1 text-xs font-bold uppercase text-mission-accent">
          Live
        </span>
      </div>
      <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
        {loading && (
          <div className="space-y-2" role="status" aria-label="Loading incidents">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="animate-pulse rounded-md border-l-4 border-mission-grid border-y border-r bg-mission-panel p-3">
                <div className="h-4 w-2/5 rounded bg-mission-grid/80" />
                <div className="mt-2 h-3 w-4/5 rounded bg-mission-grid/70" />
                <div className="mt-2 h-3 w-1/2 rounded bg-mission-grid/70" />
              </div>
            ))}
          </div>
        )}
        {!loading && incidents.map((incident) => (
          <button
            key={incident.id}
            className={`w-full rounded-md border-l-4 border-y border-r border-mission-grid p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow mb-2 ${severityStyles(incident.severity)}`}
            onClick={() => onSelect(incident)}
          >
            <div className="flex items-center justify-between">
              <p className="font-header text-2xl font-bold uppercase tracking-wide text-mission-text">{incident.fault_type}</p>
              <span className={`mono-data font-bold text-sm uppercase ${severityBadgeText(incident.severity)} ${incident.severity === 'critical' ? 'animate-pulse' : ''}`}>
                {incident.severity}
              </span>
            </div>
            <p className="mono-data mt-2 text-xs uppercase text-mission-muted">{incident.infra_type} | {incident.status}</p>
            <p className="mt-1 text-sm text-mission-text/85">{incident.location?.address || 'Location telemetry pending'}</p>
          </button>
        ))}
        {!loading && !incidents.length && (
          <div className="rounded-md border border-mission-grid bg-mission-panel p-4 text-center">
            <p className="mono-data text-sm font-bold tracking-wide text-mission-muted">No active incidents. System monitoring all assets.</p>
          </div>
        )}
      </div>
    </div>
  );
}
