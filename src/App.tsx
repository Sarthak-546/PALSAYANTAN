import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EmergencySessionProvider } from './contexts/EmergencySessionContext';
import { Home } from './pages/Home';
import { EmergencyScan } from './pages/EmergencyScan';
import { EmergencyDetected } from './pages/EmergencyDetected';
import { ArFirstAid } from './pages/ArFirstAid';
import { FirstAidLibrary } from './pages/FirstAidLibrary';
import { FirstAidDetail } from './pages/FirstAidDetail';
import { Location } from './pages/Location';
import { Settings } from './pages/Settings';

function App() {
  return (
    <EmergencySessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<EmergencyScan />} />
          <Route path="/emergency-detected" element={<EmergencyDetected />} />
          <Route path="/ar-first-aid/:scenario" element={<ArFirstAid />} />
          <Route path="/first-aid" element={<FirstAidLibrary />} />
          <Route path="/first-aid/:scenario" element={<FirstAidDetail />} />
          <Route path="/location" element={<Location />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </EmergencySessionProvider>
  );
}

export default App;