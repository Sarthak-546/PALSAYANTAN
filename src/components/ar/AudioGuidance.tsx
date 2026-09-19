import { useEffect, useRef } from 'react';

interface AudioGuidanceProps {
  text: string | null;
  isActive: boolean;
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const AudioGuidance = ({
  text,
  isActive,
  voice,
  rate = 1.0,
  pitch = 1.0,
  volume = 1.0
}: AudioGuidanceProps) => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
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
    utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

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
  }, [text, isActive, voice, rate, pitch, volume]);

  return null; // This component doesn't render anything visual
};