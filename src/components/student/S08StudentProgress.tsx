import React from 'react';
import { ScreenId, HistoricalResult } from '../../types';
import { formatCents } from '../../services/api';
import { Award, CheckCircle, ArrowLeft, TrendingUp, Calendar, ShoppingBag } from 'lucide-react';
import { AudioButton } from '../common/AudioButton';

interface S08StudentProgressProps {
  results: HistoricalResult[];
  onNavigate: (screen: ScreenId) => void;
}

export const S08StudentProgress: React.FC<S08StudentProgressProps> = ({
  results,
  onNavigate,
}) => {
  const completedCount = results.length;
  const correctCount = results.filter((r) => r.correct).length;
  const totalGoal = 5;

  const encouragementMessage =
    '¡Gran esfuerzo en el puesto de caja! Cada venta practicada fortalece tu autonomía y te prepara para trabajar como dependiente en la tienda del IPCA.';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('S01')}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-2 cursor-pointer min-h-[44px] px-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Mi progreso personal
          </h1>
          <p className="text-base text-slate-600">
            Registro de tus prácticas laborales como vendedor/dependiente
          </p>
        </div>

        <AudioButton
          textToSpeak={`Mi progreso personal. Has completado ${completedCount} ventas de entrenamiento. ${encouragementMessage}`}
          label="Escuchar progreso"
        />
      </div>

      {/* Encouragement Banner */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-3xl border-2 border-sky-200 shadow-xs flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-sky-950 mb-1">
            Meta de autonomía laboral
          </h2>
          <p className="text-base text-slate-700 leading-relaxed">
            {encouragementMessage}
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 text-center">
          <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
            Ventas completadas
          </span>
          <span className="text-3xl font-black text-sky-700 font-mono">
            {completedCount}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 text-center">
          <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
            Módulo actual
          </span>
          <span className="text-xl font-bold text-slate-900 block mt-1">
            Venta y caja
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 text-center">
          <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
            Aciertos en cálculo
          </span>
          <span className="text-3xl font-black text-emerald-700 font-mono">
            {correctCount}
          </span>
        </div>
      </div>

      {/* Recent History Table */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-600" />
          <span>Últimas ventas atendidas</span>
        </h2>

        {results.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Aún no has registrado ventas. ¡Inicia una venta para comenzar tu registro!
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">
                      Venta {r.activityId}
                    </span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Completada
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Productos:{' '}
                    {r.lineItemsSnapshot.map((item) => `${item.quantity} ${item.productName}`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm font-mono font-bold text-slate-700">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-sans">Total</span>
                    <span>{formatCents(r.totalExpectedCents)}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-sans">Cambio</span>
                    <span className="text-sky-700">{formatCents(r.changeExpectedCents)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate('S04')}
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Practicar nueva venta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
