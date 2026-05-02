function severityStyles(level) {
  if (level === 'critical') return 'border-red-400/60 bg-red-400/10 text-red-300';
  if (level === 'high') return 'border-orange-400/60 bg-orange-400/10 text-orange-300';
  if (level === 'medium') return 'border-yellow-400/60 bg-yellow-400/10 text-yellow-300';
  return 'border-emerald-400/60 bg-emerald-400/10 text-emerald-300';
}

export default function IncidentFeed({ incidents, onSelect, loading = false }) {
  return (
    <div className="panel p-4 scanline">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="panel-title text-xl">Incident Queue</h3>
        <span className="mono-data rounded-full border border-mission-accent/40 bg-mission-accent/10 px-2 py-1 text-xs uppercase text-mission-accent">
          Live
        </span>
      </div>
      <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
        {loading && (
          <div className="space-y-2" role="status" aria-label="Loading incidents">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="animate-pulse rounded-xl border border-mission-grid bg-[#091527] p-3">
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
            className="w-full rounded-xl border border-mission-grid bg-[#091527] p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-mission-cyan/70 hover:bg-[#0b1b31]"
            onClick={() => onSelect(incident)}
          >
            <div className="flex items-center justify-between">
              <p className="font-header text-xl uppercase tracking-[0.06em] text-mission-text">{incident.fault_type}</p>
              <span className={`mono-data rounded-full border px-2 py-1 text-xs uppercase ${severityStyles(incident.severity)}`}>
                {incident.severity}
              </span>
            </div>
            <p className="mono-data mt-2 text-xs uppercase text-mission-muted">{incident.infra_type} | {incident.status}</p>
            <p className="mt-1 text-sm text-mission-text/85">{incident.location?.address || 'Location telemetry pending'}</p>
          </button>
        ))}
        {!loading && !incidents.length && (
          <div className="rounded-xl border border-mission-grid bg-[#091527] p-4 text-center">
            <p className="mono-data text-sm text-mission-muted">No active incidents. System monitoring all assets.</p>
          </div>
        )}
      </div>
    </div>
  );
}
