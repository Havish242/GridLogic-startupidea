export default function ConnectionBanner({ backendReachable, socketConnected }) {
  if (backendReachable && socketConnected) return null;

  const message = !backendReachable
    ? 'Connection Lost: backend is unreachable. Retrying...'
    : 'Realtime channel interrupted. Reconnecting socket...';

  return (
    <div className="mx-auto mt-3 w-[96%] max-w-[1500px] rounded-xl border border-mission-danger/60 bg-mission-danger/10 px-3 py-2">
      <p className="mono-data text-xs uppercase text-mission-danger">{message}</p>
    </div>
  );
}
