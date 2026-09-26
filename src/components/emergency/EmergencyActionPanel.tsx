import { useEffect, useRef, useState } from 'react';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { buildSosSmsUri, openExternal } from '../../services/EmergencyService';

type Fix = { lat: number; lon: number; at: number };

const FRESH_MS = 2 * 60 * 1000;

export const EmergencyActionPanel = ({ onEmergencyDetected, isPregnancy, activeProtocol, language = 'en' }: { onEmergencyDetected?: () => void, isPregnancy?: boolean, activeProtocol?: string, language?: 'en' | 'hi' }) => {
  const [status, setStatus] = useState<'idle' | 'locating' | 'no-gps'>('idle');
  
  const TRANSLATIONS = {
    en: {
      gpsLocked: "GPS Locked:",
      gpsUnavailable: "GPS Unavailable",
      gpsAcquiring: "Acquiring GPS...",
      locating: "Locating...",
      sosPrefix: "🚨 SOS - ALERT 112 & SHARE LOCATION"
    },
    hi: {
      gpsLocked: "जीपीएस लॉक:",
      gpsUnavailable: "जीपीएस अनुपलब्ध",
      gpsAcquiring: "जीपीएस खोज रहा है...",
      locating: "स्थान खोज रहा है...",
      sosPrefix: "🚨 112 को आपातकालीन सूचना व स्थान भेजें"
    }
  };

  const PANEL_UI = {
    en: {
      detailsLabel: "Emergency Details / Remark:",
      tapHint: "Tap chip or type",
      placeholder: "State condition (e.g. CPR, Bleeding)",
      chips: ['Cardiac Arrest', 'Bleeding', 'Choking', 'Pregnancy', 'Accident / Trauma'],
      call108: "📞 Call 108 (Ambulance)",
      call112: "📞 Call 112 (National SOS)"
    },
    hi: {
      detailsLabel: "आपातकालीन विवरण / टिप्पणी:",
      tapHint: "चुनें या टाइप करें",
      placeholder: "स्थिति बताएं (जैसे: हार्ट अटैक, खून बहना)",
      chips: ['हार्ट अटैक (CPR)', 'रक्तस्राव (Bleeding)', 'दम घुटना (Choking)', 'गर्भावस्था (Pregnancy)', 'दुर्घटना (Accident)'],
      call108: "📞 108 एम्बुलेंस कॉल",
      call112: "📞 112 आपातकालीन कॉल"
    }
  };

  const [emergencyRemark, setEmergencyRemark] = useState<string>('General Medical Emergency');

  useEffect(() => {
    switch (activeProtocol) {
      case 'cpr':
        setEmergencyRemark(language === 'hi' ? "हार्ट अटैक (CPR)" : "Cardiac Arrest / Unresponsive CPR");
        break;
      case 'bleeding':
        setEmergencyRemark(language === 'hi' ? "रक्तस्राव (Bleeding)" : "Severe Hemorrhage / Active Bleeding");
        break;
      case 'choking':
        setEmergencyRemark(language === 'hi' ? "दम घुटना (Choking)" : "Choking / Airway Obstruction");
        break;
      case 'pregnancy':
        setEmergencyRemark(language === 'hi' ? "गर्भावस्था आपातकाल" : "Obstetric / Maternal Emergency");
        break;
      case 'burns':
        setEmergencyRemark(language === 'hi' ? "गंभीर जलन" : "Severe Thermal Burn Injury");
        break;
      default:
        setEmergencyRemark(language === 'hi' ? "सामान्य चिकित्सा आपातकाल" : "General Medical Trauma");
        break;
    }
  }, [activeProtocol, language]);
  const [gpsReady, setGpsReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fixRef = useRef<Fix | null>(null);

  // Warm up GPS on mount so coordinates are ready instantly at tap time.
  // Browsers block sms: launches that happen seconds after the gesture,
  // so holding a cached fix lets SOS open inside the user's original tap.
  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('no-gps');
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        fixRef.current = { lat: p.coords.latitude, lon: p.coords.longitude, at: Date.now() };
        setGpsReady(true);
      },
      (e) => setMessage(e.code === 1 ? 'Location permission denied — SMS will be sent without coordinates.' : null),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const send = (fix: Fix | null) => {
    openExternal(buildSosSmsUri(fix, emergencyRemark));
    setStatus('idle');
    onEmergencyDetected?.();
  };

  const triggerEmergencySms = () => {
    setMessage(null);
    const cached = fixRef.current;
    if (cached && Date.now() - cached.at < FRESH_MS) return send(cached); // instant path

    if (!navigator.geolocation) {
      setMessage('GPS not available — opening SMS without coordinates.');
      return send(null);
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (p) => send({ lat: p.coords.latitude, lon: p.coords.longitude, at: Date.now() }),
      () => {
        setMessage('Could not get a GPS lock — opening SMS without coordinates.');
        send(null); // never leave the user stuck: SOS goes out with or without GPS
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const [isRemarkEditing, setIsRemarkEditing] = useState(false);

  // Format GPS status badge
  const gpsLabel = gpsReady && fixRef.current
    ? `● GPS: ${fixRef.current.lat.toFixed(2)}° N, ${fixRef.current.lon.toFixed(2)}° E`
    : status === 'no-gps'
      ? TRANSLATIONS[language].gpsUnavailable
      : TRANSLATIONS[language].gpsAcquiring;

  return (
    <div className="w-full mt-4 flex flex-col gap-3">
      {/* Warning / info banner */}
      {message && (
        <div className="p-2 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-100 text-[11px] backdrop-blur">
          {message}
        </div>
      )}

      {/* ── Compact Header: Remark Trigger + GPS + Language Switcher ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRemarkEditing(!isRemarkEditing)}
            className="flex-1 flex items-center justify-between bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-[10px] text-slate-300 active:scale-[0.98] transition-all"
          >
            <span className="truncate">⚡ {PANEL_UI[language].detailsLabel.split('/')[0].trim()}: {emergencyRemark}</span>
            <span className="opacity-70">✎</span>
          </button>
          <LanguageSwitcher className="ml-3" />
        </div>
      </div>

      {isRemarkEditing && (
        <div className="space-y-2 p-2 bg-slate-900/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {PANEL_UI[language].chips.map((chip) => (
              <button
                key={chip}
                onClick={() => setEmergencyRemark(chip)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors border ${
                  emergencyRemark === chip
                    ? 'bg-red-500/20 border-red-500/50 text-red-200'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={emergencyRemark}
            onChange={(e) => setEmergencyRemark(e.target.value)}
            placeholder={PANEL_UI[language].placeholder}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>
      )}

      {/* ── Compact SOS + Call Grid ── */}
      <div className="w-full flex items-center gap-2">
        <button
          onClick={triggerEmergencySms}
          className="flex-[3] py-2.5 px-3 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 transition-all"
        >
          <span className="animate-pulse">🚨</span>
          <span className="truncate">{TRANSLATIONS[language].sosPrefix.split(' - ')[0]}</span>
        </button>

        <button
          onClick={() => {
            window.location.href = `tel:${AMBULANCE_108}`;
          }}
          className="flex-[1] py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 active:scale-95 text-emerald-400 font-bold text-[10px] rounded-xl flex items-center justify-center gap-1 transition-all"
          title="Call 108 Ambulance"
        >
          <span>📞 108</span>
        </button>

        <button
          onClick={() => {
            window.location.href = `tel:${NATIONAL_112}`;
          }}
          className="flex-[1] py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 active:scale-95 text-red-400 font-bold text-[10px] rounded-xl flex items-center justify-center gap-1 transition-all"
          title="Call 112 Emergency"
        >
          <span>📞 112</span>
        </button>
      </div>

      {/* GPS status badge */}
      <div className="text-[10px] text-slate-400 text-center tracking-tight">
        {gpsLabel}
      </div>
    </div>
  );
};
