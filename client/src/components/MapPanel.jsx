import { useEffect, useMemo, useRef, useState } from 'react';

import { GoogleMap, InfoWindow, LoadScript, Marker, Polyline } from '@react-google-maps/api';

const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 };

const MAP_CONTAINER_STYLE = { width: '100%', height: '500px' };

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

function incidentIcon(incident) {
  if ((incident?.infra_type || '').toLowerCase() === 'dam') {
    return 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
  }
  return markerColorBySeverity(incident?.severity);
}

function toNumber(value) {
  const parsed = parseFloat(value);
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

    // GeoJSON arrays are usually [lng, lat].
    if (Math.abs(a) <= 180 && Math.abs(b) <= 90) {
      return { lat: b, lng: a };
    }
    if (Math.abs(a) <= 90 && Math.abs(b) <= 180) {
      return { lat: a, lng: b };
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
  const mapRef = useRef(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
  const hasMapsKey = Boolean(mapsKey);

  const incidentMarkers = useMemo(
    () => (incidents || []).flatMap((incident, index) => {
      const location = normalizeLocation(incident.location);
      if (!location) {
        console.warn('Skipping incident marker due to invalid location', incident?.id, incident?.location);
        return [];
      }
      return [{
        id: incident?.id || `incident-${index}-${location.lat}-${location.lng}`,
        incident,
        location,
      }];
    }),
    [incidents]
  );

  const engineerMarkers = useMemo(
    () => (engineers || []).flatMap((engineer, index) => {
      const location = normalizeLocation(engineer.location);
      if (!location) {
        console.warn('Skipping engineer marker due to invalid location', engineer?.id, engineer?.location);
        return [];
      }
      return [{
        id: engineer?.id || `engineer-${index}-${location.lat}-${location.lng}`,
        engineer,
        location,
      }];
    }),
    [engineers]
  );

  const routePath = (activeRoute || [])
    .map((point) => normalizeLocation(point))
    .filter((point) => Boolean(point));

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.google) return;

    const points = [...incidentMarkers.map((m) => m.location), ...engineerMarkers.map((m) => m.location)];
    if (!points.length) return;

    const bounds = new window.google.maps.LatLngBounds();
    points.forEach((point) => bounds.extend(point));
    mapRef.current.fitBounds(bounds);

    console.log('Map markers:', {
      incidents: incidentMarkers.length,
      engineers: engineerMarkers.length,
    });

    if (points.length === 1) {
      mapRef.current.setCenter(points[0]);
      mapRef.current.setZoom(10);
    }
  }, [mapReady, incidentMarkers, engineerMarkers]);

  if (!hasMapsKey) {
    return (
      <div className="panel h-[500px] p-4 scanline">
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
      <LoadScript
        googleMapsApiKey={mapsKey}
        onLoad={() => setMapReady(true)}
        loadingElement={
          <div className="flex h-[500px] items-center justify-center">
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-mission-cyan border-t-transparent" />
              <p className="mono-data text-sm uppercase text-mission-cyan">Map uplink initializing...</p>
            </div>
          </div>
        }
      >
        <GoogleMap
          onLoad={(map) => {
            mapRef.current = map;
          }}
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={DEFAULT_CENTER}
          zoom={5}
          options={MAP_OPTIONS}
        >
          {incidentMarkers.map(({ id, incident, location }) => (
            <Marker
              key={id}
              position={location}
              icon={incidentIcon(incident)}
              label={{
                text: infraLabel(incident.infra_type),
                color: '#d8e6ff',
                fontSize: '10px',
                fontWeight: '700',
              }}
              title={`${incident.infra_type || 'asset'}${incident.location?.address ? ` | ${incident.location.address}` : ''}`}
              onClick={() => setSelectedIncident({ incident, location })}
            />
          ))}
          {engineerMarkers.map(({ id, engineer, location }) => (
            <Marker
              key={id}
              position={location}
              icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              title={engineer.name || 'Engineer'}
            />
          ))}
          {routePath.length > 1 && <Polyline path={routePath} options={{ strokeColor: '#00FF94', strokeWeight: 4 }} />}
          {selectedIncident && (
            <InfoWindow
              position={selectedIncident.location}
              onCloseClick={() => setSelectedIncident(null)}
            >
              <div className="min-w-[200px] text-[#08101b]">
                <p className="text-xs font-semibold uppercase">{selectedIncident.incident?.infra_type || 'asset'}</p>
                <p className="text-xs">Severity: {selectedIncident.incident?.severity || 'unknown'}</p>
                <p className="text-xs">{selectedIncident.incident?.location?.address || 'Address unavailable'}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
      <div className="flex flex-wrap gap-2 border-t border-mission-grid px-4 py-3">
        <span className="mono-data rounded-full border border-red-400/60 bg-red-400/10 px-2 py-1 text-[11px] uppercase text-red-300">
          Critical
        </span>
        <span className="mono-data rounded-full border border-orange-400/60 bg-orange-400/10 px-2 py-1 text-[11px] uppercase text-orange-300">
          High
        </span>
        <span className="mono-data rounded-full border border-yellow-400/60 bg-yellow-400/10 px-2 py-1 text-[11px] uppercase text-yellow-300">
          Medium
        </span>
        <span className="mono-data rounded-full border border-emerald-400/60 bg-emerald-400/10 px-2 py-1 text-[11px] uppercase text-emerald-300">
          Low
        </span>
      </div>
    </div>
  );
}
