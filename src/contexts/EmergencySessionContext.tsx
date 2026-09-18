import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type EmergencyScenario = {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: FirstAidStep[];
};

export type FirstAidStep = {
  id: string;
  title: string;
  instruction: string;
  visualType: string;
  audioText?: string;
};

export type EmergencySession = {
  id: string;
  startedAt: string;
  scenario: string;
  mode: "demo" | "prototype";
  status: "active" | "completed" | "cancelled";
};

type EmergencySessionContextType = {
  emergencySession: EmergencySession | null;
  setEmergencySession: (session: EmergencySession | null) => void;
  activeScenario: EmergencyScenario | null;
  setActiveScenario: (scenario: EmergencyScenario | null) => void;
  demoMode: boolean;
  setDemoMode: (mode: boolean) => void;
  voiceGuidance: boolean;
  setVoiceGuidance: (enabled: boolean) => void;
};

const EmergencySessionContext = createContext<EmergencySessionContextType | undefined>(undefined);

export const useEmergencySession = () => {
  const context = useContext(EmergencySessionContext);
  if (context === undefined) {
    throw new Error('useEmergencySession must be used within an EmergencySessionProvider');
  }
  return context;
};

export const EmergencySessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [emergencySession, setEmergencySession] = useState<EmergencySession | null>(null);
  const [activeScenario, setActiveScenario] = useState<EmergencyScenario | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [voiceGuidance, setVoiceGuidance] = useState(true);

  // Load session from localStorage on init
  useEffect(() => {
    const saved = localStorage.getItem('emergencySession');
    if (saved) {
      try {
        setEmergencySession(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse emergency session from localStorage', e);
      }
    }
  }, []);

  // Save session to localStorage on change
  useEffect(() => {
    if (emergencySession) {
      localStorage.setItem('emergencySession', JSON.stringify(emergencySession));
    } else {
      localStorage.removeItem('emergencySession');
    }
  }, [emergencySession]);

  const value = {
    emergencySession,
    setEmergencySession,
    activeScenario,
    setActiveScenario,
    demoMode,
    setDemoMode,
    voiceGuidance,
    setVoiceGuidance,
  };

  return (
    <EmergencySessionContext.Provider value={value}>
      {children}
    </EmergencySessionContext.Provider>
  );
};