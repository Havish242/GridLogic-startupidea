function severityStyles(level) {
  if (level === 'critical') return 'border-mission-danger/60 bg-mission-danger/10 text-mission-danger';
  if (level === 'high') return 'border-mission-warn/60 bg-mission-warn/10 text-mission-warn';
  if (level === 'medium') return 'border-mission-cyan/60 bg-mission-cyan/10 text-mission-cyan';
  return 'border-mission-accent/60 bg-mission-accent/10 text-mission-accent';
}

export default function IncidentFeed({ incidents, onSelect }) {
  return (
    <div className="panel p-4 scanline">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="panel-title text-xl">Incident Queue</h3>
        <span className="mono-data rounded-full border border-mission-accent/40 bg-mission-accent/10 px-2 py-1 text-xs uppercase text-mission-accent">
          Live
        </span>
      </div>
      <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
        {incidents.map((incident) => (
          <button
            key={incident.id}
            className="w-full rounded-xl border border-mission-grid bg-[#091527] p-3 text-left transition hover:border-mission-cyan/70 hover:bg-[#0b1b31]"
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
        {!incidents.length && (
          <div className="rounded-xl border border-mission-grid bg-[#091527] p-4 text-center">
            <p className="mono-data text-sm text-mission-muted">No active incidents. System monitoring all assets.</p>
          </div>
        )}
      </div>
    </div>
  );
}
