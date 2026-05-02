function statusBadge(status) {
  if (status === 'available') return 'border-mission-accent/60 bg-mission-accent/10 text-mission-accent';
  if (status === 'on_job') return 'border-mission-cyan/60 bg-mission-cyan/10 text-mission-cyan';
  return 'border-mission-muted/50 bg-mission-grid/40 text-mission-muted';
}

export default function EngineerDirectory({ engineers, loading = false }) {
  return (
    <div className="panel p-4 scanline">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="panel-title text-xl">Field Roster</h3>
        <span className="mono-data text-xs uppercase text-mission-muted">{engineers.length} tracked</span>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {loading && [1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="animate-pulse rounded-xl border border-mission-grid bg-[#091527] p-3">
            <div className="h-4 w-2/3 rounded bg-mission-grid/80" />
            <div className="mt-2 h-3 w-1/2 rounded bg-mission-grid/70" />
            <div className="mt-3 h-3 w-5/6 rounded bg-mission-grid/70" />
          </div>
        ))}
        {!loading && engineers.map((eng) => (
          <div key={eng.id} className="rounded-xl border border-mission-grid bg-[#091527] p-3">
            <div className="flex items-center justify-between">
              <p className="font-header text-xl uppercase tracking-[0.05em] text-mission-text">{eng.name}</p>
              <span className={`mono-data rounded-full border px-2 py-1 text-xs uppercase ${statusBadge(eng.status)}`}>{eng.status}</span>
            </div>
            <p className="mono-data mt-2 text-xs uppercase text-mission-muted">rating {eng.rating} | jobs {eng.completed_jobs}</p>
            <p className="mt-2 text-sm text-mission-text/85">{(eng.certifications || []).join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
