import React from 'react';
import { ScreenId } from '../../types';
import { formatCents } from '../../services/api';
import { CheckCircle2, RotateCcw, Home, Award, ArrowRight } from 'lucide-react';
import { AudioButton } from '../common/AudioButton';

interface S07FeedbackClosureProps {
  totalCents: number;
  paymentCents: number;
  changeCents: number;
  completedCount: number;
  totalGoal: number;
  onPracticeAgain: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const S07FeedbackClosure: React.FC<S07FeedbackClosureProps> = ({
  totalCents,
  paymentCents,
  changeCents,
  completedCount,
  totalGoal = 5,
  onPracticeAgain,
  onNavigate,
}) => {
  const successMessage =
    'Has atendido al cliente, calculado el total y entregado el cambio correctamente.';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-lg text-center space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        {/* Headings */}
        <div className="space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            ¡Muy bien!
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Venta completada
          </h1>
          <p className="text-lg text-slate-700 max-w-md mx-auto pt-1 leading-relaxed">
            {successMessage}
          </p>
        </div>

        <div className="flex justify-center">
          <AudioButton
            textToSpeak={`¡Muy bien! Venta completada. ${successMessage} Total: ${formatCents(
              totalCents
            )}. Pago: ${formatCents(paymentCents)}. Cambio entregado: ${formatCents(changeCents)}.`}
            label="Escuchar resumen de la venta"
            variant="secondary"
          />
        </div>

        {/* Dynamic Financial Summary */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="p-2 sm:p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
              Total venta
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
              {formatCents(totalCents)}
            </span>
          </div>

          <div className="p-2 sm:p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
              Pago recibido
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-700 font-mono">
              {formatCents(paymentCents)}
            </span>
          </div>

          <div className="p-2 sm:p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
              Cambio entregado
            </span>
            <span className="text-lg sm:text-xl font-black text-sky-700 font-mono">
              {formatCents(changeCents)}
            </span>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="bg-sky-50/70 p-5 rounded-2xl border border-sky-200 text-left space-y-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-sky-700" />
              <span className="text-sm font-bold text-sky-950">
                Meta sugerida de práctica: 5 ventas
              </span>
            </div>
            <span className="text-base font-black text-sky-950 font-mono">
              {completedCount} {completedCount === 1 ? 'venta' : 'ventas'}
            </span>
          </div>

          <div
            className="w-full bg-sky-200 rounded-full h-3 overflow-hidden"
            role="progressbar"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={totalGoal}
          >
            <div
              className="bg-sky-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (completedCount / totalGoal) * 100)}%` }}
            />
          </div>

          {completedCount >= 5 && (
            <div className="p-2.5 bg-emerald-100/80 border border-emerald-300 rounded-xl text-emerald-900 text-xs sm:text-sm font-bold text-center">
              ¡Meta de práctica alcanzada! Puedes seguir practicando o finalizar.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onPracticeAgain}
            className="flex-1 min-h-[52px] px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Practicar otra venta</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('S01')}
            className="min-h-[52px] px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 font-bold text-base flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all cursor-pointer"
          >
            <Home className="w-5 h-5 text-slate-600" />
            <span>Volver al inicio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
