import { useEffect, useRef, useState } from 'react';

interface AudioGuidanceProps {
  text: string | null;
  isActive: boolean;
  lang?: 'en' | 'hi';
}

const getSelectedVoice = (voices: SpeechSynthesisVoice[], targetLang: 'en' | 'hi') => {
  if (targetLang === 'hi') {
    // Prioritize Hindi voices
    const hindiVoice = voices.find(v => 
      v.lang === 'hi-IN' || 
      v.lang.startsWith('hi') || 
      v.name.toLowerCase().includes('hindi') ||
      v.name.toLowerCase().includes('lekha')
    );
    if (hindiVoice) return hindiVoice;
  }
  // English priority: Clear natural female voice
  const priorityEn = ['Google UK English Female', 'Google US English', 'Samantha', 'Karen', 'Microsoft Zira'];
  for (const name of priorityEn) {
    const found = voices.find(v => v.name.includes(name));
    if (found) return found;
  }
  return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
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
    const selectedVoice = getSelectedVoice(currentVoices, lang);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
      utterance.rate = 0.88;
      utterance.pitch = 1.0;
    } else {
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
