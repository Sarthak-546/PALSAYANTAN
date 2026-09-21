import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EmergencySessionProvider } from './contexts/EmergencySessionContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ROUTES } from './routes';
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
    // ErrorBoundary: if any page ever throws, judges see a recovery screen, not a white screen.
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
        <EmergencySessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path={ROUTES.home} element={<Home />} />

            {/* Emergency scan (+ legacy alias) */}
            <Route path={ROUTES.emergencyScan} element={<EmergencyScan />} />
            <Route path="/scan" element={<Navigate to={ROUTES.emergencyScan} replace />} />
            <Route path={ROUTES.emergencyDetected} element={<EmergencyDetected />} />

            {/* AR guidance: /ar-first-aid?type=cpr  AND  /ar-first-aid/cpr */}
            <Route path={ROUTES.arFirstAid} element={<ArFirstAid />} />
            <Route path={`${ROUTES.arFirstAid}/:scenario`} element={<ArFirstAid />} />

            {/* First-aid library (+ alias) and detail: /first-aid/cpr  AND  /first-aid-detail?id=cpr */}
            <Route path={ROUTES.firstAid} element={<FirstAidLibrary />} />
            <Route path="/first-aid-library" element={<Navigate to={ROUTES.firstAid} replace />} />
            <Route path={`${ROUTES.firstAid}/:scenario`} element={<FirstAidDetail />} />
            <Route path={ROUTES.firstAidDetail} element={<FirstAidDetail />} />

            <Route path={ROUTES.location} element={<Location />} />
            <Route path={ROUTES.settings} element={<Settings />} />

            {/* Unknown URL -> Home (client-side, no page reload) */}
            <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
          </Routes>
        </BrowserRouter>
      </EmergencySessionProvider>
      </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
