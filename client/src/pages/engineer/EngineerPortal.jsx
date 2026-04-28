import { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleMap, Marker, Polyline, useLoadScript } from '@react-google-maps/api';

import useAsyncAction from '../../hooks/useAsyncAction';
import useSocketEvents from '../../hooks/useSocketEvents';
import {
  completeDispatch,
  getDispatches,
  getIncidents,
  login,
  markDispatchArrived,
  setToken,
  updateEngineerStatus,
} from '../../services/api';

const NAV_MAP_OPTIONS = {
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#08101b' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#6c89ab' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#14263b' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1e34' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  ],
  disableDefaultUI: true,
  zoomControl: true,
};

const CHECKLIST_BY_FAULT = {
  gearbox_failure: ['Lockout rotor system', 'Inspect gearbox oil pressure', 'Capture vibration baseline after repair'],
  blade_damage: ['Deploy blade safety harness', 'Inspect crack propagation zone', 'Validate pitch calibration'],
  dam_structural: ['Inspect crack depth markers', 'Check seepage flow trend', 'Log emergency reinforcement action'],
  dam_seepage_crack: ['Verify seepage channel integrity', 'Apply temporary crack seal', 'Re-run hydro pressure check'],
  substation_transformer: ['Isolate transformer bay', 'Run thermal scan', 'Validate relay reset and load pickup'],
  grid_line_break: ['Confirm line isolation', 'Replace conductor segment', 'Restore and verify current stability'],
};

function normalizeId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.$oid) return value.$oid;
  return String(value);
}

function statusTone(status) {
  if (status === 'on_job') return 'border-mission-cyan/60 bg-mission-cyan/10 text-mission-cyan';
  if (status === 'available') return 'border-mission-accent/60 bg-mission-accent/10 text-mission-accent';
  return 'border-mission-muted/50 bg-mission-grid/40 text-mission-muted';
}

function dispatchTone(status) {
  if (status === 'arrived') return 'border-mission-accent/60 bg-mission-accent/10 text-mission-accent';
  if (status === 'completed') return 'border-mission-cyan/60 bg-mission-cyan/10 text-mission-cyan';
  return 'border-mission-warn/60 bg-mission-warn/10 text-mission-warn';
}

function pointDistanceKm(a, b) {
  if (!a || !b) return 0;
  const dx = Number(a.lat) - Number(b.lat);
  const dy = Number(a.lng) - Number(b.lng);
  return Math.sqrt((dx ** 2) + (dy ** 2)) * 111;
}

function routeSteps(route) {
  if (!Array.isArray(route) || route.length < 2) return [];
  return route.slice(1).map((point, idx) => {
    const prev = route[idx];
    return {
      id: `${idx}-${point.lat}-${point.lng}`,
      distance: pointDistanceKm(prev, point),
      point,
      label: idx === route.length - 2 ? 'Arrive at incident site' : `Proceed to waypoint ${idx + 1}`,
    };
  });
}

