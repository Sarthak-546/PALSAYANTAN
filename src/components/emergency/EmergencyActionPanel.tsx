import { useEffect, useRef, useState } from 'react';

// ── Indian emergency numbers ─────────────────────────────────────────────────
const SOS_NUMBER = '112'; // National unified emergency (Police / Fire / Medical)
const AMBULANCE_108 = '108'; // Emergency ambulance services
const NATIONAL_112 = '112'; // National SOS

type Fix = { lat: number; lon: number; at: number };

/** Builds the pre-filled SOS text message. Exported so it can be unit-tested. */
export const buildSosSmsUri = (fix: { lat: number; lon: number } | null | undefined, remark: string) => {
  const body = fix
    ? `EMERGENCY: ${remark}. Location: https://maps.google.com/?q=${fix.lat.toFixed(6)},${fix.lon.toFixed(6)} (Lat: ${fix.lat.toFixed(6)}, Lng: ${fix.lon.toFixed(6)})`
    : `EMERGENCY: ${remark}. Immediate ambulance required! (GPS unavailable)`;
  // "?&body=" is the form both Android and iOS accept ("?body=" alone fails on iOS).
  return `sms:${SOS_NUMBER}?&body=${encodeURIComponent(body)}`;
};

// Programmatic click on a detached-then-attached anchor: opens the SMS app or
// phone dialer without touching the SPA (no reload) and works across browsers.
const openExternal = (uri: string) => {
  const a = document.createElement('a');
  a.href = uri;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const FRESH_MS = 2 * 60 * 1000;

const MATERNITY_102 = '102'; // Maternity transport

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
      { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 },
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
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  };

  // Format GPS status badge
  const gpsLabel = gpsReady && fixRef.current
    ? `${TRANSLATIONS[language].gpsLocked} ${fixRef.current.lat.toFixed(2)}° N, ${fixRef.current.lon.toFixed(2)}° E`
    : status === 'no-gps'
      ? TRANSLATIONS[language].gpsUnavailable
      : TRANSLATIONS[language].gpsAcquiring;

  return (
    <div className="space-y-2.5">
      {/* Warning / info banner */}
      {message && (
        <div className="p-2 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-100 text-[11px] backdrop-blur">
          {message}
        </div>
      )}

      
      {/* ── Dynamic Remark / Editable Input UI ── */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between px-1">
          <label className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
            {PANEL_UI[language].detailsLabel}
          </label>
          <span className="text-[10px] text-slate-400">{PANEL_UI[language].tapHint}</span>
        </div>
        
        {/* Quick-Select Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar px-1">
          {PANEL_UI[language].chips.map((chip) => (
            <button
              key={chip}
              onClick={() => setEmergencyRemark(chip)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors border ${
                emergencyRemark === chip 
                  ? 'bg-red-500/20 border-red-500/50 text-red-200' 
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Editable Remark Field */}
        <input
          type="text"
          value={emergencyRemark}
          onChange={(e) => setEmergencyRemark(e.target.value)}
          placeholder={PANEL_UI[language].placeholder}
          className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
        />
      </div>
      {/* Primary SOS button — always tappable, never locked */}
      <button
        onClick={triggerEmergencySms}
        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-2xl shadow-lg shadow-red-600/30 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
      >
        {status === 'locating' ? TRANSLATIONS[language].locating : TRANSLATIONS[language].sosPrefix}
      </button>

      {/* Quick-call pills (side-by-side) */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => openExternal(`tel:${AMBULANCE_108}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold rounded-xl transition-colors active:scale-95"
        >
          {PANEL_UI[language].call108}
        </button>
        <button
          onClick={() => openExternal(`tel:${NATIONAL_112}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold rounded-xl transition-colors active:scale-95"
        >
          {PANEL_UI[language].call112}
        </button>
        {isPregnancy && (
          <button
            onClick={() => openExternal(`tel:${MATERNITY_102}`)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-fuchsia-600/20 hover:bg-fuchsia-600/30 border border-fuchsia-500/30 text-fuchsia-100 text-xs font-semibold rounded-xl transition-colors active:scale-95 mt-1"
          >
            {language === 'hi' ? '📞 102 कॉल' : '📞 Call 102'}
            <span className="text-[10px] text-fuchsia-300">{language === 'hi' ? '(मातृत्व परिवहन)' : '(Maternity Transport)'}</span>
          </button>
        )}
      </div>

      {/* GPS status badge */}
      <div className="text-center text-[11px] text-slate-400 px-1">
        {gpsLabel}
      </div>
    </div>
  );
};
