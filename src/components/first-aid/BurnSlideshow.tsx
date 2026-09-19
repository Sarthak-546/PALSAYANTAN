import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { AudioGuidance } from '../ar/AudioGuidance';
import { useEmergencySession } from '../../contexts/EmergencySessionContext';

interface BurnSlideshowProps {
  isCompact?: boolean;
}

const slides = [
  {
    src: '/images/burns/2.png',
    step: 'Step 1: Cool Immediately',
    summary: 'Run cool (not freezing) tap water over burn for 10–20 minutes. Never use ice, butter, or toothpaste.',
    speechText: 'Cool the burn under cool running tap water for ten to twenty minutes. Never apply ice.'
  },
  {
    src: '/images/burns/1.png',
    step: 'Step 2: Remove Jewelry & Tight Items',
    summary: 'Gently remove rings, watches, and tight clothing before tissue swells. Do not peel off melted fabric stuck to skin.',
    speechText: 'Carefully remove rings, watches, and constrictive items before swelling begins.'
  },
  {
    src: '/images/burns/3.png',
    step: 'Step 3: Cover & Protect',
    summary: 'Apply clear plastic cling wrap loosely or use a sterile non-adherent pad. Do not pop blisters.',
    speechText: 'Cover loosely with clean plastic wrap or sterile non-adherent dressing. Do not break blisters.'
  },
  {
    src: '/images/burns/4.png',
    step: 'Step 4: Emergency Triage',
    summary: 'Call 112 / 108 immediately if the burn is blistering, charred white/black, on face/hands, or larger than palm size.',
    speechText: 'Call 112 or 108 if burn is blistering, charred, or covers a large area.'
  }
];

export const BurnSlideshow = ({ isCompact = false }: BurnSlideshowProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { voiceGuidance } = useEmergencySession();
  const slide = slides[currentSlide];

  const [speechTrigger, setSpeechTrigger] = useState(0);
  
  useEffect(() => {
    setSpeechTrigger(prev => prev + 1);
  }, [currentSlide]);

  const handleNext = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex flex-col relative w-full">
      <AudioGuidance key={speechTrigger} text={slide.speechText} isActive={voiceGuidance} />

      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950 flex items-center justify-center overflow-hidden p-2">
        <span className="absolute top-3 left-3 z-20 px-2.5 py-1 text-xs font-mono font-bold bg-slate-950/80 backdrop-blur-md text-amber-400 border border-white/10 rounded-full">
          {currentSlide + 1} / {slides.length}
        </span>
        
        <img 
          src={slide.src} 
          alt={slide.step} 
          className="w-full h-full object-contain rounded-xl select-none pointer-events-none"
        />

        {currentSlide > 0 && (
          <button 
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white border border-white/15 backdrop-blur-md transition-all active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {currentSlide < slides.length - 1 && (
          <button 
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white border border-white/15 backdrop-blur-md transition-all active:scale-90"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-4 bg-slate-900/95 border-t border-slate-800/80 flex flex-col gap-2 z-30">
        <h3 className="text-sm sm:text-base font-bold text-white">
          {slide.step}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed min-h-[3rem]">
          {slide.summary}
        </p>

        <div className="flex justify-center items-center gap-1.5 mt-2">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`${
                idx === currentSlide 
                  ? 'w-8 h-1.5 bg-amber-500' 
                  : 'w-2 h-1.5 bg-slate-700'
              } rounded-full transition-all duration-300`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
