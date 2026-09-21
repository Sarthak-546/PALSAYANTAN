// ─── Types ───────────────────────────────────────────────────────────────────

export interface TranslatableText {
  en: string;
  hi: string;
}

export interface FirstAidStep {
  stepNumber: number;
  instruction: TranslatableText | string;
  detail: TranslatableText | string;
  criticalWarning?: TranslatableText | string;
  audioText: TranslatableText | string;
}

export interface EmergencyScenario {
  id: string;
  title: TranslatableText | string;
  category: TranslatableText | string;
  severity: 'CRITICAL' | 'URGENT' | 'STABLE';
  estimatedTime: TranslatableText | string;
  overview: TranslatableText | string;
  quickActionBadge: TranslatableText | string;
  hasArGuide: boolean;
  arRoute?: string;
  steps: FirstAidStep[];
  dos: (TranslatableText | string)[];
  donts: (TranslatableText | string)[];
}

export const t = (text: TranslatableText | string | undefined, lang: 'en' | 'hi'): string => {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[lang] || text.en;
};

export const emergencyScenarios: EmergencyScenario[] = [
  {
    id: "cpr",
    title: { en: 'CPR (Cardiac Arrest)', hi: 'सीपीआर (हृदयाघात)' },
    category: { en: 'Critical Life Support', hi: 'गंभीर जीवन रक्षक' },
    severity: 'CRITICAL',
    estimatedTime: { en: '~20 min until EMS', hi: 'एम्बुलेंस तक ~20 मिनट' },
    overview: { en: 'Cardiopulmonary resuscitation (CPR) maintains blood flow to the brain and heart during sudden cardiac arrest. High-quality compressions are critical for survival.', hi: 'कार्डियोपल्मोनरी रिससिटेशन (सीपीआर) मस्तिष्क और हृदय में रक्त प्रवाह बनाए रखता है।' },
    quickActionBadge: { en: 'Start Compressions NOW', hi: 'अभी दबाव शुरू करें' },
    hasArGuide: true,
    arRoute: '/ar-first-aid/cpr',
    steps: [
      {
        stepNumber: 1,
        instruction: { en: 'Check Responsiveness', hi: 'प्रतिक्रिया जांचें' },
        detail: { en: 'Tap both shoulders firmly and shout "Are you okay?" Look for breathing.', hi: 'दोनों कंधों को थपथपाएं और पूछें "क्या आप ठीक हैं?"' },
        criticalWarning: { en: 'Do NOT shake if a spinal injury is suspected.', hi: 'रीढ़ की चोट का संदेह होने पर न हिलाएं।' },
        audioText: { en: 'Tap both shoulders firmly and shout: Are you okay? Look for normal breathing.', hi: 'दोनों कंधों को थपथपाएं और चिल्लाएं।' }
      },
      {
        stepNumber: 2,
        instruction: { en: 'Call 112 and Get an AED', hi: '112 पर कॉल करें' },
        detail: { en: 'Call emergency services, put on speaker, send someone for an AED.', hi: '112 पर कॉल करें और AED मंगवाएं।' },
        audioText: { en: 'Call 112. Put the phone on speaker mode. Ask for an AED.', hi: '112 पर कॉल करें।' }
      },
      {
        stepNumber: 3,
        instruction: { en: 'Position Hands', hi: 'हाथ सही रखें' },
        detail: { en: 'Place the heel of one hand in the center of the chest. Interlock fingers with the other hand.', hi: 'छाती के बीच में हथेली रखें और उंगलियां फंसाएं।' },
        audioText: { en: 'Place the heel of your hand in the center of the chest.', hi: 'छाती के केंद्र में हाथ रखें।' }
      },
      {
        stepNumber: 4,
        instruction: { en: 'Begin Chest Compressions', hi: 'दबाव शुरू करें' },
        detail: { en: 'Compress chest 2 inches (5 cm) deep at 110 BPM. Allow full chest recoil.', hi: '2 इंच गहरा और प्रति मिनट 110 की दर से दबाएं।' },
        criticalWarning: { en: 'Minimise interruptions to less than 10 seconds.', hi: 'दबाव में रुकावट न आने दें।' },
        audioText: { en: 'Push hard and fast! 110 beats per minute.', hi: 'जोर से और तेजी से दबाएं।' }
      },
      {
        stepNumber: 5,
        instruction: { en: 'Use AED When Ready', hi: 'AED का उपयोग करें' },
        detail: { en: 'Turn on AED, follow voice prompts, apply pads to bare chest.', hi: 'AED चालू करें और निर्देशों का पालन करें।' },
        audioText: { en: 'Turn on AED and follow voice instructions.', hi: 'AED चालू करें।' }
      }
    ],
    dos: [
      { en: 'Push hard and fast', hi: 'तेज और गहरा दबाएं' },
      { en: 'Allow full chest recoil', hi: 'छाती को वापस आने दें' },
      { en: 'Use an AED immediately', hi: 'AED का प्रयोग करें' }
    ],
    donts: [
      { en: "Don't delay compressions", hi: 'देरी न करें' },
      { en: "Don't lean on the chest", hi: 'छाती पर झुककर न रहें' }
    ]
  },
  {
    id: "bleeding",
    title: { en: 'Severe Bleeding / Hemorrhage', hi: 'गंभीर रक्तस्राव' },
    category: { en: 'Trauma & Injury', hi: 'चोट व घाव' },
    severity: 'CRITICAL',
    estimatedTime: { en: '~5-10 min', hi: '~5-10 मिनट' },
    overview: { en: 'Direct pressure and tourniquets stop massive blood loss.', hi: 'सीधा दबाव और टूर्निकेट अत्यधिक रक्तस्राव को रोकते हैं।' },
    quickActionBadge: { en: 'Apply Pressure NOW', hi: 'दबाव डालें' },
    hasArGuide: true,
    arRoute: '/emergency-scan',
    steps: [
      {
        stepNumber: 1,
        instruction: { en: 'Ensure Safety', hi: 'सुरक्षा सुनिश्चित करें' },
        detail: { en: 'Use gloves or barrier if available.', hi: 'दस्ताने पहनें।' },
        audioText: { en: 'Ensure scene safety.', hi: 'सुरक्षा सुनिश्चित करें।' }
      },
      {
        stepNumber: 2,
        instruction: { en: 'Apply Firm Direct Pressure', hi: 'सीधा दबाव डालें' },
        detail: { en: 'Press clean cloth firmly onto wound.', hi: 'घाव पर सीधा दबाव बनाएं।' },
        audioText: { en: 'Apply direct pressure.', hi: 'घाव पर दबाव डालें।' }
      },
      {
        stepNumber: 3,
        instruction: { en: 'Apply Tourniquet if Needed', hi: 'टूर्निकेट लगाएं' },
        detail: { en: 'Place 2-3 inches above limb wound and tighten.', hi: 'घाव से 2-3 इंच ऊपर बांधें।' },
        audioText: { en: 'Apply tourniquet if bleeding persists.', hi: 'टूर्निकेट कसें।' }
      }
    ],
    dos: [
      { en: 'Continuous direct pressure', hi: 'लगातार दबाव बनाएं' },
      { en: 'Keep patient warm', hi: 'मरीज को गर्म रखें' }
    ],
    donts: [
      { en: "Don't remove first cloth layer", hi: 'पहली पट्टी न हटाएं' },
      { en: "Don't give food/water", hi: 'पानी या खाना न दें' }
    ]
  },
  {
    id: "choking",
    title: { en: 'Choking (Heimlich)', hi: 'दम घुटना' },
    category: { en: 'Critical Life Support', hi: 'गंभीर जीवन रक्षक' },
    severity: 'CRITICAL',
    estimatedTime: { en: '~1-3 min', hi: '~1-3 मिनट' },
    overview: { en: 'Back blows and abdominal thrusts dislodge airway obstruction.', hi: 'पीठ पर वार और पेट पर दबाव से रुकावट हटाएं।' },
    quickActionBadge: { en: '5 Blows & 5 Thrusts', hi: '5 वार व 5 झटके' },
    hasArGuide: false,
    steps: [
      {
        stepNumber: 1,
        instruction: { en: 'Assess Airway', hi: 'स्थिति जांचें' },
        detail: { en: 'Ask if they are choking.', hi: 'पूछें क्या दम घुट रहा है।' },
        audioText: { en: 'Check if they can breathe or cough.', hi: 'सांस की जांच करें।' }
      },
      {
        stepNumber: 2,
        instruction: { en: '5 Back Blows', hi: '5 पीठ पर वार' },
        detail: { en: 'Deliver sharp blows between shoulder blades.', hi: 'कंधों के बीच 5 बार मारें।' },
        audioText: { en: 'Give 5 back blows.', hi: 'पीठ पर 5 वार करें।' }
      },
      {
        stepNumber: 3,
        instruction: { en: '5 Abdominal Thrusts', hi: '5 पेट के झटके' },
        detail: { en: 'Fist above navel, pull inward and upward.', hi: 'नाभि के ऊपर मुट्ठी रखकर ऊपर खींचें।' },
        audioText: { en: 'Perform 5 inward/upward abdominal thrusts.', hi: '5 पेट के झटके दें।' }
      }
    ],
    dos: [
      { en: 'Alternate 5 blows and 5 thrusts', hi: 'बारी-बारी से वार और झटके दें' }
    ],
    donts: [
      { en: "Don't perform blind finger sweeps", hi: 'मुंह में उंगली न डालें' }
    ]
  },
  {
    id: "burns",
    title: { en: 'Burns (Thermal/Chemical)', hi: 'जलना' },
    category: { en: 'Environmental & Allergic', hi: 'पर्यावरणीय व चोट' },
    severity: 'URGENT',
    estimatedTime: { en: '~20 min cooling', hi: '~20 मिनट धोएं' },
    overview: { en: 'Cool under running water to limit tissue damage.', hi: 'ठंडे बहते पानी से ऊतकों को बचाएं।' },
    quickActionBadge: { en: 'Cool Water (No Ice)', hi: 'ठंडा पानी (बर्फ नहीं)' },
    hasArGuide: false,
    steps: [
      {
        stepNumber: 1,
        instruction: { en: 'Cool with Running Water', hi: 'ठंडे पानी से धोएं' },
        detail: { en: 'Hold under cool running water for 20 minutes.', hi: '20 मिनट तक पानी में रखें।' },
        audioText: { en: 'Cool with gentle running water.', hi: 'ठंडे पानी से धोएं।' }
      },
      {
        stepNumber: 2,
        instruction: { en: 'Cover Loosely', hi: 'हल्का ढकें' },
        detail: { en: 'Use clean plastic wrap or non-stick cloth.', hi: 'साफ कपड़े से ढकें।' },
        audioText: { en: 'Cover burn loosely.', hi: 'घाव को ढकें।' }
      }
    ],
    dos: [
      { en: 'Cool for 20 minutes', hi: '20 मिनट धोएं' }
    ],
    donts: [
      { en: "Don't apply ice, butter, or paste", hi: 'बर्फ या टूथपेस्ट न लगाएं' }
    ]
  },
  {
    id: "pregnancy",
    title: { en: 'Pregnancy Emergency', hi: 'गर्भावस्था आपातकाल' },
    category: { en: 'Critical Medical', hi: 'गंभीर चिकित्सा' },
    severity: 'CRITICAL',
    estimatedTime: { en: '~20 min', hi: '~20 मिनट' },
    overview: { en: 'Left Uterine Displacement or Left Lateral Positioning maintains vital blood flow.', hi: 'रक्त प्रवाह के लिए बाईं ओर करवट या विस्थापन आवश्यक है।' },
    quickActionBadge: { en: 'Left Displacement', hi: 'बाईं ओर खिसकाएं' },
    hasArGuide: false,
    steps: [
      {
        stepNumber: 1,
        instruction: { en: 'Recovery Position', hi: 'बाईं ओर करवट' },
        detail: { en: 'Roll woman onto her LEFT side.', hi: 'महिला को बाईं ओर लिटाएं।' },
        audioText: { en: 'Roll onto her left side.', hi: 'बाईं करवट लिटाएं।' }
      },
      {
        stepNumber: 2,
        instruction: { en: 'CPR with Left Uterine Displacement', hi: 'बाईं ओर झुकाकर सीपीआर' },
        detail: { en: 'Displace uterus to the left while doing standard compressions.', hi: 'पेट को बाईं ओर खींचते हुए सीपीआर दें।' },
        audioText: { en: 'Pull belly to the left during compressions.', hi: 'पेट को बाईं ओर रखकर दबाएं।' }
      }
    ],
    dos: [
      { en: 'Call 102/112 immediately', hi: '102/112 पर कॉल करें' }
    ],
    donts: [
      { en: 'NEVER leave flat on her back', hi: 'पीठ के बल सीधा न लिटाएं' }
    ]
  }
];