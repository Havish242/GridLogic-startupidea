import { GoogleMap, Marker, Polyline, useLoadScript } from '@react-google-maps/api';

const MAP_OPTIONS = {
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#08101b' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#08101b' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#6c89ab' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#14263b' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1e34' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#07111f' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  ],
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
};

function markerColorBySeverity(severity) {
  if (severity === 'critical') return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  if (severity === 'high') return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
  if (severity === 'medium') return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
  return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeLocation(location) {
  if (!location) return null;

  const lat = toNumber(location.lat ?? location.latitude);
  const lng = toNumber(location.lng ?? location.lon ?? location.long ?? location.longitude);
  if (lat !== null && lng !== null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    return { lat, lng };
  }

  if (Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
    const a = toNumber(location.coordinates[0]);
    const b = toNumber(location.coordinates[1]);
    if (a === null || b === null) return null;

    if (Math.abs(a) <= 90 && Math.abs(b) <= 180) {
      return { lat: a, lng: b };
    }
    if (Math.abs(a) <= 180 && Math.abs(b) <= 90) {
      return { lat: b, lng: a };
    }
  }

  return null;
}

function infraLabel(infraType) {
  const value = (infraType || '').toLowerCase();
  if (value === 'dam') return 'DAM';
  if (value === 'wind') return 'WND';
  if (value === 'substation') return 'SUB';
  if (value === 'grid') return 'GRD';
  return 'AST';
}

export default function MapPanel({ incidents, engineers, activeRoute }) {
  const hasMapsKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_KEY);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  });

  const incidentMarkers = (incidents || [])
    .map((incident) => ({ incident, location: normalizeLocation(incident.location) }))
    .filter((entry) => Boolean(entry.location));

  const engineerMarkers = (engineers || [])
    .map((engineer) => ({ engineer, location: normalizeLocation(engineer.location) }))
    .filter((entry) => Boolean(entry.location));

  const routePath = (activeRoute || [])
    .map((point) => normalizeLocation(point))
    .filter((point) => Boolean(point));

  if (!hasMapsKey) {
    return (
      <div className="panel h-[460px] p-4 scanline">
        <h3 className="panel-title">Live Geospatial Board</h3>
        <p className="mt-2 text-sm text-mission-muted">
          Google Maps key is not configured. Set VITE_GOOGLE_MAPS_KEY in client environment to enable full map rendering.
        </p>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          <div className="rounded-xl border border-mission-grid bg-[#091527] p-3">
            <p className="mono-data text-sm uppercase text-mission-cyan">Incident Markers</p>
            <p className="mt-1 text-xs text-mission-muted">{incidentMarkers.length} active incidents</p>
          </div>
          <div className="rounded-xl border border-mission-grid bg-[#091527] p-3">
            <p className="mono-data text-sm uppercase text-mission-cyan">Engineer Markers</p>
            <p className="mt-1 text-xs text-mission-muted">{engineerMarkers.length} engineers tracked</p>
          </div>
          <div className="rounded-xl border border-mission-grid bg-[#091527] p-3 md:col-span-2">
            <p className="mono-data text-sm uppercase text-mission-cyan">Route Overlay</p>
            <p className="mt-1 text-xs text-mission-muted">{routePath.length} route points available</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="panel flex h-[460px] items-center justify-center p-4">
        <p className="mono-data text-sm uppercase text-mission-cyan">Map uplink initializing...</p>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden scanline">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mission-grid px-4 py-3">
        <h3 className="panel-title">Live Asset Map</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono-data rounded-full border border-mission-accent/40 bg-mission-accent/10 px-2 py-1 text-[11px] uppercase text-mission-accent">
            Incidents: {incidentMarkers.length}
          </span>
          <span className="mono-data rounded-full border border-mission-cyan/40 bg-mission-cyan/10 px-2 py-1 text-[11px] uppercase text-mission-cyan">
            Engineers: {engineerMarkers.length}
          </span>
        </div>
      </div>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '460px' }}
        center={{ lat: 22.57, lng: 78.96 }}
        zoom={5}
        options={MAP_OPTIONS}
      >
        {incidentMarkers.map(({ incident, location }) => (
          <Marker
            key={incident.id}
            position={location}
            icon={markerColorBySeverity(incident.severity)}
            label={{
              text: infraLabel(incident.infra_type),
              color: '#d8e6ff',
              fontSize: '10px',
              fontWeight: '700',
            }}
            title={`${incident.infra_type || 'asset'}${incident.location?.address ? ` | ${incident.location.address}` : ''}`}
          />
        ))}
        {engineerMarkers.map(({ engineer, location }) => (
          <Marker
            key={engineer.id}
            position={location}
            icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            title={engineer.name || 'Engineer'}
          />
        ))}
        {routePath.length > 1 && <Polyline path={routePath} options={{ strokeColor: '#00FF94', strokeWeight: 4 }} />}
      </GoogleMap>
      <div className="flex flex-wrap gap-2 border-t border-mission-grid px-4 py-3">
        <span className="mono-data rounded-full border border-mission-danger/60 bg-mission-danger/10 px-2 py-1 text-[11px] uppercase text-mission-danger">
          Critical
        </span>
        <span className="mono-data rounded-full border border-mission-warn/60 bg-mission-warn/10 px-2 py-1 text-[11px] uppercase text-mission-warn">
          High
        </span>
        <span className="mono-data rounded-full border border-mission-cyan/60 bg-mission-cyan/10 px-2 py-1 text-[11px] uppercase text-mission-cyan">
          Medium
        </span>
        <span className="mono-data rounded-full border border-mission-accent/60 bg-mission-accent/10 px-2 py-1 text-[11px] uppercase text-mission-accent">
          Low
        </span>
      </div>
    </div>
  );
}
