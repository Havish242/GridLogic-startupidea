import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Layout from '../components/Layout';

// DUMMY DATA
const INCIDENTS = [
  { id: 'INC-001', severity: 'CRITICAL', title: 'Dam Gate Hydraulic Failure', location: 'Bhakra Dam', time: '2m ago', lat: 31.4126, lng: 76.4304, type: 'Hydroelectric Dam', risk: 'Catastrophic failure within 12-48h', status: 'CRITICAL — Structural Seepage Detected', mttr: '< 45 min' },
  { id: 'INC-002', severity: 'HIGH', title: 'Transformer Overload Zone 4', location: 'Chennai Substation', time: '14m ago', lat: 13.0827, lng: 80.2707 },
  { id: 'INC-003', severity: 'MEDIUM', title: 'Wind Turbine Gearbox Fault', location: 'Tamil Nadu Wind Farm', time: '28m ago', lat: 8.1667, lng: 77.5667 },
];

const PINNED_LOCATIONS = [
  { id: 1, name: 'BHAKRA DAM', lat: 31.4126, lng: 76.4304, severity: 'CRITICAL', type: 'Hydroelectric Dam', status: 'CRITICAL — Structural Seepage Detected', risk: 'Catastrophic failure within 12-48h', mttr: '< 45 min' },
  { id: 2, name: 'TEHRI DAM', lat: 30.3751, lng: 78.4803, severity: 'MONITORING', type: 'Hydroelectric Dam', status: 'MONITORING' },
  { id: 3, name: 'HIRAKUD DAM', lat: 21.5265, lng: 83.8705, severity: 'MONITORING', type: 'Hydroelectric Dam', status: 'MONITORING' },
  { id: 4, name: 'IDUKKI DAM', lat: 9.8489, lng: 76.9656, severity: 'OPERATIONAL', type: 'Hydroelectric Dam', status: 'OPERATIONAL' },
  { id: 5, name: 'SARDAR SAROVAR DAM', lat: 21.8311, lng: 73.7478, severity: 'OPERATIONAL', type: 'Hydroelectric Dam', status: 'OPERATIONAL' },
];

const ENGINEERS = [
  { id: 'ENG-001', name: 'Arjun Mehta', status: 'AVAILABLE', lat: 31.42, lng: 76.44 },
  { id: 'ENG-002', name: 'Saira Rao', status: 'ON_ROUTE', lat: 13.10, lng: 80.28 },
];

const ACTIVE_ROUTES = [
  { id: 'RT-001', name: 'Route to Bhakra', color: 'var(--amber)' },
];

