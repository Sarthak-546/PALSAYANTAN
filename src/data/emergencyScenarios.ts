export const emergencyScenarios = [
  {
    id: 'cpr',
    title: 'CPR (Cardiopulmonary Resuscitation)',
    description: 'Life-saving technique used when someone\'s breathing or heartbeat has stopped. Includes chest compressions and rescue breaths.',
    icon: 'heart-pulse',
    steps: [
      {
        id: 'cpr-1',
        title: 'Check Responsiveness',
        instruction: 'Tap the person firmly and shout, \"Are you okay?\" Look for any response or movement.',
        visualType: 'person-tap',
        audioText: 'Check if the person is responsive by tapping and shouting.'
      },
      {
        id: 'cpr-2',
        title: 'Call for Help',
        instruction: 'If unresponsive, call emergency services immediately or ask someone else to call.',
        visualType: 'phone-call',
        audioText: 'Call emergency services or ask someone nearby to call for help.'
      },
      {
        id: 'cpr-3',
        title: 'Position Hands',
        instruction: 'Place the heel of one hand on the center of the chest, then place your other hand on top, interlocking fingers.',
        visualType: 'hand-placement',
        audioText: 'Position your hands correctly on the center of the chest.'
      },
      {
        id: 'cpr-4',
        title: 'Perform Chest Compressions',
        instruction: 'Push hard and fast at a rate of 100-120 compressions per minute, allowing the chest to recoil completely between compressions.',
        visualType: 'compressions',
        audioText: 'Begin chest compressions. Push hard and fast in the center of the chest.'
      },
      {
        id: 'cpr-5',
        title: 'Continue Until Help Arrives',
        instruction: 'Continue CPR until emergency services arrive or the person shows signs of life.',
        visualType: 'continue-cpr',
        audioText: 'Continue chest compressions until help arrives or the person recovers.'
      }
    ]
  },
  {
    id: 'bleeding',
    title: 'Severe Bleeding Control',
    description: 'Steps to control severe bleeding from wounds using direct pressure and elevation.',
    icon: 'droplet',
    steps: [
      {
        id: 'bleeding-1',
        title: 'Apply Direct Pressure',
        instruction: 'Use a clean cloth or bandage to apply firm, direct pressure to the wound.',
        visualType: 'direct-pressure',
        audioText: 'Apply firm pressure to the wound with a clean cloth.'
      },
      {
        id: 'bleeding-2',
        title: 'Maintain Pressure',
        instruction: 'Continue applying pressure even if the cloth becomes soaked. Add more layers if needed.',
        visualType: 'maintain-pressure',
        audioText: 'Keep applying pressure. If blood soaks through, add more cloth without removing the original.'
      },
      {
        id: 'bleeding-3',
        title: 'Elevate if Possible',
        instruction: 'If the wound is on a limb and there\'s no suspected fracture, elevate it above heart level.',
        visualType: 'elevate-limb',
        audioText: 'If possible, elevate the wounded limb above the level of the heart.'
      },
      {
        id: 'bleeding-4',
        title: 'Seek Medical Help',
        instruction: 'Continue pressure and seek emergency medical assistance immediately.',
        visualType: 'seek-help',
        audioText: 'Maintain pressure and get emergency medical help as soon as possible.'
      }
    ]
  },
  {
    id: 'burns',
    title: 'Burn Treatment',
    description: 'Initial treatment for different types of burns (thermal, chemical, electrical).',
    icon: 'fire',
    steps: [
      {
        id: 'burns-1',
        title: 'Stop the Burning Process',
        instruction: 'Remove the person from the source of heat, flame, chemical, or electricity.',
        visualType: 'remove-from-source',
        audioText: 'Move the person away from what caused the burn.'
      },
      {
        id: 'burns-2',
        title: 'Cool the Burn',
        instruction: 'Cool the burn with cool (not cold) running water for 10-20 minutes.',
        visualType: 'cool-burn',
        audioText: 'Run cool water over the burn for 10 to 20 minutes.'
      },
      {
        id: 'burns-3',
        title: 'Cover the Burn',
        instruction: 'Cover the burn loosely with a sterile, non-adhesive bandage or clean cloth.',
        visualType: 'cover-burn',
        audioText: 'Cover the burn with a clean, loose bandage or cloth.'
      },
      {
        id: 'burns-4',
        title: 'Seek Medical Attention',
        instruction: 'For serious burns, seek medical help immediately. Do not apply ointments or butter.',
        visualType: 'seek-medical-help',
        audioText: 'Get medical help for serious burns. Do not apply any ointments or home remedies.'
      }
    ]
  },
  {
    id: 'choking',
    title: 'Choking Assistance (Heimlich Maneuver)',
    description: 'Steps to help a conscious choking victim using abdominal thrusts.',
    icon: 'lungs',
    steps: [
      {
        id: 'choking-1',
        title: 'Assess the Situation',
        instruction: 'Ask \"Are you choking?\" If they can\'t speak, cough, or breathe, act immediately.',
        visualType: 'assess-choking',
        audioText: "Ask if they are choking. If they cannot respond, prepare to help."
      },
      {
        id: 'choking-2',
        title: 'Position Yourself',
        instruction: 'Stand behind the person and wrap your arms around their waist.',
        visualType: 'position-behind',
        audioText: 'Stand behind the person and put your arms around their waist.'
      },
      {
        id: 'choking-3',
        title: 'Make a Fist',
        instruction: 'Make a fist with one hand and place it slightly above the navel, well below the breastbone.',
        visualType: 'fist-position',
        audioText: 'Make a fist and place it just above the belly button.'
      },
      {
        id: 'choking-4',
        title: 'Perform Abdominal Thrusts',
        instruction: 'Grasp your fist with your other hand and perform quick, upward thrusts.',
        visualType: 'abdominal-thrusts',
        audioText: 'Grab your fist with your other hand and give quick upward pushes.'
      },
      {
        id: 'choking-5',
        title: 'Repeat Until Object is Dislodged',
        instruction: 'Continue thrusts until the object is expelled or the person can breathe or cough.',
        visualType: 'repeat-thrusts',
        audioText: 'Keep doing the thrusts until the object comes out or they can breathe again.'
      }
    ]
  }
];