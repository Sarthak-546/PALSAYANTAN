import React, { useEffect, useRef, useState } from 'react';

interface AudioGuidanceProps {
  className?: string;
}

export const AudioGuidance = ({ className = '' }: AudioGuidanceProps) => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!speechSynthesisSupported) return;

    utteranceRef.current = new SpeechSynthesisUtterance();
    utteranceRef.current.rate = 0.9;
    utteranceRef.current.volume = 0.8;
    utteranceRef.current.pitch = 1;

    utteranceRef.current.onstart = () => setIsSpeaking(true);
    utteranceRef.current.onend = () => setIsSpeaking(false);
    utteranceRef.current.onerror = () => setIsSpeaking(false);

    return () => {
      if (speechSynthesisSupported) {
        window.speechSynthesis.cancel();
      }
      utteranceRef.current = null;
    };
  }, [speechSynthesisSupported]);

  return (
    <div className={className}>
      {isSpeaking && <span className="sr-only">Voice guidance active</span>}
    </div>
  );
};

export default AudioGuidance;