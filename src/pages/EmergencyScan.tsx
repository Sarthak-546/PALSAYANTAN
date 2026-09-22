import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, AlertTriangle, ArrowLeft, ShieldAlert, RefreshCcw } from 'lucide-react';
import { CameraViewport } from '../components/camera/CameraViewport';
import { SternumOverlay } from '../components/ar/SternumOverlay';
import { ScanOverlay } from '../components/ar/ScanOverlay';
import { BleedingDetector } from '../components/ar/BleedingDetector';
import { AudioGuidance } from '../components/ar/AudioGuidance';
import { CPRMetronome } from '../components/ar/CPRMetronome';
import { EmergencyActionPanel } from '../components/emergency/EmergencyActionPanel';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { BurnSlideshow } from '../components/first-aid/BurnSlideshow';
import { useEmergencySession } from '../contexts/EmergencySessionContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ROUTES } from '../routes';

type Emergency = 'none' | 'cpr' | 'bleeding' | 'choking' | 'burns';
type ChokingPhase = 'back-blows' | 'abdominal-thrusts';

const CHOKING_PHASE_INSTRUCTION: Record<ChokingPhase, Record<'en'|'hi', string>> = {
  'back-blows': {
    en: 'Lean victim forward. Deliver up to five sharp blows between the shoulder blades with the heel of your hand.',
    hi: 'पीड़ित को आगे की ओर झुकाएं। अपनी हथेली के निचले हिस्से से कंधों के बीच पांच बार जोर से मारें।'
  },
  'abdominal-thrusts': {
    en: 'Stand behind victim. Place your fist above the navel and pull inward and upward five times.',
    hi: 'पीड़ित के पीछे खड़े हो जाएं। अपनी मुट्ठी को नाभि के ऊपर रखें और पांच बार अंदर और ऊपर की ओर खींचें।'
  },
};

const CHOKING_PHASE_VIDEO: Record<ChokingPhase, string> = {
  'back-blows': '/videos/A.mp4',
  'abdominal-thrusts': '/videos/B.mp4',
};

const CHOKING_PHASE_FALLBACK: Record<ChokingPhase, string> = {
  'back-blows': '/A.mp4',
  'abdominal-thrusts': '/B.mp4',
};

const CHOKING_PHASE_BADGE: Record<ChokingPhase, string> = {
  'back-blows': 'STEP GUIDE: BACK BLOWS',
  'abdominal-thrusts': 'STEP GUIDE: STOMACH THRUSTS',
};

/**
 * Convert a normalized (0..1) point in the VIDEO frame to pixels inside the
 * <video> element's box, accounting for `object-cover` cropping.
 */
function normalizedToPixels(nx: number, ny: number, video: HTMLVideoElement) {
  const cw = video.clientWidth;
  const ch = video.clientHeight;
  const vw = video.videoWidth;
  const vh = video.videoHeight;

  if (!vw || !vh) return { x: nx * cw, y: ny * ch };

  const scale = Math.max(cw / vw, ch / vh);
  const offsetX = (vw * scale - cw) / 2;
  const offsetY = (vh * scale - ch) / 2;
  return { x: nx * vw * scale - offsetX, y: ny * vh * scale - offsetY };
}