const MAP_OPTIONS = {
  styles: [
    { elementType: "geometry", stylers: [{ color: "#0C1220" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#7A8899" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#05070C" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#101828" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0C1220" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#06111F" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1A2535" }] }
  ],
  disableDefaultUI: true,
  zoomControl: true,
};

const Dashboard = () => {
  const [selectedPin, setSelectedPin] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || ""
  });

  const metrics = {
    openIncidents: INCIDENTS.length,
    criticalAlerts: INCIDENTS.filter(i => i.severity === 'CRITICAL').length,
    availableEngineers: ENGINEERS.filter(e => e.status === 'AVAILABLE').length,
    predictedMttr: '0:38'
  };

  return (
    <Layout 
      eyebrow="CONTROL CENTER PORTAL / LIVE MAP DASHBOARD" 
      title="GRIDPULSE COMMAND CENTER"
    >
      {/* KPI CARDS ROW */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="OPEN INCIDENTS" value={String(metrics.openIncidents).padStart(2, '0')} subtitle="Active requests" dotColor="var(--text-secondary)" severityColor="var(--text-secondary)" type="INC-Q" />
        <KPICard label="CRITICAL ALERTS" value={String(metrics.criticalAlerts).padStart(2, '0')} subtitle="High severity" dotColor="var(--red)" severityColor="var(--red)" type="CRT-L" pulse />
        <KPICard label="AVAILABLE ENGINEERS" value={String(metrics.availableEngineers).padStart(2, '0')} subtitle="On standby" dotColor="var(--green)" severityColor="var(--green)" type="ENG-S" />
        <KPICard label="PREDICTED MTTR" value={metrics.predictedMttr} subtitle="Target < 45 min" dotColor="var(--amber)" severityColor="var(--amber)" type="MTT-R" />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="flex gap-6 h-[600px]">
        {/* MAP PANEL */}
        <div className="flex-1 flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden relative">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-base)]">
            <div>
              <div className="text-[10px] text-[var(--text-muted)] label-caps font-['Share_Tech_Mono']">GEOSPATIAL INTELLIGENCE</div>
              <h3 className="text-xl uppercase font-bold font-['Barlow_Condensed'] tracking-wider">LIVE TACTICAL MAP</h3>
            </div>
            <div className="flex items-center gap-2 bg-[var(--green)]/10 px-2 py-1 border border-[var(--green)]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse"></span>
              <span className="text-[10px] font-bold text-[var(--green)] uppercase font-['Share_Tech_Mono']">● LIVE</span>
            </div>
          </div>
          
          <div className="flex-1 bg-[var(--bg-void)]">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ lat: 31.4126, lng: 76.4304 }}
                zoom={10}
                options={MAP_OPTIONS}
              >
                {PINNED_LOCATIONS.map(pin => (
                  <Marker
                    key={pin.id}
                    position={{ lat: pin.lat, lng: pin.lng }}
                    onClick={() => setSelectedPin(pin)}
                    icon={getMarkerIcon(pin.severity)}
                  />
                ))}

                {selectedPin && (
                  <InfoWindow
                    position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
                    onCloseClick={() => setSelectedPin(null)}
                  >
                    <div className="min-w-[200px] p-2 bg-[var(--bg-surface)] text-[var(--text-primary)]">
                      <h4 className="text-lg mb-1 border-b border-[var(--border)] pb-1 font-['Barlow_Condensed'] uppercase font-bold tracking-wider">{selectedPin.name}</h4>
                      <div className="space-y-1 text-sm mt-2">
                        <p><span className="text-[var(--text-secondary)] uppercase text-[10px]">Type:</span> {selectedPin.type}</p>
                        <p className={`font-bold ${selectedPin.severity === 'CRITICAL' ? 'text-[var(--red)]' : selectedPin.severity === 'MONITORING' ? 'text-[var(--amber)]' : 'text-[var(--green)]'}`}>
                          <span className="text-[var(--text-secondary)] uppercase text-[10px]">Status:</span> {selectedPin.status}
                        </p>
                        {selectedPin.risk && <p><span className="text-[var(--text-secondary)] font-bold uppercase text-[10px]">Risk:</span> {selectedPin.risk}</p>}
                        {selectedPin.mttr && <p><span className="text-[var(--text-secondary)] uppercase text-[10px]">MTTR Target:</span> {selectedPin.mttr}</p>}
                      </div>
                      <button className="w-full mt-4 btn-amber text-xs py-2">DISPATCH ENGINEER</button>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            ) : <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] font-['Share_Tech_Mono'] uppercase tracking-widest animate-pulse">Loading Map Intelligence...</div>}
          </div>

          {/* MAP OVERLAY */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <OverlayCard label="INCIDENT MARKERS" count={`${PINNED_LOCATIONS.length} ACTIVE`} color="var(--red)" />
            <OverlayCard label="ENGINEER MARKERS" count={`${ENGINEERS.length} TRACKED`} color="var(--green)" />
            <OverlayCard label="ROUTE OVERLAY" count={`${ACTIVE_ROUTES.length} ROUTES`} color="var(--amber)" />
          </div>
        </div>

        {/* INCIDENT QUEUE */}
        <div className="w-[340px] flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-base)]">
            <h3 className="text-xl uppercase font-bold font-['Barlow_Condensed'] tracking-wider">INCIDENTS</h3>
            <div className="flex items-center gap-2 bg-[var(--green)]/10 px-2 py-1 border border-[var(--green)]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse"></span>
              <span className="text-[10px] font-bold text-[var(--green)] uppercase font-['Share_Tech_Mono']">LIVE</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-custom">
            {INCIDENTS.map(inc => (
              <IncidentCard key={inc.id} incident={inc} />
            ))}
          </div>

          <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-base)]">
            <button className="w-full btn-amber flex items-center justify-center gap-2 py-3 shadow-[0_0_15px_var(--amber-glow)] transition-all hover:shadow-[0_0_25px_var(--amber-glow)] group">
              <span className="text-xl transform group-hover:scale-125 transition-transform">⚡</span>
              <span className="font-['Barlow_Condensed'] font-extrabold tracking-widest">DISPATCH NOW</span>
            </button>
          </div>
        </div>
      </div>

      <footer className="h-[32px] border-t border-[var(--border)] bg-[var(--bg-void)] flex items-center justify-between px-4 shrink-0 -mx-6 -mb-6 mt-6">
        <div className="flex items-center gap-4">
          <StatusDot label="Backend Offline" color="var(--red)" pulsing />
          <StatusDot label="Socket.io Ready" color="var(--green)" />
          <StatusDot label="Maps API — Connected" color="var(--green)" />
          <StatusDot label="AI Engine — Standby" color="var(--green)" />
        </div>
        <div className="font-['Share_Tech_Mono'] text-[var(--text-muted)] text-[10px] uppercase tracking-tighter">
          GRIDPULSE V2.1 · BUILD 20240523
        </div>
      </footer>

      {/* STYLES FOR INFOWINDOW OVERRIDE */}
      <style dangerouslySetInnerHTML={{ __html: `
        .gm-style-iw {
          background-color: var(--bg-surface) !important;
          border: 1px solid var(--border-strong) !important;
          padding: 0 !important;
          border-radius: 2px !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
        }
        .gm-style-iw-d {
          overflow: hidden !important;
          background-color: var(--bg-surface) !important;
          padding: 0 !important;
        }
        .gm-style-iw-tc::after {
          background-color: var(--bg-surface) !important;
        }
        .gm-ui-hover-effect {
          filter: invert(1) brightness(2);
          top: 4px !important;
          right: 4px !important;
        }
      `}} />
    </Layout>
  );
};