function normalizePoint(point) {
  if (!point) return null;
  const lat = Number(point.lat);
  const lng = Number(point.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function checklistForFault(faultType) {
  return CHECKLIST_BY_FAULT[faultType] || ['Secure work zone', 'Complete primary repair task', 'Capture post-repair validation'];
}

function jobRating(mttr) {
  if (!Number.isFinite(mttr) || mttr <= 0) return 0;
  if (mttr <= 20) return 5;
  if (mttr <= 35) return 4;
  if (mttr <= 50) return 3;
  if (mttr <= 70) return 2;
  return 1;
}

export default function EngineerPortal() {
  const [tokenReady, setTokenReady] = useState(false);
  const [engineer, setEngineer] = useState(null);
  const [status, setStatus] = useState('available');
  const [dispatches, setDispatches] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [notes, setNotes] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [checklistState, setChecklistState] = useState({});
  const [acceptedDispatchIds, setAcceptedDispatchIds] = useState({});
  const [notice, setNotice] = useState('Awaiting assignment stream...');
  const [error, setError] = useState('');
  const { runAction, isLoading } = useAsyncAction();

  const hasMapsKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_KEY);
  const { isLoaded: isMapLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  });

  const engineerId = normalizeId(engineer?.id);

  const loadPortalData = useCallback(async () => {
    if (!tokenReady || !engineerId) return;
    try {
      const [dispatchItems, incidentItems] = await Promise.all([
        getDispatches({ engineer_id: engineerId }),
        getIncidents(),
      ]);
      setDispatches(dispatchItems);
      setIncidents(incidentItems);
    } catch (err) {
      setError(err.message || 'Failed loading engineer portal data');
    }
  }, [tokenReady, engineerId]);

  useEffect(() => {
    async function auth() {
      try {
        const data = await login({ email: 'engineer@gridpulse.ai', password: 'GridPulse@123' });
        setToken(data.token);
        setEngineer(data.user);
        setStatus(data.user?.status || 'available');
        setTokenReady(true);
      } catch (err) {
        setError(err.message || 'Authentication failed');
      }
    }
    auth();
  }, []);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  useSocketEvents({
    'dispatch:update': (payload) => {
      const payloadEngineerId = normalizeId(payload.engineer_id);
      if (!engineerId || payloadEngineerId !== engineerId) return;

      setDispatches((prev) => {
        const exists = prev.some((item) => normalizeId(item.id) === normalizeId(payload.id));
        if (exists) {
          return prev.map((item) => (normalizeId(item.id) === normalizeId(payload.id) ? payload : item));
        }
        return [payload, ...prev];
      });
      setNotice(`Dispatch update received: ${payload.status?.toUpperCase() || 'PENDING'}`);
    },
    'incident:new': () => loadPortalData(),
  });

  const activeDispatch = useMemo(
    () => dispatches.find((item) => item.status !== 'completed') || null,
    [dispatches]
  );

  const activeIncident = useMemo(() => {
    if (!activeDispatch) return null;
    return incidents.find((incident) => normalizeId(incident.id) === normalizeId(activeDispatch.incident_id)) || null;
  }, [activeDispatch, incidents]);

  const routeGuide = useMemo(() => routeSteps(activeDispatch?.route || []), [activeDispatch]);

  const activeRoute = useMemo(
    () => (activeDispatch?.route || []).map((point) => normalizePoint(point)).filter((point) => Boolean(point)),
    [activeDispatch]
  );

  const faultChecklist = useMemo(() => checklistForFault(activeIncident?.fault_type), [activeIncident]);

  const activeAccepted = Boolean(acceptedDispatchIds[normalizeId(activeDispatch?.id)]);

  const completedDispatches = useMemo(
    () => dispatches.filter((item) => item.status === 'completed').slice(0, 8),
    [dispatches]
  );

  const responseMetrics = useMemo(() => {
    const completed = dispatches.filter((item) => item.status === 'completed');
    const avgMttr = completed.length
      ? Math.round(completed.reduce((sum, item) => sum + Number(item.actual_mttr || 0), 0) / completed.length)
      : 0;

    return {
      openJobs: dispatches.filter((item) => item.status !== 'completed').length,
      completedJobs: completed.length,
      avgMttr,
    };
  }, [dispatches]);

  useEffect(() => {
    const template = checklistForFault(activeIncident?.fault_type);
    const seed = template.reduce((acc, item) => {
      acc[item] = false;
      return acc;
    }, {});
    setChecklistState(seed);
  }, [activeIncident?.id, activeIncident?.fault_type]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        window.URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  async function updateStatusRaw(nextStatus) {
    if (!engineerId) return;
    const updated = await updateEngineerStatus(engineerId, nextStatus);
    setStatus(updated.status || nextStatus);
    setEngineer((prev) => ({ ...(prev || {}), status: updated.status || nextStatus }));
    return updated;
  }

  async function handleStatusChange(nextStatus) {
    try {
      await runAction(`status-${nextStatus}`, () => updateStatusRaw(nextStatus), {
        successMessage: `Status updated to ${nextStatus}`,
        errorMessage: 'Status update failed',
      });
    } catch (err) {
      setError(err.message || 'Status update failed');
    }
  }

  async function handleAcceptDispatch() {
    if (!activeDispatch?.id) return;
    try {
      await runAction('accept-dispatch', async () => {
        await updateStatusRaw('on_job');
        setAcceptedDispatchIds((prev) => ({ ...prev, [normalizeId(activeDispatch.id)]: true }));
      }, {
        successMessage: 'Dispatch accepted. Navigation mode active.',
        errorMessage: 'Could not accept dispatch',
      });
    } catch (err) {
      setError(err.message || 'Could not accept dispatch');
    }
  }

  async function handleDeclineDispatch() {
    if (!activeDispatch?.id) return;
    try {
      await runAction('decline-dispatch', async () => {
        await updateStatusRaw('available');
        setAcceptedDispatchIds((prev) => ({ ...prev, [normalizeId(activeDispatch.id)]: false }));
        setNotice('Dispatch decline recorded locally. Notify control center to reassign.');
      }, {
        successMessage: 'Dispatch decline flagged',
        errorMessage: 'Could not decline dispatch',
      });
    } catch (err) {
      setError(err.message || 'Could not decline dispatch');
    }
  }

  async function handleArrived() {
    if (!activeDispatch?.id) return;
    try {
      const updated = await runAction('mark-arrived', () => markDispatchArrived(activeDispatch.id), {
        successMessage: 'Arrival logged successfully',
        errorMessage: 'Could not mark arrival',
      });
      if (!updated) return;
      setDispatches((prev) => prev.map((item) => (normalizeId(item.id) === normalizeId(updated.id) ? updated : item)));
      setNotice('Arrival stamped. Awaiting repair completion notes.');
    } catch (err) {
      setError(err.message || 'Could not mark arrival');
    }
  }

  async function handleComplete() {
    if (!activeDispatch?.id) return;
    try {
      const fullNotes = photoName ? `${notes}\nPhoto: ${photoName}` : notes;
      const updated = await runAction('complete-dispatch', () => completeDispatch(activeDispatch.id, fullNotes), {
        successMessage: 'Dispatch completed and MTTR recorded',
        errorMessage: 'Completion failed',
      });
      if (!updated) return;
      setDispatches((prev) => prev.map((item) => (normalizeId(item.id) === normalizeId(updated.id) ? updated : item)));
      setNotes('');
      setPhotoName('');
      setPhotoPreview('');
      setNotice('Dispatch completed and incident closed. Returning to standby.');
      await updateStatusRaw('available');
      await loadPortalData();
    } catch (err) {
      setError(err.message || 'Completion failed');
    }
  }

  function handleChecklistToggle(task) {
    setChecklistState((prev) => ({
      ...prev,
      [task]: !prev[task],
    }));
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    if (photoPreview) {
      window.URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(window.URL.createObjectURL(file));
  }

  return (
    <div className="mx-auto mt-4 grid w-[96%] max-w-2xl gap-4 pb-10">
      <section className="panel p-4 scanline">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mono-data text-xs uppercase text-mission-cyan">Engineer Portal</p>
            <h2 className="font-header text-4xl uppercase tracking-[0.08em] text-mission-text">Field Command</h2>
            <p className="mt-1 text-sm text-mission-muted">Mobile response workflow with live dispatch telemetry.</p>
          </div>
          <span className={`mono-data rounded-full border px-2 py-1 text-xs uppercase ${statusTone(status)}`}>{status}</span>
        </div>
        <p className="mono-data mt-3 rounded-xl border border-mission-grid bg-[#091527] px-3 py-2 text-xs uppercase text-mission-accent">
          {notice}
        </p>
      </section>

      <section className="panel p-4">
        <h3 className="panel-title text-xl">Status Channel</h3>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {['available', 'on_job', 'offline'].map((value) => (
            <button
              key={value}
              className={`mono-data rounded-xl border px-3 py-2 text-sm uppercase transition ${
                status === value
                  ? 'border-mission-accent bg-mission-accent/15 text-mission-accent'
                  : 'border-mission-grid bg-[#091527] text-mission-muted hover:border-mission-cyan/60 hover:text-mission-cyan'
              }`}
              onClick={() => handleStatusChange(value)}
              disabled={isLoading(`status-${value}`)}
            >
              <span className="inline-flex items-center gap-2">
                {value}
                {isLoading(`status-${value}`) && <span className="h-3 w-3 animate-spin rounded-full border border-mission-accent border-t-transparent" />}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel p-4">
        <h3 className="panel-title text-xl">Live Job Notification</h3>
        {activeDispatch ? (
          <div className="mt-3 rounded-xl border border-mission-grid bg-[#091527] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-header text-2xl uppercase tracking-[0.05em] text-mission-text">
                {activeIncident?.fault_type || 'Repair Dispatch'}
              </p>
              <span className={`mono-data rounded-full border px-2 py-1 text-xs uppercase ${dispatchTone(activeDispatch.status)}`}>
                {activeDispatch.status}
              </span>
            </div>
            <p className="mono-data mt-2 text-xs uppercase text-mission-muted">
              ETA {activeDispatch.estimated_eta || 0}m | Dispatch #{String(activeDispatch.id || '').slice(-6)}
            </p>
            <p className="mt-1 text-sm text-mission-text/90">{activeIncident?.location?.address || 'Location telemetry unavailable'}</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                className="mono-data rounded-xl border border-mission-accent/70 bg-mission-accent/15 px-3 py-2 text-sm uppercase text-mission-accent"
                onClick={handleAcceptDispatch}
                disabled={isLoading('accept-dispatch') || activeAccepted}
              >
                <span className="inline-flex items-center gap-2">
                  {activeAccepted ? 'Accepted' : 'Accept Assignment'}
                  {isLoading('accept-dispatch') && <span className="h-3 w-3 animate-spin rounded-full border border-mission-accent border-t-transparent" />}
                </span>
              </button>
              <button
                className="mono-data rounded-xl border border-mission-danger/70 bg-mission-danger/15 px-3 py-2 text-sm uppercase text-mission-danger"
                onClick={handleDeclineDispatch}
                disabled={isLoading('decline-dispatch')}
              >
                <span className="inline-flex items-center gap-2">
                  Decline Assignment
                  {isLoading('decline-dispatch') && <span className="h-3 w-3 animate-spin rounded-full border border-mission-danger border-t-transparent" />}
                </span>
              </button>
              <button
                className="mono-data rounded-xl border border-mission-cyan/70 bg-mission-cyan/15 px-3 py-2 text-sm uppercase text-mission-cyan"
                onClick={handleArrived}
                disabled={isLoading('mark-arrived') || activeDispatch.status === 'arrived' || activeDispatch.status === 'completed'}
              >
                <span className="inline-flex items-center gap-2">
                  Mark Arrived
                  {isLoading('mark-arrived') && <span className="h-3 w-3 animate-spin rounded-full border border-mission-cyan border-t-transparent" />}
                </span>
              </button>
              <button
                className="mono-data rounded-xl border border-mission-accent/70 bg-mission-accent/15 px-3 py-2 text-sm uppercase text-mission-accent"
                onClick={() => handleStatusChange('on_job')}
                disabled={isLoading('status-on_job')}
              >
                <span className="inline-flex items-center gap-2">
                  Set En Route
                  {isLoading('status-on_job') && <span className="h-3 w-3 animate-spin rounded-full border border-mission-accent border-t-transparent" />}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-mission-grid bg-[#091527] p-3">
            <p className="mono-data text-xs uppercase text-mission-muted">No active assignments. Standing by for dispatch update.</p>
          </div>
        )}
      </section>

      <section className="panel p-4">
        <h3 className="panel-title text-xl">Turn-by-Turn Assist</h3>
        {hasMapsKey ? (
          isMapLoaded ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-mission-grid">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '240px' }}
                center={activeRoute[0] || { lat: 22.57, lng: 78.96 }}
                zoom={activeRoute.length > 1 ? 9 : 5}
                options={NAV_MAP_OPTIONS}
              >
                {activeRoute[0] && <Marker position={activeRoute[0]} title="Current Position" />}
                {activeRoute[activeRoute.length - 1] && (
                  <Marker
                    position={activeRoute[activeRoute.length - 1]}
                    title="Incident Site"
                    icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                  />
                )}
                {activeRoute.length > 1 && <Polyline path={activeRoute} options={{ strokeColor: '#00D4FF', strokeWeight: 4 }} />}
              </GoogleMap>
            </div>
          ) : (
            <p className="mono-data mt-3 text-xs uppercase text-mission-muted">Loading navigation map...</p>
          )
        ) : (
          <p className="mono-data mt-3 text-xs uppercase text-mission-muted">Set VITE_GOOGLE_MAPS_KEY to enable navigation map.</p>
        )}
        <div className="mt-3 space-y-2">
          {routeGuide.map((step, idx) => (
            <div key={step.id} className="rounded-xl border border-mission-grid bg-[#091527] p-3">
              <p className="mono-data text-xs uppercase text-mission-cyan">Step {idx + 1}</p>
              <p className="mt-1 text-sm text-mission-text">{step.label}</p>
              <p className="mono-data mt-1 text-xs uppercase text-mission-muted">
                {step.distance.toFixed(1)} km | {Number(step.point.lat).toFixed(4)}, {Number(step.point.lng).toFixed(4)}
              </p>
            </div>
          ))}
          {!routeGuide.length && <p className="mono-data text-xs uppercase text-mission-muted">Route guidance will appear when a dispatch route is assigned.</p>}
        </div>
      </section>

      <section className="panel p-4">
        <h3 className="panel-title text-xl">On-site Checklist</h3>
        <div className="mt-3 space-y-2">
          {faultChecklist.map((task) => (
            <label key={task} className="flex items-start gap-2 rounded-xl border border-mission-grid bg-[#091527] p-3">
              <input
                type="checkbox"
                checked={Boolean(checklistState[task])}
                onChange={() => handleChecklistToggle(task)}
                className="mt-1 h-4 w-4 accent-[#00FF94]"
              />
              <span className="text-sm text-mission-text">{task}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="panel p-4">
        <h3 className="panel-title text-xl">Job Completion Form</h3>
        <textarea
          className="mt-2 w-full rounded-xl border border-mission-grid bg-[#091527] p-3 text-sm text-mission-text outline-none placeholder:text-mission-muted"
          rows={4}
          placeholder="Repair summary, replaced components, safety checks"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <label className="mt-2 block rounded-xl border border-mission-grid bg-[#091527] p-3">
          <p className="mono-data text-xs uppercase text-mission-muted">Upload Repair Photo</p>
          <input className="mt-2 w-full text-sm text-mission-text file:mr-2 file:rounded file:border-0 file:bg-mission-cyan/20 file:px-2 file:py-1 file:text-mission-cyan" type="file" accept="image/*" onChange={handlePhotoChange} />
          {photoName && <p className="mono-data mt-2 text-xs uppercase text-mission-accent">{photoName}</p>}
          {photoPreview && <img src={photoPreview} alt="Repair evidence" className="mt-2 max-h-40 rounded-lg border border-mission-grid object-cover" />}
        </label>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            className="mono-data rounded-xl border border-mission-accent/70 bg-mission-accent/15 px-4 py-2 text-sm uppercase text-mission-accent"
            onClick={handleComplete}
            disabled={isLoading('complete-dispatch') || !activeDispatch || activeDispatch.status === 'completed'}
          >
            <span className="inline-flex items-center gap-2">
              Mark Resolved
              {isLoading('complete-dispatch') && <span className="h-3 w-3 animate-spin rounded-full border border-mission-accent border-t-transparent" />}
            </span>
          </button>
          <div className="rounded-xl border border-mission-grid bg-[#091527] px-3 py-2">
            <p className="mono-data text-xs uppercase text-mission-muted">Avg MTTR</p>
            <p className="font-mono text-xl text-mission-cyan">{responseMetrics.avgMttr}m</p>
          </div>
        </div>
      </section>

      <section className="panel p-4">
        <h3 className="panel-title text-xl">My Jobs History</h3>
        <div className="mt-3 space-y-2">
          {completedDispatches.map((job) => (
            <div key={normalizeId(job.id)} className="rounded-xl border border-mission-grid bg-[#091527] p-3">
              <p className="mono-data text-xs uppercase text-mission-cyan">Dispatch #{String(job.id || '').slice(-6)}</p>
              <p className="mt-1 text-sm text-mission-text">MTTR {job.actual_mttr || 0}m | Rating {jobRating(Number(job.actual_mttr || 0))}/5</p>
            </div>
          ))}
          {!completedDispatches.length && <p className="mono-data text-xs uppercase text-mission-muted">No completed jobs yet.</p>}
        </div>
      </section>

      <section className="panel p-4">
        <h3 className="panel-title text-xl">Shift Telemetry</h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-mission-grid bg-[#091527] p-3">
            <p className="mono-data text-xs uppercase text-mission-muted">Open Jobs</p>
            <p className="font-mono text-2xl text-mission-danger">{responseMetrics.openJobs}</p>
          </div>
          <div className="rounded-xl border border-mission-grid bg-[#091527] p-3">
            <p className="mono-data text-xs uppercase text-mission-muted">Completed</p>
            <p className="font-mono text-2xl text-mission-accent">{responseMetrics.completedJobs}</p>
          </div>
          <div className="rounded-xl border border-mission-grid bg-[#091527] p-3">
            <p className="mono-data text-xs uppercase text-mission-muted">Profile</p>
            <p className="font-mono text-2xl text-mission-cyan">{String(engineer?.name || 'ENG').slice(0, 3).toUpperCase()}</p>
          </div>
        </div>
      </section>

      {error && <p className="rounded-xl border border-mission-danger/60 bg-mission-danger/10 p-3 text-sm text-mission-danger">{error}</p>}
    </div>
  );
}