const TRANSLATIONS = {
  en: {
    back: "Exit",
    exit: "Exit",
    torch: "Torch",
    cprBtn: "CPR",
    cpr: "CPR",
    bleedingBtn: "Bleeding",
    bleeding: "Bleeding",
    chokingBtn: "Choking",
    choking: "Choking",
    burnsBtn: "Burns",
    burns: "Burns",
    cprPrompt: "Cardiac arrest protocol active. Place hands on center target. Push hard to the beat.",
    bleedingFound: "Active bleeding detected! Apply firm, direct pressure with clean cloth immediately.",
    bleedingScanning: "No injury spotted. Scanning for wounds...",
    bleedingTarget: "🔴 APPLY DIRECT PRESSURE HERE",
    chokingBlows: "Deliver 5 sharp back blows between shoulder blades.",
    chokingThrusts: "Place fist above navel and pull inward and upward 5 times.",
    sosBtn: "🚨 SOS - ALERT 112 & SHARE LOCATION",
    call108: "📞 Call 108 (Ambulance)",
    call112: "📞 Call 112 (National SOS)",
    call102: "🚑 Call 102 (Maternity)",
    guidanceStillWorks: "Guidance and SOS still work.",
    demoGuide: "DEMO GUIDE",
    chokingBtn1: "1. 5 Back Blows",
    chokingBtn2: "2. 5 Stomach Thrusts",
    chokingTitle1: "1. Deliver 5 Firm Back Blows",
    chokingDesc1: [
      { highlight: "Position:", text: "Stand to the side and slightly behind the victim. Support their chest with one hand." },
      { highlight: "Posture:", text: "Lean the victim forward so the dislodged object falls out of the mouth, not back down the airway." },
      { highlight: "Action:", text: "Deliver up to 5 sharp, forceful blows between the shoulder blades using the heel of your hand." },
      { highlight: "Check:", text: "Pause after each blow to see if the airway is cleared." }
    ],
    chokingTitle2: "2. Deliver 5 Inward & Upward Thrusts",
    chokingDesc2: [
      { highlight: "Position:", text: "Stand behind victim and wrap both arms around their upper waist." },
      { highlight: "Fist Placement:", text: "Make a fist with one hand; place the thumb side just above the belly button (well below ribcage)." },
      { highlight: "Grip & Thrust:", text: "Grasp fist with your other hand. Pull sharply inward and upward 5 times." },
      { highlight: "Repeat Cycle:", text: "Alternate 5 back blows and 5 thrusts until the obstruction is cleared." }
    ],
    chokingAlert: "If Victim Becomes Unresponsive:",
    chokingAlertDesc: "Lower them carefully to the ground, call 112 immediately, and start CPR compressions.",
    analyze: "Analyzing scene. Please select the emergency type below."
  },
  hi: {
    back: "बाहर निकलें",
    exit: "बाहर निकलें",
    torch: "टॉर्च",
    cprBtn: "सीपीआर",
    cpr: "सीपीआर",
    bleedingBtn: "रक्तस्राव",
    bleeding: "रक्तस्राव",
    chokingBtn: "दम घुटना",
    choking: "दम घुटना",
    burnsBtn: "जलना",
    burns: "जलना",
    cprPrompt: "कार्डियक अरेस्ट प्रोटोकॉल सक्रिय। छाती के लाल निशान पर दोनों हाथ रखें और बीट के साथ दबाएं।",
    bleedingFound: "रक्तस्राव का पता चला! घाव पर साफ कपड़े से तुरंत लगातार दबाव बनाएं।",
    bleedingScanning: "कोई चोट नहीं दिखी। घाव की जांच जारी है...",
    bleedingTarget: "🔴 यहाँ सीधा दबाव बनाएं",
    chokingBlows: "पीड़ित को आगे झुकाएं। पीठ पर कंधों के बीच 5 बार थपथपाएं।",
    chokingThrusts: "नाभि के ऊपर मुट्ठी रखें और 5 बार अंदर और ऊपर की ओर झटका दें।",
    sosBtn: "🚨 112 को आपातकालीन सूचना व स्थान भेजें",
    call108: "📞 108 एम्बुलेंस कॉल",
    call112: "📞 112 आपातकालीन कॉल",
    call102: "🚑 102 मातृत्व सेवा",
    guidanceStillWorks: "निर्देश और SOS अभी भी काम कर रहे हैं।",
    demoGuide: "डेमो गाइड",
    chokingBtn1: "1. 5 पीठ थपथपाएं",
    chokingBtn2: "2. 5 पेट के धक्के",
    chokingTitle1: "1. 5 बार पीठ थपथपाएं",
    chokingDesc1: [
      { highlight: "स्थिति:", text: "पीड़ित के बगल में और थोड़ा पीछे खड़े हों। एक हाथ से उनकी छाती को सहारा दें।" },
      { highlight: "मुद्रा:", text: "पीड़ित को आगे की ओर झुकाएं ताकि फंसी हुई वस्तु मुंह से बाहर गिरे।" },
      { highlight: "क्रिया:", text: "अपने हाथ की एड़ी का उपयोग करके कंधे के ब्लेड के बीच 5 तेज, जोरदार प्रहार करें।" },
      { highlight: "जांच:", text: "हवा का मार्ग साफ़ हुआ या नहीं, यह देखने के लिए प्रत्येक प्रहार के बाद रुकें।" }
    ],
    chokingTitle2: "2. 5 बार पेट में अंदर और ऊपर धक्के दें",
    chokingDesc2: [
      { highlight: "स्थिति:", text: "पीड़ित के पीछे खड़े हो जाएं और दोनों हाथों को उनकी ऊपरी कमर के चारों ओर लपेट लें।" },
      { highlight: "मुट्ठी:", text: "एक हाथ से मुट्ठी बनाएं; अंगूठे के हिस्से को नाभि के ठीक ऊपर रखें।" },
      { highlight: "धक्का:", text: "दूसरे हाथ से मुट्ठी को पकड़ें। 5 बार तेजी से अंदर और ऊपर की ओर धक्का दें।" },
      { highlight: "दोहराएं:", text: "रुकावट साफ होने तक 5 पीठ थपथपाहट और 5 धक्के बारी-बारी से दें।" }
    ],
    chokingAlert: "यदि पीड़ित बेहोश हो जाता है:",
    chokingAlertDesc: "उन्हें सावधानी से जमीन पर लिटा दें, तुरंत 112 पर कॉल करें, और सीपीआर कम्प्रेशन शुरू करें।",
    analyze: "स्थिति का विश्लेषण किया जा रहा है। कृपया नीचे आपातकालीन प्रकार चुनें।"
  }
};

