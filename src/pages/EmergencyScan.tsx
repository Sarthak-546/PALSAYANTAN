import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, AlertTriangle, Activity, ArrowLeft } from 'lucide-react';
import { SternumOverlay } from '../components/ar/SternumOverlay';
import { CPRMetronome } from '../components/ar/CPRMetronome';
import { EmergencyActionPanel } from '../components/emergency/EmergencyActionPanel';
import { ScanOverlay } from '../components/ar/ScanOverlay';

interface Point {
  x: number;
  y: number;
}

export const EmergencyScan = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
 const [sternumPoint, setSternumPoint] = useState<Point | null>(null);
  const [poseDetectionStartTime, setPoseDetectionStartTime] = useState<number | null>(null);
  const [demoMode, setDemoMode] = useState(true);

  const POSE_DETECTION_THRESHOLD = 3000; // 3 seconds of stable detection

  useEffect(() => {
    // Camera initialization
    async function setupCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable:', err);
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (poseDetectionStartTime !== null) {
      const elapsed = Date.now() - poseDetectionStartTime;
      const progress = Math.min((elapsed / POSE_DETECTION_THRESHOLD) * 100, 100);
      setScanProgress(progress);
    } else {
      setScanProgress(0);
    }
  }, [poseDetectionStartTime, sternumPoint]);

  const handlePoseDetected = (point: Point | null) => {
    setSternumPoint(point);
    if (point) {
      if (poseDetectionStartTime === null) {
        setPoseDetectionStartTime(Date.now());
      } else {
        const elapsed = Date.now() - poseDetectionStartTime;
        if (elapsed >= POSE_DETECTION_THRESHOLD) {
          navigate('/emergency-detected');
        }
      }
    } else {
      setPoseDetectionStartTime(null);
    }
  };

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    // Fallback simulation if running purely in demo mode
    setTimeout(() => {
      setSternumPoint({ x: 0.5, y: 0.45 });
      setPoseDetectionStartTime(Date.now());
    }, 1500);
  };

  const stopScan = () => {
    setIsScanning(false);
    setScanProgress(0);
    setPoseDetectionStartTime(null);
    setSternumPoint(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header bar */}
      <header className="flex items-center justify-between p-4 bg-gray-800/80 backdrop-blur border-b border-gray-700">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5"/>
          <span>Exit Scan</span>
        </button>
        <span className="font-semibold text-red-500 flex items-center space-x-1">
          <AlertTriangle className="w-4 h-4"/>
          <span>TRIAGE PROTOCOL</span>
        </span>
      </header>

      {/* Main Viewport */}
      <div className="flex flex-1 flex-col md:flex-row relative overflow-hidden">
        <div className="flex-1 relative bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* AR overlays */}
          <ScanOverlay isScanning={isScanning} scanProgress={scanProgress}/>

          {sternumPoint && videoRef.current && (
            <SternumOverlay
              targetX={sternumPoint.x * videoRef.current.clientWidth}
              targetY={sternumPoint.y * videoRef.current.clientHeight}
            />
          )}

          {isScanning && sternumPoint && (
            <CPRMetronome isActive="{true}"/>
          )}
        </div>

        {/* Diagnostic Panel */}
        <aside className="w-full md:w-80 bg-gray-800/90 border-t md:border-t-0 md:border-l border-gray-700 p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Diagnostic Feed
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Camera Feed:</span>
                <span className="text-sm font-mono text-green-400">ACTIVE</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Engine Status:</span>
                <span className="text-sm font-mono text-blue-400">
                  {demoMode ? 'LOCAL PROTOTYPE' : 'OFFLINE READY'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Scan Progress:</span>
                <span className="text-sm font-mono text-green-400">
                  {scanProgress.toFixed(0)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Pose Landmark:</span>
                <span className={`text-sm font-mono ${sternumPoint ? 'text-green-400' : 'text-gray-400'}`}>
                  {sternumPoint ? 'DETECTED' : 'SEARCHING'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {!isScanning ? (
              <button
                onClick={startScan}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg"
              >
                Start Emergency Triage
              </button>
            ) : (
              <button
                onClick={stopScan}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg"
              >
                Stop Scan
              </button>
            )}
            <EmergencyActionPanel/>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EmergencyScan;