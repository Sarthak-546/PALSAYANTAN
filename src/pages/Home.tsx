import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmergencySession } from '../contexts/EmergencySessionContext';
import { Button } from '../components/ui/Button';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { Logo } from '../components/ui/Logo';

export const Home = () => {
  const navigate = useNavigate();
  const { setDemoMode } = useEmergencySession();
  const [initializing, setInitializing] = useState(true);
  const [systemsReady, setSystemsReady] = useState({
    camera: false,
    ai: false,
    offline: false,
    gps: false,
  });

  useEffect(() => {
    // Simulate system initialization
    const initSystems = async () => {
      // Simulate checking each system with staggered timing
      setTimeout(() => {
        setSystemsReady(prev => ({ ...prev, camera: true }));
      }, 500);

      setTimeout(() => {
        setSystemsReady(prev => ({ ...prev, ai: true }));
      }, 1000);

      setTimeout(() => {
        setSystemsReady(prev => ({ ...prev, offline: true }));
      }, 1500);

      setTimeout(() => {
        setSystemsReady(prev => ({ ...prev, gps: true }));
        setInitializing(false);
      }, 2000);
    };

    initSystems();
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6 text-white">
        <Logo className="mb-8" size="large" />
        <h1 className="text-4xl font-bold mb-4 text-center">
          AR Emergency First Aid Assistant
        </h1>
        <p className="text-lg text-gray-300 mb-8 max-w-md text-center">
          Real-time guidance when every second matters.
        </p>

        <div className="space-y-4 w-full max-w-md">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Camera system</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm">AI assessment</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Offline assistant</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm">GPS</span>
          </div>
        </div>

        <div className="mt-8 flex items-center space-x-3 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>System Ready</span>
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Prototype</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Logo size="small" className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-gray-800">
              AR Emergency Assistant
            </h1>
          </div>
          <button
            onClick={() => setDemoMode(!true)} // Toggle demo mode
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            DEMO MODE
          </button>
        </div>

        {/* Quick Access Emergency Protocols */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Access
          </h2>
          <p className="text-gray-600 mb-4">
            Jump directly to critical emergency procedures
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/ar-first-aid?type=cpr')}
              className="h-12"
            >
              CPR
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/ar-first-aid?type=bleeding')}
              className="h-12"
            >
              Bleeding
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/ar-first-aid?type=choking')}
              className="h-12"
            >
              Choking
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Need emergency assistance?
          </h2>
          <p className="text-gray-600 mb-6">
            Start an assisted emergency assessment.
          </p>
          <Button
            variant="primary"
            size="large"
            onClick={() => navigate('/scan')}
            className="w-full"
          >
            START EMERGENCY SCAN
          </Button>
          <div className="mt-6 space-y-3">
            <Button
              variant="outline"
              onClick={() => navigate('/first-aid')}
              className="w-full"
            >
              FIRST AID LIBRARY
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/location')}
              className="w-full"
            >
              SHARE LOCATION
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="text-gray-500">Camera</div>
              <div className="mt-1">
                <StatusIndicator
                  status={systemsReady.camera ? 'ready' : 'offline'}
                  label={systemsReady.camera ? 'READY' : 'UNAVAILABLE'}
                />
              </div>
            </div>
            <div>
              <div className="text-gray-500">AI Engine</div>
              <div className="mt-1">
                <StatusIndicator
                  status={systemsReady.ai ? 'ready' : 'offline'}
                  label={systemsReady.ai ? 'OFFLINE READY' : 'OFFLINE'}
                />
              </div>
            </div>
            <div>
              <div className="text-gray-500">GPS</div>
              <div className="mt-1">
                <StatusIndicator
                  status={systemsReady.gps ? 'ready' : 'offline'}
                  label={systemsReady.gps ? 'AVAILABLE' : 'UNAVAILABLE'}
                />
              </div>
            </div>
            <div>
              <div className="text-gray-500">Offline</div>
              <div className="mt-1">
                <StatusIndicator
                  status={systemsReady.offline ? 'ready' : 'offline'}
                  label={systemsReady.offline ? 'READY' : 'UNAVAILABLE'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  );
}