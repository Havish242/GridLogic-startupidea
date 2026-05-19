import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Engineers from './pages/Engineers';
import Incidents from './pages/Incidents';
import Dispatch from './pages/Dispatch';
import Analytics from './pages/Analytics';
import ScadaFeed from './pages/ScadaFeed';
import EngineerPortal from './pages/EngineerPortal';
import ToastHost from './components/ToastHost';

function App() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)]">
      <ToastHost />
      <Routes>
        <Route path="/control" element={<Dashboard />} />
        <Route path="/engineers" element={<Engineers />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/dispatch" element={<Dispatch />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/scada" element={<ScadaFeed />} />
        <Route path="/engineer-portal" element={<EngineerPortal />} />
        <Route path="*" element={<Navigate to="/control" replace />} />
      </Routes>
    </div>
  );
}

export default App;
