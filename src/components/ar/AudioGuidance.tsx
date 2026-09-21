import { useEffect, useRef, useState } from 'react';

interface AudioGuidanceProps {
  text: string | null;
  isActive: boolean;
  lang?: 'en' | 'hi';
}

const selectFemaleVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  // 1. Check for specific top-tier clear female voices
  const priorityNames = [
    'Google UK English Female',
    'Google US English',
    'Samantha',
    'Karen',
    'Victoria',
    'Microsoft Zira',
    'Microsoft Jenny Online (Natural)',
    'en-US-language'
  ];

  for (const name of priorityNames) {
    const found = voices.find(v => v.name.includes(name));
    if (found) return found;
  }

  // 2. Fallback: Any English voice with "female" in the name or ID
  const anyFemale = voices.find(v => 
    v.lang.startsWith('en') && 
    (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('girl'))
  );
  if (anyFemale) return anyFemale;

  // 3. Fallback: Default to standard English (en-US or en-GB)
  return voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en')) || null;
};

const selectHindiVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  return voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('hi-in')) || null;
};

export const AudioGuidance = ({
  text,
  isActive,
  lang = 'en'
}: AudioGuidanceProps) => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    // Cleanup on unmount
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (utteranceRef.current) {
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive || !text || !window.speechSynthesis) return;

    // Don't interrupt if already speaking this exact text
    if (
      isSpeakingRef.current &&
      utteranceRef.current &&
      utteranceRef.current.text === text
    ) {
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Pick voice and apply parameters based on requested language
    const currentVoices = window.speechSynthesis.getVoices();
    
    if (lang === 'hi') {
      const hiVoice = selectHindiVoice(currentVoices);
      if (hiVoice) {
        utterance.voice = hiVoice;
      }
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
    } else {
      const enVoice = selectFemaleVoice(currentVoices);
      if (enVoice) {
        utterance.voice = enVoice;
      }
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
    }
    
    utterance.volume = 1.0;

    utterance.onend = () => {
      isSpeakingRef.current = false;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      isSpeakingRef.current = false;
    };

    // Speak
    window.speechSynthesis.speak(utterance);
    utteranceRef.current = utterance;
    isSpeakingRef.current = true;
  }, [text, isActive, lang, voices]);

  return null; // This component doesn't render anything visual
};
