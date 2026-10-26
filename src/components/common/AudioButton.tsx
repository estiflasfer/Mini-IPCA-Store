import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioButtonProps {
  textToSpeak: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'compact';
  className?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  textToSpeak,
  label = 'Escuchar',
  variant = 'secondary',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!('speechSynthesis' in window)) {
      alert('La síntesis de voz no está disponible en este navegador.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9; // Calm, clear tempo for vocational training

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleSpeak}
        aria-label={`${label}: ${textToSpeak}`}
        title={label}
        className={`inline-flex items-center justify-center min-w-[48px] min-h-[48px] p-2.5 rounded-xl border border-sky-300 text-sky-800 bg-sky-50 hover:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-colors cursor-pointer ${className}`}
      >
        {isPlaying ? <VolumeX className="w-6 h-6 text-rose-600 animate-pulse" /> : <Volume2 className="w-6 h-6" />}
      </button>
    );
  }

  const baseStyles =
    'inline-flex items-center justify-center gap-2 min-h-[48px] px-4 py-2.5 rounded-xl font-medium text-base transition-colors focus:outline-none focus:ring-4 cursor-pointer';
  const variantStyles =
    variant === 'primary'
      ? 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-300 shadow-sm'
      : 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 focus:ring-sky-200';

  return (
    <button
      type="button"
      onClick={handleSpeak}
      aria-label={`${label}: ${textToSpeak}`}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-6 h-6 text-rose-500 animate-pulse" />
          <span>Detener audio</span>
        </>
      ) : (
        <>
          <Volume2 className="w-6 h-6 text-sky-600" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
