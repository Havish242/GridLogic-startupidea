function statusBadge(status) {
  if (status === 'available') return 'border-mission-success/60 bg-mission-success/10 text-mission-success';
  if (status === 'on_job') return 'border-mission-accent/60 bg-mission-accent/10 text-mission-accent';
  return 'border-mission-muted/50 bg-mission-grid/40 text-mission-muted';
}

function getStatusLabel(status) {
  if (status === 'available') return 'AVAILABLE';
  if (status === 'on_job') return 'ON-SITE';
  return 'OFFLINE';
}

export default function EngineerDirectory({ engineers, loading = false }) {
  return (
    <div className="panel p-0 overflow-hidden scanline">
      <div className="p-4 flex items-center justify-between gap-2 border-b border-mission-grid bg-mission-bg/50">
        <h3 className="panel-title text-xl">Field Roster</h3>
        <span className="mono-data text-xs uppercase text-mission-muted">{engineers.length} tracked</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-mission-bg sticky top-0 border-b border-mission-grid">
            <tr>
              <th className="p-3 font-header text-sm uppercase tracking-wider text-mission-muted">Engineer Name</th>
              <th className="p-3 font-header text-sm uppercase tracking-wider text-mission-muted">Status</th>
              <th className="p-3 font-header text-sm uppercase tracking-wider text-mission-muted">Credentials</th>
              <th className="p-3 font-header text-sm uppercase tracking-wider text-mission-muted">Performance</th>
            </tr>
          </thead>
          <tbody>
            {loading && [1, 2, 3].map((idx) => (
              <tr key={idx} className="animate-pulse border-b border-mission-grid/50 bg-mission-panel/30">
                <td className="p-3"><div className="h-4 w-32 rounded bg-mission-grid/80" /></td>
                <td className="p-3"><div className="h-4 w-20 rounded bg-mission-grid/80" /></td>
                <td className="p-3"><div className="h-4 w-48 rounded bg-mission-grid/80" /></td>
                <td className="p-3"><div className="h-4 w-24 rounded bg-mission-grid/80" /></td>
              </tr>
            ))}
            {!loading && engineers.map((eng, idx) => (
              <tr key={eng.id} className={`border-b border-mission-grid/30 ${idx % 2 === 0 ? 'bg-mission-panel/20' : 'bg-mission-panel/60'} hover:bg-mission-grid/20 transition-colors`}>
                <td className="p-3 font-header text-lg uppercase tracking-wide text-mission-text font-bold">{eng.name}</td>
                <td className="p-3">
                  <span className={`mono-data rounded-sm border px-2 py-1 text-xs uppercase font-bold ${statusBadge(eng.status)}`}>
                    {getStatusLabel(eng.status)}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    {(eng.certifications || []).map(cert => (
                      <span key={cert} className="mono-data text-[10px] uppercase border border-mission-grid bg-mission-bg px-1.5 py-0.5 rounded-sm text-mission-muted">{cert}</span>
                    ))}
                  </div>
                </td>
                <td className="p-3 mono-data text-xs text-mission-muted uppercase">
                  Rtg: <span className="text-mission-text">{eng.rating}</span> | Jobs: <span className="text-mission-text">{eng.completed_jobs}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