// SHARED COMPONENTS (can be extracted further if needed)
const KPICard = ({ label, value, subtitle, dotColor, severityColor, type, pulse }) => (
  <div className={`bg-[var(--bg-surface)] border-t-2 p-4 relative overflow-hidden flex flex-col transition-all hover:bg-[var(--bg-raised)] ${pulse ? 'animate-pulse-red' : ''}`} style={{ borderColor: severityColor }}>
    <div className="flex items-center gap-2 mb-2">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }}></span>
      <span className="font-['Share_Tech_Mono'] text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{label}</span>
    </div>
    <div className="font-['Share_Tech_Mono'] text-[40px] leading-none mb-1 tracking-tighter" style={{ color: severityColor === 'var(--text-secondary)' ? 'white' : severityColor }}>{value}</div>
    <div className="text-[10px] text-[var(--text-muted)] font-['Rajdhani'] uppercase tracking-wider font-medium">{subtitle}</div>
    <div className="absolute bottom-2 right-2 font-['Share_Tech_Mono'] text-[10px] text-[var(--text-muted)] border border-[var(--border)] px-1 uppercase opacity-50">{type}</div>
  </div>
);

const IncidentCard = ({ incident }) => {
  const borderColor = incident.severity === 'CRITICAL' ? 'var(--red)' : incident.severity === 'HIGH' ? 'var(--amber)' : 'var(--cyan)';
  return (
    <div className="p-4 border-l-4 border-b border-[var(--border)] cursor-pointer hover:bg-white/5 transition-all group" style={{ borderLeftColor: borderColor }}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-['Share_Tech_Mono'] text-[var(--text-muted)] text-[10px] tracking-tight">{incident.id}</span>
        <span className={`badge font-['Share_Tech_Mono'] text-[9px] px-1.5 py-0.5 rounded-sm uppercase ${incident.severity === 'CRITICAL' ? 'bg-[var(--red)]/20 text-[var(--red)] border border-[var(--red)]/40' : incident.severity === 'HIGH' ? 'bg-[var(--amber)]/20 text-[var(--amber)] border border-[var(--amber)]/40' : 'bg-[var(--cyan)]/20 text-[var(--cyan)] border border-[var(--cyan)]/40'}`}>
          {incident.severity}
        </span>
      </div>
      <h4 className="font-['Barlow_Condensed'] text-lg font-bold leading-tight mb-1 group-hover:text-[var(--amber)] transition-colors uppercase">{incident.title}</h4>
      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] uppercase tracking-tight font-medium font-['Rajdhani']">
        <span>{incident.location}</span>
        <span className="font-['Share_Tech_Mono']">{incident.time}</span>
      </div>
    </div>
  );
};

const OverlayCard = ({ label, count, color }) => (
  <div className="bg-[var(--bg-base)] border border-[var(--border)] px-3 py-1.5 flex items-center gap-2 shadow-2xl backdrop-blur-md">
    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
    <span className="text-[9px] font-bold tracking-tighter uppercase font-['Share_Tech_Mono']">
      <span className="text-[var(--text-muted)]">{label} — </span>
      <span className="text-[var(--text-primary)]">{count}</span>
    </span>
  </div>
);

const StatusDot = ({ label, color, pulsing }) => (
  <div className="flex items-center gap-1.5">
    <span className={`w-1.5 h-1.5 rounded-full ${pulsing ? 'animate-pulse' : ''}`} style={{ backgroundColor: color }}></span>
    <span className="text-[9px] text-[var(--text-muted)] font-bold label-caps tracking-widest uppercase font-['Share_Tech_Mono']">{label}</span>
  </div>
);

const getMarkerIcon = (severity) => {
  const color = severity === 'CRITICAL' ? '#EF4444' : severity === 'MONITORING' ? '#F59E0B' : '#22C55E';
  
  if (severity === 'CRITICAL') {
    return {
      url: `data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="8" fill="${encodeURIComponent(color)}" stroke="white" stroke-width="2" />
        <circle cx="20" cy="20" r="16" fill="none" stroke="${encodeURIComponent(color)}" stroke-width="1" opacity="0.6">
          <animate attributeName="r" from="8" to="18" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>`,
      anchor: { x: 20, y: 20 }
    };
  }
  
  return {
    url: `data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="6" fill="${encodeURIComponent(color)}" stroke="white" stroke-width="1.5" />
    </svg>`,
    anchor: { x: 12, y: 12 }
  };
};

export default Dashboard;
