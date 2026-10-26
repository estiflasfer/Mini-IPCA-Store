import React, { useState } from 'react';
import { Activity, ScreenId, StudentProfile } from '../../types';
import { formatCents } from '../../services/api';
import { AudioButton } from '../common/AudioButton';
import { FrasesUtilesModal } from '../common/FrasesUtilesModal';
import {
  Coins,
  Lightbulb,
  BookOpen,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Banknote,
  MessageSquare,
} from 'lucide-react';

interface S06ChangeCalculationProps {
  activity: Activity;
  totalCents: number;
  paymentCents: number;
  profile?: StudentProfile | null;
  onSuccessChange: (changeAnsweredCents: number) => void;
  onNavigate: (screen: ScreenId) => void;
  onBackToTotal: () => void;
}

export const S06ChangeCalculation: React.FC<S06ChangeCalculationProps> = ({
  activity,
  totalCents,
  paymentCents,
  profile,
  onSuccessChange,
  onNavigate,
  onBackToTotal,
}) => {
  // Dynamically calculate expected change in integer cents
  const expectedChangeCents = Math.max(0, paymentCents - totalCents);

  // Generate dynamic answer options
  const choiceCount = profile?.choiceCount === 2 ? 2 : 4;
  const generateChoices = (): number[] => {
    const correct = expectedChangeCents;
    if (choiceCount === 2) {
      const wrong = Math.max(10, correct - 50);
      return [correct, wrong].sort((a, b) => a - b);
    }
    const distractors = [
      Math.max(10, correct - 50),
      correct + 35,
      correct + 80,
    ];
    const set = Array.from(new Set([correct, ...distractors]));
    return set.sort((a, b) => a - b);
  };

  const [choices] = useState<number[]>(generateChoices);
  const [selectedChangeCents, setSelectedChangeCents] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [showFrases, setShowFrases] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  const handleCheckChange = () => {
    if (selectedChangeCents === null) return;

    if (selectedChangeCents === expectedChangeCents) {
      setErrorFeedback(null);
      onSuccessChange(selectedChangeCents);
    } else {
      setErrorFeedback(
        `Ese no es el cambio correcto. Marcaste ${formatCents(
          selectedChangeCents
        )}. Recuerda restar el total de la venta (${formatCents(
          totalCents
        )}) del dinero recibido (${formatCents(paymentCents)}).`
      );
    }
  };

  const dynamicHint =
    'Resta el total de la venta al dinero entregado por el cliente.';

  const dynamicExample = `${formatCents(paymentCents)} − ${formatCents(
    totalCents
  )} = ${formatCents(expectedChangeCents)}.`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBackToTotal}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-2 cursor-pointer min-h-[44px] px-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al cálculo del total</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Paso 3 de 3: Entrega del cambio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Cálculo del cambio
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFrases(true)}
            className="min-h-[48px] px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 font-bold text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-sky-700" />
            <span>Frases útiles</span>
          </button>
          <AudioButton
            textToSpeak={`El cliente paga con ${formatCents(
              paymentCents
            )}. El total de la venta es ${formatCents(
              totalCents
            )}. ¿Cuánto cambio debes entregar?`}
            label="Escuchar detalle"
          />
        </div>
      </div>

      {/* Sale Summary Banner: Total vs Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
            <Coins className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
              Total de la venta
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {formatCents(totalCents)}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Banknote className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
              Pago del cliente
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
              {formatCents(paymentCents)}
            </span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-emerald-50/70 rounded-3xl p-6 sm:p-8 border-3 border-emerald-300 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-3 py-1 rounded-full">
            Pregunta al dependiente
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            El cliente paga con {formatCents(paymentCents)}. ¿Cuánto cambio debes entregar?
          </h2>
          <p className="text-base text-slate-600">
            Resta el valor de la venta del dinero entregado por el cliente y selecciona el vuelto.
          </p>
        </div>

        {/* Choice buttons (dynamic according to current prices!) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {choices.map((cents) => {
            const isSelected = selectedChangeCents === cents;
            return (
              <button
                key={cents}
                type="button"
                onClick={() => {
                  setSelectedChangeCents(cents);
                  setErrorFeedback(null);
                }}
                className={`min-h-[64px] sm:min-h-[72px] p-4 rounded-2xl font-black text-2xl font-mono border-3 transition-all flex flex-col items-center justify-center cursor-pointer focus:outline-none focus:ring-4 ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-700 text-white shadow-lg scale-102 focus:ring-emerald-300'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 hover:border-emerald-400 focus:ring-emerald-200 shadow-xs'
                }`}
                aria-pressed={isSelected}
                aria-label={`Opción de cambio: ${formatCents(cents)}`}
              >
                <span>{formatCents(cents)}</span>
                {isSelected && (
                  <span className="text-xs font-bold uppercase tracking-wider mt-1 text-emerald-100">
                    Seleccionado
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Supports row */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className={`min-h-[48px] px-4 py-2 rounded-xl border-2 font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors ${
              showHint
                ? 'bg-amber-100 border-amber-400 text-amber-900'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <span>{showHint ? 'Ocultar pista' : 'Pista'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExample(!showExample)}
            className={`min-h-[48px] px-4 py-2 rounded-xl border-2 font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors ${
              showExample
                ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>{showExample ? 'Ocultar ejemplo' : 'Ejemplo'}</span>
          </button>

          <AudioButton
            textToSpeak={`Pista: ${dynamicHint}. Ejemplo: ${dynamicExample}`}
            label="Escuchar apoyos"
          />
        </div>

        {/* Dynamic Hint box */}
        {showHint && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-base block mb-0.5">Pista para el cambio:</span>
              <p className="text-base text-amber-900">{dynamicHint}</p>
            </div>
          </div>
        )}

        {/* Dynamic Example box */}
        {showExample && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex items-start gap-3">
            <BookOpen className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-base block mb-0.5">Ejemplo guiado:</span>
              <p className="text-base text-emerald-900">{dynamicExample}</p>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {errorFeedback && (
          <div
            role="alert"
            aria-live="polite"
            className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start gap-3"
          >
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-base block">Revisa este paso</span>
              <p className="text-base text-rose-800 mt-1">{errorFeedback}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowHint(true);
                setShowExample(true);
              }}
              className="text-xs font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg border border-rose-300 cursor-pointer"
            >
              Ver ayudas
            </button>
          </div>
        )}

        {/* Primary CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleCheckChange}
            disabled={selectedChangeCents === null}
            className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg sm:text-xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all cursor-pointer"
          >
            <CheckCircle className="w-6 h-6" />
            <span>Comprobar cambio</span>
            <ArrowRight className="w-6 h-6 ml-auto" />
          </button>
        </div>
      </div>

      <FrasesUtilesModal isOpen={showFrases} onClose={() => setShowFrases(false)} />
    </div>
  );
};
