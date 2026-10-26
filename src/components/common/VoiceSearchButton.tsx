import React, { useState } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  onTranscript,
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startListening = () => {
    setErrorMessage(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('La búsqueda por voz no es compatible con este navegador.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          onTranscript(text.trim());
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Permiso de micrófono denegado. Puedes usar la búsqueda por texto.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No se detectó voz. Intenta presionar y hablar nuevamente.');
        } else {
          setErrorMessage('No fue posible capturar la voz. Usa la búsqueda por texto.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setErrorMessage('Error al iniciar micrófono. Puedes usar el teclado.');
    }
  };

  return (
    <div className="relative inline-flex flex-col items-start">
      <button
        type="button"
        onClick={startListening}
        aria-label={isListening ? 'Escuchando tu voz...' : 'Buscar producto por voz'}
        className={`inline-flex items-center justify-center gap-2 min-h-[48px] px-4 py-2.5 rounded-xl font-medium text-base border-2 transition-all cursor-pointer focus:outline-none focus:ring-4 ${
          isListening
            ? 'bg-rose-50 border-rose-500 text-rose-700 animate-pulse focus:ring-rose-200'
            : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 focus:ring-sky-200'
        } ${className}`}
      >
        {isListening ? (
          <>
            <MicOff className="w-5 h-5 text-rose-600" />
            <span>Escuchando...</span>
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 text-sky-600" />
            <span>Buscar por voz</span>
          </>
        )}
      </button>

      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-lg flex items-center gap-1.5 max-w-xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-rose-800 font-bold hover:underline px-1 cursor-pointer"
            aria-label="Cerrar aviso de voz"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
