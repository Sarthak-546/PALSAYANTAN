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

type Emergency = 'cpr' | 'bleeding' | 'choking';

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
    cprPrompt: "Cardiac arrest protocol active. Kneel beside the patient. Interlock your hands and place the heel of your bottom hand directly on the red target in the center of the chest. Keep your elbows completely straight. Push down hard, at least two inches deep, and follow the beat of the metronome. Do not stop.",
    bleedingFound: "Severe bleeding detected. Find a clean cloth, towel, or sterile gauze immediately. Place it directly over the wound and press down as hard as you can using both hands. Do not remove the cloth to check the wound. Keep holding firm, continuous pressure.",
    bleedingScanning: "No injury spotted. Scanning for wounds...",
    bleedingTarget: "🔴 APPLY DIRECT PRESSURE HERE",
    chokingBlows: "Choking protocol active. Stand behind the victim and support their chest with one hand. Lean them far forward so the object can fall out. Use the heel of your other hand to deliver five forceful, sharp blows directly between their shoulder blades.",
    chokingThrusts: "Switching to abdominal thrusts. Wrap both arms around their waist. Make a fist and place the thumb side just above their belly button, well below the ribcage. Grab your fist with your other hand, and pull sharply inward and upward five times.",
    pregnancyCpr: "Maternal CPR active. A second rescuer must immediately place their hands on the right side of the belly and firmly pull it toward the left side. While the belly is held left, interlock your hands on the center of the chest and compress hard and fast to the beat.",
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
    cprPrompt: "कार्डियक अरेस्ट प्रोटोकॉल सक्रिय। मरीज के पास घुटनों के बल बैठें। अपने हाथों को फंसाकर छाती के बीच लाल निशान पर रखें। कोहनियों को बिल्कुल सीधा रखें और कम से कम दो इंच नीचे की ओर जोर से दबाएं। बीट के साथ दबाते रहें, रुकें नहीं।",
    bleedingFound: "गंभीर रक्तस्राव का पता चला है। तुरंत एक साफ कपड़ा या पट्टी लें। इसे सीधे घाव पर रखें और दोनों हाथों से पूरी ताकत से दबाएं। घाव देखने के लिए कपड़ा न हटाएं। लगातार दबाव बनाए रखें।",
    bleedingScanning: "कोई चोट नहीं दिखी। घाव की जांच जारी है...",
    bleedingTarget: "🔴 यहाँ सीधा दबाव बनाएं",
    chokingBlows: "चोकिंग प्रोटोकॉल सक्रिय। पीड़ित के पीछे खड़े हों और एक हाथ से उसकी छाती को सहारा दें। उसे आगे की ओर बहुत ज्यादा झुकाएं। दूसरे हाथ की हथेली के निचले हिस्से से कंधों के बीच पांच बार जोर से थपथपाएं।",
    chokingThrusts: "अब पेट पर दबाव डालें। दोनों बाहों को उनकी कमर के चारो ओर लपेटें। एक मुट्ठी बनाएं और अंगूठे वाले हिस्से को नाभि के ठीक ऊपर रखें। दूसरे हाथ से मुट्ठी को पकड़ें, और पांच बार तेजी से अंदर और ऊपर की ओर झटका दें।",
    pregnancyCpr: "मैटरनल सीपीआर सक्रिय। दूसरा व्यक्ति तुरंत अपने हाथ पेट के दाहिने हिस्से पर रखे और उसे बाईं ओर खींचे। पेट को बाईं ओर रखते हुए, छाती के बीच दोनों हाथ रखें और बीट के साथ तेजी से दबाएं।",
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

  // Ref for the choking demo video so we can force-reload when src changes (removed as we no longer support choking/burns)
  // const chokingVideoRef = useRef<HTMLVideoElement | null>(null);

  const protocolParam = searchParams.get('protocol') as Emergency | null;
  useEffect(() => {
    if (protocolParam && protocolParam.includes('pregnancy')) {
      navigate('/first-aid/pregnancy', { replace: true });
    }
  }, [protocolParam, navigate]);

  const initialProtocol =
    protocolParam && ['cpr', 'bleeding', 'choking'].includes(protocolParam)
      ? (protocolParam as Emergency)
      : 'cpr'; // Default to CPR

  const [activeEmergency, setActiveEmergency] = useState<Emergency>(initialProtocol);
  const { language, setLanguage, hasSelectedLanguage } = useLanguage();
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  // const [chokingPhase, setChokingPhase] = useState<ChokingPhase>('back-blows'); // Removed
  const [sternumPoint, setSternumPoint] = useState<{ x: number; y: number } | null>(null);
  const [woundPoint, setWoundPoint] = useState<{ x: number; y: number } | null>(null);
  const [bodyMask, setBodyMask] = useState<{ minX: number; maxX: number; minY: number; maxY: number } | undefined>(undefined);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [poseError, setPoseError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);

  // Refs for performance optimization
  const prevSternumPointRef = useRef<{ x: number; y: number } | null>(null);

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
      // Clear body mask when not in CPR mode (optional, but clean)
      if (activeEmergency === 'bleeding') {
        setBodyMask(undefined);
      }
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

        // Landmark 11 = left shoulder, landmark 12 = right shoulder (MediaPipe Pose).
        const left = landmarks?.[11];
        const right = landmarks?.[12];

        // Handle bleeding detection torso masking
        if (activeEmergency === 'bleeding' && landmarks) {
          // Define key torso and limb landmarks for bounding box
          // Shoulders: 11 & 12, Elbows: 13 & 14, Wrists: 15 & 16, Hips: 23 & 24
          const keyIndices = [11, 12, 13, 14, 15, 16, 23, 24];
          const validPoints = keyIndices
            .map(idx => landmarks[idx])
            .filter(point => point && point.visibility > 0.5); // Only use confident landmarks

          if (validPoints.length > 0) {
            const xs = validPoints.map(p => p.x);
            const ys = validPoints.map(p => p.y);

            const rawMinX = Math.min(...xs);
            const rawMaxX = Math.max(...xs);
            const rawMinY = Math.min(...ys);
            const rawMaxY = Math.max(...ys);

            // Expand bounding box by 15% to account for body mass/flesh
            const width = rawMaxX - rawMinX;
            const height = rawMaxY - rawMinY;
            const expandX = width * 0.15;
            const expandY = height * 0.15;

            const maskedMinX = Math.max(0, rawMinX - expandX);
            const maskedMaxX = Math.min(1, rawMaxX + expandX);
            const maskedMinY = Math.max(0, rawMinY - expandY);
            const maskedMaxY = Math.min(1, rawMaxY + expandY);

            setBodyMask({
              minX: maskedMinX,
              maxX: maskedMaxX,
              minY: maskedMinY,
              maxY: maskedMaxY,
            });
          } else {
            // No confident landmarks detected, scan whole frame
            setBodyMask(undefined);
          }
        }

        if (!video || !left || !right) {
          setSternumPoint(null);
          return;
        }

        // Convert both shoulders to true screen pixels FIRST (handles object-cover cropping
        // and aspect-ratio differences between the video frame and the rendered box), then do
        // all geometry in pixel space so tall portrait viewports don't distort it.
        const leftPx = normalizedToPixels(left.x, left.y, video);
        const rightPx = normalizedToPixels(right.x, right.y, video);

        const midX = (leftPx.x + rightPx.x) / 2;
        const midY = (leftPx.y + rightPx.y) / 2;
        const shoulderWidth = Math.hypot(leftPx.x - rightPx.x, leftPx.y - rightPx.y);

        // Sternum sits a fixed proportion of shoulder width below the shoulder line —
        // computed entirely in pixel space, so it holds across orientations/aspect ratios.
        const sternumY = midY + shoulderWidth * 0.28;

        // Performance optimization: Only update state if movement exceeds 3px threshold
        const newPoint = { x: midX, y: sternumY };
        const prevPoint = prevSternumPointRef.current;

        if (!prevPoint ||
            Math.abs(newPoint.x - prevPoint.x) > 3 ||
            Math.abs(newPoint.y - prevPoint.y) > 3) {
          prevSternumPointRef.current = newPoint;
          setSternumPoint(newPoint);
        }
      });
    } catch (err) {
      // Removed console.error as per optimization requirements
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
          // Removed console.error as per optimization requirements
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

  // Force-reload the choking demo video when the phase changes (removed as we no longer support choking/burns)
  // useEffect(() => {
  //   const vid = chokingVideoRef.current;
  //   if (!vid) return;
  //   vid.src = CHOKING_PHASE_VIDEO[chokingPhase];
  //   vid.load();
  //   vid.play().catch(() => {/* autoplay policy — user must interact first */});
  // }, [chokingPhase]);

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
      // For choking, we alternate between steps every few seconds? For now show both steps combined.
      text = language === 'en'
        ? 'Choking emergency: Give 5 back blows, then 5 abdominal thrusts. Repeat until obstruction cleared.'
        : 'दम घुटना आपातकाल: 5 पीठ थपथप दें, फिर 5 पेट के धक्के दोहराएं जब तक अवरुद्ध न हो जाए।';
    }
    // choking and burns cases removed

    // Small delay guarantees the speech API isn't mid-utterance from a prior render
    const timeout = setTimeout(() => setInstructionText(text), 50);
    return () => clearTimeout(timeout);
  }, [activeEmergency, woundPoint, language]);

  // Handler for top toggle selection
  const handleTriageSelection = (protocol: Emergency) => {
    setActiveEmergency(protocol);
  };

  return (
    <div className="fixed inset-0 z-0 w-full h-screen bg-black text-white overflow-hidden">
      {/* Initial Language Selection Modal (REMOVED - now in Home only) */}

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
          scanMask={bodyMask}
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

      {/* ── Top Toggle Bar ── */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2">
        <div className="bg-gray-900/90 backdrop-blur border border-gray-700 rounded-full p-1 flex items-center">
          <button
            onClick={() => handleTriageSelection('cpr')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeEmergency === 'cpr'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            CPR
          </button>
          <button
            onClick={() => handleTriageSelection('bleeding')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeEmergency === 'bleeding'
                ? 'bg-amber-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            BLEEDING
          </button>
          {/* Choking toggle - only show if we want to allow switching; comment out if not needed */}
          {/*
          <button
            onClick={() => handleTriageSelection('choking')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeEmergency === 'choking'
                ? 'bg-cyan-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            CHOKING
          </button>
          */}
        </div>
      </div>

      {/* ── Camera layer (hidden for choking and burns) ── */}
      {/* Since we only support cpr and bleeding, both use the camera layer */}
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

        {/* Choking overlay: show a simple guide over camera */}
        {activeEmergency === 'choking' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/60 backdrop-blur-sm">
            <div className="space-y-6 text-center">
              <h2 className="text-xl font-bold text-white">
                {language === 'en' ? 'CHOKING EMERGENCY' : 'दम घुटना आपातकाल'}
              </h2>
              <div className="space-y-4 max-w-md">
                {/* Step 1 */}
                <div className="bg-white/10 dark:bg-slate-900/50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {language === 'en' ? 'Step 1: 5 Back Blows' : 'चरण 1: 5 पीठ थपथप'}
                  </h3>
                  <p className="text-sm text-slate-200 dark:text-slate-300">
                    {language === 'en'
                      ? 'Stand to the side and slightly behind the victim. Support their chest with one hand. Lean the victim forward so the dislodged object falls out of the mouth. Deliver up to 5 sharp blows between the shoulder blades using the heel of your hand.'
                      : 'पीड़ित के बगल में और थोड़ा पीछे खड़े हों। एक हाथ से उनकी छाती को सहारा दें। पीड़ित को आगे की ओर झुकाएं ताकि फंसी हुई वस्तु मुंह से बाहर गिरे। कंधे के ब्लेड के बीच 5 तेज, जोरदार प्रहार करें।'}
                  </p>
                </div>
                {/* Step 2 */}
                <div className="bg-white/10 dark:bg-slate-900/50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {language === 'en' ? 'Step 2: 5 Abdominal Thrusts' : 'चरण 2: 5 पेट के धक्के'}
                  </h3>
                  <p className="text-sm text-slate-200 dark:text-slate-300">
                    {language === 'en'
                      ? 'Stand behind the victim, wrap arms around their waist. Make a fist with one hand placed thumb-side above the belly button. Grasp fist with other hand and pull sharply inward and upward 5 times.'
                      : 'पीड़ित के पीछे खड़े हों, दोनों हाथों को उनकी कमर के चारों ओर लपेटें। एक हाथ से मुट्ठी बनाएं; अंगूठे के हिस्से को नाभि के ठीक ऊपर रखें। दूसरे हाथ से मुट्ठी को पकड़ें। 5 बार तेजी से अंदर और ऊपर की ओर धक्का दें।'}
                  </p>
                </div>
                {/* Repeat note */}
                <p className="text-sm text-slate-300 dark:text-slate-400 italic">
                  {language === 'en' ? 'Repeat cycles of 5 back blows and 5 abdominal thrusts until obstruction is cleared.' : '5 पीठ थपथप और 5 पेट के धक्के के चक्र दोहराएं जब तक अवरुद्ध न हो जाए।'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

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

          <LanguageSwitcher className="ml-3" />
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

      {/* ── Bottom Panel — Union of Instruction and Action Panel ── */}
      <div className="absolute bottom-3 inset-x-3 max-w-md mx-auto z-40 bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 pointer-events-auto">
        {/* 1. Instruction Content (Choking / CPR / Bleeding steps) */}
        {/* Since we removed choking and burns, we always show the instructionText */}
        <div className="w-full text-slate-100">
          <p className="text-xs font-semibold text-slate-200 line-clamp-2 text-center">
            {instructionText}
          </p>
        </div>

        {/* 2. Action Panel placed in standard document flow below the text */}
        <div className="w-full">
          <EmergencyActionPanel activeProtocol={activeEmergency} language={language} />
        </div>
      </div>
    </div>
  );
};

export default EmergencyScan;