# AR Emergency First Aid Assistant

A Smart India Hackathon (SIH) prototype for an augmented reality-based medical emergency first-aid assistance application.

## Problem

In emergency situations, bystanders and first responders often lack the knowledge or confidence to provide proper first aid. Every second counts in emergencies like cardiac arrest, severe bleeding, burns, or choking, but people may hesitate or perform incorrect procedures due to lack of training or panic.

## Solution

The AR Emergency First Aid Assistant is a mobile application that uses the device's camera, AI-assisted assessment (simulated in prototype), and augmented reality overlays to guide users through emergency first aid procedures in real-time. The application works completely offline, making it usable in remote areas or during disasters when internet connectivity may be unavailable.

## Core Features

- **Emergency Assessment**: Simulated AI analysis via camera to detect potential emergencies
- **AR Guidance**: Visual overlays showing step-by-step first aid instructions
- **Voice Guidance**: Optional audio instructions for hands-free guidance
- **Emergency Actions**: One-touch emergency services calling and location sharing
- **First Aid Library**: Comprehensive guide for various emergency scenarios
- **Offline Functionality**: Fully functional without internet connection
- **Location Sharing**: GPS-based location sharing with emergency services
- **Demo Mode**: Reliable demonstration path for presentations and judging

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Context API
- **Browser APIs**: 
  - MediaDevices API (camera access)
  - Geolocation API (GPS)
  - SpeechSynthesis API (voice guidance)
  - Web Share API (location sharing)
- **Offline**: PWA support with service workers

## Architecture

The application follows a modular component architecture:

```
src/
├── components/
│   ├── emergency/      # Emergency-related components
│   ├── camera/         # Camera and scanning components
│   ├── ar/             # AR overlay and guidance components
│   ├── first-aid/      # First aid library components
│   ├── location/       # Location and sharing components
│   └── ui/             # Reusable UI components
├── pages/              # Application pages/routes
├── contexts/           # React context providers
├── data/               # Static data (emergency scenarios)
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

Key contexts:
- `EmergencySessionContext`: Manages active emergency session, demo mode, voice guidance

## Running Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`

## Demo Instructions

For optimal SIH demonstration:

1. Open the application
2. Wait for system initialization to complete
3. Tap "START EMERGENCY SCAN"
4. Grant camera permission when prompted
5. Tap "SIMULATE EMERGENCY" (in demo mode)
6. Follow the emergency workflow:
   - View AI assessment results
   - Tap "SHARE LOCATION" 
   - Tap "START FIRST-AID GUIDANCE"
   - Progress through AR-guided steps
7. Explore the First Aid Library from the home screen

## Offline Behavior

The application is designed to work completely offline:
- Core functionality (camera, AR guidance, first aid library) works without internet
- Location sharing shows current location but sharing requires internet/cellular
- Emergency calling attempts to use device's phone capabilities
- All UI, logic, and content are loaded locally
- Service worker caches assets for offline PWA behavior (to be implemented)

## Camera Permissions

- The application requests camera access when starting an emergency scan
- If denied, users can use demo mode or try again
- No personal data is collected or stored from camera usage
- Camera feed is processed locally in the browser only

## Location Permissions

- The application requests location access when sharing location
- If denied, users can use demo location or try again
- Location data is used only for display and sharing purposes
- No location data is stored or transmitted without explicit user action

## Prototype Limitations

⚠️ **Important**: This is a prototype and not a clinically validated medical device.

- **AI Detection**: The AI assessment is simulated for demonstration purposes only. It does not perform actual medical diagnosis.
- **AR Guidance**: The AR overlay is a visual simulation and does not use actual ARCore/ARKit or computer vision object detection.
- **Medical Guidance**: First aid instructions are general and should be reviewed by medical professionals for clinical use.
- **Emergency Services**: Calling and location sharing simulate the actions but may not work in all browser/device configurations.

## Future Production Architecture

For a production deployment, the system would evolve to:

1. **Mobile Application**: Native React Native or Flutter app for better performance and device integration
2. **On-Device AI**: TensorFlow Lite or Core ML models for emergency detection
3. **AR Engine**: ARCore (Android) and ARKit (iOS) for actual augmented reality
4. **Medical Validation**: Clinically reviewed emergency scenarios and guidance
5. **Regulatory Compliance**: FDA/CE certification as a medical device if making diagnostic claims
6. **Backend Services**: Optional cloud synchronization for updates and analytics (while maintaining offline-first capability)
7. **Emergency Integration**: Direct integration with emergency services (where available)

## License

MIT License - see LICENSE file for details

## Acknowledgments

Created for Smart India Hackathon 2022