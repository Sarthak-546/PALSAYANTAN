// ─── Types ───────────────────────────────────────────────────────────────────

export interface FirstAidStep {
  stepNumber: number;
  instruction: string;
  detail: string;
  criticalWarning?: string;
  audioText: string;
}

export interface EmergencyScenario {
  id: string;
  title: string;
  category: 'Critical Life Support' | 'Trauma & Injury' | 'Environmental & Allergic';
  severity: 'CRITICAL' | 'URGENT' | 'STABLE';
  estimatedTime: string;
  overview: string;
  quickActionBadge: string;
  hasArGuide: boolean;
  arRoute?: string;
  steps: FirstAidStep[];
  dos: string[];
  donts: string[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

export const emergencyScenarios: EmergencyScenario[] = [
  {
    id: "cpr",
    title: 'CPR (Cardiac Arrest)',
    category: 'Critical Life Support',
    severity: 'CRITICAL',
    estimatedTime: '~20 min until EMS',
    overview: 'Cardiopulmonary resuscitation (CPR) maintains blood flow to the brain and heart during sudden cardiac arrest. High-quality compressions are critical for survival.',
    quickActionBadge: 'Start Compressions NOW',
    hasArGuide: true,
    arRoute: '/ar-first-aid/cpr',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Check Responsiveness',
        detail: 'Tap the person firmly on both shoulders and shout "Are you okay?" Look for breathing. Occasional gasping is not normal breathing.',
        criticalWarning: 'Do NOT shake the person if a spinal injury is suspected.',
        audioText: 'Tap both shoulders firmly and shout: Are you okay? Look for normal breathing.',
      },
      {
        stepNumber: 2,
        instruction: 'Call 112 and Get an AED',
        detail: 'Call emergency services, put the phone on speaker, and send someone to get an AED immediately.',
        audioText: 'Call 112. Put the phone on speaker mode. Ask a bystander to get an AED.',
      },
      {
        stepNumber: 3,
        instruction: 'Position Hands',
        detail: 'Kneel beside the person. Place the heel of one hand in the center of the chest (lower half of the sternum). Place your other hand on top and interlock your fingers.',
        audioText: 'Kneel next to the person. Place the heel of your hand on the center of their chest, and place your other hand on top.',
      },
      {
        stepNumber: 4,
        instruction: 'Begin Chest Compressions',
        detail: 'Push hard and fast. Compress the chest at least 2 inches (5 cm) deep at a rate of 110 BPM. Let the chest recoil completely between compressions.',
        criticalWarning: 'Minimise interruptions to less than 10 seconds.',
        audioText: 'Push hard and fast! Compress at least 2 inches deep. Follow the beat of the metronome.',
      },
      {
        stepNumber: 5,
        instruction: 'Use AED as Soon as Available',
        detail: 'Turn on the AED and follow its voice prompts. Apply the pads to the bare chest as shown on the pictures. Do not touch the patient when analyzing or shocking.',
        audioText: 'When the AED arrives, turn it on immediately and follow its voice instructions.',
      }
    ],
    dos: [
      'Push hard (at least 2 inches / 5cm deep)',
      'Push fast (100–120 compressions per minute)',
      'Allow full chest recoil after each compression',
      'Minimise interruptions to chest compressions',
      'Use an AED as soon as it arrives'
    ],
    donts: [
      'Don\'t delay compressions to check for a pulse',
      'Don\'t lean on the chest between compressions',
      'Don\'t stop CPR unless the person shows signs of life or EMS takes over'
    ]
  },
  {
    id: "bleeding",
    title: 'Severe Bleeding / Hemorrhage',
    category: 'Trauma & Injury',
    severity: 'CRITICAL',
    estimatedTime: '~5-10 min',
    overview: 'Uncontrolled hemorrhage is a leading cause of preventable death. Direct pressure and tourniquets (for limbs) save lives by stopping massive blood loss.',
    quickActionBadge: 'Apply Pressure NOW',
    hasArGuide: true,
    arRoute: '/emergency-scan',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Ensure Scene Safety',
        detail: 'Make sure the environment is safe. If available, wear gloves or use a barrier device to protect yourself from bloodborne pathogens.',
        audioText: 'Ensure the scene is safe. Protect your hands with gloves or a barrier if possible.',
      },
      {
        stepNumber: 2,
        instruction: 'Apply Firm Direct Pressure',
        detail: 'Place a clean cloth or sterile gauze directly over the wound. Apply firm, continuous pressure with both hands straight down onto the wound.',
        criticalWarning: 'Do NOT remove a dressing if it becomes blood-soaked. Add more layers on top.',
        audioText: 'Apply firm, continuous direct pressure to the wound using a clean cloth.',
      },
      {
        stepNumber: 3,
        instruction: 'Apply a Tourniquet (Limb Wounds)',
        detail: 'If heavy bleeding from an arm or leg does not stop with direct pressure, apply a tourniquet 2-3 inches above the wound. Tighten until the bleeding stops completely.',
        criticalWarning: 'Never place a tourniquet directly over a joint (elbow or knee).',
        audioText: 'If arm or leg bleeding does not stop, apply a tourniquet a few inches above the wound. Tighten until bleeding stops.',
      },
      {
        stepNumber: 4,
        instruction: 'Note the Time',
        detail: 'Write down the exact time the tourniquet was applied. This is critical information for the surgical team.',
        audioText: 'Note the exact time you applied the tourniquet.',
      },
      {
        stepNumber: 5,
        instruction: 'Treat for Shock',
        detail: 'Keep the injured person warm with a blanket and lay them flat. Do not give them anything to eat or drink.',
        audioText: 'Lay the person flat and keep them warm. Wait for emergency services.',
      }
    ],
    dos: [
      'Apply firm, continuous direct pressure',
      'Add more cloth on top if blood soaks through',
      'Apply a tourniquet high and tight for severe limb bleeding',
      'Note the exact time a tourniquet was applied',
      'Keep the patient warm to prevent shock'
    ],
    donts: [
      'Don\'t remove the first layer of cloth to check the wound',
      'Don\'t loosen or remove a tourniquet once applied',
      'Don\'t elevate a bleeding limb if it causes pain or delays pressure',
      'Don\'t give the person food or water'
    ]
  },
  {
    id: "choking",
    title: 'Choking (Heimlich Maneuver)',
    category: 'Critical Life Support',
    severity: 'CRITICAL',
    estimatedTime: '~1-3 min',
    overview: 'A severe airway obstruction prevents oxygen from reaching the lungs. Quick action combining back blows and abdominal thrusts can dislodge the object.',
    quickActionBadge: '5 Back Blows & 5 Thrusts',
    hasArGuide: false,
    steps: [
      {
        stepNumber: 1,
        instruction: 'Assess the Obstruction',
        detail: 'Ask "Are you choking?" If they cannot speak, cough forcefully, or breathe, it is a severe obstruction requiring immediate intervention.',
        audioText: 'Ask if they are choking. If they cannot cough or speak, act immediately.',
      },
      {
        stepNumber: 2,
        instruction: 'Call 112',
        detail: 'Direct a specific bystander to call 112 immediately while you begin treatment.',
        audioText: 'Tell someone specifically to call 112 right now.',
      },
      {
        stepNumber: 3,
        instruction: 'Deliver 5 Back Blows',
        detail: 'Stand slightly behind and to the side. Support their chest with one hand and lean them forward. Deliver 5 sharp firm blows between the shoulder blades with the heel of your other hand.',
        audioText: 'Lean the person forward. Give 5 firm back blows between their shoulder blades.',
      },
      {
        stepNumber: 4,
        instruction: 'Deliver 5 Abdominal Thrusts',
        detail: 'Stand behind them. Wrap arms around their waist. Make a fist just above their navel. Grasp your fist with the other hand and pull sharply inward and upward 5 times.',
        criticalWarning: 'Use chest thrusts (not abdominal) for pregnant individuals or larger adults.',
        audioText: 'Wrap arms around their waist. Place your fist above the navel and give 5 quick upward thrusts.',
      },
      {
        stepNumber: 5,
        instruction: 'Repeat Cycles',
        detail: 'Alternate cycles of 5 back blows and 5 abdominal thrusts until the object is dislodged, the person can breathe, or they become unresponsive (begin CPR if unresponsive).',
        audioText: 'Alternate 5 back blows and 5 abdominal thrusts until the object is clear.',
      }
    ],
    dos: [
      'Lean the person forward during back blows',
      'Use chest thrusts for pregnant or obese individuals',
      'Alternate 5 back blows and 5 abdominal thrusts',
      'Start CPR immediately if they lose consciousness'
    ],
    donts: [
      'Don\'t perform blind finger sweeps in the mouth',
      'Don\'t give abdominal thrusts to infants under 1 year (use infant protocols)',
      'Don\'t stop alternating blows and thrusts until the object comes out or they faint'
    ]
  },
  {
    id: "burns",
    title: 'Burns (Thermal / Chemical)',
    category: 'Environmental & Allergic',
    severity: 'URGENT',
    estimatedTime: '~20 min cooling',
    overview: 'Burns cause severe tissue damage and can lead to infection and shock. Rapid cooling with running water mitigates deep tissue damage.',
    quickActionBadge: 'Cool Water (No Ice!)',
    hasArGuide: false,
    steps: [
      {
        stepNumber: 1,
        instruction: 'Stop the Burning Process',
        detail: 'Remove from heat source. Stop, drop, and roll if clothing is on fire. Brush off dry chemicals before washing.',
        criticalWarning: 'For electrical burns, ensure power is OFF before approaching.',
        audioText: 'Remove the person from the heat or chemical source safely.',
      },
      {
        stepNumber: 2,
        instruction: 'Cool Under Running Water',
        detail: 'Immediately hold the burned area under cool, gently running water for at least 20 continuous minutes. This stops thermal damage from penetrating deeper.',
        criticalWarning: 'Never use ice or icy water. Ice causes intense vasoconstriction and drastically worsens tissue damage.',
        audioText: 'Hold the burn under cool running water for a full 20 minutes. Never use ice.',
      },
      {
        stepNumber: 3,
        instruction: 'Remove Constricting Items',
        detail: 'While cooling the burn, quickly and gently remove all jewelry, watches, or tight clothing from the burned area before swelling begins.',
        audioText: 'Remove rings, watches, and tight clothing from the area before it swells.',
      },
      {
        stepNumber: 4,
        instruction: 'Cover the Burn',
        detail: 'After cooling, cover the burn lightly with cling film (plastic wrap) applied loosely and lengthwise, or a clean, non-fluffy cloth. This reduces pain and infection risk.',
        audioText: 'Cover the cooled burn with a clean, non-fluffy cloth or loose plastic wrap.',
      },
      {
        stepNumber: 5,
        instruction: 'Seek Medical Care',
        detail: 'Call 112 for severe burns (larger than the victim\'s palm), burns on the face, hands, feet, or genitals, chemical/electrical burns, or pediatric burns.',
        audioText: 'Call 112 if the burn is large, on the face or hands, or caused by chemicals or electricity.',
      }
    ],
    dos: [
      'Cool under running water for at least 20 minutes',
      'Remove jewelry and tight clothing before swelling starts',
      'Cover with plastic wrap or a sterile non-stick dressing',
      'Keep the patient warm while cooling the localized burn'
    ],
    donts: [
      'Don\'t apply ice or ice water—it destroys tissue',
      'Don\'t apply butter, toothpaste, ointments, or home remedies',
      'Don\'t burst blisters',
      'Don\'t remove clothing that is stuck to the burn'
    ]
  },
  {
    id: "pregnancy",
    title: 'Pregnancy Emergency',
    category: 'Critical Medical',
    severity: 'CRITICAL',
    estimatedTime: '~20 min until EMS',
    overview: 'Specialized life-support protocol for late-stage pregnancy (20+ weeks). Standard first aid must be modified with Left Uterine Displacement or Left Lateral Positioning to maintain vena cava blood flow.',
    quickActionBadge: 'Left Lateral Displacement',
    hasArGuide: false,
    steps: [
      {
        stepNumber: 1,
        instruction: 'Check Responsiveness',
        detail: 'Tap the person on the shoulders and shout "Are you okay?" Look for normal breathing.',
        audioText: 'Tap the shoulders and shout: Are you okay? Look for normal breathing.',
      },
      {
        stepNumber: 2,
        instruction: 'If Unconscious But Breathing (Recovery Position)',
        detail: 'Roll the pregnant woman onto her LEFT side to prevent the uterus from compressing major blood vessels, restoring blood flow to her heart and the fetus.',
        audioText: 'If she is breathing, gently roll her onto her left side.',
      },
      {
        stepNumber: 3,
        instruction: 'If Not Breathing (Begin CPR)',
        detail: 'Start chest compressions at the same sternum location as standard CPR. Have a second rescuer pull the belly continuously to the left side (Left Uterine Displacement).',
        criticalWarning: 'Do NOT position the patient flat on her back without displacing the uterus.',
        audioText: 'If not breathing, start compressions. Have someone pull the belly strictly to the left side.',
      }
    ],
    dos: [
      'Call 102 / 112 immediately',
      'Manually displace pregnant abdomen to the patient\'s left side during CPR',
      'Place breathing patients in the left lateral recovery position'
    ],
    donts: [
      'NEVER leave a pregnant patient flat on her back (supine)',
      'Do NOT delay chest compressions for unresponsive victims'
    ]
  }
];