export const EmergencyScan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { voiceGuidance } = useEmergencySession();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Ref for the choking demo video so we can force-reload when src changes
  const chokingVideoRef = useRef<HTMLVideoElement | null>(null);

  const protocolParam = searchParams.get('protocol') as Emergency | null;
  useEffect(() => {
    if (protocolParam && protocolParam.includes('pregnancy')) {
      navigate('/first-aid/pregnancy', { replace: true });
    }
  }, [protocolParam, navigate]);

  const initialProtocol =
    protocolParam && ['cpr', 'bleeding', 'choking', 'burns'].includes(protocolParam)
      ? (protocolParam as Emergency)
      : 'none';

  const [activeEmergency, setActiveEmergency] = useState<Emergency>(initialProtocol);
  const { language, setLanguage, hasSelectedLanguage, setHasSelectedLanguage } = useLanguage();
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [chokingPhase, setChokingPhase] = useState<ChokingPhase>('back-blows');
  const [sternumPoint, setSternumPoint] = useState<{ x: number; y: number } | null>(null);
  const [woundPoint, setWoundPoint] = useState<{ x: number; y: number } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [poseError, setPoseError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);

  
  
  const handleCameraError = useCallback((msg: string) => setCameraError(msg), []);

  const stopCamera = useCallback(() => {
    if (!streamRef.current && videoRef.current?.srcObject) {
      streamRef.current = videoRef.current.srcObject as MediaStream;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    } else if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Intro scanning sweep (~2 s)
  useEffect(() => {
    const id = window.setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          window.clearInterval(id);
          setIsScanning(false);
          return 100;
        }
        return p + 5;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  // MediaPipe Pose tracking — CPR only
  useEffect(() => {
    if (activeEmergency !== 'cpr') {
      setSternumPoint(null);
      setPoseError(null);
      return;
    }

    const Pose = (window as any).Pose;
    if (typeof Pose !== 'function') {
      setPoseError(
        'Pose tracking is unavailable (MediaPipe script not loaded). Follow the voice guidance.',
      );
      return;
    }

    let isSubscribed = true;
    let animFrameId = 0;
    let pose: any = null;

    try {
      pose = new Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        selfieMode: facingMode === 'user',
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results: any) => {
        if (!isSubscribed) return;
        const video = videoRef.current;
        const landmarks = results?.poseLandmarks;
        const left = landmarks?.[11];
        const right = landmarks?.[12];

        if (!video || !left || !right) {
          setSternumPoint(null);
          return;
        }

        // Convert both shoulders to true screen pixels FIRST (handles object-cover cropping),
        // then do all geometry in pixel space so tall portrait viewports don't distort it.
        const leftPx = normalizedToPixels(left.x, left.y, video);
        const rightPx = normalizedToPixels(right.x, right.y, video);

        const midX = (leftPx.x + rightPx.x) / 2;
        const midY = (leftPx.y + rightPx.y) / 2;
        const shoulderWidth = Math.hypot(leftPx.x - rightPx.x, leftPx.y - rightPx.y);

        // Sternum sits a fixed fraction of shoulder width below the shoulder line.
        const sternumY = midY + shoulderWidth * 0.28;

        setSternumPoint({ x: midX, y: sternumY });
      });
    } catch (err) {
      console.error('Failed to initialise pose detection:', err);
      setPoseError('Pose tracking failed to start. Follow the voice guidance.');
      return;
    }

    let busy = false;
    const processFrame = async () => {
      if (!isSubscribed) return;
      const video = videoRef.current;
      if (!busy && video && video.readyState >= 2 && !video.paused) {
        busy = true;
        try {
          await pose.send({ image: video });
        } catch (err) {
          console.error('Pose frame error:', err);
        } finally {
          busy = false;
        }
      }
      if (isSubscribed) animFrameId = requestAnimationFrame(processFrame);
    };
    processFrame();

    return () => {
      isSubscribed = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      try {
        pose?.close?.();
      } catch {
        /* ignore */
      }
    };
  }, [activeEmergency, facingMode]);

  // Force-reload the choking demo video when the phase changes
  useEffect(() => {
    const vid = chokingVideoRef.current;
    if (!vid) return;
    vid.src = CHOKING_PHASE_VIDEO[chokingPhase];
    vid.load();
    vid.play().catch(() => {/* autoplay policy — user must interact first */});
  }, [chokingPhase]);

  // ── Instruction text — driven by state so AudioGuidance re-speaks ──────────
  const [instructionText, setInstructionText] = useState('');

  useEffect(() => {
    let text = language === 'en'
      ? 'Analyzing scene. Please select the emergency type below.'
      : 'स्थिति का विश्लेषण किया जा रहा है। कृपया नीचे आपातकालीन प्रकार चुनें।';
    if (activeEmergency === 'cpr') {
      text = TRANSLATIONS[language].cprPrompt;
    } else if (activeEmergency === 'bleeding') {
      text = woundPoint
        ? TRANSLATIONS[language].bleedingFound
        : TRANSLATIONS[language].bleedingScanning;
    } else if (activeEmergency === 'choking') {
      text = CHOKING_PHASE_INSTRUCTION[chokingPhase][language];
    } else if (activeEmergency === 'burns') {
      text = ''; // BurnSlideshow handles its own voice guidance
    }

    // Small delay guarantees the speech API isn't mid-utterance from a prior render
    const timeout = setTimeout(() => setInstructionText(text), 50);
    return () => clearTimeout(timeout);
  }, [activeEmergency, chokingPhase, woundPoint, language]);

  return (
    <div className="fixed inset-0 z-0 w-full h-screen bg-black text-white overflow-hidden">
      {/* ── Initial Language Selection Modal ── */}
      {!hasSelectedLanguage && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4">
            <h2 className="text-white text-lg font-bold text-center tracking-wide">
              Select Language / भाषा चुनें
            </h2>
            <p className="text-slate-400 text-xs text-center mb-2">
              Choose your preferred language for voice and text guidance.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setLanguage('hi')}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg text-base"
              >
                हिंदी (Hindi)
              </button>
              <button
                onClick={() => setLanguage('en')}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl border border-white/10 transition-all text-base"
              >
                English
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice engine — re-speaks on every instructionText change */}
      <AudioGuidance text={instructionText} isActive={voiceGuidance} lang={language} />

      {/* 110 BPM audible metronome (CPR only) */}
      <CPRMetronome isActive={activeEmergency === 'cpr'} />

      {/* Bleeding detector (mounted only when needed) */}
      {activeEmergency === 'bleeding' && (
        <BleedingDetector
          videoRef={videoRef}
          onWoundStatus={(coords) => {
            if (coords && videoRef.current) {
              setWoundPoint(normalizedToPixels(coords.x, coords.y, videoRef.current));
            } else {
              setWoundPoint(null);
            }
          }}
        />
      )}

      {activeEmergency === 'bleeding' && (
        <div className="absolute top-16 right-3 sm:right-4 z-40 w-44 sm:w-56 md:w-64 rounded-2xl overflow-hidden border-2 border-red-500/80 shadow-2xl bg-black/95 backdrop-blur-md pointer-events-auto">
          <div className="bg-red-600/90 px-2 py-0.5 text-[10px] sm:text-xs font-bold tracking-wider text-white text-center uppercase">
            {language === 'hi' ? 'दबाव गाइड' : 'Direct Pressure Guide'}
          </div>
          <video
            src="/videos/press2.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-32 sm:h-40 md:h-44 object-contain bg-black"
            onError={(e) => {
              // Fallback for root-level asset placement
              (e.currentTarget as HTMLVideoElement).src = '/press2.mp4';
            }}
          />
        </div>
      )}

      {/* ── Camera layer (hidden for choking and burns) ── */}
      {activeEmergency !== 'choking' && activeEmergency !== 'burns' ? (
        <div className="absolute inset-0">
          <CameraViewport
            videoRef={videoRef}
            onError={handleCameraError}
            facingMode={facingMode}
            className="w-full h-full object-cover"
          />
          <ScanOverlay isScanning={isScanning} scanProgress={scanProgress} />

          {activeEmergency === 'cpr' && (
            <SternumOverlay targetX={sternumPoint?.x} targetY={sternumPoint?.y} />
          )}

          {activeEmergency === 'bleeding' && woundPoint && (
            <div
              className="absolute pointer-events-none z-40 flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
              style={{ left: woundPoint.x, top: woundPoint.y }}
            >
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-amber-500 animate-ping opacity-40" />
                <div className="absolute inset-2 rounded-full border-2 border-amber-500 bg-amber-500/20" />
              </div>
              <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white bg-amber-600 px-3 py-1 rounded-full shadow-lg border border-amber-400">
                {language === 'hi' ? 'दबाव डालें' : 'APPLY PRESSURE'}
              </span>
            </div>
          )}
        </div>
      ) : activeEmergency === 'choking' ? (
        /* ── Choking: vertical layout — centered video + instructions panel below ── */
        <div className="absolute inset-0 z-10 bg-gray-50 dark:bg-slate-950 flex flex-col pt-16 px-4 pb-36 overflow-y-auto transition-colors">

          {/* Phase toggle pill */}
          <div className="max-w-xs mx-auto flex w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-1 border border-gray-200 dark:border-cyan-500/30 shadow-lg mb-4 flex-shrink-0 transition-colors">
            <button
              onClick={() => setChokingPhase('back-blows')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                chokingPhase === 'back-blows'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {TRANSLATIONS[language].chokingBtn1}
            </button>
            <button
              onClick={() => setChokingPhase('abdominal-thrusts')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                chokingPhase === 'abdominal-thrusts'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {TRANSLATIONS[language].chokingBtn2}
            </button>
          </div>

          {/* ── BIG Centred Video Container ── */}
          <div className="max-w-2xl w-full mx-auto max-h-[55vh] flex-shrink-0 flex items-center justify-center rounded-2xl overflow-hidden border border-gray-200 dark:border-white/20 bg-gray-100 dark:bg-black/90 shadow-2xl relative mb-4 transition-colors">
            <div className="absolute top-0 inset-x-0 z-10 bg-cyan-600/90 dark:bg-cyan-700/90 px-2 py-1 text-[10px] font-bold tracking-widest text-white text-center uppercase">
              {language === 'hi'
                ? (chokingPhase === 'back-blows' ? 'स्टेप गाइड: पीठ थपथपाएं' : 'स्टेप गाइड: पेट के धक्के')
                : CHOKING_PHASE_BADGE[chokingPhase]
              }
            </div>
            <video
              ref={chokingVideoRef}
              src={CHOKING_PHASE_VIDEO[chokingPhase]}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain pointer-events-none"
              onError={(e) => {
                const vid = e.currentTarget as HTMLVideoElement;
                if (!vid.src.includes('/A.mp4') && !vid.src.includes('/B.mp4')) return;
                // Strip /videos/ prefix → try root fallback once
                vid.src = CHOKING_PHASE_FALLBACK[chokingPhase];
              }}
            />
          </div>

          {/* ── Instructions Panel ── */}
          <div className="max-w-2xl mx-auto w-full flex-shrink-0 flex flex-col gap-3">
            {chokingPhase === 'back-blows' ? (
              <div className="bg-white/90 dark:bg-slate-900/90 border border-gray-200 dark:border-cyan-500/30 rounded-2xl p-4 sm:p-5 transition-colors shadow-sm dark:shadow-none">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-3">{TRANSLATIONS[language].chokingTitle1}</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                  {(TRANSLATIONS[language].chokingDesc1 as any[]).map((item, idx) => (
                    <li key={idx}><strong className="text-cyan-600 dark:text-cyan-400">{item.highlight}</strong> {item.text}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white/90 dark:bg-slate-900/90 border border-gray-200 dark:border-cyan-500/30 rounded-2xl p-4 sm:p-5 transition-colors shadow-sm dark:shadow-none">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-3">{TRANSLATIONS[language].chokingTitle2}</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                  {(TRANSLATIONS[language].chokingDesc2 as any[]).map((item, idx) => (
                    <li key={idx}><strong className="text-cyan-600 dark:text-cyan-400">{item.highlight}</strong> {item.text}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Emergency Escalation Pill */}
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/40 rounded-xl p-3 flex items-start gap-2 transition-colors">
              <span className="text-lg leading-none mt-0.5">⚠️</span>
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-100 font-medium leading-relaxed">
                <strong className="text-red-600 dark:text-red-400">{TRANSLATIONS[language].chokingAlert}</strong> {TRANSLATIONS[language].chokingAlertDesc}
              </p>
            </div>
          </div>
        </div>
      ) : activeEmergency === 'burns' ? (
        /* ── Burns: centered offline slideshow ── */
        <div className="absolute inset-0 z-10 bg-gray-50 dark:bg-slate-950 flex flex-col pt-16 px-4 pb-36 overflow-y-auto transition-colors items-center justify-center">
          <div className="w-full max-w-xl mx-auto">
            <BurnSlideshow />
          </div>
        </div>
      ) : null}

      {/* ── Floating HUD Top Bar ── */}
      <div className="absolute top-4 inset-x-4 z-40 flex items-center justify-between pointer-events-none">
        <div className="flex gap-2 pointer-events-auto items-center">
          <button
            onClick={() => {
              stopCamera();
              navigate(ROUTES.home);
            }}
            className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-white/10 text-white rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-slate-900/90 transition-colors shadow-sm text-[13px]"
          >
            <ArrowLeft className="h-4 w-4" />
            {TRANSLATIONS[language].exit}
          </button>

          {activeEmergency !== 'choking' && activeEmergency !== 'burns' && (
            <button
              onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
              className="flex items-center justify-center p-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-white hover:bg-slate-900/90 transition-colors shadow-sm"
              title="Flip Camera"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          )}

          
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-white/20 text-xs font-bold text-white tracking-wider backdrop-blur-md active:scale-95 transition-all"
          >
            {language === 'en' ? '🇮🇳 HI' : '🌐 EN'}
          </button>
        </div>

        <span className="pointer-events-none flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide text-white shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          {language === 'hi' ? 'लाइव AR प्रोटोकॉल' : 'LIVE AR PROTOCOL'}
        </span>
      </div>

      {/* ── Error banner ── */}
      {(cameraError || poseError) && (
        <div className="absolute left-4 right-4 top-16 z-50 rounded-2xl border border-amber-500/50 bg-amber-950/80 backdrop-blur-md p-3 text-xs text-amber-100">
          {cameraError ?? poseError}. {TRANSLATIONS[language].guidanceStillWorks}
        </div>
      )}

      {/* ── Instruction text pill (non-choking/burn modes only) ── */}
      {activeEmergency !== 'choking' && activeEmergency !== 'burns' && (
        <div className="absolute top-16 inset-x-4 max-w-sm mx-auto z-40 pointer-events-auto flex flex-col gap-2">
          <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-2xl text-center shadow-lg pointer-events-none">
            <p className="text-xs font-normal text-slate-200">
              {instructionText}
            </p>
          </div>
        </div>
      )}

      {/* ── Choking phase switcher removed — now embedded inside the choking screen ── */}

      {/* ── PiP video card — CPR only (choking has its own full layout) ── */}
      {activeEmergency === 'cpr' && (
        <div className="absolute top-36 right-4 z-40 w-28 sm:w-36 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black/95 pointer-events-auto">
          <div className="bg-red-600/90 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white text-center uppercase">
            {TRANSLATIONS[language].demoGuide}
          </div>
          <video
            src="/videos/h.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-20 sm:h-24 object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLVideoElement).src = '/h.mp4';
            }}
          />
        </div>
      )}

      {/* ── Bottom Panel — triage selector / reset + SOS ── */}
      <div className="absolute bottom-4 inset-x-4 max-w-sm mx-auto z-40 flex flex-col gap-2 pointer-events-auto">
        {activeEmergency === 'none' ? (
          <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 text-white rounded-2xl p-3 shadow-2xl space-y-2">
            <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {language === 'hi' ? 'आपातकालीन प्रकार चुनें' : 'Select Emergency Type'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveEmergency('cpr')}
                className="flex flex-col items-center justify-center gap-1 bg-red-600/90 hover:bg-red-500 text-white text-[10px] font-bold py-2 rounded-xl transition-all active:scale-95"
              >
                <Activity className="h-4 w-4" />
                {TRANSLATIONS[language].cpr}
              </button>
              <button
                onClick={() => setActiveEmergency('bleeding')}
                className="flex flex-col items-center justify-center gap-1 bg-amber-600/90 hover:bg-amber-500 text-white text-[10px] font-bold py-2 rounded-xl transition-all active:scale-95"
              >
                <AlertTriangle className="h-4 w-4" />
                {TRANSLATIONS[language].bleeding}
              </button>
              <button
                onClick={() => setActiveEmergency('choking')}
                className="flex flex-col items-center justify-center gap-1 bg-blue-600/90 hover:bg-blue-500 text-white text-[10px] font-bold py-2 rounded-xl transition-all active:scale-95"
              >
                <ShieldAlert className="h-4 w-4" />
                {TRANSLATIONS[language].choking}
              </button>
              <button
                onClick={() => setActiveEmergency('burns')}
                className="flex flex-col items-center justify-center gap-1 bg-orange-600/90 hover:bg-orange-500 text-white text-[10px] font-bold py-2 rounded-xl transition-all active:scale-95"
              >
                <AlertTriangle className="h-4 w-4" />
                {TRANSLATIONS[language].burns}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setActiveEmergency('none');
              setChokingPhase('back-blows'); // reset choking phase on exit
            }}
            className="text-[11px] font-semibold text-slate-400 hover:text-white py-1 text-center transition-colors"
          >
            {language === 'hi' ? '← प्रोटोकॉल रीसेट करें' : '← Reset Protocol'}
          </button>
        )}

        <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 text-white rounded-2xl p-3 shadow-2xl">
          <EmergencyActionPanel activeProtocol={activeEmergency} language={language} />
        </div>
      </div>
    </div>
  );
};

export default EmergencyScan;